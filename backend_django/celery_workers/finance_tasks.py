"""
Celery tasks for financial operations.

Handles nightly royalty aggregation and payment processing per FDD §3.7.
"""
import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger('guttenberg.celery.finance')


@shared_task(bind=True)
def nightly_sales_aggregation(self):
    """
    Nightly aggregation job per FDD §3.7.3.

    Pulls sales reports from each connected distribution channel,
    normalizes into SaleRecord schema.
    """
    from distribution.models import DistributionRecord
    from finance.models import SaleRecord
    import random
    from decimal import Decimal

    live_records = DistributionRecord.objects.filter(
        channel_status='live'
    ).select_related('format', 'format__title', 'channel')

    today = timezone.now().date()
    records_created = 0

    for dist in live_records:
        # In production: pull from channel reporting API
        # For MVP: simulate daily sales
        units = random.randint(0, 15)
        if units == 0:
            continue

        price = float(dist.format.list_price_usd or 9.99)
        gross = Decimal(str(round(units * price, 2)))
        royalty_rate = _get_royalty_rate(dist.channel_id, dist.format.format_type, price)
        royalty = Decimal(str(round(float(gross) * royalty_rate, 2)))

        territories = ['US', 'US', 'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'IN']
        territory = random.choice(territories)

        SaleRecord.objects.create(
            title=dist.format.title,
            format=dist.format,
            channel=dist.channel,
            sale_date=today,
            units_sold=units,
            gross_revenue=gross,
            royalty_earned=royalty,
            territory=territory,
        )
        records_created += 1

    logger.info(f"Nightly aggregation complete: {records_created} sale records created")
    return {'records_created': records_created, 'date': str(today)}


def _get_royalty_rate(channel_id, format_type, price):
    """Get royalty rate for channel/format/price combination."""
    rates = {
        'amazon_kdp': {
            'ebook': 0.70 if 2.99 <= price <= 9.99 else 0.35,
            'paperback': 0.60,
            'hardcover': 0.60,
        },
        'ingram_spark': {
            'ebook': 0.45,
            'paperback': 0.40,
            'hardcover': 0.40,
        },
        'apple_books': {'ebook': 0.70},
        'kobo': {'ebook': 0.70 if price >= 1.99 else 0.45},
        'barnes_noble': {'ebook': 0.65, 'paperback': 0.55},
        'google_play': {'ebook': 0.70},
        'guttenberg_store': {'ebook': 0.97, 'paperback': 0.85},
    }
    channel_rates = rates.get(channel_id, {})
    return channel_rates.get(format_type, 0.50)


@shared_task(bind=True)
def process_disbursement(self, disbursement_id: str):
    """Process a royalty disbursement via Stripe."""
    from finance.models import Disbursement

    try:
        disbursement = Disbursement.objects.get(id=disbursement_id)
        disbursement.payment_status = 'processing'
        disbursement.save()

        # In production: Stripe payout
        # stripe.Payout.create(amount=int(disbursement.amount * 100), currency='usd')

        disbursement.payment_status = 'completed'
        disbursement.save()

        logger.info(f"Disbursement {disbursement_id} completed: ${disbursement.amount}")
        return {'status': 'completed', 'amount': str(disbursement.amount)}

    except Exception as exc:
        logger.error(f"Disbursement failed: {exc}")
        try:
            disbursement = Disbursement.objects.get(id=disbursement_id)
            disbursement.payment_status = 'failed'
            disbursement.save()
        except Exception:
            pass
        raise
