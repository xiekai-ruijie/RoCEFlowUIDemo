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
    matchedDeviceCount: document.getElementById('matchedDeviceCount'),
    matchedDeviceList: document.getElementById('matchedDeviceList'),
    topologyContainer: document.getElementById('topologyContainer'),
    topologyViewHint: document.getElementById('topologyViewHint'),
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
    ecnChart: document.getElementById('ecnChart')
  };

  const state = {
    flow: null,
    selectedEntityKey: 'all',
    expandedDeviceIds: [],
    topologyMode: 'default',
    focusedDeviceId: null
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
    return state.flow;
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
    const url = new URL(DIAGNOSIS_PAGE_PATH, window.location.href);
    url.searchParams.set('action', 'new_task');
    url.searchParams.set('flowId', flowId);
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
        const badgeText = node.role === 'source' || point.role === 'source' ? '源' : node.role === 'destination' || point.role === 'destination' ? '目的' : '';
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
      <svg viewBox="0 0 ${width} ${height}" class="topology-svg" role="img" aria-label="RoCE流路径拓扑图">
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
      legendText: '红色链路表示高风险段'
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
      legendText: '当前展示拓扑上下文中的主路径'
    });
  }

  function updateTopologyHint(flow) {
    let hintText = '当前展示主路径概览';
    if (state.topologyMode === 'path') {
      hintText = `当前展示拓扑上下文中的主路径 · ${flow.srcIp} → ${flow.dstIp}`;
    } else if (state.topologyMode === 'device' && state.focusedDeviceId) {
      const node = getNodeById(flow, state.focusedDeviceId);
      hintText = `当前展示设备接口相关流量 · ${node?.label || state.focusedDeviceId}`;
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
      <div class="heatmap-board heatmap-board-ordered" style="${slotStyle}">
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
                        .map((cell) => `<span class="heatmap-cell ${cell.level}" title="${row.label} / ${cell.slot}：${cell.text}"></span>`)
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
    refs.selectionStatusChip.textContent = `当前展示：${label}`;
    refs.trendScopeHint.textContent = state.selectedEntityKey === 'all' ? '未选择设备/接口时展示当前流全体趋势' : `当前仅展示 ${label} 相关指标趋势`;
    refs.heatmapScopeHint.textContent = state.selectedEntityKey === 'all' ? '热力图按源服务器→设备→设备端口→目的服务器顺序展示' : `当前高亮 ${label} 相关告警热力图`;
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
  }

  function bindEvents() {
    refs.matchedDeviceList.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-device-toggle]');
      const interfaceButton = event.target.closest('[data-interface-select]');
      const flow = getSelectedFlow();
      if (!flow) {
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
    refs.detailTitle.textContent = `流路径详情 · ${flow.summary?.pathId || flow.id}`;

    renderFlowSnapshot(flow);
    renderMatchedDevices(flow);
    renderTopology(flow);
    renderCharts(flow);
    renderHeatmap(flow);
    updateSelectionCopy(flow);
    bindEvents();
  }

  init();
})();

