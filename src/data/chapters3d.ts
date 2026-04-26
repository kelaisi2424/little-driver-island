// 10 章节元数据：章节标题、配色、奖励贴纸 id、章节简介。
// 章节 id 1..10，每章 10 关 → 100 关闯关。

export interface Chapter3D {
  id: number;
  title: string;
  subtitle: string;
  color: string;             // 章节卡片色调
  emoji: string;
  stickerId: string;         // 完成本章第 10 关时奖励
  stickerName: string;
  stickerEmoji: string;
  stickerColor: string;
  learningTopic: string;     // 一句话概括本章学到什么
}

export const CHAPTERS_3D: readonly Chapter3D[] = [
  { id: 1, title: '新手上路', subtitle: '油门、刹车、转向',
    color: '#5fb3ff', emoji: '🚗',
    stickerId: 'ch1-novice', stickerName: '新手小司机', stickerEmoji: '🚗', stickerColor: '#ff8c69',
    learningTopic: '熟悉小车的基本操作' },
  { id: 2, title: '障碍小路', subtitle: '看到障碍要绕开',
    color: '#ff8c69', emoji: '🚧',
    stickerId: 'ch2-dodge', stickerName: '躲障碍小能手', stickerEmoji: '🚧', stickerColor: '#ff7b3a',
    learningTopic: '看到障碍要慢慢绕开' },
  { id: 3, title: '数字车道', subtitle: '认识数字 1-5',
    color: '#ffd166', emoji: '🔢',
    stickerId: 'ch3-number', stickerName: '数字车道达人', stickerEmoji: '🔢', stickerColor: '#ffd166',
    learningTopic: '看清数字再开' },
  { id: 4, title: '红绿灯路口', subtitle: '红灯停 绿灯行',
    color: '#5cd684', emoji: '🚦',
    stickerId: 'ch4-traffic', stickerName: '红绿灯小卫士', stickerEmoji: '🚦', stickerColor: '#5cd684',
    learningTopic: '路口要看灯' },
  { id: 5, title: '停车训练', subtitle: 'P 是停车的地方',
    color: '#4a9ff0', emoji: '🅿️',
    stickerId: 'ch5-parking', stickerName: '停车小高手', stickerEmoji: '🅿️', stickerColor: '#4a9ff0',
    learningTopic: '停车要慢慢来' },
  { id: 6, title: '安全让行', subtitle: '让行人先走',
    color: '#ff9eb6', emoji: '🚸',
    stickerId: 'ch6-yield', stickerName: '礼让小司机', stickerEmoji: '🚸', stickerColor: '#ff9eb6',
    learningTopic: '看到行人要让一让' },
  { id: 7, title: '天气挑战', subtitle: '雨天慢一点',
    color: '#7ad6f6', emoji: '🌧️',
    stickerId: 'ch7-rain', stickerName: '雨天慢行星', stickerEmoji: '🌧️', stickerColor: '#7ad6f6',
    learningTopic: '下雨天要慢一点' },
  { id: 8, title: '小巴士接送', subtitle: '接小朋友去幼儿园',
    color: '#ffd700', emoji: '🚌',
    stickerId: 'ch8-bus', stickerName: '小巴士队长', stickerEmoji: '🚌', stickerColor: '#ffd700',
    learningTopic: '坐车要排队' },
  { id: 9, title: '颜色路线', subtitle: '看颜色开车',
    color: '#a07ad6', emoji: '🎨',
    stickerId: 'ch9-color', stickerName: '颜色路线王', stickerEmoji: '🎨', stickerColor: '#a07ad6',
    learningTopic: '认清颜色再走' },
  { id: 10, title: '安全驾驶大师', subtitle: '综合挑战',
    color: '#ff5e3a', emoji: '🏆',
    stickerId: 'ch10-master', stickerName: '安全驾驶大师', stickerEmoji: '🏆', stickerColor: '#ff5e3a',
    learningTopic: '看路看灯看人，安全到达最重要' },
];

export function getChapter(chapterId: number): Chapter3D {
  return CHAPTERS_3D.find((c) => c.id === chapterId) ?? CHAPTERS_3D[0];
}

export function chapterOfLevel(levelId: number): Chapter3D {
  // 第 1-10 关 → ch1，第 11-20 关 → ch2 ...
  const idx = Math.min(10, Math.max(1, Math.ceil(levelId / 10)));
  return getChapter(idx);
}

// 给定全局关卡 id（1..100）返回章内序号（1..10）
export function levelNumberInChapter(levelId: number): number {
  return ((levelId - 1) % 10) + 1;
}

// 第 N 章是否在第 levelId 关后解锁完成
export function isChapterEndLevel(levelId: number): boolean {
  return levelId % 10 === 0;
}

export const TOTAL_LEVELS_3D = CHAPTERS_3D.length * 10;
