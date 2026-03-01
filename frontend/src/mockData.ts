import { Title, DashboardStats, AnalyticsData, SalesRecord, Disbursement } from './api/types';
import { subDays, format } from 'date-fns';

export const MOCK_TITLES: Title[] = [
  {
    id: '1', title: 'The Silicon Valley Chronicles', subtitle: 'A Tech Entrepreneur\'s Journey',
    authorId: '1', authorName: 'Alex Rivera', status: 'published',
    coverUrl: undefined, language: 'en', publicationDate: '2024-01-15',
    pageCount: 342, wordCount: 89000, genre: 'Business & Technology',
    bisacCodes: ['BUS000000', 'BUS071000'], keywords: ['entrepreneurship', 'tech', 'startup'],
    shortSynopsis: 'A gripping tale of Silicon Valley ambition and survival.',
    readinessScore: 98,
    formats: [{ id: 'f1', titleId: '1', type: 'print', status: 'complete', trimSize: '6x9', createdAt: '2024-01-10T00:00:00Z' },
              { id: 'f2', titleId: '1', type: 'ebook', status: 'complete', createdAt: '2024-01-10T00:00:00Z' }],
    channels: [
      { id: 'c1', name: 'amazon-kdp', displayName: 'Amazon KDP', status: 'live', listPrice: 14.99, royaltyRate: 0.70, liveAt: '2024-01-15T00:00:00Z' },
      { id: 'c2', name: 'ingram-spark', displayName: 'IngramSpark', status: 'live', listPrice: 16.99, royaltyRate: 0.55, liveAt: '2024-01-15T00:00:00Z' },
      { id: 'c3', name: 'apple-books', displayName: 'Apple Books', status: 'live', listPrice: 12.99, royaltyRate: 0.70, liveAt: '2024-02-01T00:00:00Z' },
      { id: 'c4', name: 'kobo', displayName: 'Kobo', status: 'live', listPrice: 12.99, royaltyRate: 0.70, liveAt: '2024-02-01T00:00:00Z' },
    ],
    createdAt: '2023-11-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2', title: 'Midnight in the Quantum Garden', subtitle: undefined,
    authorId: '1', authorName: 'Alex Rivera', status: 'published',
    language: 'en', publicationDate: '2024-03-20',
    pageCount: 412, wordCount: 115000, genre: 'Science Fiction',
    readinessScore: 95,
    formats: [{ id: 'f3', titleId: '2', type: 'ebook', status: 'complete', createdAt: '2024-03-15T00:00:00Z' },
              { id: 'f4', titleId: '2', type: 'print', status: 'complete', trimSize: '5.5x8.5', createdAt: '2024-03-15T00:00:00Z' }],
    channels: [
      { id: 'c5', name: 'amazon-kdp', displayName: 'Amazon KDP', status: 'live', listPrice: 4.99, royaltyRate: 0.70, liveAt: '2024-03-20T00:00:00Z' },
      { id: 'c6', name: 'apple-books', displayName: 'Apple Books', status: 'live', listPrice: 4.99, royaltyRate: 0.70, liveAt: '2024-03-25T00:00:00Z' },
      { id: 'c7', name: 'kobo', displayName: 'Kobo', status: 'live', listPrice: 4.99, royaltyRate: 0.70, liveAt: '2024-04-01T00:00:00Z' },
    ],
    createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-03-20T00:00:00Z',
  },
  {
    id: '3', title: 'The Minimalist Cookbook', subtitle: '100 Recipes for Mindful Eating',
    authorId: '1', authorName: 'Alex Rivera', status: 'in-production',
    language: 'en', pageCount: 256, wordCount: 45000, genre: 'Food & Lifestyle',
    readinessScore: 72,
    formats: [{ id: 'f5', titleId: '3', type: 'print', status: 'processing', trimSize: '8x10', createdAt: '2024-05-01T00:00:00Z' }],
    channels: [],
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-05-10T00:00:00Z',
  },
  {
    id: '4', title: 'Shadows of the Algorithm', subtitle: 'A Cyberpunk Thriller',
    authorId: '1', authorName: 'Jordan Blake', status: 'draft',
    language: 'en', wordCount: 23000, genre: 'Thriller',
    readinessScore: 35,
    formats: [],
    channels: [],
    createdAt: '2024-05-20T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '5', title: 'Leadership in the Digital Age', subtitle: 'Building High-Performance Teams',
    authorId: '1', authorName: 'Alex Rivera', status: 'published',
    language: 'en', publicationDate: '2023-09-01',
    pageCount: 288, wordCount: 72000, genre: 'Business',
    readinessScore: 100,
    formats: [{ id: 'f6', titleId: '5', type: 'ebook', status: 'complete', createdAt: '2023-08-25T00:00:00Z' },
              { id: 'f7', titleId: '5', type: 'print', status: 'complete', trimSize: '6x9', createdAt: '2023-08-25T00:00:00Z' }],
    channels: [
      { id: 'c8', name: 'amazon-kdp', displayName: 'Amazon KDP', status: 'live', listPrice: 19.99, royaltyRate: 0.70, liveAt: '2023-09-01T00:00:00Z' },
      { id: 'c9', name: 'ingram-spark', displayName: 'IngramSpark', status: 'live', listPrice: 22.99, royaltyRate: 0.55, liveAt: '2023-09-05T00:00:00Z' },
      { id: 'c10', name: 'apple-books', displayName: 'Apple Books', status: 'live', listPrice: 17.99, royaltyRate: 0.70, liveAt: '2023-09-10T00:00:00Z' },
      { id: 'c11', name: 'kobo', displayName: 'Kobo', status: 'live', listPrice: 17.99, royaltyRate: 0.70, liveAt: '2023-09-10T00:00:00Z' },
      { id: 'c12', name: 'barnes-noble', displayName: 'Barnes & Noble', status: 'live', listPrice: 19.99, royaltyRate: 0.65, liveAt: '2023-10-01T00:00:00Z' },
    ],
    createdAt: '2023-07-01T00:00:00Z', updatedAt: '2023-09-01T00:00:00Z',
  },
];

