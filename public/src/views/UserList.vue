<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>用户列表</h3>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户名"
              class="search-input"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          <el-button type="primary" @click="fetchUsers">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="users"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="name" label="用户名" width="120" />
        <el-table-column prop="mainUserid" label="主账号ID" width="80" />
        <el-table-column prop="isMainuser" label="是否主账号" width="80">
          <template #default="scope">
            {{ scope.row.isMainuser === 1 ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column label="买进" width="80">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="router.push(`/dashboard/users/${scope.row.id}/buy-history`)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="卖出" width="80">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="router.push(`/dashboard/users/${scope.row.id}/sell-history`)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="收入" width="80">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="router.push(`/dashboard/users/${scope.row.id}/income-history`)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="支出" width="80">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="router.push(`/dashboard/users/${scope.row.id}/expense-history`)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && users.length === 0" class="empty-state">
        <el-empty description="暂无用户数据" />
      </div>

      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :current-page="currentPage"
          :page-size="10"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAllUsers } from '@/api/users'
import type { User } from '@/types'
import { Search, Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const users = ref<User[]>([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const total = ref(0)

const handleSearch = async () => {
  currentPage.value = 1
  await fetchUsers()
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await fetchUsers()
}

const fetchUsers = async () => {
  try {
    loading.value = true
    const { users: userList, total: totalCount } = await getAllUsers({
      page: currentPage.value,
      query: searchQuery.value
    })
    
    users.value = userList.map(user => ({
      ...user,
      id: user.id || 0,
      name: user.name || '',
      level: user.level || 0,
      isMainuser: user.isMainuser || 0,
      nickname: user.nickname,
      phone: user.phone,
      createdAt: user.createdAt || '-',
      updatedAt: user.updatedAt || '-'
    }))
    total.value = totalCount
    
    ElMessage.success('用户列表加载成功')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取用户列表失败')
    users.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('组件已挂载')
  fetchUsers()
})

watch(users, (newValue) => {
  console.log('users数组已更新:', newValue)
}, { deep: true })
</script>

<style scoped>
.user-list {
  padding: 20px;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  width: 200px;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.empty-state {
  padding: 40px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 