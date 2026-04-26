export interface Sticker {
  id: string;
  color: string;
  name: string;
  emoji: string;
}

export const STICKER_POOL: readonly Sticker[] = [
  { id: 'safe-car', color: '#ff8c69', name: '安全小车贴纸', emoji: '🚗' },
  { id: 'parking-p', color: '#4a90e2', name: '停车 P 贴纸', emoji: '🅿️' },
  { id: 'traffic-light', color: '#5cd684', name: '红绿灯贴纸', emoji: '🚦' },
  { id: 'bubble-car', color: '#7ad6f6', name: '泡泡车贴纸', emoji: '🫧' },
  { id: 'little-bus', color: '#ffd166', name: '小巴士贴纸', emoji: '🚌' },
  { id: 'wrench', color: '#a07ad6', name: '小扳手贴纸', emoji: '🔧' },
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

export function awardSticker(stickerId: string): Sticker | null {
  const owned = loadStickers();
  if (owned.includes(stickerId)) return getStickerById(stickerId) ?? null;
  safeSet(KEY_STICKERS, JSON.stringify([...owned, stickerId]));
  return getStickerById(stickerId) ?? null;
}

export function awardNextSticker(): Sticker | null {
  const owned = new Set(loadStickers());
  const next = STICKER_POOL.find((s) => !owned.has(s.id));
  if (!next) return null;
  return awardSticker(next.id);
}

export function getOwnedStickers(): Sticker[] {
  return loadStickers()
    .map((id) => getStickerById(id))
    .filter((s): s is Sticker => Boolean(s));
}

export function isAllStickersCollected(): boolean {
  return loadStickers().length >= STICKER_POOL.length;
}
