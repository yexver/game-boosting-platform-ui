<template>
  <div class="post-order-page">
    <div class="page-header">
      <h2>发布代练订单</h2>
      <div class="header-buttons">
        <el-button type="warning" @click="showOrderOptimize = true">
          <el-icon><MagicStick /></el-icon>
          AI优化订单
        </el-button>
        <el-button
          type="primary"
          class="find-booster-btn"
          @click="goToFindBooster"
        >
          寻找打手
        </el-button>
      </div>
    </div>

    <el-form
      ref="orderFormRef"
      :model="orderForm"
      :rules="orderRules"
      label-width="120px"
      class="order-form"
    >
      <!-- 游戏选择区域 -->
      <div class="form-section">
        <h3 class="section-title">选择游戏</h3>
        <div class="game-select-row">
          <el-form-item label="游戏" prop="gameId" class="game-select-item">
            <el-select
              v-model="orderForm.gameId"
              placeholder="请选择游戏"
              @change="handleGameChange"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="game in gameList"
                :key="game.id"
                :label="game.name"
                :value="game.id"
              >
                <div class="game-option">
                  <img
                    v-if="game.icon"
                    :src="
                      game.icon.startsWith('http')
                        ? game.icon
                        : settings.imgBaseUrl + game.icon
                    "
                    class="game-icon"
                  />
                  <span>{{ game.name }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="系统" prop="systemId" class="game-select-item">
            <el-select
              v-model="orderForm.systemId"
              placeholder="请选择系统"
              @change="handleSystemChange"
              :disabled="!orderForm.gameId"
              style="width: 100%"
            >
              <el-option
                v-for="system in systemList"
                :key="system.id"
                :label="system.name"
                :value="system.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="区服" prop="serverId" class="game-select-item">
            <el-select
              v-model="orderForm.serverId"
              placeholder="请选择区服"
              :disabled="!orderForm.systemId"
              style="width: 100%"
              filterable
              clearable
            >
              <el-option :key="'default'" :label="'默认服'" :value="''" />
              <el-option
                v-for="server in filteredServerList"
                :key="server.id"
                :label="server.name"
                :value="server.id"
              />
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- 订单信息区域 -->
      <div class="form-section">
        <h3 class="section-title">订单信息</h3>
        <div class="order-info-row">
          <el-form-item
            label="代练类型"
            prop="boostingType"
            class="order-info-item"
          >
            <el-select
              v-model="orderForm.boostingType"
              placeholder="请选择代练类型"
              style="width: 100%"
            >
              <el-option
                v-for="type in boostingTypeList"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="订单标题" prop="title" class="order-info-item">
            <el-input
              v-model="orderForm.title"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              placeholder="请输入订单标题，如：王者荣耀钻石到星耀代练"
              maxlength="400"
              show-word-limit
            />
          </el-form-item>
        </div>

        <el-form-item label="订单描述" prop="description">
          <el-input
            v-model="orderForm.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 8 }"
            placeholder="请详细描述您的代练需求，如：从钻石5到星耀5，要求胜率60%以上，不要掉分"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="游戏账号信息" prop="accountInfo">
          <div
            style="
              display: flex;
              width: 100%;
              align-items: flex-start;
              gap: 8px;
            "
          >
            <el-input
              v-model="orderForm.accountInfo"
              type="textarea"
              :rows="5"
              placeholder="请提供游戏账号信息，如：账号、密码、区服等（代练师会联系您获取）"
              maxlength="500"
              show-word-limit
              style="flex: 1"
            />
            <el-button
              type="primary"
              @click="fillAccountTemplate"
              style="height: 38px"
              >使用模板</el-button
            >
          </div>
        </el-form-item>
      </div>

      <!-- 金额设置区域 -->
      <div class="form-section">
        <h3 class="section-title">
          金额设置
          <el-button
            type="success"
            size="small"
            @click="showPriceRecommend = true"
            style="margin-left: 16px"
          >
            <el-icon><MagicStick /></el-icon>
            AI智能定价
          </el-button>
        </h3>
        <div class="amount-row">
          <el-form-item label="订单金额" prop="price" class="amount-item">
            <el-input-number
              v-model="orderForm.price"
              :min="10"
              :max="10000"
              :precision="2"
              :step="10"
              style="width: 100%"
              placeholder="请输入订单金额（元）"
              @change="handlePriceChange"
            />
            <div class="form-tip price-tip">订单金额不能低于10元</div>
          </el-form-item>

          <el-form-item
            label="安全保证金"
            prop="securityDeposit"
            class="amount-item"
          >
            <el-input-number
              v-model="orderForm.securityDeposit"
              :min="0"
              :max="orderForm.price || 0"
              :precision="2"
              :step="10"
              style="width: 100%"
              placeholder="安全保证金（元），可选"
            />
            <div class="form-tip">
              安全保证金用于保障账号安全，代练完成后退还
            </div>
          </el-form-item>

          <el-form-item
            label="效率保证金"
            prop="efficiencyDeposit"
            class="amount-item"
          >
            <el-input-number
              v-model="orderForm.efficiencyDeposit"
              :min="0"
              :max="orderForm.price || 0"
              :precision="2"
              :step="10"
              style="width: 100%"
              placeholder="效率保证金（元），可选"
            />
            <div class="form-tip">
              效率保证金用于激励代练师按时完成，完成后退还
            </div>
          </el-form-item>
        </div>
      </div>

      <!-- 时间设置区域 -->
      <div class="form-section">
        <h3 class="section-title">时间设置</h3>
        <div class="time-row">
          <el-form-item label="代练时限" prop="timeLimit" class="time-item">
            <el-input-number
              v-model="orderForm.timeLimit"
              :min="1"
              :max="720"
              :step="1"
              style="width: 100%"
              placeholder="请输入代练时限（小时）"
            />
            <div class="form-tip">代练师需要在指定时间内完成代练任务</div>
          </el-form-item>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button @click="resetForm">重置</el-button>
        <el-button
          type="primary"
          @click="showPasswordDialog"
          :loading="submitting"
        >
          发布订单
        </el-button>
      </div>
    </el-form>

    <!-- 密码输入模态框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="安全验证"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="password-dialog-content">
        <div class="password-icon">🔒</div>
        <div class="password-title">请输入登录密码</div>
        <div class="password-desc">
          为了保障您的账户安全，发布订单前需要验证密码
        </div>

        <el-form
          ref="passwordFormRef"
          :model="orderForm"
          :rules="orderRules"
          class="password-form"
        >
          <el-form-item prop="password">
            <el-input
              v-model="orderForm.password"
              type="password"
              placeholder="请输入登录密码"
              show-password
              @keyup.enter="confirmPassword"
              ref="passwordInputRef"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelPassword">取消</el-button>
          <el-button
            type="primary"
            @click="confirmPassword"
            :loading="passwordSubmitting"
          >
            确认发布
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- AI价格建议组件 -->
    <PriceRecommend
      v-model="showPriceRecommend"
      :initial-data="priceRecommendData"
      @apply="handleApplyPrice"
    />

    <!-- AI订单优化组件 -->
    <OrderOptimize
      v-model="showOrderOptimize"
      :title="orderForm.title"
      :description="orderForm.description"
      :game-name="selectedGameName"
      @apply="handleApplyOptimize"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineOptions, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getGameList, getSystemList, getServerList } from '@/api/game/game'
