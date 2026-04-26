// v1.9 任务逻辑：每帧调用 tickMission()，根据 gameplayType 决定何时通关、给什么提示。
// DrivingScene 不直接知道每种玩法的细节；统一通过这里返回的事件来响应。

import type { Level3D } from '../data/levels3d';
import type { StoryMission } from '../data/storyMissions';
import type {
  GameplayType,
  MissionParams,
  MissionProgress,
} from './missionObjectives';
import { COLOR_TABLE } from './missionObjectives';

export interface DrivingFrameInput {
  positionX: number;
  positionZ: number;
  speed: number;          // m/s
  delta: number;          // 当前帧时长
  collisionThisFrame: boolean;  // 撞锥（标准物理层算出来的）
}

export interface MissionTickResult {
  /** 任务完成 */
  completed: boolean;
  /** 一次性事件（同帧只能触发一个，DrivingScene 用来播音 + 提示） */
  event?:
    | { type: 'pickup'; stopIndex: number; total: number; pickedUp: number }
    | { type: 'delivery-correct' }
    | { type: 'delivery-wrong' }
    | { type: 'light-pass'; lightIndex: number; total: number }
    | { type: 'light-violation'; lightIndex: number }
    | { type: 'number-correct'; number: number }
    | { type: 'number-wrong'; number: number }
    | { type: 'color-correct' }
    | { type: 'color-wrong' }
    | { type: 'stop-visited'; index: number; total: number }
    | { type: 'puddle-splash' }
    | { type: 'pedestrian-yielded' }
    | { type: 'pedestrian-passed' }
    | { type: 'parking-progress'; pct: number }
    | { type: 'parking-success' }
    | { type: 'cargo-warning' };
  /** 速度修正（雨天打滑、撞锥反弹），DrivingScene 应用到 state.speed */
  speedFactor?: number;
  /** 提示文字（5 岁孩子能懂） */
  hint?: string;
}

const NO_RESULT: MissionTickResult = { completed: false };

// =====================================================================
// 各种玩法的 tick 逻辑
// =====================================================================

function tickSimpleDrive(
  level: Level3D,
  state: DrivingFrameInput,
  progress: MissionProgress,
): MissionTickResult {
  // 1. 沿用旧 checkpoints 数组逻辑：所有 checkpoint 都过完且车到 finishZ
  if (level.checkpoints.length > 0) {
    const next = level.checkpoints[progress.checkpointsHit];
    if (next) {
      const dx = state.positionX - next.x;
      const dz = state.positionZ - next.z;
      if (Math.hypot(dx, dz) < 1.6) {
        progress.checkpointsHit += 1;
        return {
          completed: false,
          event: { type: 'stop-visited', index: progress.checkpointsHit, total: level.checkpoints.length },
          hint: '通过检查点！',
        };
      }
    }
  }
  const allCheckpointsDone = progress.checkpointsHit >= level.checkpoints.length;
  const finishReached = state.positionZ <= level.finishZ;
  if (allCheckpointsDone && finishReached) {
    return { completed: true, hint: '到达终点！' };
  }
  return NO_RESULT;
}

function tickSchoolPickup(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
): MissionTickResult {
  const stops = params.passengerStops ?? [];
  const totalPassengers = params.passengerCount ?? stops.length;

  // 还没接齐：检查是否在某个 stop 附近且足够慢
  if (progress.passengersPickedUp < totalPassengers && stops.length > 0) {
    let nearestIndex = -1;
    let nearestDist = Infinity;
    for (let i = 0; i < stops.length; i++) {
      if (progress.pickedStopIndices.includes(i)) continue;
      const dx = state.positionX - stops[i].x;
      const dz = state.positionZ - stops[i].z;
      const d = Math.hypot(dx, dz);
      if (d < 2.2 && d < nearestDist) {
        nearestDist = d;
        nearestIndex = i;
      }
    }
    if (nearestIndex >= 0) {
      // 在 stop 范围内
      if (state.speed < 2.5) {
        // 在停下后立即接走 —— 不强制等 1 秒，避免低龄孩子抓狂
        progress.pickedStopIndices.push(nearestIndex);
        progress.passengersPickedUp += 1;
        progress.currentStopIndex = null;
        progress.currentStopHoldTime = 0;
        const done = progress.passengersPickedUp >= totalPassengers;
        if (done) progress.primaryDone = true;
        return {
          completed: false,
          event: {
            type: 'pickup',
            stopIndex: nearestIndex,
            total: totalPassengers,
            pickedUp: progress.passengersPickedUp,
          },
          hint: done ? '小朋友都上车啦，开去幼儿园！' : '小朋友上车啦',
        };
      } else {
        progress.currentStopIndex = nearestIndex;
        // 高速进 stop 区给个温和提示
        if (state.speed > 7) {
          return { completed: false, hint: '到站啦，慢慢停' };
        }
      }
    } else {
      progress.currentStopIndex = null;
    }
    return NO_RESULT;
  }

  // 接齐了，需要到达终点 + 慢
  const finishReached = state.positionZ <= level.finishZ;
  if (finishReached && state.speed < 4) {
    return { completed: true, hint: '安全到幼儿园啦！' };
  }
  return NO_RESULT;
}

