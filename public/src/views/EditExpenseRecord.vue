<template>
  <div class="edit-expense-record">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>{{ isEditMode ? '编辑支出记录' : '新增支出记录' }}</h3>
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
        <el-form-item label="支出时间" prop="expensesTime">
          <el-date-picker
            v-model="form.expensesTime"
            type="datetime"
            placeholder="选择支出时间"
            style="width: 100%"
            @change="trackFieldChange('expensesTime')"
          />
        </el-form-item>

        <el-form-item label="类别" prop="category">
          <el-select
            v-model="form.category"
            placeholder="请选择支出类别"
            style="width: 100%"
            clearable
            @change="trackFieldChange('category')"
          >
            <el-option label="生活支出" value="生活支出" />
            <el-option label="投资支出" value="投资支出" />
            <el-option label="债务偿还支出" value="债务偿还支出" />
            <el-option label="其他支出" value="其他支出" />
          </el-select>
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

        <el-form-item label="支出金额" prop="amount">
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

        <el-form-item label="等值人民币" prop="equRmb">
          <el-input-number
            v-model="form.equRmb"
            :precision="2"
            :min="0"
            :step="0.01"
            style="width: 100%"
            @change="trackFieldChange('equRmb')"
          />
        </el-form-item>

        <!-- 扣除方式 -->
        <el-form-item label="扣除方式" prop="deductedFrom">
          <el-select 
            v-model="form.deductedFrom" 
            placeholder="选择扣除方式"
            @change="handleDeductedFromChange"
          >
            <el-option label="请选择" :value="0" />
            <el-option label="按比例扣除" :value="1" />
            <el-option label="定向扣除" :value="2" />
          </el-select>
        </el-form-item>

        <!-- 按比例扣除 -->
        <template v-if="form.deductedFrom === 1">
          <el-form-item label="种果树比例">
            <el-input-number
              v-model="form.furitTree"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="钓鱼比例">
            <el-input-number
              v-model="form.fishing"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="种菜比例">
            <el-input-number
              v-model="form.vegetable"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="狩猎比例">
            <el-input-number
              v-model="form.hunting"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="生态位比例">
            <el-input-number
              v-model="form.ecology"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
          <el-form-item label="捡馅饼比例">
            <el-input-number
              v-model="form.pie"
              :disabled="true"
              :precision="2"
              :step="0.0001"
            />
          </el-form-item>
        </template>

        <!-- 定向扣除 -->
        <template v-if="form.deductedFrom === 2">
          <el-form-item label="扣除目标" prop="directDeductionTarget">
            <el-radio-group v-model="directDeductionTarget" @change="handleDirectDeductionChange">
              <el-radio label="fruit">种果树</el-radio>
              <el-radio label="fishing">钓鱼</el-radio>
              <el-radio label="vegetable">种菜</el-radio>
              <el-radio label="hunting">狩猎</el-radio>
              <el-radio label="ecology">生态位</el-radio>
              <el-radio label="pie">捡馅饼</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

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
import { createExpenseRecord, updateExpenseRecord } from '@/api/expenses'
import type { CreateExpenseRequest, UpdateExpenseRequest } from '@/api/expenses'
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
  expensesTime: null as Date | null,
  desc: '',
  category: '',
  currencyId: null as number | null,
  amount: null as number | null,
  exchangeRate: null as number | null,
  equRmb: null as number | null,
  deductedFrom: 0,
  fishing: 0,
  furitTree: 0,
  vegetable: 0,
  hunting: 0,
  ecology: 0,
  pie: 0,
  userId: userId.value
})

// 字段变更追踪
const modifiedFields = ref<Set<string>>(new Set())
const originalForm = ref<any>({})
const directDeductionTarget = ref<string>('')

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
      form.fishing = distribution.fishing
      form.furitTree = distribution.fruitTree
      form.vegetable = distribution.vegetable
      form.hunting = distribution.hunting
      form.ecology = distribution.ecology
      form.pie = distribution.pie
      
      // 跟踪比例字段的变更
      trackFieldChange('fishing')
      trackFieldChange('furitTree')
      trackFieldChange('vegetable')
      trackFieldChange('hunting')
      trackFieldChange('ecology')
      trackFieldChange('pie')
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
  return form.fishing + form.furitTree + form.vegetable + 
         form.hunting + form.ecology + form.pie
})

