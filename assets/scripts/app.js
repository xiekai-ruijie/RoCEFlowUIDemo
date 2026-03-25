(() => {
  const data = window.ROCE_MOCK_DATA;
  const ALL_TENANTS_VALUE = '全部租户';
  const PRESET_HOURS = { '1h': 1, '4h': 4, '12h': 12, '24h': 24 };
  const DEFAULT_PRESET = PRESET_HOURS[data?.meta?.defaultRange] ? data.meta.defaultRange : '1h';
  const DIAGNOSIS_PAGE_PATH = './fault-diagnosis.html';
  const MAX_RANGE_MS = 7 * 24 * 60 * 60 * 1000;
  const STATUS_PRIORITY = { critical: 0, warning: 1, normal: 2 };
  const CHART_DEFS = [
    { key: 'throughput', color: '#53d3ff', detailRef: 'throughputChart', overallRef: 'overallThroughputChart' },
    { key: 'latency', color: '#7c9cff', detailRef: 'latencyChart', overallRef: 'overallLatencyChart' },
    { key: 'jitter', color: '#ffb545', detailRef: 'jitterChart', overallRef: 'overallJitterChart' },
    { key: 'loss', color: '#ff6b6b', detailRef: 'lossChart', overallRef: 'overallLossChart' },
    { key: 'pfc', color: '#4f8cff', detailRef: 'pfcChart', overallRef: 'overallPfcChart' },
    { key: 'ecn', color: '#8b5cf6', detailRef: 'ecnChart', overallRef: 'overallEcnChart' }
  ];
  const SUM_AGGREGATE_KEYS = new Set(['throughput', 'loss', 'pfc']);

  const TEXT = {
    pageTitle: 'AIGC3.0_RoCE流路径交互原型',
    pageSubtitle: '面向 AI 任务运维的流路径查询、拓扑还原与一键诊断工作台',
    badgeRetentionLabel: '历史留存',
    badgeRetentionHint: '历史留存 7 天',
    badgeRangeLabel: '查询区间',
    badgeRangeHint: '单次查询区间 ≤ 7 天',
    lastUpdatedLabel: 'Mock 更新时间',
    queryTitle: '查询过滤区',
    querySubtitleHint: '支持自定义起止时间、租户与关键五元组联合检索',
    defaultRange: '默认最近 1 小时',
    timeRangeLabel: '时间范围',
    presetRangeLabel: '快捷时间',
    startTime: '开始时间',
    endTime: '结束时间',
    tenant: '租户',
    srcIp: '源IP',
    srcPort: '源端口',
    dstIp: '目的IP',
    dstPort: '目的端口',
    search: '查询',
    reset: '重置',
    roceHintLabel: 'RoCEv2 检索说明',
    roceHint: 'RoCEv2 目的端口固定为 UDP 4791，支持按异常流路径快速定位。',
    overallTrendTitle: '整体指标趋势',
    overallTrendSubtitle: '汇总展示当前范围内流相关的吞吐、时延、抖动、丢包、PFC、ECN 指标趋势。',
    overallTrendBadge: '筛选结果趋势总览',
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
    alarmColumn: '告警',
    alarmCriticalLabel: '严重',
    alarmErrorLabel: '错误',
    alarmWarningLabel: '警告',
    alarmNone: '无',
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
    viewInTopology: '在拓扑中查看',
    topologyDefaultHint: '当前展示主路径概览',
    topologyPathHint: '当前展示拓扑上下文中的主路径',
    topologyDeviceHint: '当前展示设备接口相关流量',
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
    alarmHeatmapTitle: '告警热力图',
    alarmHeatmapSubtitle: '按服务器、交换机与下联接口查看告警热度分布。',
    alarmHeatmapServers: '服务器',
    alarmHeatmapSwitches: '交换机',
    alarmHeatmapInterfaces: '下联接口',
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
    dstPortPlaceholder: '例如 4791',
    heatmapDateLabel: '观测日期',
    heatmapTimeAxis: '时间轴',
    infoTriggerAria: '点击查看说明',
    close: '关闭',
    topologyAria: 'RoCE流路径拓扑图',
    interfaceIngress: '入站接口',
    interfaceEgress: '出站接口',
    interfaceName: '接口名称',
    interfacePackets: '数据包',
    interfaceBytes: '字节',
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
    selectedFlowId: null,
    expandedDeviceIds: [],
    topologyMode: 'default',
    focusedDeviceId: null,
    activeHeatmapGroupId: 'servers'
  };

  const refs = {
    startTimeFilter: document.getElementById('startTimeFilter'),
    endTimeFilter: document.getElementById('endTimeFilter'),
    tenantFilter: document.getElementById('tenantFilter'),
    srcIpFilter: document.getElementById('srcIpFilter'),
    srcPortFilter: document.getElementById('srcPortFilter'),
    dstIpFilter: document.getElementById('dstIpFilter'),
    dstPortFilter: document.getElementById('dstPortFilter'),
    searchBtn: document.getElementById('searchBtn'),
    resetBtn: document.getElementById('resetBtn'),
    timeValidationText: document.getElementById('timeValidationText'),
    flowTableBody: document.getElementById('flowTableBody'),
    resultCount: document.getElementById('resultCount'),
    quickRangeGroup: document.getElementById('quickRangeGroup'),
    overallThroughputChart: document.getElementById('overallThroughputChart'),
    overallLatencyChart: document.getElementById('overallLatencyChart'),
    overallJitterChart: document.getElementById('overallJitterChart'),
    overallLossChart: document.getElementById('overallLossChart'),
    overallPfcChart: document.getElementById('overallPfcChart'),
    overallEcnChart: document.getElementById('overallEcnChart'),
    detailDrawer: document.getElementById('detailDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    flowSnapshotCard: document.getElementById('flowSnapshotCard'),
    matchedDeviceList: document.getElementById('matchedDeviceList'),
    matchedDeviceCount: document.getElementById('matchedDeviceCount'),
    topologyContainer: document.getElementById('topologyContainer'),
    viewInTopologyBtn: document.getElementById('viewInTopologyBtn'),
    topologyViewHint: document.getElementById('topologyViewHint'),
    throughputChart: document.getElementById('throughputChart'),
    latencyChart: document.getElementById('latencyChart'),
    jitterChart: document.getElementById('jitterChart'),
    lossChart: document.getElementById('lossChart'),
    pfcChart: document.getElementById('pfcChart'),
    ecnChart: document.getElementById('ecnChart'),
    alarmList: document.getElementById('alarmList'),
    detailTabs: document.getElementById('detailTabs'),
    drawerDiagnosisBtn: document.getElementById('drawerDiagnosisBtn')
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

  function getNodeById(flow, id) {
    return (flow?.topology?.nodes || []).find((node) => node.id === id) || null;
  }

  function getAlarmSummary(flow) {
    return flow?.alarmSummary || { critical: 0, error: 0, warning: 0 };
  }

  function getPathNodeIds(flow) {
    const links = flow?.topology?.links || [];
    if (!links.length) {
      return [];
    }
    return [links[0].from, ...links.map((link) => link.to)];
  }

  function createSiblingLabel(label, delta = 1, fallbackPrefix = 'node') {
    const normalized = String(label || fallbackPrefix);
    const match = normalized.match(/^(.*?)(\d+)$/);
    if (match) {
      const nextNumber = Math.max(1, Number(match[2]) + delta);
      return `${match[1]}${nextNumber}`;
    }
    return `${normalized}-${Math.abs(delta)}`;
  }

  function inferRelatedLabel(node, fallback) {
    if (!node) {
      return fallback;
    }
    if (node.type === 'server') {
      return 'server';
    }
    const lower = String(node.label || fallback).toLowerCase();
    if (lower.includes('spine')) {
      return 'spine';
    }
    if (lower.includes('leaf')) {
      return 'leaf';
    }
    return fallback;
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
    refs.srcIpFilter.placeholder = t('srcIpPlaceholder');
    refs.srcPortFilter.placeholder = t('srcPortPlaceholder');
    refs.dstIpFilter.placeholder = t('dstIpPlaceholder');
    refs.dstPortFilter.placeholder = t('dstPortPlaceholder');
    document.querySelectorAll('.info-trigger').forEach((button) => {
      button.setAttribute('aria-label', t('infoTriggerAria'));
    });
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


  function closeInfoAnchors(exceptAnchor = null) {
    document.querySelectorAll('.info-anchor.is-open').forEach((anchor) => {
      if (exceptAnchor && anchor === exceptAnchor) {
        return;
      }
      anchor.classList.remove('is-open');
      const trigger = anchor.querySelector('.info-trigger');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
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
    const dstPort = refs.dstPortFilter.value.trim();

    state.filteredFlows = data.flows
      .filter((flow) => {
        const flowTime = parseTime(flow.lastActive);
        const matchesTime = flowTime >= range.start && flowTime <= range.end;
        const matchesStatus = state.selectedStatus === 'all' || flow.status === state.selectedStatus;
        const matchesTenant = !tenant || tenant === getAllTenantValue() || flow.tenant === tenant;
        const matchesSrcIp = !srcIp || flow.srcIp.toLowerCase().includes(srcIp);
        const matchesSrcPort = !srcPort || flow.srcPort.includes(srcPort);
        const matchesDstIp = !dstIp || flow.dstIp.toLowerCase().includes(dstIp);
        const matchesDstPort = !dstPort || flow.dstPort.includes(dstPort);

        return matchesTime && matchesStatus && matchesTenant && matchesSrcIp && matchesSrcPort && matchesDstIp && matchesDstPort;
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
            <td>${renderAlarmSummary(flow)}</td>
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

  function renderAlarmSummary(flow) {
    const summary = getAlarmSummary(flow);
    const alarmLevels = [
      { key: 'critical', labelKey: 'alarmCriticalLabel' },
      { key: 'error', labelKey: 'alarmErrorLabel' },
      { key: 'warning', labelKey: 'alarmWarningLabel' }
    ].filter(({ key }) => Number(summary[key]) > 0);

    if (!alarmLevels.length) {
      return `<span class="alarm-summary-empty">${t('alarmNone')}</span>`;
    }

    return `
      <div class="alarm-summary">
        ${alarmLevels
          .map(
            ({ key, labelKey }) =>
              `<span class="alarm-count-pill alarm-${key}" title="${t(labelKey)}：${summary[key]}">${summary[key]}</span>`
          )
          .join('')}
      </div>
    `;
  }

  function navigateToDiagnosis(flowId) {
    const url = new URL(DIAGNOSIS_PAGE_PATH, window.location.href);
    if (flowId) {
      url.searchParams.set('action', 'new_task');
      url.searchParams.set('flowId', flowId);
    }
    window.location.href = url.toString();
  }

  function openDetailDrawer(flowId) {
    const flow = getFlowById(flowId);
    if (!flow) {
      return;
    }

    state.selectedFlowId = flowId;
    refs.detailDrawer.classList.add('open');
    refs.detailDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderDetail(flow);
  }

  function closeDetailDrawer() {
    refs.detailDrawer.classList.remove('open');
    refs.detailDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.selectedFlowId = null;
    state.expandedDeviceIds = [];
    state.topologyMode = 'default';
    state.focusedDeviceId = null;
    state.activeHeatmapGroupId = 'servers';
    closeInfoAnchors();
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
    state.topologyMode = 'default';
    state.focusedDeviceId = null;
    state.activeHeatmapGroupId = flow.alarmHeatmap?.groups?.[0]?.id || 'servers';
    state.expandedDeviceIds = getMatchedDevices(flow)
      .slice(0, 1)
      .map((device) => device.id);
    renderTopology(flow);
    renderFlowSnapshot(flow);
    renderMatchedDevices(flow);
    renderCharts(flow);
    renderAlarms(flow);
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

  function getMatchedDevices(flow) {
    return (flow.topology?.nodes || []).filter((node) => node.type !== 'server');
  }

  function getGeneratedDeviceTitle(node, index) {
    const lowerLabel = String(node.label || 'device').toLowerCase();
    const isSpine = lowerLabel.includes('spine');
    const third = isSpine ? '1' : '0';
    const lastOctet = isSpine ? 30 + index : 3 + index;
    return `10.10.${third}.${lastOctet} (${lowerLabel})`;
  }

  function getResolvedDeviceDetail(node, flow, index) {
    const detail = node.deviceDetail || {};
    const [ingressName = 'Eth1/1', egressName = ingressName] = String(node.sub || '')
      .split('→')
      .map((item) => item.trim())
      .filter(Boolean);

    const ingressPackets = Math.max(4, Math.round(flow.throughput * (index + 2)));
    const ingressBytes = Math.max(3, flow.throughput * (index + 1.2));
    const egressPackets = Math.max(ingressPackets + 6, Math.round(ingressPackets * 1.18));
    const egressBytes = Math.max(ingressBytes + 2.5, ingressBytes * 1.16);

    return {
      title: detail.title || getGeneratedDeviceTitle(node, index),
      subtitle: detail.subtitle || node.sub || '',
      ingress: {
        interfaceName: detail.ingress?.interfaceName || ingressName,
        packets: detail.ingress?.packets || `${ingressPackets}M packets`,
        bytes: detail.ingress?.bytes || `${ingressBytes.toFixed(1)} GB`
      },
      egress: {
        interfaceName: detail.egress?.interfaceName || egressName,
        packets: detail.egress?.packets || `${egressPackets}M packets`,
        bytes: detail.egress?.bytes || `${egressBytes.toFixed(1)} GB`
      }
    };
  }

  function renderMatchedDevices(flow) {
    const devices = getMatchedDevices(flow);
    refs.matchedDeviceCount.textContent = `(${devices.length})`;

    if (!hasItems(devices)) {
      refs.matchedDeviceList.innerHTML = `<div class="empty-state">${t('noData')}</div>`;
      return;
    }

    refs.matchedDeviceList.innerHTML = `
      <div class="matched-device-list">
        ${devices
          .map(
            (node, index) => {
              const detail = getResolvedDeviceDetail(node, flow, index);
              const isExpanded = state.expandedDeviceIds.includes(node.id);
              const isFocused = state.focusedDeviceId === node.id;

              return `
              <div class="matched-device-card ${isExpanded ? 'expanded' : ''} ${isFocused ? 'is-focused' : ''}">
                <button class="matched-device-toggle" type="button" data-device-toggle="${node.id}" aria-expanded="${isExpanded}">
                  <span class="matched-device-chevron">⌄</span>
                  <div class="matched-device-heading">
                    <div class="matched-device-name">${detail.title}</div>
                    <div class="matched-device-sub">${detail.subtitle}</div>
                  </div>
                </button>
                <div class="matched-device-panel">
                  <div class="device-interface-card interface-ingress">
                    <div class="device-interface-title-row">
                      <span class="device-interface-dot"></span>
                      <strong>${t('interfaceIngress')}</strong>
                    </div>
                    <div class="device-interface-grid">
                      <span>${t('interfaceName')}：</span>
                      <strong>${detail.ingress.interfaceName}</strong>
                      <span>${t('interfacePackets')}：</span>
                      <strong>${detail.ingress.packets}</strong>
                      <span>${t('interfaceBytes')}：</span>
                      <strong>${detail.ingress.bytes}</strong>
                    </div>
                  </div>
                  <div class="device-interface-card interface-egress">
                    <div class="device-interface-title-row">
                      <span class="device-interface-dot"></span>
                      <strong>${t('interfaceEgress')}</strong>
                    </div>
                    <div class="device-interface-grid">
                      <span>${t('interfaceName')}：</span>
                      <strong>${detail.egress.interfaceName}</strong>
                      <span>${t('interfacePackets')}：</span>
                      <strong>${detail.egress.packets}</strong>
                      <span>${t('interfaceBytes')}：</span>
                      <strong>${detail.egress.bytes}</strong>
                    </div>
                  </div>
                </div>
              </div>
            `;
            }
          )
          .join('')}
      </div>
    `;
  }

  function renderTopology(flow) {
    if (state.topologyMode === 'path') {
      renderPathFocusTopology(flow);
      updateTopologyHint(flow);
      return;
    }

    if (state.topologyMode === 'device' && state.focusedDeviceId) {
      renderDeviceTrafficTopology(flow, state.focusedDeviceId);
      updateTopologyHint(flow);
      return;
    }

    renderPrimaryTopology(flow);
    updateTopologyHint(flow);
  }

  function updateTopologyHint(flow) {
    if (!refs.topologyViewHint || !refs.viewInTopologyBtn) {
      return;
    }

    let hintText = t('topologyDefaultHint');
    if (state.topologyMode === 'path') {
      hintText = `${t('topologyPathHint')} · ${flow.srcIp} → ${flow.dstIp}`;
    } else if (state.topologyMode === 'device' && state.focusedDeviceId) {
      const node = getNodeById(flow, state.focusedDeviceId);
      hintText = `${t('topologyDeviceHint')} · ${node?.label || state.focusedDeviceId}`;
    }

    refs.topologyViewHint.textContent = hintText;
    refs.viewInTopologyBtn.classList.toggle('is-active', state.topologyMode === 'path');
  }

  function renderPrimaryTopology(flow) {
    if (!hasItems(flow?.topology?.nodes) || !hasItems(flow?.topology?.links)) {
      refs.topologyContainer.innerHTML = `<div class="empty-state">${t('noData')}</div>`;
      return;
    }

    const width = 900;
    const height = 620;
    const positions = calculateTopologyLayout(flow.topology.nodes);
    refs.topologyContainer.innerHTML = renderTopologyGraph({
      width,
      height,
      nodes: flow.topology.nodes,
      links: flow.topology.links,
      positions,
      legendText: t('topologyLegend')
    });
  }

  function renderTopologyGraph({ width, height, nodes, links, positions, legendText }) {
    const linkMarkup = links
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
        const linkClasses = [`link-${link.severity || 'normal'}`];
        if (link.muted) {
          linkClasses.push('is-muted');
        }
        if (link.highlighted) {
          linkClasses.push('is-highlighted');
        }
        return `
          <path d="${path}" class="${linkClasses.join(' ')}" stroke-width="${link.highlighted ? 2.8 : link.muted ? 1.6 : 2.2}" fill="none" />
          ${link.metrics ? `<text x="${midX}" y="${midY}" class="link-label ${link.muted ? 'is-muted' : ''}" text-anchor="middle" font-size="11">${link.metrics}</text>` : ''}
        `;
      })
      .join('');

    const nodeMarkup = nodes
      .map((node) => {
        const point = positions[node.id];
        if (!point) {
          return '';
        }
        const statusClass = `node-${node.status || 'normal'}`;
        const baseClass = node.type === 'server' ? 'node-server' : 'node-switch';
        const badgeText = node.role === 'source' || point.role === 'source' ? t('sourceBadge') : node.role === 'destination' || point.role === 'destination' ? t('destinationBadge') : '';
        const icon = node.type === 'server' ? '▭' : '◫';
        const classes = ['topology-node', statusClass];
        if (node.muted) {
          classes.push('is-muted');
        }
        if (node.highlighted) {
          classes.push('is-highlighted');
        }
        return `
          <g class="${classes.join(' ')}">
            <circle cx="${point.x}" cy="${point.y}" r="28" class="topology-node-ring"></circle>
            <circle cx="${point.x}" cy="${point.y}" r="24" class="${baseClass} ${statusClass}"></circle>
            <text x="${point.x}" y="${point.y + 6}" class="topology-icon" text-anchor="middle">${icon}</text>
            ${badgeText ? `<text x="${point.x}" y="${point.y + 40}" class="topology-badge" text-anchor="middle">${badgeText}</text>` : ''}
            <text x="${point.x}" y="${point.y + 64}" class="topology-node-label" text-anchor="middle" font-size="13" font-weight="700">${point.displayLabel || node.label}</text>
          </g>
        `;
      })
      .join('');

    return `
      <svg viewBox="0 0 ${width} ${height}" class="topology-svg" role="img" aria-label="${t('topologyAria')}">
        <text x="26" y="30" class="chart-label" font-size="12">${legendText}</text>
        ${linkMarkup}
        ${nodeMarkup}
      </svg>
    `;
  }

  function renderPathFocusTopology(flow) {
    const topology = createPathFocusTopology(flow);
    refs.topologyContainer.innerHTML = renderTopologyGraph({
      width: topology.width,
      height: topology.height,
      nodes: topology.nodes,
      links: topology.links,
      positions: topology.positions,
      legendText: t('topologyPathHint')
    });
  }

  function createPathFocusTopology(flow) {
    const scaledPositions = Object.fromEntries(
      Object.entries(calculateTopologyLayout(flow.topology.nodes)).map(([id, point]) => [
        id,
        {
          ...point,
          x: point.x * 1.34 - 120,
          y: point.y * 1.08 - 10
        }
      ])
    );
    const positions = { ...scaledPositions };
    const width = 1200;
    const height = 720;
    const nodes = flow.topology.nodes.map((node) => ({ ...node, highlighted: true }));
    const links = flow.topology.links.map((link) => ({ ...link, highlighted: true }));
    const switches = getMatchedDevices(flow)
      .map((node) => ({ ...node, point: positions[node.id] }))
      .filter((node) => node.point)
      .sort((left, right) => left.point.y - right.point.y || left.point.x - right.point.x);
    const topSwitch = switches[0];

    if (topSwitch) {
      const topGhostId = `${topSwitch.id}-ctx-top`;
      positions[topGhostId] = {
        x: Math.max(90, topSwitch.point.x - 330),
        y: topSwitch.point.y,
        displayLabel: createSiblingLabel(topSwitch.label, -1, 'spine-1')
      };
      nodes.push({ id: topGhostId, label: positions[topGhostId].displayLabel, type: 'switch', status: 'muted', muted: true });
    }

    switches
      .filter((node) => node.id !== topSwitch?.id)
      .forEach((node, index) => {
        const direction = node.point.x < width / 2 ? -1 : 1;
        const siblingCount = direction > 0 ? 2 : 1;

        Array.from({ length: siblingCount }).forEach((_, siblingIndex) => {
          const ghostId = `${node.id}-ctx-${siblingIndex}`;
          const offset = 120 * (siblingIndex + 1) * direction;
          const ghostLabel = createSiblingLabel(node.label, siblingIndex + 1, 'leaf-1');
          positions[ghostId] = {
            x: Math.min(width - 90, Math.max(90, node.point.x + offset)),
            y: node.point.y,
            displayLabel: ghostLabel
          };
          nodes.push({ id: ghostId, label: ghostLabel, type: 'switch', status: 'muted', muted: true });

          if (topSwitch) {
            links.push({ from: topSwitch.id, to: ghostId, severity: 'normal', metrics: '', muted: true });
          }

          const hostId = `${ghostId}-host`;
          const hostLabel = `server-${18 + index * 6 + siblingIndex * 2}`;
          positions[hostId] = {
            x: positions[ghostId].x,
            y: 620,
            displayLabel: hostLabel
          };
          nodes.push({ id: hostId, label: hostLabel, type: 'server', status: 'muted', muted: true });
          links.push({ from: ghostId, to: hostId, severity: 'normal', metrics: '', muted: true });
        });
      });

    return { width, height, nodes, links, positions };
  }

  function renderDeviceTrafficTopology(flow, deviceId) {
    const pathNodeIds = getPathNodeIds(flow);
    const selectedIndex = pathNodeIds.indexOf(deviceId);
    const selectedNode = getNodeById(flow, deviceId);

    if (!selectedNode || selectedIndex === -1) {
      renderPrimaryTopology(flow);
      return;
    }

    const previousNode = getNodeById(flow, pathNodeIds[selectedIndex - 1]);
    const nextNode = getNodeById(flow, pathNodeIds[selectedIndex + 1]);
    const sourceNode = getNodeById(flow, pathNodeIds[0]);
    const destinationNode = getNodeById(flow, pathNodeIds[pathNodeIds.length - 1]);
    const upperActual = [previousNode, nextNode].find((node) => node && node.type !== 'server') || nextNode || previousNode;
    const lowerActual = [previousNode, nextNode].find((node) => node && node.type === 'server') || previousNode || nextNode;
    const upperMutedLabel = `other ${inferRelatedLabel(upperActual, 'spine')}`;
    const lowerMutedLabel = `other ${inferRelatedLabel(lowerActual, 'server')}`;
    const destinationBranch = destinationNode && ![selectedNode.id, upperActual?.id, lowerActual?.id].includes(destinationNode.id) ? destinationNode : null;

    refs.topologyContainer.innerHTML = `
      <svg viewBox="0 0 1240 720" class="topology-svg topology-svg-device" role="img" aria-label="${t('topologyAria')}">
        <path d="M 505 348 C 495 248, 385 188, 318 156" class="traffic-ribbon traffic-ribbon-egress is-muted" />
        <path d="M 565 348 C 594 248, 704 190, 790 156" class="traffic-ribbon traffic-ribbon-egress" />
        <path d="M 505 370 C 492 456, 402 510, 316 602" class="traffic-ribbon traffic-ribbon-ingress is-muted" />
        <path d="M 565 370 C 588 452, 676 516, 806 602" class="traffic-ribbon traffic-ribbon-ingress" />
        ${destinationBranch ? `<path d="M 804 156 C 948 228, 1046 290, 1088 488" class="traffic-ribbon traffic-ribbon-branch" />` : ''}

        ${renderTrafficNode({ x: 208, y: 118, label: upperMutedLabel, type: upperActual?.type || 'switch', muted: true })}
        ${renderTrafficNode({ x: 680, y: 118, label: String(upperActual?.label || createSiblingLabel(selectedNode.label, 1)).toLowerCase(), type: upperActual?.type || 'switch', status: upperActual?.status || 'normal' })}
        ${renderTrafficNode({ x: 470, y: 322, label: String(selectedNode.label).toLowerCase(), type: selectedNode.type, status: selectedNode.status || 'normal', emphasized: true })}
        ${renderTrafficNode({ x: 200, y: 566, label: lowerMutedLabel, type: lowerActual?.type || 'server', muted: true })}
        ${renderTrafficNode({ x: 626, y: 560, label: String((lowerActual || sourceNode)?.label || '').toLowerCase(), type: (lowerActual || sourceNode)?.type || 'server', status: (lowerActual || sourceNode)?.status || 'normal', badge: (lowerActual || sourceNode)?.id === sourceNode?.id ? t('sourceBadge') : (lowerActual || sourceNode)?.id === destinationNode?.id ? t('destinationBadge') : '' })}
        ${destinationBranch ? renderTrafficNode({ x: 1038, y: 536, label: String(destinationBranch.label).toLowerCase(), type: destinationBranch.type, muted: true, badge: destinationBranch.id === destinationNode?.id ? t('destinationBadge') : '' }) : ''}
      </svg>
    `;
  }

  function renderTrafficNode({ x, y, label, type, status = 'normal', muted = false, emphasized = false, badge = '' }) {
    const width = Math.max(176, String(label || '').length * 12 + 90);
    const height = 62;
    const iconRadius = 22;
    const icon = type === 'server' ? '▭' : '◫';
    const statusClass = muted ? 'is-muted' : `is-${status}`;
    return `
      <g class="traffic-node ${statusClass} ${emphasized ? 'is-emphasized' : ''}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="31" class="traffic-node-shell"></rect>
        <circle cx="${x + 34}" cy="${y + height / 2}" r="${iconRadius}" class="traffic-node-icon-circle"></circle>
        <text x="${x + 34}" y="${y + height / 2 + 6}" text-anchor="middle" class="traffic-node-icon">${icon}</text>
        <text x="${x + 70}" y="${y + 38}" class="traffic-node-label">${label}</text>
        ${badge ? `<text x="${x + width - 40}" y="${y + 38}" text-anchor="middle" class="traffic-node-badge">${badge}</text>` : ''}
      </g>
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
    if (!container) {
      return;
    }

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
    CHART_DEFS.forEach(({ key, color, detailRef }) => {
      renderChart(refs[detailRef], flow.trends[key], color);
    });
  }

  function roundTrendValue(metricKey, value) {
    if (metricKey === 'latency' || metricKey === 'loss' || metricKey === 'pfc') {
      return Math.round(value);
    }
    return Number(value.toFixed(1));
  }

  function getOverallTrend(metricKey) {
    if (!state.filteredFlows.length) {
      return data.overallTrends?.[metricKey] || null;
    }

    const sourceTrends = state.filteredFlows
      .map((flow) => flow.trends?.[metricKey])
      .filter((trend) => hasItems(trend?.values));

    if (!sourceTrends.length) {
      return data.overallTrends?.[metricKey] || null;
    }

    const maxLength = Math.max(...sourceTrends.map((trend) => trend.values.length));
    const alerts = new Set();
    const values = Array.from({ length: maxLength }, (_, index) => {
      const points = sourceTrends.map((trend) => trend.values[Math.min(index, trend.values.length - 1)]);
      sourceTrends.forEach((trend) => {
        if (Array.isArray(trend.alerts) && trend.alerts.includes(index)) {
          alerts.add(index);
        }
      });

      const total = points.reduce((sum, point) => sum + Number(point || 0), 0);
      const aggregated = SUM_AGGREGATE_KEYS.has(metricKey) ? total : total / Math.max(points.length, 1);
      return roundTrendValue(metricKey, aggregated);
    });

    return {
      unit: sourceTrends[0].unit,
      values,
      alerts: Array.from(alerts)
    };
  }

  function renderOverallTrends() {
    CHART_DEFS.forEach(({ key, color, overallRef }) => {
      renderChart(refs[overallRef], getOverallTrend(key), color);
    });
  }

  function renderAlarms(flow) {
    const groups = flow.alarmHeatmap?.groups || [];
    const activeGroup = groups.find((group) => group.id === state.activeHeatmapGroupId) || groups[0];
    const slots = flow.alarmHeatmap?.slots || [];
    const dateLabel = flow.alarmHeatmap?.dateLabel || String(flow.lastActive || '').split(' ')[0];

    if (!activeGroup || !hasItems(activeGroup.rows)) {
      refs.alarmList.innerHTML = `<div class="empty-state">${t('noData')}</div>`;
      return;
    }

    refs.alarmList.innerHTML = `
      <div class="heatmap-tabs">
        ${groups
          .map(
            (group) => `
              <button class="heatmap-tab ${group.id === activeGroup.id ? 'active' : ''}" type="button" data-heatmap-group="${group.id}">
                ${group.label}
                <span class="heatmap-tab-count">${group.rows.length}</span>
              </button>
            `
          )
          .join('')}
      </div>
      <div class="heatmap-board">
        <div class="heatmap-board-header">
          <div class="heatmap-board-date">
            <span>${t('heatmapDateLabel')}</span>
            <strong>${dateLabel}</strong>
          </div>
          <div class="heatmap-board-axis">
            <span>${t('heatmapTimeAxis')}</span>
          </div>
        </div>
        <div class="heatmap-grid-shell">
          <div class="heatmap-grid-header">
            <div class="heatmap-row-label heatmap-row-label-header">${activeGroup.label}</div>
            <div class="heatmap-slot-track">
              ${slots.map((slot) => `<span class="heatmap-slot-label">${slot}</span>`).join('')}
            </div>
          </div>
          <div class="heatmap-grid-body">
            ${activeGroup.rows
              .map(
                (row) => `
                  <div class="heatmap-row">
                    <div class="heatmap-row-label">
                      <span class="heatmap-row-accent ${row.accent || 'normal'}"></span>
                      <span>${row.name}</span>
                    </div>
                    <div class="heatmap-cell-track">
                      ${row.cells
                        .map(
                          (cell) => `
                            <span class="heatmap-cell ${cell.level}" title="${row.name} / ${cell.slot}：${cell.text}"></span>
                          `
                        )
                        .join('')}
                    </div>
                  </div>
                `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  function refresh(closeDrawerIfEmpty = true) {
    applyFilters();
    renderOverallTrends();
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
      refs.dstPortFilter.value = '';
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

    refs.flowTableBody.addEventListener('click', (event) => {
      const detailButton = event.target.closest('[data-open-detail]');
      const diagnosisButton = event.target.closest('[data-run-diagnosis]');
      if (detailButton) {
        openDetailDrawer(detailButton.dataset.openDetail);
      }
      if (diagnosisButton) {
        navigateToDiagnosis(diagnosisButton.dataset.runDiagnosis);
      }
    });

    refs.matchedDeviceList.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-device-toggle]');
      if (!toggle || !state.selectedFlowId) {
        return;
      }

      const deviceId = toggle.dataset.deviceToggle;
      const isExpanded = state.expandedDeviceIds.includes(deviceId);
      state.expandedDeviceIds = isExpanded ? state.expandedDeviceIds.filter((id) => id !== deviceId) : [...state.expandedDeviceIds, deviceId];
      state.focusedDeviceId = isExpanded ? null : deviceId;
      state.topologyMode = isExpanded ? 'default' : 'device';

      const flow = getFlowById(state.selectedFlowId);
      if (flow) {
        renderMatchedDevices(flow);
        renderTopology(flow);
      }
    });

    refs.alarmList.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-heatmap-group]');
      if (!trigger || !state.selectedFlowId) {
        return;
      }

      state.activeHeatmapGroupId = trigger.dataset.heatmapGroup;
      const flow = getFlowById(state.selectedFlowId);
      if (flow) {
        renderAlarms(flow);
      }
    });

    refs.viewInTopologyBtn.addEventListener('click', () => {
      if (!state.selectedFlowId) {
        return;
      }
      state.topologyMode = 'path';
      state.focusedDeviceId = null;
      const flow = getFlowById(state.selectedFlowId);
      if (flow) {
        renderMatchedDevices(flow);
        renderTopology(flow);
      }
    });

    refs.drawerBackdrop.addEventListener('click', closeDetailDrawer);
    refs.drawerDiagnosisBtn.addEventListener('click', () => {
      if (!state.selectedFlowId) {
        return;
      }
      navigateToDiagnosis(state.selectedFlowId);
    });

    refs.detailTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tab]');
      if (!button) {
        return;
      }
      activateTab(button.dataset.tab);
    });

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('.info-trigger');
      if (trigger) {
        const anchor = trigger.closest('.info-anchor');
        const shouldOpen = !anchor.classList.contains('is-open');
        closeInfoAnchors(anchor);
        anchor.classList.toggle('is-open', shouldOpen);
        trigger.setAttribute('aria-expanded', String(shouldOpen));
        return;
      }

      if (!event.target.closest('.info-anchor')) {
        closeInfoAnchors();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (document.querySelector('.info-anchor.is-open')) {
          closeInfoAnchors();
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
    setRangeByPreset(DEFAULT_PRESET, false);
    bindEvents();
    refresh();
  }

  init();
})();
