<template>
  <div class="user-center">
    <el-button class="back-btn" @click="goBack" plain>
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        style="vertical-align: middle; margin-right: 4px"
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="#409eff"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      返回
    </el-button>
    <!-- 头部信息 -->
    <div class="profile-header">
      <div class="avatar-edit-wrapper">
        <img :src="user.avatar" class="avatar" />
        <label class="avatar-edit-btn">
          <input
            type="file"
            accept="image/*"
            @change="onAvatarChange"
            style="display: none"
          />
          <span class="edit-icon">✏️</span>
        </label>
      </div>
      <div class="user-info">
        <div class="nickname-edit">
          <span v-if="!editingName">{{ user.username }}</span>
          <el-input
            v-else
            v-model="editName"
            size="small"
            style="width: 120px"
            @keyup.enter="saveName"
            @blur="saveName"
          />
          <el-button
            v-if="!editingName"
            icon="el-icon-edit"
            size="small"
            @click="editingName = true"
            style="margin-left: 8px"
            >编辑</el-button
          >
        </div>
        <div class="user-id">ID: {{ user.userId }}</div>
      </div>
      <div
        class="profile-edit-btn"
        style="display: flex; align-items: center; gap: 8px; margin-left: auto"
      >
        <span>代打</span>
        <el-switch
          v-model="isBoostingEnabled"
          :active-value="1"
          :inactive-value="0"
          :loading="loadingProfile"
          :disabled="loadingProfile"
          active-text="开"
          inactive-text="关"
          @change="onSwitchChange"
        />
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="profile-stats">
      <div class="stat-item">
        <div class="stat-value">{{ user.following }}</div>
        <div class="stat-label">我的关注</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ user.followers }}</div>
        <div class="stat-label">我的粉丝</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ user.recentViews }}</div>
        <div class="stat-label">最近浏览</div>
      </div>
    </div>

    <!-- 资金权益新版布局 -->
    <div class="funds-card">
      <div class="funds-row">
        <div class="funds-col funds-available">
          <div class="funds-label">可用资金（元）</div>
          <div class="funds-value">{{ user.balance.toFixed(2) }}</div>
        </div>
        <div class="funds-actions">
          <el-button
            class="withdraw-btn"
            size="large"
            @click="openWithdrawDialog"
            >提现</el-button
          >
          <el-button
            class="recharge-btn"
            type="primary"
            size="large"
            @click="openRechargeDialog"
          >
            <i class="el-icon-wallet" style="margin-right: 4px"></i>充值
          </el-button>
        </div>
      </div>
      <div class="funds-row funds-row-bottom">
        <div class="funds-col">
          <div class="funds-label">
            冻结资金（元）
            <el-tooltip content="提现中或争议中的资金" placement="top">
              <i
                class="el-icon-question"
                style="font-size: 15px; color: #bbb; margin-left: 2px"
              ></i>
            </el-tooltip>
          </div>
          <div class="funds-value">{{ user.frozen.toFixed(2) }}</div>
        </div>
        <div class="funds-col">
          <div class="funds-label">总资金（元）</div>
          <div class="funds-value">
            {{ (user.balance + user.frozen).toFixed(2) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 服务支持功能区 -->
    <div class="service-support">
      <div class="service-title">服务支持</div>
      <div class="service-grid">
        <div
          class="service-item"
          v-for="item in serviceList"
          :key="item.label"
          @click="item.action && item.action()"
        >
          <span class="service-icon" v-html="item.icon"></span>
          <div class="service-label">{{ item.label }}</div>
          <span v-if="item.dot" class="service-dot"></span>
        </div>
      </div>
    </div>

    <el-dialog v-model="showRechargeDialog" title="充值" width="320px">
      <div style="margin-bottom: 16px">
        <el-input
          v-model="rechargeAmount"
          placeholder="请输入充值金额"
          type="number"
          min="0.01"
          :disabled="isPaying"
        />
      </div>
      <template #footer>
        <el-button @click="showRechargeDialog = false" :disabled="isPaying"
          >取消</el-button
        >
        <el-button type="primary" @click="handleRecharge" :loading="isPaying"
          >确认充值</el-button
        >
      </template>
    </el-dialog>

    <el-dialog v-model="showWithdrawDialog" title="提现" width="320px">
      <div style="margin-bottom: 16px">
        <el-input
          v-model="withdrawAmount"
          placeholder="请输入提现金额"
          type="number"
          min="0.01"
          :disabled="isWithdrawing"
        />
        <el-input
          v-model="withdrawPassword"
          placeholder="请输入密码"
          type="password"
          show-password
          style="margin-top: 12px"
          :disabled="isWithdrawing"
        />
        <div style="color: #888; font-size: 13px; margin-top: 8px">
          可用余额：¥{{ user.balance.toFixed(2) }}
        </div>
      </div>
      <template #footer>
        <el-button @click="showWithdrawDialog = false" :disabled="isWithdrawing"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="handleWithdraw"
          :loading="isWithdrawing"
          >确认提现</el-button
        >
      </template>
    </el-dialog>

    <el-dialog
      v-model="showGameDialog"
      title="选择游戏"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form>
        <el-form-item label="游戏">
          <el-select
            v-model="selectedGames"
            multiple
            filterable
            default-first-option
            placeholder="请选择或输入游戏"
          >
            <el-option
              v-for="game in gameList"
              :key="game.id"
              :label="game.name"
              :value="game.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="onCancelGameDialog">取消</el-button>
        <el-button type="primary" @click="confirmGame">开启代打</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores'
import settings from '@/settings'
import { useRouter } from 'vue-router'

const router = useRouter()
import { ElMessage } from 'element-plus'
import {
  getUserProfile,
  updateUserProfile,
  alipayPay,
  withdraw,
} from '@/api/user' // 你需要实现这些API
import { getGameList } from '@/api/game/game'
import { getUserBoostingGames, switchUserBoosting } from '@/api/user'

defineOptions({ name: 'UserProfile' })

const userStore = useUserStore()
const user = computed(() => {
  const avatarUrl = userStore.avatar
    ? userStore.avatar.startsWith('http')
      ? userStore.avatar
      : (settings.imgBaseUrl || '') + userStore.avatar
    : '/src/assets/images/avatar.jpeg'

  return {
    avatar: avatarUrl,
    username: userStore.name,
    userId: userStore.userId,
    following: 0,
    followers: 0,
    recentViews: 3,
    assets: 30,
    level: 1,
    nextLevelExp: 959,
    levelPercent: 5, // 进度百分比
    badges: 0,
    balance: userStore.balance || 0,
    frozen: userStore.frozen || 0,
  }
})

const editingName = ref(false)
const editName = ref(user.value.username)

watch(
  () => user.value.username,
  (val) => {
    editName.value = val
  }
)

function goBack() {
  router.back()
}

const isBoostingEnabled = ref(0) // 0: 关, 1: 开
const loadingProfile = ref(true) // 控制开关加载状态

onMounted(async () => {
  loadingProfile.value = true
  await fetchUserProfile()
  try {
    const res = await getGameList()
    gameList.value = res.data || []
  } catch {
    ElMessage.error('获取游戏列表失败')
  }
  loadingProfile.value = false
})

async function fetchUserProfile() {
  try {
    const res = await getUserProfile()
    if (res.code === 200 && res.data && res.data.length >= 2) {
      const userInfo = res.data[0] // 用户基本信息
      const userFinance = res.data[1] // 用户财务信息

      // 更新用户基本信息
      userStore.avatar = userInfo.avatar
      userStore.name = userInfo.username
      userStore.userId = userInfo.userId

      // 更新用户财务信息
      userStore.balance = userFinance.balance || 0
      userStore.frozen = userFinance.frozenAmount || 0
      console.log('userInfo', userInfo)
      console.log('userInfo.isBoostingEnabled', userInfo.isBoostingEnabled)
      userStore.is_boosting_enabled = userInfo.isBoostingEnabled
      isBoostingEnabled.value = userInfo.isBoostingEnabled
    }
  } catch {
    ElMessage.error('获取用户信息失败')
  }
}

async function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    await updateUserProfile({}, file) // 传递空的用户数据对象和头像文件
    ElMessage.success('头像更新成功')
    await fetchUserProfile() // 重新获取用户信息，刷新页面
  } catch {
    ElMessage.error('头像更新失败')
  }
}

