<template>
  <div class="booster-list-bg"></div>
  <div class="booster-list-page esports">
    <div class="booster-header-fixed">
      <h2 class="booster-title">寻找优质打手</h2>
      <div class="booster-list-desc">选择心仪的打手，点击"联系"沟通下单！</div>

      <div class="booster-search-bar">
        <div
          class="booster-list-tools booster-list-tools-plain booster-list-tools-top"
        >
          <button class="back-btn search-back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </button>
          <el-select
            v-model="searchGameId"
            placeholder="请选择游戏"
            style="width: 180px; margin-right: 16px"
            filterable
            :clearable="false"
            @change="onGameChange"
            class="booster-search-input"
          >
            <el-option
              v-for="game in gameList"
              :key="game.id"
              :label="game.name"
              :value="game.id"
            />
          </el-select>
          <el-input
            v-model="searchUsername"
            placeholder="搜索用户名"
            style="width: 200px; margin-right: 16px"
            @keyup.enter="handleSearch"
            clearable
            class="booster-search-input"
          />
          <el-button
            type="primary"
            class="booster-search-btn"
            @click="handleSearch"
            >搜索</el-button
          >
        </div>
      </div>
    </div>
    <div v-if="boosterList.length > 0" class="booster-card-list">
      <div
        v-for="booster in boosterList"
        :key="booster.userId"
        class="booster-card esports-card"
      >
        <div class="booster-avatar-wrap">
          <el-avatar
            :src="getAvatarUrl(booster.avatar)"
            :size="80"
            class="booster-avatar esports-avatar"
          />
        </div>
        <div class="booster-info">
          <div class="booster-username-row">
            <span class="booster-username esports-username">{{
              booster.username
            }}</span>
          </div>
          <div class="booster-stats esports-stats">
            <span
              >近30天接单 <b>{{ booster.orderCount30d }}</b></span
            >
            <span
              >正常完单 <b>{{ booster.finishCount30d }}</b></span
            >
            <span
              >客服介入率
              <b>{{ (booster.managerRate30d * 100).toFixed(1) }}%</b></span
            >
          </div>
        </div>
        <el-button
          type="success"
          class="contact-btn esports-btn"
          @click="contactBooster(booster)"
        >
          <el-icon><ChatDotRound /></el-icon> 联系
        </el-button>
      </div>
    </div>
    <div
      v-else-if="searchGameId"
      style="margin: 40px 0; color: #a3bfff; text-align: center"
    >
      暂无打手数据
    </div>
    <div style="margin-top: 24px; text-align: right" v-if="total > pageSize">
      <el-pagination
        background
        layout="sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getBoostingUserList } from '@/api/order/postOrder'
import { getGameList } from '@/api/game/game'
import settings from '@/settings'
import { ChatDotRound, ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const boosterList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchUsername = ref('')
const searchGameId = ref(null)
const gameList = ref([])
const loading = ref(false)

const userStore = useUserStore()
const currentUserId = userStore.userInfo?.userId

function getAvatarUrl(avatar) {
  if (!avatar) return settings.imgBaseUrl + 'avatar.jpeg'
  return avatar.startsWith('http') ? avatar : settings.imgBaseUrl + avatar
}

async function fetchGameList() {
  try {
    const res = await getGameList()
    gameList.value = Array.isArray(res.data)
      ? res.data
      : res.data?.records || []
  } catch {
    gameList.value = []
  }
}

async function fetchBoosterList() {
  if (!searchGameId.value) return
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      gameId: searchGameId.value,
    }
    if (searchUsername.value) {
      params.username = searchUsername.value.trim()
    }
    const res = await getBoostingUserList(params)
    if (res && res.code === 200) {
      const data = res.data || {}
      let list = data.list || []
      // 过滤掉自己
      if (currentUserId) {
        list = list.filter((item) => item.userId !== currentUserId)
      }
      boosterList.value = list
      total.value = data.total || 0
    } else {
      ElMessage.error(res.msg || '获取打手列表失败')
    }
  } catch {
    ElMessage.error('获取打手列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  if (!searchGameId.value) {
    ElMessage.warning('请选择游戏')
    return
  }
  page.value = 1
  fetchBoosterList()
}

function onGameChange() {
  page.value = 1
  fetchBoosterList()
}

function handlePageChange(val) {
  page.value = val
  fetchBoosterList()
}
function handleSizeChange(val) {
  pageSize.value = val
  page.value = 1
  fetchBoosterList()
}

function contactBooster(booster) {
  // 跳转到聊天界面
  router.push(`/chat/${booster.userId}`)
}

function goBack() {
  router.back()
}

onMounted(() => {
  if (window.history.length <= 1) {
    // 没有历史，自动跳转到首页或列表页
    router.replace({ name: 'OrderList' }) // 或 MainPage
  }
  fetchGameList()
  // 不自动查打手，必须选游戏后才查
})
</script>

