import client from './client';
import { ArcCampaign } from './types';

export const generateSynopsis = (titleId: string) =>
  client.post<{ synopsis: string }>(`/marketing/synopsis/${titleId}`);

export const getArcCampaigns = (titleId: string) =>
  client.get<ArcCampaign[]>(`/marketing/arc/${titleId}`);

export const createArcCampaign = (titleId: string, data: { name: string; expiresAt: string; codesTotal: number }) =>
  client.post<ArcCampaign>(`/marketing/arc/${titleId}`, data);

export const generatePressKit = (titleId: string) =>
  client.post<{ downloadUrl: string }>(`/marketing/press-kit/${titleId}`);

export const getLandingPage = (titleId: string) =>
  client.get<{ html: string; published: boolean }>(`/marketing/landing-page/${titleId}`);