import { postOrder } from '@/api/order/postOrder'
import settings from '@/settings'
import PriceRecommend from '@/views/recommend/PriceRecommend.vue'
import OrderOptimize from '@/views/recommend/OrderOptimize.vue'

defineOptions({ name: 'PostOrderPage' })

const router = useRouter()
const orderFormRef = ref()
const passwordFormRef = ref()
const passwordInputRef = ref()
const submitting = ref(false)
const passwordSubmitting = ref(false)
const passwordDialogVisible = ref(false)

// AI推荐相关
const showPriceRecommend = ref(false)
const showOrderOptimize = ref(false)

// 计算属性：获取选中游戏的名称
const selectedGameName = computed(() => {
  const game = gameList.value.find((g) => g.id === orderForm.gameId)
  return game ? game.name : ''
})

// 价格建议初始数据
const priceRecommendData = computed(() => ({
  userId: null,
  gameId: orderForm.gameId,
  gameName: selectedGameName.value,
  systemId: orderForm.systemId,
  serverId: orderForm.serverId,
  boostingType: orderForm.boostingType,
  timeLimit: orderForm.timeLimit,
}))

// 应用价格建议
const handleApplyPrice = (data) => {
  if (data.price) {
    orderForm.price = data.price
  }
  if (data.securityDeposit !== undefined) {
    orderForm.securityDeposit = data.securityDeposit
  }
  if (data.efficiencyDeposit !== undefined) {
    orderForm.efficiencyDeposit = data.efficiencyDeposit
  }
  ElMessage.success('已应用推荐价格')
}

