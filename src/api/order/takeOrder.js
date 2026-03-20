import request from '@/utils/request'

export function getOrderList(params) {
  return request({
    url: 'server-order/orders/orderInfoList',
    method: 'get',
    params,
  })
}

// 获取接单订单详情
export function getTakeOrderDetail(orderId) {
  return request({
    url: `server-order/orders/take-order/${orderId}`,
    method: 'get',
  })
}

// 接单API
export function takeOrder(orderId, password) {
  return request({
    url: 'server-order/orders/take-order',
    method: 'post',
    data: {
      orderId: orderId,
      password: password,
    },
    headers: {
      isToken: true,
      repeatSubmit: true,
    },
  })
}
