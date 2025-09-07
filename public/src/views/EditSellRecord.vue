<template>
  <div class="edit-sell-record">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑卖出记录' : '新增卖出记录' }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
        class="sell-record-form"
      >
        <!-- 买入记录选择 -->
        <el-form-item label="买入记录" prop="buysId">
          <el-input
            v-model="selectedBuyRecord"
            placeholder="请选择买入记录"
            readonly
            @click="showBuyRecordSelector = true"
          >
            <template #append>
              <el-button @click="showBuyRecordSelector = true">
                选择
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 买入记录详情 -->
        <el-descriptions v-if="selectedBuyRecordDetails" title="买入记录详情" :column="2" border>
          <el-descriptions-item label="资产名称">
            {{ selectedBuyRecordDetails.assets?.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="买入价格">
            {{ formatNumber(selectedBuyRecordDetails.price, 3) }}
          </el-descriptions-item>
          <el-descriptions-item label="买入数量">
            {{ formatNumber(selectedBuyRecordDetails.amount, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="币种">
            {{ CURRENCY_MAP[selectedBuyRecordDetails.currencyId] }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 卖出时间 -->
        <el-form-item label="卖出时间" prop="sellTime">
          <el-date-picker
            v-model="form.sellTime"
            type="datetime"
            placeholder="选择卖出时间"
            @change="trackFieldChange('sellTime')"
          />
        </el-form-item>

        <!-- 卖出价格 -->
        <el-form-item label="卖出价格" prop="sellPrice">
          <el-input-number
            v-model="form.sellPrice"
            :precision="3"
            :step="0.001"
            :min="0"
            @change="trackFieldChange('sellPrice')"
          />
        </el-form-item>

        <!-- 卖出数量 -->
        <el-form-item label="卖出数量" prop="amount">
          <el-input-number
            v-model="form.amount"
            :precision="4"
            :step="0.0001"
            :min="0"
            @change="trackFieldChange('amount')"
          />
        </el-form-item>

        <!-- 手续费率 -->
        <el-form-item label="手续费率" prop="feeRate">
          <el-input-number
            v-model="form.feeRate"
            :precision="4"
            :step="0.0001"
            :min="0"
            @change="trackFieldChange('feeRate')"
          />
        </el-form-item>

        <!-- 手续费 -->
        <el-form-item label="手续费" prop="fee">
          <el-input-number
            v-model="form.fee"
            :precision="4"
            :step="0.0001"
            :min="0"
            @change="trackFieldChange('fee')"
          />
        </el-form-item>

        <!-- 分配类型 -->
        <el-form-item label="分配类型" prop="distributionType">
          <el-select 
            v-model="form.distributionType" 
            placeholder="选择分配类型"
            @change="trackFieldChange('distributionType')"
          >
            <el-option label="请选择" :value="0" />
            <el-option label="按比例分配" :value="1" />
            <el-option label="定向分配" :value="2" />
          </el-select>
        </el-form-item>

        <!-- 按比例分配 -->
        <template v-if="form.distributionType === 1">
          <el-form-item label="种果树比例">
            <el-input-number
              v-model="form.fruitRatio"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="钓鱼比例">
            <el-input-number
              v-model="form.fishingRatio"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="种菜比例">
            <el-input-number
              v-model="form.vegetableRatio"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="狩猎比例">
            <el-input-number
              v-model="form.huntingRatio"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="生态位比例">
            <el-input-number
              v-model="form.ecologyRatio"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="捡馅饼比例">
            <el-input-number
              v-model="form.pieRatio"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
        </template>

        <!-- 定向分配 -->
        <template v-if="form.distributionType === 2">
          <el-form-item label="分配目标" prop="directDistributionTarget">
            <el-radio-group v-model="directDistributionTarget" @change="handleDirectDistributionChange">
              <el-radio label="fruit">种果树</el-radio>
              <el-radio label="fishing">钓鱼</el-radio>
              <el-radio label="vegetable">种菜</el-radio>
              <el-radio label="hunting">狩猎</el-radio>
              <el-radio label="ecology">生态位</el-radio>
              <el-radio label="pie">捡馅饼</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit(formRef)"
          >
            {{ isEdit ? '保存修改' : '新增记录' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>

      <!-- 买入记录选择器对话框 -->
      <el-dialog
        v-model="showBuyRecordSelector"
        title="选择买入记录"
        width="80%"
        destroy-on-close
      >
        <buy-record-selector 
          :userid="targetUserId"
          @select="handleBuyRecordSelect" 
          @cancel="showBuyRecordSelector = false" 
        />
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import { createSellRecord, updateSellRecord, getDistribution } from '@/api/sells'
import type { CreateSellRecordRequest, UpdateSellRecordRequest, SellRecord } from '@/api/sells'
import BuyRecordSelector from '@/components/BuyRecordSelector.vue'
import request from '@/api/request'
import type { AxiosResponse } from 'axios'
import type { BuyRecord } from '../types'
import type { Asset } from '@/api/assets'

// 币种映射
const CURRENCY_MAP: Record<number, string> = {
  1: 'CNY',
  2: 'USD',
  3: 'EUR',
  4: 'GBP',
  5: 'JPY',
  6: 'USDT',
  7: 'USDC',
}

// 格式化数字
const formatNumber = (value: number | undefined | null, precision: number = 2): string => {
  if (value === undefined || value === null) return '-'
  return value.toFixed(precision)
}

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

interface Distribution {
  id: number;
  owner: number;
  name: string;
  desc: string;
  fishing: number;
  fruitTree: number;
  vegetable: number;
  hunting: number;
  ecology: number;
  pie: number;
  updatedAt: string;
  createdAt: string;
}

interface DistributionResponse {
  data: {
    distribution: Distribution;
    cash: Array<{
      strategy: number;
      cash: number;
    }>;
  };
  code: number;
  message: string;
  success: boolean;
  timestamp: number;
}

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const showBuyRecordSelector = ref(false)
const selectedBuyRecordDetails = ref<BuyRecord | null>(null)

// 添加修改字段跟踪
const modifiedFields = ref<Set<string>>(new Set())
const originalForm = ref<CreateSellRecordRequest>({} as CreateSellRecordRequest)

// 跟踪字段修改
const trackFieldChange = (fieldName: string) => {
  modifiedFields.value.add(fieldName)
}

// 从路由参数中获取用户ID
const userId = computed(() => Number(route.params.userId))
const recordId = computed(() => Number(route.params.id))
const isEdit = computed(() => Boolean(route.params.id))
const targetUserId = computed(() => {
  const id = route.params.userId;
  console.log('Route params userid:', route.params.userId);
  console.log('Selected userid:', id);
  return typeof id === 'string' ? parseInt(id, 10) : 0;
});

// 表单数据
const form = ref<CreateSellRecordRequest>({
  sellTime: '',
  assetId: 0,
  buysId: 0,
  currencyId: 0,
  exchangeRate: 0,
  sellPrice: 0,
  amount: 0,
  feeRate: 0,
  fee: 0,
  distributionType: 0, // 0: 请选择, 1: 按比例分配, 2: 定向分配
  distributionId: 0,
  fishingRatio: 0,
  fruitRatio: 0,
  vegetableRatio: 0,
  huntingRatio: 0,
  ecologyRatio: 0,
  pieRatio: 0
})

// 处理买入记录选择
const handleBuyRecordSelect = (record: BuyRecord) => {
  selectedBuyRecordDetails.value = record;
  form.value.buysId = record.id;
  form.value.assetId = record.assetId;
  form.value.currencyId = record.currencyId;
  form.value.exchangeRate = record.exchangeRate;
  showBuyRecordSelector.value = false;
};

// 计算选中的买入记录显示文本
const selectedBuyRecord = computed(() => {
  if (!selectedBuyRecordDetails.value) return '';
  return `${selectedBuyRecordDetails.value.assets?.name || '-'} - ${formatNumber(selectedBuyRecordDetails.value.price, 3)} ${CURRENCY_MAP[selectedBuyRecordDetails.value.currencyId]}`;
});

// 处理取消
const handleCancel = () => {
  // 返回卖出历史页面
  router.push({
    name: 'UserSellHistory',
    params: { userId: userId.value.toString() }
  })
}

// 提交表单
const handleSubmit = async (formEl: FormInstance | undefined) => {
  console.log('开始提交表单')
  if (!formEl) {
    console.log('formEl不存在')
    return
  }
  
  try {
    console.log('开始验证表单')
    const valid = await formEl.validate()
    console.log('表单验证结果:', valid)
    
    if (valid) {
      // 验证分配比例
      if (form.value.distributionType === 1 && !validateTotalRatio()) {
        ElMessage.error('所有比例之和必须等于100')
        return
      }

      try {
        submitting.value = true
        console.log('提交的表单数据:', form.value)
        
        if (route.params.id) {
          // 更新模式：只提交修改过的字段
          console.log('更新记录')
          
          // 基础数据（必填字段）
          const baseData = {
            id: Number(route.params.id),
            assetId: form.value.assetId,
            buysId: form.value.buysId,
            currencyId: form.value.currencyId
          }

          // 检查是否有修改
          if (modifiedFields.value.size === 0) {
            ElMessage.warning('您还没有做任何修改')
            return
          }

          // 只添加修改过的字段
          const updateData: any = { ...baseData }
          modifiedFields.value.forEach((field) => {
            if (field in form.value) {
              if (field === 'distributionType') {
                // 分配类型需要减1
                updateData[field] = form.value.distributionType - 1
              } else {
                updateData[field] = (form.value as any)[field]
              }
            }
          })

          console.log('更新数据:', updateData)
          console.log('修改的字段:', Array.from(modifiedFields.value))
          
          const response = await updateSellRecord(userId.value, updateData as UpdateSellRecordRequest)
          console.log('更新响应:', response)
          if (response.success) {
            ElMessage.success('更新成功')
            // 返回卖出历史页面
            router.push({
              name: 'UserSellHistory',
              params: { userId: userId.value.toString() }
            })
          } else {
            throw new Error(response.message)
          }
        } else {
          // 创建
          console.log('创建新记录')
          const response = await createSellRecord(userId.value, {
            ...form.value,
            distributionType: form.value.distributionType - 1 // 调整distributionType值
          })
          console.log('创建响应:', response)
          if (response.success) {
            ElMessage.success('创建成功')
            // 返回卖出历史页面
            router.push({
              name: 'UserSellHistory',
              params: { userId: userId.value.toString() }
            })
          } else {
            throw new Error(response.message)
          }
        }
      } catch (error: any) {
        console.error('操作失败:', error)
        console.error('错误详情:', error.response?.data)
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    } else {
      console.log('表单验证失败')
    }
  } catch (validationError) {
    console.error('表单验证出错:', validationError)
  }
}

// 初始化数据
onMounted(async () => {
  if (route.params.id) {
    // 从 sessionStorage 中获取记录数据
    const recordJson = sessionStorage.getItem('editSellRecord')
    const sellRecord = recordJson ? JSON.parse(recordJson) : undefined
    
    if (!sellRecord) {
      ElMessage.error('获取记录数据失败')
      handleCancel()
      return
    }
    
    console.log('从sessionStorage获取的记录数据:', sellRecord)
    
    try {
      // 填充表单数据
      Object.assign(form.value, {
        sellTime: sellRecord.sellTime,
        assetId: sellRecord.assetId,
        buysId: sellRecord.buysId,
        currencyId: sellRecord.currencyId,
        exchangeRate: sellRecord.exchangeRate,
        sellPrice: sellRecord.sellPrice,
        amount: sellRecord.amount,
        feeRate: sellRecord.feeRate || 0,
        fee: sellRecord.fee || 0,
        distributionType: (sellRecord.distributionType || 0) + 1,
        distributionId: sellRecord.distributionId || 0,
        vegetableRatio: sellRecord.vegetableRatio || 0,
        fruitRatio: sellRecord.fruitRatio || 0,
        fishingRatio: sellRecord.fishingRatio || 0,
        pieRatio: sellRecord.pieRatio || 0,
        huntingRatio: sellRecord.huntingRatio || 0,
        ecologyRatio: sellRecord.ecologyRatio || 0
      })

      // 保存原始表单数据用于比较
      originalForm.value = JSON.parse(JSON.stringify(form.value))
      
      // 清空修改字段跟踪
      modifiedFields.value.clear()

      // 如果是定向分配，需要设置定向分配目标
      if (form.value.distributionType === 2) {
        console.log('检测到定向分配，设置分配目标')
        console.log('各比例值:', {
          fruitRatio: sellRecord.fruitRatio,
          fishingRatio: sellRecord.fishingRatio,
          vegetableRatio: sellRecord.vegetableRatio,
          huntingRatio: sellRecord.huntingRatio,
          ecologyRatio: sellRecord.ecologyRatio,
          pieRatio: sellRecord.pieRatio
        })
        
        // 使用 nextTick 确保 DOM 更新后再设置值
        nextTick(() => {
          // 根据比例值确定定向分配目标（允许一定的误差）
          if (Math.abs((sellRecord.fruitRatio || 0) - 100) < 0.01) {
            directDistributionTarget.value = 'fruit'
            console.log('设置定向分配目标为: fruit')
          } else if (Math.abs((sellRecord.fishingRatio || 0) - 100) < 0.01) {
            directDistributionTarget.value = 'fishing'
            console.log('设置定向分配目标为: fishing')
          } else if (Math.abs((sellRecord.vegetableRatio || 0) - 100) < 0.01) {
            directDistributionTarget.value = 'vegetable'
            console.log('设置定向分配目标为: vegetable')
          } else if (Math.abs((sellRecord.huntingRatio || 0) - 100) < 0.01) {
            directDistributionTarget.value = 'hunting'
            console.log('设置定向分配目标为: hunting')
          } else if (Math.abs((sellRecord.ecologyRatio || 0) - 100) < 0.01) {
            directDistributionTarget.value = 'ecology'
            console.log('设置定向分配目标为: ecology')
          } else if (Math.abs((sellRecord.pieRatio || 0) - 100) < 0.01) {
            directDistributionTarget.value = 'pie'
            console.log('设置定向分配目标为: pie')
          } else {
            // 如果没有找到100%的比例，找最大的比例
            const ratios = [
              { key: 'fruit', value: sellRecord.fruitRatio || 0 },
              { key: 'fishing', value: sellRecord.fishingRatio || 0 },
              { key: 'vegetable', value: sellRecord.vegetableRatio || 0 },
              { key: 'hunting', value: sellRecord.huntingRatio || 0 },
              { key: 'ecology', value: sellRecord.ecologyRatio || 0 },
              { key: 'pie', value: sellRecord.pieRatio || 0 }
            ]
            const maxRatio = ratios.reduce((max, current) => current.value > max.value ? current : max)
            if (maxRatio.value > 0) {
              directDistributionTarget.value = maxRatio.key
              console.log('未找到100%的比例，设置最大比例为定向分配目标:', maxRatio.key, maxRatio.value)
            } else {
              console.log('未找到任何有效的比例，无法确定定向分配目标')
            }
          }
          
          console.log('最终设置的定向分配目标:', directDistributionTarget.value)
        })
      }

      // 如果有关联的买入记录，设置选中状态
      if (sellRecord.buys) {
        const buys = sellRecord.buys
        selectedBuyRecordDetails.value = {
          id: buys.id,
          assetId: buys.assetId,
          assets: buys.assets || sellRecord.assets, // 优先使用buys的assets，如果没有则使用sellRecord的assets
          userId: sellRecord.userId || 0,
          currencyId: buys.currencyId,
          exchangeRate: buys.exchangeRate,
          price: buys.price,
          amount: buys.amount,
          amountOri: buys.amount,
          buyTime: buys.buyTime || new Date().toISOString(),
          strategy: undefined
        }
      }
      
      console.log('表单数据初始化完成:', form.value)
      
      // 清除 sessionStorage 中的数据
      sessionStorage.removeItem('editSellRecord')
    } catch (error: any) {
      console.error('处理记录数据失败:', error)
      ElMessage.error('数据处理失败')
      handleCancel()
    }
  }
});

// 获取分配比例
const fetchDistribution = async () => {
  try {
    const response = await getDistribution(userId.value)
    console.log('API Response:', response)
    
    // 检查response是否有效
    if (!response || !response.data) {
      console.error('Invalid response:', response)
      throw new Error('获取分配比例失败: 无效的响应')
    }
    
    const { distribution } = response.data
    if (distribution) {
      console.log('Setting distribution values:', distribution)
      // 更新表单中的分配比例
      form.value.vegetableRatio = distribution.vegetable;
      form.value.fruitRatio = distribution.fruitTree;
      form.value.fishingRatio = distribution.fishing;
      form.value.pieRatio = distribution.pie;
      form.value.huntingRatio = distribution.hunting;
      form.value.ecologyRatio = distribution.ecology;
      
      // 保存分配策略ID
      form.value.distributionId = distribution.id;
      
      // 跟踪比例字段的变更
      trackFieldChange('vegetableRatio')
      trackFieldChange('fruitRatio')
      trackFieldChange('fishingRatio')
      trackFieldChange('pieRatio')
      trackFieldChange('huntingRatio')
      trackFieldChange('ecologyRatio')
      trackFieldChange('distributionId')
    } else {
      console.error('Distribution object is null or undefined')
      throw new Error('没有找到分配比例配置')
    }
  } catch (error: any) {
    console.error('获取分配比例失败，完整错误信息:', error)
    if (error.response) {
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response.data)
    }
    ElMessage.error(error.message || '获取分配比例失败')
  }
}

// 在script setup部分添加以下代码
const directDistributionTarget = ref('')

// 处理定向分配选择变化
const handleDirectDistributionChange = (value: string) => {
  console.log('选择定向分配目标:', value)
  // 重置所有比例为0
  form.value.vegetableRatio = 0
  form.value.fruitRatio = 0
  form.value.fishingRatio = 0
  form.value.pieRatio = 0
  form.value.huntingRatio = 0
  form.value.ecologyRatio = 0

  // 设置选中项的比例为100
  switch (value) {
    case 'fruit':
      form.value.fruitRatio = 100
      break
    case 'fishing':
      form.value.fishingRatio = 100
      break
    case 'vegetable':
      form.value.vegetableRatio = 100
      break
    case 'hunting':
      form.value.huntingRatio = 100
      break
    case 'ecology':
      form.value.ecologyRatio = 100
      break
    case 'pie':
      form.value.pieRatio = 100
      break
  }
  
  // 跟踪比例字段的变更
  trackFieldChange('vegetableRatio')
  trackFieldChange('fruitRatio')
  trackFieldChange('fishingRatio')
  trackFieldChange('pieRatio')
  trackFieldChange('huntingRatio')
  trackFieldChange('ecologyRatio')
}

// 监听分配类型变化
watch(() => form.value.distributionType, (newValue, oldValue) => {
  // 只在用户手动切换分配类型时才重置，避免初始化时清空
  if (oldValue !== undefined) {
    if (newValue === 1) { // 如果选择按比例分配
      directDistributionTarget.value = '' // 清空定向分配选择
      fetchDistribution()
    } else if (newValue === 2) { // 如果选择定向分配
      // 重置所有比例为0
      form.value.vegetableRatio = 0
      form.value.fruitRatio = 0
      form.value.fishingRatio = 0
      form.value.pieRatio = 0
      form.value.huntingRatio = 0
      form.value.ecologyRatio = 0
      directDistributionTarget.value = '' // 清空定向分配选择
    } else {
      // 重置所有比例为0
      form.value.vegetableRatio = 0
      form.value.fruitRatio = 0
      form.value.fishingRatio = 0
      form.value.pieRatio = 0
      form.value.huntingRatio = 0
      form.value.ecologyRatio = 0
      directDistributionTarget.value = '' // 清空定向分配选择
    }
  }
})

// 修改验证规则
const validateTotalRatio = () => {
  if (form.value.distributionType === 1) {
    const total = (form.value.vegetableRatio || 0) +
                 (form.value.fruitRatio || 0) +
                 (form.value.fishingRatio || 0) +
                 (form.value.pieRatio || 0) +
                 (form.value.huntingRatio || 0) +
                 (form.value.ecologyRatio || 0)
                 
    console.log('验证总和:', total)
    return Math.abs(total - 100) < 0.0001 // 总和应该是100
  } else if (form.value.distributionType === 2) {
    const total = (form.value.vegetableRatio || 0) +
                 (form.value.fruitRatio || 0) +
                 (form.value.fishingRatio || 0) +
                 (form.value.pieRatio || 0) +
                 (form.value.huntingRatio || 0) +
                 (form.value.ecologyRatio || 0)
    
    console.log('定向分配总和:', total)
    return Math.abs(total - 100) < 0.0001 && directDistributionTarget.value !== '' // 总和应该是100
  }
  return true
}

// 表单验证规则
const formRules = ref<FormRules>({
  sellTime: [
    { required: true, message: '请选择卖出时间', trigger: 'change' }
  ],
  buysId: [
    { required: true, message: '请选择买入记录', trigger: 'change' }
  ],
  currencyId: [
    { required: true, message: '请选择币种', trigger: 'change' }
  ],
  exchangeRate: [
    { required: true, message: '请输入汇率', trigger: 'blur' },
    { type: 'number', min: 0, message: '汇率必须大于等于0', trigger: 'blur' }
  ],
  sellPrice: [
    { required: true, message: '请输入卖出价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '卖出价格必须大于等于0', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '数量必须大于等于0', trigger: 'blur' }
  ],
  feeRate: [
    { required: true, message: '请输入手续费率', trigger: 'blur' },
    { type: 'number', min: 0, message: '手续费率必须大于等于0', trigger: 'blur' }
  ],
  fee: [
    { required: true, message: '请输入手续费', trigger: 'blur' },
    { type: 'number', min: 0, message: '手续费必须大于等于0', trigger: 'blur' }
  ],
  distributionType: [
    { required: true, message: '请选择分配类型', trigger: 'change' },
    { type: 'number', min: 1, message: '请选择分配类型', trigger: 'change' }
  ],
  distributionId: [
    { required: true, message: '请输入分配ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '分配ID必须大于等于1', trigger: 'blur' }
  ],
  fishingRatio: [{
    required: true,
    validator: (rule, value, callback) => {
      if (form.value.distributionType === 1) {
        if (value === undefined || value === null) {
          callback(new Error('请输入捕鱼比例'))
        } else if (value < 0 || value > 100) {
          callback(new Error('比例必须在0-100之间'))
        }
      }
      callback()
    },
    trigger: 'blur'
  }],
  fruitRatio: [{
    required: true,
    validator: (rule, value, callback) => {
      if (form.value.distributionType === 1) {
        if (value === undefined || value === null) {
          callback(new Error('请输入种果树比例'))
        } else if (value < 0 || value > 100) {
          callback(new Error('比例必须在0-100之间'))
        }
      }
      callback()
    },
    trigger: 'blur'
  }],
  vegetableRatio: [{
    required: true,
    validator: (rule, value, callback) => {
      if (form.value.distributionType === 1) {
        if (value === undefined || value === null) {
          callback(new Error('请输入种菜比例'))
        } else if (value < 0 || value > 100) {
          callback(new Error('比例必须在0-100之间'))
        }
      }
      callback()
    },
    trigger: 'blur'
  }],
  huntingRatio: [{
    required: true,
    validator: (rule, value, callback) => {
      if (form.value.distributionType === 1) {
        if (value === undefined || value === null) {
          callback(new Error('请输入狩猎比例'))
        } else if (value < 0 || value > 100) {
          callback(new Error('比例必须在0-100之间'))
        }
      }
      callback()
    },
    trigger: 'blur'
  }],
  ecologyRatio: [{
    required: true,
    validator: (rule, value, callback) => {
      if (form.value.distributionType === 1) {
        if (value === undefined || value === null) {
          callback(new Error('请输入生态比例'))
        } else if (value < 0 || value > 100) {
          callback(new Error('比例必须在0-100之间'))
        }
      }
      callback()
    },
    trigger: 'blur'
  }],
  pieRatio: [{
    required: true,
    validator: (rule, value, callback) => {
      if (form.value.distributionType === 1) {
        if (value === undefined || value === null) {
          callback(new Error('请输入派比例'))
        } else if (value < 0 || value > 100) {
          callback(new Error('比例必须在0-100之间'))
        }
      }
      callback()
    },
    trigger: 'blur'
  }]
})
</script>

<style scoped>
.edit-sell-record {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sell-record-form {
  margin-top: 20px;
}

:deep(.el-form-item__content) {
  flex-wrap: nowrap;
}

:deep(.el-input-number) {
  width: 180px;
}

:deep(.el-select) {
  width: 180px;
}

:deep(.el-date-picker) {
  width: 180px;
}
</style> 