// 应用订单优化
const handleApplyOptimize = (data) => {
  if (data.title) {
    orderForm.title = data.title
  }
  if (data.description) {
    orderForm.description = data.description
  }
  ElMessage.success('已应用优化建议')
}

// 表单数据
const orderForm = reactive({
  gameId: '',
  systemId: '',
  serverId: '',
  boostingType: 1,
  title: '',
  description: '',
  accountInfo: '',
  price: null,
  securityDeposit: 0,
  efficiencyDeposit: 0,
  timeLimit: null,
  password: '', // 添加密码字段
})

// 代练类型列表
const boostingTypeList = ref([
  { value: 1, label: '代练' },
  { value: 2, label: '陪练' },
])

// 模拟数据 - 实际项目中应该从API获取
const gameList = ref([])

onMounted(async () => {
  const res = await getGameList()
  gameList.value = res.data || []
})

const systemList = ref([])

const handleGameChange = async () => {
  orderForm.systemId = ''
  orderForm.serverId = ''
  if (orderForm.gameId) {
    const res = await getSystemList(orderForm.gameId)
    console.log('系统接口返回:', res)
    systemList.value = res.data || []
  } else {
    systemList.value = []
  }
}

const serverList = ref([])

const handleSystemChange = async () => {
  orderForm.serverId = ''
  if (orderForm.gameId && orderForm.systemId) {
    const res = await getServerList(orderForm.gameId, orderForm.systemId)
    console.log('请求区服参数:', orderForm.gameId, orderForm.systemId)
    console.log('区服接口返回:', res)
    serverList.value = res.data || []
  } else {
    serverList.value = []
  }
}

// 过滤区服列表
const filteredServerList = computed(() => serverList.value)

// 重置表单
const resetForm = () => {
  orderFormRef.value.resetFields()
  orderForm.password = '' // 重置密码字段
}

// 显示密码输入对话框
const showPasswordDialog = async () => {
  try {
    await orderFormRef.value.validate()
    passwordDialogVisible.value = true
    // 重置密码字段
    orderForm.password = ''
    passwordFormRef.value?.resetFields()
    // 聚焦到密码输入框
    setTimeout(() => {
      passwordInputRef.value?.focus()
    }, 100)
  } catch {
    // 表单验证失败，不显示密码对话框
  }
}

// 取消密码输入
const cancelPassword = () => {
  passwordDialogVisible.value = false
  orderForm.password = ''
  passwordFormRef.value?.resetFields()
}

