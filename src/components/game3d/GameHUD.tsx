import type { Level3D } from '../../data/levels3d';
import type { ChallengeConfig, DrivingTelemetry } from '../../data/challenge3d';
import { previewStars } from '../../data/challenge3d';
import type { StoryMission } from '../../data/storyMissions';
import type { MissionProgress } from '../../three/missionObjectives';
import { getMissionGoalText } from '../../three/missionLogic';

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
  /** v1.9: 当前剧情任务 + 实时任务进度 */
  mission?: StoryMission;
  missionProgress?: MissionProgress | null;
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
  mission,
  missionProgress,
  onPause,
  onToggleMute,
  onHome,
}: GameHUDProps) {
  const isChallenge = mode === 'challenge' && challengeConfig?.enabled;

  // v1.9：根据 mission + missionProgress 计算"任务目标"文字（替代旧的"进度 X/Y"）
  const goalText = (mission && missionProgress)
    ? getMissionGoalText(mission, level, missionProgress)
    : level.checkpoints.length > 0
      ? `进度 ${checkpointPassed}/${level.checkpoints.length}`
      : '到达终点';

  // 挑战模式：实时计算当前预估星级
  let starPreview = 3;
  if (isChallenge && challengeConfig && telemetry) {
    starPreview = previewStars(telemetry, challengeConfig, level);
  }

  // v1.9: 修车厂任务在 HUD 角落显示货物标签
  const cargoBadge =
    mission?.gameplayType === 'repairDelivery' && mission.missionParams.cargoEmoji ? (
      <span className="game3d-hud-cargo" title={mission.missionParams.cargoLabel ?? '货物'}>
        {mission.missionParams.cargoEmoji}
      </span>
    ) : null;

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
          <span className="game3d-hud-goal">{goalText}</span>
        )}
      </div>
      <div className="game3d-hud-right">
        {cargoBadge}
        {isChallenge && telemetry ? (
          <span className="game3d-hud-collisions" title="碰撞次数">
            💥 {telemetry.collisions}
          </span>
        ) : null}
        {isChallenge ? (
          <span className="game3d-hud-checkpoints" title="进度">
            🚩 {goalText}
          </span>
        ) : null}
        <button onClick={onToggleMute} type="button">{muted ? '静音' : '声音'}</button>
        <button onClick={onHome} type="button">首页</button>
      </div>
    </div>
  );
}
