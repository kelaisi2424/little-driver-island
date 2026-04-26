import { useEffect, useMemo, useState } from 'react';
import type { MiniGameProps } from '../types';
import { useDragCar } from '../hooks/useDragCar';
import { useGameLoop } from '../hooks/useGameLoop';
import { pickRandom } from '../utils/random';
import { playSound } from '../utils/sound';
import Road from '../components/game/Road';
import PlayerCar from '../components/game/PlayerCar';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  kind: string;
  star?: boolean;
}

const OBSTACLES = ['🚧', '💧', '🪨'];

export default function ObstacleDriveGame({ onComplete }: MiniGameProps) {
  const drag = useDragCar({ minX: 30, maxX: 70, initialX: 50 });
  const [carX, setCarX] = useState(50);
  const [roadOffset, setRoadOffset] = useState(0);
  const [items, setItems] = useState<Obstacle[]>(() => [
    { id: 1, x: 35, y: -20, kind: pickRandom(OBSTACLES) },
  ]);
  const [passed, setPassed] = useState(0);
  const [stars, setStars] = useState(0);
  const [bump, setBump] = useState(false);
  const [hint, setHint] = useState('左右拖动车，躲开障碍。');

  const done = passed >= 5;
  const running = !done;

  useGameLoop((delta) => {
    setRoadOffset((v) => (v + delta * 0.24) % 96);
    setCarX((v) => v + (drag.targetX - v) * 0.25);
    setItems((old) => old.map((item) => ({ ...item, y: item.y + delta * 0.035 })));
  }, running);

  useEffect(() => {
    if (done) {
      playSound('complete');
      setTimeout(() => onComplete({ gameId: 'obstacle-drive', stars: Math.max(1, stars), stickerId: 'safe-car' }), 650);
    }
  }, [done, onComplete, stars]);

  useEffect(() => {
    const item = items[0];
    if (!item) return;
    if (item.y > 68 && item.y < 83 && Math.abs(item.x - carX) < 11) {
      playSound('fail');
      setBump(true);
      setHint('慢一点，注意安全。');
      setTimeout(() => setBump(false), 420);
      spawnNext();
    }
    if (item.y > 102) {
      playSound('success');
      setPassed((n) => n + 1);
      if (item.star) setStars((n) => n + 1);
      setHint('稳稳通过！');
      spawnNext();
    }
  }, [carX, items]);

  const spawnNext = () => {
    setItems((old) => [
      {
        id: old[0]?.id ? old[0].id + 1 : 1,
        x: pickRandom([34, 50, 66]),
        y: -18,
        kind: pickRandom(OBSTACLES),
        star: Math.random() > 0.45,
      },
    ]);
  };

  const current = useMemo(() => items[0], [items]);

  return (
    <div className="mini-runner">
      <div className="mini-top">躲过 {passed} / 5 <span>{'⭐'.repeat(stars)}</span></div>
      <div className="mini-hint">{hint}</div>
      <Road
        roadOffset={roadOffset}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerCancel={drag.onPointerCancel}
      >
        {current && (
          <div className="obstacle-item" style={{ left: `${current.x}%`, top: `${current.y}%` }}>
            <span>{current.star ? '⭐' : current.kind}</span>
          </div>
        )}
        <PlayerCar x={carX} dragging={drag.dragging || running} bumping={bump} />
      </Road>
    </div>
  );
}
