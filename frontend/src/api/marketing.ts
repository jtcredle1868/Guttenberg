// =============================================================================
// Guttenberg Marketing API
// Landing pages, ARC campaigns, press kits, and AI-powered content generation.
// =============================================================================

import client from './client';
import {
  LandingPage,
  ARCCampaign,
  PressKit,
  AIRequest,
  PaginatedResponse,
} from './types';

// ---------------------------------------------------------------------------
// Landing Pages
// ---------------------------------------------------------------------------

/**
 * Retrieve the landing page configuration for a title.
 */
export const getLandingPage = async (
  titleId: string,
): Promise<LandingPage> => {
  const { data } = await client.get<LandingPage>(
    `/marketing/landing-pages/${titleId}/`,
  );
  return data;
};

/**
 * Update the landing page configuration for a title.
 */
export const updateLandingPage = async (
  titleId: string,
  pageData: Partial<LandingPage>,
): Promise<LandingPage> => {
  const { data } = await client.put<LandingPage>(
    `/marketing/landing-pages/${titleId}/`,
    pageData,
  );
  return data;
};

// ---------------------------------------------------------------------------
// ARC Campaigns
// ---------------------------------------------------------------------------

/** Query parameters for listing ARC campaigns. */
export interface ARCCampaignParams {
  page?: number;
  page_size?: number;
  title_id?: string;
  status?: string;
}

/**
 * List ARC (Advance Reader Copy) campaigns, optionally filtered by title or status.
 */
export const getARCCampaigns = async (
  params?: ARCCampaignParams,
): Promise<PaginatedResponse<ARCCampaign>> => {
  const { data } = await client.get<PaginatedResponse<ARCCampaign>>(
    '/marketing/arc-campaigns/',
    { params },
  );
  return data;
};

/**
 * Create a new ARC campaign for a title.
 *
 * @param campaignData - Must include `title`, `max_reviewers`, `start_date`, and `end_date`.
 */
export const createARCCampaign = async (
  campaignData: {
    title: string;
    max_reviewers: number;
    start_date: string;
    end_date: string;
  },
): Promise<ARCCampaign> => {
  const { data } = await client.post<ARCCampaign>(
    '/marketing/arc-campaigns/',
    campaignData,
  );
  return data;
};

// ---------------------------------------------------------------------------
// Press Kit
// ---------------------------------------------------------------------------

/**
 * Generate (or regenerate) a press kit for a title.
 * This is an async operation on the server; the returned PressKit will include
 * the generation timestamp once complete.
 */
export const generatePressKit = async (
  titleId: string,
): Promise<PressKit> => {
  const { data } = await client.post<PressKit>(
    `/marketing/${titleId}/press_kit/`,
  );
  return data;
};

// ---------------------------------------------------------------------------
// AI-Powered Content Generation
// ---------------------------------------------------------------------------

/**
 * Request an AI-generated synopsis for a title.
 * Returns an AIRequest that can be polled via `getAIRequestStatus`.
 *
 * @param titleId - The title to generate a synopsis for.
 * @param style - The desired synopsis style (e.g., 'commercial', 'literary', 'back_cover').
 */
export const generateSynopsis = async (
  titleId: string,
  style: string,
): Promise<AIRequest> => {
  const { data } = await client.post<AIRequest>('/ai/synopsis/', {
    title_id: titleId,
    style,
  });
  return data;
};

/**
 * Request AI-optimized keywords/tags for a title.
 * Returns an AIRequest that can be polled via `getAIRequestStatus`.
 */
export const optimizeKeywords = async (
  titleId: string,
): Promise<AIRequest> => {
  const { data } = await client.post<AIRequest>('/ai/keywords/', {
    title_id: titleId,
  });
  return data;
};

/**
 * Poll the status of an asynchronous AI request.
 * When `status` is 'completed', the `result` field will contain the output.
 *
 * @param requestId - The request ID returned by a prior AI endpoint call.
 */
export const getAIRequestStatus = async (
  requestId: string,
): Promise<AIRequest> => {
  const { data } = await client.get<AIRequest>(
    `/ai/status/${requestId}/`,
  );
  return data;
};
