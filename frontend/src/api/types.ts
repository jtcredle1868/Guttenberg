export type TitleStatus = 'draft' | 'in-production' | 'published' | 'archived';
export type FormatType = 'print' | 'ebook' | 'audiobook';
export type ChannelName = 'amazon-kdp' | 'ingram-spark' | 'apple-books' | 'kobo' | 'barnes-noble' | 'author-store';

export interface Author {
  id: string;
  name: string;
  email: string;
  bio?: string;
  penName?: string;
  avatarUrl?: string;
  subscriptionTier: 'indie' | 'pro' | 'publisher';
}

export interface Format {
  id: string;
  titleId: string;
  type: FormatType;
  trimSize?: string;
  template?: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  fileUrl?: string;
  createdAt: string;
}

export interface Channel {
  id: string;
  name: ChannelName;
  displayName: string;
  status: 'not-submitted' | 'pending' | 'live' | 'withdrawn';
  listPrice?: number;
  royaltyRate?: number;
  submittedAt?: string;
  liveAt?: string;
}

export interface Title {
  id: string;
  title: string;
  subtitle?: string;
  authorId: string;
  authorName: string;
  status: TitleStatus;
  coverUrl?: string;
  language: string;
  publicationDate?: string;
  pageCount?: number;
  wordCount?: number;
  genre?: string;
  bisacCodes?: string[];
  keywords?: string[];
  shortSynopsis?: string;
  longDescription?: string;
  seriesName?: string;
  seriesNumber?: number;
  edition?: string;
  copyrightYear?: number;
  publisherName?: string;
  imprint?: string;
  formats: Format[];
  channels: Channel[];
  readinessScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalesRecord {
  id: string;
  titleId: string;
  titleName: string;
  formatType: FormatType;
  channelName: string;
  units: number;
  revenue: number;
  royalties: number;
  reportingPeriod: string;
  saleDate: string;
}

export interface DashboardStats {
  totalTitles: number;
  activeTitles: number;
  allTimeRevenue: number;
  totalRoyalties: number;
  activeChannels: number;
  salesLast30Days: { date: string; revenue: number; units: number }[];
  recentActivity: ActivityEvent[];
  titleReadiness: TitleReadinessItem[];
}

export interface ActivityEvent {
  id: string;
  type: 'distribution_live' | 'sales_milestone' | 'format_complete' | 'review_received' | 'payout_sent';
  title: string;
  description: string;
  timestamp: string;
  meta?: Record<string, string | number>;
}

export interface TitleReadinessItem {
  id: string;
  title: string;
  status: TitleStatus;
  readinessScore: number;
  formats: FormatType[];
  channels: number;
}

export interface RoyaltyBreakdown {
  channel: string;
  displayName: string;
  listPrice: number;
  platformFee: number;
  printCost?: number;
  royaltyRate: number;
  royaltyAmount: number;
  netProceeds: number;
}

export interface AnalyticsData {
  revenueOverTime: { date: string; revenue: number; units: number }[];
  channelBreakdown: { channel: string; revenue: number; units: number; percentage: number }[];
  topTitles: { titleId: string; title: string; units: number; revenue: number; royalties: number }[];
  territories: { country: string; units: number; revenue: number }[];
  totalRevenue: number;
  totalUnits: number;
  averagePrice: number;
  averageRoyaltyRate: number;
}

export interface Disbursement {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid';
  period: string;
  paidAt?: string;
  method: string;
}

export interface LoginResponse {
  token: string;
  user: Author;
}

export interface ValidationResult {
  item: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export interface PreflightResult {
  titleId: string;
  overallStatus: 'pass' | 'fail' | 'warning';
  checks: ValidationResult[];
}

export interface ArcCampaign {
  id: string;
  titleId: string;
  name: string;
  expiresAt: string;
  codesTotal: number;
  codesUsed: number;
  reviewsReceived: number;
  status: 'active' | 'expired' | 'cancelled';
}
