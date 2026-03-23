<template>
  <div class="messages-page">
    <div class="messages-header">
      <div class="header-left">
        <el-button type="primary" plain @click="goHome" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
        <h2>消息中心</h2>
        <div class="ws-status">
          <span
            class="status-dot"
            :class="{ connected: messageStore.wsConnected }"
          ></span>
          <span class="status-text">{{
            messageStore.wsConnected ? '实时推送已连接' : '实时推送已断开'
          }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="markAllAsRead">全部已读</el-button>
      </div>
    </div>

    <div class="messages-content">
      <el-tabs v-model="activeTab" class="messages-tabs">
        <el-tab-pane label="全部消息" name="all">
          <div class="message-list">
            <!-- 空状态 -->
            <div v-if="filteredMessages.length === 0" class="empty-state">
              <el-empty description="暂无消息" :image-size="120">
                <template #image>
                  <el-icon size="80" color="#d3d3d3"><ChatDotRound /></el-icon>
                </template>
              </el-empty>
            </div>
            <!-- 消息列表 -->
            <div
              v-for="message in filteredMessages"
              :key="message.id"
              class="message-item"
              :class="{ unread: !message.isRead }"
              @click="handleMessageClick(message)"
            >
              <div class="message-icon">
                <el-icon v-if="message.senderType === 2"><Bell /></el-icon>
                <el-icon v-else-if="message.senderType === 3"
                  ><Service
                /></el-icon>
                <el-icon v-else><User /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-title">
                  {{ getSenderName(message) }}
                </div>
                <div class="message-preview">{{ message.content }}</div>
                <div class="message-time">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
              <div class="message-actions">
                <el-button
                  v-if="!message.isRead"
                  link
                  size="small"
                  @click.stop="markAsRead(message.id)"
                >
                  标记已读
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="系统消息" name="system">
          <div class="message-list">
            <div
              v-for="message in systemMessages"
              :key="message.id"
              class="message-item"
              :class="{ unread: !message.isRead }"
              @click="handleMessageClick(message)"
            >
              <div class="message-icon">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-title">
                  {{ message.senderUsername || '系统消息' }}
                </div>
                <div class="message-preview">{{ message.content }}</div>
                <div class="message-time">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="用户消息" name="user">
          <div class="message-list">
            <div
              v-for="message in userMessages"
              :key="message.id"
              class="message-item"
              :class="{ unread: !message.isRead }"
              @click="handleMessageClick(message)"
            >
              <div class="message-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-title">
                  {{ message.senderUsername || '用户' + message.senderId }}
                </div>
                <div class="message-preview">{{ message.content }}</div>
                <div class="message-time">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="客服消息" name="service">
          <div class="message-list">
            <div
              v-for="message in serviceMessages"
              :key="message.id"
              class="message-item"
              :class="{ unread: !message.isRead }"
              @click="handleMessageClick(message)"
            >
              <div class="message-icon">
                <el-icon><Service /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-title">
                  {{ message.senderUsername || '客服' + message.senderId }}
                </div>
                <div class="message-preview">{{ message.content }}</div>
                <div class="message-time">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
        layout="prev, pager, next"
        background
        style="margin: 20px 0; text-align: right"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineOptions, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Bell,
  User,
  Service,
  ArrowLeft,
  ChatDotRound,
} from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores'

defineOptions({ name: 'MessagesPage' })

const router = useRouter()
const messageStore = useMessageStore()
const activeTab = ref('all')

// 直接使用 store 中的消息引用（避免本地副本导致不同步）
const messages = computed(() => messageStore.messages)

// 根据发送者类型获取发送者名称
const getSenderName = (message) => {
  if (message.senderType === 2) {
    return message.senderUsername || '系统消息'
  } else if (message.senderType === 3) {
    return message.senderUsername || '客服' + message.senderId
  } else {
    return message.senderUsername || '用户' + message.senderId
  }
}

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载消息
const loadMessages = async (page = 1, size = pageSize.value) => {
  try {
    const res = await messageStore.loadMessages(page, size)
    total.value = messageStore.total
    pageSize.value = messageStore.pageSize
    currentPage.value = messageStore.currentPage
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

onMounted(() => {
  loadMessages()

  // 监听新消息 - 由 store 统一处理，页面组件只更新 UI 相关状态
  messageStore.setNewMessageListener((newMsg) => {
    console.log('收到新消息推送:', newMsg)
    ElMessage.success('收到新消息')
  })
})

onUnmounted(() => {
  // 组件销毁时断开 WebSocket（如果不需要在其他页面保持连接）
  // messageStore.disconnectWs()
})

const filteredMessages = computed(() => messages.value)
const systemMessages = computed(() =>
  messages.value.filter((msg) => msg.senderType === 2)
)
const userMessages = computed(() =>
  messages.value.filter((msg) => msg.senderType === 1)
)
const serviceMessages = computed(() =>
  messages.value.filter((msg) => msg.senderType === 3)
)

const formatTime = (time) => {
  const t = new Date(time)
  const now = new Date()
  let diff = now - t
  if (diff < 0) diff = 0 // 防止负数
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const markAsRead = async (messageId) => {
  await messageStore.markAsRead(messageId)
}

const markAllAsRead = async () => {
  await messageStore.markAllAsRead()
  total.value = 0
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadMessages(page)
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 处理消息点击
const handleMessageClick = async (message) => {
  // 先标记为已读
  if (!message.isRead) {
    await markAsRead(message.id)
  }

  // 跳转到聊天页面
  router.push(`/chat/${message.senderId}`)
}
</script>

<style scoped>
.messages-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: #f8fafc;
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.ws-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  transition: background 0.3s;
}

.status-dot.connected {
  background: #67c23a;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.5);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  border-radius: 8px;
  padding: 10px 16px;
}

.messages-header h2 {
  margin: 0;
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.messages-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  overflow: hidden;
  min-height: 500px;
}

.messages-tabs {
  padding: 0 24px;
}

.messages-tabs :deep(.el-tabs__header) {
  margin: 0;
  border-bottom: 1px solid #e4e7ed;
}

.messages-tabs :deep(.el-tabs__nav-wrap) {
  padding: 16px 0;
}

.messages-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  font-size: 15px;
  padding: 0 20px;
}

.message-list {
  padding: 0;
  min-height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #909399;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.message-item:hover {
  background-color: #f8fafc;
}

.message-item.unread {
  background-color: #f0f8ff;
  border-left: 4px solid #409eff;
}

.message-item.unread::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 24px;
  width: 8px;
  height: 8px;
  background: #409eff;
  border-radius: 50%;
}

.message-item:last-child {
  border-bottom: none;
}

.message-icon {
  margin-right: 16px;
  margin-top: 4px;
  color: #409eff;
  font-size: 22px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  font-size: 16px;
}

.message-preview {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  color: #909399;
  font-size: 13px;
  font-weight: 400;
}

.message-actions {
  margin-left: 16px;
  flex-shrink: 0;
}

/* 分页样式 */
.el-pagination {
  margin: 24px 0;
  text-align: center;
  padding: 0 24px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .messages-page {
    padding: 16px;
  }

  .messages-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .header-left {
    flex-direction: column;
    gap: 12px;
  }

  .message-item {
    padding: 16px;
  }

  .messages-tabs {
    padding: 0 16px;
  }
}
</style>
