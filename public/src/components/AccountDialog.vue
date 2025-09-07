<template>
  <el-dialog
    v-model="dialogVisible"
    :title="mode === 'select' ? '选择资金账户' : '新增资金账户'"
    width="600px"
    destroy-on-close
    @closed="handleClose"
  >
    <div v-if="mode === 'select'" class="account-list">
      <div class="header-actions">
        <el-button type="primary" @click="switchToCreate">
          <el-icon><Plus /></el-icon>
          新增账户
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="accounts"
        style="width: 100%"
        @row-click="handleSelect"
      >
        <el-table-column prop="name" label="账户名称" width="150" />
        <el-table-column prop="manager" label="管理人" width="120" />
        <el-table-column prop="desc" label="描述" show-overflow-tooltip />
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
          :formatter="(row: Account) => formatDate(row.createdAt)"
        />
      </el-table>

      <div v-if="!loading && accounts.length === 0" class="empty-state">
        <el-empty description="暂无账户数据" />
      </div>
    </div>

    <el-form
      v-else
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="account-form"
    >
      <el-form-item label="账户名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入账户名称"
        />
      </el-form-item>

      <el-form-item label="管理人" prop="manager">
        <el-input
          v-model="form.manager"
          placeholder="请输入管理人"
        />
      </el-form-item>

      <el-form-item label="描述" prop="desc">
        <el-input
          v-model="form.desc"
          type="textarea"
          :rows="3"
          placeholder="请输入账户描述（选填）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          v-if="mode === 'create'"
          type="primary"
          @click="handleCreate"
          :loading="submitting"
        >
          创建
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAccounts, createAccount } from '@/api/accounts'
import type { Account } from '@/api/accounts'

const emit = defineEmits<{
  (e: 'select', account: Account): void
  (e: 'close'): void
  (e: 'update:visible', value: boolean): void
}>()

const props = defineProps<{
  visible: boolean
  userid: number
}>()

const dialogVisible = ref(props.visible)
const mode = ref<'select' | 'create'>('select')
const loading = ref(false)
const submitting = ref(false)
const accounts = ref<Account[]>([])
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  manager: '',
  desc: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入账户名称', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请输入管理人', trigger: 'blur' }
  ],
  desc: [
    { max: 500, message: '描述不能超过500个字符', trigger: 'blur' }
  ]
}

// 监听visible属性变化
watch(() => props.visible, (newVal: boolean) => {
  dialogVisible.value = newVal
  if (newVal && mode.value === 'select') {
    fetchAccounts()
  }
})

// 监听对话框关闭
watch(dialogVisible, (newVal: boolean) => {
  if (!newVal) {
    emit('update:visible', false)
  }
})

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取账户列表
const fetchAccounts = async () => {
  try {
    loading.value = true
    const response = await getAccounts(props.userid)
    if (response.success) {
      accounts.value = response.data
    } else {
      ElMessage.error(response.message || '获取账户列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取账户列表失败')
  } finally {
    loading.value = false
  }
}

// 切换到创建模式
const switchToCreate = () => {
  mode.value = 'create'
}

// 处理账户选择
const handleSelect = (row: Account) => {
  emit('select', row)
  dialogVisible.value = false
}

// 处理创建账户
const handleCreate = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    const response = await createAccount(props.userid, form)
    if (response.success) {
      ElMessage.success('账户创建成功')
      mode.value = 'select'
      await fetchAccounts()
    } else {
      ElMessage.error(response.message || '创建账户失败')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '创建账户失败')
  } finally {
    submitting.value = false
  }
}

// 处理对话框关闭
const handleClose = () => {
  mode.value = 'select'
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

onMounted(() => {
  if (dialogVisible.value) {
    fetchAccounts()
  }
})
</script>

<style scoped>
.header-actions {
  margin-bottom: 20px;
}

.account-list {
  min-height: 300px;
}

.account-form {
  padding: 20px 0;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}
</style> 