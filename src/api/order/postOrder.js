import request from '@/utils/request'

// 发布订单
export function postOrder(orderData) {
  return request({
    url: 'server-order/orders/submitOrder',
    headers: {
      isToken: true,
      repeatSubmit: false,
    },
    method: 'post',
    data: orderData,
  })
}

// 分页查询代练用户列表
export function getBoostingUserList({
  gameId,
  username,
  page = 1,
  pageSize = 10,
}) {
  return request({
    url: 'server-user/getBoostingUserList',
    method: 'get',
    params: { gameId, username, page, pageSize },
    headers: {
      isToken: true,
    },
  })
}
