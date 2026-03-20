<template>
  <div class="home-container">
    <Head v-if="!hideHeader" ref="headRef" />
    <div class="content">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive" />
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" />
    </div>
  </div>
  <!-- 右侧固定模块 -->
  <div class="right-fixed-panel" :class="{ show: isVisible }">
    <div class="fixed-item" @click="goToOnlineService">
      <el-icon><ChatDotRound /></el-icon>
      <span>在线客服</span>
    </div>
    <div class="fixed-item" @click="scrollToTop">
      <el-icon><ArrowUpBold /></el-icon>
      <span>回到顶部</span>
    </div>
  </div>
</template>

<script setup>
import Head from '@/component/PageHeader.vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowUpBold, ChatDotRound } from '@element-plus/icons-vue'
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'

const router = useRouter()
const route = useRoute()

// 判断是否为详情页
const hideHeader = computed(() => route.name === 'PublishedOrderDetail')

// 跳转到在线客服页面
const goToOnlineService = () => {
  router.push('/online-service')
}

// 回到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const isVisible = ref(false)
const headRef = ref(null)

function handleScroll() {
  if (!headRef.value) return
  const headBottom = headRef.value.$el
    ? headRef.value.$el.getBoundingClientRect().bottom + window.scrollY
    : headRef.value.getBoundingClientRect().bottom + window.scrollY
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  isVisible.value = scrollTop > headBottom
}

onMounted(() => {
  nextTick(() => {
    window.addEventListener('scroll', handleScroll)
    handleScroll()
  })
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  text-align: center;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  width: 100%;
}
.right-fixed-panel {
  position: fixed;
  right: 2rem;
  bottom: 15rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 999;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.right-fixed-panel.show {
  opacity: 1;
  transform: translateY(0);
}

.fixed-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 6px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  text-align: center;
}

.fixed-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}
</style>
