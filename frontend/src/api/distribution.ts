// =============================================================================
// Guttenberg Distribution API
// Channel management and submission operations (FDD §2.3).
// =============================================================================

import client from './client';
import { DistributionChannel, DistributionRecord } from './types';

/**
 * List all available distribution channels.
 */
export const getChannels = async (): Promise<DistributionChannel[]> => {
  const { data } = await client.get<DistributionChannel[]>(
    '/distribution/channels/',
  );
  return data;
};

/**
 * Retrieve the distribution status for every format/channel combination
 * belonging to the given title.
 */
export const getDistributionStatus = async (
  titleId: string,
): Promise<DistributionRecord[]> => {
  const { data } = await client.get<DistributionRecord[]>(
    `/distribution/${titleId}/distribution_status/`,
  );
  return data;
};

/**
 * Submit a title's formats to one or more distribution channels.
 *
 * @param titleId - The title to distribute.
 * @param submitData - Payload containing channel IDs and optional pricing overrides.
 */
export const submitToChannels = async (
  titleId: string,
  submitData: {
    channel_ids: string[];
    format_ids?: string[];
    pricing_overrides?: Record<string, number>;
  },
): Promise<DistributionRecord[]> => {
  const { data } = await client.post<DistributionRecord[]>(
    `/distribution/${titleId}/submit/`,
    submitData,
  );
  return data;
};

/**
 * Withdraw a previously submitted distribution record from its channel.
 */
export const withdrawFromChannel = async (
  recordId: string,
): Promise<DistributionRecord> => {
  const { data } = await client.post<DistributionRecord>(
    `/distribution/${recordId}/withdraw/`,
  );
  return data;
};

/**
 * Update the pricing for an existing distribution record.
 */
export const updatePricing = async (
  recordId: string,
  pricingData: { list_price_usd?: number; channel_pricing?: Record<string, number> },
): Promise<DistributionRecord> => {
  const { data } = await client.put<DistributionRecord>(
    `/distribution/${recordId}/pricing/`,
    pricingData,
  );
  return data;
};
