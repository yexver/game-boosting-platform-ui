import { createRouter, createWebHistory } from 'vue-router'
import { getLocalToken } from '@/utils/auth'
import { useUserStore } from '@/stores'
import { removeLocalToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/main-page',
      component: () => import('@/views/home/Index.vue'),
      children: [
        {
          path: 'main-page', // 默认子路由
          name: 'MainPage',
          component: () => import('@/views/mainPage/Index.vue'),
        },
        {
          path: 'post-order', // 相对于 '/'，完整路径为 '/post-order'
          name: 'PostOrder',
          component: () => import('@/views/postOrder/Index.vue'),
          meta: { requiresAuth: true }, // 需要认证
        },
        {
          path: 'take-order', // 相对于 '/'，完整路径为 '/take-order'
          name: 'TakeOrder',
          component: () => import('@/views/takeOrder/Index.vue'),
        },
        {
          path: 'take-order/:id', // 接单详情页
          name: 'TakeOrderDetail',
          component: () => import('@/views/takeOrder/TakeOrderDetail.vue'),
        },
        {
          path: 'order-list', // 相对于 '/'，完整路径为 '/order-list'
          name: 'OrderList',
          component: () => import('@/views/orderList/Index.vue'),
          meta: { keepAlive: true },
        },
        {
          path: 'booster-list',
          name: 'BoosterList',
          component: () => import('@/views/postOrder/BoosterList.vue'),
        },
        {
          path: 'help-center',
          name: 'HelpCenter',
          component: () => import('@/views/helpCenter/Index.vue'),
        },
      ],
    },
    {
      path: '/order-list/taken/:id', // 我接手的订单详情
      name: 'TakenOrderDetail',
      component: () => import('@/views/orderList/TakenOrderDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/order-list/published/:id', // 我发布的订单详情
      name: 'PublishedOrderDetail',
      component: () => import('@/views/orderList/PublishedOrderDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/online-service',
      name: 'OnlineService',
      alias: '/onlineService',
      component: () => import('@/views/onlineService/AiService.vue'),
      meta: { requiresAuth: true }, // 需要认证
    },
    {
      path: '/messages',
      name: 'Messages',
      component: () => import('@/views/messages/Index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/chat/:userId',
      name: 'ChatRoom',
      component: () => import('@/views/messages/ChatRoom.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/UserLogin.vue'),
      meta: { requiresGuest: true }, // 已登录用户不能访问
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/login/UserRegister.vue'),
      meta: { requiresGuest: true }, // 已登录用户不能访问
    },
    {
      path: '/user/profile',
      name: 'UserProfile',
      component: () => import('@/views/user/Profile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user/transaction-history',
      name: 'TransactionHistory',
      component: () => import('@/views/user/TransactionHistory.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const token = getLocalToken()
  const isAuthenticated = !!token
  const userStore = useUserStore()

  if (isAuthenticated && !userStore.userId) {
    try {
      await userStore.GetInfo()
    } catch (err) {
      // 假设 err.response.status 可用
      if (err?.response?.status === 401) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
        removeLocalToken()

        return
      } else {
        // 其他错误只弹窗，不跳转
        ElMessage.error('获取用户信息失败，请稍后重试')

        return
      }
    }
  }

  // 需要认证的页面
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }

  // 已登录用户不能访问的页面（如登录页、注册页）
  if (to.meta.requiresGuest) {
    if (isAuthenticated) {
      next({ name: 'MainPage' })
      return
    }
  }

  next()
})

export default router
