<template>
  <div class="edit-income-record">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>{{ isEditMode ? '编辑收入记录' : '新增收入记录' }}</h3>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="收入时间" prop="incomeTime">
          <el-date-picker
            v-model="form.incomeTime"
            type="datetime"
            placeholder="选择收入时间"
            style="width: 100%"
            @change="trackFieldChange('incomeTime')"
          />
        </el-form-item>

        <el-form-item label="币种" prop="currencyId">
          <el-select
            v-model="form.currencyId"
            placeholder="选择币种"
            style="width: 100%"
            clearable
            @change="trackFieldChange('currencyId')"
          >
            <el-option
              v-for="(label, value) in CURRENCY_MAP"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="收入金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :precision="2"
            :min="0"
            :step="0.01"
            style="width: 100%"
            @change="trackFieldChange('amount')"
          />
        </el-form-item>

        <el-form-item label="汇率" prop="exchangeRate">
          <el-input-number
            v-model="form.exchangeRate"
            :precision="4"
            :min="0"
            :step="0.0001"
            style="width: 100%"
            @change="trackFieldChange('exchangeRate')"
          />
        </el-form-item>

        <!-- 分配类型 -->
        <el-form-item label="分配类型" prop="distributionType">
          <el-select 
            v-model="form.distributionType" 
            placeholder="选择分配类型"
            @change="handleDistributionTypeChange"
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

        <el-form-item label="类型" prop="itype">
          <el-select
            v-model="form.itype"
            placeholder="请选择收入类型"
            style="width: 100%"
            clearable
            @change="trackFieldChange('itype')"
          >
            <el-option label="劳动收入" value="劳动收入" />
            <el-option label="投资收入" value="投资收入" />
            <el-option label="借贷收入" value="借贷收入" />
            <el-option label="其他收入" value="其他收入" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
            @change="trackFieldChange('desc')"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEditMode ? '更新' : '创建' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createIncomeRecord, updateIncomeRecord } from '@/api/incomes'
import type { CreateIncomeRequest, UpdateIncomeRequest } from '@/api/incomes'
import { getDistribution } from '@/api/sells'

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
const formRef = ref<FormInstance>()
const loading = ref(false)

// 获取用户ID
const userId = computed(() => Number(route.params.userId))

// 判断是否为编辑模式
const isEditMode = computed(() => !!route.params.id)

// 表单数据
const form = reactive({
  id: 0,
  incomeTime: null as Date | null,
  desc: '',
  currencyId: null as number | null,
  exchangeRate: null as number | null,
  amount: null as number | null,
  distributionType: 0,
  distributionId: undefined as number | undefined,
  fishingRatio: 0,
  fruitRatio: 0,
  vegetableRatio: 0,
  huntingRatio: 0,
  ecologyRatio: 0,
  pieRatio: 0,
  itype: '',
  userId: userId.value
})

// 字段变更追踪
const modifiedFields = ref<Set<string>>(new Set())
const originalForm = ref<any>({})

// 定向分配目标
const directDistributionTarget = ref('')

// 追踪字段变更
const trackFieldChange = (fieldName: string) => {
  modifiedFields.value.add(fieldName)
}

// 获取分配比例
const fetchDistribution = async () => {
  try {
    const response = await getDistribution(userId.value)
    
    if (response.success && response.data?.distribution) {
      const { distribution } = response.data
      // 更新表单中的分配比例
      form.fishingRatio = distribution.fishing
      form.fruitRatio = distribution.fruitTree
      form.vegetableRatio = distribution.vegetable
      form.huntingRatio = distribution.hunting
      form.ecologyRatio = distribution.ecology
      form.pieRatio = distribution.pie
      
      // 保存分配策略ID
      form.distributionId = distribution.id
      
      // 跟踪比例字段的变更
      trackFieldChange('fishingRatio')
      trackFieldChange('fruitRatio')
      trackFieldChange('vegetableRatio')
      trackFieldChange('huntingRatio')
      trackFieldChange('ecologyRatio')
      trackFieldChange('pieRatio')
      trackFieldChange('distributionId')
    } else {
      throw new Error('没有找到分配比例配置')
    }
  } catch (error: any) {
    console.error('获取分配比例失败:', error)
    ElMessage.error('获取分配比例失败')
  }
}

// 计算总比例（用于验证）
const totalRatio = computed(() => {
  return form.fishingRatio + form.fruitRatio + form.vegetableRatio + 
         form.huntingRatio + form.ecologyRatio + form.pieRatio
})

