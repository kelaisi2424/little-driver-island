import type { GameDefinition, GameId } from '../types';

export const GAME_DEFINITIONS: readonly GameDefinition[] = [
  {
    id: 'parking-move',
    icon: '🅿️',
    title: '停车挪一挪',
    tag: '挪车',
    color: '#4a90e2',
    stickerId: 'parking-master',
  },
  {
    id: 'car-rush',
    icon: '🚗',
    title: '小车冲冲冲',
    tag: '躲障碍',
    color: '#ff8c69',
    stickerId: 'safe-car',
  },
  {
    id: 'bus-pickup',
    icon: '🚌',
    title: '小巴士接送',
    tag: '接乘客',
    color: '#ffd166',
    stickerId: 'little-bus',
  },
  {
    id: 'jump-car',
    icon: '🏎️',
    title: '飞车跳一跳',
    tag: '跳平台',
    color: '#a07ad6',
    stickerId: 'jump-car',
  },
  {
    id: 'find-car',
    icon: '🔍',
    title: '找到目标车',
    tag: '找一找',
    color: '#5cd684',
    stickerId: 'sharp-eyes',
  },
  {
    id: 'tire-roll',
    icon: '🛞',
    title: '轮胎滚一滚',
    tag: '跳小坑',
    color: '#7ad6b8',
    stickerId: 'round-tire',
  },
];

export function getGameDefinition(id: GameId): GameDefinition {
  return GAME_DEFINITIONS.find((game) => game.id === id) ?? GAME_DEFINITIONS[0];
}
