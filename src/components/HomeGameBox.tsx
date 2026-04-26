import { useRef, useState } from 'react';
import type { GameId, ParentConfig } from '../types';
import { GAME_DEFINITIONS } from '../data/games';
import GameCard from './GameCard';

interface HomeGameBoxProps {
  config: ParentConfig;
  todayCount: number;
  limitReached: boolean;
  onStartGame: (gameId: GameId) => void;
  onParent: () => void;
  onStickers: () => void;
}

export default function HomeGameBox({
  config,
  todayCount,
  limitReached,
  onStartGame,
  onParent,
  onStickers,
}: HomeGameBoxProps) {
  const parentTimerRef = useRef<number | null>(null);
  const [notice, setNotice] = useState('');

  const startParentPress = () => {
    if (parentTimerRef.current) window.clearTimeout(parentTimerRef.current);
    parentTimerRef.current = window.setTimeout(() => {
      parentTimerRef.current = null;
      onParent();
    }, 900);
  };

  const clearParentPress = () => {
    if (!parentTimerRef.current) return;
    window.clearTimeout(parentTimerRef.current);
    parentTimerRef.current = null;
  };

  const tryStart = (gameId: GameId) => {
    if (limitReached) {
      setNotice('今天已经玩完啦，明天再来吧。');
      window.setTimeout(() => setNotice(''), 1800);
      return;
    }
    onStartGame(gameId);
  };

  return (
    <div className="game-box-home">
      <header className="game-box-header">
        <h1>小小汽车游戏盒</h1>
        <p>今天想玩哪辆车？</p>
      </header>

      {notice && <div className="game-box-notice">{notice}</div>}

      <main className="game-card-grid">
        {GAME_DEFINITIONS.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            disabled={limitReached}
            onStart={() => tryStart(game.id)}
          />
        ))}
      </main>

      <footer className="game-box-footer">
        <button onClick={onStickers} type="button">我的贴纸册</button>
        <button
          onPointerDown={startParentPress}
          onPointerUp={clearParentPress}
          onPointerCancel={clearParentPress}
          onPointerLeave={clearParentPress}
          onClick={(e) => e.preventDefault()}
          type="button"
        >
          家长设置 长按
        </button>
        <span>今日 {todayCount} / {config.dailyLimit} 局</span>
      </footer>

      {limitReached && (
        <div className="game-box-limit">
          今天已经玩完啦，明天再来吧。
        </div>
      )}
    </div>
  );
}