// 确认密码并提交订单
const confirmPassword = async () => {
  try {
    await passwordFormRef.value.validate()

    passwordSubmitting.value = true

    // 直接提交订单（包含密码）
    await submitOrder()

    // 关闭密码对话框
    passwordDialogVisible.value = false
    orderForm.password = ''
  } catch (error) {
    console.error('提交失败', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    passwordSubmitting.value = false
  }
}

// 提交订单
const submitOrder = async () => {
  try {
    submitting.value = true

    // 调用后端API发布订单
    const res = await postOrder(orderForm)
    if (res && res.code === 200) {
      ElMessage.success('订单发布成功！')
      // 跳转到订单列表页
      router.push('/order-list')
    } else {
      ElMessage.error(res.msg || '订单发布失败')
    }
  } finally {
    submitting.value = false
  }
}

// 账号信息模板
function fillAccountTemplate() {
  orderForm.accountInfo = `账号：
密码：
区服：
角色名：
联系方式：`
}

const goToFindBooster = () => {
  // 假设跳转到 /booster-list 页面（你可以改成实际路由）
  router.push('/booster-list')
}

const orderRules = {
  gameId: [{ required: true, message: '请选择游戏', trigger: 'change' }],
  systemId: [{ required: true, message: '请选择系统', trigger: 'change' }],
  serverId: [{ required: false, message: '请选择区服', trigger: 'change' }],
  boostingType: [
    { required: true, message: '请选择代练类型', trigger: 'change' },
  ],
  title: [
    { required: true, message: '请输入订单标题', trigger: 'blur' },
    {
      min: 5,
      max: 200,
      message: '标题长度在 5 到 200 个字符',
      trigger: 'blur',
    },
  ],
  description: [
    { required: true, message: '请输入订单描述', trigger: 'blur' },
    {
      min: 10,
      max: 1000,
      message: '描述长度在 10 到 1000 个字符',
      trigger: 'blur',
    },
  ],
  accountInfo: [
    { required: true, message: '请输入游戏账号信息', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入订单金额', trigger: 'blur' },
    {
      type: 'number',
      min: 10,
      message: '订单金额不能小于10元',
      trigger: 'blur',
    },
  ],
  securityDeposit: [
    { type: 'number', min: 0, message: '安全保证金不能小于0', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value > orderForm.price) {
          callback(new Error('安全保证金不能大于订单金额'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  efficiencyDeposit: [
    { type: 'number', min: 0, message: '效率保证金不能小于0', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value > orderForm.price) {
          callback(new Error('效率保证金不能大于订单金额'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  timeLimit: [
    { required: true, message: '请输入代练时限', trigger: 'blur' },
    { type: 'number', min: 1, message: '时限必须大于0', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

// 处理订单金额变化
const handlePriceChange = (value) => {
  if (value && value < 10) {
    ElMessage.warning('订单金额不能低于10元')
    orderForm.price = 10
  }
}
</script>

<style scoped>
.post-order-page {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
}

.header-buttons {
  display: flex;
  gap: 12px;
}

.subtitle {
  color: #666;
  margin: 0;
}

.order-form {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.form-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
}

.game-select-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.game-select-item {
  flex: 1;
  min-width: 0;
}

.amount-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.amount-item {
  flex: 1;
  min-width: 0;
}

.time-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.time-item {
  flex: 1;
  min-width: 0;
}

.order-info-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.order-info-item {
  flex: 1;
  min-width: 0;
}

.order-info-row .order-info-item:first-child {
  flex: 0.6;
}
.order-info-row .order-info-item:last-child {
  flex: 2;
}

.game-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.game-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  line-height: 1.4;
}

.form-actions {
  text-align: center;
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.form-actions .el-button {
  margin: 0 10px;
  min-width: 120px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
}

:deep(.el-select) {
  width: 100%;
}

/* 密码对话框样式 */
.password-dialog-content {
  text-align: center;
  padding: 20px 0;
}

.password-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.password-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.password-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.password-form {
  max-width: 300px;
  margin: 0 auto;
}

.dialog-footer {
  text-align: center;
}

.dialog-footer .el-button {
  min-width: 100px;
  margin: 0 8px;
}

.find-booster-btn {
  margin-left: auto;
}
</style>
