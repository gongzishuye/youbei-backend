import request from './request'

export interface Account {
  id: number
  name: string
  desc: string
  manager: string
  createdAt: string
  updatedAt: string
}

export interface CreateAccountRequest {
  name: string
  desc: string
  manager: string
}

// 获取用户账户列表
export const getAccounts = (userid: number): Promise<{
  data: Account[]
  code: number
  message: string
  success: boolean
}> => {
  return request.get('/assets/accounts', {
    params: { userid }
  })
}

// 创建新账户
export const createAccount = (
  userid: number,
  data: CreateAccountRequest
): Promise<{
  data: Account
  code: number
  message: string
  success: boolean
}> => {
  return request.post('/assets/accounts', data, {
    params: { userid }
  })
} 