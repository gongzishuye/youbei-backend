<template>
  <div class="create-buy-record">
    <el-card class="create-buy-record">
      <template #header>
        <div class="card-header">
          <span>{{ isEditMode ? '编辑买进记录' : '新增买进记录' }}</span>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="buy-record-form"
      >
        <el-form-item label="购买时间" prop="buyTime">
          <el-date-picker
            v-model="form.buyTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="() => handleFieldChange('buyTime')"
          />
        </el-form-item>

        <el-form-item label="资产" prop="assetId">
          <div class="asset-select">
            <el-input
              :model-value="selectedAsset?.name || ''"
              placeholder="请选择资产"
              readonly
              @click="() => assetDialogVisible = true"
            >
              <template #append>
                <el-button @click="() => assetDialogVisible = true">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </el-form-item>

        <el-form-item label="币种" prop="currencyId">
          <el-select
            v-model="form.currencyId"
            placeholder="请选择币种"
            @change="() => handleFieldChange('currencyId')"
          >
            <el-option
              v-for="(name, id) in CURRENCY_MAP"
              :key="id"
              :label="name"
              :value="Number(id)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="汇率" prop="exchangeRate">
          <el-input-number
            v-model="form.exchangeRate"
            :precision="4"
            :step="0.0001"
            :min="0"
            @change="() => handleFieldChange('exchangeRate')"
          />
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="form.price"
            :precision="3"
            :step="0.001"
            :min="0"
            @change="() => handleFieldChange('price')"
          />
        </el-form-item>

        <el-form-item label="数量" prop="amount">
          <el-input-number
            v-model="form.amount"
            :precision="4"
            :step="0.0001"
            :min="0"
            @change="() => handleFieldChange('amount')"
          />
        </el-form-item>

        <el-form-item label="原始数量" prop="amountOri">
          <el-input-number
            v-model="form.amountOri"
            :precision="4"
            :step="0.0001"
            :min="0"
            @change="() => handleFieldChange('amountOri')"
          />
        </el-form-item>

        <el-form-item label="策略" prop="strategy">
          <el-select
            v-model="form.strategy"
            placeholder="请选择策略"
            @change="() => handleFieldChange('strategy')"
          >
            <el-option
              v-for="option in STRATEGY_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="总支付" prop="totalPay">
          <el-input-number
            v-model="form.totalPay"
            :precision="2"
            :step="0.01"
            :min="0"
            @change="() => handleFieldChange('totalPay')"
          />
        </el-form-item>

        <el-form-item label="手续费率" prop="feeRate">
          <el-input-number
            v-model="form.feeRate"
            :precision="4"
            :step="0.0001"
            :min="0"
            @change="() => handleFieldChange('feeRate')"
          />
        </el-form-item>

        <el-form-item label="手续费" prop="fee">
          <el-input-number
            v-model="form.fee"
            :precision="2"
            :step="0.01"
            :min="0"
            @change="() => handleFieldChange('fee')"
          />
        </el-form-item>

        <el-form-item label="资金账户" prop="accountId">
          <div class="account-select">
            <el-input
              :model-value="selectedAccount?.name || ''"
              placeholder="请选择资金账户"
              readonly
              @click="() => accountDialogVisible = true"
            >
              <template #append>
                <el-button @click="() => accountDialogVisible = true">
                  选择账户
                </el-button>
              </template>
            </el-input>
          </div>
        </el-form-item>

        <el-form-item label="是否融资" prop="financing">
          <el-radio-group
            v-model="form.financing"
            @change="() => handleFieldChange('financing')"
          >
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="form.financing"
          label="融资利率"
          prop="financeRate"
        >
          <el-input-number
            v-model="form.financeRate"
            :precision="4"
            :step="0.0001"
            :min="0"
            @change="() => handleFieldChange('financeRate')"
          />
        </el-form-item>

        <el-form-item label="股息率" prop="dividendYield">
          <el-input-number
            v-model="form.dividendYield"
            :precision="4"
            :step="0.0001"
            :min="0"
            @change="() => handleFieldChange('dividendYield')"
          />
        </el-form-item>

        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
            @input="() => handleFieldChange('desc')"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
          >
            {{ isEditMode ? '保存修改' : '新增记录' }}
          </el-button>
          <el-button @click="() => router.push({
            name: 'UserBuyHistory',
            params: { userId: userId.value }
          })">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 资产选择弹窗 -->
    <el-dialog
      v-model="assetDialogVisible"
      title="选择品种"
      width="60%"
      destroy-on-close
    >
      <div class="dialog-search">
        <el-input
          v-model="assetSearchQuery"
          placeholder="搜索品种代码或名称"
          clearable
          @clear="handleAssetSearch"
          @keyup.enter="handleAssetSearch"
        >
          <template #append>
            <el-button @click="handleAssetSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <el-table
        v-loading="assetLoading"
        :data="assets"
        style="width: 100%"
        @row-click="handleAssetSelect"
      >
        <el-table-column prop="code" label="品种代码" width="150" />
        <el-table-column prop="name" label="品种名称" width="180" />
        <el-table-column label="类型" width="100">
          <template #default="scope">
            {{ ASSET_TYPE_MAP[scope.row.atype] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            {{ scope.row.category || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="当前价格" width="120" align="right">
          <template #default="scope">
            {{ scope.row.price >= 0 ? scope.row.price.toFixed(3) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="币种" width="80">
          <template #default="scope">
            {{ CURRENCY_MAP[scope.row.currency] || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!assetLoading && assets.length === 0" class="empty-state">
        <el-empty description="暂无数据" />
      </div>

      <div class="dialog-pagination">
        <el-pagination
          v-model:current-page="assetCurrentPage"
          :total="assetTotal"
          :page-size="10"
          background
          layout="prev, pager, next"
          @current-change="handleAssetPageChange"
        />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assetDialogVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
    
    <AccountDialog
      :visible="accountDialogVisible"
      :userid="userId"
      @update:visible="accountDialogVisible = $event"
      @select="handleAccountSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { searchAssets } from '@/api/assets'
import type { Asset } from '@/api/assets'
import AccountDialog from '@/components/AccountDialog.vue'
import type { Account } from '@/api/accounts'
import { createBuyRecord, updateBuyRecord } from '@/api/buys'
import type { CreateBuyRecordRequest, UpdateBuyRecordRequest, BuyRecord } from '@/api/buys'
import { getAccounts } from '@/api/accounts'

// 币种映射
const CURRENCY_MAP: Record<number, string> = {
  1: 'CNY',
  4: 'THB',
  7: 'USD'
}

// 资产类型映射
const ASSET_TYPE_MAP: Record<number, string> = {
  2: 'ETF',
  4: '数字货币',
  8: '外汇'
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
const formRef = ref<FormInstance>()

// 从路由参数中获取用户ID
const userId = computed(() => Number(route.params.userId))

// 判断是否为编辑模式
const isEditMode = computed(() => route.params.id !== undefined)
const recordId = computed(() => Number(route.params.id))

// 记录修改过的字段
const modifiedFields = ref<Set<string>>(new Set())

// 监听表单字段变化
const handleFieldChange = (field: string) => {
  modifiedFields.value.add(field)
}

// 资产选择相关
const assetDialogVisible = ref(false)
const assetSearchQuery = ref('')
const assetCurrentPage = ref(1)
const assetTotal = ref(0)
const assetLoading = ref(false)
const assets = ref<Asset[]>([])
const selectedAsset = ref<Asset>()

const form = reactive({
  buyTime: '',
  assetId: undefined as number | undefined,
  currencyId: undefined as number | undefined,
  exchangeRate: 1,
  price: 0,
  amount: 0,
  amountOri: undefined as number | undefined,
  strategy: undefined as number | undefined,
  totalPay: undefined as number | undefined,
  feeRate: undefined as number | undefined,
  fee: undefined as number | undefined,
  accountId: undefined as number | undefined,
  financing: false,
  financeRate: undefined as number | undefined,
  dividendYield: undefined as number | undefined,
  desc: ''
})

// 账户选择相关
const accountDialogVisible = ref(false)
const selectedAccount = ref<Account>()

const rules: FormRules = {
  buyTime: [
    { required: true, message: '请选择购买时间', trigger: 'change' }
  ],
  assetId: [
    { required: true, message: '请选择品种', trigger: 'change' }
  ],
  currencyId: [
    { required: true, message: '请选择币种', trigger: 'change' }
  ],
  exchangeRate: [
    { required: true, message: '请输入汇率', trigger: 'blur' },
    { type: 'number', min: 0, message: '汇率必须大于0', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入买进价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '买进价格必须大于0', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '数量必须大于0', trigger: 'blur' }
  ],
  strategy: [
    { required: true, message: '请选择策略', trigger: 'change' }
  ]
}

// 显示资产选择弹窗
const showAssetDialog = () => {
  assetDialogVisible.value = true
  assetCurrentPage.value = 1
  assetSearchQuery.value = ''
  fetchAssets()
}

// 获取资产列表
const fetchAssets = async () => {
  try {
    assetLoading.value = true
    const response = await searchAssets({
      query: assetSearchQuery.value,
      page: assetCurrentPage.value
    })
    if (response.success) {
      assets.value = response.data
    } else {
      ElMessage.error(response.message || '获取品种列表失败')
      assets.value = []
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取品种列表失败')
    assets.value = []
  } finally {
    assetLoading.value = false
  }
}

// 处理资产搜索
const handleAssetSearch = () => {
  assetCurrentPage.value = 1
  fetchAssets()
}

// 处理资产分页
const handleAssetPageChange = (page: number) => {
  assetCurrentPage.value = page
  fetchAssets()
}

// 处理资产选择
const handleAssetSelect = (asset: Asset) => {
  selectedAsset.value = asset
  form.assetId = asset.id
  form.currencyId = asset.currency
  assetDialogVisible.value = false
  handleFieldChange('assetId')
  handleFieldChange('currencyId')
}

// 处理账户选择
const handleAccountSelect = (account: Account) => {
  selectedAccount.value = account
  form.accountId = account.id
  accountDialogVisible.value = false
  handleFieldChange('accountId')
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 准备提交的数据
    const baseData = {
      ...form,
      assetId: selectedAsset.value?.id,
      accountId: selectedAccount.value?.id
    }
    
    if (isEditMode.value) {
      // 编辑模式：更新记录
      // 必填字段
      const updateData: UpdateBuyRecordRequest = {
        id: Number(route.params.id),
        assetId: baseData.assetId,
        currencyId: baseData.currencyId
      }

      // 只添加修改过的字段
      if (modifiedFields.value.size === 0) {
        ElMessage.warning('您还没有做任何修改')
        loading.value = false
        return
      }

      modifiedFields.value.forEach((field) => {
        if (field in baseData) {
          (updateData as any)[field] = (baseData as any)[field]
        }
      })

      console.log('更新数据:', updateData)
      const response = await updateBuyRecord(userId.value, updateData)
      
      if (response.success) {
        ElMessage.success('记录更新成功')
        // 返回到历史页面
        router.push({
          name: 'UserBuyHistory',
          params: { userId: userId.value }
        })
      } else {
        ElMessage.error(response.message || '更新失败')
      }
    } else {
      // 新增模式：创建记录
      if (!baseData.assetId) {
        ElMessage.error('请选择资产')
        return
      }
      
      const createData: CreateBuyRecordRequest = {
        buyTime: baseData.buyTime,
        assetId: baseData.assetId,
        currencyId: baseData.currencyId!,
        exchangeRate: baseData.exchangeRate,
        price: baseData.price,
        amount: baseData.amount,
        amountOri: baseData.amountOri,
        strategy: baseData.strategy!,
        totalPay: baseData.totalPay,
        feeRate: baseData.feeRate,
        fee: baseData.fee,
        accountId: baseData.accountId,
        financing: baseData.financing,
        financeRate: baseData.financeRate,
        dividendYield: baseData.dividendYield,
        desc: baseData.desc
      }
      
      const response = await createBuyRecord(userId.value, createData)
      
      if (response.success) {
        ElMessage.success('记录创建成功')
        // 返回到历史页面
        router.push({
          name: 'UserBuyHistory',
          params: { userId: userId.value }
        })
      } else {
        ElMessage.error(response.message || '创建失败')
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 加载记录详情
onMounted(async () => {
  if (isEditMode.value) {
    // 从 sessionStorage 中获取记录数据
    const recordJson = sessionStorage.getItem('editBuyRecord')
    const record = recordJson ? JSON.parse(recordJson) as BuyRecord : undefined
    
    if (!record) {
      ElMessage.error('获取记录数据失败')
      router.replace(`/dashboard/users/${userId.value}/buy-history`)
      return
    }
    
    // 填充表单数据
    Object.assign(form, record)
    
    // 如果有资产信息，设置选中的资产
    if (record.assetId) {
      selectedAsset.value = {
        id: record.assetId,
        name: record.assets?.name || '',
        currency: record.currencyId
      } as Asset
    }

    // 如果有账户ID，加载并设置账户信息
    if (record.accountId) {
      try {
        const response = await getAccounts(userId.value)
        if (response.success) {
          const account = response.data.find(acc => acc.id === record.accountId)
          if (account) {
            selectedAccount.value = account
          }
        }
      } catch (error) {
        console.error('加载账户信息失败:', error)
      }
    }

    // 清除 sessionStorage 中的数据
    sessionStorage.removeItem('editBuyRecord')
  }
})

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.create-buy-record {
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

.card-header h3 {
  margin: 0;
  color: #333;
}

.record-form {
  margin-top: 20px;
}

.stock-code-input {
  width: 220px;
}

:deep(.el-input-number) {
  width: 220px;
}

:deep(.el-date-picker) {
  width: 220px;
}

:deep(.el-select) {
  width: 220px;
}

.dialog-search {
  margin-bottom: 20px;
}

.dialog-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.account-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.account-select :deep(.el-input__wrapper) {
  cursor: pointer;
}
</style> 