import { useRef } from 'react';
import type { ParentConfig } from '../../types';
import CarSvg from '../CarSvg';

interface GameHomeProps {
  config: ParentConfig;
  todayCount: number;
  limitReached: boolean;
  onStart: () => void;
  onParent: () => void;
  onStickers: () => void;
}

export default function GameHome({
  config,
  todayCount,
  limitReached,
  onStart,
  onParent,
  onStickers,
}: GameHomeProps) {
  const parentTimerRef = useRef<number | null>(null);

  const startParentPress = () => {
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

  return (
    <div className="drive-home">
      <header className="drive-home-top">
        <h1>小小司机安全闯关</h1>
        <p>今天 {todayCount} / {config.dailyLimit} 局</p>
      </header>

      <div className="drive-cover-road" aria-hidden>
        <span className="cover-sun">☀️</span>
        <span className="cover-cloud one" />
        <span className="cover-cloud two" />
        <span className="cover-light">🚦</span>
        <span className="cover-sign">🅿️</span>
        <div className="cover-car">
          <CarSvg color="#ff8c69" size={190} />
        </div>
      </div>

      {limitReached ? (
        <div className="home-limit-message">
          今天开车任务完成啦，明天再来吧。
        </div>
      ) : (
        <button className="drive-start-btn" onClick={onStart} type="button">
          🚗 开始开车
        </button>
      )}

      <footer className="drive-home-links">
        <button onClick={onStickers} type="button">贴纸册</button>
        <button
          onPointerDown={startParentPress}
          onPointerUp={clearParentPress}
          onPointerCancel={clearParentPress}
          onPointerLeave={clearParentPress}
          onClick={(e) => e.preventDefault()}
          type="button"
        >
          家长设置 长按
        </button>
      </footer>
    </div>
  );
}
