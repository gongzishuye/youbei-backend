import request from './request'

export interface CreateIncomeRequest {
  userId?: number
  incomeTime: string
  desc?: string
  currencyId: number
  exchangeRate: number
  amount: number
  distributionType: number // 0: 不分配, 1: 按比例分配
  distributionId?: number
  fishingRatio: number
  fruitRatio: number
  vegetableRatio: number
  huntingRatio: number
  ecologyRatio: number
  pieRatio: number
  itype?: string
}

export interface UpdateIncomeRequest extends CreateIncomeRequest {
  id: number
}

export interface IncomeRecord extends UpdateIncomeRequest {
  // 添加任何从服务器返回的额外字段
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
  success: boolean;
  timestamp: number;
}

// 获取收入历史记录
export const getIncomeHistory = (params: {
  userid: number
  page: number
  query?: string
}): Promise<ApiResponse<IncomeRecord[]>> => {
  return request.get('/history/incomes', { params })
}

// 创建收入记录
export const createIncomeRecord = (userid: number, data: CreateIncomeRequest): Promise<ApiResponse<IncomeRecord>> => {
  return request.post('/action/incomes', data, {
    params: { userid }
  })
}

// 更新收入记录
export const updateIncomeRecord = (userid: number, data: UpdateIncomeRequest): Promise<ApiResponse<IncomeRecord>> => {
  return request.post('/action/incomes/update', data, {
    params: { userid }
  })
} 