# 发单前密码验证功能说明

## 功能概述

为了保障用户账户安全，在发布代练订单前增加了密码验证步骤。密码作为订单表单的一个字段，与订单信息一起提交到后端进行验证。

## 功能特性

### 密码验证流程

1. **表单验证**：用户填写完订单信息后点击"发布订单"
2. **密码输入**：弹出密码验证对话框，要求输入登录密码
3. **统一提交**：密码和订单信息一起提交到后端
4. **后端验证**：后端同时验证密码和订单信息
5. **结果反馈**：显示发布结果并跳转到订单列表页

### 安全特性

- **强制验证**：无法跳过密码验证步骤
- **防重复提交**：使用 `repeatSubmit: true` 防止重复提交
- **错误处理**：密码错误时显示友好提示
- **自动聚焦**：对话框打开时自动聚焦到密码输入框

### 用户体验

- **友好界面**：使用锁图标和安全提示文字
- **键盘支持**：支持回车键快速确认
- **加载状态**：验证过程中显示加载动画
- **取消操作**：用户可以取消密码验证

## 技术实现

### 修改文件

1. **`src/views/postOrder/Index.vue`** - 添加密码字段和验证模态框

### 表单结构

```javascript
// 订单表单数据（包含密码字段）
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
  password: '', // 密码字段
})
```

### 组件结构

```vue
<!-- 密码输入模态框 -->
<el-dialog
  v-model="passwordDialogVisible"
  title="安全验证"
  width="400px"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
  :show-close="false"
>
  <!-- 密码输入表单 -->
  <el-form
    ref="passwordFormRef"
    :model="passwordForm"
    :rules="passwordRules"
  >
    <el-form-item prop="password">
      <el-input
        v-model="passwordForm.password"
        type="password"
        placeholder="请输入登录密码"
        show-password
        @keyup.enter="confirmPassword"
      />
    </el-form-item>
  </el-form>
</el-dialog>
```

## 使用流程

1. 用户填写订单信息
2. 点击"发布订单"按钮
3. 系统验证表单数据
4. 弹出密码验证对话框
5. 用户输入登录密码
6. 点击"确认发布"或按回车键
7. 密码和订单信息一起提交到后端
8. 后端验证密码和订单信息
9. 验证成功则发布订单，失败则显示提示
10. 发布成功后跳转到订单列表页

## 样式设计

- **居中布局**：密码对话框内容居中对齐
- **图标设计**：使用锁图标表示安全验证
- **响应式**：适配不同屏幕尺寸
- **现代化UI**：符合整体设计风格

## 错误处理

- **密码为空**：提示"请输入密码"
- **密码过短**：提示"密码长度不能少于6位"
- **密码错误**：后端返回密码验证失败信息
- **网络错误**：提示"提交失败，请重试"

## 安全考虑

1. **统一验证**：密码和订单信息在同一请求中验证
2. **防重复提交**：防止用户重复点击提交
3. **密码加密**：密码在传输过程中进行加密
4. **后端验证**：后端同时验证密码和订单信息的有效性
