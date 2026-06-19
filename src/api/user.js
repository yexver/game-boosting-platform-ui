import request from '@/utils/request'

// 获取用户信息
export function getUserProfile() {
  return request({
    url: '/server-user/getUserProfile',
    method: 'post',
  })
}

// 更新用户信息
export function updateUserProfile(data, avatarFile = null) {
  const formData = new FormData()
  if (data && (data.username || data.nickname)) {
    formData.append(
      'user',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    )
  }
  if (avatarFile) {
    formData.append('avatar', avatarFile)
  }
  return request({
    url: '/server-user/updateUserProfile',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 上传头像
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/server-user/user/upload-avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 支付宝充值接口
export function alipayPay({ url, userId, price }) {
  return request({
    url: `/server-account/alipay/pay?url=${encodeURIComponent(url)}&userId=${userId}&price=${price}`,
    method: 'get',
    responseType: 'text', // 期望返回 HTML
  })
}

// 提现接口
export function withdraw({ userId, amount, password }) {
  return request({
    url: '/server-account/alipay/withdraw',
    method: 'post',
    data: { userId, amount, password },
  })
}

/**
 * 获取当前用户已选的代打游戏ID集合
 * @returns Promise<Array<number|string>>
 */
export function getUserBoostingGames() {
  return request({
    url: '/server-user/boosting-games', // 这里的url要和后端实际接口一致
    method: 'get',
  })
}

/**
 * 开启/关闭代打功能
 * @param {Object} data { is_boosting_enabled: 1|0, boosting_game_ids?: Array }
 * @returns Promise
 */
export function switchUserBoosting(data) {
  return request({
    url: '/server-user/boosting-switch',
    method: 'post',
    data,
  })
}
