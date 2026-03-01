"""
Celery tasks for book formatting / production.

Agentic format engine per FDD §3.4:
- PDF rendering (print-ready)
- EPUB 3.0 generation
- MOBI/KFX conversion
- Template application
"""
import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger('guttenberg.celery.formats')


@shared_task(bind=True, max_retries=2, default_retry_delay=120, time_limit=600)
def run_format_job(self, format_job_id: str):
    """
    Agentic format job execution per FDD §3.4.2.

    Pipeline:
    1. Retrieve manuscript from storage
    2. Convert to normalized HTML intermediate (Pandoc)
    3. Apply interior template CSS
    4. Render to target format (PDF/EPUB/MOBI)
    5. Validate output
    6. Store and notify
    """
    from formats.models import FormatJob

    try:
        job = FormatJob.objects.select_related('format', 'format__title').get(id=format_job_id)
        job.status = 'processing'
        job.started_at = timezone.now()
        job.progress = 5
        job.save()

        title = job.format.title
        logger.info(f"Format job started: {job.id} — {job.job_type} for '{title.title}'")

        # Step 1: Retrieve manuscript (10%)
        job.progress = 10
        job.save()
        # In production: download from S3
        # manuscript_file = download_from_s3(manuscript.file.name)

        # Step 2: Convert to HTML intermediate (30%)
        job.progress = 30
        job.save()
        # In production: subprocess.run(['pandoc', input_file, '-o', 'output.html'])

        # Step 3: Apply template (50%)
        job.progress = 50
        job.save()
        template_config = job.template_config or {}
        logger.info(f"Applying template '{job.template_name}' with config: {template_config}")

        # Step 4: Render target format (75%)
        job.progress = 75
        job.save()

        if job.job_type == 'pdf':
            # In production: WeasyPrint/Paged.js rendering
            logger.info("Rendering print-ready PDF")
        elif job.job_type == 'epub':
            # In production: Calibre EPUB generation
            logger.info("Generating EPUB 3.0")
        elif job.job_type == 'mobi':
            # In production: Calibre MOBI from EPUB
            logger.info("Converting to MOBI/KFX")

        # Step 5: Validate (90%)
        job.progress = 90
        job.save()
        # In production: Ghostscript preflight for PDF, EPUBCheck for EPUB

        # Step 6: Complete
        job.status = 'completed'
        job.progress = 100
        job.completed_at = timezone.now()
        job.save()

        # Update format status
        fmt = job.format
        fmt.status = 'ready'
        fmt.save()

        # Create activity event
        try:
            from ecosystem.models import ActivityEvent
            ActivityEvent.objects.create(
                user=title.user,
                title=title,
                event_type='format_complete',
                message=f'{job.job_type.upper()} formatting complete for "{title.title}"',
                metadata={'job_id': str(job.id), 'job_type': job.job_type, 'template': job.template_name},
            )
        except Exception:
            pass

        logger.info(f"Format job completed: {job.id}")
        return {'status': 'completed', 'job_id': format_job_id}

    except Exception as exc:
        logger.error(f"Format job failed: {exc}")
        try:
            job = FormatJob.objects.get(id=format_job_id)
            job.status = 'failed'
            job.error_message = str(exc)
            job.completed_at = timezone.now()
            job.save()
        except Exception:
            pass
        self.retry(exc=exc)
