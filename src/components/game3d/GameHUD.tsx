import type { Level3D } from '../../data/levels3d';

interface GameHUDProps {
  level: Level3D;
  speed: number;
  elapsedSeconds: number;
  checkpointPassed: number;
  muted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
  onHome: () => void;
}

export default function GameHUD({
  level,
  speed,
  elapsedSeconds,
  checkpointPassed,
  muted,
  onPause,
  onToggleMute,
  onHome,
}: GameHUDProps) {
  const checkpointText = level.checkpoints.length > 0
    ? `${checkpointPassed}/${level.checkpoints.length}`
    : '终点';

  return (
    <div className="game3d-hud">
      <div className="game3d-hud-left">
        <button onClick={onPause} type="button">暂停</button>
        <span>第 {level.id} 关</span>
        <span>{elapsedSeconds}s</span>
      </div>
      <div className="game3d-hud-center">
        <strong>{speed}</strong>
        <em>km/h</em>
        <span>进度 {checkpointText}</span>
      </div>
      <div className="game3d-hud-right">
        <button onClick={onToggleMute} type="button">{muted ? '静音' : '声音'}</button>
        <button onClick={onHome} type="button">首页</button>
      </div>
    </div>
  );
}
