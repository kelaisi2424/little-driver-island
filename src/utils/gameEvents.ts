import type { TaskType } from '../types';
import { pickRandom, shuffle } from './random';

export type DrivingEventType =
  | 'traffic'
  | 'number-lane'
  | 'color-garage'
  | 'crosswalk'
  | 'roadblock'
  | 'finish';

export interface DrivingEvent {
  id: string;
  type: DrivingEventType;
  light?: 'red' | 'green';
  targetNumber?: number;
  targetColor?: ColorName;
  laneNumbers?: number[];
}

export type ColorName = '红色' | '蓝色' | '黄色' | '绿色';

export const COLOR_VALUES: Record<ColorName, string> = {
  红色: '#ff5252',
  蓝色: '#4a90e2',
  黄色: '#ffd166',
  绿色: '#5cd684',
};

const SAFETY_EVENTS: DrivingEventType[] = [
  'traffic',
  'number-lane',
  'color-garage',
  'crosswalk',
  'roadblock',
];

export function createDrivingEvents(totalStops: number): DrivingEvent[] {
  const taskCount = Math.max(2, Math.min(4, totalStops - 1));
  const picked = shuffle(SAFETY_EVENTS).slice(0, taskCount);
  const events = picked.map((type, index) => makeEvent(type, index));
  events.push({ id: `finish-${Date.now()}`, type: 'finish' });
  return events;
}

function makeEvent(type: DrivingEventType, index: number): DrivingEvent {
  if (type === 'traffic') {
    return {
      id: `traffic-${index}-${Date.now()}`,
      type,
      light: pickRandom(['red', 'green'] as const),
    };
  }

  if (type === 'number-lane') {
    const laneNumbers = shuffle([1, 2, 3, 4, 5]).slice(0, 3);
    return {
      id: `number-${index}-${Date.now()}`,
      type,
      laneNumbers,
      targetNumber: pickRandom(laneNumbers),
    };
  }

  if (type === 'color-garage') {
    return {
      id: `color-${index}-${Date.now()}`,
      type,
      targetColor: pickRandom(['红色', '蓝色', '黄色', '绿色'] as const),
    };
  }

  return {
    id: `${type}-${index}-${Date.now()}`,
    type,
  };
}

export function eventToTaskType(event: DrivingEvent): TaskType {
  if (event.type === 'traffic') return event.light === 'red' ? 'red-light' : 'traffic-light';
  if (event.type === 'number-lane') return 'parking';
  if (event.type === 'color-garage') return 'color-repair';
  if (event.type === 'crosswalk') return 'crosswalk';
  if (event.type === 'finish') return 'seatbelt';
  return 'pedestrian';
}

export function promptForEvent(event: DrivingEvent): string {
  if (event.type === 'traffic') {
    return event.light === 'red' ? '红灯，停下来。' : '绿灯，可以走。';
  }
  if (event.type === 'number-lane') return `开到 ${event.targetNumber} 号车道。`;
  if (event.type === 'color-garage') return `开进${event.targetColor}洗车店。`;
  if (event.type === 'crosswalk') return '斑马线前，让一让。';
  if (event.type === 'roadblock') return '前面有路障，慢一点。';
  return '把车停进 P 车位。';
}
