import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, register, logout, getInfo } from '@/api/login/login'
import { getLocalToken, setLocalToken, removeLocalToken } from '@/utils/auth'
import { useMessageStore } from './message'

export const useUserStore = defineStore('user', () => {
  const token = ref(getLocalToken())
  const defaultAvatar = new URL('@/assets/images/avatar.jpeg', import.meta.url)
    .href
  const userId = ref('')
  const name = ref('')
  const avatar = ref('')
  const roles = ref([])
  const permissions = ref([])

  //头像基地址
  const avatarBaseUrl =
    import.meta.env.VITE_APP_IMG_BASE_URL ||
    'https://game-boosting.oss-cn-guangzhou.aliyuncs.com/'

  // 登录
  function Login(userInfo) {
    const phone = userInfo.phone.trim()
    const password = userInfo.password
    const code = userInfo.code
    const uuid = userInfo.uuid
    console.log('action Login 触发:', phone, password, code, uuid) // 调试信息
    return new Promise((resolve, reject) => {
      login(phone, password, code, uuid)
        .then((res) => {
          setLocalToken(res.data) // 先存 token
          token.value = res.data
          //获取用户信息
          GetInfo()
            .then((res) => {
              // 登录成功后连接 WebSocket
              try {
                const messageStore = useMessageStore()
                messageStore.initWebSocket()
              } catch (e) {
                console.warn('WebSocket 初始化跳过:', e)
              }
              resolve(res)
            })
            .catch((error) => {
              reject(error)
            })
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  // 获取用户信息
  function GetInfo() {
    return new Promise((resolve, reject) => {
      getInfo()
        .then((res) => {
          const user = res.data
          console.log('user：', user)
          const avatarUrl =
            user.avatar === '' || user.avatar == null
              ? defaultAvatar
              : avatarBaseUrl + user.avatar
          if (user.role && user.role.length > 0) {
            // 验证返回的role是否是一个非空数组
            roles.value = user.role
            // 过滤掉permission中的null
            permissions.value = Array.isArray(user.permission)
              ? user.permission.filter((p) => p != null)
              : []
          }
          userId.value = user.userId
          name.value = user.username
          avatar.value = avatarUrl
          resolve(res)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  // 注册
  function Register(registerUserInfo) {
    registerUserInfo.username = registerUserInfo.username.trim()
    registerUserInfo.phone = registerUserInfo.phone.trim()
    return new Promise((resolve, reject) => {
      register(registerUserInfo)
        .then((res) => {
          setLocalToken(res.data)
          token.value = res.data
          resolve()
        })
        .then(() => {
          GetInfo()
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  // 退出系统
  function LogOut() {
    console.log('action LogOut 触发:', token.value) // 调试信息
    return new Promise((resolve, reject) => {
      logout()
        .then(() => {
          token.value = ''
          roles.value = []
          permissions.value = []
          removeLocalToken()
          // 退出时断开 WebSocket
          try {
            const messageStore = useMessageStore()
            messageStore.disconnectWs()
          } catch (e) {
            console.warn('WebSocket 断开跳过:', e)
          }
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  // 前端 登出
  function FedLogOut() {
    return new Promise((resolve) => {
      token.value = ''
      removeLocalToken()
      resolve()
    })
  }

  return {
    token,
    userId,
    name,
    avatar,
    roles,
    permissions,
    Login,
    GetInfo,
    Register,
    LogOut,
    FedLogOut,
  }
})
