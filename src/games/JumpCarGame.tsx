import { useState } from 'react';
import type { LevelGameProps } from '../types';
import { playSound } from '../utils/sound';
import CarSvg from '../components/CarSvg';
import { getGameDefinition } from '../data/games';

export default function JumpCarGame({ level, onComplete }: LevelGameProps) {
  const [pos, setPos] = useState(0);
  const [jumping, setJumping] = useState(false);
  const [hint, setHint] = useState(level.goal);
  const game = getGameDefinition('jump-car');
  const target = String(level.config?.target ?? 'next');
  const platforms = target === 'red'
    ? ['蓝', '红', '绿']
    : target === 'blue'
      ? ['红', '黄', '蓝']
      : ['1', '2', '3'];

  const jump = () => {
    if (jumping) return;
    playSound('click');
    setJumping(true);
    setTimeout(() => {
      const next = Math.min(2, pos + 1);
      setPos(next);
      setJumping(false);
      const label = platforms[next];
      const ok = target === 'next' || label === target || (target === 'red' && label === '红') || (target === 'blue' && label === '蓝');
      if (ok && next >= 1) {
        playSound('success');
        onComplete({
          gameId: 'jump-car',
          level: level.level,
          stars: 3,
          stickerId: level.level >= 5 ? game.stickerId : undefined,
          learningGoal: level.learningGoal,
          summary: level.summary,
        });
      } else if (next >= 2) {
        playSound('fail');
        setHint('再试一次，找对的平台。');
        setPos(0);
      }
    }, 360);
  };

  return (
    <div className="level-game jump-mini" onClick={jump}>
      <div className="mini-top">第 {level.level} 关 <span>点击跳</span></div>
      <div className="jump-stage">
        {platforms.map((label, index) => (
          <div className={`jump-platform p${index}`} key={label}>{label}</div>
        ))}
        <div className={`jump-car ${jumping ? 'jumping' : ''} pos${pos}`}>
          <CarSvg color="#ff8c69" size={102} />
        </div>
      </div>
      <div className="mini-hint small">{hint}</div>
    </div>
  );
}
