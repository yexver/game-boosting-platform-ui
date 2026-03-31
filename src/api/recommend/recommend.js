import request from '@/utils/request'

/**
 * 发单推荐 - 完整推荐（价格建议 + 订单优化）
 * @param {Object} data 推荐请求参数
 * @returns {Promise}
 */
export function postRecommend(data) {
  return request({
    url: 'server-ai/api/recommend/post',
    method: 'post',
    data,
  })
}

/**
 * 价格建议
 * @param {Object} data 价格建议请求参数
 * @returns {Promise}
 */
export function getPriceRecommend(data) {
  return request({
    url: 'server-ai/api/recommend/price',
    method: 'post',
    data,
  })
}

/**
 * 订单优化
 * @param {Object} data 订单优化请求参数
 * @returns {Promise}
 */
export function getOrderOptimize(data) {
  return request({
    url: 'server-ai/api/recommend/optimize',
    method: 'post',
    data,
  })
}

/**
 * 接单推荐 - 订单匹配 + 收益策略
 * @param {Object} data 接单推荐请求参数
 * @returns {Promise}
 */
export function takeRecommend(data) {
  return request({
    url: 'server-ai/api/recommend/take',
    method: 'post',
    data,
  })
}
