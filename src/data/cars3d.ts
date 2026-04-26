// 6 辆车配置：每辆颜色 + 比例 + 解锁条件不同。
// 不抽奖 / 不充值 / 不分稀有度 —— 完成对应关卡自动解锁，永久拥有。

export type CarBodyType = 'compact' | 'sport' | 'bus' | 'truck' | 'utility' | 'cute';

export interface Car3D {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;       // 完成第 N 关后解锁（默认解锁的为 0）
  bodyType: CarBodyType;
  // 车身主色
  bodyColor: string;
  bodyDarkColor: string;
  bodyLightColor: string;
  // 强调色（车牌、灯条等）
  accentColor: string;
  // 主题 emoji（车库卡片显示）
  emoji: string;
  // 比例缩放：[宽, 高, 长]
  scale: [number, number, number];
}

export const CARS_3D: readonly Car3D[] = [
  {
    id: 'red-compact',
    name: '红色小轿车',
    description: '默认小车，灵活又安全',
    unlockLevel: 0,
    bodyType: 'compact',
    bodyColor: '#dc2626',
    bodyDarkColor: '#b91c1c',
    bodyLightColor: '#ef4444',
    accentColor: '#ffd166',
    emoji: '🚗',
    scale: [1, 1, 1],
  },
  {
    id: 'blue-sport',
    name: '蓝色小跑车',
    description: '更低更宽，速度感更强',
    unlockLevel: 10,
    bodyType: 'sport',
    bodyColor: '#2563eb',
    bodyDarkColor: '#1d4ed8',
    bodyLightColor: '#60a5fa',
    accentColor: '#fbbf24',
    emoji: '🏎️',
    scale: [1.06, 0.86, 1.12],     // 更宽 / 更低 / 更长
  },
  {
    id: 'yellow-bus',
    name: '黄色小巴士',
    description: '能装好多小朋友',
    unlockLevel: 20,
    bodyType: 'bus',
    bodyColor: '#fbbf24',
    bodyDarkColor: '#d97706',
    bodyLightColor: '#fde68a',
    accentColor: '#1f2937',
    emoji: '🚌',
    scale: [1.0, 1.18, 1.2],       // 更高 / 更长
  },
  {
    id: 'green-truck',
    name: '绿色工程车',
    description: '后面有小货斗',
    unlockLevel: 30,
    bodyType: 'truck',
    bodyColor: '#16a34a',
    bodyDarkColor: '#15803d',
    bodyLightColor: '#4ade80',
    accentColor: '#facc15',
    emoji: '🚚',
    scale: [1.04, 1.05, 1.08],
  },
  {
    id: 'white-safety',
    name: '白色警示车',
    description: '车顶有黄色警示灯',
    unlockLevel: 50,
    bodyType: 'utility',
    bodyColor: '#f3f4f6',
    bodyDarkColor: '#9ca3af',
    bodyLightColor: '#ffffff',
    accentColor: '#fbbf24',
    emoji: '🚓',
    scale: [1.0, 1.04, 1.0],
  },
  {
    id: 'pink-cute',
    name: '粉色可爱车',
    description: '柔和粉色，圆圆滚滚',
    unlockLevel: 80,
    bodyType: 'cute',
    bodyColor: '#fb7185',
    bodyDarkColor: '#e11d48',
    bodyLightColor: '#fda4af',
    accentColor: '#ffd6e7',
    emoji: '💗',
    scale: [0.98, 0.96, 0.96],
  },
];

export function getCar3D(id: string | null | undefined): Car3D {
  if (!id) return CARS_3D[0];
  return CARS_3D.find((c) => c.id === id) ?? CARS_3D[0];
}

export function getDefaultCar3D(): Car3D {
  return CARS_3D[0];
}

export function isCarUnlocked(car: Car3D, unlockedLevel: number): boolean {
  // unlockedLevel 是当前已经"解锁可玩"的关卡 id（max 完成 + 1）。
  // 完成第 N 关 → unlockedLevel = N + 1，所以 unlockedLevel - 1 是已通关最大数。
  return car.unlockLevel === 0 || (unlockedLevel - 1) >= car.unlockLevel;
}
