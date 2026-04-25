// 本地存储：今日游玩记录、家长配置、贴纸收藏
// 所有 key 加 'kdjs:' 前缀便于将来迁移或清理。

import type { ParentConfig } from '../types';

const KEY_PLAY_RECORD = 'kdjs:playRecord:v1';
const KEY_CONFIG = 'kdjs:config:v1';

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
