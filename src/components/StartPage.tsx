import { useRef, useState } from 'react';
import type { GameMode, TaskType } from '../types';
import { primeVoice, speak } from '../utils/speech';
import HomeMap from './HomeMap';
import TodayRoute from './TodayRoute';

interface StartPageProps {
  route: TaskType[];
  onStart: (mode: GameMode) => void;
  onParent: () => void;
  onStickers: () => void;
  limitReached: boolean;
  todayCount: number;
  dailyLimit: number;
}

const CAR_MESSAGES = [
  '准备出发啦！',
  '小司机坐好了吗？',
  '安全带系好，我们出发！',
  '今天去哪里玩呢？',
];

export default function StartPage({
  route,
  onStart,
  onParent,
  onStickers,
  limitReached,
  todayCount,
  dailyLimit,
}: StartPageProps) {
  const [driving, setDriving] = useState(false);
  const [carJumping, setCarJumping] = useState(false);
  const [carMessage, setCarMessage] = useState<string | null>(null);
  const parentTimerRef = useRef<number | null>(null);

  const clearParentTimer = () => {
    if (parentTimerRef.current) {
      window.clearTimeout(parentTimerRef.current);
      parentTimerRef.current = null;
    }
  };

  const beginParentPress = () => {
    clearParentTimer();
    parentTimerRef.current = window.setTimeout(() => {
      parentTimerRef.current = null;
      onParent();
    }, 900);
  };

  const handleCarClick = () => {
    if (driving) return;
    const next = CAR_MESSAGES[Math.floor(Math.random() * CAR_MESSAGES.length)];
    setCarMessage(next);
    setCarJumping(true);
    speak(next);
    window.setTimeout(() => setCarJumping(false), 520);
    window.setTimeout(() => setCarMessage(null), 1800);
  };

  const handleDestinationClick = (label: string) => {
    if (driving) return;
    const next =
      label === '家'
        ? '从家出发，去完成今天路线。'
        : `${label}在这里，开车过去看看吧！`;
    setCarMessage(next);
    speak(next);
    window.setTimeout(() => setCarMessage(null), 1900);
  };

  const handleStart = (mode: GameMode) => {
    if (limitReached || driving) return;
    primeVoice();
    setCarMessage(mode === 'learning' ? '我会慢慢告诉你。' : '开车出发！');
    setDriving(true);
    window.setTimeout(() => {
      onStart(mode);
    }, 1050);
  };

  return (
    <div className="start-page map-start-page">
      <header className="map-header">
        <h1 className="start-title">小小司机任务岛</h1>
        <p className="start-subtitle">今天开车去哪里呢？</p>
      </header>

      <HomeMap
        route={route}
        driving={driving}
        carJumping={carJumping}
        carMessage={carMessage}
        onCarClick={handleCarClick}
        onDestinationClick={handleDestinationClick}
        onStartClick={() => handleStart('game')}
        startDisabled={limitReached || driving}
      />

      <TodayRoute tasks={route} />

      {limitReached ? (
        <div className="limit-card home-limit">
          <span className="moon" aria-hidden>🌙</span>
          <p className="limit-text">今天已经完成任务啦，明天再来吧。</p>
          <p className="limit-sub">今天已玩 {todayCount} 局</p>
        </div>
      ) : (
        <div className="home-actions">
          <button
            className="learn-soft-btn"
            onClick={() => handleStart('learning')}
            disabled={driving}
            type="button"
          >
            📖 慢慢学一遍
          </button>
        </div>
      )}

      <footer className="start-links home-links">
        <button className="link-btn" onClick={onStickers} type="button">
          🎨 我的贴纸册
        </button>
        <span className="link-divider" aria-hidden>·</span>
        <button
          className="link-btn parent-hold-btn"
          onPointerDown={beginParentPress}
          onPointerUp={clearParentTimer}
          onPointerCancel={clearParentTimer}
          onPointerLeave={clearParentTimer}
          onClick={(e) => e.preventDefault()}
          type="button"
          aria-label="长按进入家长设置"
        >
          家长设置
        </button>
        <span className="start-meta">
          今天 {todayCount}/{dailyLimit} 局
        </span>
      </footer>
    </div>
  );
}
