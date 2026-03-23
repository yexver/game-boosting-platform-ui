import { getLocalToken } from '@/utils/auth'
import { ElNotification } from 'element-plus'

class WebSocketManager {
  constructor() {
    this.ws = null
    this.url = ''
    this.reconnectInterval = 3000 // 重连间隔 3秒
    this.reconnectTimer = null
    this.heartbeatInterval = 30000 // 心跳间隔 30秒
    this.heartbeatTimer = null
    this.listeners = new Map()
    this.isConnected = false
    this.messageQueue = []
    this.maxQueueSize = 100
  }

  // 初始化 WebSocket 连接
  connect(baseUrl = '') {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      console.log('WebSocket already connected or connecting')
      return
    }

    // 构建 WebSocket URL
    const wsUrl = this.buildWebSocketUrl(baseUrl)
    if (!wsUrl) {
      console.warn('WebSocket: 未配置有效地址或未登录，跳过连接')
      return
    }
    this.url = wsUrl

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.scheduleReconnect()
    }
  }

  // 构建 WebSocket URL
  buildWebSocketUrl(overrideBaseUrl = '') {
    // 从环境变量获取 WebSocket 地址，或者基于当前地址构建（overrideBaseUrl 优先）
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsBaseUrl =
      overrideBaseUrl ||
      import.meta.env.VITE_APP_WS_URL ||
      `${protocol}//${host}/ws`

    // 添加 token 作为查询参数（必须编码，避免 JWT 中的 + / = 等破坏请求行）
    const token = getLocalToken()
    if (!token) {
      return ''
    }
    const separator = wsBaseUrl.includes('?') ? '&' : '?'
    return `${wsBaseUrl}${separator}token=${encodeURIComponent(token)}`
  }

  // 处理连接打开
  handleOpen() {
    console.log('WebSocket connected')
    this.isConnected = true

    // 停止重连尝试
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // 启动心跳
    this.startHeartbeat()

    // 发送队列中的消息
    this.flushMessageQueue()

    // 通知所有连接成功的监听器
    this.emit('connect', { type: 'connected' })
  }

  // 处理接收到的消息
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data)

      // 根据消息类型处理
      switch (data.type) {
        case 'message':
          // 新消息
          this.handleNewMessage(data)
          break
        case 'message_read':
          // 消息已读
          this.handleMessageRead(data)
          break
        case 'pong':
          // 心跳响应
          break
        default:
          // 其他类型的消息，触发通用监听器
          this.emit(data.type, data)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  // 处理新消息
  handleNewMessage(data) {
    console.log('Received new message:', data)

    // 显示浏览器通知
    if (Notification.permission === 'granted') {
      new Notification('新消息', {
        body: data.content || '您有新的消息',
        icon: '/favicon.ico'
      })
    }

    // 使用 Element Plus 通知
    ElNotification({
      title: '新消息',
      message: data.content || '您有新的消息',
      type: 'info',
      duration: 3000
    })

    // 触发消息监听器
    this.emit('new_message', data)
  }

  // 处理消息已读
  handleMessageRead(data) {
    this.emit('message_read', data)
  }

  // 处理错误
  handleError(error) {
    console.error('WebSocket error:', error)
    this.emit('error', error)
  }

  // 处理连接关闭
  handleClose(event) {
    console.log('WebSocket closed:', event.code, event.reason)
    this.isConnected = false

    // 停止心跳
    this.stopHeartbeat()

    // 尝试重连
    if (event.code !== 1000) { // 1000 表示正常关闭
      this.scheduleReconnect()
    }

    this.emit('disconnect', { code: event.code, reason: event.reason })
  }

  // 计划重连
  scheduleReconnect() {
    if (this.reconnectTimer) {
      return
    }

    console.log(`Scheduling reconnect in ${this.reconnectInterval}ms`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      console.log('Attempting to reconnect...')
      this.connect()
    }, this.reconnectInterval)
  }

  // 启动心跳
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping' })
      }
    }, this.heartbeatInterval)
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 发送消息
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      return true
    } else {
      // 连接未建立，将消息加入队列
      if (this.messageQueue.length < this.maxQueueSize) {
        this.messageQueue.push(data)
      }
      return false
    }
  }

  // 发送队列中的消息
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.send(message)
    }
  }

  // 添加事件监听器
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  // 移除事件监听器
  off(event, callback) {
    if (!this.listeners.has(event)) {
      return
    }
    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  // 触发事件
  emit(event, data) {
    if (!this.listeners.has(event)) {
      return
    }
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in listener for event ${event}:`, error)
      }
    })
  }

  // 断开连接
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close(1000, 'User logout')
      this.ws = null
    }

    this.isConnected = false
    this.messageQueue = []
  }

  // 获取连接状态
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : null,
      url: this.url
    }
  }
}

// 导出单例
export const wsManager = new WebSocketManager()
export default wsManager