const generateDailySales = (days: number) =>
  Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd'),
    revenue: Math.round((Math.random() * 800 + 200) * 100) / 100,
    units: Math.floor(Math.random() * 120 + 20),
  }));

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalTitles: 5, activeTitles: 3,
  allTimeRevenue: 48732.50, totalRoyalties: 31275.80, activeChannels: 13,
  salesLast30Days: generateDailySales(30),
  recentActivity: [
    { id: 'a1', type: 'distribution_live', title: 'Midnight in the Quantum Garden', description: 'Now live on Kobo Writing Life', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), meta: { channel: 'kobo' } },
    { id: 'a2', type: 'sales_milestone', title: 'The Silicon Valley Chronicles', description: 'Reached 2,000 units sold milestone!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    { id: 'a3', type: 'format_complete', title: 'The Minimalist Cookbook', description: 'Print formatting job completed successfully', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
    { id: 'a4', type: 'payout_sent', title: 'Monthly Royalty Payment', description: '$2,847.32 disbursed to your account', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 'a5', type: 'review_received', title: 'Leadership in the Digital Age', description: '★★★★★ New 5-star review on Amazon', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() },
  ],
  titleReadiness: MOCK_TITLES.map(t => ({
    id: t.id, title: t.title, status: t.status, readinessScore: t.readinessScore,
    formats: t.formats.map(f => f.type), channels: t.channels.filter(c => c.status === 'live').length,
  })),
};

export const MOCK_ANALYTICS: AnalyticsData = {
  revenueOverTime: generateDailySales(90),
  channelBreakdown: [
    { channel: 'amazon-kdp', revenue: 28450, units: 3210, percentage: 58 },
    { channel: 'ingram-spark', revenue: 9870, units: 520, percentage: 20 },
    { channel: 'apple-books', revenue: 5930, units: 890, percentage: 12 },
    { channel: 'kobo', revenue: 2450, units: 410, percentage: 5 },
    { channel: 'barnes-noble', revenue: 2032, units: 280, percentage: 5 },
  ],
  topTitles: [
    { titleId: '5', title: 'Leadership in the Digital Age', units: 2140, revenue: 21890, royalties: 14780 },
    { titleId: '1', title: 'The Silicon Valley Chronicles', units: 1870, revenue: 17430, royalties: 11490 },
    { titleId: '2', title: 'Midnight in the Quantum Garden', units: 1290, revenue: 6430, royalties: 4430 },
  ],
  territories: [
    { country: 'United States', units: 2840, revenue: 31200 },
    { country: 'United Kingdom', units: 980, revenue: 9870 },
    { country: 'Canada', units: 540, revenue: 5430 },
    { country: 'Australia', units: 410, revenue: 4120 },
    { country: 'Germany', units: 280, revenue: 2810 },
    { country: 'France', units: 210, revenue: 2100 },
  ],
  totalRevenue: 48732, totalUnits: 5300, averagePrice: 9.19, averageRoyaltyRate: 0.68,
};

export const MOCK_DISBURSEMENTS: Disbursement[] = [
  { id: 'd1', amount: 2847.32, currency: 'USD', status: 'paid', period: '2024-05', paidAt: '2024-06-15', method: 'Bank Transfer' },
  { id: 'd2', amount: 3102.18, currency: 'USD', status: 'paid', period: '2024-04', paidAt: '2024-05-15', method: 'Bank Transfer' },
  { id: 'd3', amount: 2654.90, currency: 'USD', status: 'paid', period: '2024-03', paidAt: '2024-04-15', method: 'Bank Transfer' },
  { id: 'd4', amount: 2198.45, currency: 'USD', status: 'paid', period: '2024-02', paidAt: '2024-03-15', method: 'Bank Transfer' },
  { id: 'd5', amount: 1876.30, currency: 'USD', status: 'paid', period: '2024-01', paidAt: '2024-02-15', method: 'Bank Transfer' },
];

export const MOCK_SALES: SalesRecord[] = [
  { id: 's1', titleId: '1', titleName: 'The Silicon Valley Chronicles', formatType: 'print', channelName: 'Amazon KDP', units: 124, revenue: 1858.76, royalties: 1301.13, reportingPeriod: '2024-05', saleDate: '2024-05-31' },
  { id: 's2', titleId: '5', titleName: 'Leadership in the Digital Age', formatType: 'ebook', channelName: 'Amazon KDP', units: 231, revenue: 4618.69, royalties: 3233.08, reportingPeriod: '2024-05', saleDate: '2024-05-31' },
  { id: 's3', titleId: '2', titleName: 'Midnight in the Quantum Garden', formatType: 'ebook', channelName: 'Apple Books', units: 87, revenue: 434.13, royalties: 303.89, reportingPeriod: '2024-05', saleDate: '2024-05-31' },
  { id: 's4', titleId: '1', titleName: 'The Silicon Valley Chronicles', formatType: 'ebook', channelName: 'Kobo', units: 56, revenue: 727.44, royalties: 509.21, reportingPeriod: '2024-05', saleDate: '2024-05-31' },
  { id: 's5', titleId: '5', titleName: 'Leadership in the Digital Age', formatType: 'print', channelName: 'IngramSpark', units: 42, revenue: 965.58, royalties: 530.07, reportingPeriod: '2024-05', saleDate: '2024-05-31' },
];
