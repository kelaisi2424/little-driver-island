// 章节选择页：10 张章节卡片，显示进度 + 解锁状态。

import { CHAPTERS_3D, type Chapter3D } from '../../data/chapters3d';
import { loadStickers } from '../../utils/stickers';

export interface ChapterProgress {
  completed: number;     // 0..10
  totalStars: number;    // 章内累计星星 0..30
}

interface ChapterSelectProps {
  unlockedLevel: number;       // 全局已解锁到第 N 关
  progress: Record<number, ChapterProgress>;   // chapterId → progress
  onSelect: (chapter: Chapter3D) => void;
  onBack: () => void;
}

export default function ChapterSelect({
  unlockedLevel,
  progress,
  onSelect,
  onBack,
}: ChapterSelectProps) {
  const ownedStickers = new Set(loadStickers());

  return (
    <main className="chapter-select-page">
      <header className="cs-header">
        <button className="cs-back" onClick={onBack} type="button">←</button>
        <h1>选择章节</h1>
        <div className="cs-spacer" />
      </header>
      <p className="cs-desc">10 个章节 · 100 关闯关之旅</p>

      <div className="cs-grid">
        {CHAPTERS_3D.map((ch) => {
          const firstLevelOfChapter = (ch.id - 1) * 10 + 1;
          const unlocked = unlockedLevel >= firstLevelOfChapter;
          const prog = progress[ch.id] ?? { completed: 0, totalStars: 0 };
          const stickerOwned = ownedStickers.has(ch.stickerId);
          return (
            <button
              key={ch.id}
              type="button"
              className={`cs-card ${unlocked ? 'is-unlocked' : 'is-locked'}`}
              style={{ ['--ch-color' as string]: ch.color }}
              disabled={!unlocked}
              onClick={() => unlocked && onSelect(ch)}
            >
              <div className="cs-card-emoji">{ch.emoji}</div>
              <div className="cs-card-meta">
                <div className="cs-card-row1">
                  <span className="cs-chapter-num">第 {ch.id} 章</span>
                  {!unlocked && <span className="cs-lock">🔒</span>}
                </div>
                <div className="cs-card-title">{ch.title}</div>
                <div className="cs-card-sub">{ch.subtitle}</div>
                <div className="cs-card-progress">
                  <div className="cs-bar"><span style={{ width: `${(prog.completed / 10) * 100}%` }} /></div>
                  <span>{prog.completed}/10</span>
                </div>
              </div>
              <div className={`cs-card-sticker ${stickerOwned ? 'is-owned' : 'is-locked'}`}>
                <div className="cs-sticker-emoji" style={{ background: ch.stickerColor }}>
                  {stickerOwned ? ch.stickerEmoji : '?'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
