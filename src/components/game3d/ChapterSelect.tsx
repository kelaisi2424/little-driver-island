// 章节选择页：10 张章节卡片，显示进度 + 解锁状态。
// v1.7：根据 mode 显示普通进度 OR 挑战星总数。

import { CHAPTERS_3D, type Chapter3D } from '../../data/chapters3d';
import { loadStickers } from '../../utils/stickers';

export interface ChapterProgress {
  completed: number;     // 0..10 普通完成数
  totalStars: number;    // 0..30 普通累计星
  challengeCompleted?: number;   // v1.7：挑战完成数
  challengeStars?: number;       // v1.7：挑战累计星 0..30
}

interface ChapterSelectProps {
  unlockedLevel: number;       // 全局已解锁到第 N 关
  progress: Record<number, ChapterProgress>;   // chapterId → progress
  /** v1.7：'challenge' 时强调显示挑战星总数 */
  mode?: 'easy' | 'challenge';
  onSelect: (chapter: Chapter3D) => void;
  onBack: () => void;
}

export default function ChapterSelect({
  unlockedLevel,
  progress,
  mode = 'easy',
  onSelect,
  onBack,
}: ChapterSelectProps) {
  const ownedStickers = new Set(loadStickers());
  const isChallenge = mode === 'challenge';

  return (
    <main className="chapter-select-page">
      <header className="cs-header">
        <button className="cs-back" onClick={onBack} type="button">←</button>
        <h1>选择章节</h1>
        <div className="cs-spacer" />
      </header>
      <p className="cs-desc">
        {isChallenge ? '挑战模式 · 拿三星' : '10 个章节 · 100 关闯关之旅'}
      </p>

      <div className="cs-grid">
        {CHAPTERS_3D.map((ch) => {
          const firstLevelOfChapter = (ch.id - 1) * 10 + 1;
          const unlocked = unlockedLevel >= firstLevelOfChapter;
          const prog = progress[ch.id] ?? { completed: 0, totalStars: 0 };
          const stickerOwned = ownedStickers.has(ch.stickerId);
          const chStars = prog.challengeStars ?? 0;
          const chCompleted = prog.challengeCompleted ?? 0;
          return (
            <button
              key={ch.id}
              type="button"
              className={`cs-card ${unlocked ? 'is-unlocked' : 'is-locked'} ${isChallenge ? 'is-challenge' : ''}`}
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

                {/* 普通进度始终显示 */}
                <div className="cs-card-progress">
                  <div className="cs-bar"><span style={{ width: `${(prog.completed / 10) * 100}%` }} /></div>
                  <span>{prog.completed}/10</span>
                </div>

                {/* 挑战模式额外显示挑战星总数（unlocked 时才显示） */}
                {isChallenge && unlocked && (
                  <div className="cs-card-challenge">
                    <span className="cs-card-challenge-stars">⭐ {chStars}/30</span>
                    <span className="cs-card-challenge-completed">{chCompleted}/10 关</span>
                  </div>
                )}
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
