// 100 关闯关数据：通过模板 + 生成器自动产生。
// 类型定义放在本文件，方便其他渲染层 import { Level3D, Level3DKind } from './levels3d'。

import { generateAllLevels } from './generateLevels3d';

export type Level3DKind = 'finish' | 'cones' | 'checkpoints' | 'traffic' | 'parking';

export interface ConeConfig {
  x: number;
  z: number;
}

export interface CheckpointConfig {
  x: number;
  z: number;
}

export interface Level3D {
  id: number;
  name: string;
  mission: string;
  learningGoal: string;
  summary: string;
  kind: Level3DKind;
  roadLength: number;
  finishZ: number;
  cones: ConeConfig[];
  checkpoints: CheckpointConfig[];
}

// 100 个关卡（10 章 × 10 关）。生成是确定的，刷新不变。
export const LEVELS_3D: readonly Level3D[] = generateAllLevels();

export const TOTAL_LEVELS_3D = LEVELS_3D.length;

export function getLevel3D(levelId: number): Level3D {
  return LEVELS_3D.find((level) => level.id === levelId) ?? LEVELS_3D[0];
}

// 按章节获取本章 10 关
export function getChapterLevels(chapterId: number): Level3D[] {
  const start = (chapterId - 1) * 10 + 1;
  const end = chapterId * 10;
  return LEVELS_3D.filter((l) => l.id >= start && l.id <= end);
}
