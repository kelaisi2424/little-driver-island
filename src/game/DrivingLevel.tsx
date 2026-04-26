// 主闯关游戏组件 —— 竖屏从后方看车，道路从上往下滚（产生前进感）。
// 玩家拖动屏幕左右移动小车，触发不同关卡机制。

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlayLevel, PlayCompletePayload } from '../types';
import { playSound } from '../utils/sound';
import { speak } from '../utils/speech';
import PlayerCar from './PlayerCar';

interface DrivingLevelProps {
  level: PlayLevel;
  onComplete: (payload: PlayCompletePayload) => void;
  onExit: () => void;
}

interface SceneEvent {
  id: string;
  type: 'cone' | 'lane-sign' | 'red-light' | 'pedestrian' | 'kid' | 'parking-zone' | 'gate' | 'school';
  hitAtMs: number;            // 期望出现在玩家位置的时间（ms 自关卡开始）
  lane: 0 | 1 | 2 | 'all';    // 占用车道
  data?: { number?: number; targetLane?: 0 | 1 | 2 };
  state: 'pending' | 'active' | 'done' | 'collected' | 'hit';
}

// ---------- 配置 ----------
const SCROLL_PX_PER_SEC = 240;          // 道路滚动速度
const PLAYER_BOTTOM_OFFSET = 110;       // 玩家车距离底部
const COLLISION_TOLERANCE_X = 30;       // X 方向碰撞容差
const COLLISION_TOLERANCE_Y = 50;       // Y 方向碰撞容差

// 根据关卡生成事件序列
function generateEvents(level: PlayLevel): SceneEvent[] {
  const ev: SceneEvent[] = [];
  let id = 0;
  const newId = () => `e${id++}`;

  switch (level.kind) {
    case 'drive':
      // 没有事件，仅自由开
      break;

    case 'dodge': {
      // 每 2.6 秒一个路锥，避免连续相同车道
      let lastLane: number | null = null;
      for (let t = 3500; t < level.duration * 1000 - 1500; t += 2600) {
        let lane: 0 | 1 | 2;
        do {
          lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        } while (lane === lastLane);
        lastLane = lane;
        ev.push({ id: newId(), type: 'cone', hitAtMs: t, lane, state: 'pending' });
      }
      break;
    }

    case 'lane': {
      // 在 t=6s 出现车道指示牌（指示 targetNumber），t=12s 再来一个
      const tl = level.targetLane ?? 0;
      const num = level.targetNumber ?? 1;
      ev.push({
        id: newId(),
        type: 'lane-sign',
        hitAtMs: 6000,
        lane: tl,
        data: { number: num, targetLane: tl },
        state: 'pending',
      });
      ev.push({
        id: newId(),
        type: 'lane-sign',
        hitAtMs: 11000,
        lane: tl,
        data: { number: num, targetLane: tl },
        state: 'pending',
      });
      break;
    }

    case 'wait-light': {
      // 红灯在 t=7s 出现（横跨马路），等 4s 后变绿。期间道路冻结
      ev.push({ id: newId(), type: 'red-light', hitAtMs: 7000, lane: 'all', state: 'pending' });
      break;
    }

    case 'park': {
      // 终点 P 车位（3 个，目标随机）
      const targetLane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
      ev.push({
        id: newId(),
        type: 'parking-zone',
        hitAtMs: level.duration * 1000 - 1000,
        lane: 'all',
        data: { targetLane },
        state: 'pending',
      });
      break;
    }

    case 'pedestrian': {
      ev.push({ id: newId(), type: 'pedestrian', hitAtMs: 7000, lane: 'all', state: 'pending' });
      break;
    }

    case 'pickup': {
      const count = level.pickupCount ?? 2;
      // 在不同位置布置小朋友
      const lanes: Array<0 | 1 | 2> = [0, 2, 1];
      for (let i = 0; i < count; i++) {
        ev.push({
          id: newId(),
          type: 'kid',
          hitAtMs: 5000 + i * 6000,
          lane: lanes[i % lanes.length],
          state: 'pending',
        });
      }
      break;
    }

    case 'arrive': {
      // 综合关：cone, light, pedestrian, school 终点
      ev.push({ id: newId(), type: 'cone', hitAtMs: 4500, lane: 0, state: 'pending' });
      ev.push({ id: newId(), type: 'cone', hitAtMs: 8500, lane: 2, state: 'pending' });
      ev.push({ id: newId(), type: 'red-light', hitAtMs: 13500, lane: 'all', state: 'pending' });
      ev.push({ id: newId(), type: 'pedestrian', hitAtMs: 21500, lane: 'all', state: 'pending' });
      ev.push({
        id: newId(),
        type: 'school',
        hitAtMs: level.duration * 1000 - 800,
        lane: 'all',
        state: 'pending',
      });
      break;
    }
  }

  // 终点门：除了 park / arrive 外都加一个 gate
  if (level.kind !== 'park' && level.kind !== 'arrive') {
    ev.push({
      id: newId(),
      type: 'gate',
      hitAtMs: level.duration * 1000 - 600,
      lane: 'all',
      state: 'pending',
    });
  }

  return ev;
}

