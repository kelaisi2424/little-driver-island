import type { DrivingLevel } from '../types';
import { DRIVING_LEVELS } from '../data/levels';

interface LevelSelectProps {
  currentLevel: number;
  getStars: (levelId: number) => number;
  onStartLevel: (level: DrivingLevel) => void;
  onBack: () => void;
}

export default function LevelSelect({
  currentLevel,
  getStars,
  onStartLevel,
  onBack,
}: LevelSelectProps) {
  const categories = Array.from(new Set(DRIVING_LEVELS.map((level) => level.category)));

  return (
    <main className="panel-screen level-select-screen">
      <header className="panel-header">
        <button onClick={onBack} type="button">返回</button>
        <h1>选择关卡</h1>
        <span>共 30 关</span>
      </header>

      <div className="driving-level-list">
        {categories.map((category) => {
          const levels = DRIVING_LEVELS.filter((level) => level.category === category);
          return (
            <section key={category} className="level-category">
              <h2>{levels[0].categoryName}</h2>
              <div className="level-row">
                {levels.map((level) => {
                  const locked = level.id > currentLevel;
                  const stars = getStars(level.id);
                  return (
                    <button
                      key={level.id}
                      className={`level-chip ${locked ? 'locked' : ''}`}
                      onClick={() => !locked && onStartLevel(level)}
                      disabled={locked}
                      type="button"
                    >
                      <strong>{level.id}</strong>
                      <small>{locked ? '锁定' : stars ? '★'.repeat(stars) : '出发'}</small>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
