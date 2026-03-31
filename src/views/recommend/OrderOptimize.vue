<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI订单优化"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="order-optimize-container">
      <!-- 加载状态 -->
      <div class="loading-section" v-if="loading">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <div class="loading-text">AI正在优化订单...</div>
      </div>

      <!-- 结果展示 -->
      <div class="result-section" v-if="optimizeResult && !loading">
        <!-- 优化对比 -->
        <div class="compare-section">
          <div class="compare-title">优化对比</div>

          <div class="compare-row">
            <div class="compare-item">
              <div class="compare-label">原标题</div>
              <div class="compare-old">{{ originalTitle || '未填写' }}</div>
            </div>
            <div class="compare-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
            <div class="compare-item">
              <div class="compare-label">优化后</div>
              <div class="compare-new">{{ optimizeResult.optimizedTitle }}</div>
            </div>
          </div>

          <div class="compare-row">
            <div class="compare-item full">
              <div class="compare-label">原描述</div>
              <div class="compare-old">{{ originalDescription || '未填写' }}</div>
            </div>
          </div>

          <div class="compare-row">
            <div class="compare-item full">
              <div class="compare-label">优化后</div>
              <div class="compare-new">{{ optimizeResult.optimizedDescription }}</div>
            </div>
          </div>
        </div>

        <!-- 接单率评估 -->
        <div class="rate-section">
          <div class="rate-label">预估接单率</div>
          <div class="rate-value">
            <span class="rate-number">{{ optimizeResult.estimatedRate || 0 }}</span>
            <span class="rate-percent">%</span>
          </div>
          <div class="rate-bar">
            <div
              class="rate-progress"
              :style="{ width: (optimizeResult.estimatedRate || 0) + '%' }"
              :class="getRateClass(optimizeResult.estimatedRate)"
            ></div>
          </div>
        </div>

        <!-- 改进建议 -->
        <div class="suggestions-section" v-if="optimizeResult.suggestions?.length">
          <div class="suggestions-title">
            <el-icon><MagicStick /></el-icon>
            改进建议
          </div>
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in optimizeResult.suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <!-- AI分析 -->
        <div class="analysis-section" v-if="optimizeResult.analysis">
          <div class="analysis-title">
            <el-icon><ChatDotRound /></el-icon>
            AI分析
          </div>
          <div class="analysis-content">{{ optimizeResult.analysis }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="!optimizeResult" type="primary" @click="handleOptimize" :loading="loading">
          开始优化
        </el-button>
        <el-button v-else type="primary" @click="handleApply">
          一键应用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderOptimize } from '@/api/recommend/recommend'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  gameName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'apply'])

const dialogVisible = ref(false)
const loading = ref(false)
const optimizeResult = ref(null)
const originalTitle = ref('')
const originalDescription = ref('')

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
    if (val) {
      originalTitle.value = props.title || ''
      originalDescription.value = props.description || ''
      optimizeResult.value = null
    }
  }
)

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleOptimize = async () => {
  if (!props.title && !props.description) {
    ElMessage.warning('请先填写标题或描述')
    return
  }

  loading.value = true

  try {
    const result = await getOrderOptimize({
      title: props.title,
      description: props.description,
      gameName: props.gameName,
    })

    if (result.code === 200) {
      optimizeResult.value = result.data
    } else {
      ElMessage.error(result.msg || '优化失败')
    }
  } catch (error) {
    console.error('优化失败', error)
    ElMessage.error('优化服务异常，请稍后重试')
  } finally {
    loading.value = false
  }
}

const getRateClass = (rate) => {
  if (rate >= 80) return 'rate-high'
  if (rate >= 60) return 'rate-medium'
  return 'rate-low'
}

const handleApply = () => {
  if (optimizeResult.value) {
    emit('apply', {
      title: optimizeResult.value.optimizedTitle,
      description: optimizeResult.value.optimizedDescription,
    })
    handleClose()
  }
}

const handleClose = () => {
  dialogVisible.value = false
  optimizeResult.value = null
}
</script>

<style scoped>
.order-optimize-container {
  min-height: 300px;
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

.result-section {
  padding: 10px 0;
}

.compare-section {
  margin-bottom: 24px;
}

.compare-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.compare-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.compare-item {
  flex: 1;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.compare-item.full {
  flex: unset;
  width: 100%;
}

.compare-arrow {
  color: #409eff;
  font-size: 20px;
}

.compare-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.compare-old {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  word-break: break-word;
}

.compare-new {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-word;
}

.rate-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
}

.rate-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.rate-value {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 12px;
}

.rate-percent {
  font-size: 24px;
}

.rate-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.rate-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.rate-progress.rate-high {
  background: #67c23a;
}

.rate-progress.rate-medium {
  background: #e6a23c;
}

.rate-progress.rate-low {
  background: #f56c6c;
}

.suggestions-section {
  background: #f0f9ff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.suggestions-title {
  font-size: 15px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestions-list {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  line-height: 2;
}

.suggestions-list li {
  position: relative;
}

.suggestions-list li::marker {
  color: #409eff;
}

.analysis-section {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.analysis-title {
  font-size: 15px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analysis-content {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.dialog-footer {
  text-align: center;
}
</style>
