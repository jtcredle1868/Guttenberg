// =============================================================================
// Guttenberg Self-Publishing Platform - API Type Definitions
// Matches Django REST Framework backend models and serializers
// =============================================================================

// ---------------------------------------------------------------------------
// Core / Auth
// ---------------------------------------------------------------------------

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ---------------------------------------------------------------------------
// Title (FDD §2.1 - central entity)
// ---------------------------------------------------------------------------

export type TitleStatus =
  | 'draft'
  | 'formatting'
  | 'ready'
  | 'submitted'
  | 'live'
  | 'unlisted';

export interface Contributor {
  name: string;
  role: string;
  bio: string;
}

export interface ReadinessBreakdown {
  composite: number;
  refinery: number;
  metadata: number;
  preflight: number;
  level: 'ready' | 'nearly_ready' | 'not_ready';
}

export interface Title {
  id: string;
  user: number;
  imprint?: string | null;
  refinery_manuscript_id?: string | null;
  title: string;
  subtitle: string;
  series_name: string;
  series_number?: number | null;
  primary_author: string;
  contributors: Contributor[];
  synopsis_short: string;
  synopsis_long: string;
  bisac_codes: string[];
  keywords: string[];
  language: string;
  publication_date?: string | null;
  edition: string;
  audience_age_min?: number | null;
  audience_age_max?: number | null;
  content_advisories: string[];
  publishing_readiness_score: number;
  refinery_score: number;
  metadata_completeness_score: number;
  preflight_score: number;
  status: TitleStatus;
  word_count: number;
  genre: string;
  created_at: string;
  updated_at: string;
  formats?: Format[];
  readiness_breakdown?: ReadinessBreakdown;
}

/** Lightweight title representation returned by list endpoints. */
export interface TitleListItem {
  id: string;
  title: string;
  subtitle: string;
  primary_author: string;
  genre: string;
  status: TitleStatus;
  publishing_readiness_score: number;
  publication_date?: string;
  word_count: number;
  format_count: number;
  channel_count: number;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Format (FDD §2.2)
// ---------------------------------------------------------------------------

export type FormatType =
  | 'ebook'
  | 'paperback'
  | 'hardcover'
  | 'audiobook'
  | 'large_print';

export type FormatStatus = 'draft' | 'ready' | 'submitted' | 'live';

export interface Format {
  id: string;
  title: string;
  format_type: FormatType;
  isbn?: string;
  isbn_source?: string;
  trim_size?: string;
  page_count?: number;
  list_price_usd: number;
  channel_pricing: Record<string, number>;
  drm_enabled: boolean;
  status: FormatStatus;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Format Job
// ---------------------------------------------------------------------------

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface FormatJob {
  id: string;
  format: string;
  job_type: string;
  template_name: string;
  template_config: Record<string, any>;
  status: JobStatus;
  progress: number;
  error_message: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Distribution (FDD §2.3)
// ---------------------------------------------------------------------------

export type ChannelStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'live'
  | 'rejected'
  | 'unlisted';

export interface DistributionChannel {
  id: string;
  name: string;
  api_type: string;
  auth_method: string;
  is_active: boolean;
}

export interface DistributionRecord {
  id: string;
  format: string;
  channel: string;
  channel_name: string;
  format_type: string;
  title_name: string;
  submission_timestamp?: string;
  live_timestamp?: string;
  channel_status: ChannelStatus;
  channel_url: string;
  channel_asin: string;
  rejection_reason: string;
  exclusivity: boolean;
  exclusivity_end_date?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export interface SaleRecord {
  id: string;
  title: string;
  format: string;
  channel: string;
  sale_date: string;
  units_sold: number;
  gross_revenue: number;
  royalty_earned: number;
  currency: string;
  territory: string;
}

export interface RoyaltyBreakdown {
  channel: string;
  channel_name: string;
  format_type: string;
  list_price: number;
  gross_royalty: number;
  distribution_fee: number;
  platform_fee: number;
  net_royalty: number;
  royalty_rate: number;
}

export interface EarningsDashboard {
  total_revenue: number;
  total_royalties: number;
  total_units: number;
  period: string;
  by_title: {
    title_id: string;
    title_name: string;
    revenue: number;
    royalties: number;
    units: number;
  }[];
}

export interface Disbursement {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Marketing
// ---------------------------------------------------------------------------

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  theme: string;
  custom_css: string;
  is_published: boolean;
}

export interface ARCCampaign {
  id: string;
  title: string;
  max_reviewers: number;
  start_date: string;
  end_date: string;
  status: string;
  reviewers_count: number;
  reviews_received: number;
}

export interface PressKit {
  id: string;
  title: string;
  generated_at?: string;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface AnalyticsOverview {
  total_units: number;
  total_revenue: number;
  total_royalties: number;
  active_channels: number;
  active_titles: number;
}

export interface TimeSeriesPoint {
  date: string;
  units: number;
  revenue: number;
  royalties: number;
}

export interface ChannelBreakdown {
  channel: string;
  channel_name: string;
  units: number;
  revenue: number;
  percentage: number;
}

export interface TerritoryBreakdown {
  territory: string;
  units: number;
  revenue: number;
}

// ---------------------------------------------------------------------------
// AI Services
// ---------------------------------------------------------------------------

export interface AIRequest {
  request_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  request_type: string;
  result?: any;
  error?: string;
}

// ---------------------------------------------------------------------------
// Ecosystem
// ---------------------------------------------------------------------------

export interface ActivityEvent {
  id: string;
  event_type: string;
  message: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
  title?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  channel: string;
  is_read: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Channel Readiness
// ---------------------------------------------------------------------------

export interface ChannelReadinessCheck {
  field: string;
  required: boolean;
  status: boolean;
  note?: string;
}

export interface ChannelReadiness {
  channel: string;
  ready: boolean;
  checks: ChannelReadinessCheck[];
  score: number;
}

// ---------------------------------------------------------------------------
// Enterprise
// ---------------------------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subscription_tier: string;
}

export interface Imprint {
  id: string;
  organization: string;
  name: string;
}

export interface TeamMember {
  id: string;
  user: number;
  role: string;
  joined_at: string;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Manuscript
// ---------------------------------------------------------------------------

export interface ManuscriptVersion {
  id: string;
  version_number: number;
  change_note: string;
  word_count: number;
  chapter_count: number;
  upload_timestamp: string;
}

export interface Manuscript {
  id: string;
  title: string;
  original_filename: string;
  file_format: string;
  file_size: number;
  source: string;
  word_count: number;
  chapter_count: number;
  preflight_status: string;
  preflight_report: any;
  versions: ManuscriptVersion[];
  created_at: string;
}

// ---------------------------------------------------------------------------
// Paginated Response (DRF standard envelope)
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------------------------------------------------------------------------
// Format Template
// ---------------------------------------------------------------------------

export interface FormatTemplate {
  name: string;
  genre_target: string;
  description: string;
  trim_sizes: string[];
  features: string[];
}
