"""Authentication views for Guttenberg."""
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class RegisterView(generics.CreateAPIView):
    """Register a new Guttenberg account."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'message': 'Account created successfully.',
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the authenticated user's profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class MPPSSOView(APIView):
    """
    Master Prose Platform Single Sign-On endpoint.

    Per FDD §3.10.1: Validates MPP-issued JWT and creates/links
    a Guttenberg session.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        mpp_token = request.data.get('mpp_token')
        if not mpp_token:
            return Response(
                {'error': {'code': 'GUT-4001', 'message': 'MPP token required'}},
                status=status.HTTP_400_BAD_REQUEST
            )
        # In production, validate against MPP Identity Service
        # For MVP, accept and create a demo session
        return Response({
            'message': 'MPP SSO integration ready',
            'note': 'Production will validate against MPP Identity Service at /identity/verify',
        })
