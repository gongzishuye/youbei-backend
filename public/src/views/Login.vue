<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>有贝后台管理系统</h2>
          <p>{{ activeTab === 'login' ? '管理员登录' : '修改密码' }}</p>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- 登录Tab -->
        <el-tab-pane label="管理员登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="80px"
            @submit.prevent="handleLogin"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                class="action-btn"
                :loading="loginLoading"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 修改密码Tab -->
        <el-tab-pane label="修改密码" name="changePassword">
          <el-form
            ref="changePasswordFormRef"
            :model="changePasswordForm"
            :rules="changePasswordRules"
            label-width="120px"
            @submit.prevent="handleChangePassword"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="changePasswordForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
              />
            </el-form-item>

            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="changePasswordForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="changePasswordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="changePasswordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleChangePassword"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="action-btn"
                :loading="changePasswordLoading"
                @click="handleChangePassword"
              >
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, ChangePasswordRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const loginFormRef = ref<FormInstance>()
const changePasswordFormRef = ref<FormInstance>()
const loginLoading = ref(false)
const changePasswordLoading = ref(false)

// 登录表单
const loginForm = reactive<LoginRequest>({
  username: '',
  password: ''
})

// 修改密码表单
const changePasswordForm = reactive({
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 登录验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 修改密码验证规则
const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
  if (value !== changePasswordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const changePasswordRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loginLoading.value = true
    
    const success = await authStore.loginAction(loginForm)
    if (success) {
      ElMessage.success('登录成功')
      router.push('/dashboard/users')
    } else {
      ElMessage.error('登录失败')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  } finally {
    loginLoading.value = false
  }
}

// 处理修改密码
const handleChangePassword = async () => {
  if (!changePasswordFormRef.value) return

  try {
    await changePasswordFormRef.value.validate()
    changePasswordLoading.value = true
    
    // 先登录验证身份
    await authStore.loginAction({
      username: changePasswordForm.username,
      password: changePasswordForm.oldPassword
    })
    
    // 修改密码
    await authStore.changePasswordAction({
      oldPassword: changePasswordForm.oldPassword,
      newPassword: changePasswordForm.newPassword
    })
    
    ElMessage.success('密码修改成功，请使用新密码登录')
    
    // 清空表单
    resetChangePasswordForm()
    
    // 切换到登录tab
    activeTab.value = 'login'
    
    // 退出登录状态
    authStore.logout()
    
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '密码修改失败')
  } finally {
    changePasswordLoading.value = false
  }
}

// 重置修改密码表单
const resetChangePasswordForm = () => {
  if (changePasswordFormRef.value) {
    changePasswordFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 450px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  color: #333;
  margin-bottom: 8px;
}

.card-header p {
  color: #666;
  font-size: 14px;
}

.login-tabs {
  padding: 0 20px 20px;
}

.action-btn {
  width: 100%;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

:deep(.el-tabs__content) {
  padding-top: 20px;
}
</style> 