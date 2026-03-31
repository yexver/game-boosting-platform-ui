<template>
  <div class="take-order-page">
    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <input
          class="search-input"
          v-model="searchInput"
          placeholder="标题/订单号/发单人"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">搜索</button>
        <el-button type="success" @click="showTakeRecommend = true" class="ai-recommend-btn">
          <el-icon><Cpu /></el-icon>
          AI智能匹配
        </el-button>
      </div>

      <!-- 筛选条件 -->
      <div class="filters">
        <div
          class="selected-filters"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 4px;
            "
          >
            已选条件：
            <template
              v-if="
                selectedPrice !== 0 ||
                selectedSort !== 0 ||
                selectedGame ||
                selectedSystem ||
                selectedServer ||
                selectedType
              "
            >
              <el-tag v-if="selectedPrice !== 0" size="small">
                {{ priceOptions[selectedPrice] }}
              </el-tag>
              <el-tag v-if="selectedSort !== 0" size="small">
                {{ sortOptions[selectedSort] }}
              </el-tag>
              <el-tag v-if="selectedGame" size="small">
                {{ gameOptions.find((g) => g.value === selectedGame)?.label }}
              </el-tag>
              <el-tag v-if="selectedSystem" size="small">
                {{
                  systemOptions.find((s) => s.value === selectedSystem)?.label
                }}
              </el-tag>
              <el-tag v-if="selectedServer" size="small">
                {{
                  serverOptions.find((s) => s.value === selectedServer)?.label
                }}
              </el-tag>
              <el-tag v-if="selectedType" size="small">
                {{ typeOptions.find((t) => t.value === selectedType)?.label }}
              </el-tag>
            </template>
          </div>
          <el-button
            type="primary"
            circle
            size="small"
            @click="showFilters = !showFilters"
          >
            <el-icon><ArrowDown /></el-icon>
          </el-button>
        </div>
        <template v-if="showFilters">
          <div class="filter-row">
            <span>订单价格：</span>
            <el-button-group>
              <el-button
                v-for="(item, idx) in priceOptions"
                :key="item"
                :type="selectedPrice === idx ? 'primary' : 'default'"
                size="small"
                @click="selectPrice(idx)"
              >
                {{ item }}
              </el-button>
            </el-button-group>
          </div>
          <div class="filter-row">
            <span>订单排序：</span>
            <el-button-group>
              <el-button
                v-for="(item, idx) in sortOptions"
                :key="item"
                :type="selectedSort === idx ? 'primary' : 'default'"
                size="small"
                @click="selectSort(idx)"
              >
                {{ item }}
              </el-button>
            </el-button-group>
          </div>
          <div class="filter-row">
            <span>其它信息：</span>
            <el-select
              v-model="selectedGame"
              placeholder="游戏"
              size="small"
              style="width: 100px; margin-right: 8px"
              filterable
            >
              <el-option label="全部游戏" value="" />
              <el-option
                v-for="g in gameOptions"
                :key="g.value"
                :label="g.label"
                :value="g.value"
              />
            </el-select>
            <el-select
              v-model="selectedSystem"
              placeholder="系统"
              size="small"
              style="width: 100px; margin-right: 8px"
            >
              <el-option label="全部系统" value="" />
              <el-option
                v-for="s in systemOptions"
                :key="s.value"
                :label="s.label"
                :value="s.value"
              />
            </el-select>
            <el-select
              v-model="selectedServer"
              placeholder="区服"
              size="small"
              style="width: 100px; margin-right: 8px"
            >
              <el-option label="全部区服" value="" />
              <el-option
                v-for="s in serverOptions"
                :key="s.value"
                :label="s.label"
                :value="s.value"
              />
            </el-select>
            <el-select
              v-model="selectedType"
              placeholder="代练类型"
              size="small"
              style="width: 110px"
            >
              <el-option label="全部类型" value="" />
              <el-option
                v-for="t in typeOptions"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              />
            </el-select>
          </div>
        </template>
      </div>

      <!-- 订单列表 -->
      <div class="order-list" v-loading="loading">
        <template v-if="!loading && orderList.length === 0">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <div class="empty-text">暂无订单</div>
          </div>
        </template>
        <template v-else>
          <div class="order-card" v-for="item in orderList" :key="item.id">
            <!-- 游戏图标 -->
            <div class="game-icon" v-if="getGameIcon(item.gameName)">
              <img
                :src="getGameIcon(item.gameName)"
                :alt="item.gameName"
                class="game-icon-img"
              />
            </div>

            <!-- 主要信息区域 -->
            <div class="order-content">
              <!-- 第一行：标题 -->
              <div class="order-title">{{ item.title }}</div>

              <!-- 第二行：游戏信息和服务类型 -->
              <div class="order-details">
                <span class="game-info">
                  {{ item.gameName }} / {{ item.systemName }}
                  <span v-if="item.serverName"> / {{ item.serverName }}</span>
                </span>
                <span class="service-type">{{
                  getBoostingTypeName(item.boostingType)
                }}</span>
              </div>

              <!-- 第三行：保障信息 -->
              <div class="guarantee-row">
                <span class="guarantee-item">
                  <span class="guarantee-icon">⏰</span>
                  <span>6小时完成</span>
                </span>
                <span class="guarantee-item">
                  <span class="guarantee-icon">✅</span>
                  <span>安全保证金：¥{{ item.securityDeposit }}</span>
                </span>
                <span class="guarantee-item">
                  <span class="guarantee-icon">✅</span>
                  <span>效率保证金：¥{{ item.efficiencyDeposit }}</span>
                </span>
              </div>

              <!-- 第四行：发单人信息 -->
              <div class="publisher-row">
                <span class="publisher-name">
                  {{
                    item.publisherUsername ||
                    '用户' + item.publisherId?.slice(-4) ||
                    '未知用户'
                  }}
                </span>
                <span class="publisher-stats">
                  (近30天{{ item.publisherOrderCount30d }}单，客服介入率{{
                    (item.publisherManagerRate30d * 100).toFixed(1)
                  }}%)
                </span>
              </div>
            </div>

            <!-- 右侧：价格和操作 -->
            <div class="order-right">
              <div class="price-info">
                <div class="current-price">¥{{ formatPrice(item.price) }}</div>
                <div class="original-price">
                  ¥{{ formatPrice(item.price * 0.8) }}
                </div>
              </div>
              <div class="action-info">
                <div class="publish-time">{{ formatTime(item.createdAt) }}</div>
                <button class="take-order-btn" @click="handleTakeOrder(item)">
                  立即接单
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </main>

    <!-- AI接单推荐组件 -->
    <TakeOrderRecommend
      v-model="showTakeRecommend"
      :user-profile="userProfile"
      :available-orders="orderList"
      @jump="handleJumpToOrder"
    />
  </div>
