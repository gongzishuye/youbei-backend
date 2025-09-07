<template>
  <div class="buy-record-selector">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索资产名称"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            搜索
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 买入记录列表 -->
    <el-table
      :data="buyRecords"
      style="width: 100%"
      height="400px"
      @row-click="handleRowClick"
    >
      <el-table-column prop="assets.name" label="资产名称" />
      <el-table-column prop="price" label="买入价格">
        <template #default="{ row }">
          {{ formatNumber(row.price, 3) }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="买入数量">
        <template #default="{ row }">
          {{ formatNumber(row.amount, 4) }}
        </template>
      </el-table-column>
      <el-table-column prop="currencyId" label="币种">
        <template #default="{ row }">
          {{ CURRENCY_MAP[row.currencyId] }}
        </template>
      </el-table-column>
      <el-table-column prop="buyTime" label="买入时间">
        <template #default="{ row }">
          {{ formatDate(row.buyTime) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button @click="$emit('cancel')">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { formatNumber, formatDate } from '../utils/format';
import { CURRENCY_MAP } from '../constants';
import { searchBuys } from '../api/buys';
import type { BuyRecord } from '../types';

const props = defineProps<{
  userid: number;
}>();

const emit = defineEmits(['select', 'cancel']);

const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const buyRecords = ref<BuyRecord[]>([]);

// 加载买入记录
const loadBuyRecords = async () => {
  try {
    const response = await searchBuys({
      userid: props.userid,
      query: searchQuery.value,
      page: currentPage.value,
    });

    if (response.success && response.data) {
      // 使用本地分页
      const allRecords = response.data;
      total.value = allRecords.length;
      
      // 计算当前页的数据
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      buyRecords.value = allRecords.slice(start, end);
    } else {
      ElMessage.error(response.message || '加载买入记录失败');
    }
  } catch (error) {
    console.error('加载买入记录失败:', error);
    ElMessage.error('加载买入记录失败');
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadBuyRecords();
};

// 处理分页
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadBuyRecords();
};

// 处理行点击
const handleRowClick = (row: BuyRecord) => {
  emit('select', row);
};

// 初始加载
onMounted(() => {
  loadBuyRecords();
});
</script>

<style scoped>
.buy-record-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-bar {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style> 