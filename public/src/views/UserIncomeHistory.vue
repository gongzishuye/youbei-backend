<template>
  <div class="income-history">
    <router-view v-if="$route.name === 'EditIncomeRecord' || $route.name === 'CreateIncomeRecord'" />
    <el-card v-else>
      <template #header>
        <div class="card-header">
          <h3>收入历史</h3>
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
          prop="incomeTime"
          label="收入时间"
          width="180"
          :formatter="(row: IncomeRecord) => formatDate(row.incomeTime)"
        />
        <el-table-column label="币种" width="100">
          <template #default="{ row }: { row: IncomeRecord }">
            {{ CURRENCY_MAP[row.currencyId] || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="amount"
          label="收入金额"
          width="120"
          align="right"
          :formatter="(row: IncomeRecord) => formatNumber(row.amount, 2)"
        />
        <el-table-column
          prop="exchangeRate"
          label="汇率"
          width="100"
          align="right"
          :formatter="(row: IncomeRecord) => formatNumber(row.exchangeRate, 4)"
        />
        <el-table-column label="分配类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.distributionType === 0 ? 'info' : 'success'">
              {{ row.distributionType === 0 ? '不分配' : '按比例分配' }}
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
                <div>钓鱼: {{ row.fishingRatio }}%</div>
                <div>种果树: {{ row.fruitRatio }}%</div>
                <div>种菜: {{ row.vegetableRatio }}%</div>
                <div>狩猎: {{ row.huntingRatio }}%</div>
                <div>生态位: {{ row.ecologyRatio }}%</div>
                <div>捡馅饼: {{ row.pieRatio }}%</div>
              </template>
              <div style="display: flex; align-items: center; gap: 4px;">
                <div v-if="row.fishingRatio > 0" :style="{ width: row.fishingRatio + '%', height: '20px', backgroundColor: '#409EFF' }"></div>
                <div v-if="row.fruitRatio > 0" :style="{ width: row.fruitRatio + '%', height: '20px', backgroundColor: '#67C23A' }"></div>
                <div v-if="row.vegetableRatio > 0" :style="{ width: row.vegetableRatio + '%', height: '20px', backgroundColor: '#E6A23C' }"></div>
                <div v-if="row.huntingRatio > 0" :style="{ width: row.huntingRatio + '%', height: '20px', backgroundColor: '#F56C6C' }"></div>
                <div v-if="row.ecologyRatio > 0" :style="{ width: row.ecologyRatio + '%', height: '20px', backgroundColor: '#909399' }"></div>
                <div v-if="row.pieRatio > 0" :style="{ width: row.pieRatio + '%', height: '20px', backgroundColor: '#FF9900' }"></div>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          prop="itype"
          label="类型"
          width="120"
        />
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
import { getIncomeHistory } from '@/api/incomes'
import type { IncomeRecord } from '@/api/incomes'

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
const records = ref<IncomeRecord[]>([])
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
    const response = await getIncomeHistory({
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
    name: 'CreateIncomeRecord',
    params: { userId: userId.value.toString() }
  });
};

// 处理编辑
const handleEdit = (row: IncomeRecord) => {
  // 只保留需要的字段，避免类型问题
  const cleanRecord = {
    id: row.id,
    incomeTime: row.incomeTime,
    desc: row.desc,
    currencyId: row.currencyId,
    exchangeRate: row.exchangeRate,
    amount: row.amount,
    distributionType: row.distributionType,
    distributionId: row.distributionId,
    fishingRatio: row.fishingRatio,
    fruitRatio: row.fruitRatio,
    vegetableRatio: row.vegetableRatio,
    huntingRatio: row.huntingRatio,
    ecologyRatio: row.ecologyRatio,
    pieRatio: row.pieRatio,
    itype: row.itype,
    userId: row.userId
  }
  
  // 将数据存储在 sessionStorage 中
  sessionStorage.setItem('editIncomeRecord', JSON.stringify(cleanRecord))
  
  // 跳转到编辑页面
  router.push({
    name: 'EditIncomeRecord',
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
    if (newRouteName === 'UserIncomeHistory') {
      fetchRecords()
    }
  }
)

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.income-history {
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