</template>

<script setup>
import { getGameList, getSystemList, getServerList } from '@/api/game/game'
import { onMounted, ref, watch, computed } from 'vue'
import {
  ElButton,
  ElButtonGroup,
  ElSelect,
  ElOption,
  ElTag,
  ElIcon,
} from 'element-plus'
import { ArrowDown, Cpu } from '@element-plus/icons-vue'
import { getOrderList } from '@/api/order/takeOrder'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import settings from '@/settings'
import TakeOrderRecommend from '@/views/recommend/TakeOrderRecommend.vue'

const priceOptions = [
  '不限',
  '10元以下',
  '10-50元',
  '50-100元',
  '100-200元',
  '200元以上',
]
const sortOptions = [
  '不限',
  '代练价从高到低',
  '代练价从低到高',
  '安全保证金从低到高',
  '安全保证金从高到低',
  '效率保证金从低到高',
  '效率保证金从高到低',
]

const gameOptions = ref([])
const systemOptions = ref([])
const serverOptions = ref([])

const selectedPrice = ref(0)
const selectedSort = ref(0)
const selectedGame = ref('')
const selectedSystem = ref('')
const selectedServer = ref('')
const selectedType = ref('')

const currentPage = ref(1)
const pageSize = ref(10)
const orderList = ref([])
const total = ref(0)
const searchInput = ref('')
const loading = ref(false)
const showFilters = ref(false)

// AI推荐相关
const showTakeRecommend = ref(false)

// 用户画像（用于AI推荐）
const userStore = useUserStore()
const userProfile = computed(() => ({
  userId: userStore.userId,
  preferredGameIds: selectedGame.value ? [selectedGame.value] : [],
  preferredGameNames: selectedGame.value
    ? [gameOptions.value.find((g) => g.value === selectedGame.value)?.label]
    : [],
  maxTimeLimit: 72,
  minPrice: selectedPrice.value > 0 ? getMinPrice(selectedPrice.value) : null,
  completionRate: 95,
  avgIncome: null,
  boostingType: selectedType.value || null,
}))

