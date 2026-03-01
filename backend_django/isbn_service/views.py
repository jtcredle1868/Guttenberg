"""
ISBN service views — purchase, validation, and assignment endpoints.
FDD §3.3
"""
import logging
from decimal import Decimal
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from formats.models import Format
from .models import ISBNRecord
from .serializers import (
    ISBNRecordSerializer,
    ISBNPurchaseSerializer,
    ISBNValidateSerializer,
    ISBNAssignSerializer,
)

logger = logging.getLogger('guttenberg')

# ISBN purchase pricing tiers per FDD §3.3.1
ISBN_PRICING = {
    1: Decimal('15.00'),
    10: Decimal('75.00'),
    100: Decimal('250.00'),
}


def validate_isbn13_check_digit(isbn_str):
    """
    Validate an ISBN-13 check digit using the real algorithm.

    Multiply alternating digits by 1 and 3, sum them, then verify
    check digit = (10 - sum % 10) % 10.
    """
    if len(isbn_str) != 13 or not isbn_str.isdigit():
        return False

    total = 0
    for i, ch in enumerate(isbn_str[:12]):
        weight = 1 if i % 2 == 0 else 3
        total += int(ch) * weight

    expected_check = (10 - total % 10) % 10
    return int(isbn_str[12]) == expected_check


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase(request):
    """
    Purchase ISBNs through the platform per FDD §3.3.1.

    Pricing:
      - Single:   $15
      - 10-Pack:  $75
      - 100-Pack: $250

    Accepts a Stripe token, validates, processes payment (mock),
    and assigns the first ISBN to the specified format.
    """
    serializer = ISBNPurchaseSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    format_id = serializer.validated_data['format_id']
    quantity = serializer.validated_data['quantity']
    stripe_token = serializer.validated_data['stripe_token']

    # Verify the format belongs to the requesting user
    try:
        fmt = Format.objects.get(id=format_id, title__user=request.user)
    except Format.DoesNotExist:
        return Response(
            {'error': {'code': 'GUT-4004', 'message': 'Format not found or access denied.'}},
            status=status.HTTP_404_NOT_FOUND,
        )

    price = ISBN_PRICING.get(quantity)
    if price is None:
        return Response(
            {'error': {'code': 'GUT-4001', 'message': 'Invalid quantity. Choose 1, 10, or 100.'}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --- Mock Stripe payment processing ---
    # In production this would call stripe.Charge.create() with the token.
    logger.info(
        'Mock Stripe charge: user=%s amount=%s token=%s',
        request.user.id, price, stripe_token,
    )
    mock_charge_id = f'ch_mock_{timezone.now().strftime("%Y%m%d%H%M%S")}'
    # --- End mock ---

    # Generate placeholder ISBNs (in production, drawn from a Bowker pool)
    created_records = []
    now = timezone.now()
    for i in range(quantity):
        # Generate a deterministic placeholder ISBN-13 for the mock
        base = f'97800000{i:04d}'
        # Calculate valid check digit
        total = 0
        for idx, ch in enumerate(base[:12]):
            weight = 1 if idx % 2 == 0 else 3
            total += int(ch) * weight
        check = (10 - total % 10) % 10
        isbn_value = base + str(check)

        record = ISBNRecord.objects.create(
            format=fmt,
            isbn=isbn_value,
            isbn_source=ISBNRecord.ISBNSource.PLATFORM_PURCHASED,
            purchase_price=price / quantity,
            purchased_at=now,
            bowker_registered=False,
            registration_status='pending_registration',
        )
        created_records.append(record)

    # Assign the first ISBN to the format if it doesn't already have one
    if not fmt.isbn and created_records:
        fmt.isbn = created_records[0].isbn
        fmt.isbn_source = Format.ISBNSource.PLATFORM_PURCHASED
        fmt.save()

    return Response({
        'charge_id': mock_charge_id,
        'quantity': quantity,
        'total_price': str(price),
        'isbn_records': ISBNRecordSerializer(created_records, many=True).data,
        'assigned_to_format': str(fmt.id) if not fmt.isbn or fmt.isbn == created_records[0].isbn else None,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate(request):
    """
    Validate an ISBN-13 check digit per FDD §3.3.2.

    Uses the standard ISBN-13 algorithm: alternating weights of 1 and 3,
    check digit = (10 - sum % 10) % 10.
    """
    serializer = ISBNValidateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    isbn = serializer.validated_data['isbn']

    # Basic format checks
    if len(isbn) != 13:
        return Response({
            'isbn': isbn,
            'valid': False,
            'error': 'ISBN-13 must be exactly 13 characters.',
        })

    if not isbn.isdigit():
        return Response({
            'isbn': isbn,
            'valid': False,
            'error': 'ISBN-13 must contain only digits.',
        })

    # Prefix check (must start with 978 or 979)
    if not isbn.startswith(('978', '979')):
        return Response({
            'isbn': isbn,
            'valid': False,
            'error': 'ISBN-13 must start with 978 or 979.',
        })

    # Check digit validation
    is_valid = validate_isbn13_check_digit(isbn)

    return Response({
        'isbn': isbn,
        'valid': is_valid,
        'error': None if is_valid else 'Check digit validation failed.',
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign(request):
    """
    Assign an author-supplied ISBN to a format per FDD §3.3.3.

    Validates the ISBN-13 check digit before assignment.
    """
    serializer = ISBNAssignSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    format_id = serializer.validated_data['format_id']
    isbn = serializer.validated_data['isbn']

    # Verify the format belongs to the requesting user
    try:
        fmt = Format.objects.get(id=format_id, title__user=request.user)
    except Format.DoesNotExist:
        return Response(
            {'error': {'code': 'GUT-4004', 'message': 'Format not found or access denied.'}},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Validate ISBN-13
    if not validate_isbn13_check_digit(isbn):
        return Response(
            {'error': {'code': 'GUT-4002', 'message': 'Invalid ISBN-13 check digit.'}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check for duplicate ISBN across the platform
    if ISBNRecord.objects.filter(isbn=isbn).exists():
        return Response(
            {'error': {'code': 'GUT-4003', 'message': 'This ISBN is already registered in the platform.'}},
            status=status.HTTP_409_CONFLICT,
        )

    # Create the ISBN record
    record = ISBNRecord.objects.create(
        format=fmt,
        isbn=isbn,
        isbn_source=ISBNRecord.ISBNSource.AUTHOR_SUPPLIED,
        bowker_registered=False,
        registration_status='author_supplied',
    )

    # Assign to the format
    fmt.isbn = isbn
    fmt.isbn_source = Format.ISBNSource.AUTHOR_SUPPLIED
    fmt.save()

    return Response({
        'message': 'ISBN assigned successfully.',
        'isbn_record': ISBNRecordSerializer(record).data,
        'format_id': str(fmt.id),
    }, status=status.HTTP_201_CREATED)
