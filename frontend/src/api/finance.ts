import client from './client';
import { RoyaltyBreakdown, Disbursement, SalesRecord } from './types';

export const getRoyaltyBreakdown = (price: number, channels?: string[]) =>
  client.post<RoyaltyBreakdown[]>('/finance/royalty-calculator', { price, channels });

export const getDisbursements = () =>
  client.get<Disbursement[]>('/finance/disbursements');

export const getSalesRecords = (params?: {
  titleId?: string;
  startDate?: string;
  endDate?: string;
}) => client.get<SalesRecord[]>('/finance/sales', { params });

export const getEarningsSummary = () =>
  client.get<{
    thisMonth: number;
    lastMonth: number;
    ytd: number;
    allTime: number;
  }>('/finance/earnings-summary');
