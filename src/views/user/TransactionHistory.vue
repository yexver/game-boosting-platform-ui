<template>
  <div class="transaction-history">
    <el-button class="back-btn" @click="goBack" plain>
      <el-icon><ArrowLeft /></el-icon>
      返回
    </el-button>

    <div class="page-header">
      <h2>流水记录</h2>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card income">
        <div class="stat-content">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"
                fill="#67c23a"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#fff"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ totalIncome.toFixed(2) }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card expense">
        <div class="stat-content">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#f56c6c" />
              <path
                d="M15 9l-6 6M9 9l6 6"
                stroke="#fff"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ totalExpense.toFixed(2) }}</div>
            <div class="stat-label">总支出</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card balance">
        <div class="stat-content">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2" fill="#409eff" />
              <circle cx="12" cy="12" r="3" fill="#fff" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ netAmount.toFixed(2) }}</div>
            <div class="stat-label">净收益</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <el-card class="chart-card">
      <div class="chart-header">
        <h3>收支趋势</h3>
        <el-radio-group v-model="chartPeriod" size="small">
          <el-radio-button label="7">近7天</el-radio-button>
          <el-radio-button label="30">近30天</el-radio-button>
        </el-radio-group>
      </div>
      <div class="chart-container" ref="chartRef"></div>
    </el-card>

    <div class="filter-section">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-select v-model="filterType" placeholder="交易类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="收入" value="1" />
            <el-option label="支出" value="8" />
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="fetchTransactions">查询</el-button>
        </el-col>
      </el-row>
    </div>

    <div class="transaction-list" v-loading="loading">
      <el-card
        v-for="item in transactions"
        :key="item.id"
        class="transaction-item"
      >
        <div class="transaction-content">
          <div class="transaction-info">
            <div class="transaction-title">{{ item.title }}</div>
            <div class="transaction-time">
              {{ formatTime(item.createTime) }}
            </div>
            <div class="transaction-desc" v-if="item.description">
              {{ item.description }}
            </div>
          </div>
          <div class="transaction-amount" :class="item.type">
            {{ item.type === 'income' ? '+' : '-' }}¥{{
              item.amount.toFixed(2)
            }}
          </div>
        </div>
      </el-card>

      <el-empty
        v-if="!loading && transactions.length === 0"
        description="暂无流水记录"
      />
    </div>

    <el-pagination
      v-if="total > 0"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getTransactionHistory } from '@/api/account'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores'

const router = useRouter()
const loading = ref(false)
const transactions = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const filterType = ref('')
const dateRange = ref([])
const chartPeriod = ref('7')
const chartRef = ref(null)
let chartInstance = null
const userStore = useUserStore()

const goBack = () => {
  router.back()
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const fetchTransactions = async () => {
  loading.value = true
  try {
    const params = {
      userId: userStore.userId,
      page: currentPage.value, // 改为 page
      size: pageSize.value, // 改为 size
      type: filterType.value,
      startDate: dateRange.value?.[0], // 改为 startDate
      endDate: dateRange.value?.[1], // 改为 endDate
    }
    const res = await getTransactionHistory(params)

    transactions.value = (res.data.records || []).map((item) => ({
      ...item,
      title: getTransactionTitle(item.type),
      type: getTransactionType(item.type),
      createTime: item.createdAt,
      description: item.remark,
    }))

    total.value = Number(res.data.total) || 0
  } catch (error) {
    console.error('获取流水记录失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTransactions()
  nextTick(() => {
    drawChart()
  })
})

// 根据交易类型获取标题
const getTransactionTitle = (type) => {
  const typeMap = {
    1: '收入',
    8: '支出',
    // 可以根据实际业务添加更多类型
  }
  return typeMap[type] || '其他'
}

// 根据交易类型判断收入/支出
const getTransactionType = (type) => {
  return type === 1 ? 'income' : 'expense'
}

// 统计数据
const totalIncome = computed(() => {
  return transactions.value
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)
})

const netAmount = computed(() => totalIncome.value - totalExpense.value)

// 图表数据处理
const getChartData = () => {
  const days = parseInt(chartPeriod.value)
  const now = new Date()
  const chartData = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]

    // 计算当天的收入和支出
    const dayTransactions = transactions.value.filter((item) => {
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0]
      return itemDate === dateStr
    })

    const income = dayTransactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)

    const expense = dayTransactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)

    chartData.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      income,
      expense,
    })
  }

  return chartData
}

