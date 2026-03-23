import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // 仅作未配置 VITE_APP_WS_URL 时的兜底；易触发浏览器↔Vite 压缩协商与后端不一致 → 1002，开发环境请在 .env.dev 设直连 ws://127.0.0.1:9999/ws
      '/ws': {
        target: 'http://127.0.0.1:9999',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
