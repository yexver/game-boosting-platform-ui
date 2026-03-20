<template>
  <div class="help-center-layout">
    <aside class="help-sidebar">
      <div class="sidebar-title">帮助中心</div>
      <ul>
        <li
          v-for="item in navList"
          :key="item.key"
          :class="{ active: item.key === activeKey }"
          @click="selectNav(item.key)"
        >
          {{ item.label }}
        </li>
      </ul>
    </aside>
    <main class="help-content">
      <!-- 右侧内容区，后续可根据 activeKey 展示不同内容 -->
      <div v-if="activeKey === 'service'">
        <h2>服务协议</h2>
        <p>
          欢迎使用代练侠，一个专注于游戏代练撮合与服务的专业平台。为保障用户权益和平台秩序，您在注册、下单、接单及使用平台各项服务前，请务必仔细阅读本服务协议。
        </p>
        <ul>
          <li>
            1.
            代练侠平台为用户提供安全、便捷的游戏代练交易环境，所有用户需遵守《中华人民共和国民法典》《网络安全法》《电子商务法》等相关法律法规及平台规则。
          </li>
          <li>2. 用户在平台下单、接单、沟通、结算等行为均受本协议约束。</li>
          <li>
            3.
            平台有权根据运营需要对协议内容进行调整，变更内容将以公告形式通知，用户继续使用即视为同意。
          </li>
          <li>
            4.
            平台对违规行为有权采取警告、冻结、封禁等措施，严重违规将追究法律责任。
          </li>
          <li>
            5.
            用户在平台的所有操作数据、交易信息等均受平台保护，未经授权不会泄露。
          </li>
        </ul>
        <h3>【法律条款示例】</h3>
        <p>
          用户不得利用平台从事任何违法犯罪活动，包括但不限于：洗钱、诈骗、侵犯他人知识产权、传播违法信息等。若发现上述行为，平台有权配合司法机关调查并追究相关责任。
        </p>
        <h3>【交易流程图】</h3>
        <pre>
          用户注册 → 发布/接收订单 → 平台托管资金 → 服务完成 → 双方确认 → 结算/评价
        </pre>
      </div>
      <div v-else-if="activeKey === 'privacy'">
        <h2>隐私协议</h2>
        <p>代练侠高度重视用户隐私和数据安全。</p>
        <ul>
          <li>
            1. 您的注册信息、联系方式、订单数据等均采用加密存储，严格防止泄露。
          </li>
          <li>
            2.
            平台不会将您的个人信息出售或泄露给任何第三方，除非法律法规要求或经您授权。
          </li>
          <li>3. 您有权随时查询、更正、删除您的个人信息。</li>
          <li>4. 如遇信息安全问题，可随时联系客服协助处理。</li>
        </ul>
        <h3>【法律条款示例】</h3>
        <p>
          平台严格遵守《个人信息保护法》《网络安全法》等相关法律法规，未经用户同意不向第三方披露用户信息。
        </p>
        <h3>【常见问题FAQ】</h3>
        <ul>
          <li>
            Q: 如何修改我的手机号？<br />A:
            进入“个人中心-账号设置”可修改绑定手机号。
          </li>
          <li>
            Q: 信息被盗用怎么办？<br />A:
            立即联系客服，平台会协助您冻结账号并调查处理。
          </li>
        </ul>
      </div>
      <div v-else-if="activeKey === 'publish'">
        <h2>发单协议</h2>
        <p>
          1.
          用户在代练侠发布代练订单时，需如实填写游戏账号、代练需求、时间要求等信息。
          2. 禁止发布违法、违规、虚假或恶意订单，违者将被平台处罚。 3.
          订单金额由发单方自主设定，平台仅收取服务手续费。 4.
          订单发布后可随时与接单方沟通，平台提供全程资金托管保障。
        </p>
        <h3>【法律条款示例】</h3>
        <p>
          禁止发布涉及赌博、外挂、账号买卖等违法违规内容的订单，违者将被封号并移交相关部门处理。
        </p>
        <h3>【发单流程图】</h3>
        <pre>
          登录/注册 → 填写订单信息 → 选择代练类型 → 支付托管 → 等待接单
        </pre>
      </div>
      <div v-else-if="activeKey === 'take'">
        <h2>接单协议</h2>
        <p>
          1. 成为代练侠接单用户需完成实名认证，确保身份真实可靠。 2.
          接单后须按订单要求完成服务，严禁恶意弃单、拖延、违规操作。 3.
          服务完成后，平台将根据双方确认结算报酬。 4.
          违规接单将被扣除保证金、冻结账号，情节严重者将被永久封禁。
        </p>
        <h3>【法律条款示例】</h3>
        <p>
          接单用户不得以任何形式泄露、转让、买卖客户账号信息，违者将承担法律责任。
        </p>
        <h3>【接单流程图】</h3>
        <pre>
          实名认证 → 浏览订单 → 申请接单 → 沟通确认 → 完成服务 → 申请结算
        </pre>
      </div>
      <div v-else-if="activeKey === 'punish'">
        <h2>平台处罚制度</h2>
        <p>
          1. 代练侠对恶意刷单、诈骗、泄露隐私、辱骂等行为设有严格处罚措施。 2.
          处罚方式包括警告、扣除保证金、账号冻结、永久封禁等。 3.
          用户如对处罚有异议，可通过平台申诉通道提交复核申请。 4.
          平台致力于打造公平、公正、透明的交易环境。
        </p>
        <h3>【处罚示例】</h3>
        <ul>
          <li>恶意弃单：首次警告，二次扣除保证金，三次永久封禁。</li>
          <li>账号买卖：直接永久封禁并移交司法机关。</li>
        </ul>
      </div>
      <div v-else-if="activeKey === 'appeal'">
        <h2>二次投诉地址</h2>
        <p>
          1. 如对订单处理结果不满意，可在订单详情页发起二次投诉。 2.
          平台客服将在3个工作日内受理并反馈处理进度。 3.
          如仍有异议，可通过官方邮箱或客服电话进一步申诉。 4.
          申诉需提供相关证据截图、沟通记录等，便于平台核查。
        </p>
        <h3>【投诉流程图】</h3>
        <pre>
          订单申诉 → 客服受理 → 补充证据 → 平台复核 → 反馈结果
        </pre>
      </div>
      <div v-else-if="activeKey === 'fee'">
        <h2>手续费率说明</h2>
        <p>
          1. 代练侠对每笔成功交易收取服务手续费，费率根据订单类型和金额浮动。 2.
          具体费率请参考下单页面或联系客服咨询。 3.
          手续费用于平台运营、客服、风控等服务保障。 4.
          如需发票，请在订单完成后30日内联系客服申请。
        </p>
        <h3>【常见问题FAQ】</h3>
        <ul>
          <li>
            Q: 手续费如何收取？<br />A: 按订单金额比例自动扣除，结算时可见明细。
          </li>
          <li>
            Q: 可以开发票吗？<br />A: 可在订单完成后30日内联系客服申请发票。
          </li>
        </ul>
      </div>
      <div v-else-if="activeKey === 'newbie'">
        <h2>新手接单必读</h2>
        <p>
          1. 新用户请先完善个人资料并通过实名认证。 2.
          熟悉平台接单流程，包括订单领取、沟通、服务、结算等环节。 3.
          遵守平台规则，诚信服务，避免因违规被处罚。 4.
          如有疑问可查阅帮助文档或联系客服。
        </p>
        <h3>【新手流程图】</h3>
        <pre>
          注册账号 → 实名认证 → 完善资料 → 浏览订单 → 申请接单 → 完成服务
        </pre>
        <h3>【常见问题FAQ】</h3>
        <ul>
          <li>
            Q: 新手如何快速接到单？<br />A:
            完善资料、保持在线、积极沟通可提升接单率。
          </li>
          <li>
            Q: 没有保证金可以接单吗？<br />A:
            普通订单可直接接，高价值订单需缴纳保证金。
          </li>
        </ul>
      </div>
      <div v-else-if="activeKey === 'faq'">
        <h2>常见扣钱问题</h2>
        <p>
          1. 订单未按要求完成、恶意弃单、违规操作等均可能导致扣款。 2.
          结算异常、服务争议等问题可通过申诉通道反馈。 3.
          平台会根据实际情况核查并公正处理。 4.
          如有疑问请优先查阅本栏目或联系客服。
        </p>
        <h3>【常见问题FAQ】</h3>
        <ul>
          <li>
            Q: 为什么被扣钱？<br />A:
            主要因服务未完成、违规、恶意弃单等，详情可在订单详情页查看。
          </li>
          <li>
            Q: 扣钱有申诉渠道吗？<br />A:
            有，订单详情页可发起申诉，平台会复核处理。
          </li>
        </ul>
      </div>
      <div v-else-if="activeKey === 'deposit'">
        <h2>保证金说明</h2>
        <p>
          1. 部分高价值订单或特殊服务需缴纳保证金，保障交易安全。 2.
          保证金在服务完成且无纠纷后按规则退还。 3.
          违规行为将扣除部分或全部保证金。 4.
          保证金金额及退还规则详见订单说明或联系客服咨询。
        </p>
        <h3>【保证金流程图】</h3>
        <pre>
          订单接单 → 缴纳保证金 → 完成服务 → 无纠纷退还保证金
        </pre>
        <h3>【常见问题FAQ】</h3>
        <ul>
          <li>
            Q: 保证金什么时候退？<br />A:
            服务完成且无纠纷后，系统会自动退还保证金。
          </li>
          <li>
            Q: 违规被扣保证金怎么办？<br />A:
            可通过申诉通道提交证据，平台会复核处理。
          </li>
        </ul>
      </div>
      <div v-else>
        <h2>{{ navList.find((i) => i.key === activeKey)?.label }}</h2>
        <p>内容待补充...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const navList = [
  { key: 'service', label: '服务协议' },
  { key: 'privacy', label: '隐私协议' },
  { key: 'publish', label: '发单协议' },
  { key: 'take', label: '接单协议' },
  { key: 'punish', label: '平台处罚制度' },
  { key: 'appeal', label: '二次投诉地址' },
  { key: 'fee', label: '手续费率说明' },
  { key: 'newbie', label: '新手接单必读' },
  { key: 'faq', label: '常见扣钱问题' },
  { key: 'deposit', label: '保证金说明' },
]
const activeKey = ref('service')
function selectNav(key) {
  activeKey.value = key
}
</script>

