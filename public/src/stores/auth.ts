import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginRequest, ChangePasswordRequest } from '@/types'
import { login, changePassword } from '@/api/auth'
import { useUserStore } from './user'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('admin_token') || '')
  const user = ref<User | null>(null)
  const isLoggedIn = ref<boolean>(!!token.value)
  const userStore = useUserStore()

  // 登录
  const loginAction = async (loginData: LoginRequest) => {
    try {
      const response = await login(loginData)
      console.log('response', response)
      if (response.data.status === 0 && response.data.bearer) {
        token.value = response.data.bearer
        isLoggedIn.value = true
        localStorage.setItem('admin_token', response.data.bearer)
        
        // 解析 JWT token 获取用户信息
        const decoded: any = jwtDecode(response.data.bearer)
        userStore.setUser(decoded.userid, decoded.username || '', response.data.bearer)
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // 修改密码
  const changePasswordAction = async (passwordData: ChangePasswordRequest) => {
    try {
      await changePassword(passwordData)
      return true
    } catch (error) {
      console.error('Change password failed:', error)
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('admin_token')
    userStore.clearUser()
  }

  return {
    token,
    user,
    isLoggedIn,
    loginAction,
    changePasswordAction,
    logout
  }
}) 