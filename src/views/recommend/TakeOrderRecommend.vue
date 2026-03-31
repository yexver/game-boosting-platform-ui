<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI智能匹配订单"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="take-recommend-container">
      <!-- 加载状态 -->
      <div class="loading-section" v-if="loading">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <div class="loading-text">AI正在分析订单...</div>
      </div>

      <!-- 结果展示 -->
      <div class="result-section" v-if="recommendResult && !loading">
        <!-- 推荐订单列表 -->
        <div class="orders-section">
          <div class="section-title">为您推荐以下订单</div>

          <div class="orders-list" v-if="recommendResult.recommendedOrders?.length">
            <div
              v-for="(order, index) in recommendResult.recommendedOrders"
              :key="index"
              class="order-card"
              :class="{ 'high-match': order.matchScore >= 90 }"
            >
              <div class="order-header">
                <div class="order-rank">
                  <span class="rank-label">{{ order.currentRank }}</span>
                  <span class="rank-arrow">
                    <el-icon><ArrowRight /></el-icon>
                  </span>
                  <span class="rank-label target">{{ order.targetRank }}</span>
                </div>
                <div class="match-score" :class="getScoreClass(order.matchScore)">
                  匹配度 {{ order.matchScore }}%
                </div>
              </div>

              <div class="order-body">
                <div class="order-info">
                  <div class="game-name">{{ order.gameName }}</div>
                  <div class="order-title">{{ order.title }}</div>
                </div>

                <div class="order-meta">
                  <div class="meta-item">
                    <span class="meta-label">价格</span>
                    <span class="meta-value price">¥{{ order.price }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">时限</span>
                    <span class="meta-value">{{ order.timeLimit }}小时</span>
                  </div>
                </div>

                <div class="order-reason" v-if="order.reason">
                  <div class="reason-label">推荐理由：</div>
                  <div class="reason-content">{{ order.reason }}</div>
                </div>

                <div class="profit-analysis" v-if="order.profitAnalysis">
                  <div class="profit-label">收益分析：</div>
                  <div class="profit-content">{{ order.profitAnalysis }}</div>
                </div>

                <div class="risk-warning" v-if="order.riskWarning">
                  <el-icon><Warning /></el-icon>
                  {{ order.riskWarning }}
                </div>
              </div>

              <div class="order-footer">
                <el-button type="primary" @click="handleJump(order)">
                  查看详情
                </el-button>
              </div>
            </div>
          </div>

          <div class="empty-orders" v-else>
            <div class="empty-icon">📋</div>
            <div class="empty-text">暂无匹配订单</div>
            <div class="empty-hint">试试调整筛选条件或等待新订单</div>
          </div>
        </div>

        <!-- 收益汇总 -->
        <div class="income-summary" v-if="recommendResult.totalEstimatedIncome">
          <div class="summary-label">预估总收益</div>
          <div class="summary-value">¥{{ recommendResult.totalEstimatedIncome }}</div>
        </div>

        <!-- 策略建议 -->
        <div class="strategy-section" v-if="recommendResult.strategyAdvice">
          <div class="strategy-title">
            <el-icon><Cpu /></el-icon>
            收益策略
          </div>
          <div class="strategy-content">{{ recommendResult.strategyAdvice }}</div>
        </div>

        <!-- 风险分析 -->
        <div class="risk-section" v-if="recommendResult.riskAnalysis">
          <div class="risk-title">
            <el-icon><DataAnalysis /></el-icon>
            风险分析
          </div>
          <div class="risk-content">{{ recommendResult.riskAnalysis }}</div>
        </div>

        <!-- 警告信息 -->
        <div class="warnings-section" v-if="recommendResult.warnings?.length">
          <div class="warnings-title">
            <el-icon><Warning /></el-icon>
            注意事项
          </div>
          <ul class="warnings-list">
            <li v-for="(warning, index) in recommendResult.warnings" :key="index">
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleRefresh" :loading="loading" v-if="recommendResult">
          重新匹配
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { takeRecommend } from '@/api/recommend/recommend'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // 用户画像数据
  userProfile: {
    type: Object,
    default: () => ({}),
  },
  // 可用订单列表
  availableOrders: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'jump'])

const router = useRouter()
const dialogVisible = ref(false)
const loading = ref(false)
const recommendResult = ref(null)

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
    if (val && !recommendResult.value) {
      handleRecommend()
    }
  }
)

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleRecommend = async () => {
  loading.value = true

  try {
    const result = await takeRecommend({
      userId: props.userProfile.userId,
      preferredGameIds: props.userProfile.preferredGameIds,
      preferredGameNames: props.userProfile.preferredGameNames,
      minPrice: props.userProfile.minPrice,
      maxTimeLimit: props.userProfile.maxTimeLimit,
      targetIncome: props.userProfile.targetIncome,
      availableTime: props.userProfile.availableTime,
      completionRate: props.userProfile.completionRate,
      avgIncome: props.userProfile.avgIncome,
      boostingType: props.userProfile.boostingType,
      availableOrders: props.availableOrders,
    })

    if (result.code === 200) {
      recommendResult.value = result.data
    } else {
      ElMessage.error(result.msg || '获取推荐失败')
    }
  } catch (error) {
    console.error('推荐失败', error)
    ElMessage.error('推荐服务异常，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  recommendResult.value = null
  handleRecommend()
}

const handleJump = (order) => {
  emit('jump', order)
  handleClose()
}

const getScoreClass = (score) => {
  if (score >= 90) return 'score-high'
  if (score >= 70) return 'score-medium'
  return 'score-low'
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.take-recommend-container {
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

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.orders-section {
  margin-bottom: 24px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.order-card.high-match {
  border-color: #67c23a;
  background: #f0f9eb;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-rank {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-label {
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.rank-label.target {
  background: #409eff;
  color: #fff;
}

.rank-arrow {
  color: #999;
}

.match-score {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
}

.match-score.score-high {
  background: #67c23a;
  color: #fff;
}

.match-score.score-medium {
  background: #e6a23c;
  color: #fff;
}

.match-score.score-low {
  background: #909399;
  color: #fff;
}

.order-body {
  margin-bottom: 12px;
}

.order-info {
  margin-bottom: 12px;
}

.game-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.order-title {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.order-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-size: 13px;
  color: #999;
}

.meta-value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.meta-value.price {
  color: #ff4757;
  font-size: 18px;
}

.order-reason,
.profit-analysis {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.reason-label,
.profit-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.reason-content,
.profit-content {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}

.risk-warning {
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 6px;
  color: #f56c6c;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fafafa;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 13px;
  color: #999;
}

.income-summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
}

.summary-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 36px;
  font-weight: bold;
}

.strategy-section,
.risk-section,
.warnings-section {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.strategy-title,
.risk-title,
.warnings-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategy-content,
.risk-content {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.warnings-list {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.warnings-list li::marker {
  color: #e6a23c;
}

.dialog-footer {
  text-align: center;
}
</style>
