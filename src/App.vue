<script setup>
import { onMounted } from 'vue'
import locale from '@/assets/locale/cn' // 自己创建的配置
// 引入element-plus中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// 合并默认中文 + 自定义设置
zhCn.el.pagination = Object.assign(zhCn.el.pagination, locale.el.pagination)
import { useMessageStore } from '@/stores'

const messageStore = useMessageStore()

// 全局初始化 WebSocket
onMounted(() => {
  // 初始化消息未读数
  messageStore.loadMessages()

  // 初始化 WebSocket
  messageStore.initWebSocket()
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
