import { useRef } from 'react';
import type { GameId, ParentConfig } from '../types';
import { GAME_DEFINITIONS } from '../data/games';
import GameCard from './GameCard';

interface HomePageProps {
  config: ParentConfig;
  usedSeconds: number;
  completedLevels: number;
  limitReached: boolean;
  getCurrentLevel: (gameId: GameId) => number;
  getStars: (gameId: GameId, level: number) => number;
  onContinue: () => void;
  onOpenGame: (gameId: GameId) => void;
  onParent: () => void;
  onStickers: () => void;
}

export default function HomePage({
  config,
  usedSeconds,
  completedLevels,
  limitReached,
  getCurrentLevel,
  getStars,
  onContinue,
  onOpenGame,
  onParent,
  onStickers,
}: HomePageProps) {
  const parentTimerRef = useRef<number | null>(null);
  const minutes = Math.floor(usedSeconds / 60);
  const continueGame = GAME_DEFINITIONS[0];

  const beginParent = () => {
    if (parentTimerRef.current) window.clearTimeout(parentTimerRef.current);
    parentTimerRef.current = window.setTimeout(onParent, 900);
  };

  const clearParent = () => {
    if (!parentTimerRef.current) return;
    window.clearTimeout(parentTimerRef.current);
    parentTimerRef.current = null;
  };

  return (
    <div className="home-page">
      <header className="king-header">
        <h1>小小汽车闯关王</h1>
        <p>今日已玩：{minutes} / {config.dailyMinutes} 分钟</p>
        <p>今日完成：{completedLevels} 关</p>
      </header>

      <button
        className="continue-level-btn"
        onClick={onContinue}
        disabled={limitReached}
        type="button"
      >
        <span>🚗</span>
        继续闯关：第 {getCurrentLevel(continueGame.id)} 关
      </button>

      {limitReached && (
        <div className="game-box-limit">今天时间到啦，明天再来闯关吧。</div>
      )}

      <main className="game-card-grid king-grid">
        {GAME_DEFINITIONS.map((game) => {
          const level = getCurrentLevel(game.id);
          return (
            <GameCard
              key={game.id}
              game={game}
              disabled={limitReached}
              level={level}
              stars={getStars(game.id, Math.max(1, level - 1))}
              onStart={() => onOpenGame(game.id)}
            />
          );
        })}
      </main>

      <footer className="game-box-footer">
        <button onClick={onStickers} type="button">贴纸册</button>
        <button
          onPointerDown={beginParent}
          onPointerUp={clearParent}
          onPointerCancel={clearParent}
          onPointerLeave={clearParent}
          onClick={(e) => e.preventDefault()}
          type="button"
        >
          家长设置 长按
        </button>
      </footer>
    </div>
  );
}
