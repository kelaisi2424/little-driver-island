import type { Level3D } from '../../data/levels3d';
import type { ChallengeConfig } from '../../data/challenge3d';

interface MissionCardProps {
  level: Level3D;
  /** v1.7: 'easy' = 普通模式（旧行为），'challenge' = 挑战模式 */
  mode?: 'easy' | 'challenge';
  challengeConfig?: ChallengeConfig | null;
  onStart: () => void;
  onBack: () => void;
}

export default function MissionCard({
  level,
  mode = 'easy',
  challengeConfig,
  onStart,
  onBack,
}: MissionCardProps) {
  const isChallenge = mode === 'challenge' && challengeConfig?.enabled;

  return (
    <div className="game3d-overlay">
      <section className={`game3d-mission-card ${isChallenge ? 'is-challenge' : ''}`}>
        <div className="game3d-level-pill">
          {isChallenge ? `🏆 第 ${level.id} 关 · 挑战` : `第 ${level.id} 关`}
        </div>
        <h1>{level.name}</h1>
        <p>{level.mission}</p>

        {isChallenge && challengeConfig ? (
          <>
            <div className="game3d-challenge-banner">
              <span className="game3d-challenge-tag">{challengeConfig.label}</span>
              <span className="game3d-challenge-time">⏱ 目标 {challengeConfig.targetTime} 秒</span>
            </div>
            <ul className="game3d-challenge-objectives">
              {challengeConfig.bonusObjectives.map((obj, i) => (
                <li key={i}>
                  <span className="game3d-objective-bullet">★</span>
                  {obj}
                </li>
              ))}
            </ul>
            <div className="game3d-mini-road">
              <span className="game3d-mini-car">🏎</span>
              <span className="game3d-mini-flag">🏁</span>
            </div>
            <button className="game3d-primary game3d-primary-challenge" onClick={onStart} type="button">
              开始挑战
            </button>
          </>
        ) : (
          <>
            <div className="game3d-mini-road">
              <span className="game3d-mini-car">🚗</span>
              <span className="game3d-mini-flag">🏁</span>
            </div>
            <button className="game3d-primary" onClick={onStart} type="button">开始</button>
          </>
        )}

        <button className="game3d-link" onClick={onBack} type="button">回首页</button>
      </section>
    </div>
  );
}
