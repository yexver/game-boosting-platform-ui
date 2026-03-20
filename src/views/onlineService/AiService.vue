<template>
  <el-container class="ai-chat-container">
    <!-- 顶部导航栏 -->
    <el-header class="page-header" height="120px">
      <el-row justify="space-between" align="middle">
        <el-col :span="4">
          <el-button
            @click="goBack"
            type="text"
            size="large"
            class="back-button"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </el-col>
        <el-col :span="16" class="header-center">
          <h1 class="page-title">
            <el-icon class="title-icon"><span>🎮</span></el-icon>
            代练侠AI助手
          </h1>
          <p class="page-subtitle">专业游戏代练服务 · 智能问答助手</p>
        </el-col>
        <el-col :span="4"></el-col>
      </el-row>
    </el-header>

    <!-- 聊天主体区域 -->
    <el-main class="chat-main">
      <el-scrollbar ref="scrollbarRef" class="chat-scrollbar">
        <div class="chat-messages" ref="messagesContainer">
          <!-- 欢迎消息 -->
          <div v-if="chatHistory.length === 0" class="welcome-section">
            <el-card class="welcome-card" shadow="hover">
              <div class="welcome-content">
                <el-avatar :size="80" class="service-avatar-large">
                  <span class="service-emoji">🎮</span>
                </el-avatar>
                <h3>🎮 您好！我是代练侠AI助手</h3>
                <p>我可以帮您解答游戏代练相关问题、平台使用指南、订单处理等</p>

                <el-divider content-position="center">
                  <el-text type="primary">💡 您可以这样问我</el-text>
                </el-divider>

                <el-row :gutter="15" class="suggestions-grid">
                  <el-col :span="12">
                    <el-button
                      type="primary"
                      class="suggestion-item"
                      @click="sendQuickMessage('如何发布代练订单？')"
                    >
                      📝 发布订单
                    </el-button>
                  </el-col>
                  <el-col :span="12">
                    <el-button
                      type="primary"
                      class="suggestion-item"
                      @click="sendQuickMessage('代练师如何接单？')"
                    >
                      🎯 接单指南
                    </el-button>
                  </el-col>
                  <el-col :span="12">
                    <el-button
                      type="primary"
                      class="suggestion-item"
                      @click="sendQuickMessage('平台收费标准是什么？')"
                    >
                      💰 收费标准
                    </el-button>
                  </el-col>
                  <el-col :span="12">
                    <el-button
                      type="primary"
                      class="suggestion-item"
                      @click="sendQuickMessage('如何保障账号安全？')"
                    >
                      🔒 账号安全
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </div>

          <!-- 对话消息 -->
          <div
            v-for="(msg, index) in chatHistory"
            :key="index"
            class="message-item"
          >
            <!-- 用户消息 -->
            <el-row
              v-if="msg.role === 'user'"
              justify="end"
              class="message-row"
            >
              <el-col :span="18">
                <div class="message-wrapper my-message">
                  <el-card class="message-bubble my-bubble" shadow="never">
                    <div class="message-text">{{ msg.content }}</div>
                    <div class="message-time">{{ msg.time }}</div>
                  </el-card>
                </div>
              </el-col>
              <el-col :span="2" class="avatar-col">
                <el-avatar :src="currentUserAvatar" :size="40">👤</el-avatar>
              </el-col>
            </el-row>

            <!-- AI消息 -->
            <el-row v-else justify="start" class="message-row">
              <el-col :span="2" class="avatar-col">
                <el-avatar :size="40">🤖</el-avatar>
              </el-col>
              <el-col :span="18">
                <div class="message-wrapper other-message">
                  <el-card class="message-bubble other-bubble" shadow="never">
                    <div
                      class="message-text"
                      v-html="formatMessage(msg.content)"
                    ></div>
                    <div class="message-time">{{ msg.time }}</div>
                  </el-card>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 加载状态 -->
          <el-row
            v-if="loading"
            justify="start"
            class="message-row loading-row"
          >
            <el-col :span="2" class="avatar-col">
              <el-avatar :size="40">🤖</el-avatar>
            </el-col>
            <el-col :span="18">
              <div class="message-wrapper other-message">
                <el-card class="message-bubble other-bubble" shadow="never">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </el-card>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>

      <!-- 快速回复建议 -->
      <div class="quick-replies">
        <el-space wrap>
          <el-button
            size="small"
            type="primary"
            plain
            @click="sendQuickMessage('如何发布代练订单？')"
          >
            如何发布代练订单？
          </el-button>
          <el-button
            size="small"
            type="primary"
            plain
            @click="sendQuickMessage('代练师如何接单？')"
          >
            代练师如何接单？
          </el-button>
          <el-button
            size="small"
            type="primary"
            plain
            @click="sendQuickMessage('平台收费标准是什么？')"
          >
            平台收费标准是什么？
          </el-button>
          <el-button
            size="small"
            type="primary"
            plain
            @click="sendQuickMessage('如何保障账号安全？')"
          >
            如何保障账号安全？
          </el-button>
        </el-space>
      </div>
    </el-main>

    <!-- 底部输入区域 -->
    <el-footer class="chat-footer" height="auto">
      <!-- 错误提示 -->
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        show-icon
        class="error-alert"
      />

      <div class="input-container">
        <el-row :gutter="10" align="bottom">
          <el-col :span="18">
            <el-input
              v-model="message"
              @keydown="handleKeyDown"
              placeholder="输入您的问题，按 Enter 发送..."
              :disabled="loading"
              type="textarea"
              :rows="1"
              ref="messageInput"
              resize="none"
              :autosize="{ minRows: 1, maxRows: 4 }"
            />
          </el-col>
          <el-col :span="2">
            <el-popover placement="top" width="300" trigger="click">
              <template #reference>
                <el-button circle>😊</el-button>
              </template>
              <div class="emoji-panel">
                <el-space wrap>
                  <span
                    v-for="emoji in emojiList.slice(0, 32)"
                    :key="emoji"
                    class="emoji-item"
                    @click="insertEmoji(emoji)"
                  >
                    {{ emoji }}
                  </span>
                </el-space>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="4">
            <el-button
              @click="sendMessage"
              :disabled="loading || !message.trim()"
              type="primary"
              :loading="loading"
              class="send-button"
            >
              <el-icon v-if="!loading"><span>📤</span></el-icon>
              发送
            </el-button>
          </el-col>
        </el-row>

        <el-row justify="center" class="quick-actions">
          <el-space>
            <el-button
              @click="clearChat"
              :disabled="loading"
              size="small"
              type="info"
              plain
            >
              <el-icon><Delete /></el-icon>
              清空对话
            </el-button>
            <el-button
              @click="refreshMessages"
              :disabled="loading"
              size="small"
              type="info"
              plain
            >
              <el-icon><Refresh /></el-icon>
              刷新对话
            </el-button>
          </el-space>
        </el-row>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, Delete, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores'