async function saveName() {
  if (editName.value && editName.value !== user.value.username) {
    await updateUserProfile({ username: editName.value })
    ElMessage.success('用户名已更新')
    await fetchUserProfile()
  }
  editingName.value = false
}

// 你可以用svg，也可以用iconfont或element-plus图标
const serviceList = ref([
  {
    label: '自动抢单',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" stroke="#409eff" stroke-width="2" fill="none"/><circle cx="16" cy="16" r="6" fill="#409eff"/><rect x="15" y="6" width="2" height="6" rx="1" fill="#409eff"/></svg>`,
    dot: true,
    action: () => {
      /* 跳转或弹窗 */
    },
  },
  {
    label: '消息提醒',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 28a4 4 0 0 0 4-4h-8a4 4 0 0 0 4 4zm8-8V14a8 8 0 1 0-16 0v6l-2 2v2h20v-2l-2-2z" stroke="#409eff" stroke-width="2" fill="none"/></svg>`,
    dot: false,
    action: () => {},
  },
  {
    label: '资金管理',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" stroke="#409eff" stroke-width="2" fill="none"/><text x="16" y="22" text-anchor="middle" font-size="16" fill="#409eff">¥</text></svg>`,
    dot: false,
    action: () => {},
  },
  {
    label: '设置',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32"><polygon points="16,6 18,10 22,10 19,13 20,17 16,15 12,17 13,13 10,10 14,10" stroke="#409eff" stroke-width="2" fill="none"/></svg>`,
    dot: false,
    action: () => {},
  },
  {
    label: '客服中心',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" stroke="#409eff" stroke-width="2" fill="none"/><rect x="12" y="20" width="8" height="4" rx="2" fill="#409eff"/></svg>`,
    dot: false,
    action: () => {},
  },
  {
    label: '新人攻略',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="16" rx="4" stroke="#409eff" stroke-width="2" fill="none"/><polygon points="16,12 18,18 14,18" fill="#409eff"/></svg>`,
    dot: false,
    action: () => {},
  },
  {
    label: '流水记录',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32"><path d="M6 8h20v2H6zm0 6h20v2H6zm0 6h20v2H6z" fill="#409eff"/></svg>`,
    dot: false,
    action: () => {
      router.push('/user/transaction-history')
    },
  },
])

