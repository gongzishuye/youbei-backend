<template>
  <div class="asset-selector">
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索资产..."
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
    </div>

    <el-table
      v-loading="loading"
      :data="assets"
      style="width: 100%"
      @row-click="handleSelect"
    >
      <el-table-column
        prop="code"
        label="代码"
        width="120"
      />
      <el-table-column
        prop="name"
        label="名称"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column
        prop="price"
        label="价格"
        width="120"
        align="right"
        :formatter="(row: Asset) => formatNumber(row.price, 3)"
      />
      <el-table-column
        prop="category"
        label="类别"
        show-overflow-tooltip
      />
      <el-table-column label="市场" width="100">
        <template #default="{ row }">
          {{ MARKET_MAP[row.market] || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="币种" width="100">
        <template #default="{ row }">
          {{ CURRENCY_MAP[row.currency] || '-' }}
        </template>
      </el-table-column>
    </el-table>

    <div v-if="!loading && assets.length === 0" class="empty-state">
      <el-empty description="暂无数据" />
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :total="total"
        :page-size="pageSize"
        background
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <div class="dialog-footer">
      <el-button @click="$emit('cancel')">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { searchAssets } from '@/api/assets'
import type { Asset } from '@/api/assets'

// 市场映射
const MARKET_MAP: Record<number, string> = {
  1: 'A股',
  2: '港股',
  3: '美股',
  4: '数字货币',
  5: '期货',
  6: '其他'
}

// 币种映射
const CURRENCY_MAP: Record<number, string> = {
  1: 'CNY',
  2: 'USD',
  3: 'HKD',
  4: 'THB',
  5: 'EUR',
  6: 'USDT',
  7: 'USDC',
}

const loading = ref(false)
const assets = ref<Asset[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 格式化数字
const formatNumber = (value: number, precision: number) => {
  return value?.toFixed(precision) || '-'
}

// 获取资产列表
const fetchAssets = async () => {
  try {
    loading.value = true
    const response = await searchAssets({
      query: searchQuery.value || undefined,
      page: currentPage.value
    })

    if (response.success) {
      assets.value = response.data || []
      total.value = response.data?.length || 0
      pageSize.value = 10
    } else {
      assets.value = []
      total.value = 0
      ElMessage.error(response.message || '获取资产列表失败')
    }
  } catch (error: any) {
    assets.value = []
    total.value = 0
    ElMessage.error(error.response?.data?.message || '获取资产列表失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchAssets()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchAssets()
}

// 处理选择
const handleSelect = (row: Asset) => {
  emit('select', {
    id: row.id,
    name: row.name
  })
}

// 定义事件
const emit = defineEmits<{
  (e: 'select', asset: { id: number; name: string }): void
  (e: 'cancel'): void
}>()

onMounted(() => {
  fetchAssets()
})
</script>

<style scoped>
.asset-selector {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 300px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}
</style> 