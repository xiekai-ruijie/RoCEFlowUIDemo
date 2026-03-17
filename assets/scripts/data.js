window.ROCE_MOCK_DATA = {
  meta: {
    lastUpdated: '2026-03-16 21:40',
    retentionDays: 7,
    maxQueryHours: 24,
    defaultRange: '4h'
  },
  tenants: ['全部租户', '58-AI-Train', 'CN-AI-Lab', 'Edge-Inference', 'Joint-Debug'],
  flows: [
    {
      id: 'flow-001',
      range: ['1h', '4h', '12h', '24h'],
      srcIp: '10.240.229.2',
      srcPort: '56324',
      dstIp: '10.240.229.60',
      dstPort: '4791',
      throughput: 24.5,
      throughputText: '24.5 Gbps',
      latency: 12,
      latencyText: '12 μs',
      jitter: 2.1,
      jitterText: '2.1 μs',
      loss: 0,
      lossText: '0',
      status: 'normal',
      tenant: '58-AI-Train',
      commId: 'CC-240316-001',
      taskName: 'GPT-Train / AllReduce-A',
      lastActive: '2026-03-16 21:18:42',
      hops: 4,
      diagnosisSummary: '未发现明显拥塞，当前主路径健康。',
      summary: {
        pathType: '主路径 / 单向流',
        pathId: 'PATH-7A2D-001',
        packetMode: 'RoCEv2 / IFA',
        tenant: '58-AI-Train'
      },
      topology: {
        nodes: [
          { id: 'srv-src-1', label: 'GPU-Train-01', type: 'server', status: 'normal', sub: '10.240.229.2 / mlx5_0' },
          { id: 'leaf-1', label: 'Leaf-1', type: 'switch', status: 'normal', sub: 'Eth1/21 → Eth1/47' },
          { id: 'spine-2', label: 'Spine-2', type: 'switch', status: 'normal', sub: 'Eth1/9 → Eth1/11' },
          { id: 'leaf-8', label: 'Leaf-8', type: 'switch', status: 'normal', sub: 'Eth1/48 → Eth1/16' },
          { id: 'srv-dst-1', label: 'GPU-Train-12', type: 'server', status: 'normal', sub: '10.240.229.60 / mlx5_1' }
        ],
        links: [
          { from: 'srv-src-1', to: 'leaf-1', severity: 'normal', metrics: '24.5Gbps / 2μs' },
          { from: 'leaf-1', to: 'spine-2', severity: 'normal', metrics: '24.3Gbps / 3μs' },
          { from: 'spine-2', to: 'leaf-8', severity: 'normal', metrics: '24.1Gbps / 4μs' },
          { from: 'leaf-8', to: 'srv-dst-1', severity: 'normal', metrics: '24.5Gbps / 3μs' }
        ]
      },
      stateSummary: [
        { title: '端到端状态', severity: 'normal', desc: '链路健康，无丢包，无异常波动。' },
        { title: 'PFC / ECN', severity: 'normal', desc: 'PFC Deadlock 未命中，ECN 标记率处于基线范围。' },
        { title: '服务器侧', severity: 'normal', desc: '源端 / 目的端网卡发送与接收队列无明显堆积。' }
      ],
      trends: {
        throughput: { unit: 'Gbps', values: [22.4, 23.1, 23.8, 24.5, 24.2, 24.7, 24.5], alerts: [] },
        latency: { unit: 'μs', values: [10, 11, 12, 11, 12, 13, 12], alerts: [] },
        jitter: { unit: 'μs', values: [1.1, 1.4, 1.8, 2.1, 1.9, 2.0, 2.1], alerts: [] },
        loss: { unit: 'pkt', values: [0, 0, 0, 0, 0, 0, 0], alerts: [] },
        pfc: { unit: 'fps', values: [2, 1, 3, 2, 2, 1, 2], alerts: [] },
        ecn: { unit: '%', values: [0.2, 0.2, 0.3, 0.4, 0.3, 0.2, 0.2], alerts: [] }
      },
      alarms: [
        { level: 'normal', object: 'Leaf-1', time: '2026-03-16 20:58', summary: '设备运行正常，无关联告警。', action: '持续观察' }
      ],
      tasksOnLink: [
        { commId: 'CC-240316-001', task: 'GPT-Train / AllReduce-A', tenant: '58-AI-Train', impact: '低', window: '21:00 - 21:20' },
        { commId: 'CC-240316-003', task: 'GPT-Train / Checkpoint Sync', tenant: '58-AI-Train', impact: '低', window: '21:05 - 21:18' }
      ],
      actions: [
        '维持当前 IFA 采样策略，继续跟踪高峰期流量变化。',
        '若后续出现训练速率抖动，可补充查看同平面其他主路径。'
      ],
      diagnosis: [
        { item: 'PFC Deadlock 检测', result: 'pass', progress: 100, desc: '未发现队列冻结与长时间 pause 风暴。', owner: '交换机域' },
        { item: 'ECN / CNP 关联校验', result: 'pass', progress: 100, desc: 'ECN 标记率处于基线内，CNP 返回频率正常。', owner: '拥塞域' },
        { item: '端侧网卡瓶颈识别', result: 'pass', progress: 100, desc: '源 / 目的主机网卡利用率均低于 70%。', owner: '服务器域' }
      ]
    },
    {
      id: 'flow-002',
      range: ['4h', '12h', '24h'],
      srcIp: '10.12.12.13',
      srcPort: '49152',
      dstIp: '123.12.122.12',
      dstPort: '4791',
      throughput: 18.2,
      throughputText: '18.2 Gbps',
      latency: 450,
      latencyText: '450 μs',
      jitter: 96.5,
      jitterText: '96.5 μs',
      loss: 124,
      lossText: '124',
      status: 'warning',
      tenant: 'CN-AI-Lab',
      commId: 'CC-240316-014',
      taskName: 'MoE-Train / Gradient Sync',
      lastActive: '2026-03-16 21:15:17',
      hops: 5,
      diagnosisSummary: '疑似 Spine-3 出口队列拥塞，建议结合 ECN / no-buffer 告警进一步排查。',
      summary: {
        pathType: '异常主路径 / 单向流',
        pathId: 'PATH-9F13-224',
        packetMode: 'RoCEv2 / IFA+MoD',
        tenant: 'CN-AI-Lab'
      },
      topology: {
        nodes: [
          { id: 'srv-src-2', label: 'GPU-Lab-02', type: 'server', status: 'warning', sub: '10.12.12.13 / mlx5_0' },
          { id: 'leaf-2', label: 'Leaf-2', type: 'switch', status: 'normal', sub: 'Eth1/20 → Eth1/49' },
          { id: 'spine-3', label: 'Spine-3', type: 'switch', status: 'warning', sub: 'Eth1/7 → Eth1/12' },
          { id: 'leaf-9', label: 'Leaf-9', type: 'switch', status: 'warning', sub: 'Eth1/45 → Eth1/10' },
          { id: 'srv-dst-2', label: 'GPU-Lab-16', type: 'server', status: 'warning', sub: '123.12.122.12 / mlx5_1' }
        ],
        links: [
          { from: 'srv-src-2', to: 'leaf-2', severity: 'normal', metrics: '19.0Gbps / 18μs' },
          { from: 'leaf-2', to: 'spine-3', severity: 'warning', metrics: '18.4Gbps / 122μs' },
          { from: 'spine-3', to: 'leaf-9', severity: 'critical', metrics: '17.9Gbps / 236μs' },
          { from: 'leaf-9', to: 'srv-dst-2', severity: 'warning', metrics: '18.2Gbps / 74μs' }
        ]
      },
      stateSummary: [
        { title: '端到端状态', severity: 'warning', desc: '时延与抖动显著上升，存在 124 个采样估算丢包。' },
        { title: '交换机拥塞', severity: 'critical', desc: 'Spine-3 出口队列在 21:12 - 21:16 期间多次接近 headroom 上限。' },
        { title: '端侧观察', severity: 'warning', desc: '目的端 NIC 接收队列出现短时积压。' }
      ],
      trends: {
        throughput: { unit: 'Gbps', values: [21.0, 20.5, 19.8, 18.2, 18.1, 18.5, 18.2], alerts: [3] },
        latency: { unit: 'μs', values: [58, 62, 85, 450, 380, 266, 450], alerts: [3, 4, 6] },
        jitter: { unit: 'μs', values: [12, 18, 26, 96.5, 88, 51, 75], alerts: [3, 4] },
        loss: { unit: 'pkt', values: [0, 2, 18, 124, 96, 74, 88], alerts: [3, 4, 5, 6] },
        pfc: { unit: 'fps', values: [12, 18, 34, 126, 118, 76, 92], alerts: [3, 4, 6] },
        ecn: { unit: '%', values: [1.2, 1.8, 2.4, 8.6, 7.9, 5.4, 6.8], alerts: [3, 4, 6] }
      },
      alarms: [
        { level: 'critical', object: 'Spine-3 / Queue7', time: '2026-03-16 21:13', summary: '出口队列 ECN 标记率高，伴随 no-buffer 丢包。', action: '优先检查 DCTCP / DCQCN 配置与负载分布' },
        { level: 'warning', object: 'Leaf-9', time: '2026-03-16 21:14', summary: 'PFC pause 帧速率短时升高。', action: '查看上下游口速匹配与队列水线' },
        { level: 'warning', object: 'GPU-Lab-16', time: '2026-03-16 21:15', summary: '目的端网卡 RX queue backlog 增加。', action: '排查主机端中断绑核与拥塞控制参数' }
      ],
      tasksOnLink: [
        { commId: 'CC-240316-014', task: 'MoE-Train / Gradient Sync', tenant: 'CN-AI-Lab', impact: '高', window: '21:10 - 21:18' },
        { commId: 'CC-240316-015', task: 'MoE-Train / Optimizer Update', tenant: 'CN-AI-Lab', impact: '中', window: '21:08 - 21:16' },
        { commId: 'CC-240316-018', task: 'Dataset Shuffle', tenant: 'Joint-Debug', impact: '中', window: '21:09 - 21:12' }
      ],
      actions: [
        '优先检查 Spine-3 出口队列与 ECN 门限是否先于 PFC 触发。',
        '若该链路长期高占用，建议进一步检查 ECMP / AILB 负载均衡效果。',
        '排查目的端服务器 RX queue 和 CPU 绑核配置。'
      ],
      diagnosis: [
        { item: 'PFC Deadlock 检测', result: 'warn', progress: 100, desc: '未形成 deadlock，但 pause 帧速率明显抬升。', owner: '交换机域' },
        { item: 'ECN / no-buffer 异常识别', result: 'fail', progress: 100, desc: 'Spine-3 Queue7 多次触发 ECN + no-buffer 告警，疑似主因。', owner: '拥塞域' },
        { item: '端侧网卡队列检查', result: 'warn', progress: 100, desc: '目的端 RX queue backlog 偏高，建议结合主机指标继续排查。', owner: '服务器域' }
      ]
    },
    {
      id: 'flow-003',
      range: ['1h', '4h'],
      srcIp: '10.88.15.21',
      srcPort: '60128',
      dstIp: '10.88.16.44',
      dstPort: '4791',
      throughput: 26.7,
      throughputText: '26.7 Gbps',
      latency: 38,
      latencyText: '38 μs',
      jitter: 14.4,
      jitterText: '14.4 μs',
      loss: 8,
      lossText: '8',
      status: 'warning',
      tenant: '58-AI-Train',
      commId: 'CC-240316-027',
      taskName: 'LLM-Train / Tensor Parallel',
      lastActive: '2026-03-16 21:19:08',
      hops: 4,
      diagnosisSummary: '链路整体可用，但存在轻微不均衡与抖动抬升。',
      summary: {
        pathType: '波动路径 / 单向流',
        pathId: 'PATH-5C88-817',
        packetMode: 'RoCEv2 / IFA',
        tenant: '58-AI-Train'
      },
      topology: {
        nodes: [
          { id: 'srv-src-3', label: 'GPU-Train-31', type: 'server', status: 'normal', sub: '10.88.15.21 / mlx5_0' },
          { id: 'leaf-6', label: 'Leaf-6', type: 'switch', status: 'warning', sub: 'Eth1/18 → Eth1/46' },
          { id: 'spine-5', label: 'Spine-5', type: 'switch', status: 'normal', sub: 'Eth1/6 → Eth1/8' },
          { id: 'leaf-11', label: 'Leaf-11', type: 'switch', status: 'warning', sub: 'Eth1/40 → Eth1/13' },
          { id: 'srv-dst-3', label: 'GPU-Train-44', type: 'server', status: 'normal', sub: '10.88.16.44 / mlx5_1' }
        ],
        links: [
          { from: 'srv-src-3', to: 'leaf-6', severity: 'normal', metrics: '26.9Gbps / 8μs' },
          { from: 'leaf-6', to: 'spine-5', severity: 'warning', metrics: '26.2Gbps / 13μs' },
          { from: 'spine-5', to: 'leaf-11', severity: 'warning', metrics: '25.8Gbps / 11μs' },
          { from: 'leaf-11', to: 'srv-dst-3', severity: 'normal', metrics: '26.7Gbps / 6μs' }
        ]
      },
      stateSummary: [
        { title: '端到端状态', severity: 'warning', desc: '存在轻微抖动抬升与少量估算丢包。' },
        { title: '链路负载均衡', severity: 'warning', desc: '平行路径间利用率差异偏大，可能存在 ECMP 倾斜。' },
        { title: '任务影响', severity: 'normal', desc: '当前对训练主任务影响可控，但需持续观察。' }
      ],
      trends: {
        throughput: { unit: 'Gbps', values: [26.1, 26.4, 26.5, 26.8, 26.2, 26.7, 26.7], alerts: [] },
        latency: { unit: 'μs', values: [22, 26, 28, 31, 35, 38, 37], alerts: [5, 6] },
        jitter: { unit: 'μs', values: [4, 6, 9, 11, 12, 14.4, 13], alerts: [5] },
        loss: { unit: 'pkt', values: [0, 0, 1, 3, 4, 8, 2], alerts: [5] },
        pfc: { unit: 'fps', values: [3, 4, 5, 6, 9, 14, 10], alerts: [5] },
        ecn: { unit: '%', values: [0.6, 0.8, 1.0, 1.2, 1.8, 2.6, 2.1], alerts: [5] }
      },
      alarms: [
        { level: 'warning', object: 'Leaf-6', time: '2026-03-16 21:09', summary: '平面内流量分布不均衡，存在热点倾向。', action: '检查 ECMP Hash 与 AILB 策略' },
        { level: 'warning', object: 'Leaf-11', time: '2026-03-16 21:17', summary: '瞬时 buffer 使用率升高。', action: '继续观察是否扩散至 spine' }
      ],
      tasksOnLink: [
        { commId: 'CC-240316-027', task: 'LLM-Train / Tensor Parallel', tenant: '58-AI-Train', impact: '中', window: '21:00 - 21:20' },
        { commId: 'CC-240316-029', task: 'LLM-Train / Pipeline Sync', tenant: '58-AI-Train', impact: '低', window: '21:06 - 21:14' }
      ],
      actions: [
        '核查 ECMP 哈希策略是否导致部分并行路径利用率偏低。',
        '若抖动继续上升，建议追加设备级 buffer / queue 细粒度指标。'
      ],
      diagnosis: [
        { item: 'ECMP 负载均衡检查', result: 'warn', progress: 100, desc: '路径利用率差异偏高，存在倾斜趋势。', owner: '转发表域' },
        { item: '队列拥塞检测', result: 'warn', progress: 100, desc: '暂未形成持续拥塞，但有轻微突发。', owner: '拥塞域' },
        { item: '训练主任务影响判断', result: 'pass', progress: 100, desc: '当前影响中等偏低，可持续观察。', owner: '业务域' }
      ]
    },
    {
      id: 'flow-004',
      range: ['12h', '24h'],
      srcIp: '172.18.4.11',
      srcPort: '48321',
      dstIp: '172.18.8.77',
      dstPort: '4791',
      throughput: 9.4,
      throughputText: '9.4 Gbps',
      latency: 1260,
      latencyText: '1260 μs',
      jitter: 214.8,
      jitterText: '214.8 μs',
      loss: 381,
      lossText: '381',
      status: 'critical',
      tenant: 'Joint-Debug',
      commId: 'CC-240316-041',
      taskName: 'Fault-Replay / Link Regression',
      lastActive: '2026-03-16 21:11:53',
      hops: 6,
      diagnosisSummary: '疑似 Leaf-14 ↔ Spine-7 路段持续拥塞并伴随配置不一致，建议立即定界。',
      summary: {
        pathType: '严重异常路径 / 单向流',
        pathId: 'PATH-E201-991',
        packetMode: 'RoCEv2 / IFA+MoD',
        tenant: 'Joint-Debug'
      },
      topology: {
        nodes: [
          { id: 'srv-src-4', label: 'Replay-Host-01', type: 'server', status: 'warning', sub: '172.18.4.11 / mlx5_0' },
          { id: 'leaf-14', label: 'Leaf-14', type: 'switch', status: 'critical', sub: 'Eth1/22 → Eth1/51' },
          { id: 'spine-7', label: 'Spine-7', type: 'switch', status: 'critical', sub: 'Eth1/4 → Eth1/16' },
          { id: 'leaf-19', label: 'Leaf-19', type: 'switch', status: 'warning', sub: 'Eth1/52 → Eth1/17' },
          { id: 'srv-dst-4', label: 'Replay-Host-09', type: 'server', status: 'warning', sub: '172.18.8.77 / mlx5_1' }
        ],
        links: [
          { from: 'srv-src-4', to: 'leaf-14', severity: 'warning', metrics: '11.2Gbps / 66μs' },
          { from: 'leaf-14', to: 'spine-7', severity: 'critical', metrics: '9.8Gbps / 640μs' },
          { from: 'spine-7', to: 'leaf-19', severity: 'critical', metrics: '9.1Gbps / 418μs' },
          { from: 'leaf-19', to: 'srv-dst-4', severity: 'warning', metrics: '9.4Gbps / 136μs' }
        ]
      },
      stateSummary: [
        { title: '端到端状态', severity: 'critical', desc: '时延、抖动、丢包均超出基线，故障影响显著。' },
        { title: '配置一致性', severity: 'critical', desc: 'Leaf-14 与 Spine-7 之间发现 PFC / ECN 门限策略不一致。' },
        { title: '业务影响', severity: 'warning', desc: '故障回放任务出现明显超时与重试。' }
      ],
      trends: {
        throughput: { unit: 'Gbps', values: [18.4, 16.2, 14.1, 11.8, 10.6, 9.4, 9.2], alerts: [3, 4, 5, 6] },
        latency: { unit: 'μs', values: [140, 220, 380, 610, 890, 1260, 1180], alerts: [3, 4, 5, 6] },
        jitter: { unit: 'μs', values: [18, 28, 44, 92, 138, 214.8, 201], alerts: [3, 4, 5, 6] },
        loss: { unit: 'pkt', values: [8, 14, 34, 96, 188, 381, 344], alerts: [3, 4, 5, 6] },
        pfc: { unit: 'fps', values: [18, 26, 44, 92, 146, 268, 241], alerts: [3, 4, 5, 6] },
        ecn: { unit: '%', values: [2.4, 3.1, 4.8, 7.9, 11.6, 15.8, 14.2], alerts: [3, 4, 5, 6] }
      },
      alarms: [
        { level: 'critical', object: 'Leaf-14', time: '2026-03-16 20:58', summary: 'PFC threshold mismatch，入口无损策略偏离基线。', action: '核查无损模板与接口 trust 配置' },
        { level: 'critical', object: 'Spine-7 / Queue5', time: '2026-03-16 21:02', summary: '持续 no-buffer 丢包，ECN 标记延后触发。', action: '下钻检查 queue/headroom/XOFF/XON 配置' },
        { level: 'warning', object: 'Replay-Host-09', time: '2026-03-16 21:04', summary: '训练回放任务发生多次超时重试。', action: '结合业务域日志核查训练中断原因' }
      ],
      tasksOnLink: [
        { commId: 'CC-240316-041', task: 'Fault-Replay / Link Regression', tenant: 'Joint-Debug', impact: '高', window: '20:50 - 21:10' },
        { commId: 'CC-240316-043', task: 'Replay / Queue Stress', tenant: 'Joint-Debug', impact: '高', window: '20:56 - 21:12' }
      ],
      actions: [
        '立即核查 Leaf-14 ↔ Spine-7 接口模板、PFC/ECN 触发门限与 trust 优先级配置。',
        '对该路径执行一键诊断结果导出，并联动设备 / 主机 / 业务三域同步排障。',
        '若属回放环境，可考虑临时切流至健康平面。'
      ],
      diagnosis: [
        { item: '无损配置一致性校验', result: 'fail', progress: 100, desc: '检测到 PFC / ECN 模板不一致，且 ECN 触发晚于预期。', owner: '配置域' },
        { item: '队列与 headroom 风险识别', result: 'fail', progress: 100, desc: 'Spine-7 Queue5 持续 no-buffer 丢包，拥塞风险高。', owner: '拥塞域' },
        { item: '训练中断影响判定', result: 'warn', progress: 100, desc: '业务层已出现超时重试，需要联合 AI Job 上下文进一步确认。', owner: '业务域' }
      ]
    },
    {
      id: 'flow-005',
      range: ['1h', '4h', '12h'],
      srcIp: '192.168.88.12',
      srcPort: '51001',
      dstIp: '192.168.90.31',
      dstPort: '4791',
      throughput: 14.8,
      throughputText: '14.8 Gbps',
      latency: 72,
      latencyText: '72 μs',
      jitter: 12.8,
      jitterText: '12.8 μs',
      loss: 3,
      lossText: '3',
      status: 'normal',
      tenant: 'Edge-Inference',
      commId: 'CC-240316-050',
      taskName: 'Inference / KV Sync',
      lastActive: '2026-03-16 21:20:05',
      hops: 3,
      diagnosisSummary: '整体正常，边缘推理任务链路稳定。',
      summary: {
        pathType: '边缘推理路径 / 单向流',
        pathId: 'PATH-7E11-211',
        packetMode: 'RoCEv2 / Flow View',
        tenant: 'Edge-Inference'
      },
      topology: {
        nodes: [
          { id: 'srv-src-5', label: 'Edge-GPU-01', type: 'server', status: 'normal', sub: '192.168.88.12 / mlx5_0' },
          { id: 'leaf-21', label: 'Leaf-21', type: 'switch', status: 'normal', sub: 'Eth1/12 → Eth1/30' },
          { id: 'leaf-22', label: 'Leaf-22', type: 'switch', status: 'normal', sub: 'Eth1/31 → Eth1/14' },
          { id: 'srv-dst-5', label: 'Edge-GPU-11', type: 'server', status: 'normal', sub: '192.168.90.31 / mlx5_1' }
        ],
        links: [
          { from: 'srv-src-5', to: 'leaf-21', severity: 'normal', metrics: '14.6Gbps / 22μs' },
          { from: 'leaf-21', to: 'leaf-22', severity: 'normal', metrics: '14.8Gbps / 31μs' },
          { from: 'leaf-22', to: 'srv-dst-5', severity: 'normal', metrics: '14.8Gbps / 19μs' }
        ]
      },
      stateSummary: [
        { title: '端到端状态', severity: 'normal', desc: '链路稳定，指标处于边缘推理业务基线。' },
        { title: '交换机负载', severity: 'normal', desc: 'Leaf-21 / Leaf-22 队列利用率平稳。' },
        { title: '业务观察', severity: 'normal', desc: '推理任务响应无异常。' }
      ],
      trends: {
        throughput: { unit: 'Gbps', values: [14.2, 14.4, 14.5, 14.6, 14.7, 14.8, 14.8], alerts: [] },
        latency: { unit: 'μs', values: [66, 68, 70, 72, 71, 72, 72], alerts: [] },
        jitter: { unit: 'μs', values: [8, 9, 10, 11, 12, 12.8, 12.3], alerts: [] },
        loss: { unit: 'pkt', values: [0, 0, 1, 1, 2, 3, 0], alerts: [] },
        pfc: { unit: 'fps', values: [1, 1, 1, 2, 2, 2, 1], alerts: [] },
        ecn: { unit: '%', values: [0.3, 0.3, 0.4, 0.4, 0.5, 0.5, 0.4], alerts: [] }
      },
      alarms: [
        { level: 'normal', object: 'Edge Path', time: '2026-03-16 21:00', summary: '当前路径无显著告警。', action: '无需处置' }
      ],
      tasksOnLink: [
        { commId: 'CC-240316-050', task: 'Inference / KV Sync', tenant: 'Edge-Inference', impact: '低', window: '21:00 - 21:20' }
      ],
      actions: [
        '保持当前链路策略即可。',
        '如需进一步优化，可增加同租户跨可用区路径对比。'
      ],
      diagnosis: [
        { item: '链路健康校验', result: 'pass', progress: 100, desc: '无显著时延 / 丢包异常。', owner: '网络域' },
        { item: '任务影响检查', result: 'pass', progress: 100, desc: '边缘推理业务未观察到性能退化。', owner: '业务域' }
      ]
    }
  ]
};
