// 关卡模板：每个章节的"基本玩法配方"。
// 生成器读这些配方 + 章内序号 → 自动生成 100 关的具体配置。
//
// 设计原则：
// 1. 不引入新的 Three.js 渲染逻辑——把每章的"主题"映射到现有 5 种 kind
//    (finish / cones / checkpoints / traffic / parking) 上。
// 2. 通过模板里的 conesPattern / checkpointsPattern / titles / missions
//    让每关的视觉/任务/学习点不同，但不需要写 100 份代码。

import type { Level3DKind } from './levels3d';

// 障碍 / 检查点的横向位置模板（左 -2.0，中 0，右 +2.0）
export type LanePos = -2 | -1 | 0 | 1 | 2;

export interface ChapterTemplate {
  chapterId: number;
  primaryKind: Level3DKind;             // 默认玩法
  // 章内 10 关每关使用什么 kind（让综合关也能切换）
  kindByLevel?: Level3DKind[];
  // 命名生成
  baseTitles: string[];                 // 至少 10 个标题种子
  baseMission: (n: number) => string;   // 章内第 n 关的任务文案
  baseSummary: (n: number) => string;   // 通关学习点
  baseLearningGoal: string;             // 章节统一学习目标
  // 关卡参数（按章内序号 n=1..10 计算）
  roadLength: (n: number) => number;
  finishZ: (n: number) => number;
  conesPattern?: (n: number) => Array<{ x: number; z: number }>;
  checkpointsPattern?: (n: number) => Array<{ x: number; z: number }>;
  difficulty: (n: number) => 1 | 2 | 3 | 4 | 5;
}

// 工具：给定章内序号 n（1..10），把障碍按等距间隔分布到 [-startZ, finishZ]
function spreadObstacles(n: number, count: number, startZ: number, endZ: number): Array<{ x: number; z: number }> {
  const items: Array<{ x: number; z: number }> = [];
  const step = (startZ - endZ) / (count + 1);
  // 用伪随机但确定（与 n 绑定）的横向位置
  for (let i = 0; i < count; i++) {
    const z = startZ - step * (i + 1);
    // x 在 [-2, +2] 之间根据 i 和 n 交替
    const lane = ((i + n) % 4) - 1.5; // -1.5, -0.5, 0.5, 1.5
    items.push({ x: lane * 1.4, z });
  }
  return items;
}

function checkpointLine(n: number, count: number, startZ: number, endZ: number): Array<{ x: number; z: number }> {
  const items: Array<{ x: number; z: number }> = [];
  const step = (startZ - endZ) / (count + 1);
  for (let i = 0; i < count; i++) {
    const z = startZ - step * (i + 1);
    // x 在 [-1.8, +1.8] 之间，按 (n+i) 决定
    const slot = ((n + i) % 3) - 1; // -1, 0, 1
    items.push({ x: slot * 1.7, z });
  }
  return items;
}

const baseDifficulty = (chapterId: number, n: number): 1 | 2 | 3 | 4 | 5 => {
  // v15 escalation：章节 + 章内序号双重升级
  const base = Math.ceil(chapterId / 2);     // 1..5
  const bonus = n >= 8 ? 1 : n >= 5 ? 0 : -1; // 章前轻松，章末加难
  return Math.min(5, Math.max(1, base + bonus)) as 1 | 2 | 3 | 4 | 5;
};

const baseRoadLength = (chapterId: number, n: number): number =>
  // v15 escalation：路更长（章末明显比章首长 36 米）
  118 + chapterId * 5 + n * 4;

const baseFinishZ = (length: number): number => -(length - 22);

// v15 escalation：障碍/检查点数量按章内进度严格递增
// n=1..10 → 大致 floor((n+offset)/2) 让 1→1, 2→1, 3→2, 4→2, 5→3, 6→3, 7→4, 8→4, 9→5, 10→5
function rampCount(n: number, min: number, max: number): number {
  const step = Math.floor((n + 1) / 2);   // 1,1,2,2,3,3,4,4,5,5
  return Math.max(min, Math.min(max, min + step - 1));
}

// =============== 10 章模板 ===============

