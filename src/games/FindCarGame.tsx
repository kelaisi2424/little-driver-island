import type { LevelGameProps } from '../types';
import { playSound } from '../utils/sound';
import CarSvg from '../components/CarSvg';
import { getGameDefinition } from '../data/games';

const cars = [
  { id: 'red', label: '红色车', color: '#ff5252', text: '1' },
  { id: 'blue', label: '蓝色车', color: '#4a90e2', text: '3' },
  { id: '2', label: '2 号车', color: '#ffd166', text: '2' },
  { id: 'bus', label: '校车', color: '#ffd166', text: '校' },
  { id: 'school-bus', label: '目标车', color: '#5cd684', text: '园' },
];

export default function FindCarGame({ level, onComplete }: LevelGameProps) {
  const game = getGameDefinition('find-car');
  const target = String(level.config?.target ?? 'red');

  const choose = (id: string) => {
    if (id === target) {
      playSound('success');
      onComplete({
        gameId: 'find-car',
        level: level.level,
        stars: 3,
        stickerId: level.level >= 5 ? game.stickerId : undefined,
        learningGoal: level.learningGoal,
        summary: level.summary,
      });
    } else {
      playSound('fail');
    }
  };

  return (
    <div className="level-game find-mini">
      <div className="mini-top">第 {level.level} 关 <span>{level.goal}</span></div>
      <div className="find-grid">
        {cars.map((car) => (
          <button key={car.id} onClick={() => choose(car.id)} type="button">
            <CarSvg color={car.color} size={102} />
            <strong>{car.text}</strong>
          </button>
        ))}
      </div>
      <div className="mini-hint small">点一下目标车。</div>
    </div>
  );
}
