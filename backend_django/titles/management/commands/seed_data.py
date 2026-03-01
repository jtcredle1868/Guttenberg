"""
Seed the database with demo data for investor presentations.

Usage: python manage.py seed_data
"""
import random
from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from titles.models import Title
from formats.models import Format, FormatJob
from distribution.models import DistributionChannel, DistributionRecord
from finance.models import SaleRecord, Disbursement
from marketing.models import LandingPage, ARCCampaign
from enterprise.models import Organization, Imprint, TeamMember
from ecosystem.models import ActivityEvent
from analytics.models import AnalyticsSnapshot


class Command(BaseCommand):
    help = 'Seed the database with demo data for Guttenberg MVP'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Guttenberg database...')

        # Create demo users
        author, _ = User.objects.get_or_create(
            username='demo_author',
            defaults={
                'email': 'demo@guttenberg.io',
                'first_name': 'Sarah',
                'last_name': 'Mitchell',
            }
        )
        author.set_password('demo123')
        author.save()

        publisher, _ = User.objects.get_or_create(
            username='demo_publisher',
            defaults={
                'email': 'publisher@guttenberg.io',
                'first_name': 'James',
                'last_name': 'Harrington',
            }
        )
        publisher.set_password('demo123')
        publisher.save()

        # Create organization
        org, _ = Organization.objects.get_or_create(
            slug='meridian-publishing',
            defaults={
                'name': 'Meridian Publishing Group',
                'subscription_tier': 'publisher',
            }
        )
        TeamMember.objects.get_or_create(organization=org, user=publisher, defaults={'role': 'admin'})
        TeamMember.objects.get_or_create(organization=org, user=author, defaults={'role': 'author'})

        imprint, _ = Imprint.objects.get_or_create(
            organization=org,
            name='Meridian Literary',
            defaults={'default_copyright_template': 'Copyright (c) {publication_year} {author}. All rights reserved.'},
        )

        # Create distribution channels
        channels_data = [
            ('amazon_kdp', 'Amazon KDP', 'rest', 'oauth2'),
            ('ingram_spark', 'IngramSpark', 'rest', 'api_key'),
            ('apple_books', 'Apple Books', 'itmc', 'transporter'),
            ('kobo', 'Kobo Writing Life', 'rest', 'api_key'),
            ('barnes_noble', 'Barnes & Noble Press', 'rest', 'oauth2'),
            ('google_play', 'Google Play Books', 'partner_api', 'oauth2'),
            ('overdrive', 'OverDrive', 'rest', 'api_key'),
            ('bibliotheca', 'Bibliotheca', 'sftp', 'sftp'),
        ]
        channels = {}
        for ch_id, name, api_type, auth in channels_data:
            ch, _ = DistributionChannel.objects.get_or_create(
                id=ch_id, defaults={'name': name, 'api_type': api_type, 'auth_method': auth}
            )
            channels[ch_id] = ch

        # Create titles
        titles_data = [
            {
                'title': 'The Meridian Line',
                'subtitle': 'A Novel of Discovery',
                'primary_author': 'Sarah Mitchell',
                'genre': 'Literary Fiction',
                'synopsis_short': 'A cartographer discovers that the map she\'s been drawing her whole life leads to a truth about her own past.',
                'synopsis_long': 'Eleanor Voss has spent twenty years mapping coastlines for the National Geographic Survey. When a mysterious set of coordinates appears in her late father\'s journals, she embarks on a journey that will challenge everything she believes about her family, her career, and the very nature of discovery.\n\nFrom the fog-shrouded harbors of Maine to the sun-bleached archives of Lisbon, The Meridian Line weaves together past and present in a luminous meditation on memory, loss, and the maps we carry inside ourselves.',
                'bisac_codes': ['FIC019000', 'FIC043000'],
                'keywords': ['literary fiction', 'family secrets', 'cartography', 'discovery', 'women\'s fiction', 'book club', 'debut novel'],
                'publication_date': date(2026, 3, 15),
                'word_count': 87500,
                'status': 'live',
                'refinery_score': 88,
            },
            {
                'title': 'Quantum Echoes',
                'subtitle': 'The Harker Conspiracy',
                'primary_author': 'Sarah Mitchell',
                'genre': 'Thriller',
                'synopsis_short': 'A quantum physicist uncovers a decades-old conspiracy that threatens to collapse the boundary between parallel realities.',
                'synopsis_long': 'Dr. Maya Chen\'s breakthrough in quantum entanglement was supposed to win her the Nobel Prize. Instead, it painted a target on her back. When her research partner is found dead in a locked laboratory, Maya discovers that someone has been using her equations for something far more dangerous than theoretical physics.\n\nRacing against time through the corridors of MIT, the bunkers beneath CERN, and a shadow network of Cold War-era physicists, Maya must decide: save the discovery that could change human understanding forever, or destroy it before it destroys everything.',
                'bisac_codes': ['FIC031080', 'FIC028030'],
                'keywords': ['thriller', 'quantum physics', 'conspiracy', 'science thriller', 'page turner', 'suspense', 'STEM'],
                'publication_date': date(2026, 6, 1),
                'word_count': 95200,
                'status': 'ready',
                'refinery_score': 91,
            },
            {
                'title': 'The Starling\'s Song',
                'primary_author': 'Sarah Mitchell',
                'genre': 'Young Adult',
                'synopsis_short': 'A teenage birder discovers that the starlings migrating through her town carry messages from another world.',
                'bisac_codes': ['YAF019000'],
                'keywords': ['young adult', 'fantasy', 'nature', 'birds', 'coming of age'],
                'word_count': 62000,
                'status': 'formatting',
                'refinery_score': 76,
            },
            {
                'title': 'Foundations of Modern Publishing',
                'subtitle': 'From Gutenberg to Guttenberg',
                'primary_author': 'James Harrington',
                'genre': 'Non-Fiction',
                'synopsis_short': 'The definitive guide to modern self-publishing, from manuscript to market.',
                'bisac_codes': ['BUS070000', 'LAN002000'],
                'keywords': ['self publishing', 'book publishing', 'indie author', 'publishing guide'],
                'publication_date': date(2026, 1, 15),
                'word_count': 52000,
                'status': 'live',
                'refinery_score': 85,
            },
            {
                'title': 'Ember & Ash',
                'primary_author': 'Sarah Mitchell',
                'genre': 'Romance',
                'synopsis_short': 'A firefighter and an arson investigator must work together — and confront their shared history.',
                'bisac_codes': ['FIC027020'],
                'keywords': ['romance', 'firefighter', 'second chance', 'suspense romance'],
                'word_count': 78000,
                'status': 'draft',
                'refinery_score': 65,
            },
        ]

        created_titles = []
        for td in titles_data:
            user = publisher if td['primary_author'] == 'James Harrington' else author
            refinery_score = td.pop('refinery_score', 0)
            title, _ = Title.objects.get_or_create(
                title=td['title'],
                user=user,
                defaults={**td, 'refinery_score': refinery_score, 'imprint': imprint},
            )
            title.calculate_metadata_completeness()
            title.calculate_readiness_score()
            title.save()
            created_titles.append(title)

        # Create formats for each title
        for title in created_titles:
            if title.status in ('live', 'ready'):
                for ft in ['ebook', 'paperback']:
                    fmt, _ = Format.objects.get_or_create(
                        title=title,
                        format_type=ft,
                        defaults={
                            'list_price_usd': Decimal('14.99') if ft == 'ebook' else Decimal('19.99'),
                            'status': 'live' if title.status == 'live' else 'ready',
                            'trim_size': '6x9' if ft == 'paperback' else None,
                            'page_count': title.word_count // 250 if ft == 'paperback' else None,
                        }
                    )
                    # Create distribution records for live titles
                    if title.status == 'live':
                        for ch_id in ['amazon_kdp', 'ingram_spark', 'apple_books', 'kobo', 'barnes_noble']:
                            if ft == 'ebook' or ch_id in ('amazon_kdp', 'ingram_spark'):
                                DistributionRecord.objects.get_or_create(
                                    format=fmt,
                                    channel=channels[ch_id],
                                    defaults={
                                        'channel_status': 'live',
                                        'submission_timestamp': title.publication_date,
                                        'live_timestamp': title.publication_date,
                                    }
                                )

        # Generate 90 days of sales data
        live_distributions = DistributionRecord.objects.filter(channel_status='live').select_related(
            'format', 'format__title', 'channel'
        )
        today = date.today()
        for dist in live_distributions:
            for days_ago in range(90):
                sale_date = today - timedelta(days=days_ago)
                units = random.randint(1, 20)
                price = float(dist.format.list_price_usd or 14.99)
                gross = Decimal(str(round(units * price, 2)))
                royalty = Decimal(str(round(float(gross) * 0.65, 2)))
                territory = random.choice(['US', 'US', 'US', 'GB', 'CA', 'AU', 'DE'])

                SaleRecord.objects.get_or_create(
                    title=dist.format.title,
                    format=dist.format,
                    channel=dist.channel,
                    sale_date=sale_date,
                    defaults={
                        'units_sold': units,
                        'gross_revenue': gross,
                        'royalty_earned': royalty,
                        'territory': territory,
                    }
                )

        # Create ARC campaigns
        for title in created_titles[:2]:
            ARCCampaign.objects.get_or_create(
                title=title,
                defaults={
                    'max_reviewers': 50,
                    'start_date': today - timedelta(days=30),
                    'end_date': today + timedelta(days=30),
                    'status': 'active',
                    'reviewers_count': random.randint(15, 35),
                    'reviews_received': random.randint(5, 15),
                }
            )

        # Create landing pages
        for title in created_titles:
            LandingPage.objects.get_or_create(
                title=title,
                defaults={
                    'slug': title.title.lower().replace(' ', '-').replace("'", ''),
                    'is_published': title.status == 'live',
                }
            )

        # Create activity events
        events = [
            ('distribution_live', 'The Meridian Line is now LIVE on Amazon KDP!'),
            ('sales_milestone', 'The Meridian Line reached 500 sales!'),
            ('distribution_live', 'Foundations of Modern Publishing is LIVE on IngramSpark'),
            ('format_complete', 'EPUB formatting complete for Quantum Echoes'),
            ('royalty_disbursed', 'March royalty payment of $2,847.50 disbursed'),
            ('marketing_task_due', 'ARC campaign for Quantum Echoes ends in 3 days'),
        ]
        for event_type, message in events:
            title = created_titles[0] if 'Meridian' in message else created_titles[1] if 'Quantum' in message else created_titles[3]
            ActivityEvent.objects.get_or_create(
                user=author,
                event_type=event_type,
                message=message,
                defaults={'title': title, 'metadata': {}},
            )

        # Create disbursements
        for month_offset in range(3):
            period_end = today.replace(day=1) - timedelta(days=30 * month_offset)
            period_start = period_end - timedelta(days=30)
            Disbursement.objects.get_or_create(
                user=author,
                period_start=period_start,
                period_end=period_end,
                defaults={
                    'amount': Decimal(str(round(random.uniform(1500, 4500), 2))),
                    'payment_method': 'stripe',
                    'payment_status': 'completed',
                }
            )

        self.stdout.write(self.style.SUCCESS(
            f'Seeded: {len(created_titles)} titles, '
            f'{Format.objects.count()} formats, '
            f'{DistributionRecord.objects.count()} distributions, '
            f'{SaleRecord.objects.count()} sales records, '
            f'{ActivityEvent.objects.count()} events'
        ))