// 根据价格选项获取最低价
function getMinPrice(priceIndex) {
  const priceMap = {
    1: null, // 不限
    2: null,
    3: 10,
    4: 50,
    5: 100,
    6: 200,
  }
  return priceMap[priceIndex] || null
}

// AI推荐跳转
function handleJumpToOrder(order) {
  router.push(`/take-order/${order.orderId}`)
}

const typeOptions = [
  { label: '代练', value: 1 },
  { label: '陪练', value: 2 },
]

// 获取游戏图标
function getGameIcon(gameName) {
  if (!gameName) return null

  // 从游戏选项中查找对应的游戏数据
  const game = gameOptions.value.find((g) => g.label === gameName)

  if (game && game.icon) {
    // 如果有真实图标，返回完整的图片路径
    return game.icon.startsWith('http')
      ? game.icon
      : settings.imgBaseUrl + game.icon
  }

  // 如果没有图标，返回null
  return null
}

// 获取代练类型名称
function getBoostingTypeName(type) {
  const typeMap = {
    1: '代练',
    2: '陪练',
  }
  return typeMap[type] || '普通代练'
}

// 格式化价格
function formatPrice(price) {
  return Number(price).toFixed(2)
}

// 格式化时间
function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(Number(ts))
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) {
    // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

// 接单处理 - 跳转到详情页
function handleTakeOrder(order) {
  router.push(`/take-order/${order.id}`)
}

function handlePageChange(page) {
  currentPage.value = page
  fetchOrderList()
}

function handleSizeChange(size) {
  pageSize.value = size
  fetchOrderList()
}

function selectPrice(idx) {
  selectedPrice.value = idx
}

function selectSort(idx) {
  selectedSort.value = idx
}

function handleSearch() {
  currentPage.value = 1
  fetchOrderList()
}

async function fetchOrderList() {
  // 转换价格筛选条件
  let priceMin = null
  let priceMax = null

  if (selectedPrice.value === 1) {
    // 10元以下
    priceMax = 10
  } else if (selectedPrice.value === 2) {
    // 10-50元
    priceMin = 10
    priceMax = 50
  } else if (selectedPrice.value === 3) {
    // 50-100元
    priceMin = 50
    priceMax = 100
  } else if (selectedPrice.value === 4) {
    // 100-200元
    priceMin = 100
    priceMax = 200
  } else if (selectedPrice.value === 5) {
    // 200元以上
    priceMin = 200
  }

  const params = {
    title: searchInput.value,
    publisher: searchInput.value, // 添加发布者搜索参数
    gameId: selectedGame.value,
    systemId: selectedSystem.value,
    serverId: selectedServer.value,
    status: 1,
    type: selectedType.value || null, // 确保空值时传递null而不是空字符串
    priceMin: priceMin,
    priceMax: priceMax,
    sort: selectedSort.value,
    page: currentPage.value,
    pageSize: pageSize.value,
  }
  loading.value = true
  try {
    const res = await getOrderList(params)
    orderList.value = res.data?.list || []
    total.value = Number(res.data?.total) || 0
  } catch (e) {
    console.error('订单列表接口出错', e)
  } finally {
    loading.value = false
  }
}

// 初始化游戏数据
async function initGameData() {
  try {
    const res = await getGameList()
    const games = res.data || []

    gameOptions.value = games.map((g) => ({
      label: g.name,
      value: g.id,
      icon: g.icon, // 保存图标路径
    }))

    // 处理从首页传递的搜索参数
    if (route.query.search) {
      searchInput.value = route.query.search
    }

    // 自动选中首页传递的游戏
    if (route.query.game) {
      const found = gameOptions.value.find((g) => g.label === route.query.game)
      if (found) {
        selectedGame.value = found.value
      }
    } else {
      // 如果没有从首页传递游戏参数，默认选择"全部游戏"
      selectedGame.value = ''
    }
  } catch (e) {
    console.error('获取游戏列表失败', e)
  }
}

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  await initGameData()

  // 处理从订单详情页传递的发布者参数
  if (route.query.publisher) {
    searchInput.value = route.query.publisher
    // 自动执行搜索
    await fetchOrderList()
  } else {
    fetchOrderList()
  }
})

