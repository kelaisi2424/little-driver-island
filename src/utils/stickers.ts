// 贴纸奖励系统：完成一局获得一张小车贴纸。
// 设计原则：固定顺序解锁（不抽奖、不分稀有度、不带刺激音效）。
// 所有贴纸都展示在贴纸册里，已收集的彩色，未收集的灰色锁定。

export interface Sticker {
  id: string;
  color: string;
  name: string;
}

// 贴纸池：8 张温和颜色的小车
export const STICKER_POOL: readonly Sticker[] = [
  { id: 'red-coupe', color: '#ff7e7e', name: '红色小跑车' },
  { id: 'blue-suv', color: '#4a90e2', name: '蓝色越野车' },
  { id: 'yellow-taxi', color: '#ffd166', name: '黄色出租车' },
  { id: 'green-bus', color: '#5cd684', name: '绿色公交车' },
  { id: 'pink-mini', color: '#ff9eb6', name: '粉色小可爱' },
  { id: 'purple-van', color: '#a07ad6', name: '紫色厢式车' },
  { id: 'orange-truck', color: '#ff9c5c', name: '橙色卡车' },
  { id: 'mint-eco', color: '#7ad6b8', name: '薄荷绿环保车' },
];

const KEY_STICKERS = 'kdjs:stickers:v1';

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

export function loadStickers(): string[] {
  const raw = safeGet(KEY_STICKERS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getStickerById(id: string): Sticker | undefined {
  return STICKER_POOL.find((s) => s.id === id);
}

// 颁发下一张未收集的贴纸。已集齐返回 null。
export function awardNextSticker(): Sticker | null {
  const owned = new Set(loadStickers());
  const next = STICKER_POOL.find((s) => !owned.has(s.id));
  if (!next) return null;
  const ordered = loadStickers();
  ordered.push(next.id);
  safeSet(KEY_STICKERS, JSON.stringify(ordered));
  return next;
}

export function getOwnedStickers(): Sticker[] {
  const ids = loadStickers();
  return ids
    .map((id) => getStickerById(id))
    .filter((s): s is Sticker => Boolean(s));
}

export function isAllStickersCollected(): boolean {
  return loadStickers().length >= STICKER_POOL.length;
}
