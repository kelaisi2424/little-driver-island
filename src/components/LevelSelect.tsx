// 选关页：10 关网格，未解锁的灰色 + 锁。

import { PLAY_LEVELS } from '../data/playLevels';
import type { PlayProgress } from '../types';

interface LevelSelectProps {
  progress: PlayProgress;
  onPick: (levelId: number) => void;
  onBack: () => void;
}

export default function LevelSelect({ progress, onPick, onBack }: LevelSelectProps) {
  return (
    <main className="ls-page">
      <header className="ls-header">
        <button className="ls-back" onClick={onBack} type="button" aria-label="返回">←</button>
        <h1>选择关卡</h1>
        <div className="ls-spacer" />
      </header>

      <p className="ls-desc">点亮过的关卡可以重玩，星星越多越棒</p>

      <div className="ls-grid">
        {PLAY_LEVELS.map((level) => {
          const unlocked = level.id <= progress.currentLevel;
          const stars = progress.stars[String(level.id)] ?? 0;
          return (
            <button
              key={level.id}
              className={`ls-cell ${unlocked ? 'unlocked' : 'locked'}`}
              onClick={() => unlocked && onPick(level.id)}
              type="button"
              disabled={!unlocked}
            >
              <div className="ls-num">{level.id}</div>
              <div className="ls-name">{level.title}</div>
              {unlocked ? (
                <div className="ls-stars">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={i < stars ? 'on' : 'off'}>⭐</span>
                  ))}
                </div>
              ) : (
                <div className="ls-lock" aria-hidden>🔒</div>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
