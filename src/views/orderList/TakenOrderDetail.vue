<template>
  <div class="order-detail">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <span class="back-icon" @click="goBack" title="返回">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 19l-7-7 7-7"
            stroke="#fff"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <div class="status-center">
        <div class="status">{{ statusText }}</div>
        <div v-if="detail.startAt && detail.timeLimit">
          <div v-if="isActualDone">
            <!-- 完成状态 -->
          </div>
          <div v-else class="countdown">
            <svg
              class="clock-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="#bbb" stroke-width="2" />
              <path
                d="M12 7v5l3 3"
                stroke="#bbb"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            剩余：{{ countdown }}
          </div>
        </div>
      </div>
      <span class="icons">
        <!-- 图片图标 -->
        <svg class="icon-img" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="#222"
            stroke-width="2"
          />
          <circle cx="8" cy="10" r="2" fill="#222" />
          <path
            d="M21 19L16 14L13 17L9 13L3 19"
            stroke="#222"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <!-- 消息图标，添加点击事件 -->
        <span @click="goToChatRoom" style="cursor: pointer">
          <svg class="icon-img" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#222" stroke-width="2" />
            <circle cx="9" cy="12" r="1" fill="#222" />
            <circle cx="12" cy="12" r="1" fill="#222" />
            <circle cx="15" cy="12" r="1" fill="#222" />
          </svg>
        </span>
      </span>
    </div>
    <!-- 订单编号 -->
    <div class="order-no">
      <span class="order-no-label">订单编号：</span>
      <span class="order-no-value">{{ detail.orderNo }}</span>
      <span class="copy-icon" @click="copyOrderNo" title="复制订单号">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect
            x="7"
            y="9"
            width="10"
            height="10"
            rx="2"
            stroke="#888"
            stroke-width="2"
          />
          <rect
            x="5"
            y="5"
            width="10"
            height="10"
            rx="2"
            stroke="#bbb"
            stroke-width="2"
          />
        </svg>
      </span>
    </div>
    <!-- 标题、备注区 -->
    <div class="order-title-row">
      <div class="order-title-main">
        <div class="title-icons-row">
          <img
            v-if="detail.gameIcon"
            :src="getFullIconUrl(detail.gameIcon)"
            alt="游戏图标"
            class="game-system-icon"
          />
          <img
            v-if="detail.systemIcon"
            :src="getFullIconUrl(detail.systemIcon)"
            alt="系统图标"
            class="game-system-icon"
          />
          <span class="order-title">{{ detail.title }}</span>
        </div>
      </div>
    </div>
    <!-- 游戏/系统/服务 -->
    <div class="order-meta-row">
      <span>{{ detail.gameName }}</span>
      <span>{{ detail.systemName }}</span>
      <span v-if="detail.serverName">{{ detail.serverName }}</span>
      <span v-else>默认服</span>
    </div>
    <div class="order-meta-row">
      发布时间：{{ formatDate(detail.createdAt) }}
    </div>
    <div class="order-meta-row">
      该订单适用于
      <span class="order-rule" @click="showRuleModal = true">平台规则</span>
      <svg
        class="rule-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke="#bbb" stroke-width="2" />
        <text x="12" y="17" text-anchor="middle" font-size="14" fill="#bbb">
          ?
        </text>
      </svg>
    </div>
    <!-- 价格 -->
    <div class="order-price">
      <span class="price">￥{{ detail.price }}</span>
    </div>
    <!-- 保证金/效率金/时长 -->
    <div class="funds-summary">
      <div class="funds-item">
        <div class="funds-value">
          {{ detail.securityDeposit }}<span class="funds-unit">元</span>
        </div>
        <div class="funds-label">安全保证金</div>
      </div>
      <div class="funds-item">
        <div class="funds-value">
          {{ detail.efficiencyDeposit }}<span class="funds-unit">元</span>
        </div>
        <div class="funds-label">效率保证金</div>
      </div>
      <div class="funds-item">
        <div class="funds-value">
          {{ detail.timeLimit }}<span class="funds-unit">时</span>
        </div>
        <div class="funds-label">代练时长</div>
      </div>
    </div>
    <!-- 订单描述模块 -->
    <div v-if="detail.description" class="desc-card">
      <div class="desc-title">订单描述</div>
      <div class="desc-content">{{ detail.description }}</div>
    </div>
    <!-- 最终交付信息 -->
    <div v-if="[5, 6, 10].includes(detail.status)" class="final-delivery-card">
      <div class="final-delivery-title">最终交付</div>
      <div class="final-delivery-row">
        <span>订单金额：</span>
        <span style="color: #222; font-weight: bold">{{
          finalDelivery.price ?? '-'
        }}</span>
      </div>
      <div class="final-delivery-row">
        <span>保证金支付金额：</span>
        <span style="color: #222; font-weight: bold">{{
          finalDelivery.deposit ?? '-'
        }}</span>
      </div>
    </div>
    <!-- 账号信息模块 -->
    <div class="account-info-card">
      <button
        class="account-info-btn"
        @click="showAccountInfo = !showAccountInfo"
      >
        <svg
          class="account-info-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
            fill="#2196f3"
            opacity="0.15"
          />
          <rect x="7" y="7" width="10" height="2" rx="1" fill="#2196f3" />
          <rect x="7" y="11" width="10" height="2" rx="1" fill="#2196f3" />
          <rect x="7" y="15" width="6" height="2" rx="1" fill="#2196f3" />
        </svg>
        <span>查看号主联系方式/账号信息</span>
      </button>
      <div v-if="showAccountInfo" class="account-info-content">
        {{ detail.accountInfo || '暂无账号信息' }}
      </div>
    </div>
    <!-- 操作按钮 -->
    <div
      class="actions"
      v-if="
        showRevokeBtn ||
        showAcceptBtn ||
        showCancelRevokeBtn ||
        showViewRevokeBtn ||
        showUploadImgBtn
      "
    >
      <button
        v-if="showRevokeBtn"
        class="btn-revoke"
        @click="showRevokeApplyModal = true"
      >
        申请撤销
      </button>
      <button
        v-if="showAcceptBtn"
        class="btn-accept"
        @click="showAcceptApplyModal = true"
      >
        申请验收
      </button>
      <button
        v-if="showCancelRevokeBtn"
        class="btn-cancel-revoke"
        @click="handleCancelRevoke"
      >
        取消撤销
      </button>
      <button
        v-if="showViewRevokeBtn"
        class="btn-view-revoke"
        @click="showRevokeModal = true"
      >
        查看撤销要求
      </button>
      <button
        v-if="showUploadImgBtn"
        class="btn-upload"
        @click="showUploadModal = true"
      >
        上传图片
      </button>
      <button
        v-if="showInterveneBtn"
        class="btn-intervene"
        @click="showInterveneModal = true"
      >
        申请客服介入
      </button>
    </div>

    <!-- 上传图片模态框 -->
    <div
      v-if="showUploadModal"
      class="upload-modal-mask"
      @click.self="showUploadModal = false"
    >
      <div class="upload-modal">
        <div class="upload-modal-title">上传图片</div>
        <div class="upload-type-row">
          <label
            v-for="type in uploadTypes"
            :key="type.value"
            class="upload-type-option"
          >
            <input
              type="radio"
              v-model="selectedUploadType"
              :value="type.value"
            />
            {{ type.label }}
          </label>
        </div>
        <div class="upload-img-row">
          <input
            type="file"
            accept="image/*"
            multiple
            :disabled="uploadFiles.length >= 3 || uploading"
            @change="onFileChange"
            ref="fileInputRef"
            style="display: none"
          />
          <button
            class="choose-img-btn"
            @click="triggerFileInput"
            :disabled="uploadFiles.length >= 3 || uploading"
          >
            选择图片（最多3张）
          </button>
          <div class="img-preview-list">
            <div
              v-for="(file, idx) in uploadFiles"
              :key="idx"
              class="img-preview-item"
            >
              <img :src="file.preview" class="img-preview" />
              <span
                class="img-remove"
                :class="{ disabled: uploading }"
                @click="!uploading && removeFile(idx)"
                >×</span
              >
            </div>
          </div>
        </div>
        <div class="upload-modal-actions">
          <button class="upload-cancel-btn" @click="showUploadModal = false">
            取消
          </button>
          <button
            class="upload-confirm-btn"
            :disabled="
              !selectedUploadType || uploadFiles.length === 0 || uploading
            "
            @click="submitUpload"
          >
            上传
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- 平台规则弹窗 -->
  <div
    v-if="showRuleModal"
    class="rule-modal-mask"
    @click.self="showRuleModal = false"
  >
    <div class="rule-modal">
      <div class="rule-modal-title">温馨提示</div>
      <div class="rule-modal-content">
        <div>接单前请注意以下易违规项：</div>
        <div>1.接错单、接错系统、接错区扣罚3-10元</div>
        <div>2.中途撤单根据订单金额区间对应扣除5-15元</div>
        <div>3.代练效率低，根据时间进度扣除5-15元</div>
        <div>4.掉分掉星将从双金内扣除掉分价值</div>
        <div>5.无首图/进度图/完成图/被BAN图/战绩图，无正确截图将影响结算</div>
        <div>6.诱导私下订单将0结算扣双金</div>
        <div>7.辱骂/嘲讽扣除5-10元</div>
        <div>8.虚假验收0结算扣双金</div>
        <div>9.初始不符请及时与发单方协商，请勿擅自开始代练</div>
        <div>10.如订单异常（锁定/撤销/仲裁）时请勿代练，请及时与发单方协商</div>
        <div>11.指定英雄和胜率订单请上传所有战绩截图</div>
        <div style="margin-top: 4px">仲裁规则可在客服中心查看</div>
      </div>
      <button class="rule-modal-btn" @click="showRuleModal = false">
        我知道了
      </button>
    </div>
  </div>
  <el-dialog v-model="showRevokeModal" title="撤销要求" width="400px">
    <div>
      <div>支付金额：{{ revokeLog?.price ?? '-' }}</div>
      <div>保证金金额：{{ revokeLog?.deposit ?? '-' }}</div>
      <div>说明：{{ revokeLog?.remark || '-' }}</div>
      <div>
        图片凭证：
        <template
          v-if="revokeLog && revokeLog.imageUrls && revokeLog.imageUrls.length"
        >
          <div class="img-preview-list">
            <div
              v-for="(url, idx) in revokeLog.imageUrls"
              :key="idx"
              class="img-preview-item"
              style="display: inline-block; margin-right: 8px"
            >
              <img :src="getFullIconUrl(url)" class="img-preview" />
            </div>
          </div>
        </template>
        <template v-else>无</template>
      </div>
    </div>
    <template #footer>
      <el-button @click="showRevokeModal = false">关闭</el-button>
      <el-button type="danger" @click="disagreeRevoke">不同意</el-button>
      <el-button type="primary" @click="agreeRevoke">同意</el-button>
    </template>
  </el-dialog>

  <!-- 申请撤销模态框 -->
  <el-dialog v-model="showRevokeApplyModal" title="申请撤销" width="400px">
    <div style="margin-bottom: 12px; color: #888">
      订单支付金额：<span style="color: #222">{{ detail.price }}</span
      >， 保证金金额：<span style="color: #222">{{
        detail.securityDeposit
      }}</span>
    </div>
    <el-form :model="revokeForm" label-width="110px">
      <el-form-item label="支付金额">
        <el-input
          v-model.number="revokeForm.price"
          type="number"
          min="0"
          :max="detail.price"
          placeholder="请输入支付金额"
        />
      </el-form-item>
      <el-form-item label="保证金支付金额">
        <el-input
          v-model.number="revokeForm.deposit"
          type="number"
          min="0"
          :max="Math.min(revokeForm.price, detail.securityDeposit)"
          placeholder="请输入保证金金额"
        />
      </el-form-item>
      <el-form-item label="说明">
        <el-input
          v-model="revokeForm.remark"
          type="textarea"
          :rows="2"
          maxlength="200"
          show-word-limit
          placeholder="请输入说明（可选）"
        />
      </el-form-item>
      <el-form-item label="附加图片">
        <input
          type="file"
          accept="image/*"
          multiple
          :disabled="revokeForm.images.length >= 3"
          @change="onRevokeFileChange"
          ref="revokeFileInputRef"
          style="display: none"
        />
        <el-button
          @click="triggerRevokeFileInput"
          :disabled="revokeForm.images.length >= 3"
          size="small"
          >选择图片（最多3张）</el-button
        >
        <div class="img-preview-list" style="margin-top: 8px">
          <div
            v-for="(file, idx) in revokeForm.images"
            :key="idx"
            class="img-preview-item"
            style="display: inline-block; margin-right: 8px"
          >
            <img :src="file.preview" class="img-preview" />
            <span class="img-remove" @click="removeRevokeFile(idx)">×</span>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showRevokeApplyModal = false">取消</el-button>
      <el-button
        type="primary"
        :disabled="!canSubmitRevoke"
        @click="submitRevokeApply"
        >确定</el-button
      >
    </template>
  </el-dialog>

  <!-- 申请验收模态框 -->
  <el-dialog v-model="showAcceptApplyModal" title="申请验收" width="400px">
    <div style="margin-bottom: 12px; color: #888">
      订单支付金额：<span style="color: #222">{{ detail.price }}</span
      >， 保证金金额：<span style="color: #222">{{
        detail.securityDeposit
      }}</span>
    </div>
    <el-form :model="acceptForm" label-width="110px">
      <el-form-item label="说明">
        <el-input
          v-model="acceptForm.remark"
          type="textarea"
          :rows="2"
          maxlength="200"
          show-word-limit
          placeholder="请输入说明（可选）"
        />
      </el-form-item>
      <el-form-item label="附加图片">
        <input
          type="file"
          accept="image/*"
          multiple
          :disabled="acceptForm.images.length >= 3"
          @change="onAcceptFileChange"
          ref="acceptFileInputRef"
          style="display: none"
        />
        <el-button
          @click="triggerAcceptFileInput"
          :disabled="acceptForm.images.length >= 3"
          size="small"
          >选择图片（最多3张）</el-button
        >
        <div class="img-preview-list" style="margin-top: 8px">
          <div
            v-for="(file, idx) in acceptForm.images"
            :key="idx"
            class="img-preview-item"
            style="display: inline-block; margin-right: 8px"
          >
            <img :src="file.preview" class="img-preview" />
            <span class="img-remove" @click="removeAcceptFile(idx)">×</span>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showAcceptApplyModal = false">取消</el-button>
      <el-button type="primary" @click="submitAcceptApply">确定</el-button>
    </template>
  </el-dialog>

  <!-- 申请客服介入模态框 -->
  <el-dialog v-model="showInterveneModal" title="申请客服介入" width="400px">
    <el-form :model="interveneForm" label-width="110px">
      <el-form-item label="支付金额">
        <el-input
          v-model.number="interveneForm.price"
          type="number"
          min="0"
          :max="detail.price"
          placeholder="请输入支付金额"
        />
      </el-form-item>
      <el-form-item label="保证金支付金额">
        <el-input
          v-model.number="interveneForm.deposit"
          type="number"
          min="0"
          :max="detail.securityDeposit + detail.efficiencyDeposit"
          placeholder="请输入保证金金额"
        />
      </el-form-item>
      <el-form-item label="说明">
        <el-input
          v-model="interveneForm.remark"
          type="textarea"
          :rows="2"
          maxlength="200"
          show-word-limit
          placeholder="请输入说明（可选）"
        />
      </el-form-item>
      <el-form-item label="附加图片">
        <input
          type="file"
          accept="image/*"
          multiple
          :disabled="interveneForm.images.length >= 3"
          @change="onInterveneFileChange"
          ref="interveneFileInputRef"
          style="display: none"
        />
        <el-button
          @click="triggerInterveneFileInput"
          :disabled="interveneForm.images.length >= 3"
          size="small"
          >选择图片（最多3张）</el-button
        >
        <div class="img-preview-list" style="margin-top: 8px">
          <div
            v-for="(file, idx) in interveneForm.images"
            :key="idx"
            class="img-preview-item"
            style="display: inline-block; margin-right: 8px"
          >
            <img :src="file.preview" class="img-preview" />
            <span class="img-remove" @click="removeInterveneFile(idx)">×</span>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showInterveneModal = false">取消</el-button>
      <el-button type="primary" @click="submitIntervene">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail } from '@/api/order/order'