export const TEMPLATES: readonly ChapterTemplate[] = [
  // 章 1：新手上路 —— 直路开到终点
  {
    chapterId: 1,
    primaryKind: 'finish',
    baseTitles: [
      '开到终点', '慢慢转弯', '沿中间线开', '轻踩油门', '看到终点线',
      '小弯道练习', '左右转一转', '慢慢刹车', '不开出道路', '新手小司机',
    ],
    baseMission: (n) => n <= 3
      ? '按住油门，沿着路开到终点。'
      : n <= 6
      ? '慢慢按油门，记得用左右方向。'
      : '熟练掌握油门、刹车、方向，开到终点。',
    baseSummary: (n) => n <= 3
      ? '小车沿着路走，又稳又安全。'
      : n <= 6
      ? '油门轻一点，小车更好控制。'
      : '熟练油门和方向，开车更轻松。',
    baseLearningGoal: '熟悉小车的基本操作',
    roadLength: (n) => 110 + n * 3,
    finishZ: (n) => -(110 + n * 3 - 22),
    difficulty: (n) => baseDifficulty(1, n),
  },

  // 章 2：障碍小路 —— cones
  {
    chapterId: 2,
    primaryKind: 'cones',
    baseTitles: [
      '一个路锥', '两个路锥', '三个路锥', '左右连续路锥', '路锥小迷宫',
      '路锥前方', '弯道路锥', '小障碍练习', '路锥多多', '障碍小能手',
    ],
    baseMission: () => '前面有路锥，慢慢绕过去。',
    baseSummary: (n) => n <= 4
      ? '看到路锥，要慢慢绕开。'
      : n <= 7
      ? '看到障碍要提前减速。'
      : '看清前方路锥，安全绕过去。',
    baseLearningGoal: '看到障碍要慢慢绕开',
    roadLength: (n) => baseRoadLength(2, n),
    finishZ: (n) => baseFinishZ(baseRoadLength(2, n)),
    conesPattern: (n) => spreadObstacles(n, rampCount(n, 1, 6), -28, -(baseRoadLength(2, n) - 30)),
    difficulty: (n) => baseDifficulty(2, n),
  },

  // 章 3：数字车道 —— checkpoints（提示孩子去对应数字位置）
  {
    chapterId: 3,
    primaryKind: 'checkpoints',
    baseTitles: [
      '走 1 号车道', '走 2 号车道', '走 3 号车道', '1 号到 2 号',
      '2 号到 3 号', '走 4 号车道', '走 5 号车道', '数字接力',
      '数字组合', '数字车道达人',
    ],
    baseMission: (n) => `请按编号车道开过去（共 ${rampCount(n, 1, 5)} 个数字）。`,
    baseSummary: (n) => n <= 5
      ? `这是数字 ${n}，认识它真棒！`
      : '看清数字再开，不会走错路。',
    baseLearningGoal: '认识数字 1-5',
    roadLength: (n) => baseRoadLength(3, n),
    finishZ: (n) => baseFinishZ(baseRoadLength(3, n)),
    checkpointsPattern: (n) => checkpointLine(n, rampCount(n, 1, 5), -25, -(baseRoadLength(3, n) - 30)),
    difficulty: (n) => baseDifficulty(3, n),
  },

  // 章 4：红绿灯路口 —— traffic
  {
    chapterId: 4,
    primaryKind: 'traffic',
    baseTitles: [
      '红灯停一停', '绿灯通过', '黄灯减速', '路口慢一点', '看灯再开',
      '两个路口', '路口左转', '路口右转', '复杂路口', '红绿灯小卫士',
    ],
    baseMission: () => '红灯前停下来，等绿灯再走。',
    baseSummary: () => '红灯停，绿灯行，安全第一。',
    baseLearningGoal: '红灯停，绿灯行',
    roadLength: (n) => baseRoadLength(4, n),
    finishZ: (n) => baseFinishZ(baseRoadLength(4, n)),
    checkpointsPattern: (n) => checkpointLine(n, rampCount(n, 1, 4), -50, -(baseRoadLength(4, n) - 30)),
    difficulty: (n) => baseDifficulty(4, n),
  },

  // 章 5：停车训练 —— parking
  {
    chapterId: 5,
    primaryKind: 'parking',
    baseTitles: [
      '停进 P 位', '直线停车', '侧边停车', '避锥停车', '指定数字车位',
      '指定颜色车位', '窄位停车', '远位停车', '复杂停车', '停车小高手',
    ],
    baseMission: () => '把车慢慢开进 P 停车框。',
    baseSummary: (n) => n <= 5
      ? 'P 是停车的地方。'
      : '停车要慢慢来，看清车位。',
    baseLearningGoal: '停车要慢慢来',
    roadLength: (n) => 100 + n * 4,
    finishZ: (n) => -(80 + n * 4),
    difficulty: (n) => baseDifficulty(5, n),
  },

  // 章 6：安全让行 —— checkpoints（每个 checkpoint 当作"让行点"）
  {
    chapterId: 6,
    primaryKind: 'checkpoints',
    baseTitles: [
      '斑马线前停', '让小朋友', '让校车', '路口让行', '行人优先',
      '两次让行', '十字路口让', '高速路口让', '幼儿园门口让', '礼让小司机',
    ],
    baseMission: () => '看到行人要停一停，让他们先走。',
    baseSummary: () => '看到行人要让一让，安全又有礼貌。',
    baseLearningGoal: '看到行人要让一让',
    roadLength: (n) => baseRoadLength(6, n),
    finishZ: (n) => baseFinishZ(baseRoadLength(6, n)),
    checkpointsPattern: (n) => checkpointLine(n, rampCount(n, 1, 4), -32, -(baseRoadLength(6, n) - 30)),
    difficulty: (n) => baseDifficulty(6, n),
  },

  // 章 7：天气挑战 —— cones（水坑当作路锥）
  {
    chapterId: 7,
    primaryKind: 'cones',
    baseTitles: [
      '小雨开车', '一个水坑', '两个水坑', '三个水坑', '弯道雨天',
      '湿滑路面', '雨天减速', '雨夜驾驶', '复杂雨天', '雨天慢行星',
    ],
    baseMission: () => '前面有水坑，慢慢绕过去。',
    baseSummary: (n) => n <= 4
      ? '雨天开车要慢一点。'
      : '看到水坑要避让，雨天更要慢。',
    baseLearningGoal: '下雨天要慢一点',
    roadLength: (n) => baseRoadLength(7, n),
    finishZ: (n) => baseFinishZ(baseRoadLength(7, n)),
    // 章 7 雨天：障碍数比章 2 多 +1，体现"雨天更难"
    conesPattern: (n) => spreadObstacles(n, rampCount(n, 2, 7), -28, -(baseRoadLength(7, n) - 30)),
    difficulty: (n) => baseDifficulty(7, n),
  },

  // 章 8：小巴士接送 —— checkpoints（接到一个小朋友 = 通过一个 checkpoint）
  {
    chapterId: 8,
    primaryKind: 'checkpoints',
    baseTitles: [
      '接 1 个小朋友', '接 2 个小朋友', '接 3 个小朋友', '接 4 个小朋友',
      '接 5 个小朋友', '送到幼儿园', '雨天接送', '复杂路线接送',
      '上下学接送', '小巴士队长',
    ],
    baseMission: (n) => `接 ${rampCount(n, 1, 5)} 个小朋友去幼儿园。`,
    baseSummary: () => '一个一个数清楚，小朋友安安全全到家。',
    baseLearningGoal: '数量对应 + 排队',
    roadLength: (n) => baseRoadLength(8, n),
    finishZ: (n) => baseFinishZ(baseRoadLength(8, n)),
    checkpointsPattern: (n) => checkpointLine(n, rampCount(n, 1, 5), -28, -(baseRoadLength(8, n) - 30)),
    difficulty: (n) => baseDifficulty(8, n),
  },

  // 章 9：颜色路线 —— checkpoints（每个 checkpoint 一种颜色目标）
  {
    chapterId: 9,
    primaryKind: 'checkpoints',
    baseTitles: [
      '红色路线', '蓝色路线', '黄色路线', '绿色路线', '红黄路线',
      '蓝绿路线', '彩色车库', '颜色拼接', '颜色 + 数字', '颜色路线王',
    ],
    baseMission: () => '按颜色目标开过对应光圈。',
    baseSummary: () => '认清颜色再走，路线就不会错。',
    baseLearningGoal: '颜色识别',
    roadLength: (n) => baseRoadLength(9, n),
    finishZ: (n) => baseFinishZ(baseRoadLength(9, n)),
    checkpointsPattern: (n) => checkpointLine(n, rampCount(n, 2, 5), -28, -(baseRoadLength(9, n) - 30)),
    difficulty: (n) => baseDifficulty(9, n),
  },

  // 章 10：安全驾驶大师 —— 每关切换不同 kind 综合复习
  {
    chapterId: 10,
    primaryKind: 'cones',
    kindByLevel: [
      'cones',         // 91 障碍 + 灯
      'checkpoints',   // 92 数字 + 停
      'traffic',       // 93 让行 + 园
      'cones',         // 94 雨 + 锥
      'checkpoints',   // 95 颜色 + 检查点
      'parking',       // 96 综合停车
      'cones',         // 97 大障碍
      'checkpoints',   // 98 长检查
      'traffic',       // 99 全景路口
      'parking',       // 100 安全到达幼儿园
    ],
    baseTitles: [
      '障碍冲刺', '数字综合', '路口让行', '雨天障碍', '颜色检查',
      '综合停车', '大障碍练习', '长检查路线', '全景路口', '安全到达幼儿园',
    ],
    baseMission: (n) => n === 10
      ? '安全开到幼儿园，毕业关！'
      : '综合关：看路、看灯、看人，安全通过。',
    baseSummary: (n) => n === 10
      ? '一路看灯、看路、慢慢开，就能安全到达！'
      : '综合驾驶：稳一点，安全最重要。',
    baseLearningGoal: '综合安全驾驶',
    // 章 10：路径最长 + 障碍最多，毕业关 100 米路 + 7 路锥
    roadLength: (n) => 160 + n * 6,
    finishZ: (n) => -(135 + n * 6),
    conesPattern: (n) => spreadObstacles(n, rampCount(n, 3, 7), -28, -(135 + n * 6 - 30)),
    checkpointsPattern: (n) => checkpointLine(n, rampCount(n, 2, 5), -32, -(135 + n * 6 - 30)),
    difficulty: () => 5,
  },
];

export function getTemplate(chapterId: number): ChapterTemplate {
  return TEMPLATES.find((t) => t.chapterId === chapterId) ?? TEMPLATES[0];
}
