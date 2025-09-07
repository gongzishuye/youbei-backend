<template>
  <div class="account-selector">
    <el-table
      v-loading="loading"
      :data="accounts"
      style="width: 100%"
      @row-click="handleSelect"
    >
      <el-table-column
        prop="name"
        label="账户名称"
        width="180"
      />
      <el-table-column
        prop="desc"
        label="描述"
        show-overflow-tooltip
      />
      <el-table-column
        prop="manager"
        label="管理人"
        width="120"
      />
    </el-table>

    <div v-if="!loading && accounts.length === 0" class="empty-state">
      <el-empty description="暂无数据" />
    </div>

    <div class="dialog-footer">
      <el-button @click="$emit('cancel')">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAccounts } from '@/api/accounts'
import type { Account } from '@/api/accounts'

const route = useRoute()
const loading = ref(false)
const accounts = ref<Account[]>([])

// 从路由参数中获取用户ID
const userId = computed(() => Number(route.params.userId))

// 获取账户列表
const fetchAccounts = async () => {
  try {
    loading.value = true
    const response = await getAccounts(userId.value)

    if (response.success) {
      accounts.value = response.data || []
    } else {
      accounts.value = []
      ElMessage.error(response.message || '获取账户列表失败')
    }
  } catch (error: any) {
    accounts.value = []
    ElMessage.error(error.response?.data?.message || '获取账户列表失败')
  } finally {
    loading.value = false
  }
}

// 处理选择
const handleSelect = (row: Account) => {
  emit('select', {
    id: row.id,
    name: row.name
  })
}

// 定义事件
const emit = defineEmits<{
  (e: 'select', account: { id: number; name: string }): void
  (e: 'cancel'): void
}>()

onMounted(() => {
  fetchAccounts()
})
</script>

<style scoped>
.account-selector {
  padding: 20px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}
</style> 