import { uploadOrderImages } from '@/api/order/order'
import { applyRevoke } from '@/api/order/order'
import { cancelRevoke } from '@/api/order/order'
import { applyAccept } from '@/api/order/order'
import { agreeRevokeApi, disagreeRevokeApi } from '@/api/order/order'
import { applyIntervene } from '@/api/order/order'
import settings from '@/settings'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

const detail = ref({})
const statusText = ref('')
const countdown = ref('')
const showAccountInfo = ref(false)
const showRuleModal = ref(false)

const showUploadModal = ref(false)
const uploadTypes = [
  { label: '账号初始图', value: '账号初始图' },
  { label: '代练过程图', value: '代练过程图' },
  { label: '完单图', value: '完单图' },
]
const selectedUploadType = ref('账号初始图')
const uploadFiles = ref([])
const fileInputRef = ref(null)
const uploading = ref(false)

const showRevokeApplyModal = ref(false)
const showAcceptApplyModal = ref(false)
const revokeForm = ref({
  price: 0,
  deposit: 0,
  remark: '',
  images: [],
})
const revokeFileInputRef = ref(null)
const acceptForm = ref({
  remark: '',
  images: [],
})
const acceptFileInputRef = ref(null)

const showInterveneModal = ref(false)
const interveneForm = ref({ price: '', deposit: '', remark: '', images: [] })
const interveneFileInputRef = ref(null)

