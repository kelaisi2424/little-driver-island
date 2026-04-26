import type { GameDefinition } from '../types';

interface GameCardProps {
  game: GameDefinition;
  disabled: boolean;
  onStart: () => void;
}

export default function GameCard({ game, disabled, onStart }: GameCardProps) {
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
      <span className="game-card-subtitle">{game.subtitle}</span>
      <span className="game-card-start">{disabled ? '休息' : '开始'}</span>
    </button>
  );
}
