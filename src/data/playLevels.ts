// 主闯关 10 关数据。
// 每关有 kind（核心机制）、duration（时长）、intro/summary（学习点）。
// 加新关：在数组末尾追加；要更复杂时给 kind 加新值并在 DrivingLevel.tsx 处理。

import type { PlayLevel } from '../types';

export const PLAY_LEVELS: readonly PlayLevel[] = [
  {
    id: 1,
    title: '直路开到终点',
    intro: '沿着马路一直往前开。',
    summary: '小车沿着路走，又稳又安全。',
    kind: 'drive',
    duration: 14,
  },
  {
    id: 2,
    title: '躲开路锥',
    intro: '看到路锥，就拖到旁边躲一躲。',
    summary: '看到障碍，要慢慢绕开。',
    kind: 'dodge',
    duration: 22,
  },
  {
    id: 3,
    title: '走 1 号车道',
    intro: '请把小车开到 1 号车道。',
    summary: '这是数字 1，是最左边的车道。',
    kind: 'lane',
    duration: 16,
    targetLane: 0,
    targetNumber: 1,
  },
  {
    id: 4,
    title: '走 2 号车道',
    intro: '现在请走中间的 2 号车道。',
    summary: '这是数字 2，是中间的车道。',
    kind: 'lane',
    duration: 16,
    targetLane: 1,
    targetNumber: 2,
  },
  {
    id: 5,
    title: '红灯停下来',
    intro: '前面是红绿灯，红灯亮要停。',
    summary: '红灯亮了，小车一定要停下来。',
    kind: 'wait-light',
    duration: 22,
    stickerId: 'safe-car',
  },
  {
    id: 6,
    title: '绿灯往前开',
    intro: '看到绿灯就可以往前开了。',
    summary: '绿灯亮了，小车可以安全往前走。',
    kind: 'drive',
    duration: 16,
  },
  {
    id: 7,
    title: '停进 P 车位',
    intro: '终点有 P 车位，把车停进去。',
    summary: '看到 P 标志，就是停车的地方。',
    kind: 'park',
    duration: 22,
    stickerId: 'parking-p',
  },
  {
    id: 8,
    title: '行人让一让',
    intro: '前面有小朋友过马路，停下来让一让。',
    summary: '看到行人，要停下来让别人先走。',
    kind: 'pedestrian',
    duration: 22,
  },
  {
    id: 9,
    title: '接 2 个小朋友',
    intro: '路上有 2 个小朋友等车，开过去接他们。',
    summary: '一个、两个，接到 2 个小朋友啦。',
    kind: 'pickup',
    duration: 24,
    pickupCount: 2,
    stickerId: 'little-bus',
  },
  {
    id: 10,
    title: '安全到幼儿园',
    intro: '慢慢开，安全把小朋友送到幼儿园。',
    summary: '一路看路、慢慢开，就能安全到达。',
    kind: 'arrive',
    duration: 28,
    stickerId: 'wrench',
  },
];

export function getPlayLevel(id: number): PlayLevel {
  return PLAY_LEVELS.find((l) => l.id === id) ?? PLAY_LEVELS[0];
}

export const TOTAL_LEVELS = PLAY_LEVELS.length;