function tickDelivery(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
): MissionTickResult {
  const houses = params.deliveryHouses ?? [];
  const target = params.targetColor;
  if (!target || houses.length === 0) {
    // fallback to simpleDrive
    return tickSimpleDrive(level, state, progress);
  }

  // 检查靠近哪栋屋子
  for (let i = 0; i < houses.length; i++) {
    const h = houses[i];
    const d = Math.hypot(state.positionX - h.x, state.positionZ - h.z);
    if (d < 1.8 && state.speed < 4.5) {
      if (h.color === target) {
        if (!progress.deliveredCorrect) {
          progress.deliveredCorrect = true;
          progress.primaryDone = true;
          return { completed: true, event: { type: 'delivery-correct' }, hint: '送达成功！' };
        }
      } else {
        // 错误送达 —— 提示 + 防抖 1.5 秒
        const now = Date.now();
        if (now - progress.lastWrongDeliveryAt > 1500) {
          progress.lastWrongDeliveryAt = now;
          return {
            completed: false,
            event: { type: 'delivery-wrong' },
            hint: `不是这里哦，找${COLOR_TABLE[target].name}的屋子`,
          };
        }
      }
    }
  }
  return NO_RESULT;
}

function tickRepairDelivery(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
): MissionTickResult {
  // 行为像 simpleDrive，但碰撞会触发警告
  if (state.collisionThisFrame) {
    progress.collisions += 1;
    const max = params.maxCollisions ?? 3;
    if (progress.collisions === Math.max(1, max - 1)) {
      return {
        completed: false,
        event: { type: 'cargo-warning' },
        hint: '慢一点，零件要掉啦！',
      };
    }
  }
  // 走 simpleDrive 路径完成
  return tickSimpleDrive(level, state, progress);
}

function tickTrafficRule(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
  nowMs: number,
): MissionTickResult {
  const lights = params.trafficLights ?? [];
  if (lights.length === 0) {
    return tickSimpleDrive(level, state, progress);
  }

  // 当前灯
  const idx = progress.currentLightIndex;
  if (idx >= lights.length) {
    // 全部通过 → 走 simpleDrive 终点判断
    return tickSimpleDrive(level, state, progress);
  }
  const light = lights[idx];
  const stopLineZ = light.z + 4;        // 停止线在路口前 4 米
  const lightDist = state.positionZ - light.z;  // 正值：还在前面（z 更大）

  // 计算当前灯色
  const phase = ((nowMs / 1000) % light.cycleSeconds + light.cycleSeconds) % light.cycleSeconds;
  const isRed = phase < light.redPhase;
  const isYellow = !isRed && phase < light.redPhase + 1.0;
  // const isGreen = !isRed && !isYellow;  // 未直接使用

  // 进入停止线前 + 红灯：必须停
  if (lightDist > 0 && lightDist < 5) {
    if (isRed && state.speed < 1.0 && state.positionZ > light.z + 2.5) {
      progress.stoppedAtCurrentLight = true;
    }
    if (isYellow && state.speed > 8) {
      return { completed: false, hint: '黄灯减速哦' };
    }
    if (isRed && state.speed > 3 && state.positionZ < light.z + 5 && state.positionZ > light.z + 1.5) {
      // 速度高于 3 m/s 且接近停止线 → 警告
      return { completed: false, hint: '红灯亮了，要停下来哦' };
    }
  }

  // 越过路口
  if (state.positionZ < light.z - 1.5) {
    if (isRed && !progress.stoppedAtCurrentLight) {
      // 闯红灯，但游戏不淘汰；只提示 + 不计数
      progress.currentLightIndex += 1;
      return {
        completed: false,
        event: { type: 'light-violation', lightIndex: idx },
        hint: '红灯不能闯，下次记得停！',
      };
    }
    progress.currentLightIndex += 1;
    progress.lightsPassed += 1;
    progress.stoppedAtCurrentLight = false;
    return {
      completed: false,
      event: { type: 'light-pass', lightIndex: idx, total: lights.length },
      hint: '通过路口！',
    };
  }
  return NO_RESULT;
}

