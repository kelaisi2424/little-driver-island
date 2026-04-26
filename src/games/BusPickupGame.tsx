import { useState } from 'react';
import type { LevelGameProps } from '../types';
import { playSound } from '../utils/sound';
import { getGameDefinition } from '../data/games';

export default function BusPickupGame({ level, onComplete }: LevelGameProps) {
  const target = Number(level.config?.count ?? level.level);
  const [selected, setSelected] = useState(0);
  const [hint, setHint] = useState(`接 ${target} 个小朋友。`);
  const game = getGameDefinition('bus-pickup');

  const go = () => {
    if (selected === target) {
      playSound('complete');
      onComplete({
        gameId: 'bus-pickup',
        level: level.level,
        stars: 3,
        stickerId: level.level >= 5 ? game.stickerId : undefined,
        learningGoal: level.learningGoal,
        summary: level.summary,
      });
    } else {
      playSound('fail');
      setHint(selected < target ? `还要再接 ${target - selected} 个。` : `多啦，只接 ${target} 个。`);
    }
  };

  return (
    <div className="level-game bus-mini">
      <div className="mini-top">第 {level.level} 关 <span>接 {target} 个</span></div>
      <div className="bus-road">
        <div className="bus-body">🚌</div>
        <div className="school-stop">🏫</div>
      </div>
      <div className="kid-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            className={n <= selected ? 'on-bus' : ''}
            key={n}
            onClick={() => {
              playSound('click');
              setSelected((value) => Math.min(5, value + 1));
            }}
            type="button"
          >
            🧒
          </button>
        ))}
      </div>
      <button className="mini-primary" onClick={go} type="button">开到幼儿园</button>
      <div className="mini-hint small">{hint}</div>
    </div>
  );
}
