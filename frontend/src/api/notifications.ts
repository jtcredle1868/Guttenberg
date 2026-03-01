// =============================================================================
// Guttenberg Notifications API
// User notification management including read state and delivery preferences.
// =============================================================================

import client from './client';
import { Notification, PaginatedResponse } from './types';

/** Query parameters for listing notifications. */
export interface NotificationParams {
  page?: number;
  page_size?: number;
  is_read?: boolean;
  channel?: string;
}

/**
 * Retrieve a paginated list of notifications for the authenticated user.
 */
export const getNotifications = async (
  params?: NotificationParams,
): Promise<PaginatedResponse<Notification>> => {
  const { data } = await client.get<PaginatedResponse<Notification>>(
    '/notifications/',
    { params },
  );
  return data;
};

/**
 * Mark one or more notifications as read.
 *
 * @param ids - An array of notification IDs to mark as read.
 */
export const markRead = async (
  ids: string[],
): Promise<{ updated: number }> => {
  const { data } = await client.post<{ updated: number }>(
    '/notifications/mark-read/',
    { ids },
  );
  return data;
};

/**
 * Mark all unread notifications as read for the authenticated user.
 */
export const markAllRead = async (): Promise<{ updated: number }> => {
  const { data } = await client.post<{ updated: number }>(
    '/notifications/mark-all-read/',
  );
  return data;
};

/** User notification delivery preferences. */
export interface NotificationPreferences {
  email_enabled: boolean;
  email_digest: 'immediate' | 'daily' | 'weekly' | 'none';
  push_enabled: boolean;
  in_app_enabled: boolean;
  channels: {
    submission_updates: boolean;
    sales_alerts: boolean;
    review_notifications: boolean;
    system_announcements: boolean;
    marketing_tips: boolean;
  };
}

/**
 * Retrieve the current user's notification delivery preferences.
 */
export const getPreferences = async (): Promise<NotificationPreferences> => {
  const { data } = await client.get<NotificationPreferences>(
    '/notifications/preferences/',
  );
  return data;
};

/**
 * Update the current user's notification delivery preferences.
 *
 * @param preferencesData - Partial preferences object; only provided fields are updated.
 */
export const updatePreferences = async (
  preferencesData: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> => {
  const { data } = await client.put<NotificationPreferences>(
    '/notifications/preferences/',
    preferencesData,
  );
  return data;
};