// 表单验证规则
const rules: FormRules = {
  expensesTime: [
    { required: true, message: '请选择支出时间', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择支出类别', trigger: 'change' }
  ],
  currencyId: [
    { required: true, message: '请选择币种', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入支出金额', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === null || value === undefined) {
          callback(new Error('请输入支出金额'))
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
  deductedFrom: [
    { required: true, message: '请选择扣除方式', trigger: 'change' },
    { 
      validator: (rule, value, callback) => {
        if (value === null || value === undefined) {
          callback(new Error('请选择扣除方式'))
        } else if (![0, 1, 2].includes(value)) {
          callback(new Error('无效的扣除方式'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 处理扣除方式变化
const handleDeductedFromChange = (value: number) => {
  trackFieldChange('deductedFrom')
  if (value === 1) { // 按比例扣除
    fetchDistribution()
  } else if (value === 2) { // 定向扣除
    // 清空所有比例
    form.fishing = 0
    form.furitTree = 0
    form.vegetable = 0
    form.hunting = 0
    form.ecology = 0
    form.pie = 0
    
    // 添加比例字段到修改列表
    trackFieldChange('fishing')
    trackFieldChange('furitTree')
    trackFieldChange('vegetable')
    trackFieldChange('hunting')
    trackFieldChange('ecology')
    trackFieldChange('pie')
  } else {
    // 不扣除时，清空所有比例
    form.fishing = 0
    form.furitTree = 0
    form.vegetable = 0
    form.hunting = 0
    form.ecology = 0
    form.pie = 0
    
    // 添加比例字段到修改列表
    trackFieldChange('fishing')
    trackFieldChange('furitTree')
    trackFieldChange('vegetable')
    trackFieldChange('hunting')
    trackFieldChange('ecology')
    trackFieldChange('pie')
  }
}

// 处理定向扣除目标变化
const handleDirectDeductionChange = (target: string) => {
  // 清空所有比例
  form.fishing = 0
  form.furitTree = 0
  form.vegetable = 0
  form.hunting = 0
  form.ecology = 0
  form.pie = 0
  
  // 设置选中的策略为100%
  switch (target) {
    case 'fruit':
      form.furitTree = 100
      break
    case 'fishing':
      form.fishing = 100
      break
    case 'vegetable':
      form.vegetable = 100
      break
    case 'hunting':
      form.hunting = 100
      break
    case 'ecology':
      form.ecology = 100
      break
    case 'pie':
      form.pie = 100
      break
  }
  
  // 添加比例字段到修改列表
  trackFieldChange('fishing')
  trackFieldChange('furitTree')
  trackFieldChange('vegetable')
  trackFieldChange('hunting')
  trackFieldChange('ecology')
  trackFieldChange('pie')
}

// 检测定向扣除目标
const detectDirectDeductionTarget = () => {
  const ratios = [
    { key: 'fruit', value: form.furitTree },
    { key: 'fishing', value: form.fishing },
    { key: 'vegetable', value: form.vegetable },
    { key: 'hunting', value: form.hunting },
    { key: 'ecology', value: form.ecology },
    { key: 'pie', value: form.pie }
  ]
  
  // 找到接近100%的比例
  const target = ratios.find(ratio => Math.abs(ratio.value - 100) < 0.01)
  if (target) {
    directDeductionTarget.value = target.key
  }
}

// 初始化表单数据
const initializeForm = () => {
  if (isEditMode.value) {
    // 编辑模式：从 sessionStorage 获取数据
    const savedData = sessionStorage.getItem('editExpenseRecord')
    if (savedData) {
      try {
        const recordData = JSON.parse(savedData)
        
        // 填充表单数据
        Object.assign(form, {
          id: recordData.id,
          expensesTime: new Date(recordData.expensesTime),
          desc: recordData.desc || '',
          category: recordData.category || '',
          currencyId: recordData.currencyId,
          amount: recordData.amount,
          exchangeRate: recordData.exchangeRate,
          equRmb: recordData.equRmb,
          deductedFrom: recordData.deductedFrom,
          fishing: recordData.fishing,
          furitTree: recordData.furitTree,
          vegetable: recordData.vegetable,
          hunting: recordData.hunting,
          ecology: recordData.ecology,
          pie: recordData.pie,
          userId: recordData.userId || userId.value
        })
        
        // 保存原始数据用于对比
        originalForm.value = { ...form }
        
        // 如果是定向扣除，检测目标
        if (form.deductedFrom === 2) {
          nextTick(() => {
            detectDirectDeductionTarget()
          })
        }
        
        // 清理 sessionStorage
        sessionStorage.removeItem('editExpenseRecord')
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
    
    // 如果是按比例扣除，验证总比例
    if (form.deductedFrom === 1 && Math.abs(totalRatio.value - 100) > 0.01) {
      ElMessage.error('策略分布比例总和必须为100%')
      return
    }
    
    // 如果是定向扣除，验证是否选择了目标和总比例
    if (form.deductedFrom === 2) {
      if (!directDeductionTarget.value) {
        ElMessage.error('请选择定向扣除目标')
        return
      }
      if (Math.abs(totalRatio.value - 100) > 0.01) {
        ElMessage.error('策略分布比例总和必须为100%')
        return
      }
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
    const requestData: CreateExpenseRequest | UpdateExpenseRequest = {
      expensesTime: form.expensesTime?.toISOString() || '',
      desc: form.desc,
      category: form.category,
      currencyId: form.currencyId || 0,
      amount: form.amount || 0,
      exchangeRate: form.exchangeRate || 0,
      equRmb: form.equRmb || undefined,
      deductedFrom: form.deductedFrom,
      fishing: form.fishing,
      furitTree: form.furitTree,
      vegetable: form.vegetable,
      hunting: form.hunting,
      ecology: form.ecology,
      pie: form.pie,
      userId: form.userId
    }
    
    // 在编辑模式下，只发送修改的字段
    if (isEditMode.value) {
      const updateData: any = { id: form.id }
      
      // 只包含修改的字段
      if (modifiedFields.value.has('expensesTime')) updateData.expensesTime = requestData.expensesTime
      if (modifiedFields.value.has('desc')) updateData.desc = requestData.desc
      if (modifiedFields.value.has('category')) updateData.category = requestData.category
      if (modifiedFields.value.has('currencyId')) updateData.currencyId = requestData.currencyId
      if (modifiedFields.value.has('amount')) updateData.amount = requestData.amount
      if (modifiedFields.value.has('exchangeRate')) updateData.exchangeRate = requestData.exchangeRate
      if (modifiedFields.value.has('equRmb')) updateData.equRmb = requestData.equRmb
      if (modifiedFields.value.has('deductedFrom')) {
        updateData.deductedFrom = requestData.deductedFrom
        // 当扣除方式改变时，包含所有比例字段
        updateData.fishing = requestData.fishing
        updateData.furitTree = requestData.furitTree
        updateData.vegetable = requestData.vegetable
        updateData.hunting = requestData.hunting
        updateData.ecology = requestData.ecology
        updateData.pie = requestData.pie
      } else {
        // 只包含修改的比例字段
        if (modifiedFields.value.has('fishing')) updateData.fishing = requestData.fishing
        if (modifiedFields.value.has('furitTree')) updateData.furitTree = requestData.furitTree
        if (modifiedFields.value.has('vegetable')) updateData.vegetable = requestData.vegetable
        if (modifiedFields.value.has('hunting')) updateData.hunting = requestData.hunting
        if (modifiedFields.value.has('ecology')) updateData.ecology = requestData.ecology
        if (modifiedFields.value.has('pie')) updateData.pie = requestData.pie
      }
      
      await updateExpenseRecord(userId.value, updateData)
      ElMessage.success('支出记录更新成功')
    } else {
      await createExpenseRecord(userId.value, requestData)
      ElMessage.success('支出记录创建成功')
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
    name: 'UserExpenseHistory',
    params: { userId: userId.value.toString() }
  })
}

onMounted(async () => {
  await nextTick()
  initializeForm()
})
</script>

<style scoped>
.edit-expense-record {
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