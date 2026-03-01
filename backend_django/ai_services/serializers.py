"""AI Services serializers."""
from rest_framework import serializers
from .models import AIGenerationRequest


class AIGenerationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIGenerationRequest
        fields = '__all__'
        read_only_fields = ['id', 'user', 'status', 'output_data', 'tokens_used', 'cost_usd', 'created_at', 'completed_at']


class SynopsisRequestSerializer(serializers.Serializer):
    title_id = serializers.UUIDField()
    style = serializers.ChoiceField(choices=['retail', 'press'], default='retail')
    additional_context = serializers.CharField(required=False, default='')


class KeywordRequestSerializer(serializers.Serializer):
    title_id = serializers.UUIDField()


class MetadataEnhanceSerializer(serializers.Serializer):
    title_id = serializers.UUIDField()


class ManuscriptAnalysisSerializer(serializers.Serializer):
    manuscript_id = serializers.UUIDField()