const canSubmitRevoke = computed(() => {
  return (
    revokeForm.value.price !== '' &&
    revokeForm.value.deposit !== '' &&
    revokeForm.value.price <= detail.value.price &&
    revokeForm.value.deposit <= detail.value.securityDeposit &&
    revokeForm.value.deposit <= revokeForm.value.price
  )
})

const isActualDone = computed(() => {
  const v = detail.value.actualAt
  return v !== null && v !== undefined && v !== '' && v !== 'null'
})

const finalDelivery = computed(() => {
  if (!detail.value.statusLogs) return { price: '-', deposit: '-' }
  // 优先找 toStatus === 5（已完成）或 10（已仲裁）的日志
  const log = [...detail.value.statusLogs]
    .reverse()
    .find((l) => [5, 10].includes(l.toStatus))
  if (log) return { price: log.price, deposit: log.deposit }
  // 其次找 toStatus === 6（已撤销）或 7（撤销中）的日志
  const revokeLog = [...detail.value.statusLogs]
    .reverse()
    .find((l) => [6, 7].includes(l.toStatus))
  if (revokeLog) return { price: revokeLog.price, deposit: revokeLog.deposit }
  return { price: '-', deposit: '-' }
})

async function fetchOrderDetail() {
  const id = route.params.id
  const res = await getOrderDetail(id)
  detail.value = res.data
  statusText.value = getStatusText(res.data.status)
  updateCountdown()
}

