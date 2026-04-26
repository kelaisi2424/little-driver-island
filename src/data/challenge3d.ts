// v1.7 挑战模式：每关派生 ChallengeConfig + 评分函数。
// 不影响普通模式（普通模式根本不读这个文件）。
//
// 设计原则：
// 1. 不写 100 份配置，按章节 + level.kind + 关卡参数自动派生。
// 2. 通过 challengeType 区分玩法（8 种）。
// 3. 三星评分：碰撞次数 / 时间 / 离路时间 / 停车精度（停车关）。
// 4. 鼓励为主，不做失败惩罚 —— 没拿到三星只提示"再试一次"。

import type { Level3D } from './levels3d';

export type ChallengeType =
  | 'timeTrial'
  | 'noCollision'
  | 'checkpointSequence'
  | 'precisionParking'
  | 'laneDiscipline'
  | 'trafficRuleCombo'
  | 'slalom'
  | 'schoolRun';

export interface ChallengeConfig {
  enabled: boolean;
  challengeType: ChallengeType;
  targetTime: number;                    // 目标完成秒数（三星阈值）
  maxCollisionsForThreeStars: number;    // 拿三星允许的最大碰撞数
  maxCollisionsForTwoStars: number;      // 拿二星允许的最大碰撞数
  bonusObjectives: string[];             // 给孩子看的中文挑战目标，2-3 条
  difficulty: 1 | 2 | 3 | 4 | 5;
  // 显示给 HUD 用的"短称呼"
  label: string;                         // e.g. "限时 / 不碰 / 停准"
}

export interface DrivingTelemetry {
  elapsedTime: number;        // 秒
  collisions: number;         // 碰撞次数（撞路锥）
  offRoadTime: number;        // 累计离路秒数
  checkpointPassed: number;
  brakeCount: number;         // 刹车按下次数
  maxSpeed: number;           // m/s
  averageSpeed: number;       // m/s
  parkingAccuracy: number;    // 米，停车点距 P 中心
  completed: boolean;
}

// =====================================================================
// 派生：根据 level 自动生成 ChallengeConfig
// =====================================================================

function pickChallengeType(chapterId: number, kind: Level3D['kind']): ChallengeType {
  // 每章节有一个主玩法，但综合关 (chapter 10) 看 kind 决定
  switch (chapterId) {
    case 1: return 'timeTrial';
    case 2: return 'noCollision';
    case 3: return 'checkpointSequence';
    case 4: return 'trafficRuleCombo';
    case 5: return 'precisionParking';
    case 6: return 'trafficRuleCombo';
    case 7: return 'noCollision';
    case 8: return 'schoolRun';
    case 9: return 'checkpointSequence';
    case 10:
      if (kind === 'parking') return 'precisionParking';
      if (kind === 'cones') return 'slalom';
      if (kind === 'checkpoints') return 'checkpointSequence';
      return 'trafficRuleCombo';
    default: return 'timeTrial';
  }
}

const CHALLENGE_LABEL: Record<ChallengeType, string> = {
  timeTrial: '限时挑战',
  noCollision: '安全避障',
  checkpointSequence: '检查点路线',
  precisionParking: '精准停车',
  laneDiscipline: '车道纪律',
  trafficRuleCombo: '交规综合',
  slalom: '绕桩驾驶',
  schoolRun: '校车接送',
};

function buildObjectives(
  level: Level3D,
  challengeType: ChallengeType,
  targetTime: number,
): string[] {
  const objectives: string[] = [];
  const safeTime = Math.round(targetTime);
  switch (challengeType) {
    case 'timeTrial':
      objectives.push(`${safeTime} 秒内开到终点`);
      objectives.push('保持在道路上');
      objectives.push('稳一点不要冲');
      break;
    case 'noCollision':
      objectives.push('不要碰到路锥');
      objectives.push(`${safeTime} 秒内到达`);
      objectives.push('看到障碍提前减速');
      break;
    case 'checkpointSequence':
      objectives.push(`按顺序通过 ${level.checkpoints.length} 个检查点`);
      objectives.push(`${safeTime} 秒内完成`);
      objectives.push('保持在道路上');
      break;
    case 'precisionParking':
      objectives.push('车要停在 P 框中间');
      objectives.push('停车时车速要慢');
      objectives.push('不要碰到边界');
      break;
    case 'laneDiscipline':
      objectives.push('保持在指定车道');
      objectives.push('不要走错路线');
      objectives.push(`${safeTime} 秒内到达`);
      break;
    case 'trafficRuleCombo':
      objectives.push('看到红灯停一停');
      objectives.push('看到行人让一让');
      objectives.push('遵守路口规则');
      break;
    case 'slalom':
      objectives.push('左右绕过路锥');
      objectives.push('一个都不能碰');
      objectives.push('保持在路上');
      break;
    case 'schoolRun':
      objectives.push(`接齐 ${level.checkpoints.length} 个小朋友`);
      objectives.push('安全送到幼儿园');
      objectives.push('停车要慢');
      break;
  }
  return objectives;
}