import settings from '@/settings'

const router = useRouter()
const userStore = useUserStore()

// 返回上一页
const goBack = () => {
  router.back()
}

// 响应式数据
const message = ref('')
const chatHistory = ref([])
const loading = ref(false)
const error = ref(null)
const messagesContainer = ref(null)
const messageInput = ref(null)
const isAtBottom = ref(true) // 是否在底部

// Emoji列表
const emojiList = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '☹️',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
]

// 计算属性
const currentUserAvatar = computed(() => {
  const avatar = userStore.avatar
  if (!avatar) return '/src/assets/images/avatar.jpeg'
  if (typeof avatar === 'string' && avatar.startsWith('http')) return avatar
  return settings.imgBaseUrl + avatar
})

// 快捷消息函数
const sendQuickMessage = (quickMessage) => {
  message.value = quickMessage
  sendMessage()
}

// 发送消息
const sendMessage = async () => {
  if (!message.value.trim() || loading.value) return

  const userMessage = message.value.trim()
  message.value = '' // 立即清空输入框
  error.value = null

  // 添加用户消息到历史
  chatHistory.value.push({
    role: 'user',
    content: userMessage,
    time: getCurrentTime(),
  })

  loading.value = true
  scrollToBottom()

  try {
    const response = await axios.get('http://localhost:9000/chat', {
      params: { message: userMessage },
    })

    // 新接口直接返回字符串内容
    let aiContent = response.data
    if (typeof aiContent === 'object' && aiContent !== null) {
      // 尝试取常见字段
      aiContent =
        aiContent.content || aiContent.msg || JSON.stringify(aiContent)
    }
    chatHistory.value.push({
      role: 'assistant',
      content: aiContent,
      time: getCurrentTime(),
    })
    console.log('AI接口返回内容:', response.data)
  } catch (err) {
    console.error('聊天API错误:', err)
    error.value = '网络连接异常，请检查网络后重试'
    chatHistory.value.push({
      role: 'assistant',
      content: '抱歉，网络连接出现问题，请稍后再试。',
      time: getCurrentTime(),
    })
  } finally {
    loading.value = false
    scrollToBottom()
    nextTick(() => {
      messageInput.value?.focus()
    })
  }
}

// 处理键盘事件
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 清空对话
const clearChat = () => {
  chatHistory.value = []
  error.value = null
  message.value = ''
}

