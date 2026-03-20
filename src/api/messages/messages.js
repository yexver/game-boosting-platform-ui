import request from '@/utils/request'

// 获取消息列表
export function fetchMessages(params = {}) {
  return request({
    url: 'server-order/messages/list',
    method: 'get',
    params: params,
  })
}

// 标记单条消息为已读
export function markMessageAsRead(id) {
  return request({
    url: `server-order/messages/read/${id}`,
    method: 'put',
  })
}

// 标记全部消息为已读
export function markAllMessagesAsRead() {
  return request({
    url: 'server-order/messages/read-all',
    method: 'put',
  })
}

// 获取消息详情
export function getMessageDetail(id) {
  return request({
    url: `server-order/messages/${id}`,
    method: 'get',
  })
}

// 发送消息回复
export function sendMessageReply(data) {
  return request({
    url: 'server-order/messages/reply',
    method: 'post',
    data,
  })
}

// 获取聊天用户信息
export function getChatUserInfo(userId) {
  return request({
    url: `server-order/messages/chat-user/${userId}`,
    method: 'get',
  })
}

// 获取聊天消息列表
export function getChatMessages(params) {
  return request({
    url: `server-order/messages/chat/${params.userId}`,
    method: 'get',
    params: {
      page: params.page,
      pageSize: params.pageSize,
    },
  })
}

// 发送聊天消息
export function sendChatMessage(data) {
  const formData = new FormData()

  // 添加基本参数
  formData.append('receiverId', data.receiverId)
  formData.append('messageType', data.messageType || 1)
  formData.append('senderType', data.senderType) // 添加发送者类型

  // 添加内容（即使是空字符串也要发送）
  formData.append('content', data.content || '')

  // 添加可选参数
  if (data.orderId) {
    formData.append('orderId', data.orderId)
  }

  // 如果是图片消息，添加图片文件数组
  if (data.messageType === 2 && data.imageFiles && data.imageFiles.length > 0) {
    data.imageFiles.forEach((file) => {
      formData.append('images', file)
    })
  }

  return request({
    url: 'server-order/messages/send',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
