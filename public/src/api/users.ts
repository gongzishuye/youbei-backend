import request from './request'
import type { User } from '@/types'

interface GetUsersResponse {
  users: User[]
  total: number
}

interface GetUsersParams {
  page?: number
  query?: string
}

// 获取所有用户
export const getAllUsers = (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
  return request.get('/users', { params }).then(res => res.data)
} 