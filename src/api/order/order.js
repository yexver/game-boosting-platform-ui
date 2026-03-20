import request from '@/utils/request'

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `server-order/orders/${id}`,
    method: 'get',
  })
}

// 获取订单列表
export function getOrderInfoList(data) {
  return request({
    url: 'server-order/orders/orderInfoList',
    method: 'get',
    params: data,
  })
}
/**
 * 上传订单图片
 * @param {Object} params
 * @param {string|number} params.orderId 订单ID
 * @param {string} params.type 图片类型（"账号初始图"、"代练过程图"、"完单图"）
 * @param {File[]} files 图片文件数组
 */
export function uploadOrderImages({ orderId, type, files, senderType }) {
  const formData = new FormData()
  formData.append('orderId', orderId)
  formData.append('type', type)
  formData.append('senderType', senderType) // 新增
  files.forEach((file) => {
    formData.append('images', file) // 后端字段名如有不同请调整
  })
  return request({
    url: '/server-order/messages/upload-images', // 按后端实际接口路径填写
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * 申请撤销
 * @param {FormData} formData
 *   - orderId: 订单ID
 *   - price: 支付金额
 *   - deposit: 保证金金额
 *   - remark: 说明
 *   - images: 图片文件数组
 */
export function applyRevoke(formData) {
  return request({
    url: '/server-order/orders/apply-revoke',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * 取消撤销
 * @param {string|number} orderId
 */
export function cancelRevoke(orderId) {
  return request({
    url: '/server-order/orders/cancel-revoke',
    method: 'post',
    data: { orderId },
  })
}
/**
 * 申请验收（支持FormData）
 * @param {FormData} formData
 *   - orderId: 订单ID
 *   - price: 支付金额
 *   - deposit: 保证金金额
 *   - remark: 说明
 *   - images: 图片文件数组
 */
export function applyAccept(formData) {
  return request({
    url: '/server-order/orders/apply-accept',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
/**
 * 进行验收
 * @param {FormData} formData
 *   - orderId: 订单ID
 *   - price: 支付金额
 *   - deposit: 保证金金额
 *   - remark: 说明
 *   - images: 图片文件数组
 */
export function verifyAccept(formData) {
  return request({
    url: '/server-order/orders/verify-accept', // 按后端实际接口路径填写
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
/**
 * 撤销订单
 * @param {string|number} orderId
 */
export function cancelOrder(orderId) {
  return request({
    url: '/server-order/orders/cancel-order',
    method: 'post',
    data: { orderId },
  })
}

/**
 * 同意撤销
 * @param {string|number} orderId 订单ID
 */
export function agreeRevokeApi(orderId) {
  return request({
    url: '/server-order/orders/agree-revoke',
    method: 'post',
    data: { orderId },
  })
}

/**
 * 拒绝撤销
 * @param {string|number} orderId 订单ID
 */
export function disagreeRevokeApi(orderId) {
  return request({
    url: '/server-order/orders/disagree-revoke',
    method: 'post',
    data: { orderId },
  })
}

/**
 * 申请客服介入/仲裁
 * @param {FormData} formData
 *   - orderId: 订单ID
 *   - price: 支付金额
 *   - deposit: 保证金金额
 *   - remark: 说明
 *   - images: 图片文件数组
 */
export function applyIntervene(formData) {
  return request({
    url: '/server-order/orders/apply-intervene',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
