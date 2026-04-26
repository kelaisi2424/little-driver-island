// 章内 10 关选择页：一行排列糖果徽章。
// v1.7：根据 mode 决定显示普通完成状态还是挑战星级。

import type { Chapter3D } from '../../data/chapters3d';
import { getChapterLevels } from '../../data/levels3d';

interface LevelSelectChapterProps {
  chapter: Chapter3D;
  unlockedLevel: number;
  starsByLevel: Record<string, number>;
  /** v1.7: 'easy' = 显示普通完成（绿勾/星），'challenge' = 显示 1-3 星 */
  mode?: 'easy' | 'challenge';
  challengeStarsByLevel?: Record<string, number>;
  onPick: (levelId: number) => void;
  onBack: () => void;
}

export default function LevelSelectChapter({
  chapter,
  unlockedLevel,
  starsByLevel,
  mode = 'easy',
  challengeStarsByLevel = {},
  onPick,
  onBack,
}: LevelSelectChapterProps) {
  const levels = getChapterLevels(chapter.id);
  const isChallenge = mode === 'challenge';

  return (
    <main className="lsc-page" style={{ ['--ch-color' as string]: chapter.color }}>
      <header className="cs-header">
        <button className="cs-back" onClick={onBack} type="button">←</button>
        <h1>第 {chapter.id} 章 · {chapter.title}</h1>
        <div className="cs-spacer" />
      </header>
      <p className="cs-desc">
        {chapter.subtitle}
        {isChallenge && <span className="lsc-mode-badge">🏆 挑战模式</span>}
      </p>

      <div className="lsc-grid">
        {levels.map((lv) => {
          const easyStars = starsByLevel[String(lv.id)] ?? 0;
          const chStars = challengeStarsByLevel[String(lv.id)] ?? 0;
          const stars = isChallenge ? chStars : easyStars;
          const unlocked = lv.id <= unlockedLevel;
          const current = lv.id === unlockedLevel;
          return (
            <button
              key={lv.id}
              type="button"
              className={`lsc-node ${unlocked ? '' : 'is-locked'} ${current ? 'is-current' : ''} ${isChallenge ? 'is-challenge' : ''}`}
              disabled={!unlocked}
              onClick={() => unlocked && onPick(lv.id)}
            >
              {unlocked ? (
                <>
                  <div className="lsc-num">{lv.id}</div>
                  <div className="lsc-stars" aria-hidden>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={i < stars ? 'on' : 'off'}>⭐</span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="lsc-lock">🔒</div>
              )}
              <span className="lsc-name">{lv.name}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
