# Queue Delay Drilldown Design Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为流路径详情页的下钻分析面板补充“队列时延超限”原型，形成更完整的时间轴、LDH分布、趋势联动和异常摘要展示。

**Architecture:** 保持现有静态 HTML + Vanilla JS + Mock Data 架构，不新增页面路由，而是在 `flow-detail.html` 的下钻面板中增强 `queueDelay` Tab。通过扩展 `data.js` 的 drillDown mock 结构，配合 `flow-detail.js` 新增渲染器与状态机，实现“时间片切换—指标卡—LDH分布—趋势—明细—摘要”一体化交互。样式统一沿用当前暗色诊断工作台风格，在 `main.css` 中补充新的 drilldown 模块样式。

**Tech Stack:** HTML, CSS, Vanilla JavaScript, local mock data in `assets/scripts/data.js`

---

### Task 1: 扩展队列时延超限的 mock 数据模型

**Files:**
- Modify: `assets/scripts/data.js`

**Steps:**
1. 为 `queueDelayView` 增加页面头部上下文、LDH 分桶分布、趋势、异常摘要、端口队列明细等字段。
2. 保留现有 `queueDelayTrend` 兼容字段，避免破坏已有调用。
3. 让不同 `slotIndex` 产生不同强度的热点与摘要，便于联调展示。

### Task 2: 增强下钻面板的队列时延 Tab 渲染逻辑

**Files:**
- Modify: `assets/scripts/flow-detail.js`

**Steps:**
1. 将 `queueDelay` Tab 从复用 `renderQueueMainPanel` 改为专用渲染函数。
2. 新增“上下文条、缩略时间轴继承、核心指标卡、LDH 分布、超限趋势、端口队列明细、分析摘要”渲染模块。
3. 支持端口切换、桶区间点击高亮、时间片切换联动刷新。
4. 保持其它 Tab（PFC / 队列长度 / 链路中断）行为不变。

### Task 3: 补充样式设计

**Files:**
- Modify: `assets/styles/main.css`

**Steps:**
1. 新增队列时延超限页专属布局样式。
2. 补充 LDH 桶状图、超限状态胶囊、分析摘要、端口明细表等视觉样式。
3. 保持与现有暗色工作台和 drilldown 组件风格一致。

### Task 4: 手工验证原型交互

**Files:**
- Test manually via local HTTP preview

**Steps:**
1. 打开 `flow-detail.html?flowId=flow-002` 与 `flow-detail.html?flowId=flow-004`。
2. 点击热力图任意时间槽进入下钻，切换到“队列时延”Tab。
3. 验证时间片切换、端口切换、桶区间点击高亮是否正常。
4. 验证 PFC / 队列长度 / 端口Down 既有 Tab 未受影响。

