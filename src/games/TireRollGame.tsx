import { useEffect, useState } from 'react';
import type { LevelGameProps } from '../types';
import { useGameLoop } from '../hooks/useGameLoop';
import { playSound } from '../utils/sound';
import { getGameDefinition } from '../data/games';

export default function TireRollGame({ level, onComplete }: LevelGameProps) {
  const [x, setX] = useState(12);
  const [jump, setJump] = useState(false);
  const [hint, setHint] = useState(level.goal);
  const [done, setDone] = useState(false);
  const game = getGameDefinition('tire-roll');

  useGameLoop((delta) => {
    setX((value) => Math.min(92, value + delta * 0.018));
  }, !done);

  useEffect(() => {
    if (x > 48 && x < 58 && !jump && level.level >= 2) {
      playSound('fail');
      setHint('小坑要跳过去。');
      setX(32);
    }
    if (x >= 90 && !done) {
      setDone(true);
      playSound('complete');
      onComplete({
        gameId: 'tire-roll',
        level: level.level,
        stars: 3,
        stickerId: level.level >= 5 ? game.stickerId : undefined,
        learningGoal: level.learningGoal,
        summary: level.summary,
      });
    }
  }, [done, game.stickerId, jump, level, onComplete, x]);

  const doJump = () => {
    playSound('click');
    setJump(true);
    setTimeout(() => setJump(false), 460);
  };

  return (
    <div className="level-game tire-mini" onClick={doJump}>
      <div className="mini-top">第 {level.level} 关 <span>点击跳</span></div>
      <div className="tire-track">
        {level.level >= 2 && <div className="tire-pit">💧</div>}
        <div className="tire-garage">🏠</div>
        <div className={`rolling-tire ${jump ? 'jump' : ''}`} style={{ left: `${x}%` }}>🛞</div>
      </div>
      <div className="mini-hint small">{hint}</div>
    </div>
  );
}
