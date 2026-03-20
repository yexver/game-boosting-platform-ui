//import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import pinia from '@/stores/index'
import App from './App.vue'
import router from './router'
import cn from '@/assets/locale/cn.js'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: cn })

app.mount('#app')
