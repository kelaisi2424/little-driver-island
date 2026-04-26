// 章内 10 关选择页：一行排列糖果徽章。

import type { Chapter3D } from '../../data/chapters3d';
import { getChapterLevels } from '../../data/levels3d';

interface LevelSelectChapterProps {
  chapter: Chapter3D;
  unlockedLevel: number;
  starsByLevel: Record<string, number>;
  onPick: (levelId: number) => void;
  onBack: () => void;
}

export default function LevelSelectChapter({
  chapter,
  unlockedLevel,
  starsByLevel,
  onPick,
  onBack,
}: LevelSelectChapterProps) {
  const levels = getChapterLevels(chapter.id);

  return (
    <main className="lsc-page" style={{ ['--ch-color' as string]: chapter.color }}>
      <header className="cs-header">
        <button className="cs-back" onClick={onBack} type="button">←</button>
        <h1>第 {chapter.id} 章 · {chapter.title}</h1>
        <div className="cs-spacer" />
      </header>
      <p className="cs-desc">{chapter.subtitle}</p>

      <div className="lsc-grid">
        {levels.map((lv) => {
          const stars = starsByLevel[String(lv.id)] ?? 0;
          const unlocked = lv.id <= unlockedLevel;
          const current = lv.id === unlockedLevel;
          return (
            <button
              key={lv.id}
              type="button"
              className={`lsc-node ${unlocked ? '' : 'is-locked'} ${current ? 'is-current' : ''}`}
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
