import type { GameDefinition } from '../types';

interface GameCardProps {
  game: GameDefinition;
  disabled: boolean;
  level?: number;
  stars?: number;
  onStart: () => void;
}

export default function GameCard({
  game,
  disabled,
  level = 1,
  stars = 0,
  onStart,
}: GameCardProps) {
  return (
    <button
      className="game-box-card"
      style={{ '--card-color': game.color } as React.CSSProperties}
      onClick={onStart}
      disabled={disabled}
      type="button"
    >
      <span className="game-card-icon" aria-hidden>{game.icon}</span>
      <span className="game-card-title">{game.title}</span>
      <span className="game-card-subtitle">第 {Math.min(level, 10)} 关 · {game.tag}</span>
      <span className="game-card-stars">{'⭐'.repeat(stars)}</span>
      <span className="game-card-start">{disabled ? '休息' : '开始'}</span>
    </button>
  );
}
