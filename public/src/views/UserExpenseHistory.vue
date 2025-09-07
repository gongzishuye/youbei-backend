<template>
  <div class="expense-history">
    <router-view v-if="$route.name === 'EditExpenseRecord' || $route.name === 'CreateExpenseRecord'" />
    <el-card v-else>
      <template #header>
        <div class="card-header">
          <h3>支出历史</h3>
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
      >
        <el-table-column
          prop="expensesTime"
          label="支出时间"
          width="180"
          :formatter="(row: ExpenseRecord) => formatDate(row.expensesTime)"
        />
        <el-table-column
          prop="category"
          label="类别"
          width="120"
        />
        <el-table-column label="币种" width="100">
          <template #default="{ row }: { row: ExpenseRecord }">
            {{ CURRENCY_MAP[row.currencyId] || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="amount"
          label="支出金额"
          width="120"
          align="right"
          :formatter="(row: ExpenseRecord) => formatNumber(row.amount, 2)"
        />
        <el-table-column
          prop="exchangeRate"
          label="汇率"
          width="100"
          align="right"
          :formatter="(row: ExpenseRecord) => formatNumber(row.exchangeRate, 4)"
        />
        <el-table-column label="扣除方式" width="120">
          <template #default="{ row }">
            <el-tag :type="row.deductedFrom === 0 ? 'info' : (row.deductedFrom === 1 ? 'success' : 'warning')">
              {{ row.deductedFrom === 0 ? '不扣除' : (row.deductedFrom === 1 ? '按比例扣除' : '定向扣除') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="策略分布" min-width="200">
          <template #default="{ row }">
            <el-tooltip
              effect="dark"
              placement="top"
            >
              <template #content>
                <div>钓鱼: {{ row.fishing }}%</div>
                <div>种果树: {{ row.furitTree }}%</div>
                <div>种菜: {{ row.vegetable }}%</div>
                <div>狩猎: {{ row.hunting }}%</div>
                <div>生态位: {{ row.ecology }}%</div>
                <div>捡馅饼: {{ row.pie }}%</div>
              </template>
              <div style="display: flex; align-items: center; gap: 4px;">
                <div v-if="row.fishing > 0" :style="{ width: row.fishing + '%', height: '20px', backgroundColor: '#409EFF' }"></div>
                <div v-if="row.furitTree > 0" :style="{ width: row.furitTree + '%', height: '20px', backgroundColor: '#67C23A' }"></div>
                <div v-if="row.vegetable > 0" :style="{ width: row.vegetable + '%', height: '20px', backgroundColor: '#E6A23C' }"></div>
                <div v-if="row.hunting > 0" :style="{ width: row.hunting + '%', height: '20px', backgroundColor: '#F56C6C' }"></div>
                <div v-if="row.ecology > 0" :style="{ width: row.ecology + '%', height: '20px', backgroundColor: '#909399' }"></div>
                <div v-if="row.pie > 0" :style="{ width: row.pie + '%', height: '20px', backgroundColor: '#FF9900' }"></div>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          prop="desc"
          label="描述"
          show-overflow-tooltip
        />
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
import { getExpenseHistory } from '@/api/expenses'
import type { ExpenseRecord } from '@/api/expenses'

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

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const records = ref<ExpenseRecord[]>([])
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
    const response = await getExpenseHistory({
      userid: userId.value,
      page: currentPage.value,
      query: searchQuery.value || undefined
    })

    if (response.success) {
      records.value = response.data || []
      total.value = response.data?.length || 0
      pageSize.value = 10
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
    name: 'CreateExpenseRecord',
    params: { userId: userId.value.toString() }
  });
};

// 处理编辑
const handleEdit = (row: ExpenseRecord) => {
  // 只保留需要的字段，避免类型问题
  const cleanRecord = {
    id: row.id,
    expensesTime: row.expensesTime,
    desc: row.desc,
    category: row.category,
    currencyId: row.currencyId,
    amount: row.amount,
    exchangeRate: row.exchangeRate,
    equRmb: row.equRmb,
    deductedFrom: row.deductedFrom,
    fishing: row.fishing,
    furitTree: row.furitTree,
    vegetable: row.vegetable,
    hunting: row.hunting,
    ecology: row.ecology,
    pie: row.pie,
    userId: row.userId
  }
  
  // 将数据存储在 sessionStorage 中
  sessionStorage.setItem('editExpenseRecord', JSON.stringify(cleanRecord))
  
  // 跳转到编辑页面
  router.push({
    name: 'EditExpenseRecord',
    params: {
      userId: userId.value.toString(),
      id: row.id.toString()
    }
  })
};

// 监听路由变化
watch(
  () => route.name,
  (newRouteName) => {
    // 当从编辑页面返回到历史页面时，刷新数据
    if (newRouteName === 'UserExpenseHistory') {
      fetchRecords()
    }
  }
)

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.expense-history {
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