// 表单验证规则
const rules: FormRules = {
  incomeTime: [
    { required: true, message: '请选择收入时间', trigger: 'change' }
  ],
  currencyId: [
    { required: true, message: '请选择币种', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入收入金额', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === null || value === undefined) {
          callback(new Error('请输入收入金额'))
        } else if (value < 0) {
          callback(new Error('金额必须大于等于0'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  exchangeRate: [
    { required: true, message: '请输入汇率', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === null || value === undefined) {
          callback(new Error('请输入汇率'))
        } else if (value <= 0) {
          callback(new Error('汇率必须大于0'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  distributionType: [
    { required: true, message: '请选择分配类型', trigger: 'change' }
  ]
}

// 处理分配类型变化
const handleDistributionTypeChange = (value: number) => {
  trackFieldChange('distributionType')
  if (value === 1) { // 按比例分配
    directDistributionTarget.value = '' // 清空定向分配选择
    fetchDistribution()
  } else if (value === 2) { // 定向分配
    // 重置所有比例为0
    form.fishingRatio = 0
    form.fruitRatio = 0
    form.vegetableRatio = 0
    form.huntingRatio = 0
    form.ecologyRatio = 0
    form.pieRatio = 0
    directDistributionTarget.value = '' // 清空定向分配选择
    
    // 添加比例字段到修改列表
    trackFieldChange('fishingRatio')
    trackFieldChange('fruitRatio')
    trackFieldChange('vegetableRatio')
    trackFieldChange('huntingRatio')
    trackFieldChange('ecologyRatio')
    trackFieldChange('pieRatio')
  } else {
    // 不分配时，清空所有比例
    form.fishingRatio = 0
    form.fruitRatio = 0
    form.vegetableRatio = 0
    form.huntingRatio = 0
    form.ecologyRatio = 0
    form.pieRatio = 0
    directDistributionTarget.value = ''
    
    // 添加比例字段到修改列表
    trackFieldChange('fishingRatio')
    trackFieldChange('fruitRatio')
    trackFieldChange('vegetableRatio')
    trackFieldChange('huntingRatio')
    trackFieldChange('ecologyRatio')
    trackFieldChange('pieRatio')
  }
}

// 处理定向分配选择变化
const handleDirectDistributionChange = (value: string) => {
  console.log('选择定向分配目标:', value)
  // 重置所有比例为0
  form.fishingRatio = 0
  form.fruitRatio = 0
  form.vegetableRatio = 0
  form.huntingRatio = 0
  form.ecologyRatio = 0
  form.pieRatio = 0

  // 设置选中项的比例为100
  switch (value) {
    case 'fruit':
      form.fruitRatio = 100
      break
    case 'fishing':
      form.fishingRatio = 100
      break
    case 'vegetable':
      form.vegetableRatio = 100
      break
    case 'hunting':
      form.huntingRatio = 100
      break
    case 'ecology':
      form.ecologyRatio = 100
      break
    case 'pie':
      form.pieRatio = 100
      break
  }
  
  // 跟踪比例字段的变更
  trackFieldChange('fishingRatio')
  trackFieldChange('fruitRatio')
  trackFieldChange('vegetableRatio')
  trackFieldChange('huntingRatio')
  trackFieldChange('ecologyRatio')
  trackFieldChange('pieRatio')
}

// 初始化表单数据
const initializeForm = () => {
  if (isEditMode.value) {
    // 编辑模式：从 sessionStorage 获取数据
    const savedData = sessionStorage.getItem('editIncomeRecord')
    if (savedData) {
      try {
        const recordData = JSON.parse(savedData)
        
        // 填充表单数据
        Object.assign(form, {
          id: recordData.id,
          incomeTime: new Date(recordData.incomeTime),
          desc: recordData.desc || '',
          currencyId: recordData.currencyId,
          exchangeRate: recordData.exchangeRate,
          amount: recordData.amount,
          distributionType: recordData.distributionType,
          distributionId: recordData.distributionId,
          fishingRatio: recordData.fishingRatio,
          fruitRatio: recordData.fruitRatio,
          vegetableRatio: recordData.vegetableRatio,
          huntingRatio: recordData.huntingRatio,
          ecologyRatio: recordData.ecologyRatio,
          pieRatio: recordData.pieRatio,
          itype: recordData.itype || '',
          userId: recordData.userId || userId.value
        })
        
        // 保存原始数据用于对比
        originalForm.value = { ...form }
        
        // 如果是定向分配，需要设置定向分配目标
        if (form.distributionType === 2) {
          nextTick(() => {
            // 根据比例值确定定向分配目标（允许一定的误差）
            if (Math.abs((recordData.fruitRatio || 0) - 100) < 0.01) {
              directDistributionTarget.value = 'fruit'
            } else if (Math.abs((recordData.fishingRatio || 0) - 100) < 0.01) {
              directDistributionTarget.value = 'fishing'
            } else if (Math.abs((recordData.vegetableRatio || 0) - 100) < 0.01) {
              directDistributionTarget.value = 'vegetable'
            } else if (Math.abs((recordData.huntingRatio || 0) - 100) < 0.01) {
              directDistributionTarget.value = 'hunting'
            } else if (Math.abs((recordData.ecologyRatio || 0) - 100) < 0.01) {
              directDistributionTarget.value = 'ecology'
            } else if (Math.abs((recordData.pieRatio || 0) - 100) < 0.01) {
              directDistributionTarget.value = 'pie'
            } else {
              // 如果没有找到100%的比例，找最大的比例
              const ratios = [
                { key: 'fruit', value: recordData.fruitRatio || 0 },
                { key: 'fishing', value: recordData.fishingRatio || 0 },
                { key: 'vegetable', value: recordData.vegetableRatio || 0 },
                { key: 'hunting', value: recordData.huntingRatio || 0 },
                { key: 'ecology', value: recordData.ecologyRatio || 0 },
                { key: 'pie', value: recordData.pieRatio || 0 }
              ]
              const maxRatio = ratios.reduce((max, current) => current.value > max.value ? current : max)
              if (maxRatio.value > 0) {
                directDistributionTarget.value = maxRatio.key
              }
            }
          })
        }
        
        // 清理 sessionStorage
        sessionStorage.removeItem('editIncomeRecord')
      } catch (error) {
        console.error('解析编辑数据失败:', error)
        ElMessage.error('获取编辑数据失败')
        goBack()
      }
    } else {
      ElMessage.error('未找到编辑数据')
      goBack()
    }
  } else {
    // 新增模式：使用默认值
    originalForm.value = { ...form }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()
    
    // 如果是按比例分配或定向分配，验证总比例
    if ((form.distributionType === 1 || form.distributionType === 2) && Math.abs(totalRatio.value - 100) > 0.01) {
      ElMessage.error('策略分布比例总和必须为100%')
      return
    }
    
    // 在编辑模式下检查是否有修改
    if (isEditMode.value && modifiedFields.value.size === 0) {
      const result = await ElMessageBox.confirm(
        '您没有修改任何字段，确定要提交吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      if (result !== 'confirm') {
        return
      }
    }
    
    loading.value = true
    
    // 构建请求数据
    const requestData: CreateIncomeRequest | UpdateIncomeRequest = {
      incomeTime: form.incomeTime?.toISOString() || '',
      desc: form.desc,
      currencyId: form.currencyId || 0,
      exchangeRate: form.exchangeRate || 0,
      amount: form.amount || 0,
      distributionType: form.distributionType,
      distributionId: form.distributionId,
      fishingRatio: form.fishingRatio,
      fruitRatio: form.fruitRatio,
      vegetableRatio: form.vegetableRatio,
      huntingRatio: form.huntingRatio,
      ecologyRatio: form.ecologyRatio,
      pieRatio: form.pieRatio,
      itype: form.itype,
      userId: form.userId
    }
    
    // 在编辑模式下，只发送修改的字段
    if (isEditMode.value) {
      const updateData: any = { id: form.id }
      
      // 只包含修改的字段
      if (modifiedFields.value.has('incomeTime')) updateData.incomeTime = requestData.incomeTime
      if (modifiedFields.value.has('desc')) updateData.desc = requestData.desc
      if (modifiedFields.value.has('currencyId')) updateData.currencyId = requestData.currencyId
      if (modifiedFields.value.has('exchangeRate')) updateData.exchangeRate = requestData.exchangeRate
      if (modifiedFields.value.has('amount')) updateData.amount = requestData.amount
      if (modifiedFields.value.has('distributionType')) {
        updateData.distributionType = requestData.distributionType
        // 当分配类型改变时，包含所有比例字段
        updateData.fishingRatio = requestData.fishingRatio
        updateData.fruitRatio = requestData.fruitRatio
        updateData.vegetableRatio = requestData.vegetableRatio
        updateData.huntingRatio = requestData.huntingRatio
        updateData.ecologyRatio = requestData.ecologyRatio
        updateData.pieRatio = requestData.pieRatio
      } else {
        // 只包含修改的比例字段
        if (modifiedFields.value.has('fishingRatio')) updateData.fishingRatio = requestData.fishingRatio
        if (modifiedFields.value.has('fruitRatio')) updateData.fruitRatio = requestData.fruitRatio
        if (modifiedFields.value.has('vegetableRatio')) updateData.vegetableRatio = requestData.vegetableRatio
        if (modifiedFields.value.has('huntingRatio')) updateData.huntingRatio = requestData.huntingRatio
        if (modifiedFields.value.has('ecologyRatio')) updateData.ecologyRatio = requestData.ecologyRatio
        if (modifiedFields.value.has('pieRatio')) updateData.pieRatio = requestData.pieRatio
      }
      if (modifiedFields.value.has('distributionId')) updateData.distributionId = requestData.distributionId
      if (modifiedFields.value.has('itype')) updateData.itype = requestData.itype
      
      await updateIncomeRecord(userId.value, updateData)
      ElMessage.success('收入记录更新成功')
    } else {
      await createIncomeRecord(userId.value, requestData)
      ElMessage.success('收入记录创建成功')
    }
    
    // 返回历史页面
    goBack()
  } catch (error: any) {
    console.error('提交失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push({
    name: 'UserIncomeHistory',
    params: { userId: userId.value.toString() }
  })
}

onMounted(async () => {
  await nextTick()
  initializeForm()
})
</script>

<style scoped>
.edit-income-record {
  padding: 20px;
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


</style> 