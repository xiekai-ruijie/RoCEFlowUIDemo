(() => {
  const data = window.ROCE_MOCK_DATA;
  const DIAGNOSIS_PAGE_PATH = './fault-diagnosis.html';
  const CHART_DEFS = [
    { key: 'throughput', color: '#53d3ff', ref: 'throughputChart' },
    { key: 'latency', color: '#7c9cff', ref: 'latencyChart' },
    { key: 'jitter', color: '#ffb545', ref: 'jitterChart' },
    { key: 'loss', color: '#ff6b6b', ref: 'lossChart' },
    { key: 'pfc', color: '#4f8cff', ref: 'pfcChart' },
    { key: 'ecn', color: '#8b5cf6', ref: 'ecnChart' }
  ];

  const refs = {
    layout: document.getElementById('flowDetailLayout'),
    detailTitle: document.getElementById('detailTitle'),
    flowSnapshotCard: document.getElementById('flowSnapshotCard'),
    pathVariantSwitcher: document.getElementById('pathVariantSwitcher'),
    matchedDeviceCount: document.getElementById('matchedDeviceCount'),
    matchedDeviceList: document.getElementById('matchedDeviceList'),
    topologyContainer: document.getElementById('topologyContainer'),
    topologyViewHint: document.getElementById('topologyViewHint'),
    topologySourceIndicator: document.getElementById('topologySourceIndicator'),
    selectionStatusChip: document.getElementById('selectionStatusChip'),
    trendScopeHint: document.getElementById('trendScopeHint'),
    heatmapScopeHint: document.getElementById('heatmapScopeHint'),
    viewInTopologyBtn: document.getElementById('viewInTopologyBtn'),
    clearSelectionBtn: document.getElementById('clearSelectionBtn'),
    detailDiagnosisBtn: document.getElementById('detailDiagnosisBtn'),
    alarmList: document.getElementById('alarmList'),
    throughputChart: document.getElementById('throughputChart'),
    latencyChart: document.getElementById('latencyChart'),
    jitterChart: document.getElementById('jitterChart'),
    lossChart: document.getElementById('lossChart'),
    pfcChart: document.getElementById('pfcChart'),
    ecnChart: document.getElementById('ecnChart'),
    drilldownOverlay: document.getElementById('drilldownOverlay'),
    drilldownPanel: document.getElementById('drilldownPanel'),
    drilldownClose: document.getElementById('drilldownClose'),
    drilldownTitle: document.getElementById('drilldownTitle'),
    drilldownSubtitle: document.getElementById('drilldownSubtitle'),
    drilldownTimeTrack: document.getElementById('drilldownTimeTrack'),
    drilldownMetrics: document.getElementById('drilldownMetrics'),
    drilldownTabs: document.getElementById('drilldownTabs'),
    drilldownTabPanels: document.getElementById('drilldownTabPanels'),
    drilldownModalLayer: document.getElementById('drilldownModalLayer')
  };

  const state = {
    flow: null,
    currentPathVariant: 'ailb',
    selectedEntityKey: 'all',
    expandedDeviceIds: [],
    topologyMode: 'default',
    focusedDeviceId: null,
    drilldown: {
      open: false,
      entityKey: null,
      rowLabel: null,
      rowCells: null,
      slotIndex: null,
      activeTab: 0,
      activePort: {},
      activeBucket: {},
      queueLengthExpanded: false,
      latencyModalOpen: false,
      latencyModalRowIndex: null
    }
  };

  function hasItems(list) {
    return Array.isArray(list) && list.length > 0;
  }

  function parseTime(value) {
    const timestamp = Date.parse(String(value || '').replace(' ', 'T'));
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function getFlowById(flowId) {
    return (data?.flows || []).find((flow) => flow.id === flowId) || null;
  }

  function getSelectedFlow() {
    if (!state.flow) {
      return null;
    }
    return state.flow.pathVariants?.[state.currentPathVariant] || state.flow;
  }

  function getAvailablePathVariants(flow) {
    return flow?.pathVariants ? Object.keys(flow.pathVariants) : ['ailb'];
  }

  function getPathVariantMeta(variantKey) {
    if (variantKey === 'fallback') {
      return {
        label: 'Fallback ECMP备选路径',
        shortLabel: 'Fallback',
        badgeClass: 'badge-source-fallback',
        chipClass: 'is-fallback',
        indicatorClass: 'is-fallback'
      };
    }
    return {
      label: 'AILB推算路径',
      shortLabel: 'AILB',
      badgeClass: 'badge-source-ailb',
      chipClass: 'is-ailb',
      indicatorClass: 'is-ailb'
    };
  }

  function ensureSelectionValid(flow) {
    if (!flow?.detailView?.entityLabels) {
      state.selectedEntityKey = 'all';
      state.focusedDeviceId = null;
      state.topologyMode = 'default';
      return;
    }
    if (state.selectedEntityKey !== 'all' && !flow.detailView.entityLabels[state.selectedEntityKey]) {
      state.selectedEntityKey = 'all';
      state.focusedDeviceId = null;
      state.topologyMode = 'default';
    }
  }

  function renderPathVariantSwitcher() {
    if (!refs.pathVariantSwitcher || !state.flow) {
      return;
    }
    const variants = getAvailablePathVariants(state.flow);
    refs.pathVariantSwitcher.innerHTML = variants
      .map((variantKey) => {
        const meta = getPathVariantMeta(variantKey);
        return `<button class="path-variant-btn ${state.currentPathVariant === variantKey ? 'is-active' : ''} ${meta.chipClass}" type="button" data-path-variant="${variantKey}">${meta.label}</button>`;
      })
      .join('');
    refs.pathVariantSwitcher.classList.toggle('is-single', variants.length <= 1);
  }

  function updatePathSourceBadge(flow) {
    const pathSourceBadge = document.getElementById('detailPathSourceBadge');
    if (!pathSourceBadge || !flow) {
      return;
    }
    const meta = getPathVariantMeta(state.currentPathVariant);
    pathSourceBadge.textContent = meta.label;
    pathSourceBadge.className = `badge-path-source ${meta.badgeClass}`;
    if (refs.topologySourceIndicator) {
      refs.topologySourceIndicator.textContent = `当前路径：${meta.label}`;
      refs.topologySourceIndicator.className = `topology-source-indicator ${meta.indicatorClass}`;
    }
  }

  function refreshView() {
    const flow = getSelectedFlow();
    if (!flow) {
      return;
    }
    ensureSelectionValid(flow);
    refs.detailTitle.textContent = `流路径详情 · ${flow.summary?.pathId || flow.id}`;
    renderPathVariantSwitcher();
    updatePathSourceBadge(flow);
    renderFlowSnapshot(flow);
    renderMatchedDevices(flow);
    renderTopology(flow);
    renderCharts(flow);
    renderHeatmap(flow);
    updateSelectionCopy(flow);
    syncDrilldownWithCurrentFlow();
  }

  function switchPathVariant(variantKey) {
    if (!state.flow?.pathVariants?.[variantKey] || state.currentPathVariant === variantKey) {
      return;
    }
    state.currentPathVariant = variantKey;
    refreshView();
  }

  function getNodeById(flow, id) {
    return (flow?.topology?.nodes || []).find((node) => node.id === id) || null;
  }

  function getMatchedDevices(flow) {
    return (flow?.topology?.nodes || []).filter((node) => node.type !== 'server');
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

  function renderEmptyState(message) {
    refs.layout.innerHTML = `<section class="panel"><div class="empty-state flow-detail-empty">${message}</div></section>`;
  }

  function getQueryFlowId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('flowId');
  }

  function navigateToDiagnosis(flowId) {
    const flow = getFlowById(flowId);
    const url = new URL(DIAGNOSIS_PAGE_PATH, window.location.href);
    url.searchParams.set('action', 'new_task');
    url.searchParams.set('flowId', flowId);
    if (flow) {
      url.searchParams.set('srcIp', flow.srcIp);
      url.searchParams.set('dstIp', flow.dstIp);
    }
    window.location.href = url.toString();
  }

  function renderFlowSnapshot(flow) {
    refs.flowSnapshotCard.innerHTML = `
      <div class="flow-snapshot-card flow-snapshot-card-hero">
        <div class="snapshot-endpoints">
          <div class="snapshot-endpoint snapshot-endpoint-left">
            <div class="snapshot-ip">${flow.srcIp}</div>
            <div class="snapshot-label">源服务器</div>
            <div class="snapshot-port">${flow.srcPort}</div>
            <div class="snapshot-label">源端口</div>
          </div>
          <div class="snapshot-arrow">→</div>
          <div class="snapshot-endpoint snapshot-endpoint-right">
            <div class="snapshot-ip">${flow.dstIp}</div>
            <div class="snapshot-label">目的服务器</div>
            <div class="snapshot-port">${flow.dstPort}</div>
            <div class="snapshot-label">目的端口</div>
          </div>
        </div>
      </div>
    `;
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

  function getSelectionLabel(flow, entityKey) {
    if (!flow) {
      return '全路径聚合';
    }
    if (!entityKey || entityKey === 'all') {
      return '全路径聚合';
    }
    return flow.detailView?.entityLabels?.[entityKey] || entityKey;
  }

  function renderMatchedDevices(flow) {
    const devices = getMatchedDevices(flow);
    refs.matchedDeviceCount.textContent = `(${devices.length})`;

    if (!hasItems(devices)) {
      refs.matchedDeviceList.innerHTML = '<div class="empty-state">当前无匹配设备</div>';
      return;
    }

    refs.matchedDeviceList.innerHTML = `
      <div class="matched-device-list">
        ${devices
          .map((node, index) => {
            const detail = getResolvedDeviceDetail(node, flow, index);
            const isExpanded = state.expandedDeviceIds.includes(node.id);
            const isNodeSelected = state.selectedEntityKey === `node:${node.id}`;
            const ingressKey = `interface:${node.id}:ingress`;
            const egressKey = `interface:${node.id}:egress`;
            return `
              <div class="matched-device-card ${isExpanded ? 'expanded' : ''} ${isNodeSelected ? 'is-focused' : ''}">
                <button class="matched-device-toggle" type="button" data-device-toggle="${node.id}" aria-expanded="${isExpanded}">
                  <span class="matched-device-chevron">⌄</span>
                  <div class="matched-device-heading">
                    <div class="matched-device-name">${detail.title}</div>
                    <div class="matched-device-sub">${detail.subtitle}</div>
                  </div>
                </button>
                <div class="matched-device-panel">
                  <button class="device-interface-card interface-ingress ${state.selectedEntityKey === ingressKey ? 'is-selected' : ''}" type="button" data-interface-select="${ingressKey}" data-device-id="${node.id}">
                    <div class="device-interface-title-row">
                      <span class="device-interface-dot"></span>
                      <strong>入站接口</strong>
                    </div>
                    <div class="device-interface-grid">
                      <span>接口名称：</span>
                      <strong>${detail.ingress.interfaceName}</strong>
                      <span>数据包：</span>
                      <strong>${detail.ingress.packets}</strong>
                      <span>字节：</span>
                      <strong>${detail.ingress.bytes}</strong>
                    </div>
                  </button>
                  <button class="device-interface-card interface-egress ${state.selectedEntityKey === egressKey ? 'is-selected' : ''}" type="button" data-interface-select="${egressKey}" data-device-id="${node.id}">
                    <div class="device-interface-title-row">
                      <span class="device-interface-dot"></span>
                      <strong>出站接口</strong>
                    </div>
                    <div class="device-interface-grid">
                      <span>接口名称：</span>
                      <strong>${detail.egress.interfaceName}</strong>
                      <span>数据包：</span>
                      <strong>${detail.egress.packets}</strong>
                      <span>字节：</span>
                      <strong>${detail.egress.bytes}</strong>
                    </div>
                  </button>
                  <div class="matched-device-quick-actions">
                    <button class="btn btn-sm btn-secondary device-drilldown-btn" type="button" data-device-drilldown="${node.id}" title="直接下钻分析">🔍 下钻</button>
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
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

  function renderTopologyGraph({ width, height, nodes, links, positions, legendText, pathVariant = 'ailb' }) {
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
        const linkClasses = [`link-${link.severity || 'normal'}`, `path-variant-${link.pathVariant || pathVariant}`];
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
        const badgeText = node.role === 'source' || point.role === 'source' ? '源' : node.role === 'destination' || point.role === 'destination' ? '目的' : '';
        const icon = node.type === 'server' ? '▭' : '◫';
        const classes = ['topology-node', statusClass, `path-variant-${node.pathVariant || pathVariant}`];
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
      <svg viewBox="0 0 ${width} ${height}" class="topology-svg topology-svg-${pathVariant}" role="img" aria-label="RoCE流路径拓扑图">
        <text x="26" y="30" class="chart-label" font-size="12">${legendText}</text>
        ${linkMarkup}
        ${nodeMarkup}
      </svg>
    `;
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
      <svg viewBox="0 0 1240 720" class="topology-svg topology-svg-device" role="img" aria-label="RoCE流路径拓扑图">
        <path d="M 505 348 C 495 248, 385 188, 318 156" class="traffic-ribbon traffic-ribbon-egress is-muted" />
        <path d="M 565 348 C 594 248, 704 190, 790 156" class="traffic-ribbon traffic-ribbon-egress" />
        <path d="M 505 370 C 492 456, 402 510, 316 602" class="traffic-ribbon traffic-ribbon-ingress is-muted" />
        <path d="M 565 370 C 588 452, 676 516, 806 602" class="traffic-ribbon traffic-ribbon-ingress" />
        ${destinationBranch ? `<path d="M 804 156 C 948 228, 1046 290, 1088 488" class="traffic-ribbon traffic-ribbon-branch" />` : ''}
        ${renderTrafficNode({ x: 208, y: 118, label: upperMutedLabel, type: upperActual?.type || 'switch', muted: true })}
        ${renderTrafficNode({ x: 680, y: 118, label: String(upperActual?.label || createSiblingLabel(selectedNode.label, 1)).toLowerCase(), type: upperActual?.type || 'switch', status: upperActual?.status || 'normal' })}
        ${renderTrafficNode({ x: 470, y: 322, label: String(selectedNode.label).toLowerCase(), type: selectedNode.type, status: selectedNode.status || 'normal', emphasized: true })}
        ${renderTrafficNode({ x: 200, y: 566, label: lowerMutedLabel, type: lowerActual?.type || 'server', muted: true })}
        ${renderTrafficNode({ x: 626, y: 560, label: String((lowerActual || sourceNode)?.label || '').toLowerCase(), type: (lowerActual || sourceNode)?.type || 'server', status: (lowerActual || sourceNode)?.status || 'normal', badge: (lowerActual || sourceNode)?.id === sourceNode?.id ? '源' : (lowerActual || sourceNode)?.id === destinationNode?.id ? '目的' : '' })}
        ${destinationBranch ? renderTrafficNode({ x: 1038, y: 536, label: String(destinationBranch.label).toLowerCase(), type: destinationBranch.type, muted: true, badge: destinationBranch.id === destinationNode?.id ? '目的' : '' }) : ''}
      </svg>
    `;
  }

  function renderPrimaryTopology(flow) {
    const width = 900;
    const height = 620;
    const positions = calculateTopologyLayout(flow.topology.nodes);
    refs.topologyContainer.innerHTML = renderTopologyGraph({
      width,
      height,
      nodes: flow.topology.nodes,
      links: flow.topology.links,
      positions,
      legendText: '红色链路表示高风险段',
      pathVariant: flow.variantKey || state.currentPathVariant
    });
  }

  function renderPathFocusTopology(flow) {
    const topology = createPathFocusTopology(flow);
    refs.topologyContainer.innerHTML = renderTopologyGraph({
      width: topology.width,
      height: topology.height,
      nodes: topology.nodes,
      links: topology.links,
      positions: topology.positions,
      legendText: '当前展示拓扑上下文中的主路径',
      pathVariant: flow.variantKey || state.currentPathVariant
    });
  }

  function updateTopologyHint(flow) {
    let hintText = '当前展示主路径概览';
    const meta = getPathVariantMeta(flow?.variantKey || state.currentPathVariant);
    if (state.topologyMode === 'path') {
      hintText = `当前展示${meta.shortLabel}路径上下文 · ${flow.srcIp} → ${flow.dstIp}`;
    } else if (state.topologyMode === 'device' && state.focusedDeviceId) {
      const node = getNodeById(flow, state.focusedDeviceId);
      hintText = `当前展示${meta.shortLabel}路径设备接口相关流量 · ${node?.label || state.focusedDeviceId}`;
    } else {
      hintText = `当前展示${meta.shortLabel}路径主拓扑概览`;
    }
    refs.topologyViewHint.textContent = hintText;
    refs.viewInTopologyBtn.classList.toggle('is-active', state.topologyMode === 'path');
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

  function renderVerticalAxisLabel(unit, height) {
    const chars = String(unit).split('');
    const startY = height / 2 - ((chars.length - 1) * 14) / 2;
    return chars.map((char, index) => `<tspan x="18" y="${startY + index * 14}">${char}</tspan>`).join('');
  }

  function renderChart(container, trend, strokeColor) {
    if (!container) {
      return;
    }
    if (!hasItems(trend?.values)) {
      container.innerHTML = '<div class="empty-state">暂无趋势数据</div>';
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
              const isAlert = Array.isArray(trend.alerts) && trend.alerts.includes(point.index);
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
    const metrics = flow.detailView?.selectionMetrics?.[state.selectedEntityKey] || flow.detailView?.selectionMetrics?.all || flow.trends;
    CHART_DEFS.forEach(({ key, color, ref }) => {
      renderChart(refs[ref], metrics[key], color);
    });
  }

  function renderHeatmap(flow) {
    const slots = flow.alarmHeatmap?.slots || [];
    const dateLabel = flow.alarmHeatmap?.dateLabel || String(flow.lastActive || '').split(' ')[0];
    const rows = flow.detailView?.orderedRows || [];
    const activeKeys = new Set(flow.detailView?.highlightMap?.[state.selectedEntityKey] || flow.detailView?.highlightMap?.all || rows.map((row) => row.entityKey));
    const slotStyle = `--heatmap-slot-count:${slots.length}`;

    if (!hasItems(rows)) {
      refs.alarmList.innerHTML = '<div class="empty-state">暂无热力图数据</div>';
      return;
    }

    refs.alarmList.innerHTML = `
      <div class="heatmap-board heatmap-board-ordered heatmap-board-${flow.variantKey || state.currentPathVariant}" style="${slotStyle}">
        <div class="heatmap-board-header">
          <div class="heatmap-board-date">
            <span>观测日期</span>
            <strong>${dateLabel}</strong>
          </div>
          <div class="heatmap-board-axis">
            <span>时间轴</span>
          </div>
        </div>
        <div class="heatmap-grid-shell">
          <div class="heatmap-grid-header heatmap-grid-header-ordered">
            <div class="heatmap-row-label heatmap-row-label-header">路径角色 / 对象</div>
            <div class="heatmap-slot-track heatmap-slot-track-fixed">
              ${slots
                .map((slot, index) => `<span class="heatmap-slot-label ${index % 2 === 1 ? 'is-half-hour' : ''}">${index % 2 === 0 ? slot : ''}</span>`)
                .join('')}
            </div>
          </div>
          <div class="heatmap-grid-body heatmap-grid-body-ordered">
            ${rows
              .map((row) => {
                const isActive = state.selectedEntityKey === 'all' || activeKeys.has(row.entityKey);
                return `
                  <div class="heatmap-row heatmap-row-ordered ${isActive ? 'is-highlighted' : 'is-dimmed'} level-${row.level}">
                    <div class="heatmap-row-label heatmap-row-label-ordered">
                      <span class="heatmap-row-accent ${row.accent || 'normal'}"></span>
                      <div class="heatmap-row-copy">
                        <strong>${row.label}</strong>
                        <span>${row.meta || ''}</span>
                      </div>
                    </div>
                    <div class="heatmap-cell-track heatmap-cell-track-fixed">
                      ${(row.cells || [])
                        .map((cell, slotIndex) => `<button
                          class="heatmap-cell ${cell.level}"
                          type="button"
                          title="${row.label} / ${cell.slot}：${cell.text}"
                          data-slot="${cell.slot}"
                          data-slot-index="${slotIndex}"
                          data-entity-key="${row.entityKey}"
                          data-row-label="${row.label}"
                          data-level="${cell.level}"
                        ></button>`)
                        .join('')}
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  function updateSelectionCopy(flow) {
    const label = getSelectionLabel(flow, state.selectedEntityKey);
    const variantMeta = getPathVariantMeta(flow?.variantKey || state.currentPathVariant);
    const isAILB = (flow.variantKey || state.currentPathVariant) === 'ailb';
    const sourceHint = isAILB ? '（设备级指标，非流级）' : '';
    refs.selectionStatusChip.textContent = `当前展示：${variantMeta.shortLabel}路径 · ${label}`;
    refs.selectionStatusChip.className = `selection-status-chip ${variantMeta.chipClass}`;
    refs.trendScopeHint.textContent = state.selectedEntityKey === 'all'
      ? `未选择设备/接口时展示${variantMeta.label}全路径趋势${sourceHint}`
      : `当前仅展示 ${variantMeta.label}下 ${label} 相关指标趋势${sourceHint}`;
    refs.heatmapScopeHint.textContent = state.selectedEntityKey === 'all'
      ? `路径设备告警热力图 — ${variantMeta.shortLabel}全路径视角`
      : `路径设备告警热力图 — ${variantMeta.shortLabel} / ${label} 视角`;
  }

  function updateSelection(selectionKey, options = {}) {
    const flow = getSelectedFlow();
    if (!flow) {
      return;
    }
    state.selectedEntityKey = selectionKey || 'all';
    if (options.deviceId) {
      state.focusedDeviceId = options.deviceId;
      state.topologyMode = 'device';
      state.expandedDeviceIds = Array.from(new Set([...state.expandedDeviceIds, options.deviceId]));
    } else if (state.selectedEntityKey === 'all') {
      state.focusedDeviceId = null;
      state.topologyMode = 'default';
    }
    renderMatchedDevices(flow);
    renderTopology(flow);
    renderCharts(flow);
    renderHeatmap(flow);
    updateSelectionCopy(flow);
    syncDrilldownWithCurrentFlow();
  }

  const DRILLDOWN_TABS = [
    { key: 'portDown', label: '端口异常Down' },
    { key: 'pfc', label: 'PFC告警' },
    { key: 'queueLength', label: '队列长度超限' },
    { key: 'queueDelay', label: '队列时延超限' }
  ];

  const DRILLDOWN_METRICS_CONFIG = [
    { key: 'lossPercent', label: '丢包数量', unit: '%', color: '#4ef4ba', meta: '最新采样点', foot: '阈值：3%' },
    { key: 'ecnPackets', label: 'ECN报文数', unit: '个', color: '#4ef4ba', foot: '阈值：10' },
    { key: 'pfcTriggerCount', label: 'PFC触发次数', unit: '个', color: '#4ef4ba', foot: '正常范围：< 10' },
    { key: 'queueDelayValue', label: '时延数据', unit: 'μs', color: '#4ef4ba', foot: '正常范围：< 10' }
  ];

  const DRILLDOWN_PORT_COLORS = {
    'GiO/1': '#1d6bff',
    'GiO/2': '#ff8b14',
    'GiO/3': '#ffed57',
    'GiO/4': '#12d3a7',
    'GiO/5': '#ff5a1f',
    'Eth1/1': '#1d6bff',
    'Eth1/2': '#ff8b14',
    'Eth1/3': '#ffed57',
    'Eth1/4': '#12d3a7',
    'Eth1/5': '#ff5a1f'
  };

  function getDrillData(flow, slot) {
    return (flow.drillDown && flow.drillDown[slot]) || null;
  }

  function renderDrilldownTimeNav(cells, activeSlotIndex) {
    refs.drilldownTimeTrack.innerHTML = (cells || [])
      .map((cell, idx) => `<button
        class="drilldown-time-slot ${cell.level} ${idx === activeSlotIndex ? 'is-active' : ''}"
        type="button"
        title="${cell.slot}"
        data-dd-slot-index="${idx}"
      ><span class="drilldown-time-slot-dot"></span>${cell.slot}</button>`)
      .join('');
  }

  function renderDrilldownMetrics(drillData) {
    if (!drillData) {
      refs.drilldownMetrics.innerHTML = '';
      return;
    }
    const metrics = drillData.metrics || {};
    refs.drilldownMetrics.innerHTML = DRILLDOWN_METRICS_CONFIG
      .map((cfg) => {
        const val = metrics[cfg.key] != null ? metrics[cfg.key] : '—';
        return `
          <div class="drilldown-metric-card">
            <div class="drilldown-metric-label">${cfg.label}</div>
            <div class="drilldown-metric-value" style="color:${cfg.color}">${val}<span class="drilldown-metric-unit">${cfg.unit}</span>${cfg.meta ? `<span class="drilldown-metric-meta">${cfg.meta}</span>` : ''}</div>
            <div class="drilldown-metric-foot">${cfg.foot || ''}</div>
          </div>
        `;
      })
      .join('');
  }

  function closeLatencyModal() {
    state.drilldown.latencyModalOpen = false;
    state.drilldown.latencyModalRowIndex = null;
    refs.drilldownModalLayer.innerHTML = '';
  }

  function getChartColor(port, fallbackIndex) {
    const fallback = ['#1d6bff', '#ff8b14', '#ffed57', '#12d3a7', '#ff5a1f', '#8b5cf6', '#53d3ff'];
    return DRILLDOWN_PORT_COLORS[port] || fallback[fallbackIndex % fallback.length];
  }

  function renderSimpleTrendCard(chart) {
    const values = chart.series?.[0]?.values || [];
    const labels = chart.labels || [];
    const color = chart.series?.[0]?.color || '#1d6bff';
    if (!values.length) {
      return '<div class="empty-state">暂无数据</div>';
    }
    const width = 520;
    const height = 200;
    const leftPad = 16;
    const rightPad = 8;
    const topPad = 18;
    const bottomPad = 28;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const points = values.map((value, index) => {
      const x = leftPad + (index * (width - leftPad - rightPad)) / Math.max(values.length - 1, 1);
      const y = height - bottomPad - ((value - min) / range) * (height - topPad - bottomPad);
      return { x, y };
    });
    const pointLine = points.map((point) => `${point.x},${point.y}`).join(' ');
    const yLines = Array.from({ length: 4 }, (_, index) => {
      const y = topPad + ((height - topPad - bottomPad) / 3) * index;
      return `<line x1="${leftPad}" y1="${y}" x2="${width - rightPad}" y2="${y}" stroke="rgba(58,124,214,0.55)" stroke-dasharray="4 6" />`;
    }).join('');
    const xLabels = labels.map((label, index) => {
      if (!(index === 0 || index === labels.length - 1 || index % 2 === 0)) return '';
      const point = points[index];
      return `<text x="${point.x}" y="${height - 8}" class="drilldown-axis-text" text-anchor="middle">${label}</text>`;
    }).join('');
    return `
      <div class="drilldown-reference-card">
        <div class="drilldown-reference-card-title">${chart.title}</div>
        <svg viewBox="0 0 ${width} ${height}" class="drilldown-reference-svg">
          ${yLines}
          <polyline points="${pointLine}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"></polyline>
          ${xLabels}
        </svg>
      </div>
    `;
  }

  function renderPfcPanel(drillData) {
    return `
      <div class="drilldown-reference-layout drilldown-pfc-layout">
        <div class="drilldown-chart-grid">
          ${(drillData.pfcCharts || []).map((chart) => renderSimpleTrendCard(chart)).join('')}
        </div>
      </div>
    `;
  }

  function renderQueuePortList(ports, tabKey) {
    const activePort = state.drilldown.activePort[tabKey] || null;
    return `
      <div class="drilldown-port-side-list">
        <div class="drilldown-port-side-title">告警端口</div>
        <div class="drilldown-port-side-subtitle">单次最多可选5个端口展示</div>
        <div class="drilldown-port-side-items">
          ${(ports || []).map((item) => `
            <button class="drilldown-side-port-btn ${(activePort ? activePort === item.port : item.active) ? 'is-active' : ''}" data-dd-port="${item.port}" data-dd-tab="${tabKey}">${item.port}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderReferenceLegend(legend) {
    return `
      <div class="drilldown-reference-legend">
        ${(legend || []).map((item) => `
          <span class="drilldown-reference-legend-item">
            <span class="drilldown-reference-legend-swatch ${item.point ? 'is-point' : ''}" style="--legend-color:${item.color}"></span>${item.port}
          </span>
        `).join('')}
      </div>
    `;
  }

  function buildMultiSeriesSvg(chart, selectedPorts, options = {}) {
    const width = options.width || 720;
    const height = options.height || 360;
    const leftPad = 40;
    const rightPad = 20;
    const topPad = 24;
    const bottomPad = 44;
    const labels = chart.labels || [];
    const ports = selectedPorts?.length ? selectedPorts : Object.keys(chart.series || {});
    const getSeriesValues = (port) => {
      const entry = chart.series?.[port];
      if (Array.isArray(entry)) {
        return entry;
      }
      return entry?.values || [];
    };
    const allValues = ports.flatMap((port) => getSeriesValues(port));
    const max = Math.max(...allValues, 1);
    const min = Math.min(...allValues, 0);
    const range = max - min || 1;
    const yLines = Array.from({ length: 5 }, (_, index) => {
      const y = topPad + ((height - topPad - bottomPad) / 4) * index;
      return `<line x1="${leftPad}" y1="${y}" x2="${width - rightPad}" y2="${y}" stroke="rgba(58,124,214,0.55)" stroke-dasharray="4 6" />`;
    }).join('');
    const xTicks = labels.map((label, index) => {
      const x = leftPad + (index * (width - leftPad - rightPad)) / Math.max(labels.length - 1, 1);
      return `
        <line x1="${x}" y1="${height - bottomPad}" x2="${x}" y2="${height - bottomPad + 10}" stroke="rgba(129,148,181,0.35)" />
        ${index % 2 === 0 || index === labels.length - 1 ? `<text x="${x}" y="${height - 12}" class="drilldown-axis-text" text-anchor="middle">${label}</text>` : ''}
      `;
    }).join('');
    const paths = ports.map((port, portIndex) => {
      const values = getSeriesValues(port);
      const points = values.map((value, index) => {
        const x = leftPad + (index * (width - leftPad - rightPad)) / Math.max(values.length - 1, 1);
        const y = height - bottomPad - ((value - min) / range) * (height - topPad - bottomPad);
        return { x, y };
      });
      const color = getChartColor(port, portIndex);
      const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
      return `<polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></polyline>`;
    }).join('');
    const band = chart.highlightRange ? (() => {
      const x1 = leftPad + (chart.highlightRange.start * (width - leftPad - rightPad)) / Math.max(labels.length - 1, 1);
      const x2 = leftPad + (chart.highlightRange.end * (width - leftPad - rightPad)) / Math.max(labels.length - 1, 1);
      return `
        <rect x="${x1}" y="${topPad}" width="${Math.max(14, x2 - x1)}" height="${height - topPad - bottomPad}" fill="rgba(29,107,255,0.28)"></rect>
        <text x="${x1 + 4}" y="${topPad - 6}" class="drilldown-band-label">${chart.highlightRange.label}</text>
      `;
    })() : '';
    const refLine = chart.referenceLine ? (() => {
      const x = leftPad + (chart.referenceLine.index * (width - leftPad - rightPad)) / Math.max(labels.length - 1, 1);
      return `<line x1="${x}" y1="${topPad}" x2="${x}" y2="${height - bottomPad}" stroke="rgba(255,255,255,0.6)" />`;
    })() : '';
    const tooltip = chart.tooltip ? (() => {
      const tooltipX = leftPad + ((chart.referenceLine?.index || 8) * (width - leftPad - rightPad)) / Math.max(labels.length - 1, 1) + 16;
      const tooltipY = topPad + 44;
      return `
        <foreignObject x="${tooltipX}" y="${tooltipY}" width="150" height="160">
          <div xmlns="http://www.w3.org/1999/xhtml" class="drilldown-chart-tooltip">
            <div class="drilldown-chart-tooltip-title">${chart.tooltip.title}</div>
            <div class="drilldown-chart-tooltip-time">${chart.tooltip.time}</div>
            ${chart.tooltip.values.map((item, index) => `<div class="drilldown-chart-tooltip-row"><span class="drilldown-chart-tooltip-port"><span class="drilldown-chart-tooltip-dot" style="background:${getChartColor(item.port, index)}"></span>${item.port}</span><strong>${item.value}</strong></div>`).join('')}
          </div>
        </foreignObject>
      `;
    })() : '';
    return `
      <svg viewBox="0 0 ${width} ${height}" class="drilldown-reference-svg is-large">
        <rect x="${leftPad}" y="${topPad}" width="${width - leftPad - rightPad}" height="${height - topPad - bottomPad}" fill="rgba(40,73,137,0.45)"></rect>
        ${yLines}
        ${band}
        ${paths}
        ${refLine}
        ${xTicks}
        ${tooltip}
      </svg>
    `;
  }

  function renderQueueTable(table, detailAction) {
    return `
      <div class="drilldown-table-card">
        <div class="drilldown-table-card-title">${table.title}</div>
        <table class="drilldown-reference-table">
          <thead>
            <tr>${table.columns.map((column) => `<th>${column}<span class="drilldown-sort-mark">↕</span></th>`).join('')}</tr>
          </thead>
          <tbody>
            ${(table.rows || []).map((row, rowIndex) => `
              <tr>
                ${row.map((cell, cellIndex) => {
                  const isAction = cell === '查看详情' && detailAction;
                  return `<td>${isAction ? `<button class="drilldown-detail-link" data-dd-latency-detail="${rowIndex}">${cell}</button>` : cell}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="drilldown-table-pagination">
          <button class="drilldown-page-arrow">‹</button>
          ${Array.from({ length: table.pageCount || 1 }, (_, index) => `<button class="drilldown-page-number ${index + 1 === (table.page || 1) ? 'is-active' : ''}">${index + 1}</button>`).join('')}
          <button class="drilldown-page-arrow">›</button>
        </div>
      </div>
    `;
  }

  function renderQueueMainPanel(view, tabKey) {
    const selectedPort = state.drilldown.activePort[tabKey] || null;
    const selectedPorts = selectedPort ? [selectedPort] : (view.chart.legend || []).slice(0, 5).map((item) => item.port);
    const expanded = tabKey === 'queueLength' && state.drilldown.queueLengthExpanded;
    return `
      <div class="drilldown-reference-layout drilldown-queue-layout ${expanded ? 'is-expanded' : ''}">
        <div class="drilldown-queue-header-row">
          <div class="drilldown-queue-title-block">
            <div class="drilldown-queue-title">队列长度</div>
            <div class="drilldown-zoom-controls">
              <button class="drilldown-zoom-btn" type="button" data-dd-zoom="out">−</button>
              <button class="drilldown-zoom-btn" type="button" data-dd-zoom="in">＋</button>
            </div>
          </div>
          ${renderReferenceLegend(view.chart.legend)}
        </div>
        <div class="drilldown-queue-content">
          ${renderQueuePortList(view.ports, tabKey)}
          <div class="drilldown-queue-chart-card">${buildMultiSeriesSvg(view.chart, selectedPorts, { width: expanded ? 900 : 700, height: expanded ? 480 : 420 })}</div>
          ${expanded ? renderQueueTable(view.expandedTable, false) : renderQueueTable(view.table, tabKey === 'queueDelay')}
        </div>
      </div>
    `;
  }

  function getPreferredDrillPort(view, tabKey) {
    const activePort = state.drilldown.activePort[tabKey] || null;
    if (activePort) {
      return activePort;
    }
    const defaultPort = (view?.ports || []).find((item) => item.active)?.port;
    return defaultPort || view?.records?.[0]?.port || null;
  }

  function getQueueDelayBucketState(bar, selectedBucketIndex) {
    const classes = ['queue-delay-bucket'];
    if (bar.overThreshold) {
      classes.push('is-over-threshold');
    }
    if (selectedBucketIndex === bar.index) {
      classes.push('is-active');
    }
    return classes.join(' ');
  }

  function renderQueueDelayTags(view) {
    return `
      <div class="queue-delay-tags">
        ${(view?.tags || []).map((tag) => `<span class="queue-delay-tag tone-${tag.tone || 'neutral'}">${tag.label}</span>`).join('')}
      </div>
    `;
  }

  function renderQueueDelayHistogram(view, distribution) {
    if (!distribution) {
      return '<div class="empty-state">暂无 LDH 队列分布数据</div>';
    }
    const selectedBucketIndex = state.drilldown.activeBucket.queueDelay;
    const maxCount = Math.max(...distribution.bars.map((bar) => bar.count), 1);
    return `
      <div class="queue-delay-histogram-card drilldown-reference-card">
        <div class="queue-delay-histogram-header">
          <div>
            <div class="drilldown-reference-card-title">LDH 时延分布</div>
            <div class="queue-delay-histogram-meta">阈值：>${view.thresholdUs}μs · 近似 P99：${distribution.p99BucketLabel} · 主导桶：${distribution.dominantBucketLabel}</div>
          </div>
          <button class="queue-delay-reset-btn ${selectedBucketIndex == null ? 'is-active' : ''}" type="button" data-dd-bucket-index="">全部桶</button>
        </div>
        <div class="queue-delay-bucket-grid">
          ${distribution.bars.map((bar) => `
            <button
              class="${getQueueDelayBucketState(bar, selectedBucketIndex)}"
              type="button"
              data-dd-bucket-index="${bar.index}"
              title="${bar.label} · ${bar.countLabel} 报文 · ${bar.ratio}%"
            >
              <span class="queue-delay-bucket-ratio">${bar.ratio}%</span>
              <span class="queue-delay-bucket-bar-shell"><span class="queue-delay-bucket-bar" style="height:${Math.max(10, (bar.count / maxCount) * 100)}%"></span></span>
              <span class="queue-delay-bucket-label">${bar.label}</span>
              <span class="queue-delay-bucket-count">${bar.countLabel}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function getQueueDelaySeverityClass(level) {
    return level === 'critical' ? 'critical' : level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'normal';
  }

  function getQueueDelaySeverityLabel(level) {
    return level === 'critical' ? '严重' : level === 'error' ? '错误' : level === 'warning' ? '警告' : '正常';
  }

  function renderQueueDelayInsightCards(view, record) {
    const distribution = record?.distribution;
    if (!record || !distribution) {
      return '';
    }
    const selectedBucketIndex = state.drilldown.activeBucket.queueDelay;
    const selectedBucket = selectedBucketIndex != null ? distribution.bars[selectedBucketIndex] : null;
    return `
      <div class="queue-delay-insight-grid">
        <div class="queue-delay-insight-card is-highlight">
          <div class="queue-delay-insight-label">当前聚焦端口</div>
          <div class="queue-delay-insight-value">${record.port}</div>
          <div class="queue-delay-insight-foot">${record.queueGroup} · ${record.monitorType}</div>
        </div>
        <div class="queue-delay-insight-card ${record.severity === 'critical' ? 'is-danger' : ''}">
          <div class="queue-delay-insight-label">高时延占比</div>
          <div class="queue-delay-insight-value">${record.exceedRatio}%</div>
          <div class="queue-delay-insight-foot">>${view.thresholdUs}μs 报文 ${record.exceedPackets.toLocaleString()}</div>
        </div>
        <div class="queue-delay-insight-card">
          <div class="queue-delay-insight-label">最大活跃桶</div>
          <div class="queue-delay-insight-value">${record.maxBucket}</div>
          <div class="queue-delay-insight-foot">最长持续 ${record.longestBurstSec}s</div>
        </div>
        <div class="queue-delay-insight-card ${selectedBucket ? 'is-selected' : ''}">
          <div class="queue-delay-insight-label">桶区间聚焦</div>
          <div class="queue-delay-insight-value">${selectedBucket ? selectedBucket.label : '全部桶'}</div>
          <div class="queue-delay-insight-foot">${selectedBucket ? `${selectedBucket.countLabel} / ${selectedBucket.ratio}%` : '点击柱体筛选端口明细'}</div>
        </div>
      </div>
    `;
  }

  function renderQueueDelayRecords(view, selectedPort) {
    const selectedBucketIndex = state.drilldown.activeBucket.queueDelay;
    const rows = (view?.records || []).filter((record) => !selectedPort || record.port === selectedPort || selectedBucketIndex == null);
    return `
      <div class="drilldown-table-card queue-delay-record-card">
        <div class="drilldown-table-card-title">端口 / 队列超限明细</div>
        <table class="drilldown-reference-table queue-delay-record-table">
          <thead>
            <tr>
              <th>端口</th>
              <th>队列组</th>
              <th>高时延占比</th>
              <th>${selectedBucketIndex == null ? '近似P99' : '当前桶占比'}</th>
              <th>最大活跃桶</th>
              <th>持续时长</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((record) => {
              const selectedBucket = selectedBucketIndex == null ? null : record.distribution?.bars?.[selectedBucketIndex];
              return `
                <tr class="${selectedPort === record.port ? 'is-focused' : ''}">
                  <td><strong>${record.port}</strong></td>
                  <td>${record.queueGroup}</td>
                  <td>${record.exceedRatio}%</td>
                  <td>${selectedBucket ? `${selectedBucket.ratio}%` : record.p99Bucket}</td>
                  <td>${record.maxBucket}</td>
                  <td>${record.longestBurstSec}s</td>
                  <td><span class="queue-delay-status-pill ${getQueueDelaySeverityClass(record.severity)}">${getQueueDelaySeverityLabel(record.severity)}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderQueueDelaySummary(view, record) {
    const bullets = view?.insights?.bullets || [];
    const recommendations = view?.insights?.recommendations || [];
    return `
      <div class="queue-delay-summary-card">
        <div class="queue-delay-summary-head">
          <div>
            <div class="queue-delay-summary-title">分析摘要</div>
            <p class="queue-delay-summary-desc">${view?.insights?.headline || '当前时间片内存在明显的队列长尾时延抬升。'}</p>
          </div>
          ${record ? `<span class="queue-delay-status-pill ${getQueueDelaySeverityClass(record.severity)}">${getQueueDelaySeverityLabel(record.severity)}</span>` : ''}
        </div>
        <ul class="queue-delay-summary-list">
          ${bullets.map((item) => `<li>${item}</li>`).join('')}
        </ul>
        <div class="queue-delay-summary-actions">
          ${recommendations.map((item) => `<span class="queue-delay-action-chip">${item}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function renderQueueDelayPanel(view) {
    const selectedPort = getPreferredDrillPort(view, 'queueDelay');
    const distribution = selectedPort ? view?.distributions?.[selectedPort] : null;
    const trendPorts = selectedPort ? [selectedPort] : (view?.ports || []).filter((item) => item.active).slice(0, 5).map((item) => item.port);
    const record = (view?.records || []).find((item) => item.port === selectedPort) || view?.records?.[0] || null;

    return `
      <div class="queue-delay-layout drilldown-reference-layout">
        <section class="queue-delay-hero">
          <div>
            <div class="queue-delay-title-row">
              <div class="drilldown-queue-title">${view?.title || '队列时延超限'}</div>
              ${renderQueueDelayTags(view)}
            </div>
            <p class="queue-delay-desc">${view?.description || ''}</p>
          </div>
          ${renderQueueDelayInsightCards(view, record)}
        </section>

        <section class="queue-delay-main-grid">
          ${renderQueuePortList(view?.ports, 'queueDelay')}
          <div class="queue-delay-main-content">
            ${renderQueueDelayHistogram(view, distribution)}
            <div class="queue-delay-chart-grid">
              <div class="drilldown-queue-chart-card is-standalone">
                <div class="drilldown-reference-card-title">超限占比趋势</div>
                ${buildMultiSeriesSvg(view?.exceedTrend, trendPorts, { width: 760, height: 360 })}
              </div>
              <div class="drilldown-queue-chart-card is-standalone">
                <div class="drilldown-reference-card-title">队列时延趋势</div>
                ${buildMultiSeriesSvg(view?.queueDelayTrend, trendPorts, { width: 760, height: 360 })}
              </div>
            </div>
          </div>
          <div class="queue-delay-side-column">
            ${renderQueueDelaySummary(view, record)}
            ${renderQueueDelayRecords(view, selectedPort)}
          </div>
        </section>
      </div>
    `;
  }

  function renderLatencyModal(detail) {
    if (!detail || !state.drilldown.latencyModalOpen) {
      refs.drilldownModalLayer.innerHTML = '';
      return;
    }
    const width = 1020;
    const height = 420;
    const leftPad = 70;
    const rightPad = 20;
    const topPad = 20;
    const bottomPad = 54;
    const max = Math.max(...(detail.bars || []), 1);
    const yTicks = detail.yTicks || [];
    const yLines = yTicks.map((tick) => {
      const y = height - bottomPad - ((tick - yTicks[0]) / ((yTicks[yTicks.length - 1] - yTicks[0]) || 1)) * (height - topPad - bottomPad);
      return `<g><line x1="${leftPad}" y1="${y}" x2="${width - rightPad}" y2="${y}" stroke="rgba(58,124,214,0.55)" stroke-dasharray="6 8" /><text x="${leftPad - 18}" y="${y + 6}" class="drilldown-axis-text" text-anchor="end">${tick}</text></g>`;
    }).join('');
    const bars = (detail.bars || []).map((value, index) => {
      const barWidth = 60;
      const gap = ((width - leftPad - rightPad) - barWidth * detail.bars.length) / Math.max(detail.bars.length - 1, 1);
      const x = leftPad + index * (barWidth + gap);
      const h = ((value - 0) / max) * (height - topPad - bottomPad);
      const y = height - bottomPad - h;
      return `
        <g>
          <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="30" fill="#2566f0"></rect>
          <text x="${x + barWidth / 2}" y="${height - 16}" class="drilldown-axis-text" text-anchor="middle">${detail.labels[index]}</text>
        </g>
      `;
    }).join('');
    refs.drilldownModalLayer.innerHTML = `
      <div class="drilldown-detail-modal-backdrop">
        <div class="drilldown-detail-modal">
          <div class="drilldown-detail-modal-main">
            <div class="drilldown-detail-modal-head"><h3>${detail.title}</h3><button class="drilldown-detail-close" type="button" data-dd-latency-close>×</button></div>
            <svg viewBox="0 0 ${width} ${height}" class="drilldown-reference-svg is-modal">
              ${yLines}
              ${bars}
            </svg>
          </div>
          <aside class="drilldown-detail-side-card">
            <div class="drilldown-kpi-title">${detail.cardTitle}</div>
            <div class="drilldown-kpi-value-row"><span class="drilldown-kpi-value">${detail.value}</span><span class="drilldown-kpi-unit">${detail.unit}</span></div>
            <div class="drilldown-kpi-foot">正常范围：${detail.normalRange}</div>
          </aside>
        </div>
      </div>
    `;
  }

  function renderMultiLineChart(container, trendData, activePort) {
    if (!container || !trendData) {
      return;
    }
    const { ports = [], series = {}, unit = '' } = trendData;
    const PORT_COLORS = ['#4f8cff', '#53d3ff', '#ffb545', '#ff6b6b', '#8b5cf6', '#34d399'];

    const activePorts = activePort && ports.includes(activePort) ? [activePort] : ports;

    const getPortValues = (port) => {
      const entry = series[port];
      if (!entry) return [];
      return Array.isArray(entry) ? entry : (entry.values || []);
    };

    const allValues = activePorts.flatMap((port) => getPortValues(port));
    if (!allValues.length) {
      container.innerHTML = '<div class="empty-state">暂无数据</div>';
      return;
    }

    const width = 560;
    const height = 200;
    const pad = 28;
    const leftPad = 56;
    const topPad = 28;
    const max = Math.max(...allValues, 1);
    const min = Math.min(...allValues, 0);
    const range = max - min || 1;

    const toPoint = (values) => values.map((v, i) => {
      const x = leftPad + (i * (width - leftPad - pad)) / Math.max(values.length - 1, 1);
      const y = height - pad - ((v - min) / range) * (height - topPad - pad);
      return `${x},${y}`;
    });

    const seriesMarkup = activePorts.map((port) => {
      const vals = getPortValues(port);
      const color = PORT_COLORS[ports.indexOf(port) % PORT_COLORS.length];
      const pts = toPoint(vals);
      return `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.9" />`;
    }).join('');

    const legendMarkup = activePorts.map((port) => {
      const color = PORT_COLORS[ports.indexOf(port) % PORT_COLORS.length];
      return `<span class="drilldown-chart-legend-item"><span class="drilldown-chart-legend-dot" style="background:${color}"></span>${port}</span>`;
    }).join('');

    container.innerHTML = `
      <div class="drilldown-chart-legend">${legendMarkup}</div>
      <div class="drilldown-multi-chart">
        <svg viewBox="0 0 ${width} ${height}">
          <line x1="${leftPad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="rgba(158,176,207,0.2)" />
          <line x1="${leftPad}" y1="${topPad}" x2="${leftPad}" y2="${height - pad}" stroke="rgba(158,176,207,0.15)" />
          <text x="${leftPad - 8}" y="${topPad}" class="chart-label" font-size="10" text-anchor="end">${max}${unit}</text>
          <text x="${leftPad - 8}" y="${height - pad}" class="chart-label" font-size="10" text-anchor="end">${min}${unit}</text>
          ${seriesMarkup}
        </svg>
      </div>
    `;
  }

  function renderPortSelector(container, trendData, tabKey) {
    if (!trendData || !trendData.ports || trendData.ports.length <= 1) {
      return;
    }
    const activePort = state.drilldown.activePort[tabKey] || null;
    const selector = document.createElement('div');
    selector.className = 'drilldown-port-selector';
    selector.innerHTML = `
      <button class="drilldown-port-btn ${!activePort ? 'is-active' : ''}" data-dd-port="" data-dd-tab="${tabKey}">全部</button>
      ${trendData.ports.map((port) => `
        <button class="drilldown-port-btn ${activePort === port ? 'is-active' : ''}" data-dd-port="${port}" data-dd-tab="${tabKey}">${port}</button>
      `).join('')}
    `;
    container.appendChild(selector);
  }

  function renderDrilldownTabContent(drillData, tabIndex) {
    if (!drillData) {
      refs.drilldownTabPanels.innerHTML = '<div class="empty-state">暂无数据</div>';
      return;
    }

    const tab = DRILLDOWN_TABS[tabIndex];
    const panel = document.createElement('div');
    panel.className = 'drilldown-tab-panel is-active';
    closeLatencyModal();

    if (tab.key === 'portDown') {
      const alarms = drillData.portDownAlarms || [];
      if (!alarms.length) {
        panel.innerHTML = '<div class="empty-state">该时间段无端口Down告警</div>';
      } else {
        panel.innerHTML = `
          <table class="drilldown-table">
            <thead><tr><th>端口</th><th>告警时间</th><th>持续时长</th><th>状态</th></tr></thead>
            <tbody>
              ${alarms.map((row) => `
                <tr>
                  <td>${row.port}</td>
                  <td>${row.time}</td>
                  <td>${row.duration}</td>
                  <td><span class="drilldown-status-pill ${row.status === '已恢复' ? 'recovered' : 'ongoing'}">${row.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    } else if (tab.key === 'pfc') {
      panel.innerHTML = renderPfcPanel(drillData);
    } else if (tab.key === 'queueLength') {
      panel.innerHTML = renderQueueMainPanel(drillData.queueLengthView, tab.key);
    } else if (tab.key === 'queueDelay') {
      panel.innerHTML = renderQueueDelayPanel(drillData.queueDelayView);
    }

    refs.drilldownTabPanels.innerHTML = '';
    refs.drilldownTabPanels.appendChild(panel);
    if (tab.key === 'queueDelay' && state.drilldown.latencyModalOpen) {
      renderLatencyModal(drillData.queueDelayView?.detail);
    }
  }

  function renderDrilldownTabs(drillData, activeTabIndex) {
    refs.drilldownTabs.innerHTML = DRILLDOWN_TABS
      .map((tab, idx) => {
        let count = 0;
        if (drillData) {
          if (tab.key === 'portDown') count = (drillData.portDownAlarms || []).length;
          else if (tab.key === 'pfc') count = (drillData.pfcTrend?.ports || []).length;
          else if (tab.key === 'queueLength') count = (drillData.queueLengthTrend?.ports || []).length;
          else if (tab.key === 'queueDelay') count = (drillData.queueDelayView?.records || []).length;
        }
        return `
          <button class="drilldown-tab ${idx === activeTabIndex ? 'is-active' : ''}" type="button" data-dd-tab-index="${idx}">
            ${tab.label}
            ${count > 0 ? `<span class="drilldown-tab-badge">${count}</span>` : ''}
          </button>
        `;
      })
      .join('');
  }

  function switchDrilldownSlot(slotIndex) {
    const flow = state.drilldown.entityKey && state.flow;
    if (!flow) return;

    const rows = flow.detailView?.orderedRows || [];
    const row = rows.find((r) => r.entityKey === state.drilldown.entityKey);
    if (!row) return;

    const cells = row.cells || [];
    const cell = cells[slotIndex];
    if (!cell) return;

    state.drilldown.slotIndex = slotIndex;
    state.drilldown.activeTab = 0;
    state.drilldown.activePort = {};
    state.drilldown.activeBucket = {};
    state.drilldown.queueLengthExpanded = false;
    state.drilldown.latencyModalOpen = false;
    state.drilldown.latencyModalRowIndex = null;

    const drillData = getDrillData(flow, cell.slot);

    refs.drilldownSubtitle.textContent = `${cell.slot}`;
    renderDrilldownTimeNav(cells, slotIndex);
    renderDrilldownMetrics(drillData);
    renderDrilldownTabs(drillData, 0);
    renderDrilldownTabContent(drillData, 0);
  }

  function openDrilldown(entityKey, rowLabel, cells, slotIndex) {
    const flow = state.flow;
    if (!flow) return;

    state.drilldown.open = true;
    state.drilldown.entityKey = entityKey;
    state.drilldown.rowLabel = rowLabel;
    state.drilldown.rowCells = cells;
    state.drilldown.slotIndex = slotIndex;
    state.drilldown.activeTab = 0;
    state.drilldown.activePort = {};
    state.drilldown.activeBucket = {};
    state.drilldown.queueLengthExpanded = false;
    state.drilldown.latencyModalOpen = false;
    state.drilldown.latencyModalRowIndex = null;

    const cell = cells[slotIndex];
    const drillData = cell ? getDrillData(flow, cell.slot) : null;

    const variantMeta = getPathVariantMeta(flow?.variantKey || state.currentPathVariant);
    refs.drilldownTitle.textContent = `${variantMeta.shortLabel} · ${rowLabel} · ${cell ? cell.slot : ''} 下钻分析`;
    const isAILB = (flow.variantKey || state.currentPathVariant) === 'ailb';
    refs.drilldownSubtitle.textContent = cell ? `时间段: ${cell.slot} · 路径来源：${variantMeta.label}${isAILB ? ' · 数据来源：设备级指标' : ''}` : '';
    refs.drilldownOverlay.hidden = false;
    refs.drilldownOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    renderDrilldownTimeNav(cells, slotIndex);
    renderDrilldownMetrics(drillData);
    renderDrilldownTabs(drillData, 0);
    renderDrilldownTabContent(drillData, 0);

    setTimeout(() => refs.drilldownClose.focus(), 50);
  }

  function closeDrilldown() {
    state.drilldown.open = false;
    refs.drilldownOverlay.hidden = true;
    refs.drilldownOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function syncDrilldownWithCurrentFlow() {
    if (!state.drilldown.open) {
      return;
    }
    const flow = getSelectedFlow();
    if (!flow) {
      closeDrilldown();
      return;
    }
    const rows = flow.detailView?.orderedRows || [];
    const row = rows.find((item) => item.entityKey === state.drilldown.entityKey) || rows[0];
    if (!row || !row.cells?.length) {
      closeDrilldown();
      return;
    }
    const slotIndex = Math.min(state.drilldown.slotIndex || 0, row.cells.length - 1);
    state.drilldown.rowLabel = row.label;
    state.drilldown.rowCells = row.cells;
    state.drilldown.slotIndex = slotIndex;
    const cell = row.cells[slotIndex];
    const drillData = cell ? getDrillData(flow, cell.slot) : null;
    const variantMeta = getPathVariantMeta(flow?.variantKey || state.currentPathVariant);
    const isAILB = (flow.variantKey || state.currentPathVariant) === 'ailb';
    refs.drilldownTitle.textContent = `${variantMeta.shortLabel} · ${row.label} · ${cell ? cell.slot : ''} 下钻分析`;
    refs.drilldownSubtitle.textContent = cell ? `时间段: ${cell.slot} · 路径来源：${variantMeta.label}${isAILB ? ' · 数据来源：设备级指标' : ''}` : '';
    renderDrilldownTimeNav(row.cells, slotIndex);
    renderDrilldownMetrics(drillData);
    renderDrilldownTabs(drillData, state.drilldown.activeTab);
    renderDrilldownTabContent(drillData, state.drilldown.activeTab);
  }

  function switchDrilldownTab(tabIndex) {
    const flow = state.flow;
    if (!flow) return;

    state.drilldown.activeTab = tabIndex;
    state.drilldown.queueLengthExpanded = false;
    state.drilldown.activeBucket = {};
    state.drilldown.latencyModalOpen = false;
    state.drilldown.latencyModalRowIndex = null;

    const cells = state.drilldown.rowCells || [];
    const cell = cells[state.drilldown.slotIndex];
    const drillData = cell ? getDrillData(flow, cell.slot) : null;

    renderDrilldownTabs(drillData, tabIndex);
    renderDrilldownTabContent(drillData, tabIndex);
  }

  function bindEvents() {
    refs.matchedDeviceList.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-device-toggle]');
      const interfaceButton = event.target.closest('[data-interface-select]');
      const drilldownBtn = event.target.closest('[data-device-drilldown]');
      const flow = getSelectedFlow();
      if (!flow) {
        return;
      }

      if (drilldownBtn) {
        const deviceId = drilldownBtn.dataset.deviceDrilldown;
        const node = getNodeById(flow, deviceId);
        if (!node) return;
        const entityKey = `node:${deviceId}`;
        const rows = flow.detailView?.orderedRows || [];
        const row = rows.find((r) => r.entityKey === entityKey);
        if (row && row.cells && row.cells.length) {
          openDrilldown(entityKey, node.label, row.cells, 0);
        }
        return;
      }

      if (interfaceButton) {
        const entityKey = interfaceButton.dataset.interfaceSelect;
        const deviceId = interfaceButton.dataset.deviceId;
        updateSelection(entityKey, { deviceId });
        return;
      }

      if (!toggle) {
        return;
      }

      const deviceId = toggle.dataset.deviceToggle;
      const isExpanded = state.expandedDeviceIds.includes(deviceId);
      state.expandedDeviceIds = isExpanded ? state.expandedDeviceIds.filter((id) => id !== deviceId) : [...state.expandedDeviceIds, deviceId];
      if (state.selectedEntityKey === `node:${deviceId}` && isExpanded) {
        updateSelection('all');
        return;
      }
      updateSelection(`node:${deviceId}`, { deviceId });
    });

    refs.clearSelectionBtn.addEventListener('click', () => {
      state.expandedDeviceIds = [];
      updateSelection('all');
    });

    refs.viewInTopologyBtn.addEventListener('click', () => {
      const flow = getSelectedFlow();
      if (!flow) {
        return;
      }
      state.topologyMode = 'path';
      state.focusedDeviceId = null;
      renderTopology(flow);
    });

    refs.detailDiagnosisBtn.addEventListener('click', () => {
      const flow = getSelectedFlow();
      if (!flow) {
        return;
      }
      navigateToDiagnosis(flow.id);
    });

    refs.pathVariantSwitcher?.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-path-variant]');
      if (!btn) {
        return;
      }
      switchPathVariant(btn.dataset.pathVariant);
    });

    refs.alarmList.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-slot]');
      if (!btn) return;
      const flow = getSelectedFlow();
      if (!flow) return;

      const entityKey = btn.dataset.entityKey;
      const rowLabel = btn.dataset.rowLabel;
      const slotIndex = parseInt(btn.dataset.slotIndex, 10);

      const rows = flow.detailView?.orderedRows || [];
      const row = rows.find((r) => r.entityKey === entityKey);
      if (!row) return;

      openDrilldown(entityKey, rowLabel, row.cells || [], slotIndex);
    });

    refs.drilldownOverlay.addEventListener('click', (event) => {
      if (event.target === refs.drilldownOverlay) closeDrilldown();
    });

    refs.drilldownClose.addEventListener('click', () => closeDrilldown());

    refs.drilldownTimeTrack.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-dd-slot-index]');
      if (!btn) return;
      switchDrilldownSlot(parseInt(btn.dataset.ddSlotIndex, 10));
    });

    refs.drilldownTabs.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-dd-tab-index]');
      if (!btn) return;
      switchDrilldownTab(parseInt(btn.dataset.ddTabIndex, 10));
    });

    refs.drilldownTabPanels.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-dd-port]');
      const flow = state.flow;
      const cells = state.drilldown.rowCells || [];
      const cell = cells[state.drilldown.slotIndex];
      const drillData = cell ? getDrillData(flow, cell.slot) : null;

      if (btn) {
        const tabKey = btn.dataset.ddTab;
        const port = btn.dataset.ddPort || null;
        state.drilldown.activePort[tabKey] = port;
        renderDrilldownTabContent(drillData, state.drilldown.activeTab);
        return;
      }

      const bucketBtn = event.target.closest('[data-dd-bucket-index]');
      if (bucketBtn && state.drilldown.activeTab === 3) {
        const bucketValue = bucketBtn.dataset.ddBucketIndex;
        state.drilldown.activeBucket.queueDelay = bucketValue === '' ? null : Number(bucketValue);
        renderDrilldownTabContent(drillData, state.drilldown.activeTab);
        return;
      }

      const zoomBtn = event.target.closest('[data-dd-zoom]');
      if (zoomBtn && state.drilldown.activeTab === 2) {
        state.drilldown.queueLengthExpanded = zoomBtn.dataset.ddZoom === 'in';
        renderDrilldownTabContent(drillData, state.drilldown.activeTab);
        return;
      }

      const latencyDetailBtn = event.target.closest('[data-dd-latency-detail]');
      if (latencyDetailBtn && state.drilldown.activeTab === 3) {
        state.drilldown.latencyModalOpen = true;
        state.drilldown.latencyModalRowIndex = Number(latencyDetailBtn.dataset.ddLatencyDetail || 0);
        renderLatencyModal(drillData.queueDelayView?.detail);
        return;
      }

      const closeLatencyBtn = event.target.closest('[data-dd-latency-close]');
      if (closeLatencyBtn) {
        closeLatencyModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.drilldown.open) closeDrilldown();
    });
  }

  function init() {
    const flowId = getQueryFlowId();
    if (!flowId) {
      renderEmptyState('缺少 flowId，请从流路径列表重新进入详情页。');
      return;
    }

    const flow = getFlowById(flowId);
    if (!flow) {
      renderEmptyState(`未找到对应流路径：${flowId}`);
      return;
    }

    state.flow = flow;
    state.currentPathVariant = 'ailb';
    refreshView();
    bindEvents();
  }

  init();
})();
