import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { playSound } from '../utils/sound';
import CarSvg from '../components/CarSvg';

type PartId = 'wheel' | 'light' | 'steer' | 'wiper';

const PARTS: Array<{ id: PartId; label: string; emoji: string; x: number; y: number }> = [
  { id: 'wheel', label: '轮胎', emoji: '⚙️', x: 25, y: 70 },
  { id: 'light', label: '车灯', emoji: '💡', x: 76, y: 54 },
  { id: 'steer', label: '方向盘', emoji: '⭕', x: 50, y: 45 },
  { id: 'wiper', label: '雨刷', emoji: '〰️', x: 45, y: 31 },
];

export default function RepairGarageGame({ onComplete }: MiniGameProps) {
  const [placed, setPlaced] = useState<PartId[]>([]);
  const [dragging, setDragging] = useState<PartId | null>(null);
  const [hint, setHint] = useState('把零件拖到车上。');

  const drop = (part: PartId, x: number, y: number) => {
    const target = PARTS.find((p) => p.id === part);
    if (!target) return;
    const ok = Math.abs(target.x - x) < 18 && Math.abs(target.y - y) < 18;
    if (ok) {
      playSound('success');
      setPlaced((old) => old.includes(part) ? old : [...old, part]);
      setHint('装好啦！');
      if (placed.length + 1 >= PARTS.length) {
        setTimeout(() => onComplete({ gameId: 'repair-garage', stars: 4, stickerId: 'wrench' }), 700);
      }
    } else {
      playSound('fail');
      setHint('这个好像不是这里哦。');
    }
    setDragging(null);
  };

  return (
    <div className="mini-game repair-mini">
      <div className="mini-top">修车小工厂 <span>{'⭐'.repeat(placed.length)}</span></div>
      <div
        className="repair-stage"
        onPointerUp={(e) => {
          if (!dragging) return;
          const rect = e.currentTarget.getBoundingClientRect();
          drop(dragging, ((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100);
        }}
      >
        <CarSvg color="#ffb06b" size={210} />
        {PARTS.map((part) => (
          <div
            key={part.id}
            className={`part-target ${placed.includes(part.id) ? 'filled' : ''}`}
            style={{ left: `${part.x}%`, top: `${part.y}%` }}
          >
            {placed.includes(part.id) ? part.emoji : '+'}
          </div>
        ))}
      </div>
      <div className="parts-row">
        {PARTS.map((part) => (
          <button
            key={part.id}
            className={placed.includes(part.id) ? 'used' : ''}
            onPointerDown={() => {
              if (placed.includes(part.id)) return;
              playSound('click');
              setDragging(part.id);
            }}
            type="button"
          >
            <span>{part.emoji}</span>
            {part.label}
          </button>
        ))}
      </div>
      <div className="mini-hint small">{dragging ? '拖到车上放开。' : hint}</div>
    </div>
  );
}
