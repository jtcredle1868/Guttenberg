import client from './client';
import { AnalyticsData } from './types';

export const getAnalytics = (params?: {
  startDate?: string;
  endDate?: string;
  titleId?: string;
  format?: string;
  channel?: string;
}) => client.get<AnalyticsData>('/analytics', { params });