async function submitRevokeApply() {
  if (!detail.value.id) {
    ElMessage.error('订单ID缺失')
    return
  }
  const formData = new FormData()
  formData.append('orderId', detail.value.id)
  formData.append('price', revokeForm.value.price)
  formData.append('deposit', revokeForm.value.deposit)
  formData.append('remark', revokeForm.value.remark)
  revokeForm.value.images.forEach((f) => formData.append('images', f.file))
  try {
    await applyRevoke(formData)
    ElMessage.success('已提交撤销申请')
    showRevokeApplyModal.value = false
    revokeForm.value = { price: '', deposit: '', remark: '', images: [] }
    await fetchOrderDetail()
  } catch {
    ElMessage.error('撤销申请失败')
  }
}
async function submitAcceptApply() {
  if (!detail.value.id) {
    ElMessage.error('订单ID缺失')
    return
  }
  const formData = new FormData()
  formData.append('orderId', detail.value.id)
  formData.append('remark', acceptForm.value.remark)
  acceptForm.value.images.forEach((f) => formData.append('images', f.file))
  try {
    await applyAccept(formData)
    ElMessage.success('已提交验收申请')
    showAcceptApplyModal.value = false
    acceptForm.value = { remark: '', images: [] }
    await fetchOrderDetail()
  } catch {
    ElMessage.error('验收申请失败')
  }
}

