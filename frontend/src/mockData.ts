/**
 * Mock data for Guttenberg investor demo.
 * Used as fallback when backend API is not available.
 */
import { subDays, format } from 'date-fns';
import {
  TitleListItem, AnalyticsOverview, TimeSeriesPoint, ChannelBreakdown,
  TerritoryBreakdown, ActivityEvent, Disbursement, RoyaltyBreakdown,
} from './api/types';

export const MOCK_TITLES: TitleListItem[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'The Meridian Line',
    subtitle: 'A Novel of Discovery',
    primary_author: 'Sarah Mitchell',
    genre: 'Literary Fiction',
    status: 'live',
    publishing_readiness_score: 92,
    publication_date: '2026-03-15',
    word_count: 87500,
    format_count: 2,
    channel_count: 5,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Quantum Echoes',
    subtitle: 'The Harker Conspiracy',
    primary_author: 'Sarah Mitchell',
    genre: 'Thriller',
    status: 'ready',
    publishing_readiness_score: 88,
    publication_date: '2026-06-01',
    word_count: 95200,
    format_count: 2,
    channel_count: 0,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-28T00:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: "The Starling's Song",
    subtitle: '',
    primary_author: 'Sarah Mitchell',
    genre: 'Young Adult',
    status: 'formatting',
    publishing_readiness_score: 71,
    word_count: 62000,
    format_count: 1,
    channel_count: 0,
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-02-25T00:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Foundations of Modern Publishing',
    subtitle: 'From Gutenberg to Guttenberg',
    primary_author: 'James Harrington',
    genre: 'Non-Fiction',
    status: 'live',
    publishing_readiness_score: 95,
    publication_date: '2026-01-15',
    word_count: 52000,
    format_count: 3,
    channel_count: 4,
    created_at: '2025-11-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Ember & Ash',
    subtitle: '',
    primary_author: 'Sarah Mitchell',
    genre: 'Romance',
    status: 'draft',
    publishing_readiness_score: 35,
    word_count: 78000,
    format_count: 0,
    channel_count: 0,
    created_at: '2026-02-20T00:00:00Z',
    updated_at: '2026-02-28T00:00:00Z',
  },
];

export const MOCK_ANALYTICS_OVERVIEW: AnalyticsOverview = {
  total_units: 12847,
  total_revenue: 168432.50,
  total_royalties: 98215.75,
  active_channels: 5,
  active_titles: 2,
};

export const generateMockTimeSeries = (days: number = 30): TimeSeriesPoint[] => {
  const data: TimeSeriesPoint[] = [];
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const baseUnits = 120 + Math.floor(Math.random() * 80);
    const avgPrice = 12.5;
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      units: baseUnits,
      revenue: Math.round(baseUnits * avgPrice * 100) / 100,
      royalties: Math.round(baseUnits * avgPrice * 0.65 * 100) / 100,
    });
  }
  return data;
};

export const MOCK_CHANNEL_BREAKDOWN: ChannelBreakdown[] = [
  { channel: 'amazon_kdp', channel_name: 'Amazon KDP', units: 5890, revenue: 76570, percentage: 45.5 },
  { channel: 'ingram_spark', channel_name: 'IngramSpark', units: 2450, revenue: 36750, percentage: 21.8 },
  { channel: 'apple_books', channel_name: 'Apple Books', units: 2100, revenue: 27300, percentage: 16.2 },
  { channel: 'kobo', channel_name: 'Kobo', units: 1507, revenue: 17582, percentage: 10.4 },
  { channel: 'barnes_noble', channel_name: 'Barnes & Noble', units: 900, revenue: 10230, percentage: 6.1 },
];

export const MOCK_TERRITORY_BREAKDOWN: TerritoryBreakdown[] = [
  { territory: 'US', units: 7708, revenue: 100192 },
  { territory: 'GB', units: 2055, revenue: 26715 },
  { territory: 'CA', units: 1284, revenue: 16692 },
  { territory: 'AU', units: 900, revenue: 11700 },
  { territory: 'DE', units: 514, revenue: 6682 },
  { territory: 'FR', units: 257, revenue: 3341 },
  { territory: 'JP', units: 129, revenue: 1677 },
];

