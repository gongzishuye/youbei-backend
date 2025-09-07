import request from './request';
import type { BuyRecord } from '../types';

export type { BuyRecord };

export interface CreateBuyRecordRequest {
  userId?: number;
  assetId: number;
  price: number;
  amount: number;
  currencyId: number;
  exchangeRate: number;
  buyTime: string;
}

export interface UpdateBuyRecordRequest extends CreateBuyRecordRequest {
  id: number;
}

interface SearchBuysParams {
  userid: number;
  query?: string;
  page: number;
}

interface SearchBuysResponse {
  data: BuyRecord[];
  code: number;
  message: string;
  success: boolean;
  timestamp: number;
}

interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
  success: boolean;
  timestamp: number;
}

export const searchBuys = (params: SearchBuysParams): Promise<SearchBuysResponse> => {
  return request.get('/search/buys', { params });
};

// 创建买入记录
export const createBuyRecord = (userid: number, data: CreateBuyRecordRequest) => {
  return request.post<ApiResponse<BuyRecord>>('/action/buys', data, {
    params: { userid }
  });
};

// 更新买入记录
export const updateBuyRecord = (userid: number, data: UpdateBuyRecordRequest) => {
  return request.put<ApiResponse<BuyRecord>>('/action/buys/update', data, {
    params: { userid }
  });
}; 