const showRechargeDialog = ref(false)
const rechargeAmount = ref('')
const isPaying = ref(false)

function openRechargeDialog() {
  rechargeAmount.value = ''
  showRechargeDialog.value = true
}

async function handleRecharge() {
  if (
    !rechargeAmount.value ||
    isNaN(Number(rechargeAmount.value)) ||
    Number(rechargeAmount.value) <= 0
  ) {
    ElMessage.error('请输入有效的充值金额')
    return
  }
  isPaying.value = true
  try {
    const url = window.location.origin + '/user/profile'
    const userId = user.value.userId
    const price = rechargeAmount.value
    // 调用封装的 alipayPay 接口
    const win = window.open('', '_blank')
    const res = await alipayPay({ url, userId, price })
    if (res && res) {
      win.document.write(res)
      win.document.close()
    } else {
      win.close()
      ElMessage.error('获取支付页面失败')
    }
    showRechargeDialog.value = false
  } catch {
    ElMessage.error('充值请求失败')
  } finally {
    isPaying.value = false
  }
}

const showWithdrawDialog = ref(false)
const withdrawAmount = ref('')
const withdrawPassword = ref('')
const isWithdrawing = ref(false)

function openWithdrawDialog() {
  withdrawAmount.value = ''
  withdrawPassword.value = ''
  showWithdrawDialog.value = true
}

async function handleWithdraw() {
  if (
    !withdrawAmount.value ||
    isNaN(Number(withdrawAmount.value)) ||
    Number(withdrawAmount.value) <= 0
  ) {
    ElMessage.error('请输入有效的提现金额')
    return
  }
  if (Number(withdrawAmount.value) > user.value.balance) {
    ElMessage.error('提现金额不能大于可用余额')
    return
  }
  if (!withdrawPassword.value) {
    ElMessage.error('请输入密码')
    return
  }
  isWithdrawing.value = true
  try {
    const userId = user.value.userId
    const amount = withdrawAmount.value
    const password = withdrawPassword.value
    await withdraw({ userId, amount, password })
    ElMessage.success('提现申请已提交')
    showWithdrawDialog.value = false
    await fetchUserProfile()
  } catch {
    ElMessage.error('提现失败')
  } finally {
    isWithdrawing.value = false
  }
}

const showGameDialog = ref(false)
const gameList = ref([])
const selectedGames = ref([]) // 这里建议用 id 数组

watch(
  () => userStore.is_boosting_enabled,
  (val) => {
    isBoostingEnabled.value = val
  },
  { immediate: true }
)

const isFirstSwitch = ref(true)

