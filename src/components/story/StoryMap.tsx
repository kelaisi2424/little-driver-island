// v1.8 汽车城地图：新首页主入口
// - 10 个地点散布在 2D 地图上
// - 当前主任务地点高亮 + NPC 对话气泡
// - 已完成章节地点显示 ✓ 绿勾
// - 锁定章节地点显示 🔒
// - 次入口：章节选关 / 车库 / 贴纸册 / 家长设置（保留旧入口）

import {
  CITY_LOCATIONS,
  STORY_CHAPTERS,
  type LocationKey,
  type StoryChapter,
} from '../../data/storyChapters';
import { getStoryMission } from '../../data/storyMissions';
import type { Car3D } from '../../data/cars3d';

interface StoryMapProps {
  unlockedLevel: number;        // 1..100
  currentChapterId: number;     // 当前主线所在章
  chapterCompletion: Record<number, number>;   // chapterId → 完成关数 0..10
  selectedCar: Car3D;
  totalChallengeStars: number;
  challengeAvailable: boolean;
  drivingMode: 'easy' | 'challenge';
  dailyMinutes: number;
  usedSeconds: number;
  /** 用户点击主任务（汽车按钮） */
  onPickActiveMission: () => void;
  /** 用户点击地图上一个地点（如果该章解锁则进入章节选关） */
  onPickLocation: (chapterId: number) => void;
  onSwitchMode: (mode: 'easy' | 'challenge') => void;
  onChapters: () => void;
  onGarage: () => void;
  onStickers: () => void;
  onParent: () => void;
}

// 把 CHAPTERS 按 location 索引（每个 location 对应一个 chapter）
function buildLocationToChapterMap(): Map<LocationKey, StoryChapter[]> {
  const map = new Map<LocationKey, StoryChapter[]>();
  for (const ch of STORY_CHAPTERS) {
    const list = map.get(ch.location) ?? [];
    list.push(ch);
    map.set(ch.location, list);
  }
  return map;
}

const LOCATION_TO_CHAPTERS = buildLocationToChapterMap();

