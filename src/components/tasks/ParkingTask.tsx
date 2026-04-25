import { useEffect, useRef, useState } from 'react';
import type { TaskComponentProps } from '../../types';
import { randomInt } from '../../utils/random';
import { randomSuccess } from '../../utils/messages';
import { playSound } from '../../utils/sound';
import { speak } from '../../utils/speech';
import CarSvg from '../CarSvg';
import Encouragement from '../Encouragement';
import LearningIntro from '../LearningIntro';
import Toast from '../Toast';

interface Offset {
  x: number;
  y: number;
}

type Phase = 'intro' | 'play' | 'success';

const SPOT_NUMBERS = [1, 2, 3, 4, 5];

const LEARNING_INTRO =
  '我们要把小车停到正确的车位。每个车位上都有一个数字。一起数一数：1、2、3、4、5。';

export default function ParkingTask({ onComplete, mode }: TaskComponentProps) {
  const [target] = useState(() => randomInt(1, 5));
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>(
    mode === 'learning' ? 'intro' : 'play',
  );

  const carRef = useRef<HTMLDivElement>(null);
  const spotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const hintTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'play') {
      speak(`请把小车开到数字 ${target} 的车位`);
    }
  }, [phase, target]);

  const showHint = (text: string) => {
    setHint(text);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => setHint(null), 2400);
  };

  // 计算把车停到指定车位中心需要的偏移量
  const offsetToSpot = (n: number): Offset | null => {
    const spot = spotRefs.current[n - 1];
    const car = carRef.current;
    if (!spot || !car) return null;
    const sr = spot.getBoundingClientRect();
    const cr = car.getBoundingClientRect();
    const dx = sr.left + sr.width / 2 - (cr.left + cr.width / 2);
    const dy = sr.top + sr.height / 2 - (cr.top + cr.height / 2);
    return { x: offset.x + dx, y: offset.y + dy };
  };

  const tryDropAt = (n: number) => {
    if (phase !== 'play') return;
    if (n === target) {
      playSound('success');
      const o = offsetToSpot(n);
      if (o) setOffset(o);
      window.setTimeout(() => setPhase('success'), 450);
    } else {
      playSound('fail');
      const h = `这是数字 ${n}，我们要找数字 ${target} 哦`;
      showHint(h);
      speak(h);
      setOffset({ x: 0, y: 0 });
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== 'play') return;
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    const x = e.clientX;
    const y = e.clientY;
    for (let i = 0; i < spotRefs.current.length; i++) {
      const s = spotRefs.current[i];
      if (!s) continue;
      const r = s.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        tryDropAt(i + 1);
        return;
      }
    }
    setOffset({ x: 0, y: 0 });
  };

  const onPointerCancel = () => {
    if (!dragging) return;
    setDragging(false);
    setOffset({ x: 0, y: 0 });
  };

  const handleSpotTap = (n: number) => {
    if (dragging) return;
    tryDropAt(n);
  };

  return (
    <div className="task parking-task">
      <div className="task-prompt">
        请把小车开到数字{' '}
        <span className="target-color" style={{ background: '#ff8c69' }}>
          {target}
        </span>{' '}
        的车位
      </div>

      <div className="parking-area">
        {!dragging && offset.x === 0 && offset.y === 0 && phase === 'play' && (
          <div className="parking-hint-arrow" aria-hidden>⬇️</div>
        )}
        <div
          ref={carRef}
          className={`parking-car ${dragging ? 'dragging' : ''}`}
          style={{
            transform: `translateX(-50%) translate(${offset.x}px, ${offset.y}px)`,
            transition: dragging
              ? 'none'
              : 'transform 0.45s cubic-bezier(0.34, 1.4, 0.64, 1)',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <CarSvg color="#ff8c69" size={110} />
        </div>
      </div>

      <div className="parking-lot">
        {SPOT_NUMBERS.map((n, i) => (
          <div
            key={n}
            ref={(el) => { spotRefs.current[i] = el; }}
            className={`parking-spot ${n === target ? 'target' : ''}`}
            onClick={() => handleSpotTap(n)}
          >
            {n}
          </div>
        ))}
      </div>

      {phase === 'intro' && (
        <LearningIntro
          emoji="🅿️"
          text={LEARNING_INTRO}
          onContinue={() => setPhase('play')}
        />
      )}

      {hint && <Toast message={hint} />}

      {phase === 'success' && (
        <Encouragement
          message={randomSuccess()}
          detail={
            mode === 'learning'
              ? `数字 ${target} 找到啦！停得真稳。`
              : undefined
          }
          onContinue={onComplete}
        />
      )}
    </div>
  );
}
