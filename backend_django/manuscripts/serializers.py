"""Manuscript serializers."""
from rest_framework import serializers
from .models import Manuscript, ManuscriptVersion


class ManuscriptVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManuscriptVersion
        fields = ['id', 'version_number', 'change_note', 'word_count', 'chapter_count', 'upload_timestamp']


class ManuscriptSerializer(serializers.ModelSerializer):
    versions = ManuscriptVersionSerializer(many=True, read_only=True)

    class Meta:
        model = Manuscript
        fields = [
            'id', 'title', 'original_filename', 'file_format', 'file_size',
            'source', 'word_count', 'chapter_count', 'chapter_outline',
            'preflight_status', 'preflight_report', 'versions', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'preflight_status', 'preflight_report']


class ManuscriptUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    title_id = serializers.UUIDField()
    change_note = serializers.CharField(required=False, default='')


class RefineryImportSerializer(serializers.Serializer):
    refinery_project_id = serializers.UUIDField()
    title_id = serializers.UUIDField(required=False)
