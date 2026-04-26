// ===== 主闯关模式（核心，重构重点） =====

// 应用页面状态机
export type Screen =
  | 'home'
  | 'level-select'
  | 'play'
  | 'play3d'        // 3D 驾驶模式（v7 新增）
  | 'complete'
  | 'rest'
  | 'parent'
  | 'stickers'
  | 'minigames';

// 关卡的核心机制类型
export type LevelKind =
  | 'drive'         // 自由开（直路到终点）
  | 'dodge'         // 躲障碍（路锥）
  | 'lane'          // 走指定数字车道
  | 'wait-light'    // 红灯停 / 绿灯行
  | 'park'          // 停进 P 车位
  | 'pedestrian'    // 让行人
  | 'pickup'        // 接小朋友
  | 'arrive';       // 综合：安全到达

// 关卡定义
export interface PlayLevel {
  id: number;                   // 1..10
  title: string;                // 第 1 关名字
  intro: string;                // 关卡开始前一句提示
  summary: string;              // 通关后一句学习总结
  kind: LevelKind;
  duration: number;             // 关卡时长（秒）
  // kind 相关参数
  targetLane?: 0 | 1 | 2;       // lane 关卡: 必须停留的车道 (0左 1中 2右)
  targetNumber?: number;        // lane 关卡: 显示的数字
  pickupCount?: number;         // pickup 关卡: 要接的小朋友数
  stickerId?: string;           // 通关奖励贴纸（可选）
}

// 关卡通关回调载荷
export interface PlayCompletePayload {
  levelId: number;
  stars: number;
  elapsedSeconds: number;
}

// ===== 家长设置 =====

export interface ParentConfig {
  voiceEnabled: boolean;
  dailyMinutes: number;         // 每日时长（10/15/20）
  restAfterLevels: number;      // 连续 N 关后强制休息（3/5/8）
  reminder: string;             // 休息页文字
  // v1.7：是否在首页显示"挑战闯关"入口（默认 true）
  challengeEnabled?: boolean;
  // 兼容字段（不再使用，留着别让旧文件爆掉）
  totalTasks?: number;
  dailyLimit?: number;
}

// ===== 关卡选择 / 进度 =====

export interface LevelStars {
  [levelId: string]: number;    // 每关获得的星星数
}

export interface PlayProgress {
  currentLevel: number;         // 解锁到第几关（1..10）
  stars: LevelStars;
}

// ====================================================================
// 以下为旧类型，仅为旧代码（mini-games / canvas）保留编译兼容
// 主闯关流程不再使用
// ====================================================================

export type DrivingScreen =
  | 'garage'
  | 'car-select'
  | 'level-select'
  | 'mission'
  | 'drive'
  | 'complete'
  | 'rest'
  | 'parent'
  | 'stickers';

export type CarId = 'red-car' | 'blue-car' | 'yellow-bus' | 'green-truck';

export type DrivingLevelType =
  | 'starter' | 'parking' | 'traffic' | 'bus' | 'curve' | 'school';

export type GameId =
  | 'parking-move'
  | 'car-rush'
  | 'bus-pickup'
  | 'jump-car'
  | 'find-car'
  | 'tire-roll';

export interface GameDefinition {
  id: GameId;
  icon: string;
  title: string;
  tag: string;
  color: string;
  stickerId: string;
}

export interface LevelDefinition {
  gameId: GameId;
  level: number;
  goal: string;
  difficulty: 1 | 2 | 3;
  learningGoal: string;
  summary: string;
  config?: Record<string, unknown>;
}

export interface LevelCompletePayload {
  gameId: GameId;
  level: number;
  stars: number;
  stickerId?: string;
  learningGoal: string;
  summary: string;
}

export interface CarDefinition {
  id: CarId;
  name: string;
  shortName: string;
  bodyColor: string;
  roofColor: string;
  accentColor: string;
  emoji: string;
}

export interface DrivingLevel {
  id: number;
  category: DrivingLevelType;
  categoryName: string;
  indexInCategory: number;
  name: string;
  mission: string;
  learningGoal: string;
  summary: string;
  map: 'straight' | 'curve' | 'traffic' | 'parking' | 'bus' | 'school';
  difficulty: 1 | 2 | 3;
  checkpoints: number;
  obstacles: 'none' | 'cones' | 'water' | 'people' | 'mixed';
  stickerId?: string;
}

export interface DrivingCompletePayload {
  level: DrivingLevel;
  stars: number;
  elapsedSeconds: number;
}

export interface LevelGameProps {
  level: LevelDefinition;
  onComplete: (payload: LevelCompletePayload) => void;
  onFail?: () => void;
}

export interface MiniGameProps {
  onComplete: (payload: Record<string, unknown>) => void;
}

export type GameMode = 'learning' | 'game';

export type TaskType =
  | 'traffic-light' | 'parking' | 'color-repair'
  | 'crosswalk' | 'pedestrian' | 'red-light' | 'seatbelt';

export interface TaskComponentProps {
  onComplete: () => void;
  mode: GameMode;
}
