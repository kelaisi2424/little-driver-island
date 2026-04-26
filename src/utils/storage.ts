// 本地存储：今日游玩记录、家长配置、贴纸收藏
// 所有 key 加 'kdjs:' 前缀便于将来迁移或清理。

import type { ParentConfig } from '../types';

const KEY_PLAY_RECORD = 'kdjs:playRecord:v1';
const KEY_CONFIG = 'kdjs:config:v1';
const KEY_USAGE = 'kdjs:usage:v2';
const KEY_PROGRESS = 'kdjs:progress:v2';
const KEY_LEARNING = 'kdjs:learning:v2';

interface PlayRecord {
  date: string; // 格式: YYYY-MM-DD
  count: number;
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* noop */
  }
}

// ---------- 今日游玩次数 ----------

export function getPlayRecord(): PlayRecord {
  const raw = safeGet(KEY_PLAY_RECORD);
  const today = todayString();
  if (!raw) return { date: today, count: 0 };
  try {
    const parsed = JSON.parse(raw) as PlayRecord;
    if (parsed.date !== today) {
      // 跨天自动清零
      return { date: today, count: 0 };
    }
    return parsed;
  } catch {
    return { date: today, count: 0 };
  }
}

export function getTodayCount(): number {
  return getPlayRecord().count;
}

export function incrementPlayCount(): PlayRecord {
  const cur = getPlayRecord();
  const next: PlayRecord = { date: todayString(), count: cur.count + 1 };
  safeSet(KEY_PLAY_RECORD, JSON.stringify(next));
  return next;
}

export function reachedDailyLimit(limit: number): boolean {
  return getTodayCount() >= limit;
}

export function resetTodayCount(): void {
  safeSet(KEY_PLAY_RECORD, JSON.stringify({ date: todayString(), count: 0 }));
}

// ---------- 家长配置 ----------

export function loadConfig(): Partial<ParentConfig> | null {
  const raw = safeGet(KEY_CONFIG);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveConfig(c: ParentConfig): void {
  safeSet(KEY_CONFIG, JSON.stringify(c));
}

export interface DailyUsage {
  date: string;
  seconds: number;
  completedLevels: number;
}

export type GameProgress = Record<string, {
  currentLevel: number;
  stars: Record<string, number>;
}>;

export interface LearningRecord {
  date: string;
  gameId: string;
  level: number;
  learningGoal: string;
  summary: string;
}

export function getDailyUsage(): DailyUsage {
  const today = todayString();
  const raw = safeGet(KEY_USAGE);
  if (!raw) return { date: today, seconds: 0, completedLevels: 0 };
  try {
    const parsed = JSON.parse(raw) as DailyUsage;
    if (parsed.date !== today) return { date: today, seconds: 0, completedLevels: 0 };
    return parsed;
  } catch {
    return { date: today, seconds: 0, completedLevels: 0 };
  }
}

export function addDailyUsage(seconds: number): DailyUsage {
  const cur = getDailyUsage();
  const next = {
    date: todayString(),
    seconds: cur.seconds + Math.max(1, Math.round(seconds)),
    completedLevels: cur.completedLevels + 1,
  };
  safeSet(KEY_USAGE, JSON.stringify(next));
  return next;
}

export function resetDailyUsage(): void {
  safeSet(KEY_USAGE, JSON.stringify({ date: todayString(), seconds: 0, completedLevels: 0 }));
}

export function loadProgress(): GameProgress {
  const raw = safeGet(KEY_PROGRESS);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as GameProgress;
  } catch {
    return {};
  }
}

export function saveProgress(progress: GameProgress): void {
  safeSet(KEY_PROGRESS, JSON.stringify(progress));
}

export function updateLevelProgress(gameId: string, level: number, stars: number): GameProgress {
  const progress = loadProgress();
  const entry = progress[gameId] ?? { currentLevel: 1, stars: {} };
  const oldStars = entry.stars[String(level)] ?? 0;
  entry.stars[String(level)] = Math.max(oldStars, stars);
  // v11 hotfix：去掉硬编码的 30 上限——本来是 v1 只有 30 关时留下的 BUG，
  // 导致 100 关版本第 30 关后永远无法解锁第 31 关。
  // 上限交给消费方（Game3DPage / LevelSelect）按 LEVELS_3D.length 兜底。
  entry.currentLevel = Math.max(entry.currentLevel, level + 1);
  progress[gameId] = entry;
  saveProgress(progress);
  return progress;
}

export function loadLearningRecords(): LearningRecord[] {
  const raw = safeGet(KEY_LEARNING);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addLearningRecord(record: Omit<LearningRecord, 'date'>): void {
  const records = loadLearningRecords();
  records.unshift({ ...record, date: todayString() });
  safeSet(KEY_LEARNING, JSON.stringify(records.slice(0, 40)));
}