async function handleCancelRevoke() {
  if (!detail.value.id) {
    ElMessage.error('订单ID缺失')
    return
  }
  try {
    await cancelRevoke(detail.value.id)
    ElMessage.success('已取消撤销')
    await fetchOrderDetail()
  } catch {
    ElMessage.error('取消撤销失败')
  }
}

async function submitIntervene() {
  if (!detail.value.id) {
    ElMessage.error('订单ID缺失')
    return
  }
  if (interveneForm.value.price === '' || interveneForm.value.price == null) {
    ElMessage.error('支付金额不能为空')
    return
  }
  if (
    interveneForm.value.deposit === '' ||
    interveneForm.value.deposit == null
  ) {
    ElMessage.error('保证金支付金额不能为空')
    return
  }
  const formData = new FormData()
  formData.append('orderId', detail.value.id)
  formData.append('price', interveneForm.value.price)
  formData.append('deposit', interveneForm.value.deposit)
  formData.append('remark', interveneForm.value.remark)
  interveneForm.value.images.forEach((f) => formData.append('images', f.file))
  try {
    await applyIntervene(formData)
    ElMessage.success('已提交客服介入申请')
    showInterveneModal.value = false
    interveneForm.value = { price: '', deposit: '', remark: '', images: [] }
    await fetchOrderDetail()
  } catch {
    ElMessage.error('客服介入申请失败')
  }
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const currentUserId = computed(() => userStore.userId)

function getFullIconUrl(icon) {
  if (!icon) return ''
  const baseUrl = settings.imgBaseUrl || settings.baseUrl || ''
  return icon.startsWith('http') ? icon : baseUrl + icon
}

function formatDate(ts) {
  return ts ? new Date(Number(ts)).toLocaleString() : ''
}

const statusMap = {
  1: '未接手',
  2: '代练中',
  3: '待验收',
  4: '验收中',
  5: '已完成',
  6: '已撤销',
  7: '撤销中',
  8: '待介入',
  9: '介入中',
  10: '已仲裁',
  11: '强制撤销',
}
function getStatusText(status) {
  return statusMap[status] || '未知'
}

function updateCountdown() {
  if (!detail.value.startAt || !detail.value.timeLimit || isActualDone.value)
    return
  const end =
    Number(detail.value.startAt) + Number(detail.value.timeLimit) * 3600 * 1000
  const now = Date.now()
  let left = end - now
  if (left < 0) left = 0
  const h = Math.floor(left / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)
  countdown.value = `${h}时${m}分${s}秒`
}

function copyOrderNo() {
  if (detail.value?.orderNo) {
    navigator.clipboard.writeText(detail.value.orderNo)
    ElMessage.success('订单号已复制')
  }
}

function goBack() {
  router.back()
}

function goToChatRoom() {
  // 跳转到ChatRoom页面，并携带发单者id作为 userId 路由参数
  if (detail.value && detail.value.publisher && detail.value.publisher.userId) {
    router.push({
      path: `/chat/${detail.value.publisher.userId}`,
    })
  } else {
    // 没有发单者id时可跳转到消息首页或提示
    router.push('/messages')
  }
}

function triggerFileInput() {
  fileInputRef.value && fileInputRef.value.click()
}

function onFileChange(e) {
  const files = Array.from(e.target.files)
  // 限制最多3张
  const remain = 3 - uploadFiles.value.length
  const addFiles = files.slice(0, remain)
  addFiles.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      uploadFiles.value.push({ file, preview: ev.target.result })
    }
    reader.readAsDataURL(file)
  })
  // 清空input
  e.target.value = ''
}

