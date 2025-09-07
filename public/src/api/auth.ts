import request from './request'
import type { LoginRequest, LoginResponse, ChangePasswordRequest } from '@/types'
import type { ApiResponse } from '@/types'

// 管理员登录
export const login = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return request.post('/login', data)
}

// 修改密码
export const changePassword = (data: ChangePasswordRequest): Promise<void> => {
  return request.post('/change', data)
}