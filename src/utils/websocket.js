import { getLocalToken } from '@/utils/auth'
import { ElNotification } from 'element-plus'

class WebSocketService {
  constructor() {
    this.ws = null
    this.url = ''
    this.reconnectInterval = 5000
    this.reconnectTimer = null
    this.heartbeatTimer = null
    this.heartbeatInterval = 30000
    this.listeners = new Map()
    this.isManualClose = false
    this.maxReconnectAttempts = 5
    this.reconnectAttempts = 0
  }

  connect() {
    const token = getLocalToken()
    if (!token) {
      console.warn('WebSocket: No token available, skipping connection')
      return
    }

    this.isManualClose = false
    const baseUrl = import.meta.env.VITE_APP_BASE_API || '/api'
    const wsUrl = baseUrl.replace('http', 'ws') + '/ws?token=' + encodeURIComponent(token)

    console.log('WebSocket: Connecting to', wsUrl)
    this.url = wsUrl

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
    } catch (error) {
      console.error('WebSocket: Connection error', error)
      this.scheduleReconnect()
    }
  }

  handleOpen() {
    console.log('WebSocket: Connected successfully')
    this.reconnectAttempts = 0
    this.startHeartbeat()
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data)
      console.log('WebSocket: Received message', data)

      if (data.type === 'PONG') {
        return
      }

      const listeners = this.listeners.get(data.type) || []
      listeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error('WebSocket: Listener error', error)
        }
      })

      const globalListeners = this.listeners.get('*') || []
      globalListeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error('WebSocket: Global listener error', error)
        }
      })
    } catch (error) {
      console.error('WebSocket: Failed to parse message', error)
    }
  }

  handleError(error) {
    console.error('WebSocket: Error', error)
  }

  handleClose(event) {
    console.log('WebSocket: Connection closed', event.code, event.reason)
    this.stopHeartbeat()

    if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      return
    }

    this.reconnectAttempts++
    console.log(`WebSocket: Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

    this.reconnectTimer = setTimeout(() => {
      console.log('WebSocket: Attempting to reconnect...')
      this.reconnectTimer = null
      this.connect()
    }, this.reconnectInterval)
  }

  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('PING', {})
      }
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }))
      return true
    } else {
      console.warn('WebSocket: Cannot send, connection not open')
      return false
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(callback)
  }

  off(type, callback) {
    if (!this.listeners.has(type)) {
      return
    }
    const callbacks = this.listeners.get(type)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  close() {
    this.isManualClose = true
    this.stopHeartbeat()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  getStatus() {
    if (!this.ws) return 'DISCONNECTED'
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'CONNECTED'
      case WebSocket.CLOSING:
        return 'CLOSING'
      case WebSocket.CLOSED:
        return 'CLOSED'
      default:
        return 'UNKNOWN'
    }
  }
}

export const wsService = new WebSocketService()
export default wsService
