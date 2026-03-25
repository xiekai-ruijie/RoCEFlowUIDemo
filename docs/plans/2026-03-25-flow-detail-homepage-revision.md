# Flow Detail & Homepage Revision Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将流路径详情改为独立页面并按评审稿重构布局，同时新增首页与 AI 任务资源板块，完成热力图重排和设备/接口联动过滤。

**Architecture:** 保持纯静态 HTML/CSS/Vanilla JS 架构；扩展 `window.ROCE_MOCK_DATA` 承载首页与详情页所需 mock 数据；主列表页仅负责过滤与跳转，新增独立 `flow-detail.html` + `assets/scripts/flow-detail.js` 负责详情渲染与联动状态。

**Tech Stack:** HTML, CSS, Vanilla JavaScript, global mock data in `assets/scripts/data.js`

---

### Task 1: 扩展 mock 数据与导航目标

**Files:**
- Modify: `assets/scripts/data.js`
- Modify: `index.html`
- Modify: `fault-diagnosis.html`
- Create: `home.html`
- Create: `flow-detail.html`

**Steps:**
1. 为首页增加 `homeOverview` / `aiTaskResources` 等 mock 数据。
2. 为流详情页补充统一的热力图顺序行数据和设备/接口筛选映射。
3. 调整顶部导航：顶级“首页”指向 `home.html`，RoCE 业务分析中的 “AI任务”指向 `index.html`。
4. 新建 `flow-detail.html` 页面骨架，保留单页布局所需容器。

### Task 2: 收敛列表页为“查询 + 趋势 + 列表”入口页

**Files:**
- Modify: `assets/scripts/app.js`
- Modify: `index.html`

**Steps:**
1. 移除详情抽屉 DOM。
2. 将“查看详情”改为 `flow-detail.html?flowId=...` 页面跳转。
3. 清理抽屉、Tab、详情相关状态与事件绑定。
4. 保留现有查询和整体趋势能力。

### Task 3: 实现独立流路径详情页

**Files:**
- Create: `assets/scripts/flow-detail.js`
- Modify: `flow-detail.html`
- Modify: `assets/scripts/data.js`

**Steps:**
1. 解析 `flowId` 并读取对应 flow 数据。
2. 顶部布局按草图组织为：匹配流摘要 / 匹配设备列表 / 路径拓扑。
3. 下部统一展示：指标趋势区 + 告警热力图区，不再使用 Tab。
4. 设备或接口点击后，过滤趋势与热力图；未选择时展示全量聚合。

### Task 4: 重写热力图与联动样式

**Files:**
- Modify: `assets/styles/main.css`

**Steps:**
1. 为首页新增浅色工作台风格卡片与资源布局。
2. 为详情页新增单页 section 布局与 nested heatmap row 样式。
3. 移除依赖 Tab/抽屉的视觉结构，保留现有拓扑/图表可复用样式。
4. 增加热力图嵌套行（设备下二级端口）与选中高亮样式。

### Task 5: 验证

**Files:**
- Test manually via local HTTP preview

**Steps:**
1. 验证 `home.html`、`index.html`、`flow-detail.html?flowId=flow-002`、`fault-diagnosis.html` 均能打开。
2. 验证列表页“查看详情”跳转正确。
3. 验证详情页默认展示全量趋势/热力图；点击设备、接口后内容联动过滤。
4. 验证热力图顺序为：源服务器 → 设备 → 设备端口（二级）→ 目的服务器。
5. 验证无 `flowId` 或无效 `flowId` 时显示空状态而非脚本报错。

