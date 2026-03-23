<template>
  <div class="chat-room">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <el-button @click="goBack" text>返回</el-button>
      <div class="chat-info">
        <div
          class="header-avatar-wrapper"
          v-if="chatUser.username !== '系统消息'"
        >
          <img :src="getAvatarUrl(chatUser.avatar)" class="user-avatar" />
        </div>
        <div class="user-info">
          <div class="username">{{ chatUser.username || '用户' }}</div>
          <div class="user-id">ID: {{ route.params.userId }}</div>
        </div>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div class="chat-messages" ref="messagesContainer" @scroll="handleScroll">
      <!-- 加载更多按钮 -->
      <div v-if="hasMore" class="load-more">
        <el-button @click="loadMoreMessages" :loading="loading" size="small">
          上拉加载更多历史消息
        </el-button>
      </div>

      <!-- 消息列表 -->
      <div class="message-list">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ 'message-mine': message.senderId === currentUserId }"
        >
          <!-- 对方的消息 -->
          <template v-if="message.senderId !== currentUserId">
            <div class="message-avatar-container">
              <div
                class="avatar-wrapper"
                v-if="chatUser.username !== '系统消息'"
              >
                <img
                  :src="getAvatarUrl(chatUser.avatar)"
                  class="message-avatar"
                />
              </div>
            </div>
            <div class="message-content">
              <div class="message-sender">
                <span class="sender-name">{{
                  chatUser.username || '用户'
                }}</span>
              </div>
              <div class="message-bubble">
                <!-- 文本消息 -->
                <div v-if="message.messageType === 1">
                  {{ message.content }}
                </div>
                <!-- 图片消息 -->
                <div
                  v-else-if="message.messageType === 2"
                  class="image-message"
                >
                  <!-- 图片消息的文本内容 -->
                  <div v-if="message.content" class="image-message-text">
                    {{ message.content }}
                  </div>
                  <!-- 图片内容 -->
                  <div class="image-gallery">
                    <img
                      v-for="(imageUrl, index) in processImageUrls(
                        message.fileUrl
                      )"
                      :key="index"
                      :src="imageUrl"
                      class="message-image"
                      @click="previewImage(imageUrl)"
                    />
                  </div>
                </div>
              </div>
              <div class="message-time">
                {{ formatTime(message.createdAt) }}
              </div>
            </div>
          </template>

          <!-- 我的消息 -->
          <template v-else>
            <div class="message-avatar-container">
              <div class="avatar-wrapper">
                <img :src="currentUserAvatar" class="message-avatar" />
              </div>
            </div>
            <div class="message-content message-mine">
              <div class="message-bubble">
                <!-- 文本消息 -->
                <div v-if="message.messageType === 1">
                  {{ message.content }}
                </div>
                <!-- 图片消息 -->
                <div
                  v-else-if="message.messageType === 2"
                  class="image-message"
                >
                  <!-- 图片消息的文本内容 -->
                  <div v-if="message.content" class="image-message-text">
                    {{ message.content }}
                  </div>
                  <!-- 图片内容 -->
                  <div class="image-gallery">
                    <img
                      v-for="(imageUrl, index) in processImageUrls(
                        message.fileUrl
                      )"
                      :key="index"
                      :src="imageUrl"
                      class="message-image"
                      @click="previewImage(imageUrl)"
                    />
                  </div>
                </div>
              </div>
              <div class="message-time">
                {{ formatTime(message.createdAt) }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 发送消息区域 -->
    <div class="chat-input">
      <div class="input-container">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="1"
          placeholder="输入消息..."
          @keydown.enter.prevent="sendMessage"
          resize="none"
        />
        <div class="input-actions">
          <el-upload
            ref="imageUpload"
            :show-file-list="false"
            :before-upload="handleImageUpload"
            accept="image/*"
            multiple
            class="image-upload"
          >
            <el-button text class="upload-btn">
              <el-icon><Picture /></el-icon>
            </el-button>
          </el-upload>
          <el-button
            type="primary"
            @click="sendMessage"
            :disabled="!inputMessage.trim() && selectedImages.length === 0"
          >
            发送
          </el-button>
        </div>
      </div>

      <!-- 图片预览 -->
      <div v-if="selectedImages.length > 0" class="image-preview-container">
        <div
          v-for="(image, index) in selectedImages"
          :key="index"
          class="image-preview"
        >
          <img :src="image.url" class="preview-image" />
          <el-button
            text
            class="remove-image"
            @click="removeSelectedImage(index)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, Close } from '@element-plus/icons-vue'
import {
  getChatUserInfo,
  getChatMessages,
  sendChatMessage,
} from '@/api/messages/messages'
import { useUserStore, useMessageStore } from '@/stores'
import settings from '@/settings'
import systemLogo from '@/assets/images/logo01.png'
import defaultAvatar from '@/assets/images/avatar.jpeg'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const messageStore = useMessageStore()

// 聊天用户信息
const chatUser = ref({})
const messages = ref([])
const inputMessage = ref('')
const selectedImages = ref([]) // 改为数组支持多张图片
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(5)

// 当前用户信息
const currentUserId = computed(() => userStore.userId)
const currentUserAvatar = computed(() => getAvatarUrl(userStore.avatar))

// 消息容器引用
const messagesContainer = ref(null)

// 获取聊天用户信息
const loadChatUserInfo = async () => {
  const userId = route.params.userId
  if (!userId || userId === '0') {
    // 系统消息
    chatUser.value = {
      username: '系统消息',
      avatar: systemLogo, // 这是 import systemLogo from '@/assets/images/logo01.png'
    }
    return
  }
  try {
    const res = await getChatUserInfo(userId)
    chatUser.value = res.data
    // 调试：打印头像实际值
    console.log('chatUser.avatar:', chatUser.value.avatar)
  } catch (error) {
    console.error('获取用户信息失败', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 获取聊天消息
const loadChatMessages = async (page = 1, append = false) => {
  try {
    loading.value = true
    const userId = route.params.userId
    const res = await getChatMessages({
      userId,
      page,
      pageSize: pageSize.value,
    })

    const newMessages = res.data?.list || []

    if (append) {
      // 上拉加载：反转后添加到顶部
      messages.value.unshift(...newMessages.reverse())
    } else {
      // 首次加载：反转显示（早的在上面，新的在下面）
      messages.value = newMessages.reverse()
    }

    hasMore.value = newMessages.length === pageSize.value

    // 滚动到底部（仅首次加载）
    if (!append) {
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('获取消息失败', error)
    ElMessage.error('获取消息失败')
  } finally {
    loading.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() && selectedImages.value.length === 0) return

  try {
    const userId = route.params.userId
    const messageData = {
      receiverId: userId,
      content: inputMessage.value,
      senderType: 1,
      messageType: selectedImages.value.length > 0 ? 2 : 1,
      imageFiles: selectedImages.value.map((img) => img.file), // 传递文件对象数组
    }

    const res = await sendChatMessage(messageData)

    // 添加新消息到列表末尾（最新的消息）
    messages.value.push({
      id: res.data.id,
      content: res.data.content,
      senderId: currentUserId.value,
      messageType: res.data.messageType,
      fileUrl: res.data.fileUrl, // 使用后端返回的URL
      createdAt: res.data.createdAt,
    })

    inputMessage.value = ''
    selectedImages.value = []

    // 滚动到底部
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败', error)
    ElMessage.error('发送消息失败')
  }
}

// 加载更多历史消息
const loadMoreMessages = async () => {
  if (loading.value || !hasMore.value) return

  currentPage.value++
  await loadChatMessages(currentPage.value, true)
}

// 滚动处理
const handleScroll = () => {
  const container = messagesContainer.value
  if (!container) return

  // 如果滚动到顶部，自动加载更多历史消息（上拉刷新）
  if (container.scrollTop === 0 && hasMore.value && !loading.value) {
    loadMoreMessages()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  const container = messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

// 处理图片上传
const handleImageUpload = async (file) => {
  try {
    // 直接添加到选中图片列表，不进行单独上传
    selectedImages.value.push({
      url: URL.createObjectURL(file), // 临时URL用于预览
      fileName: file.name,
      fileSize: file.size,
      file: file, // 保存文件对象用于发送
    })
    ElMessage.success('图片已选择')
  } catch (error) {
    console.error('图片选择失败', error)
    ElMessage.error('图片选择失败')
  }
  return false // 阻止默认上传行为
}

// 移除选中的图片
const removeSelectedImage = (index) => {
  selectedImages.value.splice(index, 1)
}

// 处理图片URL，支持多张图片和基路径
const processImageUrls = (fileUrl) => {
  if (!fileUrl) return []

  // 分割多张图片URL
  const urls = fileUrl.split(',').map((url) => url.trim())

  // 为每个URL添加基路径
  return urls.map((url) => {
    if (url.startsWith('http')) {
      return url // 已经是完整URL
    } else {
      return settings.imgBaseUrl + '/' + url // 添加基路径
    }
  })
}

// 预览图片
const previewImage = (url) => {
  // 这里可以集成图片预览组件
  window.open(url, '_blank')
}

// 返回上一页
const goBack = () => {
  router.back()
}

function getAvatarUrl(avatar) {
  if (!avatar) return defaultAvatar
  if (typeof avatar === 'string' && avatar.startsWith('/assets/')) return avatar
  if (typeof avatar === 'string' && avatar.startsWith('http')) return avatar
  return settings.imgBaseUrl + avatar
}

onMounted(async () => {
  await loadChatUserInfo()
  await loadChatMessages()

  // 监听新消息，实时追加到聊天列表
  messageStore.setNewMessageListener((newMsg) => {
    const chatUserId = route.params.userId
    // 只处理当前聊天对象发来的消息
    if (
      newMsg &&
      newMsg.senderId &&
      String(newMsg.senderId) === String(chatUserId)
    ) {
      messages.value.push({
        id: newMsg.id,
        content: newMsg.content,
        senderId: newMsg.senderId,
        messageType: newMsg.messageType,
        fileUrl: newMsg.fileUrl,
        createdAt: newMsg.createdAt,
      })
      nextTick(() => scrollToBottom())
    }
  })
})

onUnmounted(() => {
  messageStore.setNewMessageListener(null)
})
</script>

<style scoped>
.chat-room {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.chat-header {
  background: #fff;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-avatar-wrapper {
  position: relative;
  display: inline-block;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.load-more {
  text-align: center;
  margin-bottom: 16px;
  padding: 16px 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin: 0 8px 16px 8px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.message-item.message-mine {
  flex-direction: row-reverse;
}

.message-avatar-container {
  flex-shrink: 0;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 60%;
  min-width: 120px;
}

.message-content.message-mine {
  align-items: flex-end;
}

.message-sender {
  margin-bottom: 4px;
}

.sender-name {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.message-mine .sender-name {
  display: none; /* 自己的消息不显示名称 */
}

.message-bubble {
  background: #f0f0f0;
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.message-bubble::before {
  content: '';
  position: absolute;
  top: 12px;
  left: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-right-color: #f0f0f0;
  border-left: 0;
}

.message-mine .message-bubble {
  background: #007aff;
  color: #fff;
}

.message-mine .message-bubble::before {
  display: none;
}

.message-mine .message-bubble::after {
  content: '';
  position: absolute;
  top: 12px;
  right: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-left-color: #007aff;
  border-right: 0;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  padding: 0 4px;
}

.chat-input {
  background: #fff;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.input-container .el-textarea {
  flex: 1;
}

.input-container .el-textarea :deep(.el-textarea__inner) {
  border-radius: 20px;
  resize: none;
  max-height: 100px;
  border: 1px solid #e0e0e0;
  padding: 12px 16px;
}

.input-container .el-button {
  border-radius: 20px;
  padding: 12px 20px;
  height: auto;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-upload {
  display: inline-block;
}

.upload-btn {
  padding: 8px;
  color: #666;
  border: none;
  background: transparent;
}

.upload-btn:hover {
  color: #409eff;
  background: #f0f8ff;
  border-radius: 50%;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 120px;
  max-height: 120px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff4757;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.remove-image:hover {
  background: #ff3742;
}

.image-message {
  display: inline-block;
}

.image-message-text {
  margin-bottom: 8px;
  line-height: 1.4;
  word-break: break-word;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 400px;
}

.message-image {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  object-fit: cover;
}

.message-image:hover {
  transform: scale(1.05);
}

/* 单张图片时保持原有大小 */
.image-gallery:has(img:only-child) .message-image {
  max-width: 200px;
  max-height: 200px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-room {
    max-width: 100%;
    margin: 0;
    box-shadow: none;
  }

  .chat-header {
    padding: 8px 12px;
  }

  .chat-messages {
    padding: 12px;
  }

  .chat-input {
    padding: 8px 12px;
  }

  .message-content {
    max-width: 80%;
  }
}
</style>