export const MOCK_ACTIVITY_FEED: ActivityEvent[] = [
  {
    id: 'evt-1',
    event_type: 'distribution_live',
    message: 'The Meridian Line is now LIVE on Amazon KDP!',
    metadata: { channel: 'amazon_kdp' },
    is_read: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'evt-2',
    event_type: 'sales_milestone',
    message: 'The Meridian Line reached 500 sales! 🎉',
    metadata: { milestone: 500 },
    is_read: false,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'evt-3',
    event_type: 'format_complete',
    message: 'EPUB formatting complete for Quantum Echoes',
    metadata: { format: 'epub' },
    is_read: true,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'evt-4',
    event_type: 'royalty_disbursed',
    message: 'February royalty payment of $2,847.50 disbursed',
    metadata: { amount: 2847.50 },
    is_read: true,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 'evt-5',
    event_type: 'marketing_task_due',
    message: 'ARC campaign for Quantum Echoes ends in 3 days',
    metadata: {},
    is_read: false,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
  {
    id: 'evt-6',
    event_type: 'distribution_live',
    message: 'Foundations of Modern Publishing is LIVE on IngramSpark',
    metadata: { channel: 'ingram_spark' },
    is_read: true,
    created_at: new Date(Date.now() - 96 * 3600000).toISOString(),
  },
];

export const MOCK_ROYALTY_BREAKDOWN: RoyaltyBreakdown[] = [
  { channel: 'amazon_kdp', channel_name: 'Amazon KDP', format_type: 'ebook', list_price: 14.99, gross_royalty: 10.49, distribution_fee: 0, platform_fee: 0.75, net_royalty: 9.74, royalty_rate: 0.70 },
  { channel: 'amazon_kdp', channel_name: 'Amazon KDP', format_type: 'paperback', list_price: 19.99, gross_royalty: 12.00, distribution_fee: 4.50, platform_fee: 1.00, net_royalty: 6.50, royalty_rate: 0.60 },
  { channel: 'ingram_spark', channel_name: 'IngramSpark', format_type: 'ebook', list_price: 14.99, gross_royalty: 6.75, distribution_fee: 0, platform_fee: 0.75, net_royalty: 6.00, royalty_rate: 0.45 },
  { channel: 'apple_books', channel_name: 'Apple Books', format_type: 'ebook', list_price: 14.99, gross_royalty: 10.49, distribution_fee: 0, platform_fee: 0.75, net_royalty: 9.74, royalty_rate: 0.70 },
  { channel: 'kobo', channel_name: 'Kobo', format_type: 'ebook', list_price: 14.99, gross_royalty: 10.49, distribution_fee: 0, platform_fee: 0.75, net_royalty: 9.74, royalty_rate: 0.70 },
  { channel: 'barnes_noble', channel_name: 'Barnes & Noble', format_type: 'ebook', list_price: 14.99, gross_royalty: 9.74, distribution_fee: 0, platform_fee: 0.75, net_royalty: 8.99, royalty_rate: 0.65 },
  { channel: 'guttenberg_store', channel_name: 'Guttenberg Store', format_type: 'ebook', list_price: 14.99, gross_royalty: 14.54, distribution_fee: 0, platform_fee: 0.45, net_royalty: 14.09, royalty_rate: 0.97 },
];

export const MOCK_DISBURSEMENTS: Disbursement[] = [
  { id: 'd-1', amount: 2847.50, currency: 'USD', payment_method: 'stripe', payment_status: 'completed', period_start: '2026-02-01', period_end: '2026-02-28', created_at: '2026-03-01T00:00:00Z' },
  { id: 'd-2', amount: 3215.00, currency: 'USD', payment_method: 'stripe', payment_status: 'completed', period_start: '2026-01-01', period_end: '2026-01-31', created_at: '2026-02-01T00:00:00Z' },
  { id: 'd-3', amount: 1890.75, currency: 'USD', payment_method: 'stripe', payment_status: 'completed', period_start: '2025-12-01', period_end: '2025-12-31', created_at: '2026-01-01T00:00:00Z' },
];

export const TEMPLATE_CATALOG = [
  { name: 'Meridian', genre_target: 'Literary Fiction', description: 'Clean serif body, decorative chapter opener, single-column layout', trim_sizes: ['6x9'], features: ['Drop caps', 'Ornamental dividers', 'Running headers'] },
  { name: 'Velocity', genre_target: 'Thriller / Mystery', description: 'Bold chapter numbers, wide margins, scene break ornaments', trim_sizes: ['5.5x8.5'], features: ['Bold headings', 'Scene breaks', 'Tight spacing'] },
  { name: 'Ember', genre_target: 'Romance / Women\'s Fiction', description: 'Script-accented chapter titles, generous leading, ornamental dividers', trim_sizes: ['5.5x8.5'], features: ['Script accents', 'Floral ornaments', 'Generous spacing'] },
  { name: 'Codex', genre_target: 'Non-fiction / Business', description: 'Sans-serif headers, callout boxes, pull quotes, part/chapter hierarchy', trim_sizes: ['6x9'], features: ['Callout boxes', 'Pull quotes', 'Charts support'] },
  { name: 'Pinnacle', genre_target: 'Academic / Scholarly', description: 'Chicago footnote support, wide margins for annotations', trim_sizes: ['6x9'], features: ['Footnotes', 'Citations', 'Wide margins'] },
  { name: 'Horizon', genre_target: 'Children\'s / Middle Grade', description: 'Large body font, illustrated chapter headers, dyslexia-friendly spacing', trim_sizes: ['5x8'], features: ['Large font', 'Illustrations', 'Accessible spacing'] },
  { name: 'Spectrum', genre_target: 'Young Adult', description: 'Contemporary sans-serif, alternating chapter decorations', trim_sizes: ['5.5x8.5'], features: ['Modern design', 'Alt decorations', 'Clean layout'] },
  { name: 'Atlas', genre_target: 'Technical / Manual', description: 'Two-column option, table support, numbered steps', trim_sizes: ['8.5x11'], features: ['Two-column', 'Tables', 'Numbered steps'] },
];

// Channel color mapping for charts
export const CHANNEL_COLORS: Record<string, string> = {
  amazon_kdp: '#FF9900',
  ingram_spark: '#2563EB',
  apple_books: '#A855F7',
  kobo: '#EF4444',
  barnes_noble: '#10B981',
  google_play: '#F59E0B',
  guttenberg_store: '#6366F1',
};

export const TERRITORY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  JP: 'Japan',
  IN: 'India',
  BR: 'Brazil',
};
