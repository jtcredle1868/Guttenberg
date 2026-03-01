// =============================================================================
// Guttenberg Analytics API
// Sales analytics, time-series data, and breakdowns by channel/territory/format.
// =============================================================================

import client from './client';
import {
  AnalyticsOverview,
  TimeSeriesPoint,
  ChannelBreakdown,
  TerritoryBreakdown,
} from './types';

/** Common query parameters shared across analytics endpoints. */
export interface AnalyticsParams {
  start_date?: string;
  end_date?: string;
  title_id?: string;
  format_type?: string;
  channel?: string;
  granularity?: 'day' | 'week' | 'month';
}

/**
 * Retrieve a high-level analytics overview with aggregate totals for
 * units sold, revenue, royalties, active channels, and active titles.
 */
export const getOverview = async (
  params?: AnalyticsParams,
): Promise<AnalyticsOverview> => {
  const { data } = await client.get<AnalyticsOverview>(
    '/analytics/overview/',
    { params },
  );
  return data;
};

/**
 * Retrieve a time-series of sales data (units, revenue, royalties) at the
 * requested granularity (day, week, or month).
 */
export const getSalesTimeSeries = async (
  params?: AnalyticsParams,
): Promise<TimeSeriesPoint[]> => {
  const { data } = await client.get<TimeSeriesPoint[]>(
    '/analytics/time-series/',
    { params },
  );
  return data;
};

/**
 * Retrieve sales broken down by distribution channel, including percentage
 * share of total revenue.
 */
export const getSalesByChannel = async (
  params?: AnalyticsParams,
): Promise<ChannelBreakdown[]> => {
  const { data } = await client.get<ChannelBreakdown[]>(
    '/analytics/by-channel/',
    { params },
  );
  return data;
};

/**
 * Retrieve sales broken down by territory / country.
 */
export const getSalesByTerritory = async (
  params?: AnalyticsParams,
): Promise<TerritoryBreakdown[]> => {
  const { data } = await client.get<TerritoryBreakdown[]>(
    '/analytics/by-territory/',
    { params },
  );
  return data;
};

/** Format breakdown entry returned by the by-format endpoint. */
export interface FormatBreakdown {
  format_type: string;
  units: number;
  revenue: number;
  percentage: number;
}

/**
 * Retrieve sales broken down by format type (ebook, paperback, etc.).
 */
export const getSalesByFormat = async (
  params?: AnalyticsParams,
): Promise<FormatBreakdown[]> => {
  const { data } = await client.get<FormatBreakdown[]>(
    '/analytics/by-format/',
    { params },
  );
  return data;
};

/** Summary data returned for a single title's analytics. */
export interface TitleAnalyticsSummary {
  title_id: string;
  title_name: string;
  total_units: number;
  total_revenue: number;
  total_royalties: number;
  by_channel: ChannelBreakdown[];
  by_territory: TerritoryBreakdown[];
  time_series: TimeSeriesPoint[];
}

/**
 * Retrieve a comprehensive analytics summary for a single title, including
 * breakdowns by channel, territory, and a time-series.
 */
export const getTitleSummary = async (
  titleId: string,
): Promise<TitleAnalyticsSummary> => {
  const { data } = await client.get<TitleAnalyticsSummary>(
    `/analytics/title/${titleId}/`,
  );
  return data;
};

/**
 * Export analytics data as a downloadable file (CSV/XLSX).
 * Returns a Blob suitable for triggering a browser download.
 *
 * @param params - Filters and the desired export format.
 * @returns The raw response data as a Blob.
 */
export const exportAnalytics = async (
  params?: AnalyticsParams & { format?: 'csv' | 'xlsx' },
): Promise<Blob> => {
  const { data } = await client.get<Blob>('/analytics/export/', {
    params,
    responseType: 'blob',
  });
  return data;
};