<style scoped>
.help-center-layout {
  display: flex;
  min-height: 80vh;
  background: #f7f8fa;
}
.help-sidebar {
  width: 220px;
  background: #f7f8fa;
  border-right: 1.5px solid #e6eaf0;
  padding: 36px 0 36px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sidebar-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
  color: #222;
}
.help-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}
.help-sidebar li {
  padding: 12px 0;
  text-align: center;
  cursor: pointer;
  color: #333;
  font-size: 17px;
  border-left: 4px solid transparent;
  margin-bottom: 2px;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}
.help-sidebar li.active {
  color: #409eff;
  font-weight: bold;
  border-left: 4px solid #409eff;
  background: #eaf3ff;
}
.help-sidebar li:hover {
  background: #f0f7ff;
  color: #409eff;
}
.help-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  min-width: 0;
}
.help-content > div {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px 0 rgba(64, 158, 255, 0.06);
  padding: 40px 48px 32px 48px;
  min-width: 600px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  text-align: left;
}
.help-content h2 {
  font-size: 24px;
  font-weight: 900;
  color: #222;
  margin-bottom: 18px;
  letter-spacing: 1px;
}
.help-content p {
  font-size: 16px;
  color: #444;
  line-height: 1.9;
}
@media (max-width: 900px) {
  .help-center-layout {
    flex-direction: column;
  }
  .help-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1.5px solid #e6eaf0;
    box-shadow: none;
    padding: 0 0 0 0;
    margin-bottom: 0;
  }
  .sidebar-title {
    display: none;
  }
  .help-sidebar ul {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    overflow-x: auto;
  }
  .help-sidebar li {
    margin: 0 8px 0 0;
    border-radius: 8px 8px 0 0;
    padding: 12px 18px;
    font-size: 15px;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  .help-sidebar li.active {
    border-left: none;
    border-bottom: 3px solid #409eff;
    background: #eaf3ff;
  }
  .help-content {
    padding: 18px 0;
    align-items: stretch;
  }
  .help-content > div {
    min-width: 0;
    padding: 18px 10px 16px 10px;
    border-radius: 10px;
  }
  .help-content h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }
  .help-content p {
    font-size: 14px;
  }
}
</style>