export default function DrivingLevel({ level, onComplete, onExit }: DrivingLevelProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ w: 360, h: 600 });

  // 玩家车 X (相对 stage 0..1)
  const [carXNorm, setCarXNorm] = useState(0.5);
  const carXRef = useRef(0.5);

  // 时钟
  const startMsRef = useRef(0);
  const elapsedRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const frozenAccumRef = useRef(0);
  const frozenSinceRef = useRef<number | null>(null);

  // 事件
  const eventsRef = useRef<SceneEvent[]>(generateEvents(level));
  const [, forceRender] = useState(0);
  const tickRender = () => forceRender((v) => (v + 1) % 1000000);

  // 关卡状态
  const [intro, setIntro] = useState(true);
  const [doneTrigger, setDoneTrigger] = useState(false);
  const completedRef = useRef(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [stars, setStars] = useState(3);
  const [hits, setHits] = useState(0);
  const [collected, setCollected] = useState(0);

  // ---------- 度量 stage ----------
  useEffect(() => {
    const update = () => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setStageSize({ w: r.width, h: r.height });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ---------- 关卡介绍语音 ----------
  useEffect(() => {
    speak(`${level.title}。${level.intro}`);
    const t = window.setTimeout(() => setIntro(false), 1700);
    return () => window.clearTimeout(t);
  }, [level]);

  // ---------- 拖拽 ----------
  const draggingRef = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    if (intro || completedRef.current) return;
    draggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    updateCarFromPointer(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateCarFromPointer(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const updateCarFromPointer = (clientX: number) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (clientX - r.left) / r.width;
    const clamped = Math.max(0.1, Math.min(0.9, x));
    carXRef.current = clamped;
    setCarXNorm(clamped);
  };

  // ---------- toast 提示 ----------
  const showToast = (text: string) => {
    setToast(text);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1700);
  };

  // ---------- 主循环 ----------
  useEffect(() => {
    let raf = 0;
    let lastFrame = performance.now();

    const loop = (now: number) => {
      raf = window.requestAnimationFrame(loop);
      if (intro || completedRef.current) {
        lastFrame = now;
        return;
      }
      if (startMsRef.current === 0) startMsRef.current = now;

      // 计算"游戏时间"（扣除冻结期）
      const wallElapsed = now - startMsRef.current;
      const gameElapsed = wallElapsed - frozenAccumRef.current
        - (frozenSinceRef.current !== null ? now - frozenSinceRef.current : 0);
      elapsedRef.current = gameElapsed;
      setElapsed(gameElapsed);
      lastFrame = now;

      const events = eventsRef.current;
      let needRender = false;

      // 处理事件
      for (const ev of events) {
        if (ev.state === 'done' || ev.state === 'hit' || ev.state === 'collected') continue;

        // 计算 Y 位置（hitAtMs 时刻 Y 应该在玩家位置）
        const playerY = stageSize.h - PLAYER_BOTTOM_OFFSET;
        const dt = gameElapsed - ev.hitAtMs;
        const y = playerY + (dt / 1000) * SCROLL_PX_PER_SEC;

        // 是否进入可见区
        if (y > -120 && ev.state === 'pending') {
          ev.state = 'active';
          needRender = true;

          // 红灯/行人触发"冻结"（道路停止滚动 = 时间暂停 3s）
          if (ev.type === 'red-light') {
            frozenSinceRef.current = now;
            speak('红灯了，先停下来等等。');
            window.setTimeout(() => {
              if (frozenSinceRef.current !== null) {
                frozenAccumRef.current += now - frozenSinceRef.current + 3000;
                frozenSinceRef.current = null;
              } else {
                frozenAccumRef.current += 3000;
              }
              showToast('绿灯啦，可以走了');
              speak('绿灯，可以往前开了。');
              tickRender();
            }, 3200);
            tickRender();
            continue;
          }

          if (ev.type === 'pedestrian') {
            frozenSinceRef.current = now;
            speak('有小朋友过马路，等一等。');
            window.setTimeout(() => {
              if (frozenSinceRef.current !== null) {
                frozenAccumRef.current += now - frozenSinceRef.current + 2800;
                frozenSinceRef.current = null;
              } else {
                frozenAccumRef.current += 2800;
              }
              showToast('过完啦，可以走了');
              tickRender();
            }, 3000);
            tickRender();
            continue;
          }
        }

        // 事件离开屏幕：判定结果
        if (y > stageSize.h + 60 && ev.state === 'active') {
          ev.state = 'done';

          // 车道指示牌：判定玩家是否在目标车道
          if (ev.type === 'lane-sign' && ev.data?.targetLane != null) {
            const playerLane = laneOfX(carXRef.current);
            if (playerLane !== ev.data.targetLane) {
              setStars((s) => Math.max(1, s - 1));
              showToast(`要走 ${ev.data?.number} 号车道哦`);
              speak(`要走 ${ev.data?.number} 号车道。`);
              playSound('fail');
            } else {
              showToast('对啦，就在这条车道');
              playSound('star');
            }
          }
          // 停车区：判定玩家是否在目标车位
          if (ev.type === 'parking-zone' && ev.data?.targetLane != null) {
            const playerLane = laneOfX(carXRef.current);
            if (playerLane === ev.data.targetLane) {
              showToast('停得真稳！');
              playSound('star');
            } else {
              setStars((s) => Math.max(1, s - 1));
              showToast('要停到 P 车位里哦');
            }
            triggerComplete();
            continue;
          }
          if (ev.type === 'gate' || ev.type === 'school') {
            triggerComplete();
            continue;
          }
          if (ev.type === 'kid') {
            // 没接到的小朋友
            showToast('小朋友没接到，下次靠近一点');
          }
          needRender = true;
          continue;
        }

        // 玩家碰撞判定（只在事件靠近玩家时检查）
        if (ev.state === 'active') {
          const playerY = stageSize.h - PLAYER_BOTTOM_OFFSET;
          if (Math.abs(y - playerY) < COLLISION_TOLERANCE_Y) {
            const eventX = ev.lane === 'all'
              ? null
              : laneCenterX(ev.lane as 0 | 1 | 2, stageSize.w);
            const playerX = carXRef.current * stageSize.w;
            const overlapsX = eventX === null
              ? true
              : Math.abs(eventX - playerX) < COLLISION_TOLERANCE_X * 1.6;

            if (ev.type === 'cone' && overlapsX) {
              ev.state = 'hit';
              setHits((h) => h + 1);
              setStars((s) => Math.max(1, s - 1));
              setHitFlash(true);
              window.setTimeout(() => setHitFlash(false), 320);
              showToast('小心，路锥');
              playSound('fail');
              needRender = true;
            }
            if (ev.type === 'kid' && overlapsX) {
              ev.state = 'collected';
              setCollected((c) => c + 1);
              showToast('接到一个！');
              speak('接到啦。');
              playSound('star');
              needRender = true;
            }
          }
        }
      }

      // 时长到则结算（drive/dodge/lane/wait-light/pedestrian/pickup）
      if (gameElapsed > level.duration * 1000) {
        triggerComplete();
      }

      if (needRender) tickRender();
    };

    raf = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(raf);
      lastFrame; // unused-var 安抚
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro, level, stageSize.h, stageSize.w]);

  const triggerComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setDoneTrigger(true);
    playSound('complete');
    const elapsedSec = Math.max(5, Math.round(elapsedRef.current / 1000));

    // 计算最终星数
    let finalStars = stars;
    if (level.kind === 'pickup') {
      const need = level.pickupCount ?? 1;
      finalStars = Math.max(1, Math.min(3, Math.round((collected / need) * 3)));
    }

    window.setTimeout(() => {
      onComplete({
        levelId: level.id,
        stars: finalStars,
        elapsedSeconds: elapsedSec,
      });
    }, 700);
  };

  // ---------- 渲染辅助 ----------
  const laneCenterX = (lane: 0 | 1 | 2, width: number) => {
    const usable = width * 0.78;          // 道路占 stage 的 78%
    const left = (width - usable) / 2;
    return left + (lane + 0.5) * (usable / 3);
  };
  const laneOfX = (xNorm: number): 0 | 1 | 2 => {
    if (xNorm < 0.4) return 0;
    if (xNorm < 0.6) return 1;
    return 2;
  };
  const eventY = (ev: SceneEvent): number => {
    const playerY = stageSize.h - PLAYER_BOTTOM_OFFSET;
    const dt = elapsedRef.current - ev.hitAtMs;
    return playerY + (dt / 1000) * SCROLL_PX_PER_SEC;
  };

  const carPxX = carXNorm * stageSize.w;

  // 道路滚动动画的 background-position
  const roadOffset = (elapsedRef.current / 1000) * SCROLL_PX_PER_SEC;
  const isFrozen = frozenSinceRef.current !== null;

  // ---------- 渲染 ----------
  return (
    <div className="dl-shell">
      <header className="dl-hud">
        <button className="dl-exit" onClick={onExit} aria-label="退出">✕</button>
        <div className="dl-hud-mid">
          <div className="dl-level-title">第 {level.id} 关 · {level.title}</div>
          <div className="dl-progress">
            <span
              className="dl-progress-fill"
              style={{
                width: `${Math.min(100, (elapsed / (level.duration * 1000)) * 100)}%`,
              }}
            />
          </div>
        </div>
        <div className="dl-stars" aria-label={`星星 ${stars}`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < stars ? 'on' : 'off'}>⭐</span>
          ))}
        </div>
      </header>

      <div
        ref={stageRef}
        className={`dl-stage ${hitFlash ? 'shake' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* 路边草地（左右两侧），用 SVG 画树 */}
        <div className="dl-grass left" />
        <div className="dl-grass right" />

        {/* 道路 */}
        <div
          className={`dl-road ${isFrozen ? 'frozen' : ''}`}
          style={{
            backgroundPositionY: `${roadOffset}px`,
          }}
        >
          {/* 车道分隔虚线（左右两条） */}
          <div
            className="dl-lane-line lane-left"
            style={{ backgroundPositionY: `${roadOffset}px` }}
          />
          <div
            className="dl-lane-line lane-right"
            style={{ backgroundPositionY: `${roadOffset}px` }}
          />
        </div>

        {/* 路边树（用 emoji 简化） */}
        <Trees roadOffset={roadOffset} stageH={stageSize.h} />

        {/* 事件物体 */}
        {eventsRef.current.map((ev) => {
          if (ev.state === 'pending' || ev.state === 'done' || ev.state === 'hit' || ev.state === 'collected') {
            // 已完成的隐藏，等待中的还没到
            if (ev.state === 'pending') return null;
            if (ev.state === 'hit' || ev.state === 'collected') return null;
            if (ev.state === 'done' && ev.type !== 'parking-zone' && ev.type !== 'gate' && ev.type !== 'school') return null;
          }
          const y = eventY(ev);
          if (y < -120 || y > stageSize.h + 80) return null;
          const x = ev.lane === 'all' ? stageSize.w / 2 : laneCenterX(ev.lane as 0 | 1 | 2, stageSize.w);

          return (
            <div
              key={ev.id}
              className={`dl-obj dl-${ev.type}`}
              style={{
                transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`,
              }}
            >
              <RenderEvent ev={ev} stageWidth={stageSize.w} />
            </div>
          );
        })}

        {/* 玩家车 */}
        <div
          className="dl-player"
          style={{
            transform: `translate3d(${carPxX}px, ${stageSize.h - PLAYER_BOTTOM_OFFSET}px, 0) translate(-50%, -50%)`,
          }}
        >
          <PlayerCar shake={hitFlash} />
        </div>

        {/* 关卡介绍 */}
        {intro && (
          <div className="dl-intro">
            <div className="dl-intro-card">
              <div className="dl-intro-num">第 {level.id} 关</div>
              <div className="dl-intro-title">{level.title}</div>
              <div className="dl-intro-text">{level.intro}</div>
            </div>
          </div>
        )}

        {/* 飘字提示 */}
        {toast && <div className="dl-toast">{toast}</div>}

        {/* 完成遮罩 */}
        {doneTrigger && (
          <div className="dl-finish-flash">
            <span>🎉</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 路边树（简化）：基于滚动偏移生成几行树，往下移动
function Trees({ roadOffset, stageH }: { roadOffset: number; stageH: number }) {
  const trees: Array<{ key: string; left: string; top: number; emoji: string }> = [];
  const interval = 180;
  const offsetMod = roadOffset % interval;
  for (let i = -1; i < Math.ceil(stageH / interval) + 1; i++) {
    const top = i * interval + offsetMod;
    trees.push({ key: `l${i}`, left: '4px', top, emoji: '🌳' });
    trees.push({ key: `r${i}`, left: 'calc(100% - 36px)', top: top + 80, emoji: '🌲' });
  }
  return (
    <>
      {trees.map((t) => (
        <span
          key={t.key}
          className="dl-tree"
          style={{ left: t.left, top: t.top }}
          aria-hidden
        >
          {t.emoji}
        </span>
      ))}
    </>
  );
}

// 各种事件物体的视觉
function RenderEvent({ ev, stageWidth }: { ev: SceneEvent; stageWidth: number }) {
  switch (ev.type) {
    case 'cone':
      return (
        <svg viewBox="0 0 60 70" width="60" height="70">
          <ellipse cx="30" cy="64" rx="22" ry="4" fill="rgba(0,0,0,0.2)" />
          <path d="M 18 60 L 42 60 L 36 18 L 24 18 Z" fill="#ff7b3a" />
          <rect x="18" y="58" width="24" height="6" rx="2" fill="#3a3a3a" />
          <rect x="22" y="38" width="16" height="4" fill="#fff" />
          <rect x="24" y="28" width="12" height="3" fill="#fff" />
        </svg>
      );
    case 'lane-sign':
      return (
        <div className="dl-lane-sign">
          <div className="dl-lane-num">{ev.data?.number ?? 1}</div>
          <div className="dl-lane-arrow">⬇️</div>
        </div>
      );
    case 'red-light':
      return (
        <div className="dl-traffic-bar" style={{ width: stageWidth * 0.85 }}>
          <div className="dl-traffic-bulbs">
            <span className="bulb red" />
            <span className="bulb yellow off" />
            <span className="bulb green off" />
          </div>
          <div className="dl-stop-line" />
        </div>
      );
    case 'pedestrian':
      return (
        <div className="dl-pedestrian-row" style={{ width: stageWidth * 0.85 }}>
          <div className="dl-zebra" />
          <div className="dl-walker" aria-hidden>🚶‍♀️</div>
        </div>
      );
    case 'kid':
      return (
        <div className="dl-kid">
          <div className="dl-kid-emoji" aria-hidden>🧒</div>
          <div className="dl-kid-wave">↑</div>
        </div>
      );
    case 'parking-zone':
      return (
        <div className="dl-parking" style={{ width: stageWidth * 0.85 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`dl-park-slot ${ev.data?.targetLane === i ? 'target' : ''}`}
            >
              P
            </div>
          ))}
        </div>
      );
    case 'gate':
      return (
        <div className="dl-gate" style={{ width: stageWidth * 0.85 }}>
          <span>🏁</span>
          <span>终点</span>
          <span>🏁</span>
        </div>
      );
    case 'school':
      return (
        <div className="dl-school" style={{ width: stageWidth * 0.85 }}>
          <span aria-hidden>🏫</span>
          <span>幼儿园到啦</span>
        </div>
      );
    default:
      return null;
  }
}
