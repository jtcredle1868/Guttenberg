// =============================================================================
// Guttenberg Ecosystem API
// Activity feeds, readiness scores, Refinery/Scrybe integrations, and
// entitlement checks for the cross-platform publishing ecosystem.
// =============================================================================

import client from './client';
import { ActivityEvent, ReadinessBreakdown, PaginatedResponse } from './types';

/** Query parameters for the activity feed endpoint. */
export interface ActivityFeedParams {
  page?: number;
  page_size?: number;
  event_type?: string;
  title_id?: string;
  is_read?: boolean;
}

/**
 * Retrieve the activity feed for the authenticated user.
 * Returns a paginated list of events such as status changes, submissions,
 * and system notifications.
 */
export const getActivityFeed = async (
  params?: ActivityFeedParams,
): Promise<PaginatedResponse<ActivityEvent>> => {
  const { data } = await client.get<PaginatedResponse<ActivityEvent>>(
    '/ecosystem/activity-feed/',
    { params },
  );
  return data;
};

/**
 * Retrieve the composite publishing readiness score for a title.
 * Combines refinery, metadata, and preflight scores into a single breakdown.
 *
 * @param titleId - The title to check readiness for.
 */
export const getReadinessScore = async (
  titleId: string,
): Promise<ReadinessBreakdown> => {
  const { data } = await client.get<ReadinessBreakdown>(
    `/ecosystem/readiness/${titleId}/`,
  );
  return data;
};

/**
 * Import a completed manuscript and its metadata from the Refinery platform
 * into Guttenberg, creating or updating a Title record.
 *
 * @param importData - Must include `refinery_project_id`.
 */
export const importFromRefinery = async (
  importData: {
    refinery_project_id: string;
    title_id?: string;
    import_metadata?: boolean;
  },
): Promise<{ title_id: string; status: string; message: string }> => {
  const { data } = await client.post<{
    title_id: string;
    status: string;
    message: string;
  }>('/ecosystem/refinery-import/', importData);
  return data;
};

/**
 * Sync a title's data to Scrybe to create or update a public book page.
 *
 * @param syncData - Must include `title_id` and optionally `include_buy_links`.
 */
export const syncToScrybe = async (
  syncData: {
    title_id: string;
    include_buy_links?: boolean;
    custom_slug?: string;
  },
): Promise<{ scrybe_url: string; status: string }> => {
  const { data } = await client.post<{
    scrybe_url: string;
    status: string;
  }>('/ecosystem/scrybe/book-page/', syncData);
  return data;
};

/** Entitlement record describing a user's access to a platform feature. */
export interface Entitlement {
  feature: string;
  tier: string;
  is_active: boolean;
  usage_count?: number;
  usage_limit?: number;
  expires_at?: string;
}

/**
 * Retrieve the current user's platform entitlements (feature flags and
 * subscription-gated capabilities).
 */
export const getEntitlements = async (): Promise<Entitlement[]> => {
  const { data } = await client.get<Entitlement[]>(
    '/ecosystem/entitlements/',
  );
  return data;
};
