(() => {
  const data = window.ROCE_MOCK_DATA;
  const TOTAL_ITEMS = 19;

  const refs = {
    taskList: document.getElementById('diagnosisTaskList'),
    taskSearchInput: document.getElementById('taskSearchInput'),
    summaryCard: document.getElementById('diagnosisSummaryCard'),
    graphStage: document.getElementById('diagnosisGraphStage'),
    refreshGraphBtn: document.getElementById('refreshGraphBtn'),
    openTaskModalBtn: document.getElementById('openTaskModalBtn'),
    taskModalBackdrop: document.getElementById('taskModalBackdrop'),
    closeTaskModalBtn: document.getElementById('closeTaskModalBtn'),
    cancelTaskBtn: document.getElementById('cancelTaskBtn'),
    confirmTaskBtn: document.getElementById('confirmTaskBtn'),
    taskNameInput: document.getElementById('taskNameInput'),
    taskStartInput: document.getElementById('taskStartInput'),
    taskEndInput: document.getElementById('taskEndInput'),
    connectivityToggleInput: document.getElementById('connectivityToggleInput'),
    taskFormError: document.getElementById('taskFormError'),
    targetFlowList: document.getElementById('targetFlowList'),
    flowSearchInput: document.getElementById('flowSearchInput'),
    flowItemsContainer: document.getElementById('flowItemsContainer'),
    diagnosisTargetGroup: document.getElementById('diagnosisTargetGroup')
  };

  const referenceTime = parseTime(data?.meta?.lastUpdated) || Date.now();
  const state = {
    tasks: [],
    selectedTaskId: null,
    keyword: ''
  };

  function parseTime(value) {
    const timestamp = Date.parse(String(value || '').replace(' ', 'T'));
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatDateTime(timestamp, divider = ' ') {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}${divider}${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function formatDateTimeLocal(timestamp) {
    return formatDateTime(timestamp, 'T').slice(0, 16);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getFlowById(flowId) {
    return (data?.flows || []).find((flow) => flow.id === flowId) || null;
  }

  function getCheckedValue(name) {
    const input = document.querySelector(`input[name="${name}"]:checked`);
    return input ? input.value : '';
  }

  function getTaskById(taskId) {
    return state.tasks.find((task) => task.id === taskId) || null;
  }

  function getStatusText(task) {
    return task.abnormalCount > 0 ? `完成，发现 ${task.abnormalCount} 项异常` : '完成，未发现异常';
  }

  function getDerivedAbnormalCount(diagnosisType) {
    if (diagnosisType === '训练卡死') {
      return 6;
    }
    if (diagnosisType === '性能下降') {
      return 4;
    }
    return 0;
  }

  function createGraph(task) {
    const hasAbnormal = task.abnormalCount > 0;
    const isCritical = task.diagnosisType === '训练卡死';

    return {
      width: 1380,
      height: 760,
      nodes: [
        { id: 'root', label: task.diagnosisType, x: 120, y: 360, tone: 'root', position: 'left' },
        { id: 'pfc', label: hasAbnormal ? 'PFC触发异常' : '未检测到PFC死锁', x: 620, y: 110, tone: hasAbnormal ? 'warning' : 'normal' },
        { id: 'port', label: hasAbnormal ? '接口存在丢包' : '接口无丢包', x: 620, y: 210, tone: hasAbnormal ? 'warning' : 'normal' },
        { id: 'crc', label: hasAbnormal ? '接口存在错包' : '接口无错包', x: 620, y: 320, tone: hasAbnormal ? 'warning' : 'normal' },
        { id: 'nic', label: isCritical ? '网卡存在拥塞' : '网卡正常', x: 620, y: 460, tone: isCritical ? 'critical' : 'normal' },
        { id: 'gpu', label: isCritical ? 'GPU等待超时' : 'GPU正常', x: 620, y: 600, tone: isCritical ? 'critical' : 'normal' },
        { id: 'switch', label: hasAbnormal ? '转发需要下钻' : '转发正常', x: 620, y: 720, tone: hasAbnormal ? 'warning' : 'normal' },
        { id: 'pfc-leaf-1', label: hasAbnormal ? 'Leaf队列抖动' : '接口正常', x: 1170, y: 60, tone: hasAbnormal ? 'warning' : 'normal' },
        { id: 'pfc-leaf-2', label: hasAbnormal ? '协议重传上升' : '协议正常', x: 1170, y: 115, tone: hasAbnormal ? 'warning' : 'normal' },
        { id: 'pfc-leaf-3', label: hasAbnormal ? '配置待核查' : '配置正常', x: 1170, y: 170, tone: hasAbnormal ? 'warning' : 'normal' },
        { id: 'port-leaf-1', label: hasAbnormal ? '接收包波动' : '接收包正常', x: 1170, y: 255, tone: hasAbnormal ? 'warning' : 'normal' },
        { id: 'port-leaf-2', label: hasAbnormal ? '发送包波动' : '发送包正常', x: 1170, y: 320, tone: hasAbnormal ? 'warning' : 'normal' },
        { id: 'port-leaf-3', label: hasAbnormal ? '检测到CRC异常' : '无CRC错包', x: 1170, y: 385, tone: hasAbnormal ? 'critical' : 'normal' },
        { id: 'nic-leaf-1', label: isCritical ? '检测到网卡掉卡' : '未检测到网卡掉卡', x: 1170, y: 460, tone: isCritical ? 'critical' : 'normal' },
        { id: 'gpu-leaf-1', label: isCritical ? '检测到GPU卡死' : '未检测到GPU掉卡', x: 1170, y: 590, tone: isCritical ? 'critical' : 'normal' },
        { id: 'gpu-leaf-2', label: isCritical ? '检测到XID错误' : '未检测到XID错误', x: 1170, y: 645, tone: isCritical ? 'warning' : 'normal' },
        { id: 'switch-leaf-1', label: hasAbnormal ? 'Leaf交换机链路需复核' : 'Leaf交换机下联网卡的链路正常', x: 1170, y: 720, tone: hasAbnormal ? 'warning' : 'normal' }
      ],
      links: [
        ['root', 'pfc'],
        ['root', 'port'],
        ['root', 'crc'],
        ['root', 'nic'],
        ['root', 'gpu'],
        ['root', 'switch'],
        ['pfc', 'pfc-leaf-1'],
        ['pfc', 'pfc-leaf-2'],
        ['pfc', 'pfc-leaf-3'],
        ['port', 'port-leaf-1'],
        ['port', 'port-leaf-2'],
        ['port', 'port-leaf-3'],
        ['nic', 'nic-leaf-1'],
        ['gpu', 'gpu-leaf-1'],
        ['gpu', 'gpu-leaf-2'],
        ['switch', 'switch-leaf-1']
      ]
    };
  }

  function createTask(taskConfig) {
    const abnormalCount = taskConfig.abnormalCount ?? 0;
    const normalCount = taskConfig.normalCount ?? Math.max(0, TOTAL_ITEMS - abnormalCount);

    return {
      id: taskConfig.id,
      name: taskConfig.name,
      diagnosisType: taskConfig.diagnosisType,
      target: taskConfig.target,
      connectivity: taskConfig.connectivity,
      totalItems: TOTAL_ITEMS,
      abnormalCount,
      normalCount,
      timeRange: taskConfig.timeRange,
      startTime: taskConfig.startTime,
      graph: taskConfig.graph || createGraph({ diagnosisType: taskConfig.diagnosisType, abnormalCount })
    };
  }

  function createTaskFromFlow(flow) {
    if (!flow) {
      return null;
    }

    const diagnosisType = flow.status === 'critical' ? '训练卡死' : flow.status === 'warning' ? '性能下降' : '训练中断';
    const abnormalCount = flow.status === 'critical' ? 7 : flow.status === 'warning' ? 4 : 0;
    const endTimestamp = parseTime(flow.lastActive) || referenceTime;
    const startTimestamp = endTimestamp - 30 * 60 * 1000;

    return createTask({
      id: `flow-${flow.id}`,
      name: `AI任务 / ${flow.taskName}`,
      diagnosisType,
      target: flow.tenant,
      connectivity: flow.status === 'normal' ? '停用' : '启用',
      abnormalCount,
      timeRange: `${formatDateTime(startTimestamp)} ~ ${formatDateTime(endTimestamp)}`,
      startTime: formatDateTime(endTimestamp - 90 * 1000)
    });
  }

  function createDefaultTasks(selectedFlowTask) {
    const tasks = [
      selectedFlowTask,
      createTask({
        id: 'recent-task-03',
        name: '故障一键诊断近期任务03',
        diagnosisType: '训练中断',
        target: '全网',
        connectivity: '停用',
        abnormalCount: 11,
        timeRange: '2026-03-13 17:13:28 ~ 2026-03-13 17:43:28',
        startTime: '2026-03-13 17:39:33'
      }),
      createTask({
        id: 'recent-task-02',
        name: '故障一键诊断近期任务02',
        diagnosisType: '训练中断',
        target: '全网',
        connectivity: '停用',
        abnormalCount: 0,
        timeRange: '2026-03-12 15:12:10 ~ 2026-03-12 15:42:10',
        startTime: '2026-03-12 15:38:20'
      }),
      createTask({
        id: 'task-resource-retry',
        name: '资源缺失重试',
        diagnosisType: '训练中断',
        target: '指定服务器',
        connectivity: '停用',
        abnormalCount: 0,
        timeRange: '2026-03-12 10:02:18 ~ 2026-03-12 10:32:18',
        startTime: '2026-03-12 10:28:08'
      }),
      createTask({
        id: 'recent-task-01',
        name: '故障诊断近期任务01',
        diagnosisType: '训练中断',
        target: '全网',
        connectivity: '停用',
        abnormalCount: 0,
        timeRange: '2026-03-11 18:10:11 ~ 2026-03-11 18:40:11',
        startTime: '2026-03-11 18:36:21'
      }),
      createTask({
        id: 'task-custom-067',
        name: 'TestFaultDiagnosis067_20260105...',
        diagnosisType: '性能下降',
        target: '指定区域',
        connectivity: '启用',
        abnormalCount: 4,
        timeRange: '2026-03-10 09:33:12 ~ 2026-03-10 10:03:12',
        startTime: '2026-03-10 09:59:22'
      })
    ].filter(Boolean);

    return tasks;
  }

  function renderTaskList() {
    const keyword = state.keyword.trim().toLowerCase();
    const filteredTasks = state.tasks.filter((task) => {
      if (!keyword) {
        return true;
      }
      return `${task.name} ${task.diagnosisType} ${task.target}`.toLowerCase().includes(keyword);
    });

    if (!filteredTasks.length) {
      refs.taskList.innerHTML = '<div class="empty-state diagnosis-empty-state">未找到匹配的检测任务</div>';
      return;
    }

    refs.taskList.innerHTML = filteredTasks
      .map((task) => {
        const isActive = task.id === state.selectedTaskId;
        return `
          <button class="diagnosis-task-card ${isActive ? 'is-active' : ''}" type="button" data-task-id="${task.id}">
            <div class="diagnosis-task-card-header">
              <div class="diagnosis-task-card-title-row">
                <span class="diagnosis-task-check"></span>
                <strong>${escapeHtml(task.name)}</strong>
              </div>
              <div class="diagnosis-task-card-tools">
                ${isActive ? '<span>↻</span><span>⧉</span><span>🗑</span>' : ''}
              </div>
            </div>
            <div class="diagnosis-task-meta">诊断类型：${escapeHtml(task.diagnosisType)}</div>
            <div class="diagnosis-task-meta">诊断目标：${escapeHtml(task.target)}</div>
            <div class="diagnosis-task-meta">检测项：${task.totalItems}（<span class="task-count-bad">异常：${task.abnormalCount}</span> <span class="task-count-good">正常：${task.normalCount}</span>）</div>
          </button>
        `;
      })
      .join('');
  }

  function renderSummaryCard(task) {
    const progress = Math.round((task.normalCount / Math.max(1, task.totalItems)) * 100);
    refs.summaryCard.innerHTML = `
      <div class="diagnosis-summary-inner">
        <div class="diagnosis-summary-ring-block">
          <div class="diagnosis-progress-ring" style="--progress:${progress};">
            <div class="diagnosis-progress-ring-inner">
              <strong>${task.totalItems}</strong>
              <span>总数</span>
            </div>
          </div>
        </div>
        <div class="diagnosis-summary-content">
          <div class="diagnosis-summary-head">
            <div>
              <h2>“${escapeHtml(task.name)}” ${getStatusText(task)}</h2>
              <div class="diagnosis-summary-meta-grid">
                <span>诊断类型：</span><strong>${escapeHtml(task.diagnosisType)}</strong>
                <span>诊断时间范围：</span><strong>${escapeHtml(task.timeRange)}</strong>
                <span>诊断目标：</span><strong>${escapeHtml(task.target)}</strong>
                <span>开始时间：</span><strong>${escapeHtml(task.startTime)}</strong>
                <span>连通性检测：</span><strong>${escapeHtml(task.connectivity)}</strong>
                <span>检测项：</span><strong>${task.totalItems}</strong>
              </div>
            </div>
            <div class="diagnosis-summary-actions">
              <button class="btn btn-primary" type="button" data-summary-action="rerun">重新检测</button>
              <button class="btn btn-secondary" type="button" data-summary-action="history">检测历史</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function getNodeStyle(tone) {
    if (tone === 'critical') {
      return { line: '#ff7875', chip: 'rgba(122, 40, 40, 0.88)', text: '#ffe3e1', circle: '#ff7875', stroke: 'rgba(255, 120, 117, 0.28)' };
    }
    if (tone === 'warning') {
      return { line: '#ffd166', chip: 'rgba(113, 87, 28, 0.88)', text: '#fff3d2', circle: '#ffd166', stroke: 'rgba(255, 209, 102, 0.24)' };
    }
    if (tone === 'root') {
      return { line: '#1bf0e2', chip: 'transparent', text: '#dbe8ff', circle: '#ffffff', stroke: 'rgba(120, 167, 255, 0.3)' };
    }
    return { line: '#1bf0e2', chip: 'rgba(63, 110, 61, 0.9)', text: '#effff2', circle: '#ffffff', stroke: 'rgba(27, 240, 226, 0.18)' };
  }

  function renderGraph(task) {
    const graph = task.graph;
    const nodeMap = Object.fromEntries(graph.nodes.map((node) => [node.id, node]));

    const links = graph.links
      .map(([fromId, toId]) => {
        const from = nodeMap[fromId];
        const to = nodeMap[toId];
        if (!from || !to) {
          return '';
        }
        const style = getNodeStyle(to.tone);
        const midX = (from.x + to.x) / 2;
        return `<path d="M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}" stroke="${style.line}" stroke-width="2.2" fill="none" />`;
      })
      .join('');

    const nodes = graph.nodes
      .map((node) => {
        const style = getNodeStyle(node.tone);
        const labelWidth = Math.max(120, node.label.length * 18 + 28);
        const labelHeight = 42;
        const labelX = node.position === 'left' ? node.x - labelWidth - 22 : node.x + 22;
        const labelY = node.y - labelHeight / 2;
        const textX = node.position === 'left' ? labelX + labelWidth - 18 : labelX + 16;
        const anchor = node.position === 'left' ? 'end' : 'start';
        const chip = node.tone === 'root'
          ? `<text x="${labelX + labelWidth - 10}" y="${node.y + 6}" fill="${style.text}" text-anchor="end" font-size="18" font-weight="500">${escapeHtml(node.label)}</text>`
          : `
            <rect x="${labelX}" y="${labelY}" width="${labelWidth}" height="${labelHeight}" rx="10" fill="${style.chip}" stroke="${style.stroke}" />
            <text x="${textX}" y="${node.y + 6}" fill="${style.text}" text-anchor="${anchor}" font-size="16" font-weight="600">${escapeHtml(node.label)}</text>
          `;

        return `
          <g>
            ${chip}
            <circle cx="${node.x}" cy="${node.y}" r="11" fill="${style.circle}" stroke="${style.stroke}" stroke-width="4" />
          </g>
        `;
      })
      .join('');

    refs.graphStage.innerHTML = `
      <svg viewBox="0 0 ${graph.width} ${graph.height}" class="diagnosis-graph-svg" role="img" aria-label="故障一键诊断分析树图">
        ${links}
        ${nodes}
      </svg>
    `;
  }

  function renderSelectedTask() {
    const task = getTaskById(state.selectedTaskId) || state.tasks[0];
    if (!task) {
      refs.summaryCard.innerHTML = '<div class="empty-state diagnosis-empty-state">暂无可展示的检测任务</div>';
      refs.graphStage.innerHTML = '';
      return;
    }

    state.selectedTaskId = task.id;
    renderSummaryCard(task);
    renderGraph(task);
  }

  function renderAll() {
    renderTaskList();
    renderSelectedTask();
  }

  function resetTaskForm() {
    refs.taskNameInput.value = '';
    refs.connectivityToggleInput.checked = false;
    refs.taskStartInput.value = formatDateTimeLocal(referenceTime - 30 * 60 * 1000);
    refs.taskEndInput.value = formatDateTimeLocal(referenceTime);
    const defaultType = document.querySelector('input[name="diagnosisType"][value="训练中断"]');
    const defaultTarget = document.querySelector('input[name="diagnosisTarget"][value="全网"]');
    if (defaultType) {
      defaultType.checked = true;
    }
    if (defaultTarget) {
      defaultTarget.checked = true;
    }
    refs.taskFormError.textContent = '';
  }

  function openTaskModal() {
    resetTaskForm();
    refs.taskModalBackdrop.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeTaskModal() {
    refs.taskModalBackdrop.hidden = true;
    document.body.classList.remove('modal-open');
    refs.taskFormError.textContent = '';
  }

  function createTaskFromForm() {
    const name = refs.taskNameInput.value.trim();
    const start = parseTime(refs.taskStartInput.value);
    const end = parseTime(refs.taskEndInput.value);
    const diagnosisType = getCheckedValue('diagnosisType');
    const target = getCheckedValue('diagnosisTarget');

    if (!name) {
      refs.taskFormError.textContent = '请输入任务名称。';
      return;
    }
    if (!start || !end) {
      refs.taskFormError.textContent = '请选择完整的诊断时间范围。';
      return;
    }
    if (end < start) {
      refs.taskFormError.textContent = '结束时间不能早于开始时间。';
      return;
    }

    // Validate Flow Selection
    let flowDetails = '';
    if (target === '流路径') {
      const selectedFlow = document.querySelector('input[name="selectedFlowTarget"]:checked');
      if (!selectedFlow) {
        refs.taskFormError.textContent = '请选择具体的流路径。';
        return;
      }
      flowDetails = ` - ${selectedFlow.value}`;
    }

    const abnormalCount = getDerivedAbnormalCount(diagnosisType);
    const task = createTask({
      id: `custom-task-${Date.now()}`,
      name: name + flowDetails, // Append flow key to name for clarity
      diagnosisType,
      target,
      connectivity: refs.connectivityToggleInput.checked ? '启用' : '停用',
      abnormalCount,
      timeRange: `${formatDateTime(start)} ~ ${formatDateTime(end)}`,
      startTime: formatDateTime(Math.max(start, end - 4 * 60 * 1000))
    });

    state.tasks.unshift(task);
    state.selectedTaskId = task.id;
    state.keyword = '';
    refs.taskSearchInput.value = '';
    closeTaskModal();
    renderAll();
  }

  function renderFlowList(filter = '') {
    const flows = data.flows || [];
    const query = filter.toLowerCase();

    const items = flows.filter(flow => {
      if (!query) return true;
      const key = `${flow.srcIp}:${flow.srcPort} -> ${flow.dstIp}:${flow.dstPort}`;
      return key.toLowerCase().includes(query) || flow.taskName.toLowerCase().includes(query);
    }).map(flow => {
      const key = `${flow.srcIp}:${flow.srcPort} -> ${flow.dstIp}:${flow.dstPort}`;
      return `
        <label class="task-flow-item">
          <input type="radio" name="selectedFlowTarget" value="${key}" data-flow-id="${flow.id}" />
          <div>
            <div style="font-weight:600; font-size:14px; color:#dce7fb;">${escapeHtml(flow.taskName)}</div>
            <div class="task-flow-item-key">${escapeHtml(key)}</div>
          </div>
        </label>
      `;
    }).join('');

    refs.flowItemsContainer.innerHTML = items || '<div class="empty-state" style="padding:12px; font-size:13px;">无匹配流路径</div>';
  }

  function bindEvents() {
    refs.taskSearchInput.addEventListener('input', (event) => {
      state.keyword = event.target.value || '';
      renderTaskList();
    });

    refs.diagnosisTargetGroup.addEventListener('change', (event) => {
      if (event.target.name === 'diagnosisTarget') {
        const isFlow = event.target.value === '流路径';
        refs.targetFlowList.hidden = !isFlow;
        if (isFlow) {
          renderFlowList(refs.flowSearchInput.value);
        }
      }
    });

    refs.flowSearchInput.addEventListener('input', (event) => {
      renderFlowList(event.target.value);
    });

    refs.taskList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-task-id]');
      if (!button) {
        return;
      }
      state.selectedTaskId = button.dataset.taskId;
      renderAll();
    });

    refs.summaryCard.addEventListener('click', (event) => {
      const action = event.target.closest('[data-summary-action]');
      if (!action) {
        return;
      }

      const selectedTask = getTaskById(state.selectedTaskId);
      if (!selectedTask) {
        return;
      }

      if (action.dataset.summaryAction === 'rerun') {
        selectedTask.startTime = formatDateTime(referenceTime);
        selectedTask.timeRange = `${formatDateTime(referenceTime - 30 * 60 * 1000)} ~ ${formatDateTime(referenceTime)}`;
        renderSelectedTask();
      }

      if (action.dataset.summaryAction === 'history') {
        refs.taskSearchInput.focus();
      }
    });

    refs.refreshGraphBtn.addEventListener('click', renderSelectedTask);
    refs.openTaskModalBtn.addEventListener('click', openTaskModal);
    refs.closeTaskModalBtn.addEventListener('click', closeTaskModal);
    refs.cancelTaskBtn.addEventListener('click', closeTaskModal);
    refs.confirmTaskBtn.addEventListener('click', createTaskFromForm);

    refs.taskModalBackdrop.addEventListener('click', (event) => {
      if (event.target === refs.taskModalBackdrop) {
        closeTaskModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !refs.taskModalBackdrop.hidden) {
        closeTaskModal();
      }
    });
  }

  function init() {
    if (!data || !Array.isArray(data.flows)) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const flowId = params.get('flowId');
    const action = params.get('action');

    // Default init logic
    state.tasks = createDefaultTasks(null); // Load without specific flow task first
    state.selectedTaskId = state.tasks[0]?.id || null;
    document.title = '故障一键诊断';
    resetTaskForm();
    bindEvents();
    renderAll();

    // Handle deep linking for new task
    if (action === 'new_task' && flowId) {
      const flow = getFlowById(flowId);
      if (flow) {
        openTaskModal();

        // Pre-fill form
        refs.taskNameInput.value = `AI任务 / ${flow.taskName}`;

        const timestamp = parseTime(flow.lastActive) || referenceTime;
        refs.taskEndInput.value = formatDateTimeLocal(timestamp);
        refs.taskStartInput.value = formatDateTimeLocal(timestamp - 30 * 60 * 1000);

        // Select Diagnosis Type
        const derivedType = flow.status === 'critical' ? '训练卡死' : flow.status === 'warning' ? '性能下降' : '训练中断';
        const typeRadio = document.querySelector(`input[name="diagnosisType"][value="${derivedType}"]`);
        if (typeRadio) typeRadio.checked = true;

        // Select Diagnosis Target
        const targetRadio = document.querySelector('input[name="diagnosisTarget"][value="流路径"]');
        if (targetRadio) {
          targetRadio.checked = true;
          // Trigger change event manually to show list
          targetRadio.dispatchEvent(new Event('change', { bubbles: true }));

          // Select the specific flow in the list
          setTimeout(() => {
             const flowRadio = document.querySelector(`input[data-flow-id="${flow.id}"]`);
             if (flowRadio) {
               flowRadio.checked = true;
               flowRadio.scrollIntoView({ block: 'center' });
             }
          }, 50);
        }
      }
    } else if (flowId) {
      // Old behavior: just view result?
      // Re-add the flow task to the list if it's just viewing result
      const flowTask = createTaskFromFlow(getFlowById(flowId));
      if (flowTask) {
        state.tasks.unshift(flowTask);
        state.selectedTaskId = flowTask.id;
        renderAll();
      }
    }
  }

  init();
})();

