// src/api/game.js
import request from '@/utils/request'

// 获取游戏列表
export function getGameList() {
  return request({
    url: 'server-order/games/getAll',
    headers: {
      isToken: true,
      repeatSubmit: true,
    },
    method: 'get',
  })
}

// 获取指定游戏的系统列表
export function getSystemList(gameId) {
  return request({
    url: 'server-order/systems/getAll',
    headers: {
      isToken: true,
      repeatSubmit: true,
    },
    method: 'get',
    params: { gameId: gameId },
  })
}

// 获取指定游戏和系统的区服列表
export function getServerList(gameId, systemId) {
  return request({
    url: 'server-order/servers/getAll',
    headers: {
      isToken: true,
      repeatSubmit: true,
    },
    method: 'get',
    params: { gameId: gameId, systemId: systemId },
  })
}
