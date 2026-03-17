(() => {
  const data = window.ROCE_MOCK_DATA;
  const ALL_TENANTS_VALUE = '全部租户';
  const PRESET_HOURS = { '1h': 1, '4h': 4, '12h': 12, '24h': 24 };
  const DEFAULT_PRESET = '24h';
  const MAX_RANGE_MS = 7 * 24 * 60 * 60 * 1000;
  const STATUS_PRIORITY = { critical: 0, warning: 1, normal: 2 };

  const TEXT = {
    pageTitle: 'AIGC3.0_RoCE流路径交互原型',
    pageSubtitle: '面向 AI 任务运维的流路径查询、拓扑还原与一键诊断工作台',
    badgeRetention: '历史留存 7 天',
    badgeRange: '单次查询区间 ≤ 7 天',
    queryTitle: '查询过滤区',
    querySubtitle: '支持自定义起止时间、租户与关键五元组联合检索',
    defaultRange: '默认最近 24 小时',
    startTime: '开始时间',
    endTime: '结束时间',
    tenant: '租户',
    srcIp: '源IP',
    srcPort: '源端口',
    dstIp: '目的IP',
    dstPort: '目的端口',
    search: '查询',
    reset: '重置',
    roceHint: 'RoCEv2 目的端口固定为 UDP 4791，支持按异常流路径快速定位。',
    listTitle: 'RoCE流路径列表',
    listCountSuffix: '条流路径结果',
    statusAll: '全部',
    statusNormal: '正常',
    statusWarning: '告警',
    statusCritical: '严重',
    throughput: '流吞吐',
    latency: '端到端时延',
    jitter: '时延抖动',
    loss: '丢包数',
    status: '状态',
    lastActive: '最近活跃',
    actions: '操作',
    detailEyebrow: '流量路径详情',
    startDiagnosis: '一键故障诊断',
    tabOverview: '概览与拓扑',
    tabTrends: '详细指标趋势',
    tabAlarms: '告警记录',
    topologyTitle: '路径拓扑',
    detailSectionTitle: '详情',
    matchedDevicesTitle: '匹配流的设备',
    sourceAddress: '源地址',
    destinationAddress: '目标地址',
    sourcePortLabel: '源端口',
    destinationPortLabel: '目标端口',
    sourceBadge: '源',
    destinationBadge: '目的',
    throughputTrend: '吞吐趋势',
    latencyTrend: '时延趋势',
    jitterTrend: '抖动趋势',
    lossTrend: '丢包趋势',
    pfcTrend: 'PFC趋势',
    ecnTrend: 'ECN趋势',
    alarmListTitle: '关联告警记录',
    diagnosisTitle: '一键诊断结果',
    detailKpi1: '路径ID',
    detailKpi2: '流状态',
    detailKpi3: '跳数',
    detailKpi4: '诊断摘要',
    detailPath: '路径',
    detailTask: '任务',
    detailTenant: '租户',
    viewDetail: '查看详情',
    runDiagnosis: '诊断',
    noData: '当前条件下暂无匹配结果',
    allTenants: '全部租户',
    topologyLegend: '红色链路表示高风险段',
    alarmCount: '条告警',
    time: '时间',
    summary: '摘要',
    action: '建议动作',
    owner: '负责域',
    diagnosisMetaPrefix: '当前诊断对象：',
    severityNormal: '正常',
    severityWarning: '告警',
    severityCritical: '严重',
    diagPass: '通过',
    diagWarn: '关注',
    diagFail: '失败',
    range1h: '最近1小时',
    range4h: '最近4小时',
    range12h: '最近12小时',
    range24h: '最近24小时',
    srcIpPlaceholder: '例如 10.240.229.2',
    srcPortPlaceholder: '例如 56324',
    dstIpPlaceholder: '例如 10.240.229.60',
    close: '关闭',
    topologyAria: 'RoCE流路径拓扑图',
    initFailed: '原型初始化失败，请检查页面结构或 mock 数据。',
    validationRequired: '请选择完整的开始时间和结束时间。',
    validationOrder: '结束时间不能早于开始时间。',
    validationSevenDays: '查询时间跨度不能超过 7 天。',
    validationWindow: '查询时间需落在最近 7 天内，且不能晚于最新样本时间。'
  };

  const referenceTime = parseTime(data?.meta?.lastUpdated) || Date.now();
  const minAllowedTime = referenceTime - MAX_RANGE_MS;

  const state = {
    selectedPreset: DEFAULT_PRESET,
    selectedStatus: 'all',
    filteredFlows: [],
    selectedFlowId: null
  };

  const refs = {
    startTimeFilter: document.getElementById('startTimeFilter'),
    endTimeFilter: document.getElementById('endTimeFilter'),
    tenantFilter: document.getElementById('tenantFilter'),
    srcIpFilter: document.getElementById('srcIpFilter'),
    srcPortFilter: document.getElementById('srcPortFilter'),
    dstIpFilter: document.getElementById('dstIpFilter'),
    searchBtn: document.getElementById('searchBtn'),
    resetBtn: document.getElementById('resetBtn'),
    timeValidationText: document.getElementById('timeValidationText'),
    flowTableBody: document.getElementById('flowTableBody'),
    resultCount: document.getElementById('resultCount'),
    quickRangeGroup: document.getElementById('quickRangeGroup'),
    statusTabs: document.getElementById('statusTabs'),
    detailDrawer: document.getElementById('detailDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    flowSnapshotCard: document.getElementById('flowSnapshotCard'),
    matchedDeviceList: document.getElementById('matchedDeviceList'),
    matchedDeviceCount: document.getElementById('matchedDeviceCount'),
    topologyContainer: document.getElementById('topologyContainer'),
    throughputChart: document.getElementById('throughputChart'),
    latencyChart: document.getElementById('latencyChart'),
    jitterChart: document.getElementById('jitterChart'),
    lossChart: document.getElementById('lossChart'),
    pfcChart: document.getElementById('pfcChart'),
    ecnChart: document.getElementById('ecnChart'),
    alarmList: document.getElementById('alarmList'),
    alarmCountLabel: document.getElementById('alarmCountLabel'),
    detailTabs: document.getElementById('detailTabs'),
    diagnosisDrawer: document.getElementById('diagnosisDrawer'),
    diagnosisMeta: document.getElementById('diagnosisMeta'),
    diagnosisList: document.getElementById('diagnosisList'),
    lastUpdatedBadge: document.getElementById('lastUpdatedBadge')
  };

  function t(key) {
    return TEXT[key] || key;
  }

  function parseTime(value) {
    const timestamp = Date.parse(String(value || '').replace(' ', 'T'));
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function formatDateTimeLocal(timestamp) {
    const date = new Date(timestamp);
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function hasItems(list) {
    return Array.isArray(list) && list.length > 0;
  }

  function capitalize(value) {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }

  function statusLabel(status) {
    return t(`severity${capitalize(status)}`);
  }

  function diagnosisLabel(result) {
    return t(`diag${capitalize(result)}`);
  }

  function getAllTenantValue() {
    return data?.meta?.allTenantValue || ALL_TENANTS_VALUE;
  }

  function getFlowById(id) {
    return data.flows.find((item) => item.id === id) || null;
  }

  function compareFlows(left, right) {
    const priorityGap = (STATUS_PRIORITY[left.status] ?? 99) - (STATUS_PRIORITY[right.status] ?? 99);
    if (priorityGap !== 0) {
      return priorityGap;
    }
    return parseTime(right.lastActive) - parseTime(left.lastActive);
  }

  function validateRuntime() {
    const missingRefs = Object.entries(refs)
      .filter(([, element]) => !element)
      .map(([key]) => key);

    if (!data || !data.meta || !Array.isArray(data.flows) || missingRefs.length) {
      console.error(t('initFailed'), {
        hasData: Boolean(data),
        missingRefs
      });
      return false;
    }

    return true;
  }

  function updateStaticText() {
    document.documentElement.lang = 'zh-CN';
    document.title = t('pageTitle');
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    refs.lastUpdatedBadge.textContent = data.meta.lastUpdated;
    refs.srcIpFilter.placeholder = t('srcIpPlaceholder');
    refs.srcPortFilter.placeholder = t('srcPortPlaceholder');
    refs.dstIpFilter.placeholder = t('dstIpPlaceholder');
    document.getElementById('closeDiagnosisBtn').setAttribute('aria-label', t('close'));
  }

  function initializeTenantOptions() {
    refs.tenantFilter.innerHTML = data.tenants
      .map((tenant) => `<option value="${tenant}">${tenant === getAllTenantValue() ? t('allTenants') : tenant}</option>`)
      .join('');
  }

  function applyTimeBounds() {
    const minValue = formatDateTimeLocal(minAllowedTime);
    const maxValue = formatDateTimeLocal(referenceTime);

    refs.startTimeFilter.min = minValue;
    refs.startTimeFilter.max = maxValue;
    refs.endTimeFilter.min = minValue;
    refs.endTimeFilter.max = maxValue;
  }

  function syncRangeButtons() {
    document.querySelectorAll('[data-range]').forEach((button) => {
      button.classList.toggle('active', button.dataset.range === state.selectedPreset);
    });
  }

  function syncStatusTabs() {
    document.querySelectorAll('[data-status]').forEach((button) => {
      button.classList.toggle('active', button.dataset.status === state.selectedStatus);
    });
  }

  function setValidationMessage(message) {
    refs.timeValidationText.textContent = message;
    refs.timeValidationText.classList.toggle('visible', Boolean(message));
    refs.searchBtn.disabled = Boolean(message);
  }

  function setRangeByPreset(preset, shouldRefresh = true) {
    const hours = PRESET_HOURS[preset];
    if (!hours) {
      return;
    }

    state.selectedPreset = preset;
    refs.endTimeFilter.value = formatDateTimeLocal(referenceTime);
    refs.startTimeFilter.value = formatDateTimeLocal(referenceTime - hours * 60 * 60 * 1000);
    syncRangeButtons();
    validateTimeRange();

    if (shouldRefresh) {
      refresh();
    }
  }

  function validateTimeRange() {
    const startValue = refs.startTimeFilter.value;
    const endValue = refs.endTimeFilter.value;

    if (!startValue || !endValue) {
      setValidationMessage(t('validationRequired'));
      return null;
    }

    const start = parseTime(startValue);
    const end = parseTime(endValue);

    if (!start || !end) {
      setValidationMessage(t('validationRequired'));
      return null;
    }

    if (end < start) {
      setValidationMessage(t('validationOrder'));
      return null;
    }

    if (end - start > MAX_RANGE_MS) {
      setValidationMessage(t('validationSevenDays'));
      return null;
    }

    if (start < minAllowedTime || end > referenceTime) {
      setValidationMessage(t('validationWindow'));
      return null;
    }

    setValidationMessage('');
    return { start, end };
  }

  function applyFilters() {
    const range = validateTimeRange();
    if (!range) {
      state.filteredFlows = [];
      return false;
    }

    const tenant = refs.tenantFilter.value;
    const srcIp = refs.srcIpFilter.value.trim().toLowerCase();
    const srcPort = refs.srcPortFilter.value.trim();
    const dstIp = refs.dstIpFilter.value.trim().toLowerCase();

    state.filteredFlows = data.flows
      .filter((flow) => {
        const flowTime = parseTime(flow.lastActive);
        const matchesTime = flowTime >= range.start && flowTime <= range.end;
        const matchesStatus = state.selectedStatus === 'all' || flow.status === state.selectedStatus;
        const matchesTenant = !tenant || tenant === getAllTenantValue() || flow.tenant === tenant;
        const matchesSrcIp = !srcIp || flow.srcIp.toLowerCase().includes(srcIp);
        const matchesSrcPort = !srcPort || flow.srcPort.includes(srcPort);
        const matchesDstIp = !dstIp || flow.dstIp.toLowerCase().includes(dstIp);

        return matchesTime && matchesStatus && matchesTenant && matchesSrcIp && matchesSrcPort && matchesDstIp;
      })
      .sort(compareFlows);

    if (state.selectedFlowId && !state.filteredFlows.find((item) => item.id === state.selectedFlowId)) {
      closeDetailDrawer();
    }

    return true;
  }

  function renderTable() {
    refs.resultCount.textContent = state.filteredFlows.length;

    if (!state.filteredFlows.length) {
      refs.flowTableBody.innerHTML = `<tr><td colspan="12"><div class="empty-state">${t('noData')}</div></td></tr>`;
      return;
    }

    refs.flowTableBody.innerHTML = state.filteredFlows
      .map(
        (flow) => `
          <tr>
            <td>${flow.srcIp}</td>
            <td>${flow.srcPort}</td>
            <td>${flow.dstIp}</td>
            <td>${flow.dstPort}</td>
            <td>${flow.throughputText}</td>
            <td>${flow.latencyText}</td>
            <td>${flow.jitterText}</td>
            <td>${flow.lossText}</td>
            <td><span class="status-pill status-${flow.status}">${statusLabel(flow.status)}</span></td>
            <td>${flow.tenant}</td>
            <td>${flow.lastActive}</td>
            <td>
              <div class="action-group">
                <button class="action-link" data-open-detail="${flow.id}">${t('viewDetail')}</button>
                <button class="action-link" data-run-diagnosis="${flow.id}">${t('runDiagnosis')}</button>
              </div>
            </td>
          </tr>
        `
      )
      .join('');
  }

  function openDetailDrawer(flowId, openDiagnosis = false) {
    const flow = getFlowById(flowId);
    if (!flow) {
      return;
    }

    state.selectedFlowId = flowId;
    refs.detailDrawer.classList.add('open');
    refs.detailDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderDetail(flow);

    refs.diagnosisDrawer.classList.toggle('open', openDiagnosis);
  }

  function closeDetailDrawer() {
    refs.detailDrawer.classList.remove('open');
    refs.detailDrawer.setAttribute('aria-hidden', 'true');
    refs.diagnosisDrawer.classList.remove('open');
    document.body.style.overflow = '';
    state.selectedFlowId = null;
  }

  function activateTab(name) {
    document.querySelectorAll('.detail-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.tab === name);
    });
    document.querySelectorAll('[data-tab-panel]').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.tabPanel === name);
    });
  }

  function renderDetail(flow) {
    renderTopology(flow);
    renderFlowSnapshot(flow);
    renderMatchedDevices(flow);
    renderCharts(flow);
    renderAlarms(flow);
    renderDiagnosis(flow);
    activateTab('overview');
  }

  function renderFlowSnapshot(flow) {
    refs.flowSnapshotCard.innerHTML = `
      <div class="flow-snapshot-card">
        <div class="snapshot-endpoints">
          <div class="snapshot-endpoint snapshot-endpoint-left">
            <div class="snapshot-ip">${flow.srcIp}</div>
            <div class="snapshot-label">${t('sourceAddress')}</div>
            <div class="snapshot-port">${flow.srcPort}</div>
            <div class="snapshot-label">${t('sourcePortLabel')}</div>
          </div>
          <div class="snapshot-arrow">→</div>
          <div class="snapshot-endpoint snapshot-endpoint-right">
            <div class="snapshot-ip">${flow.dstIp}</div>
            <div class="snapshot-label">${t('destinationAddress')}</div>
            <div class="snapshot-port">${flow.dstPort}</div>
            <div class="snapshot-label">${t('destinationPortLabel')}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMatchedDevices(flow) {
    const devices = (flow.topology?.nodes || []).filter((node) => node.type !== 'server');
    refs.matchedDeviceCount.textContent = `(${devices.length})`;

    if (!hasItems(devices)) {
      refs.matchedDeviceList.innerHTML = `<div class="empty-state">${t('noData')}</div>`;
      return;
    }

    refs.matchedDeviceList.innerHTML = `
      <div class="matched-device-list">
        ${devices
          .map(
            (node) => `
              <div class="matched-device-item">
                <span class="matched-device-chevron">›</span>
                <div>
                  <div class="matched-device-name">${node.label}</div>
                  <div class="matched-device-sub">${node.sub}</div>
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    `;
  }

  function renderTopology(flow) {
    if (!hasItems(flow?.topology?.nodes) || !hasItems(flow?.topology?.links)) {
      refs.topologyContainer.innerHTML = `<div class="empty-state">${t('noData')}</div>`;
      return;
    }

    const width = 900;
    const height = 620;
    const positions = calculateTopologyLayout(flow.topology.nodes);

    const linkMarkup = flow.topology.links
      .map((link) => {
        const start = positions[link.from];
        const end = positions[link.to];
        if (!start || !end) {
          return '';
        }
        const isVertical = Math.abs(start.x - end.x) < 20;
        const path = isVertical
          ? `M ${start.x} ${start.y} L ${end.x} ${end.y}`
          : `M ${start.x} ${start.y} C ${start.x} ${(start.y + end.y) / 2}, ${end.x} ${(start.y + end.y) / 2}, ${end.x} ${end.y}`;
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2 - (isVertical ? 12 : 22);
        return `
          <path d="${path}" class="link-${link.severity}" stroke-width="2.2" fill="none" />
          <text x="${midX}" y="${midY}" class="link-label" text-anchor="middle" font-size="11">${link.metrics}</text>
        `;
      })
      .join('');

    const nodeMarkup = flow.topology.nodes
      .map((node) => {
        const point = positions[node.id];
        if (!point) {
          return '';
        }
        const statusClass = `node-${node.status}`;
        const baseClass = node.type === 'server' ? 'node-server' : 'node-switch';
        const badgeText = point.role === 'source' ? t('sourceBadge') : point.role === 'destination' ? t('destinationBadge') : '';
        const icon = node.type === 'server' ? '▭' : '◫';
        return `
          <g class="topology-node ${statusClass}">
            <circle cx="${point.x}" cy="${point.y}" r="28" class="topology-node-ring"></circle>
            <circle cx="${point.x}" cy="${point.y}" r="24" class="${baseClass} ${statusClass}"></circle>
            <text x="${point.x}" y="${point.y + 6}" class="topology-icon" text-anchor="middle">${icon}</text>
            ${badgeText ? `<text x="${point.x}" y="${point.y + 40}" class="topology-badge" text-anchor="middle">${badgeText}</text>` : ''}
            <text x="${point.x}" y="${point.y + 64}" fill="#edf2ff" text-anchor="middle" font-size="13" font-weight="700">${point.displayLabel}</text>
          </g>
        `;
      })
      .join('');

    refs.topologyContainer.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="topology-svg" role="img" aria-label="${t('topologyAria')}">
        <text x="26" y="30" class="chart-label" font-size="12">${t('topologyLegend')}</text>
        ${linkMarkup}
        ${nodeMarkup}
      </svg>
    `;
  }

  function calculateTopologyLayout(nodes) {
    const servers = nodes.filter((node) => node.type === 'server');
    const switches = nodes.filter((node) => node.type !== 'server');
    const sourceServer = servers[0];
    const destinationServer = servers[servers.length - 1];
    const positions = {};

    if (sourceServer) {
      positions[sourceServer.id] = { x: 220, y: 500, displayLabel: sourceServer.label, role: 'source' };
    }
    if (destinationServer && destinationServer.id !== sourceServer?.id) {
      positions[destinationServer.id] = { x: 680, y: 500, displayLabel: destinationServer.label, role: 'destination' };
    }

    if (switches.length >= 3) {
      const middle = switches[Math.floor(switches.length / 2)];
      const left = switches[0];
      const right = switches[switches.length - 1];

      positions[middle.id] = { x: 450, y: 140, displayLabel: middle.label };
      if (left.id !== middle.id) {
        positions[left.id] = { x: 220, y: 290, displayLabel: left.label };
      }
      if (right.id !== middle.id) {
        positions[right.id] = { x: 680, y: 290, displayLabel: right.label };
      }
    } else if (switches.length === 2) {
      positions[switches[0].id] = { x: 220, y: 260, displayLabel: switches[0].label };
      positions[switches[1].id] = { x: 680, y: 260, displayLabel: switches[1].label };
    } else if (switches.length === 1) {
      positions[switches[0].id] = { x: 450, y: 220, displayLabel: switches[0].label };
    }

    nodes.forEach((node, index) => {
      if (!positions[node.id]) {
        positions[node.id] = {
          x: 180 + index * 140,
          y: node.type === 'server' ? 500 : 220,
          displayLabel: node.label
        };
      }
    });

    return positions;
  }

  function renderVerticalAxisLabel(unit, height) {
    const chars = String(unit).split('');
    const startY = height / 2 - ((chars.length - 1) * 14) / 2;
    return chars
      .map((char, index) => `<tspan x="18" y="${startY + index * 14}">${char}</tspan>`)
      .join('');
  }

  function renderChart(container, trend, strokeColor) {
    if (!hasItems(trend?.values)) {
      container.innerHTML = `<div class="empty-state">${t('noData')}</div>`;
      return;
    }

    const width = 520;
    const height = 220;
    const padding = 28;
    const leftPadding = 62;
    const topPadding = 36;
    const max = Math.max(...trend.values, 1);
    const min = Math.min(...trend.values, 0);
    const range = max - min || 1;

    const points = trend.values.map((value, index) => {
      const x = leftPadding + (index * (width - leftPadding - padding)) / (trend.values.length - 1 || 1);
      const y = height - padding - ((value - min) / range) * (height - topPadding - padding);
      return { x, y, index };
    });

    const pointLine = points.map((point) => `${point.x},${point.y}`).join(' ');
    const areaLine = `${leftPadding},${height - padding} ${pointLine} ${width - padding},${height - padding}`;

    container.innerHTML = `
      <div class="chart-card">
        <svg viewBox="0 0 ${width} ${height}">
          <line x1="${leftPadding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(158,176,207,0.24)" />
          <line x1="${leftPadding}" y1="${topPadding}" x2="${leftPadding}" y2="${height - padding}" stroke="rgba(158,176,207,0.18)" />
          <text class="chart-axis-label" font-size="11" text-anchor="middle">${renderVerticalAxisLabel(trend.unit, height)}</text>
          <polygon points="${areaLine}" fill="${strokeColor}" opacity="0.12"></polygon>
          <polyline points="${pointLine}" fill="none" stroke="${strokeColor}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"></polyline>
          ${points
            .map((point) => {
              const isAlert = trend.alerts.includes(point.index);
              return `
                <circle cx="${point.x}" cy="${point.y}" r="${isAlert ? 6 : 4}" fill="${isAlert ? '#ff5630' : strokeColor}"></circle>
                <text x="${point.x}" y="${height - 10}" class="chart-label" font-size="11" text-anchor="middle">T${point.index + 1}</text>
              `;
            })
            .join('')}
          <text x="${leftPadding}" y="20" class="chart-meta-label" font-size="11">max ${max}${trend.unit}</text>
          <text x="${width - padding}" y="20" class="chart-meta-label" font-size="11" text-anchor="end">min ${min}${trend.unit}</text>
        </svg>
      </div>
    `;
  }

  function renderCharts(flow) {
    renderChart(refs.throughputChart, flow.trends.throughput, '#53d3ff');
    renderChart(refs.latencyChart, flow.trends.latency, '#7c9cff');
    renderChart(refs.jitterChart, flow.trends.jitter, '#ffb545');
    renderChart(refs.lossChart, flow.trends.loss, '#ff6b6b');
    renderChart(refs.pfcChart, flow.trends.pfc, '#4f8cff');
    renderChart(refs.ecnChart, flow.trends.ecn, '#8b5cf6');
  }

  function renderAlarms(flow) {
    refs.alarmCountLabel.textContent = `${flow.alarms.length} ${t('alarmCount')}`;

    if (!hasItems(flow.alarms)) {
      refs.alarmList.innerHTML = `<div class="empty-state">${t('noData')}</div>`;
      return;
    }

    refs.alarmList.innerHTML = `
      <div class="alarm-list">
        ${flow.alarms
          .map(
            (alarm) => `
              <div class="alarm-item">
                <div class="alarm-item-header">
                  <strong>${alarm.object}</strong>
                  <span class="alarm-tag ${alarm.level}">${statusLabel(alarm.level)}</span>
                </div>
                <div class="alarm-desc">${t('time')}：${alarm.time}</div>
                <div class="alarm-desc">${t('summary')}：${alarm.summary}</div>
                <div class="alarm-desc">${t('action')}：${alarm.action}</div>
              </div>
            `
          )
          .join('')}
      </div>
    `;
  }

  function renderDiagnosis(flow) {
    refs.diagnosisMeta.textContent = `${t('diagnosisMetaPrefix')}${flow.srcIp}:${flow.srcPort} → ${flow.dstIp}:${flow.dstPort}`;

    if (!hasItems(flow.diagnosis)) {
      refs.diagnosisList.innerHTML = `<div class="empty-state">${t('noData')}</div>`;
      return;
    }

    refs.diagnosisList.innerHTML = `
      <div class="diag-list">
        ${flow.diagnosis
          .map(
            (item) => `
              <div class="diag-item">
                <div class="diag-item-header">
                  <strong>${item.item}</strong>
                  <span class="diag-tag ${item.result}">${diagnosisLabel(item.result)}</span>
                </div>
                <div class="diag-desc">${t('owner')}：${item.owner}</div>
                <div class="diag-desc">${item.desc}</div>
                <div class="progress-track">
                  <div class="progress-fill" style="width: ${item.progress}%"></div>
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    `;
  }

  function refresh(closeDrawerIfEmpty = true) {
    applyFilters();
    renderTable();

    if (closeDrawerIfEmpty && !state.filteredFlows.length) {
      closeDetailDrawer();
    }
  }

  function bindEvents() {
    refs.searchBtn.addEventListener('click', () => refresh());

    refs.resetBtn.addEventListener('click', () => {
      refs.tenantFilter.value = getAllTenantValue();
      refs.srcIpFilter.value = '';
      refs.srcPortFilter.value = '';
      refs.dstIpFilter.value = '';
      state.selectedStatus = 'all';
      syncStatusTabs();
      setRangeByPreset(DEFAULT_PRESET, false);
      refresh();
    });

    refs.quickRangeGroup.addEventListener('click', (event) => {
      const button = event.target.closest('[data-range]');
      if (!button) {
        return;
      }
      setRangeByPreset(button.dataset.range, true);
    });

    [refs.startTimeFilter, refs.endTimeFilter].forEach((element) => {
      element.addEventListener('input', () => {
        state.selectedPreset = null;
        syncRangeButtons();
        validateTimeRange();
      });
    });

    refs.statusTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-status]');
      if (!button) {
        return;
      }
      state.selectedStatus = button.dataset.status;
      syncStatusTabs();
      refresh(false);
    });

    refs.flowTableBody.addEventListener('click', (event) => {
      const detailButton = event.target.closest('[data-open-detail]');
      const diagnosisButton = event.target.closest('[data-run-diagnosis]');
      if (detailButton) {
        openDetailDrawer(detailButton.dataset.openDetail, false);
      }
      if (diagnosisButton) {
        openDetailDrawer(diagnosisButton.dataset.runDiagnosis, true);
      }
    });

    refs.drawerBackdrop.addEventListener('click', closeDetailDrawer);
    document.getElementById('drawerDiagnosisBtn').addEventListener('click', () => {
      if (!state.selectedFlowId) {
        return;
      }
      refs.diagnosisDrawer.classList.add('open');
    });
    document.getElementById('closeDiagnosisBtn').addEventListener('click', () => {
      refs.diagnosisDrawer.classList.remove('open');
    });

    refs.detailTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tab]');
      if (!button) {
        return;
      }
      activateTab(button.dataset.tab);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (refs.diagnosisDrawer.classList.contains('open')) {
          refs.diagnosisDrawer.classList.remove('open');
          return;
        }
        if (refs.detailDrawer.classList.contains('open')) {
          closeDetailDrawer();
        }
        return;
      }

      const target = event.target;
      const isFilterField = target instanceof HTMLInputElement || target instanceof HTMLSelectElement;
      if (event.key === 'Enter' && isFilterField) {
        refresh();
      }
    });
  }

  function init() {
    if (!validateRuntime()) {
      return;
    }

    updateStaticText();
    initializeTenantOptions();
    refs.tenantFilter.value = getAllTenantValue();
    applyTimeBounds();
    syncStatusTabs();
    setRangeByPreset(DEFAULT_PRESET, false);
    bindEvents();
    refresh();
  }

  init();
})();
