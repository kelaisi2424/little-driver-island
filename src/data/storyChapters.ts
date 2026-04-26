// v1.8 剧情章节：在现有 10 个训练章节外面包一层"故事剧情"。
// 关卡 ID 完全沿用 levels3d.ts 的 1-100，本文件只做剧情皮肤。
// 每章绑定一个 NPC、一个汽车城地点、一个主题。

export type LocationKey =
  | 'home'           // 🏠 家
  | 'kindergarten'   // 🏫 幼儿园
  | 'garage'         // 🔧 修车厂
  | 'rainCity'       // 🌧 下雨的汽车城
  | 'crossing'       // 🚦 交警岗
  | 'supermarket'    // 🛒 超市
  | 'busStop'        // 🚏 巴士站
  | 'mountain'       // ⛰ 山路 / 公园
  | 'cityHall'       // 🏛 市政厅 / 汽车城中心
  | 'school';        // 🎓 驾驶学校 / 毕业典礼

export interface CityLocation {
  key: LocationKey;
  name: string;
  emoji: string;
  /** 在汽车城地图上的位置 (百分比 0-100) */
  x: number;
  y: number;
  bgColor: string;
}

export interface NpcDef {
  id: string;
  name: string;       // e.g. 小兔老师
  emoji: string;      // 🐰
  bodyColor: string;  // 头像背景色
  /** NPC 自我介绍（作为章节简介使用） */
  intro: string;
}

export interface StoryChapter {
  id: number;             // 1-10，对应原训练章节
  title: string;          // 故事章节名："幼儿园早晨"
  subtitle: string;       // 副标题/场景描述
  emoji: string;          // 章节代表 emoji
  npc: NpcDef;
  location: LocationKey;
  themeColor: string;     // 故事主色（任务卡背景渐变）
  themeAccent: string;    // 强调色
}

// =====================================================================
// 8 个汽车城地点 + 2 个特殊地点（驾校 / 市政厅），地图上展示
// =====================================================================

export const CITY_LOCATIONS: readonly CityLocation[] = [
  { key: 'home',         name: '家',     emoji: '🏠', x: 18, y: 18, bgColor: '#fde68a' },
  { key: 'school',       name: '驾驶学校', emoji: '🎓', x: 50, y: 14, bgColor: '#fbcfe8' },
  { key: 'kindergarten', name: '幼儿园', emoji: '🏫', x: 82, y: 22, bgColor: '#bbf7d0' },
  { key: 'garage',       name: '修车厂', emoji: '🔧', x: 22, y: 46, bgColor: '#cbd5e1' },
  { key: 'rainCity',     name: '雨天市区', emoji: '🌧',  x: 50, y: 42, bgColor: '#bae6fd' },
  { key: 'crossing',     name: '交警岗', emoji: '🚦', x: 80, y: 50, bgColor: '#fecaca' },
  { key: 'supermarket',  name: '超市',   emoji: '🛒', x: 18, y: 70, bgColor: '#fed7aa' },
  { key: 'busStop',      name: '巴士站', emoji: '🚏', x: 48, y: 72, bgColor: '#ddd6fe' },
  { key: 'mountain',     name: '山路公园', emoji: '⛰', x: 80, y: 76, bgColor: '#a7f3d0' },
  { key: 'cityHall',     name: '汽车城中心', emoji: '🏛', x: 50, y: 92, bgColor: '#fde68a' },
];

export function getLocation(key: LocationKey): CityLocation {
  return CITY_LOCATIONS.find((l) => l.key === key) ?? CITY_LOCATIONS[0];
}

// =====================================================================
// 10 个 NPC（每章一个主角）
// =====================================================================

