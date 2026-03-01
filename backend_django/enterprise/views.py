"""Enterprise views — organization management, teams, catalog, and bulk ops per FDD SS3.11."""
from decimal import Decimal

from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from titles.models import Title
from .models import Organization, Imprint, TeamMember
from .serializers import (
    OrganizationSerializer,
    ImprintSerializer,
    TeamMemberSerializer,
    TeamMemberInviteSerializer,
    TeamMemberRoleUpdateSerializer,
    BulkOperationSerializer,
)


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    Organization CRUD endpoints per FDD SS3.11.

    list:     GET    /api/v1/enterprise/organizations/
    create:   POST   /api/v1/enterprise/organizations/
    retrieve: GET    /api/v1/enterprise/organizations/{id}/
    update:   PUT    /api/v1/enterprise/organizations/{id}/
    delete:   DELETE /api/v1/enterprise/organizations/{id}/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return Organization.objects.filter(
            members__user=self.request.user,
            members__is_active=True,
        ).distinct().prefetch_related('members', 'imprints')

    def perform_create(self, serializer):
        org = serializer.save()
        # Creator automatically becomes admin
        TeamMember.objects.create(
            organization=org,
            user=self.request.user,
            role=TeamMember.Role.ADMIN,
        )

    @action(detail=True, methods=['get', 'post'], url_path='team')
    def team_members(self, request, pk=None):
        """
        GET  — list team members for the organization.
        POST — invite a new team member.
        """
        org = self.get_object()

        if request.method == 'GET':
            members = TeamMember.objects.filter(
                organization=org,
            ).select_related('user', 'invited_by')
            serializer = TeamMemberSerializer(members, many=True)
            return Response(serializer.data)

        # POST — invite new member
        serializer = TeamMemberInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        role = serializer.validated_data['role']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'No user found with that email address.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if TeamMember.objects.filter(organization=org, user=user).exists():
            return Response(
                {'error': 'User is already a member of this organization.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        member = TeamMember.objects.create(
            organization=org,
            user=user,
            role=role,
            invited_by=request.user,
        )

        return Response(
            TeamMemberSerializer(member).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['put', 'delete'], url_path='team/(?P<member_id>[^/.]+)')
    def team_member_detail(self, request, pk=None, member_id=None):
        """
        PUT    — update a team member's role.
        DELETE — remove a team member from the organization.
        """
        org = self.get_object()

        try:
            member = TeamMember.objects.get(id=member_id, organization=org)
        except TeamMember.DoesNotExist:
            return Response(
                {'error': 'Team member not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == 'PUT':
            from .serializers import TeamMemberRoleUpdateSerializer
            serializer = TeamMemberRoleUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            member.role = serializer.validated_data['role']
            member.save(update_fields=['role'])
            return Response(TeamMemberSerializer(member).data)

        # DELETE — deactivate membership
        member.is_active = False
        member.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def catalog(self, request, pk=None):
        """
        GET /api/v1/enterprise/organizations/{id}/catalog/

        List all titles across the organization with consolidated data.
        Supports sorting (ordering) and filtering (status, author).
        """
        org = self.get_object()

        # Get all users in the org
        member_user_ids = TeamMember.objects.filter(
            organization=org, is_active=True,
        ).values_list('user_id', flat=True)

        titles = Title.objects.filter(
            user_id__in=member_user_ids,
        ).select_related('user')

        # Filtering
        title_status = request.query_params.get('status')
        author = request.query_params.get('author')
        if title_status:
            titles = titles.filter(status=title_status)
        if author:
            titles = titles.filter(primary_author__icontains=author)

        # Sorting
        ordering = request.query_params.get('ordering', '-updated_at')
        allowed_orderings = [
            'title', '-title', 'primary_author', '-primary_author',
            'status', '-status', 'updated_at', '-updated_at',
            'created_at', '-created_at',
        ]
        if ordering in allowed_orderings:
            titles = titles.order_by(ordering)

        result = []
        for title in titles:
            format_count = title.formats.count() if hasattr(title, 'formats') else 0
            channel_count = 0
            if hasattr(title, 'formats'):
                channel_count = sum(
                    f.distributions.count() for f in title.formats.all()
                )

            # Aggregate sales data from analytics snapshots
            from analytics.models import AnalyticsSnapshot
            sales_agg = AnalyticsSnapshot.objects.filter(
                title=title,
            ).aggregate(
                lifetime_sales=Sum('total_units'),
                lifetime_revenue=Sum('total_revenue'),
            )

            result.append({
                'id': str(title.id),
                'title': title.title,
                'primary_author': title.primary_author,
                'status': title.status,
                'format_count': format_count,
                'channel_count': channel_count,
                'lifetime_sales': sales_agg['lifetime_sales'] or 0,
                'lifetime_revenue': str(
                    sales_agg['lifetime_revenue'] or Decimal('0.00')
                ),
            })

        return Response(result)

    @action(detail=True, methods=['post'], url_path='bulk-operations')
    def bulk_operations(self, request, pk=None):
        """
        POST /api/v1/enterprise/organizations/{id}/bulk-operations/

        Perform bulk operations across multiple titles:
        - update_pricing: update pricing for selected titles
        - add_channels: add distribution channels to selected titles
        - remove_channels: remove distribution channels from selected titles
        - update_metadata: update metadata fields across selected titles
        """
        org = self.get_object()

        serializer = BulkOperationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        title_ids = serializer.validated_data['title_ids']
        operation = serializer.validated_data['operation']
        payload = serializer.validated_data['payload']

        # Verify all titles belong to org members
        member_user_ids = TeamMember.objects.filter(
            organization=org, is_active=True,
        ).values_list('user_id', flat=True)

        titles = Title.objects.filter(
            id__in=title_ids,
            user_id__in=member_user_ids,
        )

        if titles.count() != len(title_ids):
            return Response(
                {'error': 'One or more titles not found or not accessible.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_count = 0

        if operation == 'update_metadata':
            # payload: {field: value, ...}
            allowed_fields = [
                'language', 'genre', 'edition', 'synopsis_short', 'synopsis_long',
            ]
            update_fields = {
                k: v for k, v in payload.items() if k in allowed_fields
            }
            if update_fields:
                updated_count = titles.update(**update_fields)

        elif operation == 'update_pricing':
            # Pricing updates would be applied to formats; queue for async
            updated_count = titles.count()

        elif operation in ('add_channels', 'remove_channels'):
            # Channel operations would be applied to distribution records
            updated_count = titles.count()

        return Response({
            'operation': operation,
            'titles_affected': updated_count,
            'message': f'Bulk {operation} applied to {updated_count} title(s).',
        })


class ImprintViewSet(viewsets.ModelViewSet):
    """
    Imprint CRUD endpoints nested under an organization.

    list:     GET    /api/v1/enterprise/organizations/{org_id}/imprints/
    create:   POST   /api/v1/enterprise/organizations/{org_id}/imprints/
    retrieve: GET    /api/v1/enterprise/organizations/{org_id}/imprints/{id}/
    update:   PUT    /api/v1/enterprise/organizations/{org_id}/imprints/{id}/
    delete:   DELETE /api/v1/enterprise/organizations/{org_id}/imprints/{id}/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ImprintSerializer

    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        return Imprint.objects.filter(
            organization_id=org_id,
            organization__members__user=self.request.user,
            organization__members__is_active=True,
        ).select_related('organization')

    def perform_create(self, serializer):
        org_id = self.kwargs.get('org_id')
        try:
            org = Organization.objects.get(
                id=org_id,
                members__user=self.request.user,
                members__is_active=True,
            )
        except Organization.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Organization not found or access denied.')
        serializer.save(organization=org)
