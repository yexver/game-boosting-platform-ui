<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI智能定价"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="price-recommend-container">
      <!-- 表单区域 -->
      <div class="form-section" v-if="!recommendResult">
        <div class="section-title">填写订单信息</div>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
        >
          <el-form-item label="游戏名称" prop="gameName">
            <el-input
              v-model="formData.gameName"
              placeholder="如：王者荣耀、原神"
              clearable
            />
          </el-form-item>

          <el-form-item label="订单标题" prop="title">
            <el-input
              v-model="formData.title"
              placeholder="简单描述需求，如：钻石上王者"
              clearable
            />
          </el-form-item>

          <el-form-item label="订单描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="详细描述需求，如：要求走平台、有体验服..."
              clearable
            />
          </el-form-item>

          <el-form-item label="代练类型" prop="boostingType">
            <el-select v-model="formData.boostingType" placeholder="请选择" style="width: 100%">
              <el-option :value="1" label="代练" />
              <el-option :value="2" label="陪练" />
            </el-select>
          </el-form-item>

          <el-form-item label="时限要求" prop="timeLimit">
            <el-input-number
              v-model="formData.timeLimit"
              :min="1"
              :max="720"
              style="width: 100%"
            />
            <span class="input-suffix">小时</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 加载状态 -->
      <div class="loading-section" v-if="loading">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <div class="loading-text">AI正在分析价格...</div>
      </div>

      <!-- 结果展示 -->
      <div class="result-section" v-if="recommendResult && !loading">
        <div class="section-title">价格建议结果</div>

        <!-- 价格卡片 -->
        <div class="price-cards">
          <div class="price-card min-price">
            <div class="price-label">最低价</div>
            <div class="price-value">¥{{ recommendResult.minPrice || 0 }}</div>
            <div class="price-desc">成本价</div>
          </div>

          <div class="price-card recommended">
            <div class="price-label">推荐价</div>
            <div class="price-value highlight">¥{{ recommendResult.recommendedPrice || 0 }}</div>
            <div class="price-desc">性价比最优</div>
          </div>

          <div class="price-card max-price">
            <div class="price-label">最高价</div>
            <div class="price-value">¥{{ recommendResult.maxPrice || 0 }}</div>
            <div class="price-desc">市场价</div>
          </div>
        </div>

        <!-- 保证金建议 -->
        <div class="deposit-info">
          <div class="deposit-item">
            <span class="deposit-label">建议安全保证金：</span>
            <span class="deposit-value">¥{{ recommendResult.securityDeposit || 0 }}</span>
          </div>
          <div class="deposit-item">
            <span class="deposit-label">建议效率保证金：</span>
            <span class="deposit-value">¥{{ recommendResult.efficiencyDeposit || 0 }}</span>
          </div>
        </div>

        <!-- 市场参考 -->
        <div class="market-info" v-if="recommendResult.marketAvgPrice">
          <div class="market-label">市场参考均价：¥{{ recommendResult.marketAvgPrice }}</div>
        </div>

        <!-- 影响因素 -->
        <div class="factors-section" v-if="recommendResult.priceFactors?.length">
          <div class="factors-title">价格影响因素：</div>
          <ul class="factors-list">
            <li v-for="(factor, index) in recommendResult.priceFactors" :key="index">
              {{ factor }}
            </li>
          </ul>
        </div>

        <!-- AI分析 -->
        <div class="analysis-section" v-if="recommendResult.analysis">
          <div class="analysis-title">AI分析：</div>
          <div class="analysis-content">{{ recommendResult.analysis }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="!recommendResult" type="primary" @click="handleRecommend" :loading="loading">
          获取建议
        </el-button>
        <el-button v-else type="primary" @click="handleApply">
          一键应用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { getPriceRecommend } from '@/api/recommend/recommend'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // 外部传入的初始数据
  initialData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'apply'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const recommendResult = ref(null)

const formData = ref({
  gameName: '',
  title: '',
  description: '',
  boostingType: 1,
  timeLimit: 48,
})

const formRules = {
  gameName: [{ required: true, message: '请输入游戏名称', trigger: 'blur' }],
  title: [{ required: true, message: '请输入订单标题', trigger: 'blur' }],
  boostingType: [{ required: true, message: '请选择代练类型', trigger: 'change' }],
  timeLimit: [{ required: true, message: '请输入时限', trigger: 'blur' }],
}

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
    if (val) {
      // 从初始数据填充
      if (props.initialData.gameName) {
        formData.value.gameName = props.initialData.gameName
      }
      if (props.initialData.title) {
        formData.value.title = props.initialData.title
      }
      if (props.initialData.description) {
        formData.value.description = props.initialData.description
      }
      if (props.initialData.boostingType) {
        formData.value.boostingType = props.initialData.boostingType
      }
      if (props.initialData.timeLimit) {
        formData.value.timeLimit = props.initialData.timeLimit
      }
    } else {
      // 关闭时重置
      recommendResult.value = null
    }
  }
)

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleRecommend = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const result = await getPriceRecommend({
      ...formData.value,
      userId: props.initialData.userId,
    })

    if (result.code === 200) {
      recommendResult.value = result.data
    } else {
      ElMessage.error(result.msg || '获取建议失败')
    }
  } catch (error) {
    console.error('验证失败', error)
  } finally {
    loading.value = false
  }
}

const handleApply = () => {
  if (recommendResult.value) {
    emit('apply', {
      price: recommendResult.value.recommendedPrice,
      securityDeposit: recommendResult.value.securityDeposit,
      efficiencyDeposit: recommendResult.value.efficiencyDeposit,
    })
    handleClose()
  }
}

const handleClose = () => {
  dialogVisible.value = false
  recommendResult.value = null
  formRef.value?.resetFields()
}
</script>

<style scoped>
.price-recommend-container {
  min-height: 300px;
}

.form-section,
.result-section {
  padding: 10px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-icon {
  font-size: 40px;
  color: #409eff;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

.price-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.price-card {
  flex: 1;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}

.price-card.recommended {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.price-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.price-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.price-card.recommended .price-label {
  color: rgba(255, 255, 255, 0.9);
}

.price-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.price-value.highlight {
  color: #fff;
}

.price-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.price-card.recommended .price-desc {
  color: rgba(255, 255, 255, 0.8);
}

.deposit-info {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.deposit-item {
  display: flex;
  align-items: center;
}

.deposit-label {
  color: #666;
  font-size: 14px;
}

.deposit-value {
  color: #409eff;
  font-weight: 600;
  font-size: 16px;
  margin-left: 8px;
}

.market-info {
  text-align: center;
  margin-bottom: 16px;
}

.market-label {
  color: #999;
  font-size: 13px;
}

.factors-section,
.analysis-section {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.factors-title,
.analysis-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.factors-list {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.analysis-content {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.input-suffix {
  margin-left: 8px;
  color: #999;
}

.dialog-footer {
  text-align: center;
}
</style>