function tickParking(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
): MissionTickResult {
  const zoneX = params.parkingZoneX ?? 0;
  const zoneZ = params.parkingZoneZ ?? level.finishZ;
  const radius = params.parkingZoneRadius ?? 1.6;
  const holdGoal = params.parkingHoldTime ?? 1.0;
  const maxSpeed = params.parkingMaxSpeed ?? 3.0;

  const dist = Math.hypot(state.positionX - zoneX, state.positionZ - zoneZ);
  const inZone = dist < radius;
  progress.parkingInZone = inZone;
  if (inZone && state.speed < maxSpeed) {
    progress.parkingHoldTime += state.delta;
    const pct = Math.min(1, progress.parkingHoldTime / holdGoal);
    if (progress.parkingHoldTime >= holdGoal) {
      if (!progress.parkingComplete) {
        progress.parkingComplete = true;
        return { completed: true, event: { type: 'parking-success' }, hint: '停车成功！' };
      }
      return { completed: true };
    }
    return {
      completed: false,
      event: { type: 'parking-progress', pct },
      hint: state.speed > 2 ? '慢一点，再轻一点' : '保持不动…',
    };
  }
  // 离开停车区清零
  progress.parkingHoldTime = 0;
  return NO_RESULT;
}

function tickRainyDrive(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
  nowMs: number,
): MissionTickResult {
  const puddles = params.puddles ?? [];
  // 判断有没有压到水坑
  for (const p of puddles) {
    const d = Math.hypot(state.positionX - p.x, state.positionZ - p.z);
    if (d < 1.0 && nowMs - progress.lastSplashAt > 700) {
      progress.lastSplashAt = nowMs;
      progress.puddlesSplashed += 1;
      const speedFactor = state.speed > 8 ? 0.55 : 0.78;  // 高速更滑
      return {
        completed: false,
        event: { type: 'puddle-splash' },
        speedFactor,
        hint: state.speed > 8 ? '雨天太快啦，慢一点！' : '小心水坑',
      };
    }
  }
  // 雨天没特殊检查点 → 走 simpleDrive 完成
  return tickSimpleDrive(level, state, progress);
}

function tickColorRoute(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
): MissionTickResult {
  const target = params.targetColor;
  const gates = params.colorGates ?? [];
  if (!target || gates.length === 0) {
    return tickSimpleDrive(level, state, progress);
  }
  // 检查通过哪个 gate
  for (let i = 0; i < gates.length; i++) {
    if (progress.visitedIndices.includes(i)) continue;
    const g = gates[i];
    const d = Math.hypot(state.positionX - g.x, state.positionZ - g.z);
    if (d < 1.7) {
      progress.visitedIndices.push(i);
      if (g.color === target) {
        const totalCorrect = gates.filter((x) => x.color === target).length;
        const correctCount = progress.visitedIndices.filter((idx) => gates[idx].color === target).length;
        if (correctCount >= totalCorrect) progress.primaryDone = true;
        return {
          completed: false,
          event: { type: 'color-correct' },
          hint: `${COLOR_TABLE[target].name}路线 ${correctCount}/${totalCorrect}`,
        };
      } else {
        return {
          completed: false,
          event: { type: 'color-wrong' },
          hint: `不是这里，找${COLOR_TABLE[target].name}光圈`,
        };
      }
    }
  }
  // 完成主目标 + 到终点 → 通关
  if (progress.primaryDone && state.positionZ <= level.finishZ) {
    return { completed: true, hint: '颜色路线完成！' };
  }
  return NO_RESULT;
}

