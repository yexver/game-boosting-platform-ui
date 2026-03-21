import request from '@/utils/request'

// 获取交易流水记录
export function getTransactionHistory(params) {
  return request({
    url: '/server-account/transaction/transactions',
    method: 'get',
    params: {
      userId: params.userId,
      operatorId: params.operatorId,
      type: params.type,
      startTime: params.startDate,
      endTime: params.endDate,
      current: params.page,
      size: params.size,
    },
  })
}
