"""Development settings for Guttenberg."""
from .base import *  # noqa: F401, F403

DEBUG = True
ALLOWED_HOSTS = ['*']

# Use SQLite for development if PostgreSQL not available
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Disable throttling in dev
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []  # noqa: F405

# Local file storage instead of S3
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