function tickNumberLane(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
): MissionTickResult {
  const targets = params.targetNumbers ?? [];
  const gates = params.numberGates ?? [];
  if (targets.length === 0 || gates.length === 0) {
    return tickSimpleDrive(level, state, progress);
  }
  for (let i = 0; i < gates.length; i++) {
    if (progress.visitedIndices.includes(i)) continue;
    const g = gates[i];
    const d = Math.hypot(state.positionX - g.x, state.positionZ - g.z);
    if (d < 1.7) {
      progress.visitedIndices.push(i);
      const expected = targets[progress.checkpointsHit];
      if (g.number === expected) {
        progress.checkpointsHit += 1;
        if (progress.checkpointsHit >= targets.length) progress.primaryDone = true;
        return {
          completed: false,
          event: { type: 'number-correct', number: g.number },
          hint: `经过 ${g.number} 号车道！`,
        };
      } else {
        return {
          completed: false,
          event: { type: 'number-wrong', number: g.number },
          hint: `我们要找 ${expected} 号哦`,
        };
      }
    }
  }
  if (progress.primaryDone && state.positionZ <= level.finishZ) {
    return { completed: true, hint: '数字车道完成！' };
  }
  return NO_RESULT;
}

function tickMultiStopRoute(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
): MissionTickResult {
  const stops = params.stops ?? [];
  if (stops.length === 0) return tickSimpleDrive(level, state, progress);
  const next = stops[progress.checkpointsHit];
  if (next) {
    const d = Math.hypot(state.positionX - next.x, state.positionZ - next.z);
    if (d < 1.8 && state.speed < 4) {
      progress.checkpointsHit += 1;
      return {
        completed: false,
        event: { type: 'stop-visited', index: progress.checkpointsHit, total: stops.length },
        hint: progress.checkpointsHit >= stops.length ? '所有站点完成！' : `站点 ${progress.checkpointsHit}/${stops.length}`,
      };
    }
  }
  if (progress.checkpointsHit >= stops.length && state.positionZ <= level.finishZ) {
    return { completed: true, hint: '路线完成！' };
  }
  return NO_RESULT;
}

function tickPedestrianYield(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
): MissionTickResult {
  const crosswalkZ = params.crosswalkZ ?? -22;
  const stopLineZ = crosswalkZ + 3;
  const yieldR = params.yieldRadius ?? 5;

  // 玩家进入让行区
  const inYieldZone = state.positionZ < stopLineZ + yieldR && state.positionZ > crosswalkZ - 1.5;

  if (inYieldZone && !progress.pedestrianStarted) {
    progress.pedestrianStarted = true;
  }

  // 行人开始横穿
  if (progress.pedestrianStarted && progress.pedestrianCrossingProgress < 1) {
    progress.pedestrianCrossingProgress = Math.min(
      1,
      progress.pedestrianCrossingProgress + state.delta * (params.pedestrianSpeed ?? 0.5),
    );
  }

  // 玩家是否让行：在停止线前慢下来
  if (
    state.positionZ > crosswalkZ + 1.5
    && state.positionZ < stopLineZ + 2
    && state.speed < 2
  ) {
    progress.yieldHoldTime += state.delta;
    if (progress.yieldHoldTime > 0.5 && !progress.pedestrianYielded) {
      progress.pedestrianYielded = true;
      return {
        completed: false,
        event: { type: 'pedestrian-yielded' },
        hint: '小朋友谢谢你！',
      };
    }
  } else if (state.positionZ > crosswalkZ + 1.5 && state.speed > 5 && progress.pedestrianStarted && !progress.pedestrianYielded) {
    return { completed: false, hint: '前面有人，要让一让' };
  }

  // 行人通过完毕 + 玩家越过斑马线 → 走完
  if (progress.pedestrianCrossingProgress >= 1 && state.positionZ < crosswalkZ - 0.5) {
    if (!progress.primaryDone) {
      progress.primaryDone = true;
    }
  }

  if (progress.primaryDone && state.positionZ <= level.finishZ) {
    return { completed: true, hint: '完成让行任务！' };
  }
  return NO_RESULT;
}

