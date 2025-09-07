<template>
  <div class="buy-history">
    <router-view v-if="$route.name === 'EditBuyRecord' || $route.name === 'CreateBuyRecord'" />
    <el-card v-else>
      <template #header>
        <div class="card-header">
          <h3>买进历史</h3>
          <el-button type="primary" @click="handleCreate">新增记录</el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索..."
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
        :data="records"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column
          prop="buyTime"
          label="购买时间"
          width="180"
          :formatter="(row: BuyRecord) => formatDate(row.buyTime)"
        />
        <el-table-column
          prop="assets.name"
          label="资产名称"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column label="币种" width="100">
          <template #default="{ row }: { row: BuyRecord }">
            {{ CURRENCY_MAP[row.currencyId] || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          width="120"
          align="right"
          :formatter="(row: BuyRecord) => formatNumber(row.price, 3)"
        />
        <el-table-column
          prop="amountOri"
          label="原始数量"
          width="120"
          align="right"
          :formatter="(row: BuyRecord) => formatNumber(row.amountOri, 4)"
        />
        <el-table-column
          prop="amount"
          label="剩余数量"
          width="120"
          align="right"
          :formatter="(row: BuyRecord) => formatNumber(row.amount, 4)"
        />
        <el-table-column label="策略" width="100">
          <template #default="{ row }">
            {{ STRATEGY_OPTIONS.find(opt => opt.value === row.strategy)?.label || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="融资" width="80">
          <template #default="{ row }">
            <el-tag :type="row.financing ? 'warning' : 'success'">
              {{ row.financing ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click.stop="handleEdit(row)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && records.length === 0" class="empty-state">
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { searchBuys } from '@/api/buys'
import type { BuyRecord } from '@/api/buys'

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

// 策略选项
const STRATEGY_OPTIONS = [
  { label: '种菜', value: 1 },
  { label: '种果树', value: 2 },
  { label: '钓鱼', value: 3 },
  { label: '捡馅饼', value: 4 },
  { label: '狩猎', value: 5 },
  { label: '生态位', value: 6 }
]

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const records = ref<BuyRecord[]>([]) // 初始化为空数组
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 从路由参数中获取用户ID
const userId = computed(() => Number(route.params.userId))

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

// 格式化数字
const formatNumber = (value: number, precision: number) => {
  return value?.toFixed(precision) || '-'
}

// 获取历史记录
const fetchRecords = async () => {
  try {
    loading.value = true
    const response = await searchBuys({
      userid: userId.value,
      page: currentPage.value,
      query: searchQuery.value || undefined
    })

    if (response.success) {
      // 直接使用返回的数据数组
      records.value = response.data || []
      // 设置总数为数组长度
      total.value = response.data?.length || 0
      pageSize.value = 10 // 使用固定的页大小
    } else {
      records.value = []
      total.value = 0
      ElMessage.error(response.message || '获取历史记录失败')
    }
  } catch (error: any) {
    records.value = []
    total.value = 0
    ElMessage.error(error.response?.data?.message || '获取历史记录失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchRecords()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchRecords()
}

// 新增记录
const handleCreate = () => {
  router.push({
    name: 'CreateBuyRecord',
    params: { userId: userId.value }
  })
}

// 处理行点击
const handleRowClick = (row: BuyRecord) => {
  // 不再处理行点击事件
}

// 处理编辑
const handleEdit = (row: BuyRecord) => {
  // 只保留需要的字段，避免类型问题
  const cleanRecord = {
    id: row.id,
    buyTime: row.buyTime,
    assetId: row.assetId,
    currencyId: row.currencyId,
    exchangeRate: row.exchangeRate,
    price: row.price,
    amount: row.amount,
    amountOri: row.amountOri,
    strategy: row.strategy,
    totalPay: row.totalPay,
    feeRate: row.feeRate,
    fee: row.fee,
    accountId: row.accountId,
    financing: row.financing,
    financeRate: row.financeRate,
    dividendYield: row.dividendYield,
    desc: row.desc,
    assets: {
      id: row.assetId,
      name: row.assets?.name || ''
    }
  }
  
  // 将数据存储在 sessionStorage 中
  sessionStorage.setItem('editBuyRecord', JSON.stringify(cleanRecord))
  
  // 跳转到编辑页面
  router.push({
    name: 'EditBuyRecord',
    params: {
      userId: userId.value,
      id: row.id
    }
  })
}

// 监听路由变化
watch(
  () => route.name,
  (newRouteName) => {
    // 当从编辑页面返回到历史页面时，刷新数据
    if (newRouteName === 'UserBuyHistory') {
      fetchRecords()
    }
  }
)

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.buy-history {
  padding: 20px;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
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
</style> 