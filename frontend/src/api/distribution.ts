import client from './client';
import { Channel } from './types';

export const submitToChannel = (titleId: string, channel: string, listPrice: number) =>
  client.post<Channel>(`/titles/${titleId}/distribution`, { channel, listPrice });

export const withdrawFromChannel = (titleId: string, channel: string) =>
  client.delete(`/titles/${titleId}/distribution/${channel}`);

export const updateChannelPricing = (titleId: string, channel: string, listPrice: number) =>
  client.put<Channel>(`/titles/${titleId}/distribution/${channel}`, { listPrice });
