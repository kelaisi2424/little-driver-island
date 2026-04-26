import type { DrivingLevel } from '../types';

interface GameHUDProps {
  level: DrivingLevel;
  stars: number;
  speed: number;
  usedSeconds: number;
  muted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
}

export default function GameHUD({
  level,
  stars,
  speed,
  usedSeconds,
  muted,
  onPause,
  onToggleMute,
}: GameHUDProps) {
  return (
    <header className="drive-hud">
      <div className="hud-left">
        <strong>第 {level.id} 关</strong>
        <span>{level.mission}</span>
      </div>
      <div className="hud-center">
        <span>{'⭐'.repeat(stars)}{'☆'.repeat(Math.max(0, 3 - stars))}</span>
        <b>{Math.round(speed)} km/h</b>
      </div>
      <div className="hud-buttons">
        <span>{Math.floor(usedSeconds / 60)} 分钟</span>
        <button onClick={onToggleMute} type="button">{muted ? '🔇' : '🔊'}</button>
        <button onClick={onPause} type="button">暂停</button>
      </div>
    </header>
  );
}
