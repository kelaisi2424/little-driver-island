import { useEffect, useMemo, useRef, useState } from 'react';
import type { ParentConfig, TaskType } from '../../types';
import { useCarDrag } from '../../hooks/useCarDrag';
import { playSound, getMuted, setMuted } from '../../utils/sound';
import { speak } from '../../utils/speech';
import GameMap from './GameMap';
import TaskModal from './TaskModal';
import SoundToggle from './SoundToggle';
import type { HotspotDef } from './TaskHotspot';

interface GameWorldProps {
  route: TaskType[];
  config: ParentConfig;
  todayCount: number;
  limitReached: boolean;
  onRoundComplete: (stars: number) => void;
  onParent: () => void;
  onStickers: () => void;
}

const CAR_SIZE = { width: 146, height: 100 };

const HOTSPOTS: HotspotDef[] = [
  { type: 'traffic-light', label: '红绿灯', emoji: '🚦', x: 73, y: 19, className: 'hotspot-light' },
  { type: 'parking', label: '停车场', emoji: '🅿️', x: 18, y: 35, className: 'hotspot-parking' },
  { type: 'color-repair', label: '洗车店', emoji: '🫧', x: 76, y: 52, className: 'hotspot-wash' },
  { type: 'seatbelt', label: '幼儿园', emoji: '🏫', x: 29, y: 68, className: 'hotspot-school' },
  { type: 'crosswalk', label: '斑马线', emoji: '🚸', x: 57, y: 76, className: 'hotspot-crosswalk' },
];

const CAR_TIPS = [
  '嘟嘟，小车准备好啦！',
  '拖我去任务点吧。',
  '小司机，慢慢开哦。',
  '看到发光的地方了吗？',
];