export function getChallengeConfig(level: Level3D): ChallengeConfig {
  const chapterId = Math.ceil(level.id / 10);
  const challengeType = pickChallengeType(chapterId, level.kind);

  // 目标时间：路长 / 平均速度 + 障碍补偿 + 检查点补偿
  // 平均速度 ~ 13 m/s（46 km/h），孩子会停一下
  const baseTime = Math.ceil(level.roadLength / 14)
    + level.cones.length * 1.6
    + level.checkpoints.length * 1.8;
  // 章节越后给一点点宽松，因为更难（避免低龄家长设挑战开关后第10章打不动）
  const chapterEase = chapterId >= 8 ? 6 : chapterId >= 5 ? 3 : 0;
  const targetTime = Math.max(20, Math.round(baseTime + chapterEase));

  // 难度：章节系数为主
  const difficulty = Math.min(5, Math.max(1, Math.ceil(chapterId / 2))) as 1 | 2 | 3 | 4 | 5;

  // 三星允许碰撞 0；二星阈值章节越深越严
  const maxCollisionsForTwoStars = chapterId <= 4 ? 2 : chapterId <= 8 ? 1 : 1;

  return {
    enabled: true,
    challengeType,
    targetTime,
    maxCollisionsForThreeStars: 0,
    maxCollisionsForTwoStars,
    bonusObjectives: buildObjectives(level, challengeType, targetTime),
    difficulty,
    label: CHALLENGE_LABEL[challengeType],
  };
}

// =====================================================================
// 评分：根据 telemetry + config 计算 1/2/3 星
// =====================================================================

export function scoreChallenge(
  telemetry: DrivingTelemetry,
  config: ChallengeConfig,
  level: Level3D,
): 1 | 2 | 3 {
  let stars: 1 | 2 | 3 = 3;
  const downgrade = (s: 1 | 2): void => {
    if (s < stars) stars = s as 1 | 2 | 3;
  };

  // 碰撞
  if (telemetry.collisions > config.maxCollisionsForThreeStars) downgrade(2);
  if (telemetry.collisions > config.maxCollisionsForTwoStars) downgrade(1);

  // 超时
  if (telemetry.elapsedTime > config.targetTime + 8) downgrade(2);
  if (telemetry.elapsedTime > config.targetTime + 18) downgrade(1);

  // 离路时间
  if (telemetry.offRoadTime > 4) downgrade(2);
  if (telemetry.offRoadTime > 10) downgrade(1);

  // 检查点缺失（理论上不会发生，因为没过完不能完成）
  if (level.checkpoints.length > 0 && telemetry.checkpointPassed < level.checkpoints.length) {
    downgrade(1);
  }

  // 精准停车的额外加严
  if (config.challengeType === 'precisionParking') {
    if (telemetry.parkingAccuracy > 0.8) downgrade(2);
    if (telemetry.parkingAccuracy > 1.5) downgrade(1);
  }

  return stars;
}

// =====================================================================
// 评估当前进行中的"预估星级"，供 HUD 实时显示
// =====================================================================

export function previewStars(
  telemetry: DrivingTelemetry,
  config: ChallengeConfig,
  level: Level3D,
): 1 | 2 | 3 {
  // 临时构造一个已完成的 telemetry 拿去 score
  return scoreChallenge(
    { ...telemetry, completed: true },
    config,
    level,
  );
}

// =====================================================================
// 鼓励文案：没三星给孩子看的"下次试试"
// =====================================================================

export function encouragementFor(
  telemetry: DrivingTelemetry,
  config: ChallengeConfig,
): string {
  if (telemetry.collisions > config.maxCollisionsForTwoStars) {
    return '再来一次，看清路锥提前避开！';
  }
  if (telemetry.collisions > config.maxCollisionsForThreeStars) {
    return '差一点点不碰锥，三颗星就到手！';
  }
  if (telemetry.elapsedTime > config.targetTime + 8) {
    return `下次再快一点，目标 ${config.targetTime} 秒。`;
  }
  if (telemetry.offRoadTime > 4) {
    return '记得开回路上，三颗星更靠近。';
  }
  if (config.challengeType === 'precisionParking' && telemetry.parkingAccuracy > 0.8) {
    return '把车停得再正一点，下次三颗星！';
  }
  return '做得好，继续保持！';
}