export default function StoryMap({
  unlockedLevel,
  currentChapterId,
  chapterCompletion,
  selectedCar,
  totalChallengeStars,
  challengeAvailable,
  drivingMode,
  dailyMinutes,
  usedSeconds,
  onPickActiveMission,
  onPickLocation,
  onSwitchMode,
  onChapters,
  onGarage,
  onStickers,
  onParent,
}: StoryMapProps) {
  const activeMission = getStoryMission(unlockedLevel);
  const usedMinutes = Math.floor(usedSeconds / 60);

  return (
    <main className="story-map-page">
      {/* 顶部状态条 */}
      <header className="sm-header">
        <div className="sm-header-text">
          <h1>🌆 小小司机汽车城</h1>
          <p>第 {unlockedLevel}/100 关 · 今日 {usedMinutes}/{dailyMinutes} 分钟</p>
        </div>
        <button
          type="button"
          className="sm-garage-quick"
          onClick={onGarage}
          aria-label="车库"
        >
          {selectedCar.emoji}
        </button>
      </header>

      {/* 模式切换 (V1.7 兼容，仅当家长允许显示) */}
      {challengeAvailable && (
        <div className="sm-mode-switch" role="tablist">
          <button
            role="tab"
            type="button"
            aria-selected={drivingMode === 'easy'}
            className={`sm-mode-tab ${drivingMode === 'easy' ? 'is-active' : ''}`}
            onClick={() => onSwitchMode('easy')}
          >
            🎈 轻松练习
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={drivingMode === 'challenge'}
            className={`sm-mode-tab ${drivingMode === 'challenge' ? 'is-active' : ''}`}
            onClick={() => onSwitchMode('challenge')}
          >
            🏆 挑战 · ⭐ {totalChallengeStars}/300
          </button>
        </div>
      )}

      {/* 汽车城地图 */}
      <div className="sm-map" aria-label="汽车城地图">
        {/* 装饰：道路（CSS 渐变伪元素） */}
        <div className="sm-map-roads" aria-hidden />
        {/* 装饰：树/云朵 */}
        <span className="sm-decor sm-cloud" style={{ left: '10%', top: '6%' }}>☁</span>
        <span className="sm-decor sm-cloud" style={{ right: '12%', top: '10%' }}>☁</span>
        <span className="sm-decor sm-tree" style={{ left: '40%', top: '32%' }}>🌳</span>
        <span className="sm-decor sm-tree" style={{ right: '40%', top: '60%' }}>🌳</span>
        <span className="sm-decor sm-tree" style={{ left: '8%', top: '88%' }}>🌲</span>
        <span className="sm-decor sm-tree" style={{ right: '6%', top: '40%' }}>🌳</span>

        {CITY_LOCATIONS.map((loc) => {
          const chapters = LOCATION_TO_CHAPTERS.get(loc.key) ?? [];
          // 一个地点可能对应多个章节（驾驶学校 = 第 1、第 10 章）
          const primaryChapter = chapters[0];
          if (!primaryChapter) return null;
          // 是否解锁：章节内任何一关解锁过
          const firstLevelOfChapter = (primaryChapter.id - 1) * 10 + 1;
          const unlocked = unlockedLevel >= firstLevelOfChapter;
          const completed = (chapterCompletion[primaryChapter.id] ?? 0) >= 10;
          const isActive = primaryChapter.id === currentChapterId;

          return (
            <button
              key={loc.key}
              type="button"
              className={`sm-pin ${unlocked ? 'is-unlocked' : 'is-locked'} ${completed ? 'is-completed' : ''} ${isActive ? 'is-active' : ''}`}
              style={{
                left: `${loc.x}%`,
                top: `${loc.y}%`,
                ['--pin-bg' as string]: loc.bgColor,
              }}
              disabled={!unlocked}
              onClick={() => unlocked && onPickLocation(primaryChapter.id)}
              aria-label={`${loc.name}${unlocked ? '' : '（未解锁）'}`}
            >
              <span className="sm-pin-emoji">
                {unlocked ? loc.emoji : '🔒'}
              </span>
              <span className="sm-pin-name">{loc.name}</span>
              {completed && <span className="sm-pin-check">✓</span>}
              {isActive && unlocked && (
                <span className="sm-pin-bubble">
                  {primaryChapter.npc.emoji} 等你
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 主任务卡片 */}
      <button
        type="button"
        className={`sm-active-mission ${drivingMode === 'challenge' ? 'is-challenge' : ''}`}
        onClick={onPickActiveMission}
      >
        <div
          className="sm-am-avatar"
          style={{ background: activeMission.npc.bodyColor }}
        >
          {activeMission.npc.emoji}
        </div>
        <div className="sm-am-text">
          <small>第 {activeMission.chapterId} 章 · {activeMission.chapterTitle}</small>
          <strong>
            {drivingMode === 'challenge' ? '🏆 ' : ''}
            {activeMission.npc.name}：{activeMission.introDialog}
          </strong>
          <em>第 {activeMission.levelId} 关 · {activeMission.missionTitle}</em>
        </div>
        <span className="sm-am-go">▶</span>
      </button>

      {/* 次入口（保留章节选关 / 车库 / 贴纸册 / 家长） */}
      <div className="sm-secondary-actions">
        <button type="button" onClick={onChapters}>章节选关</button>
        <button type="button" onClick={onGarage}>{selectedCar.emoji} 车库</button>
        <button type="button" onClick={onStickers}>贴纸册</button>
        <button
          type="button"
          onPointerDown={(event) => {
            const target = event.currentTarget;
            const timer = window.setTimeout(() => onParent(), 850);
            const clear = () => window.clearTimeout(timer);
            target.addEventListener('pointerup', clear, { once: true });
            target.addEventListener('pointerleave', clear, { once: true });
          }}
        >
          家长设置 长按
        </button>
      </div>
    </main>
  );
}
