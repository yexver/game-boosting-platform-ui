<template>
  <el-header class="header" name="HeadTop">
    <div class="header-left">
      <el-image
        src="/src/assets/images/logo02.png"
        alt="Logo"
        class="logo"
        fit="contain"
        @click="goHome"
      />
    </div>
    <div class="auth-section">
      <template v-if="isAuthenticated">
        <el-dropdown placement="bottom-end" @command="handleDropdownCommand">
          <div class="user-info">
            <el-avatar
              :src="getAvatarUrl(userStore.avatar)"
              size="small"
              class="user-avatar"
            />
            <span class="username">{{ userStore.name || '用户' }}</span>
            <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <div class="auth-buttons">
          <router-link to="/login" class="auth-link">
            <el-button type="primary" size="small">登录</el-button>
          </router-link>
          <router-link to="/register" class="auth-link">
            <el-button size="small">注册</el-button>
          </router-link>
        </div>
      </template>
    </div>
    <nav class="navigation">
      <ul>
        <li>
          <router-link
            to="/main-page"
            class="nav-link"
            active-class="active-link"
          >
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </router-link>
        </li>
        <li>
          <router-link
            to="/post-order"
            class="nav-link"
            active-class="active-link"
          >
            <el-icon><DocumentAdd /></el-icon>
            <span>我要发单</span>
          </router-link>
        </li>
        <li>
          <router-link
            to="/take-order"
            class="nav-link"
            active-class="active-link"
          >
            <el-icon><Check /></el-icon>
            <span>我要接单</span>
          </router-link>
        </li>
        <li>
          <router-link
            to="/order-list"
            class="nav-link"
            active-class="active-link"
          >
            <el-icon><Memo /></el-icon>
            <span>我的订单</span>
          </router-link>
        </li>
        <li>
          <router-link
            to="/online-service"
            class="nav-link"
            active-class="active-link"
          >
            <el-icon><ChatDotRound /></el-icon>
            <span>AI客服</span>
          </router-link>
        </li>
        <li>
          <router-link
            to="/help-center"
            class="nav-link"
            active-class="active-link"
          >
            <el-icon><QuestionFilled /></el-icon>
            <span>帮助中心</span>
          </router-link>
        </li>
        <li>
          <router-link
            to="/messages"
            class="nav-link"
            active-class="active-link"
          >
            <el-icon><Message /></el-icon>
            <span>消息</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import settings from '@/settings'
import {
  User,
  ArrowDown,
  Setting,
  SwitchButton,
  HomeFilled,
  DocumentAdd,
  Check,
  ChatDotRound,
  QuestionFilled,
  Memo,
  Message,
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 计算属性：检查用户是否已认证
const isAuthenticated = computed(() => {
  // 只检查 token 是否存在，因为登录后 token 会立即设置
  return !!userStore.token
})

// 获取头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return '/src/assets/images/avatar.jpeg'
  if (typeof avatar === 'string' && avatar.startsWith('http')) return avatar
  return (settings.imgBaseUrl || '') + avatar
}

// 跳转到首页
const goHome = () => {
  router.push('/main-page')
}

// 处理下拉菜单命令
const handleDropdownCommand = async (command) => {
  try {
    switch (command) {
      case 'profile':
        router.push('/user/profile')
        break
      case 'settings':
        router.push('/user/settings')
        break
      case 'logout':
        await userStore.LogOut()
        router.push('/login')
        break
      default:
        console.warn('未知的命令:', command)
    }
  } catch (error) {
    console.error('处理用户操作时出错:', error)
  }
}
</script>

<style scoped>
.header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 120px;
  height: 50px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.navigation {
  flex: 1;
  display: flex;
  justify-content: right;
  margin: 0 2rem;
}

.navigation ul {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.active-link {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff !important;
  font-weight: 600;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  margin-right: -1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.username {
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
}

.dropdown-icon {
  color: #fff;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.auth-link {
  text-decoration: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 1rem;
  }

  .logo {
    width: 100px;
    height: 40px;
  }

  .navigation ul {
    gap: 0.5rem;
  }

  .nav-link {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
  }

  .nav-link span {
    display: none;
  }

  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .navigation {
    display: none;
  }

  .header {
    justify-content: space-between;
  }
}
</style>