function tickMixedMission(
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
  nowMs: number,
): MissionTickResult {
  const subTypes = params.subTypes ?? ['simpleDrive'];
  // 按顺序检查每个子类型，第一个产生事件的优先返回
  for (const sub of subTypes) {
    const r = tickByType(sub, level, params, state, progress, nowMs);
    if (r.event || r.hint || r.completed) {
      // 不要因为一个子类型 completed 就标记完整任务完成；要全部 primaryDone
      if (r.completed) {
        // 先把当前子目标视为完成
        progress.primaryDone = true;
      }
      // 综合任务真正通关 = 全部 subTypes 各自的"primary done" 累计 + 到终点
      return r;
    }
  }
  // 所有子类型都没有事件，且玩家到了终点 → 综合通关
  if (progress.primaryDone && state.positionZ <= level.finishZ) {
    return { completed: true, hint: '综合任务完成！' };
  }
  return NO_RESULT;
}

// =====================================================================
// 入口
// =====================================================================

export function tickByType(
  type: GameplayType,
  level: Level3D,
  params: MissionParams,
  state: DrivingFrameInput,
  progress: MissionProgress,
  nowMs: number,
): MissionTickResult {
  switch (type) {
    case 'simpleDrive':      return tickSimpleDrive(level, state, progress);
    case 'schoolPickup':     return tickSchoolPickup(level, params, state, progress);
    case 'delivery':         return tickDelivery(level, params, state, progress);
    case 'repairDelivery':   return tickRepairDelivery(level, params, state, progress);
    case 'trafficRule':      return tickTrafficRule(level, params, state, progress, nowMs);
    case 'parking':          return tickParking(level, params, state, progress);
    case 'rainyDrive':       return tickRainyDrive(level, params, state, progress, nowMs);
    case 'colorRoute':       return tickColorRoute(level, params, state, progress);
    case 'numberLane':       return tickNumberLane(level, params, state, progress);
    case 'multiStopRoute':   return tickMultiStopRoute(level, params, state, progress);
    case 'pedestrianYield':  return tickPedestrianYield(level, params, state, progress);
    case 'mixedMission':     return tickMixedMission(level, params, state, progress, nowMs);
  }
}

export function tickMission(
  mission: StoryMission,
  level: Level3D,
  state: DrivingFrameInput,
  progress: MissionProgress,
  nowMs: number,
): MissionTickResult {
  return tickByType(mission.gameplayType, level, mission.missionParams, state, progress, nowMs);
}

// =====================================================================
// HUD 文字
// =====================================================================

export function getMissionGoalText(
  mission: StoryMission,
  level: Level3D,
  progress: MissionProgress,
): string {
  const params = mission.missionParams;
  switch (mission.gameplayType) {
    case 'simpleDrive':
      return level.checkpoints.length > 0
        ? `进度 ${progress.checkpointsHit}/${level.checkpoints.length}`
        : '到达终点';
    case 'schoolPickup': {
      const total = params.passengerCount ?? params.passengerStops?.length ?? 0;
      return progress.passengersPickedUp >= total
        ? '送到幼儿园'
        : `小朋友 ${progress.passengersPickedUp}/${total}`;
    }
    case 'delivery':
      return progress.deliveredCorrect
        ? '完成！'
        : `送 ${COLOR_TABLE[params.targetColor ?? 'red'].name} 货`;
    case 'repairDelivery': {
      const max = params.maxCollisions ?? 3;
      return `送修车厂 (${progress.collisions}/${max})`;
    }
    case 'trafficRule': {
      const total = params.trafficLights?.length ?? 0;
      return `路口 ${progress.lightsPassed}/${total}`;
    }
    case 'parking':
      if (progress.parkingComplete) return '完美停车！';
      if (progress.parkingInZone) return `保持不动… ${Math.round(progress.parkingHoldTime * 100) / 100}s`;
      return '慢慢停进 P';
    case 'rainyDrive': {
      const max = params.maxPuddleSplash ?? 2;
      return `雨天慢行 (溅 ${progress.puddlesSplashed}/${max})`;
    }
    case 'colorRoute':
      return `走 ${COLOR_TABLE[params.targetColor ?? 'red'].name}路线`;
    case 'numberLane': {
      const targets = params.targetNumbers ?? [];
      const next = targets[progress.checkpointsHit];
      return next ? `开到 ${next} 号车道` : '到达终点';
    }
    case 'multiStopRoute': {
      const total = params.stops?.length ?? 0;
      return `站点 ${progress.checkpointsHit}/${total}`;
    }
    case 'pedestrianYield':
      if (progress.pedestrianYielded && !progress.primaryDone) return '让小朋友通过';
      if (progress.primaryDone) return '继续到终点';
      return '注意斑马线';
    case 'mixedMission':
      return '完成全部目标';
  }
}
