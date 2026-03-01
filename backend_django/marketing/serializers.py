"""Marketing serializers."""
from rest_framework import serializers
from .models import LandingPage, ARCCampaign, ARCReviewer, PressKit, SocialAsset


class LandingPageSerializer(serializers.ModelSerializer):
    title_name = serializers.CharField(source='title.title', read_only=True)

    class Meta:
        model = LandingPage
        fields = [
            'id', 'title', 'title_name', 'slug', 'theme',
            'custom_css', 'is_published', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'title', 'created_at', 'updated_at']


class ARCCampaignSerializer(serializers.ModelSerializer):
    title_name = serializers.CharField(source='title.title', read_only=True)

    class Meta:
        model = ARCCampaign
        fields = [
            'id', 'title', 'title_name', 'max_reviewers', 'start_date',
            'end_date', 'status', 'reviewers_count', 'reviews_received',
            'created_at',
        ]
        read_only_fields = ['id', 'reviewers_count', 'reviews_received', 'created_at']

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')
        if start and end and start > end:
            raise serializers.ValidationError(
                'start_date must be before end_date.'
            )
        return data


class ARCCampaignCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARCCampaign
        fields = [
            'title', 'max_reviewers', 'start_date', 'end_date', 'status',
        ]

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError(
                    'start_date must be before end_date.'
                )
        return data


class ARCReviewerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARCReviewer
        fields = [
            'id', 'campaign', 'email', 'name', 'status',
            'review_url', 'invited_at', 'downloaded_at',
        ]
        read_only_fields = ['id', 'campaign', 'status', 'invited_at', 'downloaded_at']


class ARCReviewerCreateSerializer(serializers.Serializer):
    """Serializer for inviting reviewers to an ARC campaign."""
    email = serializers.EmailField()
    name = serializers.CharField(max_length=255)


class PressKitSerializer(serializers.ModelSerializer):
    title_name = serializers.CharField(source='title.title', read_only=True)

    class Meta:
        model = PressKit
        fields = [
            'id', 'title', 'title_name', 'file', 'generated_at',
        ]
        read_only_fields = ['id', 'title', 'file', 'generated_at']


class SocialAssetSerializer(serializers.ModelSerializer):
    title_name = serializers.CharField(source='title.title', read_only=True)

    class Meta:
        model = SocialAsset
        fields = [
            'id', 'title', 'title_name', 'asset_type', 'file',
            'caption', 'created_at',
        ]
        read_only_fields = ['id', 'title', 'file', 'created_at']


class SocialAssetGenerateSerializer(serializers.Serializer):
    """Serializer for requesting social asset generation."""
    asset_type = serializers.ChoiceField(choices=[
        ('instagram_square', 'Instagram Square'),
        ('instagram_story', 'Instagram Story'),
        ('facebook_post', 'Facebook Post'),
        ('facebook_cover', 'Facebook Cover'),
        ('twitter_post', 'Twitter Post'),
        ('twitter_header', 'Twitter Header'),
        ('pinterest_pin', 'Pinterest Pin'),
        ('bookstagram', 'Bookstagram'),
    ])
    caption = serializers.CharField(required=False, default='')


class SynopsisAISerializer(serializers.Serializer):
    """Serializer for AI synopsis generation request."""
    tone = serializers.ChoiceField(
        choices=[
            ('professional', 'Professional'),
            ('casual', 'Casual'),
            ('dramatic', 'Dramatic'),
            ('mysterious', 'Mysterious'),
        ],
        required=False,
        default='professional',
    )
    max_length = serializers.IntegerField(
        required=False, default=400,
        help_text='Maximum character count for the synopsis',
    )
