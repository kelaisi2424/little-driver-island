export interface Sticker {
  id: string;
  color: string;
  name: string;
  emoji: string;
}

export const STICKER_POOL: readonly Sticker[] = [
  // ===== 100 关章节贴纸（每章第 10 关解锁） =====
  { id: 'ch1-novice',   color: '#ff8c69', name: '新手小司机',     emoji: '🚗' },
  { id: 'ch2-dodge',    color: '#ff7b3a', name: '躲障碍小能手',   emoji: '🚧' },
  { id: 'ch3-number',   color: '#ffd166', name: '数字车道达人',   emoji: '🔢' },
  { id: 'ch4-traffic',  color: '#5cd684', name: '红绿灯小卫士',   emoji: '🚦' },
  { id: 'ch5-parking',  color: '#4a9ff0', name: '停车小高手',     emoji: '🅿️' },
  { id: 'ch6-yield',    color: '#ff9eb6', name: '礼让小司机',     emoji: '🚸' },
  { id: 'ch7-rain',     color: '#7ad6f6', name: '雨天慢行星',     emoji: '🌧️' },
  { id: 'ch8-bus',      color: '#ffd700', name: '小巴士队长',     emoji: '🚌' },
  { id: 'ch9-color',    color: '#a07ad6', name: '颜色路线王',     emoji: '🎨' },
  { id: 'ch10-master',  color: '#ff5e3a', name: '安全驾驶大师',   emoji: '🏆' },
  // ===== 旧版兼容贴纸（旧关卡可能颁发，留着不破存档） =====
  { id: 'safe-car',       color: '#ff8c69', name: '安全小车贴纸', emoji: '🚗' },
  { id: 'parking-master', color: '#4a90e2', name: '停车高手贴纸', emoji: '🅿️' },
  { id: 'traffic-light',  color: '#5cd684', name: '红绿灯贴纸',   emoji: '🚦' },
  { id: 'little-bus',     color: '#ffd166', name: '小巴士贴纸',   emoji: '🚌' },
  { id: 'curve-driver',   color: '#a07ad6', name: '弯道小达人贴纸', emoji: '🏁' },
  { id: 'school-driver',  color: '#7ad6b8', name: '安全到幼儿园贴纸', emoji: '🏫' },
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