const handleBoostingSwitch = async (val) => {
  if (isFirstSwitch.value) {
    isFirstSwitch.value = false
    return
  }
  if (val === 1) {
    try {
      const res = await getGameList()
      gameList.value = res.data || []
      // 调用获取已选游戏
      const userGamesRes = await getUserBoostingGames()
      selectedGames.value = userGamesRes.data || []
    } catch {
      ElMessage.error('获取游戏列表或已选游戏失败')
      return
    }
    showGameDialog.value = true
  } else {
    // 关闭逻辑同前
    try {
      await switchUserBoosting({ is_boosting_enabled: 0 })
      ElMessage.success('已关闭代打功能')
      await fetchUserProfile()
    } catch {
      ElMessage.error('关闭代打失败')
      isBoostingEnabled.value = 1
    }
  }
}

// 修改 confirmGame，开启后同步开关状态
const confirmGame = async () => {
  if (!selectedGames.value.length) {
    ElMessage.error('请选择至少一个游戏')
    return
  }
  try {
    await switchUserBoosting({
      is_boosting_enabled: 1,
      boosting_game_ids: selectedGames.value,
    })
    ElMessage.success('已开启代打功能')
    await fetchUserProfile() // 重新获取用户信息
    showGameDialog.value = false
  } catch {
    ElMessage.error('开启代打失败')
    isBoostingEnabled.value = 0 // 回滚
  }
}

const onSwitchChange = (val) => {
  handleBoostingSwitch(val)
}

function onCancelGameDialog() {
  isBoostingEnabled.value = 0
  showGameDialog.value = false
}
</script>

<style scoped>
.user-center {
  max-width: 700px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 40px 40px;
}
.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
}
.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 32px;
  border: 2px solid #eee;
}
.user-info .nickname {
  font-size: 26px;
  font-weight: 600;
}
.user-info .user-id {
  color: #888;
  font-size: 15px;
  margin-top: 4px;
}
.profile-header .profile-edit-btn {
  margin-left: auto;
}
.profile-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}
.stat-item {
  text-align: center;
}
.stat-value {
  font-size: 22px;
  font-weight: bold;
}
.stat-label {
  color: #888;
  font-size: 13px;
}
.level-section {
  margin-bottom: 18px;
}
.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.level {
  font-weight: bold;
  color: #409eff;
}
.level-progress {
  color: #888;
  font-size: 13px;
}
.quick-links {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.funds-card {
  background: #f6fbff;
  border-radius: 14px;
  padding: 18px 18px 10px 18px;
  margin-top: 28px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.06);
}
.funds-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.funds-row-bottom {
  margin-top: 10px;
}
.funds-col {
  flex: 1;
}
.funds-available {
  flex: 2;
}
.funds-label {
  color: #888;
  font-size: 15px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
}
.funds-value {
  font-size: 26px;
  font-weight: bold;
  color: #222;
}
.funds-actions {
  display: flex;
  gap: 10px;
}
.withdraw-btn {
  background: #fff;
  color: #409eff;
  border: 1.5px solid #c6e2ff;
  font-weight: 600;
}
.recharge-btn {
  font-weight: 600;
}
.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.progress-percent {
  color: #888;
  font-size: 15px;
  min-width: 36px;
}
.service-support {
  background: #fafbfc;
  border-radius: 12px;
  margin-top: 32px;
  padding: 24px 18px 18px 18px;
}
.service-title {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 18px;
}
.service-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 18px 0;
}
.service-item {
  width: 25%;
  text-align: center;
  position: relative;
  cursor: pointer;
}
.service-icon {
  display: inline-block;
  width: 36px;
  height: 36px;
  margin-bottom: 6px;
}
.service-label {
  font-size: 15px;
  color: #444;
}
.service-dot {
  position: absolute;
  top: 2px;
  left: 50%;
  margin-left: 10px;
  width: 8px;
  height: 8px;
  background: #ff3b30;
  border-radius: 50%;
  border: 2px solid #fff;
}
.avatar-edit-wrapper {
  position: relative;
  display: inline-block;
}
.avatar-edit-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 50%;
  padding: 2px 6px;
  cursor: pointer;
  border: 1px solid #eee;
  font-size: 14px;
}
.nickname-edit {
  display: flex;
  align-items: center;
}
.back-btn {
  position: absolute;
  left: 32px;
  top: 32px;
  z-index: 10;
  background: #f6fbff;
  color: #409eff;
  border: 1.5px solid #c6e2ff;
  font-weight: 600;
  border-radius: 20px;
  padding: 6px 18px 6px 12px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.06);
  transition: background 0.2s;
}
.back-btn:hover {
  background: #eaf6ff;
}
</style>
