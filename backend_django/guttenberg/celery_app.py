"""
Celery application configuration for Guttenberg.

This module configures the Celery distributed task queue used for all
agentic AI components including:
- Manuscript preflight validation
- Format conversion jobs (EPUB, PDF, MOBI)
- Distribution channel submissions
- AI-powered synopsis generation
- Royalty aggregation
- Cover validation and barcode injection
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'guttenberg.settings.development')

app = Celery('guttenberg')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Task routing: different queues for different workload types
app.conf.task_routes = {
    'celery_workers.manuscript_tasks.*': {'queue': 'manuscripts'},
    'celery_workers.format_tasks.*': {'queue': 'formatting'},
    'celery_workers.distribution_tasks.*': {'queue': 'distribution'},
    'celery_workers.ai_tasks.*': {'queue': 'ai'},
    'celery_workers.finance_tasks.*': {'queue': 'finance'},
    'celery_workers.cover_tasks.*': {'queue': 'covers'},
}

# Priority configuration
app.conf.task_default_priority = 5
app.conf.worker_prefetch_multiplier = 1  # Fair scheduling for long-running AI tasks
app.conf.task_acks_late = True  # Ensure tasks aren't lost on worker crash
