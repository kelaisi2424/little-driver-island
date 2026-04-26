import { useMemo, useState } from 'react';
import type { MiniGameProps } from '../types';
import { pickRandom } from '../utils/random';
import { playSound } from '../utils/sound';

type Light = 'red' | 'yellow' | 'green';

const ANSWER: Record<Light, string> = {
  red: 'stop',
  yellow: 'wait',
  green: 'go',
};

export default function TrafficLightGame({ onComplete }: MiniGameProps) {
  const [round, setRound] = useState(1);
  const [stars, setStars] = useState(0);
  const [hint, setHint] = useState('看灯，选动作。');
  const [light, setLight] = useState<Light>(() => pickRandom(['red', 'yellow', 'green'] as const));
  const choices = useMemo(() => [
    { value: 'stop', label: '停下来', emoji: '🛑' },
    { value: 'wait', label: '等一等', emoji: '⏸️' },
    { value: 'go', label: '往前开', emoji: '🚗' },
  ], []);

  const choose = (value: string) => {
    if (value === ANSWER[light]) {
      const nextStars = stars + 1;
      playSound('success');
      setStars(nextStars);
      setHint('做得好！');
      if (round >= 5) {
        setTimeout(() => onComplete({ gameId: 'traffic-light', stars: nextStars, stickerId: 'traffic-light' }), 550);
      } else {
        setRound((n) => n + 1);
        setTimeout(() => {
          setLight(pickRandom(['red', 'yellow', 'green'] as const));
          setHint('看灯，选动作。');
        }, 420);
      }
    } else {
      playSound('fail');
      setHint(light === 'red' ? '再想想，红灯要停下来哦。' : '再看看是什么灯。');
    }
  };

  return (
    <div className="mini-game traffic-mini">
      <div className="mini-top">第 {round} / 5 次 <span>{'⭐'.repeat(stars)}</span></div>
      <div className="big-traffic">
        <span className={light === 'red' ? 'on red' : ''} />
        <span className={light === 'yellow' ? 'on yellow' : ''} />
        <span className={light === 'green' ? 'on green' : ''} />
      </div>
      <div className="mini-hint">{hint}</div>
      <div className="traffic-buttons">
        {choices.map((choice) => (
          <button key={choice.value} onClick={() => choose(choice.value)} type="button">
            <span>{choice.emoji}</span>
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