// 绘制图表
const drawChart = () => {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)
  const chartData = getChartData()

  const option = {
    title: {
      text: '收支趋势',
      left: 'center',
      textStyle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
      formatter: function (params) {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((param) => {
          const color = param.color
          const value = param.value.toFixed(2)
          result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>${param.seriesName}: ¥${value}<br/>`
        })
        return result
      },
    },
    legend: {
      data: ['收入', '支出'],
      top: 30,
      textStyle: {
        color: '#666',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.map((item) => item.date),
      axisLine: {
        lineStyle: {
          color: '#e0e0e0',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e0e0e0',
        },
      },
      axisLabel: {
        color: '#666',
        formatter: '¥{value}',
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
        },
      },
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: chartData.map((item) => item.income),
        lineStyle: {
          color: '#67c23a',
          width: 3,
        },
        itemStyle: {
          color: '#67c23a',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' },
          ]),
        },
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        data: chartData.map((item) => item.expense),
        lineStyle: {
          color: '#f56c6c',
          width: 3,
        },
        itemStyle: {
          color: '#f56c6c',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.1)' },
          ]),
        },
      },
    ],
  }

  chartInstance.setOption(option)

  // 响应式
  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
}

// 监听图表周期变化
watch(chartPeriod, () => {
  nextTick(() => {
    drawChart()
  })
})

// 分页事件处理
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchTransactions()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  fetchTransactions()
}
</script>

<style scoped>
.transaction-history {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.back-btn {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.page-header h2 {
  margin: 0 0 32px 0;
  color: #fff;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.filter-section {
  margin-bottom: 24px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  border: none;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #67c23a, #85ce61);
}

.stat-card.expense::before {
  background: linear-gradient(90deg, #f56c6c, #f78989);
}

.stat-card.balance::before {
  background: linear-gradient(90deg, #409eff, #66b1ff);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
}

.stat-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #67c23a, #85ce61);
  box-shadow: 0 8px 20px rgba(103, 194, 58, 0.3);
}

.stat-card.expense .stat-icon {
  background: linear-gradient(135deg, #f56c6c, #f78989);
  box-shadow: 0 8px 20px rgba(245, 108, 108, 0.3);
}

.stat-card.balance .stat-icon {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #333, #666);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 16px;
  color: #666;
  font-weight: 500;
  letter-spacing: 1px;
}

.chart-card {
  margin-bottom: 32px;
  border: none;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px 24px 0;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
}

.chart-container {
  height: 400px;
  position: relative;
  padding: 20px;
  border-radius: 16px;
  background: #fff;
}

.transaction-item {
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.transaction-item :deep(.el-card) {
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.transaction-item :deep(.el-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.transaction-item :deep(.el-card__body) {
  padding: 16px 20px;
}

.transaction-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-title {
  font-weight: 600;
  color: #333;
  font-size: 15px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.transaction-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.transaction-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-amount {
  font-size: 1.2rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.transaction-amount.income {
  color: #67c23a;
}

.transaction-amount.expense {
  color: #f56c6c;
}

:deep(.el-pagination) {
  justify-content: center;
  margin-top: 32px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

:deep(.el-radio-group .el-radio-button__inner) {
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

:deep(
  .el-radio-group .el-radio-button__original:checked + .el-radio-button__inner
) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .transaction-history {
    padding: 16px;
  }

  .page-header h2 {
    font-size: 2rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-content {
    padding: 20px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .transaction-item :deep(.el-card__body) {
    padding: 12px 16px;
  }

  .transaction-content {
    gap: 12px;
  }

  .transaction-title {
    font-size: 14px;
  }

  .transaction-amount {
    font-size: 1.1rem;
  }

  .transaction-desc {
    max-width: 200px;
  }
}
</style>
