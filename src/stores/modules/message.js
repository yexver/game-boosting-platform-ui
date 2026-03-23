import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchMessages, markMessageAsRead, markAllMessagesAsRead } from '@/api/messages/messages'
import wsManager from '@/utils/websocket'

export const useMessageStore = defineStore('message', () => {
  // 消息列表
  const messages = ref([])

  // 未读消息数量
  const unreadCount = ref(0)

  // 总消息数
  const total = ref(0)

  // 当前页
  const currentPage = ref(1)

  // 每页大小
  const pageSize = ref(10)

  // WebSocket 连接状态
  const wsConnected = ref(false)

  // 新消息监听器回调
  let newMessageCallback = null

  // 避免热更新 / 重复调用时重复注册 wsManager 监听器
  let wsListenersBound = false

  // 初始化 WebSocket 连接
  const initWebSocket = () => {
    if (!wsListenersBound) {
      wsListenersBound = true
      // 监听连接成功
      wsManager.on('connect', () => {
        console.log('消息中心 WebSocket 已连接')
        wsConnected.value = true
      })

      // 监听新消息
      wsManager.on('new_message', (data) => {
        handleNewMessage(data)
      })

      // 监听断开连接
      wsManager.on('disconnect', () => {
        console.log('消息中心 WebSocket 已断开')
        wsConnected.value = false
      })

      // 监听错误
      wsManager.on('error', (error) => {
        console.error('WebSocket 错误:', error)
        wsConnected.value = false
      })
    }

    // 建立连接
    wsManager.connect()
  }

  // 处理新消息
  const handleNewMessage = (data) => {
    // 防止重复添加（消息列表中已存在则忽略）
    const exists = messages.value.some(msg => msg.id === data.id)
    if (exists) {
      console.log('消息已存在，跳过:', data.id)
      return
    }

    // 添加到消息列表开头（最新消息在前）
    const newMsg = {
      id: data.id,
      content: data.content,
      senderId: data.senderId,
      senderUsername: data.senderUsername,
      senderType: data.senderType,
      receiverId: data.receiverId,
      messageType: data.messageType,
      fileUrl: data.fileUrl,
      orderId: data.orderId,
      isRead: data.isRead !== undefined ? data.isRead : false,
      createdAt: data.createdAt || new Date().toISOString()
    }

    // 插入到列表开头
    messages.value.unshift(newMsg)

    // 未读数加一
    unreadCount.value++

    // 总数加一
    total.value++

    // 触发回调（如果有的话）
    if (newMessageCallback) {
      newMessageCallback(newMsg)
    }
  }

  // 加载消息列表
  const loadMessages = async (page = 1, size = pageSize.value) => {
    try {
      const res = await fetchMessages({
        page: page,
        pageSize: size
      })

      currentPage.value = page
      pageSize.value = size
      total.value = Number(res.data?.total) || 0

      // 直接使用消息列表
      const messageList = Array.isArray(res.data?.list) ? res.data.list : []

      messages.value = messageList.map((msg) => ({
        ...msg,
        isRead: !!msg.isRead,
        createdAt: msg.createdAt
      }))

      // 计算未读数
      unreadCount.value = messages.value.filter(msg => !msg.isRead).length

      return messages.value
    } catch (error) {
      console.error('加载消息失败:', error)
      throw error
    }
  }

  // 标记单条消息为已读
  const markAsRead = async (messageId) => {
    try {
      await markMessageAsRead(messageId)

      // 更新本地状态
      const msg = messages.value.find(m => m.id === messageId)
      if (msg && !msg.isRead) {
        msg.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      return true
    } catch (error) {
      console.error('标记已读失败:', error)
      return false
    }
  }

  // 标记全部消息为已读
  const markAllAsRead = async () => {
    try {
      await markAllMessagesAsRead()

      // 更新本地状态
      messages.value.forEach(msg => {
        msg.isRead = true
      })
      unreadCount.value = 0

      return true
    } catch (error) {
      console.error('标记全部已读失败:', error)
      return false
    }
  }

  // 设置新消息监听器
  const setNewMessageListener = (callback) => {
    newMessageCallback = callback
  }

  // 获取 WebSocket 状态
  const getWsStatus = () => {
    return wsManager.getStatus()
  }

  // 断开 WebSocket
  const disconnectWs = () => {
    wsManager.disconnect()
    wsConnected.value = false
  }

  // 计算属性
  const hasUnread = computed(() => unreadCount.value > 0)
  const unreadMessages = computed(() => messages.value.filter(msg => !msg.isRead))

  return {
    // 状态
    messages,
    unreadCount,
    total,
    currentPage,
    pageSize,
    wsConnected,
    hasUnread,
    unreadMessages,

    // 方法
    initWebSocket,
    loadMessages,
    markAsRead,
    markAllAsRead,
    setNewMessageListener,
    getWsStatus,
    disconnectWs
  }
}, {
  persist: false // 不需要持久化，页面刷新时重新加载
})

export default useMessageStore
