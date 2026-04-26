import type React from 'react';
import type { CarDefinition, DrivingLevel } from '../types';

interface GarageHomeProps {
  car: CarDefinition;
  nextLevel: DrivingLevel;
  usedSeconds: number;
  limitSeconds: number;
  completedLevels: number;
  limitReached: boolean;
  onStart: () => void;
  onLevels: () => void;
  onCars: () => void;
  onStickers: () => void;
  onParent: () => void;
}

function formatMinutes(seconds: number) {
  return Math.floor(seconds / 60);
}

export default function GarageHome({
  car,
  nextLevel,
  usedSeconds,
  limitSeconds,
  completedLevels,
  limitReached,
  onStart,
  onLevels,
  onCars,
  onStickers,
  onParent,
}: GarageHomeProps) {
  const longPressParent = {
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      const target = event.currentTarget;
      const timer = window.setTimeout(onParent, 850);
      const clear = () => window.clearTimeout(timer);
      target.addEventListener('pointerup', clear, { once: true });
      target.addEventListener('pointerleave', clear, { once: true });
      target.addEventListener('pointercancel', clear, { once: true });
    },
  };

  return (
    <main className="garage-screen">
      <header className="garage-top">
        <div>
          <h1>小小汽车驾驶大师</h1>
          <p>今日已玩：{formatMinutes(usedSeconds)} / {formatMinutes(limitSeconds)} 分钟</p>
        </div>
        <div className="garage-badge">完成 {completedLevels} 关</div>
      </header>

      <section className="garage-stage" aria-label="车库">
        <div className="garage-sun">☀️</div>
        <div className="garage-cloud cloud-a" />
        <div className="garage-cloud cloud-b" />
        <div className="garage-building">
          <span>车库</span>
        </div>
        <div className="garage-road">
          <div className="garage-finish">START</div>
        </div>
        <div className="show-car" style={{ '--car': car.bodyColor, '--roof': car.roofColor } as React.CSSProperties}>
          <span className="car-light" />
          <span className="car-roof" />
          <span className="wheel left" />
          <span className="wheel right" />
        </div>
      </section>

      <section className="garage-actions">
        <button
          className="master-start-btn"
          onClick={onStart}
          disabled={limitReached}
          type="button"
        >
          {limitReached ? '今天的小司机任务完成啦' : `开始游戏：第 ${nextLevel.id} 关`}
        </button>
        <div className="garage-grid-actions">
          <button onClick={onLevels} type="button">选择关卡</button>
          <button onClick={onCars} type="button">我的车库</button>
          <button onClick={onStickers} type="button">贴纸册</button>
          <button {...longPressParent} type="button">家长设置 长按</button>
        </div>
      </section>
    </main>
  );
}
