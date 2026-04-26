import type { TaskType } from '../types';

const ALL_TASK_TYPES: TaskType[] = [
  'traffic-light',
  'parking',
  'color-repair',
  'crosswalk',
  'pedestrian',
  'red-light',
  'seatbelt',
];

const GAME_WORLD_TASKS: TaskType[] = [
  'traffic-light',
  'parking',
  'color-repair',
  'seatbelt',
  'crosswalk',
];

// 生成一局任务序列。尽量避免连续两次相同任务，让小朋友体验更丰富。
export function randomTaskSequence(count: number): TaskType[] {
  const seq: TaskType[] = [];
  let last: TaskType | null = null;
  for (let i = 0; i < count; i++) {
    let candidate: TaskType;
    let attempts = 0;
    do {
      candidate = ALL_TASK_TYPES[Math.floor(Math.random() * ALL_TASK_TYPES.length)];
      attempts++;
    } while (candidate === last && attempts < 6);
    seq.push(candidate);
    last = candidate;
  }
  return seq;
}

export function randomGameWorldRoute(count: number): TaskType[] {
  return shuffle(GAME_WORLD_TASKS).slice(0, Math.min(count, GAME_WORLD_TASKS.length));
}

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