watch(
  [
    selectedGame,
    selectedSystem,
    selectedServer,
    selectedType,
    selectedPrice,
    selectedSort,
    currentPage,
    pageSize,
  ],
  fetchOrderList
)

watch(selectedGame, async (gameId) => {
  if (!gameId) {
    // 当选择"全部游戏"时，清空系统和区服选项
    systemOptions.value = []
    selectedSystem.value = ''
    serverOptions.value = []
    selectedServer.value = ''
    return
  }
  try {
    const res = await getSystemList(gameId)
    const systems = res.data || []
    systemOptions.value = systems.map((s) => ({
      label: s.name,
      value: s.id,
    }))

    selectedSystem.value = ''
    serverOptions.value = []
    selectedServer.value = ''
  } catch (e) {
    console.error('获取系统列表失败', e)
  }
})

watch(selectedSystem, async (systemId) => {
  if (!selectedGame.value || !systemId) {
    // 当选择"全部系统"或没有选择游戏时，清空区服选项
    serverOptions.value = []
    selectedServer.value = ''
    return
  }
  try {
    const res = await getServerList(selectedGame.value, systemId)
    const servers = res.data || []
    serverOptions.value = servers.map((s) => ({
      label: s.name,
      value: s.id,
    }))

    selectedServer.value = ''
  } catch (e) {
    console.error('获取区服列表失败', e)
  }
})
</script>

<style scoped>
.take-order-page {
  display: flex;
  background: #f7f8fa;
  min-height: 100vh;
  justify-content: center;
}

.main-content {
  flex: 1;
  max-width: 1000px;
  padding: 32px 24px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 18px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 10px 16px;
  border-radius: 6px;
  background: #f5f6fa;
  margin-right: 16px;
}

.search-btn {
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #337ecc;
}

.ai-recommend-btn {
  margin-left: 12px;
}

.filters {
  background: #fff;
  border-radius: 12px;
  padding: 18px 24px 8px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-row {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.filter-row span {
  font-weight: 600;
  color: #222;
  min-width: 90px;
  text-align: right;
  margin-right: 18px;
  font-size: 15px;
  letter-spacing: 1px;
}

.selected-filters {
  margin-bottom: 4px;
  color: #666;
  font-size: 14px;
  min-height: 28px;
  display: flex;
  align-items: center;
}

/* 订单卡片样式 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 主要内容区域 */
.order-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.main-info {
  flex: 1;
  min-width: 0;
}

.order-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-info {
  font-size: 14px;
  color: #666;
}

.service-type {
  font-size: 12px;
  color: #999;
  background: #f0f8ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.service-type {
  font-size: 12px;
  color: #999;
  background: #f0f8ff;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.game-icon {
  width: 40px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.icon-text {
  font-size: 20px;
  color: #fff;
}

.game-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.title-content {
  flex: 1;
  min-width: 0;
  overflow: hidden; /* 确保内容不会溢出 */
}

.order-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.order-title:hover {
  white-space: normal;
  word-break: break-word;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  position: relative;
  z-index: 10;
}

.order-subtitle {
  font-size: 12px;
  color: #666;
}

/* 右侧区域 */
.order-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 100px;
  flex-shrink: 0;
}

.price-info {
  text-align: right;
}

.action-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff4757;
  margin-bottom: 2px;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

/* 中间区域 - 已移除，使用新的布局 */

.guarantee-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.publisher-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.publisher-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.publisher-stats {
  color: #999;
  font-size: 12px;
}

.guarantee-row {
  display: flex;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.info-label {
  color: #666;
  min-width: 70px;
  flex-shrink: 0;
}

.info-value {
  color: #333;
  flex: 1;
  word-break: break-all;
}

.publisher-stats {
  color: #999;
  font-size: 12px;
  margin-left: 8px;
}

.guarantee-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  gap: 4px;
  white-space: nowrap;
}

.guarantee-icon {
  font-size: 14px;
}

.action-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.publish-time {
  font-size: 12px;
  color: #999;
}

.take-order-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.take-order-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0 0 0;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-card {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }

  .order-left {
    min-width: auto;
    width: 100%;
  }

  .order-right {
    min-width: auto;
    width: 100%;
    align-items: flex-start;
  }

  .price-section {
    text-align: left;
  }

  .action-section {
    align-items: flex-start;
  }

  .take-order-btn {
    width: 100%;
  }
}
</style>
