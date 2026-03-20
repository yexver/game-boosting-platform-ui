<template>
  <div class="home-container">
    <!-- 图片轮播 -->
    <div class="carousel-container">
      <el-carousel
        :interval="3000"
        height="250px"
        indicator-position="outside"
        arrow="hover"
        class="main-carousel"
        autoplay
      >
        <el-carousel-item v-for="(image, index) in carouselImages" :key="index">
          <div class="carousel-item">
            <img :src="image.src" :alt="image.alt" class="carousel-image" />
            <div class="carousel-overlay">
              <h2 class="carousel-title">{{ image.title }}</h2>
              <p class="carousel-description">{{ image.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 搜索组件覆盖在轮播上 -->
      <div
        class="search-overlay"
        :class="{ fixed: isFixed }"
        ref="searchContainerRef"
      >
        <div class="custom-search-input">
          <input
            type="text"
            placeholder="请输入游戏名称"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            @input="handleSearchInput"
            class="search-input"
          />
          <button @click="handleSearch" class="search-button">
            <el-icon><Search /></el-icon>
          </button>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="product-list">
        <el-row :gutter="20" justify="center">
          <el-col
            v-for="product in displayedProducts"
            :key="product.id"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="4"
            :xl="3"
          >
            <el-card
              class="product-card"
              shadow="hover"
              @click="goToTakeOrder(product)"
            >
              <div class="image-wrapper">
                <img :src="product.image" class="product-image" />
              </div>
              <div class="product-title">{{ product.title }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getGameList } from '@/api/game/game'
import settings from '@/settings'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const isFixed = ref(false)
const searchContainerRef = ref(null)
const router = useRouter()

// 轮播图片数据
const carouselImages = ref([
  {
    src: '/src/assets/homePage/image01.png',
    alt: '游戏代练服务',
    title: '专业游戏代练服务',
    description: '快速、安全、专业的游戏代练平台',
  },
  {
    src: '/src/assets/homePage/image02.png',
    alt: '多款游戏支持',
    title: '多款热门游戏',
    description: '王者荣耀、英雄联盟、原神等热门游戏',
  },
  {
    src: '/src/assets/homePage/image03.png',
    alt: '安全保障',
    title: '安全保障',
    description: '账号安全，隐私保护，放心代练',
  },
])

const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const searchPosition = 162 // 搜索框在轮播图中的位置 (65% * 250px)

  // 当滚动超过搜索框位置时，固定搜索框
  if (scrollTop >= searchPosition) {
    isFixed.value = true
  } else {
    isFixed.value = false
  }
}

// 使用 requestAnimationFrame 优化滚动性能
let ticking = false
const optimizedHandleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleScroll()
      ticking = false
    })
    ticking = true
  }
}

// 替换静态 products 为响应式并动态获取
const products = ref([])
const displayedProducts = ref([]) // 用于显示的游戏列表

onMounted(async () => {
  window.addEventListener('scroll', optimizedHandleScroll, { passive: true })
  // 动态获取游戏列表
  const res = await getGameList()
  console.log(res)
  // 假设返回数据结构为 { data: [{ id, name, imageUrl }, ...] }
  products.value = (res.data || []).map((item) => {
    let image =
      item.icon && !item.icon.startsWith('http')
        ? settings.imgBaseUrl + item.icon
        : item.icon ||
          'https://via.placeholder.com/300x200?text=' +
            (item.name || item.title)
    console.log('最终图片地址:', image)
    return {
      id: item.id,
      title: item.name || item.title,
      image,
    }
  })

  // 初始化显示的游戏列表
  displayedProducts.value = products.value
})

onUnmounted(() => {
  window.removeEventListener('scroll', optimizedHandleScroll)
})

// 实时搜索处理
const handleSearchInput = () => {
  if (searchQuery.value.trim()) {
    // 在本地过滤游戏列表
    const searchTerm = searchQuery.value.trim().toLowerCase()
    const filteredProducts = products.value.filter((product) =>
      product.title.toLowerCase().includes(searchTerm)
    )

    // 更新显示的游戏列表
    displayedProducts.value = filteredProducts
  } else {
    // 如果搜索框为空，显示所有游戏
    displayedProducts.value = products.value
  }
}

const handleSearch = () => {
  console.log('执行搜索:', searchQuery.value)
  if (searchQuery.value.trim()) {
    // 在本地过滤游戏列表
    const searchTerm = searchQuery.value.trim().toLowerCase()
    const filteredProducts = products.value.filter((product) =>
      product.title.toLowerCase().includes(searchTerm)
    )

    if (filteredProducts.length === 0) {
      ElMessage.info('未找到相关游戏')
    }

    // 更新显示的游戏列表
    displayedProducts.value = filteredProducts
  } else {
    // 如果搜索框为空，显示所有游戏
    displayedProducts.value = products.value
  }
}

function goToTakeOrder(product) {
  router.push({
    path: '/take-order',
    query: { game: product.title },
  })
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 轮播容器样式 */
.carousel-container {
  width: 100%;
  position: relative;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.main-carousel {
  width: 100%;
  border-radius: 0;
  overflow: hidden;
}

.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8);
  transition: all 0.3s ease;
}

.carousel-item:hover .carousel-image {
  filter: brightness(1);
  transform: scale(1.05);
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 40px 20px 20px;
  color: white;
}

.carousel-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.carousel-description {
  font-size: 1.1rem;
  opacity: 0.9;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
}

/* 搜索覆盖层 */
.search-overlay {
  position: absolute;
  top: 65%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  transition: all 0.3s ease;
}

.search-overlay.fixed {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.custom-search-input {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-width: 400px;
  transition: all 0.3s ease;
}

.custom-search-input:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 20px;
  font-size: 16px;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 20px;
  padding: 12px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 内容区域 */
.content {
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
}

.product-list {
  margin-bottom: 40px;
}

.product-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  height: 180px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.image-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(102, 126, 234, 0.1),
    rgba(118, 75, 162, 0.1)
  );
  opacity: 0;
  transition: all 0.3s ease;
}

.product-card:hover .image-wrapper::after {
  opacity: 1;
}

.product-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-title {
    font-size: 1.5rem;
  }

  .carousel-description {
    font-size: 1rem;
  }

  .custom-search-input {
    min-width: 300px;
  }

  .search-input {
    padding: 10px 16px;
    font-size: 14px;
  }

  .content {
    padding: 0 16px;
  }

  .image-wrapper {
    height: 150px;
  }

  .product-title {
    padding: 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .custom-search-input {
    min-width: 280px;
  }

  .carousel-overlay {
    padding: 20px 15px 15px;
  }

  .carousel-title {
    font-size: 1.2rem;
  }

  .carousel-description {
    font-size: 0.9rem;
  }
}
</style>