export const NPCS: Record<string, NpcDef> = {
  bear:    { id: 'bear',    name: '小熊教练',  emoji: '🐻', bodyColor: '#a16207', intro: '我教你怎么开车，从慢慢起步开始。' },
  rabbit:  { id: 'rabbit',  name: '小兔老师',  emoji: '🐰', bodyColor: '#f9a8d4', intro: '幼儿园的小朋友们等着上学。' },
  panda:   { id: 'panda',   name: '熊猫师傅',  emoji: '🐼', bodyColor: '#475569', intro: '修车厂今天有好多活儿，你来帮我吧。' },
  cat:     { id: 'cat',     name: '小猫镇长',  emoji: '🐱', bodyColor: '#fb923c', intro: '今天下雨啦，要慢慢开。' },
  elephant:{ id: 'elephant',name: '小象交警',  emoji: '🐘', bodyColor: '#94a3b8', intro: '交通规则我最熟，跟着我学最安全。' },
  fox:     { id: 'fox',     name: '小狐狸店长', emoji: '🦊', bodyColor: '#dc2626', intro: '超市要送好多颜色和数字货物。' },
  pig:     { id: 'pig',     name: '小猪司机',  emoji: '🐷', bodyColor: '#fbcfe8', intro: '我开巴士接小朋友，每站都得停。' },
  bird:    { id: 'bird',    name: '小鸟向导',  emoji: '🐦', bodyColor: '#22d3ee', intro: '山路有点弯，我带你慢慢开。' },
  lion:    { id: 'lion',    name: '狮子市长',  emoji: '🦁', bodyColor: '#eab308', intro: '汽车城有大任务等你完成！' },
  owl:     { id: 'owl',     name: '猫头鹰校长', emoji: '🦉', bodyColor: '#7c3aed', intro: '毕业考试到啦，看你这一路学到了什么。' },
};

// =====================================================================
// 10 个剧情章节（完全包住 100 关）
// =====================================================================

export const STORY_CHAPTERS: readonly StoryChapter[] = [
  {
    id: 1,
    title: '拿到小司机证',
    subtitle: '从驾驶学校开始，学会启动、刹车、转弯',
    emoji: '🪪',
    npc: NPCS.bear,
    location: 'school',
    themeColor: '#fef3c7',
    themeAccent: '#f59e0b',
  },
  {
    id: 2,
    title: '幼儿园早晨',
    subtitle: '小兔老师等你帮忙送小朋友上学',
    emoji: '🏫',
    npc: NPCS.rabbit,
    location: 'kindergarten',
    themeColor: '#fce7f3',
    themeAccent: '#ec4899',
  },
  {
    id: 3,
    title: '修车厂的一天',
    subtitle: '送轮胎、找零件、开进维修车位',
    emoji: '🔧',
    npc: NPCS.panda,
    location: 'garage',
    themeColor: '#e2e8f0',
    themeAccent: '#475569',
  },
  {
    id: 4,
    title: '下雨的汽车城',
    subtitle: '雨天慢慢开，遇到水坑要绕开',
    emoji: '🌧',
    npc: NPCS.cat,
    location: 'rainCity',
    themeColor: '#dbeafe',
    themeAccent: '#3b82f6',
  },
  {
    id: 5,
    title: '交通安全周',
    subtitle: '小象交警教你看红绿灯、停斑马线',
    emoji: '🚦',
    npc: NPCS.elephant,
    location: 'crossing',
    themeColor: '#fee2e2',
    themeAccent: '#dc2626',
  },
  {
    id: 6,
    title: '超市送货',
    subtitle: '按颜色和数字把货物送到小屋',
    emoji: '🛒',
    npc: NPCS.fox,
    location: 'supermarket',
    themeColor: '#ffedd5',
    themeAccent: '#ea580c',
  },
  {
    id: 7,
    title: '小巴士路线',
    subtitle: '开巴士按站点接送小朋友',
    emoji: '🚌',
    npc: NPCS.pig,
    location: 'busStop',
    themeColor: '#ede9fe',
    themeAccent: '#7c3aed',
  },
  {
    id: 8,
    title: '山路郊游',
    subtitle: '小鸟向导带你走弯弯山路',
    emoji: '⛰',
    npc: NPCS.bird,
    location: 'mountain',
    themeColor: '#dcfce7',
    themeAccent: '#16a34a',
  },
  {
    id: 9,
    title: '汽车城大任务',
    subtitle: '狮子市长发布的综合任务',
    emoji: '🏛',
    npc: NPCS.lion,
    location: 'cityHall',
    themeColor: '#fef9c3',
    themeAccent: '#ca8a04',
  },
  {
    id: 10,
    title: '安全驾驶小达人',
    subtitle: '猫头鹰校长的毕业考试',
    emoji: '🎓',
    npc: NPCS.owl,
    location: 'school',
    themeColor: '#f5d0fe',
    themeAccent: '#a21caf',
  },
];

export function getStoryChapter(chapterId: number): StoryChapter {
  return STORY_CHAPTERS[chapterId - 1] ?? STORY_CHAPTERS[0];
}

export function getStoryChapterByLevelId(levelId: number): StoryChapter {
  const safe = Math.max(1, Math.min(100, levelId));
  const chapterId = Math.ceil(safe / 10);
  return getStoryChapter(chapterId);
}
