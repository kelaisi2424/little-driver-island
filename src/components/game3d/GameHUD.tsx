import type { Level3D } from '../../data/levels3d';
import type { ChallengeConfig, DrivingTelemetry } from '../../data/challenge3d';
import { previewStars } from '../../data/challenge3d';

interface GameHUDProps {
  level: Level3D;
  speed: number;
  elapsedSeconds: number;
  checkpointPassed: number;
  muted: boolean;
  /** v1.7: 当前模式，'challenge' 时切换 HUD 布局 */
  mode?: 'easy' | 'challenge';
  challengeConfig?: ChallengeConfig | null;
  telemetry?: DrivingTelemetry | null;
  onPause: () => void;
  onToggleMute: () => void;
  onHome: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function GameHUD({
  level,
  speed,
  elapsedSeconds,
  checkpointPassed,
  muted,
  mode = 'easy',
  challengeConfig,
  telemetry,
  onPause,
  onToggleMute,
  onHome,
}: GameHUDProps) {
  const checkpointText = level.checkpoints.length > 0
    ? `${checkpointPassed}/${level.checkpoints.length}`
    : '终点';

  const isChallenge = mode === 'challenge' && challengeConfig?.enabled;

  // 挑战模式：实时计算当前预估星级
  let starPreview = 3;
  if (isChallenge && challengeConfig && telemetry) {
    starPreview = previewStars(telemetry, challengeConfig, level);
  }

  return (
    <div className={`game3d-hud ${isChallenge ? 'is-challenge' : ''}`}>
      <div className="game3d-hud-left">
        <button onClick={onPause} type="button">暂停</button>
        <span>第 {level.id} 关</span>
        {isChallenge && challengeConfig ? (
          <span className="game3d-hud-time-target">
            ⏱ {formatTime(elapsedSeconds)} <em>/ {formatTime(challengeConfig.targetTime)}</em>
          </span>
        ) : (
          <span>{elapsedSeconds}s</span>
        )}
      </div>
      <div className="game3d-hud-center">
        <strong>{speed}</strong>
        <em>km/h</em>
        {isChallenge ? (
          <span className="game3d-hud-star-preview">
            {[1, 2, 3].map((i) => (
              <span key={i} className={i <= starPreview ? 'on' : 'off'}>★</span>
            ))}
          </span>
        ) : (
          <span>进度 {checkpointText}</span>
        )}
      </div>
      <div className="game3d-hud-right">
        {isChallenge && telemetry ? (
          <span className="game3d-hud-collisions" title="碰撞次数">
            💥 {telemetry.collisions}
          </span>
        ) : null}
        {isChallenge ? (
          <span className="game3d-hud-checkpoints" title="检查点">
            🚩 {checkpointText}
          </span>
        ) : null}
        <button onClick={onToggleMute} type="button">{muted ? '静音' : '声音'}</button>
        <button onClick={onHome} type="button">首页</button>
      </div>
    </div>
  );
}