export default function GameWorld({
  route,
  config,
  todayCount,
  limitReached,
  onRoundComplete,
  onParent,
  onStickers,
}: GameWorldProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const parentTimerRef = useRef<number | null>(null);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [completed, setCompleted] = useState<TaskType[]>([]);
  const [nearType, setNearType] = useState<TaskType | null>(null);
  const [impactType, setImpactType] = useState<TaskType | null>(null);
  const [showStars, setShowStars] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [bubble, setBubble] = useState('拖动车车，去发光的地方。');
  const [muted, setMutedState] = useState(() => getMuted());
  const collisionLockRef = useRef(false);
  const wasDraggingRef = useRef(false);

  const car = useCarDrag(mapRef, {
    carWidth: CAR_SIZE.width,
    carHeight: CAR_SIZE.height,
    initial: { x: 92, y: 282 },
  });

  const activeTypes = useMemo(() => new Set(route), [route]);
  const completedTypes = useMemo(() => new Set(completed), [completed]);
  const availableHotspots = useMemo(
    () => HOTSPOTS.filter((h) => activeTypes.has(h.type)),
    [activeTypes],
  );

  const triggerHotspot = (hotspot: HotspotDef) => {
    if (limitReached || activeTask || completedTypes.has(hotspot.type)) return;
    if (!activeTypes.has(hotspot.type)) {
      setBubble('这站今天不用去哦。');
      return;
    }
    playSound('horn');
    setImpactType(hotspot.type);
    setCelebrating(true);
    setBubble(`${hotspot.label}到了！`);
    window.setTimeout(() => setActiveTask(hotspot.type), 260);
    window.setTimeout(() => {
      setImpactType(null);
      setCelebrating(false);
    }, 560);
  };

  useEffect(() => {
    if (car.dragging && !wasDraggingRef.current) {
      playSound('engine');
      setBubble('');
    }
    wasDraggingRef.current = car.dragging;
  }, [car.dragging]);

  useEffect(() => {
    if (activeTask || limitReached) return;
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const carCenter = {
      x: car.position.x + CAR_SIZE.width / 2,
      y: car.position.y + CAR_SIZE.height / 2,
    };
    let nearest: { type: TaskType; dist: number; hotspot: HotspotDef } | null = null;
    for (const hotspot of availableHotspots) {
      if (completedTypes.has(hotspot.type)) continue;
      const hx = rect.width * hotspot.x / 100;
      const hy = rect.height * hotspot.y / 100;
      const dist = Math.hypot(carCenter.x - hx, carCenter.y - hy);
      if (!nearest || dist < nearest.dist) {
        nearest = { type: hotspot.type, dist, hotspot };
      }
    }
    setNearType(nearest && nearest.dist < 112 ? nearest.type : null);
    if (nearest && nearest.dist < 72 && !collisionLockRef.current) {
      collisionLockRef.current = true;
      triggerHotspot(nearest.hotspot);
      window.setTimeout(() => {
        collisionLockRef.current = false;
      }, 1100);
    }
  }, [activeTask, availableHotspots, car.position, completedTypes, limitReached]);

  useEffect(() => {
    if (!bubble) return;
    const timer = window.setTimeout(() => setBubble(''), 2200);
    return () => window.clearTimeout(timer);
  }, [bubble]);

  const completeTask = () => {
    if (!activeTask) return;
    const nextCompleted = [...completed, activeTask];
    setCompleted(nextCompleted);
    setActiveTask(null);
    setShowStars(true);
    setCelebrating(true);
    playSound(nextCompleted.length >= route.length ? 'complete' : 'star');
    setBubble(`完成 ${nextCompleted.length} 个小任务啦！`);
    window.setTimeout(() => setShowStars(false), 850);
    window.setTimeout(() => setCelebrating(false), 650);
    if (nextCompleted.length >= route.length) {
      window.setTimeout(() => onRoundComplete(nextCompleted.length), 950);
    }
  };

  const handleCarTap = () => {
    if (activeTask) return;
    const tip = CAR_TIPS[Math.floor(Math.random() * CAR_TIPS.length)];
    setBubble(tip);
    playSound('horn');
    speak(tip);
    car.jump();
  };

  const beginParentPress = () => {
    if (parentTimerRef.current) window.clearTimeout(parentTimerRef.current);
    parentTimerRef.current = window.setTimeout(() => {
      parentTimerRef.current = null;
      onParent();
    }, 900);
  };

  const clearParentPress = () => {
    if (!parentTimerRef.current) return;
    window.clearTimeout(parentTimerRef.current);
    parentTimerRef.current = null;
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playSound('click');
  };

  return (
    <div className="game-world">
      <header className="game-hud">
        <div>
          <h1>小小司机汽车城</h1>
          <p>第 {Math.min(completed.length + 1, route.length)} 站 / 共 {route.length} 站</p>
        </div>
        <div className="hud-right">
          <span>今天 {todayCount} / {config.dailyLimit} 局</span>
          <SoundToggle muted={muted} onToggle={toggleSound} />
        </div>
      </header>

      <div className="game-stage">
        {bubble && <div className="game-bubble">{bubble}</div>}
        <GameMap
          mapRef={mapRef}
          hotspots={HOTSPOTS}
          activeTypes={activeTypes}
          completedTypes={completedTypes}
          nearType={nearType}
          impactType={impactType}
          carPosition={car.position}
          dragging={car.dragging}
          celebrating={celebrating}
          showStars={showStars}
          onHotspotClick={triggerHotspot}
          carHandlers={{
            onPointerDown: car.onPointerDown,
            onPointerMove: car.onPointerMove,
            onPointerUp: car.onPointerUp,
            onPointerCancel: car.onPointerCancel,
            onTap: handleCarTap,
          }}
        />
      </div>

      <footer className="game-footer">
        <button
          className={`game-small-btn ${learningMode ? 'active' : ''}`}
          onClick={() => setLearningMode((v) => !v)}
          type="button"
        >
          📖 慢慢学
        </button>
        <button className="game-small-btn" onClick={onStickers} type="button">
          🎨 贴纸册
        </button>
        <button
          className="game-small-btn"
          onPointerDown={beginParentPress}
          onPointerUp={clearParentPress}
          onPointerCancel={clearParentPress}
          onPointerLeave={clearParentPress}
          onClick={(e) => e.preventDefault()}
          type="button"
        >
          家长设置 长按
        </button>
      </footer>

      {limitReached && (
        <div className="limit-overlay">
          <div className="limit-card">
            <span className="moon" aria-hidden>🌙</span>
            <p className="limit-text">今天已经完成任务啦，明天再来吧。</p>
            <p className="limit-sub">眼睛休息一下，去喝口水。</p>
          </div>
        </div>
      )}

      {activeTask && (
        <TaskModal
          task={activeTask}
          learningMode={learningMode}
          onComplete={completeTask}
        />
      )}

      <div className="remaining-pill" aria-live="polite">
        ⭐ {completed.length}/{route.length}
      </div>
    </div>
  );
}
