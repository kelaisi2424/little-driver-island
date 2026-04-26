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

export function validateLevels(): boolean {
  const errors: string[] = [];

  if (LEVELS_3D.length !== 100) {
    errors.push(`levels.length should be 100, got ${LEVELS_3D.length}`);
  }

  for (let id = 1; id <= 100; id += 1) {
    const level = LEVELS_3D[id - 1];
    if (!level) {
      errors.push(`missing level ${id}`);
      continue;
    }
    if (level.id !== id) errors.push(`level index ${id} has id ${level.id}`);
    if (!level.name) errors.push(`level ${id} missing title/name`);
    if (!level.mission) errors.push(`level ${id} missing mission`);
    if (!level.learningGoal) errors.push(`level ${id} missing learningGoal`);
    if (!level.summary) errors.push(`level ${id} missing summaryText/summary`);
  }

  for (let chapterId = 1; chapterId <= 10; chapterId += 1) {
    const count = getChapterLevels(chapterId).length;
    if (count !== 10) errors.push(`chapter ${chapterId} should have 10 levels, got ${count}`);
  }

  const level30 = getLevel3D(30);
  const level31 = getLevel3D(31);
  const level100 = getLevel3D(100);
  if (level30.id + 1 !== level31.id) errors.push('level 30 nextLevelId should be 31');
  if (level100.id !== 100) errors.push('level 100 missing');

  if (errors.length > 0) {
    console.error('[validateLevels]', errors);
    return false;
  }
  console.info('[validateLevels] ok: 100 continuous 3D driving levels');
  return true;
}
