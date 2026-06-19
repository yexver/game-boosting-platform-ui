# 接单详情页功能说明

## 功能概述

新增了接单详情页功能，用户可以在接单列表页点击"立即接单"按钮跳转到详情页，查看订单的详细信息并确认接单。

## 新增文件

1. **`src/views/takeOrder/Detail.vue`** - 接单详情页组件
2. **`src/api/order/takeOrder.js`** - 新增获取订单详情API

## 修改文件

1. **`src/router/index.js`** - 新增路由配置
2. **`src/views/takeOrder/Index.vue`** - 修改接单按钮行为

## 功能特性

### 接单详情页 (`/take-order/:id`)

- **订单信息展示**：显示游戏名称、系统、区服、代练类型、价格等基本信息
- **详细要求**：展示订单的详细描述和要求
- **保障信息**：显示完成时间、安全保证金、效率保证金等保障措施
- **发单人信息**：展示发单人的基本信息和历史数据
- **接单操作**：提供确认接单和取消操作

### 页面状态

- **加载状态**：显示加载动画和提示文字
- **错误状态**：当订单不存在时显示错误信息
- **确认状态**：接单过程中的确认对话框

### 响应式设计

- 支持移动端和桌面端适配
- 卡片式布局，信息层次清晰
- 现代化的UI设计风格

## 路由配置

```javascript
{
  path: 'take-order/:id',
  name: 'TakeOrderDetail',
  component: () => import('@/views/takeOrder/Detail.vue'),
}
```

## API接口

### 获取订单详情

```javascript
export function getOrderDetail(orderId) {
  return request({
    url: `server-order/orders/${orderId}`,
    method: 'get',
  })
}
```

## 使用流程

1. 用户在接单列表页浏览订单
2. 点击"立即接单"按钮
3. 跳转到订单详情页 (`/take-order/:id`)
4. 查看订单详细信息
5. 点击"确认接单"按钮
6. 弹出确认对话框
7. 确认后执行接单操作
8. 接单成功后跳转回列表页

## 技术实现

- 使用 Vue 3 Composition API
- Element Plus 组件库
- Vue Router 路由管理
- 响应式设计
- 错误处理和加载状态管理