function removeFile(idx) {
  uploadFiles.value.splice(idx, 1)
}

async function submitUpload() {
  if (!detail.value.id) {
    ElMessage.error('订单ID缺失')
    return
  }
  uploading.value = true
  try {
    await uploadOrderImages({
      orderId: detail.value.id,
      type: selectedUploadType.value,
      files: uploadFiles.value.map((f) => f.file),
      senderType: 1,
    })
    ElMessage.success('上传成功')
    showUploadModal.value = false
    selectedUploadType.value = '账号初始图'
    uploadFiles.value = []
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const showRevokeBtn = computed(() => detail.value.status === 2) // 代练中
const showAcceptBtn = computed(() => detail.value.status === 2) // 代练中
const showCancelRevokeBtn = computed(() => {
  if (detail.value.status !== 7) return false
  // 找到最新的撤销日志
  const logs =
    detail.value.statusLogs?.filter((log) => log.toStatus === 7) || []
  if (!logs.length) return false
  const revokeLog = logs.sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  )[0]
  return revokeLog && revokeLog.operatorId === currentUserId.value
})
const showViewRevokeBtn = computed(() => {
  if (detail.value.status !== 7) return false
  const logs =
    detail.value.statusLogs?.filter((log) => log.toStatus === 7) || []
  if (!logs.length) return false
  const revokeLog = logs.sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  )[0]
  return revokeLog && revokeLog.operatorId !== currentUserId.value
})
const showUploadImgBtn = computed(() => {
  if (detail.value.status === 2) return true // 代练中，任何代练都能上传
  if (detail.value.status === 7) {
    // 撤销中，只有自己是撤销人时才可上传
    const logs =
      detail.value.statusLogs?.filter((log) => log.toStatus === 7) || []
    if (!logs.length) return false
    const revokeLog = logs.sort(
      (a, b) => Number(b.createdAt) - Number(a.createdAt)
    )[0]
    return revokeLog && revokeLog.operatorId === currentUserId.value
  }
  return false
})

const showRevokeModal = ref(false)
const revokeLog = computed(() => {
  if (!detail.value.statusLogs) return null
  // 取所有 toStatus === 7 的日志
  const logs = detail.value.statusLogs.filter((log) => log.toStatus === 7)
  if (!logs.length) return null
  // 取 createdAt 最大的那一条
  const log = logs.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))[0]
  // 兼容 imageUrls 为字符串或数组
  let imgs = []
  if (Array.isArray(log.imageUrls)) {
    imgs = log.imageUrls
  } else if (typeof log.imageUrls === 'string' && log.imageUrls.trim()) {
    imgs = log.imageUrls.split(',').map((s) => s.trim())
  }
  return { ...log, imageUrls: imgs }
})
async function agreeRevoke() {
  if (!detail.value.id) {
    ElMessage.error('订单ID缺失')
    return
  }
  try {
    await agreeRevokeApi(detail.value.id)
    ElMessage.success('已同意撤销')
    showRevokeModal.value = false
    await fetchOrderDetail()
  } catch {
    ElMessage.error('同意撤销失败')
  }
}

async function disagreeRevoke() {
  if (!detail.value.id) {
    ElMessage.error('订单ID缺失')
    return
  }
  try {
    await disagreeRevokeApi(detail.value.id)
    ElMessage.success('已拒绝撤销')
    showRevokeModal.value = false
    await fetchOrderDetail()
  } catch {
    ElMessage.error('拒绝撤销失败')
  }
}

function triggerRevokeFileInput() {
  revokeFileInputRef.value && revokeFileInputRef.value.click()
}

