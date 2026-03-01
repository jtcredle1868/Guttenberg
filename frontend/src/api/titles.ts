// =============================================================================
// Guttenberg Titles API
// CRUD operations and readiness helpers for the Title resource (FDD §2.1).
// =============================================================================

import client from './client';
import {
  Title,
  TitleListItem,
  PaginatedResponse,
  ChannelReadiness,
  ReadinessBreakdown,
} from './types';

/** Query parameters accepted by the title list endpoint. */
export interface TitleListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  genre?: string;
  ordering?: string;
}

/**
 * List titles for the authenticated user.
 * Returns a paginated response with lightweight title items.
 */
export const getTitles = async (
  params?: TitleListParams,
): Promise<PaginatedResponse<TitleListItem>> => {
  const { data } = await client.get<PaginatedResponse<TitleListItem>>(
    '/titles/',
    { params },
  );
  return data;
};

/**
 * Retrieve a single title with full detail (including nested formats and
 * readiness breakdown).
 */
export const getTitle = async (id: string): Promise<Title> => {
  const { data } = await client.get<Title>(`/titles/${id}/`);
  return data;
};

/**
 * Create a new title.
 */
export const createTitle = async (
  titleData: Partial<Title>,
): Promise<Title> => {
  const { data } = await client.post<Title>('/titles/', titleData);
  return data;
};

/**
 * Fully update an existing title.
 */
export const updateTitle = async (
  id: string,
  titleData: Partial<Title>,
): Promise<Title> => {
  const { data } = await client.put<Title>(`/titles/${id}/`, titleData);
  return data;
};

/**
 * Delete a title.
 */
export const deleteTitle = async (id: string): Promise<void> => {
  await client.delete(`/titles/${id}/`);
};

/**
 * Retrieve per-channel readiness checks for a title.
 * Returns an array with one entry per distribution channel indicating whether
 * the title meets that channel's submission requirements.
 */
export const getChannelReadiness = async (
  id: string,
): Promise<ChannelReadiness[]> => {
  const { data } = await client.get<ChannelReadiness[]>(
    `/titles/${id}/channel_readiness/`,
  );
  return data;
};

/**
 * Trigger a server-side recalculation of the title's composite readiness
 * score (refinery + metadata + preflight).
 */
export const recalculateReadiness = async (
  id: string,
): Promise<ReadinessBreakdown> => {
  const { data } = await client.post<ReadinessBreakdown>(
    `/titles/${id}/recalculate_readiness/`,
  );
  return data;
};
