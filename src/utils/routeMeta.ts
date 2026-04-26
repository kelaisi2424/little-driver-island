import type { TaskType } from '../types';

export interface RouteMeta {
  label: string;
  shortLabel: string;
  emoji: string;
  prompt: string;
  placeClass: string;
}

export const ROUTE_META: Record<TaskType, RouteMeta> = {
  'traffic-light': {
    label: '红绿灯路口',
    shortLabel: '红绿灯',
    emoji: '🚦',
    prompt: '前面有红绿灯，看看该怎么走。',
    placeClass: 'dest-light',
  },
  parking: {
    label: '数字停车场',
    shortLabel: '停车场',
    emoji: '🅿️',
    prompt: '到停车场啦，找找数字车位。',
    placeClass: 'dest-parking',
  },
  'color-repair': {
    label: '洗车店',
    shortLabel: '洗车店',
    emoji: '🫧',
    prompt: '洗车店到了，找一辆指定颜色的小车。',
    placeClass: 'dest-wash',
  },
  crosswalk: {
    label: '斑马线',
    shortLabel: '斑马线',
    emoji: '🚸',
    prompt: '前面有斑马线，先停下看一看。',
    placeClass: 'dest-crosswalk',
  },
  pedestrian: {
    label: '公园路口',
    shortLabel: '公园',
    emoji: '🌳',
    prompt: '前面有人过马路，我们要怎么做？',
    placeClass: 'dest-park',
  },
  'red-light': {
    label: '红灯路口',
    shortLabel: '红灯',
    emoji: '🛑',
    prompt: '红灯亮了，就算路上安静也要等一等。',
    placeClass: 'dest-light',
  },
  seatbelt: {
    label: '幼儿园门口',
    shortLabel: '幼儿园',
    emoji: '🏫',
    prompt: '上车先坐好，安全带也要系好。',
    placeClass: 'dest-school',
  },
};

export function getRouteMeta(type: TaskType): RouteMeta {
  return ROUTE_META[type];
}

export function taskToDestination(type: TaskType): string {
  return getRouteMeta(type).shortLabel;
}

export function taskToArrivalPrompt(type: TaskType): string {
  return getRouteMeta(type).prompt;
}