function onRevokeFileChange(e) {
  const files = Array.from(e.target.files)
  const remain = 3 - revokeForm.value.images.length
  const addFiles = files.slice(0, remain)
  addFiles.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      revokeForm.value.images.push({ file, preview: ev.target.result })
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

function removeRevokeFile(idx) {
  revokeForm.value.images.splice(idx, 1)
}

function triggerAcceptFileInput() {
  acceptFileInputRef.value && acceptFileInputRef.value.click()
}
function onAcceptFileChange(e) {
  const files = Array.from(e.target.files)
  const remain = 3 - acceptForm.value.images.length
  const addFiles = files.slice(0, remain)
  addFiles.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      acceptForm.value.images.push({ file, preview: ev.target.result })
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}
function removeAcceptFile(idx) {
  acceptForm.value.images.splice(idx, 1)
}

function triggerInterveneFileInput() {
  interveneFileInputRef.value && interveneFileInputRef.value.click()
}
function onInterveneFileChange(e) {
  const files = Array.from(e.target.files)
  const remain = 3 - interveneForm.value.images.length
  const addFiles = files.slice(0, remain)
  addFiles.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      interveneForm.value.images.push({ file, preview: ev.target.result })
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}
function removeInterveneFile(idx) {
  interveneForm.value.images.splice(idx, 1)
}

// 找到最近一次从撤销中回到代练中的日志
const lastRevokeToWorkLog = computed(() => {
  if (!detail.value.statusLogs) return null
  // 按 createdAt 时间倒序排序后查找
  const logs = [...detail.value.statusLogs]
    .filter((log) => log.fromStatus === 7 && log.toStatus === 2)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
  return logs.length ? logs[0] : null
})

// 代练中时是否允许申请客服介入
const canInterveneInWork = computed(() => {
  if (detail.value.status !== 2) return false
  const log = lastRevokeToWorkLog.value
  if (!log) return false
  // 操作者不是自己才允许
  return log.operatorId && log.operatorId != currentUserId.value
})

// 申请客服介入按钮显示逻辑
const showInterveneBtn = computed(() => {
  // 撤销中时，允许双方都能申请（如有特殊逻辑可补充）
  if (detail.value.status === 7) {
    return true
  }
  // 代练中时，只有“从撤销中返回代练中”且操作者是对方才允许
  if (canInterveneInWork.value) {
    return true
  }
  return false
})

onMounted(async () => {
  await fetchOrderDetail()
  setInterval(() => {
    if (
      detail.value &&
      detail.value.startAt &&
      detail.value.timeLimit &&
      !isActualDone.value
    ) {
      updateCountdown()
    }
  }, 1000)
})
</script>

<style scoped>
.order-detail {
  background: #f7faff;
  min-height: 100vh;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.04);
  padding-bottom: 80px;
  padding-left: 16px;
  padding-right: 16px;
}
.status-bar {
  background: linear-gradient(90deg, #6ecaff 0%, #4a90e2 100%);
  color: #fff;
  padding: 16px;
  margin-left: -16px;
  margin-right: -16px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0;
}
.status-center {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  margin-left: 12px;
}
.status {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.1;
}
.countdown {
  font-size: 14px;
  color: #e6e6e6;
  font-weight: normal;
  margin-top: 2px;
  display: flex;
  align-items: center;
}
.clock-icon {
  margin-right: 4px;
  vertical-align: middle;
}
.icons {
  display: flex;
  align-items: center;
}
.icon-img {
  width: 28px;
  height: 28px;
  margin-left: 12px;
  vertical-align: middle;
}
.tip-bar {
  background: #e6f7ff;
  color: #1890ff;
  padding: 8px 16px;
  margin: 8px 0;
  border-radius: 4px;
  text-align: center;
}
.order-no {
  padding: 8px 0;
  font-size: 15px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
}
.order-no-label {
  color: #888;
}
.order-no-value {
  font-family: 'Fira Mono', 'Consolas', monospace;
  letter-spacing: 0.5px;
  font-size: 15px;
  color: #333;
  background: #f4f6fa;
  border-radius: 4px;
  padding: 1px 6px;
  margin-right: 2px;
}
.copy-icon {
  margin-left: 6px;
  font-size: 16px;
  color: #bfbfbf;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.copy-icon:hover {
  color: #409eff;
}
.order-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 18px;
  margin-bottom: 8px;
}
.order-title-main {
  flex: 1;
  min-width: 0;
}
.title-icons-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.order-title {
  font-size: 22px;
  font-weight: bold;
  color: #222;
  word-break: break-all;
  line-height: 1.2;
  display: inline-block;
}
.order-subtitle {
  font-size: 18px;
  color: #222;
  word-break: break-all;
  margin-top: 2px;
}
.order-meta-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  color: #888;
  font-size: 15px;
  margin-bottom: 8px;
  padding-left: 2px;
}
.order-rule {
  color: #1890ff;
  font-weight: bold;
  margin: 0 2px;
}
.rule-icon {
  vertical-align: middle;
  margin-left: 2px;
}
.order-price {
  text-align: right;
  font-size: 26px;
  color: #ff4d4f;
  font-weight: bold;
  margin: 8px 0 0 0;
}
/* 资金模块仿 takeOrder/TakeOrderDetail.vue */
.funds-summary {
  display: flex;
  background: #f5f5f5;
  border-radius: 16px;
  margin-top: 12px;
  padding: 10px 0 6px 0;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}
