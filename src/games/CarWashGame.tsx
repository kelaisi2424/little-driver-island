import { useMemo, useState } from 'react';
import type { MiniGameProps } from '../types';
import { pickRandom, shuffle } from '../utils/random';
import { playSound } from '../utils/sound';
import CarSvg from '../components/CarSvg';

const COLORS = [
  { name: '红色', color: '#ff5252', hint: '红色像苹果一样，再找找。' },
  { name: '蓝色', color: '#4a90e2', hint: '蓝色像天空一样，再找找。' },
  { name: '黄色', color: '#ffd166', hint: '黄色像香蕉一样，再找找。' },
  { name: '绿色', color: '#5cd684', hint: '绿色像树叶一样，再找找。' },
];

export default function CarWashGame({ onComplete }: MiniGameProps) {
  const [round, setRound] = useState(1);
  const [stars, setStars] = useState(0);
  const [target, setTarget] = useState(() => pickRandom(COLORS));
  const [hint, setHint] = useState('找到要洗的小车。');
  const [bubble, setBubble] = useState(false);
  const order = useMemo(() => shuffle(COLORS), [target]);

  const choose = (name: string) => {
    if (name === target.name) {
      const nextStars = stars + 1;
      playSound('success');
      setStars(nextStars);
      setBubble(true);
      setHint('泡泡洗干净啦！');
      setTimeout(() => setBubble(false), 450);
      if (round >= 5) {
        setTimeout(() => onComplete({ gameId: 'car-wash', stars: nextStars, stickerId: 'bubble-car' }), 650);
      } else {
        setRound((n) => n + 1);
        setTimeout(() => {
          setTarget(pickRandom(COLORS));
          setHint('找到要洗的小车。');
        }, 520);
      }
    } else {
      playSound('fail');
      setHint(target.hint);
    }
  };

  return (
    <div className="mini-game wash-mini">
      <div className="mini-top">第 {round} / 5 次 <span>{'⭐'.repeat(stars)}</span></div>
      <div className="mini-hint">请帮{target.name}小车洗车</div>
      <div className="wash-grid">
        {order.map((item) => (
          <button key={item.name} onClick={() => choose(item.name)} type="button">
            <CarSvg color={item.color} size={112} />
          </button>
        ))}
      </div>
      {bubble && <div className="bubble-layer">🫧 🫧 🫧</div>}
      <div className="mini-hint small">{hint}</div>
    </div>
  );
}
