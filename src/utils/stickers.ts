export interface Sticker {
  id: string;
  color: string;
  name: string;
  emoji: string;
}

export const STICKER_POOL: readonly Sticker[] = [
  { id: 'safe-car', color: '#ff8c69', name: '安全小车贴纸', emoji: '🚗' },
  { id: 'parking-master', color: '#4a90e2', name: '停车高手贴纸', emoji: '🅿️' },
  { id: 'traffic-light', color: '#5cd684', name: '红绿灯贴纸', emoji: '🚦' },
  { id: 'little-bus', color: '#ffd166', name: '小巴士贴纸', emoji: '🚌' },
  { id: 'curve-driver', color: '#a07ad6', name: '弯道小达人贴纸', emoji: '🏁' },
  { id: 'school-driver', color: '#7ad6b8', name: '安全到幼儿园贴纸', emoji: '🏫' },
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
  return STICKER_POOL.find((sticker) => sticker.id === id);
}

export function awardSticker(stickerId: string): Sticker | null {
  const owned = loadStickers();
  if (!owned.includes(stickerId)) {
    safeSet(KEY_STICKERS, JSON.stringify([...owned, stickerId]));
  }
  return getStickerById(stickerId) ?? null;
}

export function getOwnedStickers(): Sticker[] {
  return loadStickers()
    .map((id) => getStickerById(id))
    .filter((sticker): sticker is Sticker => Boolean(sticker));
}
