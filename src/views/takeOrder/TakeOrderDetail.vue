<template>
  <div class="order-detail-page">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-left">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
        </button>
      </div>
      <div class="nav-title">订单详情</div>
      <div class="nav-right">
        <button class="share-btn">
          <span class="share-icon">↗</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 订单详情 -->
    <div v-else-if="orderDetail" class="order-detail-container">
      <!-- 订单标题和基本信息 -->
      <div class="order-header">
        <div class="order-status-badge" v-if="orderDetail.status !== 1">
          已被其他用户抢单
        </div>
        <h1 class="order-title">{{ orderDetail.title }}</h1>

        <div class="order-tags">
          <div class="tag">
            <span class="game-icon" style="font-size: 24px !important">
              <img
                v-if="orderDetail.gameIcon"
                :src="settings.imgBaseUrl + orderDetail.gameIcon"
                alt="游戏图标"
                class="icon-img"
                style="width: 24px !important; height: 24px !important"
                @error="handleIconError"
              />
              <span
                v-else
                class="emoji-icon"
                style="font-size: 24px !important"
                >{{ getGameIcon(orderDetail.gameName) }}</span
              >
            </span>
            <span class="system-icon" style="font-size: 24px !important">
              <img
                v-if="orderDetail.systemIcon"
                :src="settings.imgBaseUrl + orderDetail.systemIcon"
                alt="系统图标"
                class="icon-img"
                style="width: 24px !important; height: 24px !important"
                @error="handleIconError"
              />
              <span
                v-else
                class="emoji-icon"
                style="font-size: 24px !important"
                >{{ getSystemIcon(orderDetail.systemName) }}</span
              >
            </span>
            <span
              >{{ orderDetail.gameName }}/{{ orderDetail.systemName }}/{{
                orderDetail.serverName || '默认服'
              }}</span
            >
          </div>
          <div class="tag order-number">
            <span>{{ orderDetail.orderNo }}</span>
            <button class="copy-btn" @click="copyOrderNo">📋</button>
            <span class="order-time">{{
              formatTime(orderDetail.createdAt)
            }}</span>
          </div>
        </div>
      </div>

      <!-- 价格和保障区域 -->
      <div class="price-guarantee-section">
        <div class="price-main">
          <span class="current-price"
            >¥{{ formatPrice(orderDetail.price) }}</span
          >
        </div>

        <div class="guarantee-grid">
          <div class="guarantee-item">
            <div class="guarantee-value">
              {{ orderDetail.timeLimit || 24 }}小时
            </div>
            <div class="guarantee-label">代练总时限</div>
            <div
              class="guarantee-icon"
              title="代练完成的总时间限制，超时可能影响订单状态"
            >
              ?
            </div>
          </div>
          <div class="guarantee-item">
            <div class="guarantee-value">
              ¥{{ formatPrice(orderDetail.securityDeposit) }}
            </div>
            <div class="guarantee-label">安全保证金</div>
            <div
              class="guarantee-icon"
              title="为确保订单安全完成而冻结的保证金，订单完成后返还"
            >
              ?
            </div>
          </div>
          <div class="guarantee-item">
            <div class="guarantee-value">
              ¥{{ formatPrice(orderDetail.efficiencyDeposit) }}
            </div>
            <div class="guarantee-label">效率保证金</div>
            <div
              class="guarantee-icon"
              title="为确保订单按时完成而冻结的保证金，按时完成订单后返还"
            >
              ?
            </div>
          </div>
        </div>
        <div class="rules-link" @click="showViolationModal = true">
          适用规则:平台规则 >
        </div>
      </div>

      <!-- 订单描述 -->
      <div class="requirements-section" v-if="orderDetail.description">
        <h3 class="section-title">订单描述</h3>
        <div class="requirements-text">
          {{ orderDetail.description }}
        </div>
      </div>

      <!-- 发单者信息 -->
      <div class="publisher-section" v-if="!isOwnOrder">
        <div class="publisher-info">
          <div class="publisher-avatar">
            <img
              :src="getAvatarUrl(orderDetail.publisherAvatar)"
              alt="头像"
              class="avatar-img"
              @error="handleAvatarError"
            />
          </div>
          <div class="publisher-details">
            <div class="publisher-name">
              {{
                orderDetail.publisherUsername ||
                '用户' + orderDetail.publisherId?.slice(-4) ||
                '未知用户'
              }}
            </div>
            <div class="publisher-stats">
              <div class="stats-row">
                <span
                  >近30天发单量: {{ orderDetail.publisherOrderCount30d }}</span
                >
                <span
                  >客服介入率:
                  {{
                    (orderDetail.publisherManagerRate30d * 100).toFixed(1)
                  }}%</span
                >
              </div>
            </div>
          </div>
        </div>
        <div class="publisher-actions">
          <button class="follow-btn">
            <span class="follow-icon">⭐</span>
            <span>关注</span>
          </button>
          <button class="published-btn" @click="handleViewPublished">
            <span class="published-icon">📋</span>
            <span>他发布的</span>
          </button>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-action-bar">
        <div class="action-left" v-if="!isOwnOrder">
          <div class="action-item">
            <span class="action-icon">❤</span>
            <span class="action-text">收藏</span>
          </div>
          <div class="action-item">
            <span class="action-icon">↑</span>
            <span class="action-text">跟发</span>
          </div>
        </div>
        <div class="action-right">
          <button
            class="grab-order-btn"
            @click="handleConfirmTakeOrder"
            :disabled="confirming || !canTakeOrder"
          >
            {{ getButtonText() }}
          </button>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <div class="error-icon">❌</div>
      <div class="error-text">订单不存在或已被删除</div>
      <button class="back-btn" @click="goBack">返回列表</button>
    </div>

    <!-- 确认接单模态框 -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">确认接单</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <!-- 订单信息 -->
          <div class="order-info">
            <div class="info-item title-item">
              <span class="info-label">订单名称：</span>
              <span class="info-value title-value">{{
                orderDetail?.title
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <span
                  class="help-icon"
                  title="订单的原始价格，接单后完成订单可获得此金额"
                  >?</span
                >
                订单金额：
              </span>
              <span class="info-value price"
                >¥{{ formatPrice(orderDetail?.price) }}</span
              >
            </div>
            <div class="info-item">
              <span class="info-label">
                <span
                  class="help-icon"
                  title="为确保订单安全完成而冻结的保证金，订单完成后返还"
                  >?</span
                >
                安全保证金：
              </span>
              <span class="info-value"
                >¥{{ formatPrice(orderDetail?.securityDeposit) }}</span
              >
            </div>
            <div class="info-item">
              <span class="info-label">
                <span
                  class="help-icon"
                  title="为确保订单按时完成而冻结的保证金，按时完成订单后返还"
                  >?</span
                >
                效率保证金：
              </span>
              <span class="info-value"
                >¥{{ formatPrice(orderDetail?.efficiencyDeposit) }}</span
              >
            </div>
            <div class="info-item total">
              <span class="info-label">冻结金额：</span>
              <span class="info-value total-amount"
                >¥{{ formatPrice(totalFreezeAmount) }}</span
              >
            </div>
          </div>

          <!-- 密码输入 -->
          <div class="password-section">
            <label class="password-label">密码：</label>
            <input
              v-model="paymentPassword"
              type="password"
              class="password-input"
              placeholder="请输入密码"
              maxlength="6"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeModal">取消</button>
          <button
            class="modal-btn confirm-btn"
            @click="confirmTakeOrder"
            :disabled="
              !paymentPassword || paymentPassword.length < 6 || confirming
            "
          >
            {{ confirming ? '确认中...' : '确认支付' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 平台规则弹窗 -->
    <div v-if="showRuleModal" class="rule-modal-mask" @click="closeRuleModal">
      <div class="rule-modal-content" @click.stop>
        <div class="rule-modal-header">
          <h3 class="rule-modal-title">平台规则</h3>
          <button class="rule-modal-close" @click="closeRuleModal">×</button>
        </div>
        <div class="rule-modal-body">
          <p>1. 代练服务：代练者需在规定时间内完成订单，确保游戏账号安全。</p>
          <p>
            2. 安全保障：平台提供安全保证金，确保订单完成，超时或违规将扣除。
          </p>
          <p>
            3.
            效率保障：平台提供效率保证金，确保代练者按时完成订单，超时将扣除。
          </p>
          <p>
            4.
            费用说明：平台预计手续费为订单最终结算金额的5%，最低1元，最高不超过25元。
          </p>
          <p>5. 违约责任：如代练者未按时完成订单，平台将扣除相应保证金。</p>
          <p>
            6. 纠纷处理：如发生争议，双方应友好协商，协商不成可申请平台介入。
          </p>
        </div>
        <div class="rule-modal-footer">
          <button class="rule-modal-btn" @click="closeRuleModal">
            我已了解
          </button>
        </div>
      </div>
    </div>

    <!-- 违规说明弹窗 -->
    <div
      v-if="showViolationModal"
      class="modal-overlay"
      @click="showViolationModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title" style="text-align: left">温馨提示</h3>
          <button class="modal-close" @click="showViolationModal = false">
            ×
          </button>
        </div>
        <div
          class="modal-body"
          style="max-height: 60vh; overflow-y: auto; text-align: left"
        >
          <div style="font-weight: bold; margin-bottom: 10px; text-align: left">
            接单前请注意以下易违规项：
          </div>
          <ol
            style="
              font-size: 14px;
              color: #333;
              padding-left: 18px;
              text-align: left;
            "
          >
            <li>接错单、接错系统、接错区扣罚3-10元</li>
            <li>中途撤单根据订单金额区间对应扣除5-15元</li>
            <li>代练效率低，根据时间进度扣除5-15元</li>
            <li>掉分掉星将从双金内扣除掉分价值</li>
            <li>无首图/进度图/完成图/被BAN图/战绩图，无正确截图将影响结算</li>
            <li>诱导私下订单将0结算扣双金</li>
            <li>辱骂/嘲讽扣除5-10元</li>
            <li>虚假验收0结算扣双金</li>
            <li>初始不符请及时与发单方协商，请勿擅自开始代练</li>
            <li>如订单异常（锁定/撤销/仲裁）时请勿代练，请及时与发单方协商</li>
            <li>指定英雄和胜率订单请上传所有战绩截图</li>
          </ol>
          <div
            style="
              margin-top: 10px;
              font-size: 13px;
              color: #666;
              text-align: left;
            "
          >
            仲裁规则可在客服中心查看
          </div>
        </div>
        <div class="modal-footer">
          <button
            class="modal-btn confirm-btn"
            @click="showViolationModal = false"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTakeOrderDetail, takeOrder } from '@/api/order/takeOrder'
import { useUserStore } from '@/stores/modules/user'
import settings from '@/settings'

// 组件名称
defineOptions({
  name: 'TakeOrderDetailPage',
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const orderDetail = ref(null)
const loading = ref(true)
const confirming = ref(false)
const showConfirmModal = ref(false)
const paymentPassword = ref('')
const showRuleModal = ref(false)
const showViolationModal = ref(false)

// 计算是否可以接单
const canTakeOrder = computed(() => {
  return orderDetail.value?.status === 1 && !isOwnOrder.value
})

// 计算是否是自己的订单
const isOwnOrder = computed(() => {
  const currentUserId = userStore.userId
  console.log('当前用户ID:', currentUserId)
  console.log('发布者ID:', orderDetail.value?.publisherId)
  console.log(
    '是否为自己的订单:',
    orderDetail.value?.publisherId === currentUserId
  )
  return orderDetail.value?.publisherId === currentUserId
})

// 计算平台手续费（5%，最大25元）
const platformFee = computed(() => {
  if (!orderDetail.value?.price) return 0
  const fee = orderDetail.value.price * 0.05
  return Math.min(fee, 25)
})

// 计算总冻结金额
const totalFreezeAmount = computed(() => {
  if (!orderDetail.value) return 0
  return (
    orderDetail.value.securityDeposit +
    orderDetail.value.efficiencyDeposit +
    platformFee.value
  )
})

// 获取按钮文本
function getButtonText() {
  if (confirming.value) {
    return '接单中...'
  }
  if (isOwnOrder.value) {
    return '我的订单'
  }
  if (!canTakeOrder.value) {
    return getStatusText(orderDetail.value?.status)
  }
  return '立即抢单'
}

// 获取状态文本
function getStatusText(status) {
  if (status === 1) {
    return '立即抢单'
  }
  return '已被接单'
}

// 获取游戏图标
function getGameIcon(gameName) {
  const gameIcons = {
    王者: '👑',
    原神: '⚡',
    和平精英: '🎯',
    英雄联盟: '⚔️',
    穿越火线: '🔫',
    DOTA2: '🗡️',
    CSGO: '🎯',
    绝地求生: '🏆',
    LOL: '⚔️',
    CF: '🔫',
    PUBG: '🏆',
  }
  return gameIcons[gameName] || '🎮'
}

// 获取系统图标
function getSystemIcon(systemName) {
  const systemIcons = {
    安卓QQ: '📱',
    安卓微信: '📱',
    iOSQQ: '🍎',
    iOS微信: '🍎',
    PC端: '💻',
    安卓: '📱',
    iOS: '🍎',
    PC: '💻',
  }
  return systemIcons[systemName] || '📱'
}

// 获取头像URL
function getAvatarUrl(avatar) {
  if (!avatar) return '/src/assets/images/avatar.jpeg'
  if (typeof avatar === 'string' && avatar.startsWith('http')) return avatar
  return (settings.imgBaseUrl || '') + avatar
}

// 处理头像加载错误
function handleAvatarError(event) {
  event.target.src = '/src/assets/images/avatar.jpeg'
}

// 处理图标加载错误
function handleIconError(event) {
  // 隐藏图片，显示默认emoji图标
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  const fallback = parent.querySelector('span')
  if (fallback) {
    fallback.style.display = 'inline'
  }
}

// 格式化价格
function formatPrice(price) {
  return Number(price).toFixed(2)
}

// 格式化时间
function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(Number(ts))
  return date.toLocaleString('zh-CN')
}

// 复制订单号
function copyOrderNo() {
  if (orderDetail.value?.orderNo) {
    navigator.clipboard.writeText(orderDetail.value.orderNo)
    ElMessage.success('订单号已复制')
  }
}

// 返回上一页
function goBack() {
  router.back()
}

// 查看他发布的订单
function handleViewPublished() {
  if (!orderDetail.value?.publisherId) {
    ElMessage.warning('无法获取发布者信息')
    return
  }

  const publisherUsername =
    orderDetail.value.publisherUsername ||
    '用户' + orderDetail.value.publisherId?.slice(-4) ||
    '未知用户'

  // 跳转到接单页面，并传递发布者用户名作为查询参数
  router.push({
    path: '/take-order',
    query: {
      publisher: publisherUsername,
      publisherId: orderDetail.value.publisherId,
    },
  })
}

// 获取订单详情
async function fetchOrderDetail() {
  const orderId = route.params.id
  if (!orderId) {
    ElMessage.error('订单ID不存在')
    goBack()
    return
  }

  loading.value = true
  try {
    const res = await getTakeOrderDetail(orderId)
    orderDetail.value = res.data
  } catch (error) {
    console.error('获取订单详情失败', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 确认接单
async function handleConfirmTakeOrder() {
  if (!orderDetail.value) return

  // 检查是否是自己的订单
  if (isOwnOrder.value) {
    ElMessage.info('这是您发布的订单，无法接单')
    return
  }

  // 检查订单状态
  if (!canTakeOrder.value) {
    ElMessage.warning('该订单已被其他用户抢单')
    return
  }

  // 显示确认模态框
  showConfirmModal.value = true
  paymentPassword.value = ''
}

// 关闭模态框
function closeModal() {
  showConfirmModal.value = false
  paymentPassword.value = ''
}

// 关闭平台规则弹窗
function closeRuleModal() {
  showRuleModal.value = false
}

// 确认支付并接单
async function confirmTakeOrder() {
  if (!paymentPassword.value || paymentPassword.value.length < 6) {
    ElMessage.warning('请输入密码')
    return
  }

  try {
    confirming.value = true

    // 调用包含密码的接单API
    await takeOrder(orderDetail.value.id, paymentPassword.value)

    ElMessage.success('接单成功！')
    closeModal()

    // 跳转到订单列表页
    router.push('/take-order')
  } catch (error) {
    console.error('接单失败', error)
  } finally {
    confirming.value = false
  }
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px;
  max-width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 8px 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;
}

.nav-left {
  flex: 0 0 auto;
}

.nav-right {
  flex: 0 0 auto;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.back-btn,
.share-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.back-btn:hover,
.share-btn:hover {
  background: #f5f5f5;
}

.nav-right {
  text-align: right;
}

/* 订单详情容器 */
.order-detail-container {
  padding: 8px;
  max-width: 480px;
  width: 100%;
  box-sizing: border-box;
}

/* 订单头部 */
.order-header {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.order-status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4757;
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  z-index: 1;
}

.order-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: left;
}

.order-subtitle {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.order-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 12px;
  flex-wrap: wrap;
  word-break: break-all;
}

.tag .game-icon,
.tag .system-icon {
  font-size: 18px !important;
}

.game-icon {
  font-size: 18px !important;
  margin-right: 6px;
}

.system-icon {
  font-size: 18px !important;
  margin-right: 6px;
}

.icon-img {
  width: 20px !important;
  height: 20px !important;
  object-fit: contain;
  vertical-align: middle;
}

.emoji-icon {
  display: inline !important;
  font-size: 18px !important;
}

.order-number {
  justify-content: space-between;
}

.copy-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.order-time {
  font-size: 12px;
  color: #999;
}

/* 价格和保障区域 */
.price-guarantee-section {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
}

.price-main {
  display: flex;
  align-items: baseline;
  margin-bottom: 16px;
  padding-left: 20px;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff4757;
}

.guarantee-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.guarantee-item {
  text-align: center;
  position: relative;
}

.guarantee-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.guarantee-label {
  font-size: 11px;
  color: #666;
}

.guarantee-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #999;
  cursor: help;
  transition: all 0.2s;
}

.guarantee-icon:hover {
  background: #e0e0e0;
  color: #666;
}

.guarantee-icon:hover::after {
  content: attr(title);
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1002;
  margin-left: 8px;
  pointer-events: none;
  max-width: 350px;
  min-width: 300px;
  word-wrap: break-word;
  white-space: normal;
}

.guarantee-icon:hover::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.8);
  margin-left: 3px;
  pointer-events: none;
}

.rules-link {
  font-size: 14px;
  color: #1890ff;
  text-align: center;
  cursor: pointer;
}

/* 游戏信息区域 */
.game-info-section {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  text-align: left;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item {
  display: flex;
  gap: 6px;
  line-height: 1.4;
}

.rule-number {
  font-weight: 600;
  color: #1890ff;
  flex-shrink: 0;
}

.rule-text {
  font-size: 12px;
  color: #666;
  flex: 1;
}

/* 发单者信息区域 */
.publisher-section {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
}

.publisher-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.publisher-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.publisher-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 48px;
}

.publisher-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  text-align: left;
}

.publisher-stats {
  font-size: 12px;
  color: #666;
}

.stats-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
}

.publisher-actions {
  display: flex;
  gap: 8px;
}

.follow-btn,
.published-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 16px;
  background: none;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-btn {
  border-color: #ffa500;
  color: #ffa500;
}

.follow-btn:hover {
  background: #ffa500;
  color: #fff;
}

.published-btn {
  border-color: #1890ff;
  color: #1890ff;
}

.published-btn:hover {
  background: #1890ff;
  color: #fff;
}

.follow-icon,
.published-icon {
  font-size: 12px;
}

/* 代练要求区域 */
.requirements-section {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
}

.requirements-text {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 底部操作栏 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border-top: 1px solid #eee;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;
}

.action-left {
  display: flex;
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.action-icon {
  font-size: 20px;
  color: #666;
}

.action-text {
  font-size: 12px;
  color: #666;
}

.action-right {
  flex: 1;
  margin-left: 16px;
}

.grab-order-btn {
  width: 100%;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.grab-order-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.grab-order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #ccc !important;
  color: #666 !important;
  transform: none !important;
  box-shadow: none !important;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  max-width: 480px;
  width: 100%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #666;
  font-size: 14px;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  max-width: 480px;
  width: 100%;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-text {
  color: #666;
  font-size: 16px;
  margin-bottom: 24px;
}

.back-btn {
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-detail-container {
    padding: 6px;
  }

  .order-header,
  .price-guarantee-section,
  .game-info-section,
  .requirements-section {
    padding: 10px;
  }

  .order-title {
    font-size: 15px;
  }

  .current-price {
    font-size: 18px;
  }

  .guarantee-grid {
    gap: 6px;
  }

  .guarantee-value {
    font-size: 13px;
  }

  .tag {
    font-size: 11px;
    padding: 3px 6px;
  }

  .nav-title {
    font-size: 15px;
  }

  .section-title {
    font-size: 13px;
  }

  .rule-text {
    font-size: 11px;
  }

  .requirements-text {
    font-size: 11px;
  }

  .publisher-name {
    font-size: 14px;
  }

  .publisher-stats {
    font-size: 11px;
  }

  .stats-row {
    gap: 4px;
  }

  .follow-btn,
  .published-btn {
    font-size: 11px;
    padding: 4px 8px;
  }
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: visible;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 20px;
  overflow: visible;
}

.order-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.title-item {
  align-items: flex-start;
}

.info-label {
  color: #666;
  font-size: 14px;
  flex-shrink: 0;
  min-width: 80px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 12px;
  color: #999;
  cursor: help;
  transition: all 0.2s;
  position: relative;
}

.help-icon:hover {
  background: #e0e0e0;
  color: #666;
}

.help-icon:hover::after {
  content: attr(title);
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1002;
  margin-left: 8px;
  pointer-events: none;
  max-width: 350px;
  min-width: 300px;
  word-wrap: break-word;
  white-space: normal;
}

.help-icon:hover::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.8);
  margin-left: 3px;
  pointer-events: none;
}

.title-value {
  flex: 1;
  margin-left: 12px;
  word-wrap: break-word;
  word-break: break-all;
  line-height: 1.4;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item.total {
  border-top: 2px solid #eee;
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 600;
}

.info-label {
  color: #666;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  text-align: right;
}

.info-value.price {
  color: #ff4757;
  font-weight: 600;
}

.info-value.fee {
  color: #ff9500;
  font-weight: 600;
}

.info-value.total-amount {
  color: #ff4757;
  font-size: 16px;
  font-weight: 700;
}

.password-section {
  margin-top: 20px;
}

.password-label {
  display: block;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  text-align: left;
}

.password-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.password-input:focus {
  border-color: #1890ff;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 20px 20px 20px;
}

.modal-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.confirm-btn {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #fff;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #ccc !important;
  transform: none !important;
  box-shadow: none !important;
}

/* 平台规则弹窗样式 */
.rule-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.rule-modal-content {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: visible;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.rule-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.rule-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.rule-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.rule-modal-close:hover {
  background: #f5f5f5;
  color: #666;
}

.rule-modal-body {
  padding: 20px;
  overflow: visible;
}

.rule-modal-body p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.rule-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0 20px 20px 20px;
}

.rule-modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.rule-modal-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

/* 小屏幕设备 */
@media (max-width: 480px) {
  .top-nav,
  .order-detail-container,
  .bottom-action-bar,
  .loading-container,
  .error-container {
    max-width: 100%;
  }

  .modal-content {
    margin: 10px;
    max-width: calc(100% - 20px);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
