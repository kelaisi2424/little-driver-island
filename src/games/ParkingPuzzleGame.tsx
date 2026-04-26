import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { playSound } from '../utils/sound';
import CarSvg from '../components/CarSvg';

export default function ParkingPuzzleGame({ onComplete }: MiniGameProps) {
  const [pos, setPos] = useState({ x: 0, y: 2 });
  const [hint, setHint] = useState('把小车挪进 P 车位。');
  const [done, setDone] = useState(false);
  const target = { x: 2, y: 0 };
  const blocks = new Set(['1,1', '2,2']);

  const move = (dx: number, dy: number) => {
    if (done) return;
    const next = {
      x: Math.max(0, Math.min(2, pos.x + dx)),
      y: Math.max(0, Math.min(2, pos.y + dy)),
    };
    if (blocks.has(`${next.x},${next.y}`)) {
      playSound('fail');
      setHint('这里有路锥，换个方向。');
      return;
    }
    playSound('click');
    setPos(next);
    if (next.x === target.x && next.y === target.y) {
      setDone(true);
      setHint('停车成功！');
      playSound('complete');
      setTimeout(() => onComplete({ gameId: 'parking-puzzle', stars: 3, stickerId: 'parking-p' }), 700);
    }
  };

  return (
    <div className="mini-game parking-mini">
      <div className="mini-top">停车挪一挪 <span>⭐</span></div>
      <div className="parking-board">
        {[0, 1, 2].map((y) => (
          <div className="parking-row" key={y}>
            {[0, 1, 2].map((x) => {
              const key = `${x},${y}`;
              return (
                <div className={`parking-tile ${target.x === x && target.y === y ? 'target' : ''}`} key={key}>
                  {blocks.has(key) && <span>🚧</span>}
                  {target.x === x && target.y === y && <strong>P</strong>}
                  {pos.x === x && pos.y === y && <CarSvg color="#ff8c69" size={90} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="move-pad">
        <button onClick={() => move(0, -1)}>⬆️</button>
        <button onClick={() => move(-1, 0)}>⬅️</button>
        <button onClick={() => move(1, 0)}>➡️</button>
        <button onClick={() => move(0, 1)}>⬇️</button>
      </div>
      <div className="mini-hint small">{hint}</div>
    </div>
  );
}
