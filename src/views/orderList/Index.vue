<template>
  <div class="order-list-page">
    <main class="main-content">
      <div class="main-nav-with-tools">
        <div class="main-nav">
          <el-button-group>
            <el-button
              :type="mainTab === 'taken' ? 'primary' : 'default'"
              @click="mainTab = 'taken'"
              >我接手的</el-button
            >
            <el-button
              :type="mainTab === 'published' ? 'primary' : 'default'"
              @click="mainTab = 'published'"
              >我发布的</el-button
            >
          </el-button-group>
        </div>
        <div class="nav-tools">
          <el-select
            v-model="selectedGame"
            placeholder="选择游戏"
            class="game-filter-select"
            @change="handleGameFilter"
          >
            <el-option label="全部游戏" value="all" />
            <el-option
              v-for="game in gameList"
              :key="game.value"
              :label="game.label"
              :value="game.value"
            />
          </el-select>
          <el-button link circle size="small" class="tool-btn"
            ><el-icon><Search /></el-icon
          ></el-button>
        </div>
      </div>
      <div class="sub-nav">
        <div class="sub-nav-content">
          <el-tabs v-model="subTab" type="card" class="sub-tabs">
            <el-tab-pane
              v-for="item in subTabs[mainTab]"
              :key="item.value"
              :label="item.label"
              :name="item.value"
            />
          </el-tabs>
          <div class="sub-nav-filter">
            <el-button
              type="primary"
              @click="drawerVisible = true"
              class="filter-drawer-btn"
            >
              <el-icon><Filter /></el-icon>
              筛选
            </el-button>
          </div>
        </div>
      </div>
      <el-drawer
        v-model="drawerVisible"
        title="筛选订单"
        direction="rtl"
        size="500px"
        :with-header="true"
      >
        <div class="drawer-section">
          <div class="drawer-section-title">订单状态</div>
          <div class="drawer-status-group">
            <div class="status-block-row">
              <div
                :class="[
                  'status-block',
                  drawerStatus === 'all' ? 'active' : '',
                ]"
                @click="onDrawerStatusClick('all')"
              >
                全部
              </div>
              <div
                v-if="mainTab === 'published'"
                :class="[
                  'status-block',
                  drawerStatus === 'untaken' ? 'active' : '',
                ]"
                @click="onDrawerStatusClick('untaken')"
              >
                未接手
              </div>
            </div>
          </div>
          <div class="drawer-status-group">
            <div class="group-title">进行中</div>
            <div class="status-block-row">
              <div
                v-for="item in filteredProcessingStatus"
                :key="item.value"
                :class="[
                  'status-block',
                  drawerStatus === item.value ? 'active' : '',
                ]"
                @click="onDrawerStatusClick(item.value)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
          <div class="drawer-status-group">
            <div class="group-title">异常中</div>
            <div class="status-block-row">
              <div
                v-for="item in currentStatusGroup.abnormal"
                :key="item.value"
                :class="[
                  'status-block',
                  drawerStatus === item.value ? 'active' : '',
                ]"
                @click="onDrawerStatusClick(item.value)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
          <div class="drawer-status-group">
            <div class="group-title">已完成</div>
            <div class="status-block-row">
              <div
                v-for="item in currentStatusGroup.completed"
                :key="item.value"
                :class="[
                  'status-block',
                  drawerStatus === item.value ? 'active' : '',
                ]"
                @click="onDrawerStatusClick(item.value)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </el-drawer>
      <!-- 搜索栏 -->
      <div
        style="
          margin: 16px 0 24px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <el-input
          v-model="searchInput"
          placeholder="搜索标题/订单号/发单人/接单人"
          style="width: 260px"
          @keyup.enter="fetchOrderList"
        />
        <el-button type="primary" @click="fetchOrderList"
          ><el-icon><Search /></el-icon>搜索</el-button
        >
      </div>
      <div class="order-content">
        <div v-if="loading" style="text-align: center; padding: 40px 0">
          加载中...
        </div>
        <template v-else>
          <div
            v-if="orderList.length === 0"
            style="text-align: center; padding: 40px 0"
          >
            暂无订单
          </div>
          <div v-else class="order-list">
            <div
              class="order-card"
              v-for="item in orderList"
              :key="item.id"
              @click="goToOrderDetail(item)"
            >
              <!-- 游戏图标（如有） -->
              <div class="game-icon">
                <img
                  v-if="getGameIcon(item.gameId)"
                  :src="getGameIcon(item.gameId)"
                  :alt="item.gameName"
                  class="game-icon-img"
                />
                <svg v-else class="game-icon-img" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="16" fill="#eee" />
                  <text
                    x="50%"
                    y="55%"
                    text-anchor="middle"
                    fill="#bbb"
                    font-size="14"
                    dy=".3em"
                  >
                    🎮
                  </text>
                </svg>
              </div>
              <!-- 主要信息区域 -->
              <div class="order-content">
                <div class="order-title">{{ item.title }}</div>
                <div
                  class="order-no"
                  @click.stop="copyOrderNo(item.orderNo)"
                  title="点击复制订单号"
                >
                  <span class="order-no-label">订单号：</span>
                  <span class="order-no-value">{{ item.orderNo }}</span>
                  <el-icon class="copy-icon"><CopyDocument /></el-icon>
                </div>
                <div class="order-details">
                  <span class="game-info">
                    {{ item.gameName }} / {{ item.systemName
                    }}<span v-if="item.serverName">
                      / {{ item.serverName }}</span
                    >
                  </span>
                  <span class="service-type">{{
                    getBoostingTypeName(item.boostingType)
                  }}</span>
                  <span class="order-status">{{
                    getOrderStatusName(item.status)
                  }}</span>
                </div>
                <div class="guarantee-row">
                  <span class="guarantee-item">
                    <span class="guarantee-icon">✅</span>
                    <span>安全保证金：¥{{ item.securityDeposit }}</span>
                  </span>
                  <span class="guarantee-item">
                    <span class="guarantee-icon">✅</span>
                    <span>效率保证金：¥{{ item.efficiencyDeposit }}</span>
                  </span>
                </div>
                <div class="publisher-row">
                  <span class="publisher-name" v-if="mainTab === 'taken'">
                    发布者：
                    {{
                      item.publisherUsername ||
                      '用户' +
                        (item.publisherId
                          ? String(item.publisherId).slice(-4)
                          : '') ||
                      '未知用户'
                    }}
                  </span>
                  <span class="publisher-name" v-if="mainTab === 'published'">
                    代练者：
                    {{
                      item.takerUsername ||
                      '用户' +
                        (item.takerId ? String(item.takerId).slice(-4) : '') ||
                      '暂无接单人'
                    }}
                  </span>
                </div>
              </div>
              <!-- 右侧：价格和操作 -->
              <div class="order-right">
                <div class="price-info">
                  <div class="current-price">¥{{ item.price }}</div>
                </div>
                <div class="action-info">
                  <div class="publish-time">
                    {{ formatTime(item.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
            <div
              style="
                margin: 24px 0 0 0;
                display: flex;
                justify-content: flex-end;
              "
            >
              <el-pagination
                background
                layout="sizes, prev, pager, next, jumper"
                :total="total"
                :page-size="pageSize"
                :current-page="page"
                :page-sizes="[10, 20, 50, 100]"
                @current-change="
                  (val) => {
                    page.value = val
                  }
                "
                @size-change="
                  (val) => {
                    pageSize.value = val
                    page.value = 1
                  }
                "
              />
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import {
  ElButton,
  ElButtonGroup,
  ElTabs,
  ElTabPane,
  ElSelect,
  ElOption,
  ElDrawer,
  ElIcon,
  ElMessage,
} from 'element-plus'
import { Filter, Search, CopyDocument } from '@element-plus/icons-vue'
import { getOrderInfoList } from '@/api/order/order'
import { getGameList } from '@/api/game/game'
import { useUserStore } from '@/stores/modules/user'
import settings from '@/settings'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const mainTab = ref('taken')
const subTabs = {
  taken: [
    { label: '全部', value: 'all' },
    { label: '代练中', value: 'doing' },
    { label: '待验收', value: 'wait_check' },
    { label: '撤销中', value: 'revoking' },
    { label: '待介入', value: 'wait_intervene' },
    { label: '介入中', value: 'intervening' },
    { label: '已撤销', value: 'revoked' },
    { label: '已仲裁', value: 'arbitrated' },
    { label: '已完成', value: 'settled' },
  ],
  published: [
    { label: '全部', value: 'all' },
    { label: '未接手', value: 'untaken' },
    { label: '代练中', value: 'doing' },
    { label: '待验收', value: 'wait_check' },
    { label: '撤销中', value: 'revoking' },
    { label: '待介入', value: 'wait_intervene' },
    { label: '介入中', value: 'intervening' },
    { label: '已撤销', value: 'revoked' },
    { label: '已仲裁', value: 'arbitrated' },
    { label: '已完成', value: 'settled' },
  ],
}
const subTab = ref(subTabs[mainTab.value][0].value)

// 游戏列表数据
const gameList = ref([])

async function fetchGameList() {
  try {
    const res = await getGameList()
    console.log('游戏列表接口返回：', res)
    const records = Array.isArray(res.data) ? res.data : res.data?.records || []
    console.log('游戏列表数据:', records)
    gameList.value = records.map((g) => ({
      label: g.name,
      value: g.id,
      icon: g.icon,
    }))
  } catch {
    gameList.value = []
  }
}

onMounted(async () => {
  await fetchGameList()
  // 确保用户信息已加载后再发送订单列表请求
  if (userStore.userId) {
    fetchOrderList()
  } else {
    // 如果用户信息还没加载，等待一下再请求
    setTimeout(() => {
      if (userStore.userId) {
        fetchOrderList()
      }
    }, 1000)
  }
})

// 当前选中的游戏筛选
const selectedGame = ref('all')

// 处理游戏筛选
const handleGameFilter = (value) => {
  selectedGame.value = value
  console.log('筛选游戏:', value)
  // 这里可以添加筛选逻辑
}

watch(mainTab, (val) => {
  subTab.value = subTabs[val][0].value
})

const drawerVisible = ref(false)
const drawerStatus = ref('')

const statusGroupTaken = {
  processing: [
    { label: '代练中', value: 'doing' },
    { label: '待验收', value: 'wait_check' },
    { label: '撤销中', value: 'revoking' },
    { label: '待介入', value: 'wait_intervene' },
    { label: '介入中', value: 'intervening' },
  ],
  abnormal: [
    { label: '撤销中', value: 'revoking' },
    { label: '待介入', value: 'wait_intervene' },
    { label: '介入中', value: 'intervening' },
  ],
  completed: [
    { label: '已撤销', value: 'revoked' },
    { label: '已仲裁', value: 'arbitrated' },
    { label: '已完成', value: 'settled' },
  ],
}
const statusGroupPublished = {
  processing: [
    { label: '未接手', value: 'untaken' },
    { label: '代练中', value: 'doing' },
    { label: '待验收', value: 'wait_check' },
    { label: '撤销中', value: 'revoking' },
    { label: '待介入', value: 'wait_intervene' },
    { label: '介入中', value: 'intervening' },
  ],
  abnormal: [
    { label: '撤销中', value: 'revoking' },
    { label: '待介入', value: 'wait_intervene' },
    { label: '介入中', value: 'intervening' },
  ],
  completed: [
    { label: '已撤销', value: 'revoked' },
    { label: '已仲裁', value: 'arbitrated' },
    { label: '已完成', value: 'settled' },
  ],
}
const currentStatusGroup = computed(() =>
  mainTab.value === 'taken' ? statusGroupTaken : statusGroupPublished
)

const filteredProcessingStatus = computed(() =>
  currentStatusGroup.value.processing.filter((item) => {
    // 在"我发布的"状态下过滤掉"未接手"，在"我接手的"状态下不过滤
    return mainTab.value === 'published' ? item.value !== 'untaken' : true
  })
)

const onDrawerStatusClick = (val) => {
  drawerStatus.value = val
  subTab.value = val
  drawerVisible.value = false
}

const orderList = ref([
  {
    id: '4',
    orderNo: 'ORD1946184895462215680',
    publisherId: '1941702395802017793',
    title: '火影忍者sefe',
    gameId: 4,
    systemId: 1,
    serverId: null,
    boostingType: 1,
    price: 100.0,
    securityDeposit: 10.0,
    efficiencyDeposit: 10.0,
    status: 1,
    createdAt: 1752841612000,
    publisherUsername: 'admin',
    gameName: '火影忍者',
    systemName: '安卓QQ',
    serverName: null,
    takerId: '1941702395802017793',
    takerUsername: 'admin',
  },
  {
    id: '5',
    orderNo: 'ORD1946184895462215681',
    publisherId: '1941702395802017794',
    title: '王者荣耀',
    gameId: 1,
    systemId: 2,
    serverId: 1,
    boostingType: 2,
    price: 200.0,
    securityDeposit: 20.0,
    efficiencyDeposit: 20.0,
    status: 2,
    createdAt: 1752841612001,
    publisherUsername: 'user123',
    gameName: '王者荣耀',
    systemName: 'iOS',
    serverName: '1区',
    takerId: '1941702395802017795',
    takerUsername: 'user456',
  },
])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const searchInput = ref('')

const statusValueMap = {
  // 通用状态映射
  1: 1, // 未接手
  2: 2, // 代练中
  3: 3, // 待验收
  4: 4, // 验收中
  5: 5, // 已完成
  6: 6, // 已撤销
  7: 7, // 撤销中
  8: 8, // 待介入
  9: 9, // 介入中
  10: 10, // 已仲裁

  // 字符串状态映射
  untaken: 1, // 未接手
  doing: 2, // 代练中
  wait_check: 3, // 待验收
  checking: 4, // 验收中
  settled: 5, // 已完成
  revoked: 6, // 已撤销
  revoking: 7, // 撤销中
  wait_intervene: 8, // 待介入
  intervening: 9, // 介入中
  arbitrated: 10, // 已仲裁
}

function fetchOrderList() {
  loading.value = true
  let statusParam
  if (subTab.value !== 'all') {
    statusParam = statusValueMap[subTab.value] || subTab.value
    // 如果 subTab.value 是数字（如直接点“全部”），就直接用
  }
  // 构建基础参数
  const params = {
    page: page.value,
    pageSize: pageSize.value,
  }

  // 只添加有值的参数
  if (selectedGame.value !== 'all') {
    params.gameId = selectedGame.value
  }

  if (subTab.value !== 'all' && statusParam) {
    params.status = statusParam
  }

  if (searchInput.value && searchInput.value.trim()) {
    params.title = searchInput.value.trim()
  }
  // 添加用户ID参数
  if (mainTab.value === 'taken') {
    params.takerId = userStore.userId
  } else {
    params.publisherId = userStore.userId
  }

  console.log('请求参数:', params)

  getOrderInfoList(params)
    .then((res) => {
      console.log('订单列表接口返回：', res)
      // 兼容后端返回结构
      const data = res.data || {}
      orderList.value = data.records || data.list || []
      total.value = data.total || 0
    })
    .finally(() => {
      loading.value = false
    })
}

// 监听参数变化，重新获取订单列表
watch([mainTab, subTab, selectedGame, page, pageSize], () => {
  // 只有在用户ID存在时才发送请求
  if (userStore.userId) {
    fetchOrderList()
  }
})

// 辅助方法
function getBoostingTypeName(type) {
  const typeMap = { 1: '代练', 2: '陪练' }
  return typeMap[type] || '普通代练'
}
function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(Number(ts))
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
}

function getOrderStatusName(status) {
  const map = {
    1: '未接手',
    2: '代练中',
    3: '待验收',
    4: '验收中',
    5: '已完成',
    6: '已撤销',
    7: '撤销中',
    8: '待介入',
    9: '介入中',
    10: '已仲裁',
    11: '强制撤销',
  }
  return map[status] || '未知'
}

// 获取游戏icon
function getGameIcon(gameId) {
  const game = gameList.value.find((g) => g.value === gameId)
  if (game && game.icon) {
    // 使用settings.imgBaseUrl作为前缀
    return game.icon.startsWith('http')
      ? game.icon
      : game.icon
        ? settings.imgBaseUrl + game.icon
        : null
  }
  return null
}

// 跳转到订单详情页
function goToOrderDetail(item) {
  if (mainTab.value === 'taken') {
    router.push(`/order-list/taken/${item.id}`)
  } else {
    router.push(`/order-list/published/${item.id}`)
  }
}

function copyOrderNo(orderNo) {
  navigator.clipboard
    .writeText(orderNo)
    .then(() => {
      ElMessage.success('订单号已复制')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}
</script>

<style scoped>
.order-list-page {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  justify-content: center;
  padding: 20px 0;
}

.main-content {
  flex: 1;
  max-width: 1000px;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin: 0 20px;
}

.main-nav-with-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.main-nav .el-button-group {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.main-nav .el-button {
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.main-nav .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-tools {
  display: flex;
  gap: 12px;
}

.tool-btn {
  color: #666;
  font-size: 16px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.tool-btn:hover {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

/* 游戏筛选选择器样式 */
.game-filter-select {
  width: 180px;
  margin-right: 12px;
}

.game-filter-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.game-filter-select :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.game-filter-select :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.sub-nav {
  margin-bottom: 24px;
}

.sub-nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub-tabs {
  --el-tabs-header-height: 44px;
  flex: 1;
}

.sub-nav-filter {
  margin-left: 16px;
}

.status-filter-select {
  width: 240px;
}

.status-filter-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.status-filter-select :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.status-filter-select :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.sub-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.sub-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0;
}

.sub-tabs :deep(.el-tabs__item) {
  padding: 0 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.sub-tabs :deep(.el-tabs__item:hover) {
  color: #409eff;
}

.sub-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
  font-weight: 600;
}

.sub-tabs :deep(.el-tabs__active-bar) {
  background-color: #409eff;
  height: 3px;
  border-radius: 2px;
}

.order-content {
  min-height: 400px;
  background: #fafbfc;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e9ecef;
}
.filter-drawer-btn {
  width: 80px;
  font-weight: 500;
}
.drawer-section {
  margin-bottom: 32px;
  padding-left: 4px;
}
.drawer-section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}
.drawer-group-label {
  font-size: 13px;
  color: #888;
  margin: 12px 0 4px 0;
}
.drawer-footer {
  position: absolute;
  bottom: 24px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px;
  background: #fff;
}
.drawer-status-group {
  margin-bottom: 18px;
}
.group-title {
  font-size: 15px;
  font-weight: 600;
  color: #888;
  margin-bottom: 10px;
  text-align: left;
  letter-spacing: 1px;
}
.group-radio-row .el-radio {
  margin-right: 18px;
  margin-bottom: 6px;
  display: inline-block;
}
.status-block-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 20px;
  margin-bottom: 18px;
  justify-content: flex-start;
}
.status-block {
  background: #f4f6fa;
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  border: 1.5px solid #e0e3ea;
  transition: all 0.18s;
  margin-bottom: 6px;
  box-shadow: 0 1px 2px rgba(80, 120, 200, 0.04);
  user-select: none;
}

.status-block:hover {
  background: #eaf3ff;
  border-color: #409eff;
  color: #409eff;
}

.status-block.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.13);
}

:deep(.el-drawer),
:deep(.el-drawer__header),
:deep(.el-drawer__body) {
  background: #f8fafd !important;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.order-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  padding: 12px 8px;
  min-height: 64px;
  margin-bottom: 2px;
}
.order-card:hover {
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
  cursor: pointer;
  transform: translateY(-1px);
  transition: all 0.2s ease;
}
.game-icon {
  width: 48px;
  height: 48px;
  margin-right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.game-icon-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}
.order-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 22px;
  gap: 0;
}
.order-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 最多显示2行 */
  line-clamp: 2; /* 标准属性，用于兼容性 */
  -webkit-box-orient: vertical;
  word-break: break-all; /* 允许在任意字符间换行 */
  white-space: normal; /* 允许换行 */
  cursor: pointer;
  transition: all 0.2s ease;
}

.order-title:hover {
  -webkit-line-clamp: unset; /* 悬浮时显示全部内容 */
  line-clamp: unset; /* 标准属性，用于兼容性 */
  background: rgba(64, 158, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  position: relative;
  z-index: 10;
}
.order-no {
  font-size: 13px;
  color: #b0b3b8;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: text;
  transition: color 0.2s;
}
.order-no:hover {
  color: #409eff;
}
.order-no-label {
  color: #b0b3b8;
  font-weight: 500;
}
.order-no-value {
  font-family: 'Fira Mono', 'Consolas', monospace;
  letter-spacing: 0.5px;
  font-size: 13px;
  color: #888;
  background: #f4f6fa;
  border-radius: 4px;
  padding: 1px 6px;
  margin-right: 2px;
}
.copy-icon {
  font-size: 15px;
  color: #b0b3b8;
  transition: color 0.2s;
}
.order-no:hover .copy-icon {
  color: #409eff;
}
.order-details,
.guarantee-row,
.publisher-row {
  font-size: 14px;
  color: #888;
  display: flex;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.order-right {
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
}
.price-info {
  font-size: 13px;
  color: #ff4d4f;
  font-weight: 600;
}
.current-price {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: 700;
}
.action-info {
  font-size: 9px;
  color: #aaa;
}
.publish-time {
  margin-bottom: 0;
}
.order-status {
  color: #409eff;
  font-weight: 500;
  margin-left: 6px;
}
</style>
