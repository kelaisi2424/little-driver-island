import type { GameDefinition } from '../types';

export const GAME_DEFINITIONS: readonly GameDefinition[] = [
  {
    id: 'obstacle-drive',
    icon: '🚗',
    title: '小车躲障碍',
    subtitle: '左右拖动，躲开路锥',
    color: '#ff8c69',
    stickerId: 'safe-car',
    learning: '专注力和安全意识',
  },
  {
    id: 'parking-puzzle',
    icon: '🅿️',
    title: '停车挪一挪',
    subtitle: '把车停进 P 车位',
    color: '#4a90e2',
    stickerId: 'parking-p',
    learning: '空间感和方向感',
  },
  {
    id: 'traffic-light',
    icon: '🚦',
    title: '红绿灯快反应',
    subtitle: '看灯，选动作',
    color: '#5cd684',
    stickerId: 'traffic-light',
    learning: '交通规则和反应力',
  },
  {
    id: 'car-wash',
    icon: '🫧',
    title: '洗车泡泡乐',
    subtitle: '找到颜色去洗车',
    color: '#7ad6f6',
    stickerId: 'bubble-car',
    learning: '颜色识别和观察力',
  },
  {
    id: 'bus-pickup',
    icon: '🚌',
    title: '小巴士接送',
    subtitle: '数一数，接朋友',
    color: '#ffd166',
    stickerId: 'little-bus',
    learning: '数字和数量对应',
  },
  {
    id: 'repair-garage',
    icon: '🔧',
    title: '修车小工厂',
    subtitle: '拖零件，修好车',
    color: '#a07ad6',
    stickerId: 'wrench',
    learning: '配对和手部动作',
  },
];

export function getGameDefinition(id: string) {
  return GAME_DEFINITIONS.find((game) => game.id === id);
}
