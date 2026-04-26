import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { randomInt } from '../utils/random';
import { playSound } from '../utils/sound';

export default function BusPickupGame({ onComplete }: MiniGameProps) {
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(() => randomInt(1, 5));
  const [selected, setSelected] = useState(0);
  const [stars, setStars] = useState(0);
  const [hint, setHint] = useState('点小朋友上车。');

  const next = () => {
    if (selected === target) {
      const nextStars = stars + 1;
      playSound('success');
      setStars(nextStars);
      setHint('人数正好，出发去幼儿园！');
      if (round >= 3) {
        setTimeout(() => onComplete({ gameId: 'bus-pickup', stars: nextStars, stickerId: 'little-bus' }), 650);
      } else {
        setTimeout(() => {
          setRound((n) => n + 1);
          setTarget(randomInt(1, 5));
          setSelected(0);
          setHint('点小朋友上车。');
        }, 600);
      }
    } else {
      playSound('fail');
      setHint(selected < target ? `还要再接 ${target - selected} 个。` : `多啦，我们只接 ${target} 个。`);
    }
  };

  return (
    <div className="mini-game bus-mini">
      <div className="mini-top">第 {round} / 3 轮 <span>{'⭐'.repeat(stars)}</span></div>
      <div className="mini-hint">接 {target} 个小朋友去幼儿园</div>
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
      <button className="mini-primary" onClick={next} type="button">出发</button>
      <div className="mini-hint small">{hint}</div>
    </div>
  );
}
