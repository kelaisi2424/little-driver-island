// v1.9 任务玩法类型系统：决定 3D 场景里出现什么物体、HUD 显示什么、通关条件是什么。
// 每种 gameplayType 对应：
//  - 一组 missionParams（剧情决定）
//  - 一组 missionProgress（运行时累加）
//  - 一段 tick 逻辑（在 missionLogic.ts 里）
//  - 一组 3D 物体（在 MissionObjects.tsx 里）

export type GameplayType =
  | 'simpleDrive'        // 普通开到终点（兼容旧 100 关基础）
  | 'schoolPickup'       // 接送小朋友
  | 'delivery'           // 送货到指定颜色目的地
  | 'repairDelivery'     // 修车厂送零件（碰撞容忍度低）
  | 'trafficRule'        // 红绿灯路口
  | 'parking'            // 精准停车
  | 'rainyDrive'         // 雨天 + 水坑
  | 'colorRoute'         // 颜色路线
  | 'numberLane'         // 数字车道
  | 'multiStopRoute'     // 多站点
  | 'pedestrianYield'    // 斑马线让行
  | 'mixedMission';      // 综合任务

export type ColorKey = 'red' | 'blue' | 'yellow' | 'green';

export const COLOR_TABLE: Record<ColorKey, { hex: string; name: string }> = {
  red:    { hex: '#ef4444', name: '红色' },
  blue:   { hex: '#3b82f6', name: '蓝色' },
  yellow: { hex: '#facc15', name: '黄色' },
  green:  { hex: '#16a34a', name: '绿色' },
};

// =====================================================================
// MissionParams: 关卡剧情参数（来自 storyMissions.ts，运行时只读）
// =====================================================================

export interface PassengerStop {
  x: number;
  z: number;
  color: ColorKey;          // 小朋友衣服颜色
}

export interface DeliveryHouse {
  x: number;
  z: number;
  color: ColorKey;          // 屋子颜色
}

export interface NumberGate {
  x: number;
  z: number;
  number: number;           // 1-5
}

export interface ColorGate {
  x: number;
  z: number;
  color: ColorKey;
}

export interface MissionStop {
  x: number;
  z: number;
}

export interface PuddleSpot {
  x: number;
  z: number;
}

export interface TrafficLightSpot {
  z: number;                // 路口 z 坐标
  greenPhase: number;       // 绿灯起始秒
  redPhase: number;         // 红灯起始秒
  /** 周期总秒，绿+红+黄 */
  cycleSeconds: number;
}

export interface MissionParams {
  // schoolPickup
  passengerCount?: number;
  passengerStops?: PassengerStop[];

  // delivery / colorRoute
  targetColor?: ColorKey;
  deliveryHouses?: DeliveryHouse[];
  colorGates?: ColorGate[];

  // repairDelivery
  cargoEmoji?: string;       // 🛞 / 🔧 / 🎨
  cargoLabel?: string;       // "轮胎" / "工具"
  maxCollisions?: number;    // 默认 3

  // trafficRule
  trafficLights?: TrafficLightSpot[];

  // parking
  parkingZoneX?: number;     // 默认 0
  parkingZoneZ?: number;     // 默认 level.finishZ
  parkingZoneRadius?: number;// 默认 1.6
  parkingHoldTime?: number;  // 默认 1.0 秒
  parkingMaxSpeed?: number;  // 默认 3 m/s

  // numberLane
  targetNumbers?: number[];  // 按顺序经过这些数字
  numberGates?: NumberGate[];

  // multiStopRoute
  stops?: MissionStop[];

  // pedestrianYield
  crosswalkZ?: number;       // 斑马线 z 位置（默认 -22）
  yieldRadius?: number;      // 进入此区半径要慢
  pedestrianSpeed?: number;  // 行人横穿速度

  // rainyDrive
  puddles?: PuddleSpot[];
  maxPuddleSplash?: number;  // 默认 2

  // mixedMission
  subTypes?: GameplayType[]; // 组合的子类型
}

// =====================================================================
// MissionProgress: 运行时状态（mutable，每帧累加）
// =====================================================================

export interface MissionProgress {
  // 通用
  collisions: number;
  startMs: number;

  // simpleDrive / multiStopRoute / numberLane
  checkpointsHit: number;
  /** 通过的 stop / numberGate / colorGate / trafficLight 索引集合 */
  visitedIndices: number[];

  // schoolPickup
  passengersPickedUp: number;
  /** 当前已接的 stop 索引集 */
  pickedStopIndices: number[];
  /** 在 stop 上累计停留时间（秒） */
  currentStopHoldTime: number;
  /** 当前候选 stop 索引 */
  currentStopIndex: number | null;

  // delivery / colorRoute
  deliveredCorrect: boolean;
  /** 错误送达提示去重 */
  lastWrongDeliveryAt: number;

  // parking
  parkingHoldTime: number;
  parkingInZone: boolean;
  parkingComplete: boolean;

  // trafficRule
  lightsPassed: number;
  currentLightIndex: number;
  /** 是否当前灯区内已停过（防止冲过去算"未停"） */
  stoppedAtCurrentLight: boolean;

  // pedestrianYield
  pedestrianStarted: boolean;
  pedestrianCrossingProgress: number;   // 0..1
  pedestrianYielded: boolean;             // 玩家是否已让行
  yieldStarted: boolean;                   // 玩家是否进入让行区
  yieldHoldTime: number;

  // rainyDrive
  puddlesSplashed: number;
  /** 上次溅水时间（防抖） */
  lastSplashAt: number;

  // 通用：本关已"完成主目标"（适合 schoolPickup 等先做小目标后到终点）
  primaryDone: boolean;

  /** 完成关卡的最终标志 */
  finished: boolean;
}

export function createMissionProgress(): MissionProgress {
  return {
    collisions: 0,
    startMs: Date.now(),
    checkpointsHit: 0,
    visitedIndices: [],
    passengersPickedUp: 0,
    pickedStopIndices: [],
    currentStopHoldTime: 0,
    currentStopIndex: null,
    deliveredCorrect: false,
    lastWrongDeliveryAt: 0,
    parkingHoldTime: 0,
    parkingInZone: false,
    parkingComplete: false,
    lightsPassed: 0,
    currentLightIndex: 0,
    stoppedAtCurrentLight: false,
    pedestrianStarted: false,
    pedestrianCrossingProgress: 0,
    pedestrianYielded: false,
    yieldStarted: false,
    yieldHoldTime: 0,
    puddlesSplashed: 0,
    lastSplashAt: 0,
    primaryDone: false,
    finished: false,
  };
}

export function resetMissionProgress(p: MissionProgress): void {
  const init = createMissionProgress();
  Object.assign(p, init);
}
