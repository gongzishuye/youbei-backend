import request from './request'
import type { Asset } from './assets'

export interface CreateSellRecordRequest {
  userId?: number
  assetId: number
  buysId: number
  sellTime: string
  currencyId: number
  exchangeRate: number
  amount: number
  sellPrice: number
  amountLeft?: number
  pnl?: number
  feeRate?: number
  fee?: number
  distributionType: number // 0: 不分配, 1: 按比例分配
  distributionId?: number
  fishingRatio: number
  fruitRatio: number
  vegetableRatio: number
  huntingRatio: number
  ecologyRatio: number
  pieRatio: number
}

export interface UpdateSellRecordRequest extends CreateSellRecordRequest {
  id: number
}

export interface SellRecord extends UpdateSellRecordRequest {
  // 添加任何从服务器返回的额外字段
  createdAt?: string
  updatedAt?: string
  assets?: Asset
  buys?: {
    id: number
    assetId: number
    assets: Asset
    price: number
    amount: number
    currencyId: number
    exchangeRate: number
    buyTime?: string
  }
}

export interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
  success: boolean;
  timestamp: number;
}

// 获取卖出历史记录
export const getSellHistory = (params: {
  userid: number
  page: number
  query?: string
}): Promise<ApiResponse<SellRecord[]>> => {
  return request.get('/history/sells', { params })
}

// 创建卖出记录
export const createSellRecord = (userid: number, data: CreateSellRecordRequest): Promise<ApiResponse<SellRecord>> => {
  return request.post('/action/sells', data, {
    params: { userid }
  })
}

// 更新卖出记录
export const updateSellRecord = (userid: number, data: UpdateSellRecordRequest): Promise<ApiResponse<SellRecord>> => {
  return request.post('/action/sells/update', data, {
    params: { userid }
  })
}

// 获取卖出记录详情
export const getSellRecord = (id: number, userid: number): Promise<ApiResponse<SellRecord>> => {
  return request.get(`/action/sells/${id}`, {
    params: { userid }
  })
}

interface Distribution {
  id: number;
  owner: number;
  name: string;
  desc: string;
  fishing: number;
  fruitTree: number;
  vegetable: number;
  hunting: number;
  ecology: number;
  pie: number;
  updatedAt: string;
  createdAt: string;
}

interface DistributionResponse {
  data: {
    distribution: Distribution;
    cash: Array<{
      strategy: number;
      cash: number;
    }>;
  };
  code: number;
  message: string;
  success: boolean;
  timestamp: number;
}

export const getDistribution = (userid: number): Promise<DistributionResponse> => {
  return request.get('/distributions', { params: { userid } })
}