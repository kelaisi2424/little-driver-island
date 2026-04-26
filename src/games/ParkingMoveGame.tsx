import { useState } from 'react';
import type { LevelGameProps } from '../types';
import { playSound } from '../utils/sound';
import CarSvg from '../components/CarSvg';
import { getGameDefinition } from '../data/games';

interface CarState {
  id: string;
  color: string;
  x: number;
  y: number;
  dir: 'h' | 'v';
  target?: boolean;
}

function initialCars(level: number): CarState[] {
  const cars: CarState[] = [
    { id: 'red', color: '#ff5252', x: 0, y: 1, dir: 'h', target: true },
  ];
  if (level >= 2) cars.push({ id: 'blue', color: '#4a90e2', x: 2, y: 1, dir: 'v' });
  if (level >= 3) cars.push({ id: 'yellow', color: '#ffd166', x: 1, y: 0, dir: 'v' });
  if (level >= 4) cars.push({ id: 'green', color: '#5cd684', x: 1, y: 2, dir: 'h' });
  if (level >= 5) cars.push({ id: 'pink', color: '#ff9eb6', x: 0, y: 0, dir: 'h' });
  return cars;
}

export default function ParkingMoveGame({ level, onComplete }: LevelGameProps) {
  const [cars, setCars] = useState(() => initialCars(level.level));
  const [selected, setSelected] = useState('red');
  const [hint, setHint] = useState(level.goal);
  const game = getGameDefinition('parking-move');

  const move = (delta: -1 | 1) => {
    const car = cars.find((c) => c.id === selected);
    if (!car) return;
    const next = {
      ...car,
      x: car.dir === 'h' ? car.x + delta : car.x,
      y: car.dir === 'v' ? car.y + delta : car.y,
    };
    if (next.x < 0 || next.x > 2 || next.y < 0 || next.y > 2) {
      if (car.target && car.x === 2 && delta === 1) {
        playSound('complete');
        onComplete({
          gameId: 'parking-move',
          level: level.level,
          stars: 3,
          stickerId: level.level >= 5 ? game.stickerId : undefined,
          learningGoal: level.learningGoal,
          summary: level.summary,
        });
      } else {
        playSound('fail');
        setHint('先挪开挡路的小车。');
      }
      return;
    }
    const blocked = cars.some((c) => c.id !== car.id && c.x === next.x && c.y === next.y);
    if (blocked) {
      playSound('fail');
      setHint('这里被挡住啦，换一辆车挪。');
      return;
    }
    playSound('click');
    setCars((old) => old.map((c) => c.id === car.id ? next : c));
    setHint(car.target ? '红车往出口开。' : '挪得好！');
  };

  return (
    <div className="level-game parking-move-game">
      <div className="mini-top">第 {level.level} 关 <span>{level.goal}</span></div>
      <div className="parking-exit">出口 ➜</div>
      <div className="move-lot">
        {[0, 1, 2].map((y) => (
          <div className="move-row" key={y}>
            {[0, 1, 2].map((x) => {
              const car = cars.find((c) => c.x === x && c.y === y);
              return (
                <button
                  className={`move-cell ${car?.id === selected ? 'selected' : ''}`}
                  key={`${x}-${y}`}
                  onClick={() => car && setSelected(car.id)}
                  type="button"
                >
                  {car && <CarSvg color={car.color} size={86} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="move-controls">
        <button onClick={() => move(-1)} type="button">← / ↑</button>
        <button onClick={() => move(1)} type="button">→ / ↓</button>
      </div>
      <div className="mini-hint small">{hint}</div>
    </div>
  );
}
