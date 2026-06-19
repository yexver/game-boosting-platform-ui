# 接单详情页API数据字段说明

## 接口地址

```
GET /server-order/orders/take-order/{orderId}
```

## 返回数据字段

### 基础订单信息

- `id` (bigint) - 订单ID
- `orderNo` (string) - 订单号
- `title` (string) - 订单标题
- `status` (int) - 订单状态：1-待接单，2-代练中，3-待验收，4-验收中，5-已完成，6-已撤销，7-撤销中，8-待介入，9-介入中，10-已仲裁，11-强制撤销
- `createdAt` (timestamp) - 创建时间

### 游戏信息

- `gameId` (int) - 游戏ID
- `gameName` (string) - 游戏名称
- `systemId` (int) - 系统ID
- `systemName` (string) - 系统名称
- `serverId` (int) - 区服ID（可选）
- `serverName` (string) - 区服名称（可选）

### 代练信息

- `boostingType` (int) - 代练类型：1-代练，2-陪练
- `description` (string) - 订单描述
- `timeLimit` (int) - 代练时限（小时）

### 金额信息

- `price` (decimal) - 订单金额
- `securityDeposit` (decimal) - 安全保证金
- `efficiencyDeposit` (decimal) - 效率保证金

### 发布者信息

- `publisherId` (bigint) - 发布者用户ID
- `publisherUsername` (string) - 发布者用户名
- `publisherAvatar` (string) - 发布者头像地址
- `publisherOrderCount30d` (int) - 近30天发单量
- `publisherManagerRate30d` (decimal) - 近30天客服介入率（0-1之间的小数）

## 数据示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 123,
    "orderNo": "ORD1946130178660933632",
    "title": "王者荣耀钻石到星耀代练",
    "status": 1,
    "createdAt": 1640995200000,

    "gameId": 1,
    "gameName": "王者荣耀",
    "systemId": 1,
    "systemName": "安卓QQ",
    "serverId": 1,
    "serverName": "微信1区",

    "boostingType": 1,
    "description": "从钻石5到星耀5，要求胜率60%以上，不要掉分",
    "timeLimit": 48,

    "price": 100.0,
    "securityDeposit": 10.0,
    "efficiencyDeposit": 10.0,

    "publisherId": 1946036839198543872,
    "publisherUsername": "张三",
    "publisherAvatar": "https://example.com/avatar.jpg",
    "publisherOrderCount30d": 15,
    "publisherManagerRate30d": 0.05
  }
}
```

## 页面显示字段

### 订单头部

- 订单标题
- 订单号
- 订单ID
- 订单状态

### 订单信息卡片

- 游戏名称
- 游戏系统
- 游戏区服（如果有）
- 代练类型
- 订单价格
- 安全保证金
- 效率保证金
- 发布时间

### 详细要求卡片

- 订单描述

### 保障信息卡片

- 完成时间（固定显示6小时）
- 安全保证金
- 效率保证金

### 发布者信息卡片

- 用户头像
- 用户名
- 用户ID
- 近30天发单量
- 客服介入率

### 接单操作卡片

- 当前价格
- 原价（显示为当前价格的80%）
- 确认接单按钮
