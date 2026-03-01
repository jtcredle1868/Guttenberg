// =============================================================================
// Guttenberg Finance API
// Royalty calculations, earnings dashboards, sales reporting, and disbursements.
// =============================================================================

import client from './client';
import {
  RoyaltyBreakdown,
  EarningsDashboard,
  ChannelBreakdown,
  TerritoryBreakdown,
  Disbursement,
} from './types';

/** Parameters for filtering earnings and sales data. */
export interface FinanceParams {
  period?: string;
  start_date?: string;
  end_date?: string;
  title_id?: string;
  format_type?: string;
  channel?: string;
}

/**
 * Calculate royalty breakdowns for a given price across distribution channels.
 *
 * @param data - Must include `list_price_usd` and optionally `format_type` and `channel_ids`.
 * @returns An array of per-channel royalty breakdowns showing fees and net royalty.
 */
export const calculateRoyalties = async (
  data: {
    list_price_usd: number;
    format_type?: string;
    channel_ids?: string[];
  },
): Promise<RoyaltyBreakdown[]> => {
  const response = await client.post<RoyaltyBreakdown[]>(
    '/finance/royalty_calculator/',
    data,
  );
  return response.data;
};

/**
 * Retrieve the earnings dashboard with aggregated revenue, royalties, and
 * per-title breakdowns for a given period.
 */
export const getEarningsDashboard = async (
  params?: FinanceParams,
): Promise<EarningsDashboard> => {
  const { data } = await client.get<EarningsDashboard>(
    '/finance/earnings_dashboard/',
    { params },
  );
  return data;
};

/**
 * Retrieve sales data broken down by distribution channel.
 */
export const getSalesByChannel = async (
  params?: FinanceParams,
): Promise<ChannelBreakdown[]> => {
  const { data } = await client.get<ChannelBreakdown[]>(
    '/finance/sales_by_channel/',
    { params },
  );
  return data;
};

/**
 * Retrieve sales data broken down by territory / country.
 */
export const getSalesByTerritory = async (
  params?: FinanceParams,
): Promise<TerritoryBreakdown[]> => {
  const { data } = await client.get<TerritoryBreakdown[]>(
    '/finance/sales_by_territory/',
    { params },
  );
  return data;
};

/**
 * Export earnings data as a downloadable file (CSV/XLSX).
 * Returns a Blob suitable for triggering a browser download.
 *
 * @param params - Filters for the export (period, date range, title, etc.).
 * @returns The raw response data as a Blob.
 */
export const exportEarnings = async (
  params?: FinanceParams & { format?: 'csv' | 'xlsx' },
): Promise<Blob> => {
  const { data } = await client.get<Blob>('/finance/export/', {
    params,
    responseType: 'blob',
  });
  return data;
};

/**
 * Request a royalty disbursement (payout) for accrued earnings.
 *
 * @param data - Payment details including method and optional period bounds.
 * @returns The created disbursement record.
 */
export const requestDisbursement = async (
  data: {
    payment_method: string;
    amount?: number;
    currency?: string;
    period_start?: string;
    period_end?: string;
  },
): Promise<Disbursement> => {
  const response = await client.post<Disbursement>(
    '/finance/disburse/',
    data,
  );
  return response.data;
};