.funds-item {
  flex: 1;
  text-align: center;
}
.funds-value {
  font-size: 22px;
  color: #333;
  font-weight: bold;
  line-height: 1.1;
}
.funds-unit {
  font-size: 14px;
  margin-left: 2px;
}
.funds-label {
  font-size: 16px;
  color: #888;
  margin-top: 2px;
}
.desc-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  margin-top: 16px;
  padding: 16px 18px 14px 18px;
}
.desc-title {
  font-size: 16px;
  font-weight: bold;
  color: #222;
  margin-bottom: 8px;
}
.desc-content {
  font-size: 15px;
  color: #555;
  line-height: 1.7;
  word-break: break-all;
}
.account-info-card {
  margin-top: 16px;
  text-align: left;
}
.account-info-btn {
  width: 100%;
  background: #e3f3ff;
  color: #2196f3;
  border: 1.5px solid #b3e0ff;
  border-radius: 8px;
  padding: 12px 0;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.2s,
    border 0.2s;
}
.account-info-btn:hover {
  background: #d0eaff;
  border-color: #90caf9;
}
.account-info-icon {
  vertical-align: middle;
}
.account-info-content {
  margin-top: 12px;
  background: #f7faff;
  border-radius: 8px;
  padding: 12px 16px;
  color: #333;
  font-size: 15px;
  word-break: break-all;
  border: 1px solid #e3f3ff;
}
.actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #eee;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 600px;
  width: 100%;
  z-index: 10;
}
.actions button {
  flex: 1;
  margin: 0;
  padding: 14px 0;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
.btn-cancel {
  background: #f5f5f5;
  color: #888;
}
.btn-revoke {
  background: #ffecb3;
  color: #ff9800;
}
.btn-upload {
  background: #1890ff;
  color: #fff;
}
.game-system-icon {
  width: 28px;
  height: 28px;
  margin-right: 8px;
  vertical-align: middle;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.06);
}
.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.back-icon {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 4px;
  transition: background 0.2s;
  border-radius: 50%;
  padding: 2px;
}
.back-icon:hover {
  background: rgba(255, 255, 255, 0.15);
}
.rule-modal-mask {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.rule-modal {
  background: #fff;
  border-radius: 20px;
  max-width: 90vw;
  width: 360px;
  padding: 28px 20px 18px 20px;
}
.rule-modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 15px;
}
.rule-modal-content {
  font-size: 15px;
  color: #555;
  line-height: 1.8;
  margin-bottom: 20px;
  text-align: left;
}
.rule-modal-btn {
  width: 100%;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 0;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.rule-modal-btn:hover {
  background: #40a9ff;
}
.upload-modal-mask {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-modal {
  background: #fff;
  border-radius: 16px;
  width: 340px;
  padding: 28px 20px 18px 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}
.upload-modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 18px;
}
.upload-type-row {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 18px;
}
.upload-type-option {
  font-size: 15px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
}
.upload-img-row {
  margin-bottom: 18px;
  text-align: center;
}
.choose-img-btn {
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 15px;
  cursor: pointer;
  margin-bottom: 10px;
}
.choose-img-btn:disabled {
  background: #eee;
  color: #aaa;
  cursor: not-allowed;
}
.img-preview-list {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
}
.img-preview-item {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #eee;
  background: #fafbfc;
}
.img-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-remove {
  position: absolute;
  top: 2px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  font-size: 15px;
  cursor: pointer;
}
.upload-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}
.upload-cancel-btn {
  background: #f5f5f5;
  color: #888;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 15px;
  cursor: pointer;
}
.upload-confirm-btn {
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 15px;
  cursor: pointer;
}
.upload-confirm-btn:disabled {
  background: #eee;
  color: #aaa;
  cursor: not-allowed;
}
.final-delivery-card {
  background: #fffbe6;
  border-radius: 10px;
  margin: 18px 0 0 0;
  padding: 16px 18px 10px 18px;
  box-shadow: 0 1px 4px rgba(255, 193, 7, 0.08);
}
.final-delivery-title {
  font-size: 16px;
  font-weight: bold;
  color: #d48806;
  margin-bottom: 8px;
}
.final-delivery-row {
  font-size: 15px;
  color: #555;
  margin-bottom: 6px;
}
</style>
