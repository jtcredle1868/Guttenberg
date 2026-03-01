"""
Celery tasks for Claude AI operations.

All AI operations run asynchronously via Celery to prevent blocking API responses.
This is the agentic AI layer that uses Claude for intelligent content generation.
"""
import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger('guttenberg.celery.ai')


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def generate_synopsis_task(self, ai_request_id: str):
    """
    Generate book synopsis using Claude per FDD §3.2.3.

    Produces retail-focused and press-release style descriptions.
    """
    from ai_services.models import AIGenerationRequest
    from ai_services.claude_client import generate_synopsis

    try:
        ai_request = AIGenerationRequest.objects.get(id=ai_request_id)
        ai_request.status = AIGenerationRequest.Status.PROCESSING
        ai_request.save()

        result = generate_synopsis(
            title_data=ai_request.input_data,
            style=ai_request.input_data.get('style', 'retail'),
        )

        ai_request.output_data = result
        ai_request.tokens_used = result.get('tokens_used', 0)
        ai_request.status = AIGenerationRequest.Status.COMPLETED
        ai_request.completed_at = timezone.now()
        ai_request.save()

        # Optionally auto-apply synopsis to title
        if ai_request.title:
            title = ai_request.title
            if not title.synopsis_short and result.get('synopsis_short'):
                title.synopsis_short = result['synopsis_short'][:400]
            if not title.synopsis_long and result.get('synopsis_long'):
                title.synopsis_long = result['synopsis_long'][:4000]
            title.calculate_metadata_completeness()
            title.calculate_readiness_score()
            title.save()

        logger.info(f"Synopsis generated for request {ai_request_id}")
        return {'status': 'completed', 'request_id': ai_request_id}

    except Exception as exc:
        logger.error(f"Synopsis generation failed: {exc}")
        try:
            ai_request = AIGenerationRequest.objects.get(id=ai_request_id)
            ai_request.status = AIGenerationRequest.Status.FAILED
            ai_request.error_message = str(exc)
            ai_request.save()
        except Exception:
            pass
        self.retry(exc=exc)


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def optimize_keywords_task(self, ai_request_id: str):
    """Optimize keywords using Claude per RDD GUT-META-006."""
    from ai_services.models import AIGenerationRequest
    from ai_services.claude_client import optimize_keywords

    try:
        ai_request = AIGenerationRequest.objects.get(id=ai_request_id)
        ai_request.status = AIGenerationRequest.Status.PROCESSING
        ai_request.save()

        result = optimize_keywords(title_data=ai_request.input_data)

        ai_request.output_data = result
        ai_request.tokens_used = result.get('tokens_used', 0)
        ai_request.status = AIGenerationRequest.Status.COMPLETED
        ai_request.completed_at = timezone.now()
        ai_request.save()

        logger.info(f"Keywords optimized for request {ai_request_id}")
        return {'status': 'completed', 'request_id': ai_request_id}

    except Exception as exc:
        logger.error(f"Keyword optimization failed: {exc}")
        try:
            ai_request = AIGenerationRequest.objects.get(id=ai_request_id)
            ai_request.status = AIGenerationRequest.Status.FAILED
            ai_request.error_message = str(exc)
            ai_request.save()
        except Exception:
            pass
        self.retry(exc=exc)


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def enhance_metadata_task(self, ai_request_id: str):
    """Enhance metadata using Claude."""
    from ai_services.models import AIGenerationRequest
    from ai_services.claude_client import enhance_metadata

    try:
        ai_request = AIGenerationRequest.objects.get(id=ai_request_id)
        ai_request.status = AIGenerationRequest.Status.PROCESSING
        ai_request.save()

        result = enhance_metadata(title_data=ai_request.input_data)

        ai_request.output_data = result
        ai_request.status = AIGenerationRequest.Status.COMPLETED
        ai_request.completed_at = timezone.now()
        ai_request.save()

        logger.info(f"Metadata enhanced for request {ai_request_id}")
        return {'status': 'completed', 'request_id': ai_request_id}

    except Exception as exc:
        logger.error(f"Metadata enhancement failed: {exc}")
        self.retry(exc=exc)