<style scoped>
.booster-list-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, #1a1832 0%, #232a4d 100%);
  overflow: hidden;
}
.booster-list-bg::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  width: 120vw;
  height: 120vh;
  background: radial-gradient(circle at 50% 0, #3a5cff55 0%, #232a4d00 80%);
  transform: translateX(-50%);
  z-index: 1;
}
.booster-list-page.esports {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 32px 32px 32px; /* 顶部24px */
  background: none;
  border-radius: 22px;
  box-shadow: none;
  position: relative;
  z-index: 2;
  text-align: left;
  min-height: 100vh;
}
.booster-header-fixed {
  margin-top: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.booster-search-bar {
  background: rgba(30, 34, 60, 0.92);
  border-radius: 18px;
  box-shadow:
    0 4px 24px #3a5cff22,
    0 1.5px 8px #0004;
  padding: 24px 32px 18px 32px;
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 420px;
  max-width: 600px;
  width: 100%;
}
.booster-list-tools {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}
.booster-list-tools-plain {
  background: none;
  box-shadow: none;
  padding: 0;
  border-radius: 0;
}
.booster-list-tools-top {
  margin-bottom: 0 !important;
  justify-content: center;
}
.booster-title {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #3a5cff88;
  text-align: center;
}
.booster-list-desc {
  color: #a3bfff;
  font-size: 16px;
  margin-bottom: 22px;
  text-shadow: 0 1px 8px #232a4d88;
  text-align: center;
}
.booster-card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  margin-top: 0;
}
.booster-card.esports-card {
  display: flex;
  align-items: center;
  background: rgba(30, 34, 60, 0.92);
  border-radius: 18px;
  box-shadow:
    0 0 24px #3a5cff33,
    0 2px 16px #000a;
  border: 2px solid #3a5cff;
  transition:
    box-shadow 0.25s,
    transform 0.2s,
    border-color 0.2s;
  position: relative;
  overflow: hidden;
  min-width: 320px;
  flex: 1 1 350px;
  max-width: 420px;
  padding: 28px 36px 24px 28px;
}
.booster-card.esports-card:hover {
  box-shadow:
    0 0 48px #3a5cff99,
    0 4px 32px #000c;
  border-color: #00ffe7;
  transform: scale(1.03) translateY(-4px);
  z-index: 2;
}
.booster-avatar-wrap {
  position: relative;
  margin-right: 24px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.booster-avatar.esports-avatar {
  border: 3px solid #00ffe7;
  box-shadow: 0 0 12px #00ffe7aa;
}
.booster-badge.esports-badge {
  display: inline-block;
  background: linear-gradient(90deg, #3a5cff 0%, #00ffe7 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 10px;
  padding: 3px 14px;
  margin-top: 10px;
  box-shadow: 0 1px 8px #00ffe755;
  letter-spacing: 1px;
}
.booster-info {
  flex: 1;
  min-width: 0;
}
.booster-username-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.booster-username.esports-username {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #3a5cff88;
}
.booster-rank {
  color: #ffe066;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 1px 6px #ffe06655;
}
.booster-stats.esports-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 22px;
  font-size: 15px;
  color: #a3bfff;
  margin-bottom: 10px;
}
.booster-stats.esports-stats b {
  color: #00ffe7;
  font-weight: 700;
  text-shadow: 0 1px 6px #00ffe755;
}
.booster-signature {
  color: #ffe066;
  font-size: 14px;
  margin-top: 2px;
  font-style: italic;
  text-shadow: 0 1px 6px #ffe06633;
}
.contact-btn.esports-btn {
  background: linear-gradient(90deg, #3a5cff 0%, #00ffe7 100%);
  color: #222;
  font-weight: 700;
  border: none;
  box-shadow: 0 0 12px #00ffe788;
  transition:
    background 0.2s,
    color 0.2s;
  margin-left: 28px;
  min-width: 100px;
  font-size: 17px;
  letter-spacing: 1px;
}
.contact-btn.esports-btn:hover {
  background: linear-gradient(90deg, #00ffe7 0%, #3a5cff 100%);
  color: #fff;
}
.booster-search-input :deep(.el-input__wrapper),
.booster-search-input :deep(.el-select__wrapper) {
  border-radius: 16px !important;
  border: none !important;
  box-shadow: 0 0 8px #3a5cff22;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 16px;
}
.booster-search-input :deep(.el-input__inner),
.booster-search-input :deep(.el-select__selected-item) {
  color: #fff;
}
.booster-search-btn {
  border-radius: 16px !important;
  font-size: 16px;
  font-weight: 600;
  padding: 0 32px;
  background: linear-gradient(90deg, #3a5cff 0%, #00ffe7 100%);
  color: #222;
  border: none;
  box-shadow: 0 0 12px #00ffe788;
  transition:
    background 0.2s,
    color 0.2s;
}
.booster-search-btn:hover {
  background: linear-gradient(90deg, #00ffe7 0%, #3a5cff 100%);
  color: #fff;
}
@media (max-width: 700px) {
  .booster-search-bar {
    padding: 12px 8px 8px 8px;
    min-width: 0;
    max-width: 100%;
  }
  .booster-list-tools-top {
    flex-direction: column;
    gap: 12px;
  }
  .booster-card-list {
    flex-direction: column;
    gap: 18px;
  }
  .booster-card.esports-card {
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    max-width: 100%;
    padding: 18px;
  }
  .booster-avatar-wrap {
    margin-right: 0;
    margin-bottom: 12px;
  }
  .contact-btn.esports-btn {
    margin-left: 0;
    margin-top: 12px;
    width: 100%;
  }
}
.header-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(58, 92, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.back-btn:hover {
  background: rgba(58, 92, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(58, 92, 255, 0.3);
}

.back-btn .el-icon {
  font-size: 16px;
}

.placeholder {
  width: 80px; /* 与返回按钮宽度相近，保持标题居中 */
  flex-shrink: 0;
}

.placeholder {
  width: 80px; /* 与返回按钮宽度相近，保持标题居中 */
  flex-shrink: 0;
}
rw lign-itemscenter .placeholder {
  width: 80px; /* 与返回按钮宽度相近，保持标题居中 */
  flex-shrink: 0;
}
.search-back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.search-back-btn .el-icon {
  font-size: 16px;
}

/* 移动端适配 */
@media (max-width: 700px) {
  .booster-list-tools-top {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .search-back-btn {
    margin-right: 0;
    align-self: flex-start;
    width: fit-content;
  }
}
</style>
