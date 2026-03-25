(() => {
  const data = window.ROCE_MOCK_DATA;
  const home = data?.home;

  const refs = {
    overviewTitle: document.getElementById('homeOverviewTitle'),
    overviewSubtitle: document.getElementById('homeOverviewSubtitle'),
    overviewTags: document.getElementById('homeOverviewTags'),
    overviewStage: document.getElementById('homeOverviewStage'),
    alarmRatio: document.getElementById('homeAlarmRatio'),
    deviceResources: document.getElementById('homeDeviceResources'),
    taskResources: document.getElementById('homeTaskResources'),
    quickActions: document.getElementById('homeQuickActions')
  };

  function hasItems(list) {
    return Array.isArray(list) && list.length > 0;
  }

  function clampPercent(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
  }

  function renderOverview() {
    const overview = home?.overview;
    if (!overview) {
      refs.overviewStage.innerHTML = '<div class="empty-state">暂无首页概览数据</div>';
      return;
    }

    refs.overviewTitle.textContent = overview.title;
    refs.overviewSubtitle.textContent = overview.subtitle;
    refs.overviewTags.innerHTML = (overview.tags || []).map((tag) => `<span class="badge badge-light">${tag}</span>`).join('');

    const nodes = overview.topology?.nodes || [];
    const links = overview.topology?.links || [];
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const linkMarkup = links
      .map((link) => {
        const from = nodeMap.get(link.from);
        const to = nodeMap.get(link.to);
        if (!from || !to) {
          return '';
        }
        const path = `M ${from.x} ${from.y} C ${from.x} ${(from.y + to.y) / 2}, ${to.x} ${(from.y + to.y) / 2}, ${to.x} ${to.y}`;
        return `<path d="${path}" class="home-link home-link-${link.severity || 'normal'}" />`;
      })
      .join('');

    const nodeMarkup = nodes
      .map((node) => {
        const icon = node.type === 'server' ? '▭' : '◫';
        return `
          <g class="home-node is-${node.status || 'normal'}">
            <circle cx="${node.x}" cy="${node.y}" r="30" class="home-node-ring"></circle>
            <circle cx="${node.x}" cy="${node.y}" r="24" class="home-node-core"></circle>
            <text x="${node.x}" y="${node.y + 7}" class="home-node-icon" text-anchor="middle">${icon}</text>
            <text x="${node.x}" y="${node.y + 62}" class="home-node-label" text-anchor="middle">${node.label}</text>
            <text x="${node.x}" y="${node.y + 84}" class="home-node-sub" text-anchor="middle">${node.sub || ''}</text>
          </g>
        `;
      })
      .join('');

    refs.overviewStage.innerHTML = `
      <svg viewBox="0 0 940 660" class="home-overview-svg" role="img" aria-label="首页资源拓扑概览">
        ${linkMarkup}
        ${nodeMarkup}
      </svg>
    `;
  }

  function renderAlarmRatio() {
    const ratio = home?.alarmRatio;
    if (!ratio || !hasItems(ratio.items)) {
      refs.alarmRatio.innerHTML = '<div class="empty-state">暂无告警数据</div>';
      return;
    }

    const total = ratio.total || ratio.items.reduce((sum, item) => sum + Number(item.value || 0), 0);
    let cursor = 0;
    const segments = ratio.items
      .map((item) => {
        const share = Math.max(1, (Number(item.value || 0) / Math.max(total, 1)) * 100);
        const start = cursor;
        const end = Math.min(100, cursor + share);
        cursor = end;
        return `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
      })
      .join(', ');

    refs.alarmRatio.innerHTML = `
      <div class="home-donut-layout">
        <div class="home-donut-ring" style="background: conic-gradient(${segments});">
          <div class="home-donut-inner">
            <strong>${total}</strong>
            <span>总数</span>
          </div>
        </div>
        <div class="home-donut-legend">
          ${ratio.items
            .map(
              (item) => `
                <div class="home-donut-legend-item">
                  <span class="home-donut-legend-dot" style="background:${item.color}"></span>
                  <span>${item.label}</span>
                  <strong>${item.value}</strong>
                </div>
              `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  function renderResourcePanel(container, resource) {
    if (!container) {
      return;
    }
    if (!resource || !hasItems(resource.items)) {
      container.innerHTML = '<div class="empty-state">暂无资源数据</div>';
      return;
    }

    container.innerHTML = `
      <div class="home-resource-summary">
        <div class="home-resource-total">${resource.total}</div>
        <div class="home-resource-total-label">总数</div>
      </div>
      <div class="home-resource-list">
        ${resource.items
          .map(
            (item) => `
              <div class="home-resource-row">
                <div class="home-resource-meta">
                  <span>${item.label}</span>
                  <strong>${item.value}</strong>
                </div>
                <div class="home-resource-track">
                  <span class="home-resource-fill" style="width:${clampPercent(item.percent)}%"></span>
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    `;
  }

  function renderQuickActions() {
    const actions = home?.quickActions || [];
    refs.quickActions.innerHTML = actions
      .map((action) => `<a class="home-quick-action" href="${action.href}">${action.label}</a>`)
      .join('');
  }

  function init() {
    if (!home) {
      return;
    }

    renderOverview();
    renderAlarmRatio();
    renderResourcePanel(refs.deviceResources, home.deviceResources);
    renderResourcePanel(refs.taskResources, home.aiTaskResources);
    renderQuickActions();
  }

  init();
})();