// 插入Emoji
const insertEmoji = (emoji) => {
  message.value += emoji
  messageInput.value?.focus()
}

// 刷新消息
const refreshMessages = () => {
  // 重新加载聊天历史
  chatHistory.value = []
  error.value = null
}

// 格式化消息
const formatMessage = (content) => {
  if (typeof content !== 'string') {
    // 如果不是字符串，转成字符串（或返回空字符串）
    return content ? String(content) : ''
  }
  // 简单的文本格式化，将换行符转换为<br>
  return content.replace(/\n/g, '<br>')
}

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 检查是否在底部
const checkIfAtBottom = () => {
  const container = messagesContainer.value
  if (container) {
    const threshold = 50 // 50px的阈值
    isAtBottom.value =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - threshold
  }
}

// 滚动到底部
const scrollToBottom = (force = false) => {
  nextTick(() => {
    const container = messagesContainer.value
    if (container && (isAtBottom.value || force)) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
      isAtBottom.value = true
    }
  })
}

// 添加滚动事件监听
const addScrollListener = () => {
  const container = messagesContainer.value
  if (container) {
    container.addEventListener('scroll', checkIfAtBottom)
  }
}

// 移除滚动事件监听
const removeScrollListener = () => {
  const container = messagesContainer.value
  if (container) {
    container.removeEventListener('scroll', checkIfAtBottom)
  }
}

// 组件挂载时的初始化
onMounted(() => {
  nextTick(() => {
    messageInput.value?.focus()
    addScrollListener()
  })
})

// 组件卸载时清理
onUnmounted(() => {
  removeScrollListener()
})
</script>

<style scoped>
.ai-chat-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.ai-chat-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      circle at 20% 80%,
      rgba(120, 119, 198, 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 119, 198, 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      rgba(120, 219, 255, 0.2) 0%,
      transparent 50%
    );
  z-index: 0;
}

.page-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 15px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  height: 80px;
}

.header-center {
  text-align: center;
}

.back-button {
  color: white !important;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 6px 12px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 1.6rem;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.page-subtitle {
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.9;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.chat-main {
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  margin: 15px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.chat-scrollbar {
  flex: 1;
  padding: 20px;
}

.welcome-card {
  max-width: 550px;
  margin: 0 auto;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
}

.welcome-content {
  padding: 25px 20px;
}

.service-avatar-large {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0 auto 20px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.8);
  width: 60px;
  height: 60px;
}

.welcome-content h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-content p {
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 20px;
}

.suggestions-grid {
  margin-top: 20px;
}

.suggestion-item {
  width: 100%;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 10px 15px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.message-row {
  margin-bottom: 15px;
}

.avatar-col {
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.avatar-col :deep(.el-avatar) {
  width: 32px;
  height: 32px;
}

.message-wrapper {
  padding: 0 10px;
}

.my-message .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 6px 16px;
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
}

.my-message .message-bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: -6px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-color: #764ba2;
  border-left-color: #764ba2;
}

.other-message .message-bubble {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px 16px 16px 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
}

.other-message .message-bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -6px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.95);
  border-right-color: rgba(255, 255, 255, 0.95);
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
  font-size: 0.9rem;
  padding: 10px 15px 3px;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 3px;
  padding: 0 15px 10px;
  text-align: right;
}

.my-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.other-message .message-time {
  color: #6b7280;
  text-align: left;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 15px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.quick-replies {
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  border-radius: 0 0 16px 16px;
}

.quick-replies :deep(.el-button) {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 16px;
  padding: 6px 12px;
  margin: 3px;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.quick-replies :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.chat-footer {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  margin: 0 15px 15px;
  padding: 20px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.error-alert {
  margin-bottom: 15px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-container :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 15px;
  font-size: 0.9rem;
  resize: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.input-container :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.send-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.send-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.send-button:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.quick-actions {
  margin-top: 15px;
}

.quick-actions :deep(.el-button) {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  padding: 6px 12px;
}

.quick-actions :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.emoji-panel {
  padding: 15px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.emoji-item {
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: inline-block;
}

.emoji-item:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: scale(1.2);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.4rem;
  }

  .chat-main {
    margin: 8px;
    border-radius: 12px;
  }

  .chat-scrollbar {
    padding: 15px;
  }

  .welcome-content {
    padding: 20px 15px;
  }

  .chat-footer {
    margin: 0 8px 8px;
    padding: 15px;
  }

  .message-wrapper {
    padding: 0 8px;
  }
}

/* 滚动条美化 */
:deep(.el-scrollbar__bar) {
  opacity: 0.3;
}

:deep(.el-scrollbar__thumb) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 8px;
}

/* 分割线美化 */
:deep(.el-divider__text) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 0 15px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.85rem;
}
</style>
