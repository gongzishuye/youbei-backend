import request from './request'

export interface CreateExpenseRequest {
  userId?: number
  expensesTime: string
  desc?: string
  category: string
  currencyId: number
  amount: number
  exchangeRate: number
  equRmb?: number
  deductedFrom: number // 0: 不扣除, 1: 扣除
  fishing: number
  furitTree: number
  vegetable: number
  hunting: number
  ecology: number
  pie: number
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {
  id: number
}

export interface ExpenseRecord extends UpdateExpenseRequest {
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

// 获取支出历史记录
export const getExpenseHistory = (params: {
  userid: number
  page: number
  query?: string
}): Promise<ApiResponse<ExpenseRecord[]>> => {
  return request.get('/history/expenses', { params })
}

// 创建支出记录
export const createExpenseRecord = (userid: number, data: CreateExpenseRequest): Promise<ApiResponse<ExpenseRecord>> => {
  return request.post('/action/expenses', data, {
    params: { userid }
  })
}

// 更新支出记录
export const updateExpenseRecord = (userid: number, data: UpdateExpenseRequest): Promise<ApiResponse<ExpenseRecord>> => {
  return request.post('/action/expenses/update', data, {
    params: { userid }
  })
} 