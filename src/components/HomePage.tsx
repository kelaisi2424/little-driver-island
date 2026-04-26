// 首页 v4：用 CartoonCar + GameButton 重做。

import { useEffect, useRef } from 'react';
import { primeVoice, speak } from '../utils/speech';
import CartoonCar from './ui/CartoonCar';
import Clouds from './ui/Clouds';
import GameButton from './ui/GameButton';

interface HomePageProps {
  nextLevelId: number;
  totalLevels: number;
  usedSeconds: number;
  limitMinutes: number;
  completedLevels: number;
  limitReached: boolean;
  onStart: () => void;
  onLevels: () => void;
  onStickers: () => void;
  onMinigames: () => void;
  onParent: () => void;
}

function fmtMin(seconds: number) {
  return Math.floor(seconds / 60);
}

export default function HomePage({
  nextLevelId,
  totalLevels,
  usedSeconds,
  limitMinutes,
  completedLevels,
  limitReached,
  onStart,
  onLevels,
  onStickers,
  onMinigames,
  onParent,
}: HomePageProps) {
  const parentTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (limitReached) {
      speak('今天已经玩够啦，明天再来吧。');
    }
  }, [limitReached]);

  const beginParentPress = () => {
    if (parentTimerRef.current) window.clearTimeout(parentTimerRef.current);
    parentTimerRef.current = window.setTimeout(() => {
      parentTimerRef.current = null;
      onParent();
    }, 850);
  };
  const cancelParentPress = () => {
    if (parentTimerRef.current) window.clearTimeout(parentTimerRef.current);
    parentTimerRef.current = null;
  };

  const handleStart = () => {
    if (limitReached) return;
    primeVoice();
    onStart();
  };

  return (
    <main className="home-page">
      <header className="home-topbar">
        <div className="home-title">
          <span className="home-icon" aria-hidden>🚗</span>
          <span>小小汽车闯关王</span>
        </div>
        <div className="home-stats">
          <div className="stat-pill">
            <span aria-hidden>⏱️</span>
            <span>{fmtMin(usedSeconds)}/{limitMinutes} 分钟</span>
          </div>
          <div className="stat-pill">
            <span aria-hidden>🏁</span>
            <span>{completedLevels} 关</span>
          </div>
        </div>
      </header>

      <section className="home-stage" aria-hidden>
        <span className="home-sun">☀️</span>
        <Clouds variant="sky" />

        <div className="home-mountain m1" />
        <div className="home-mountain m2" />

        {/* 幼儿园小房子（左侧装饰） */}
        <div className="home-kindergarten">
          <div className="roof" />
          <div className="body" />
        </div>

        {/* P 牌（左下） */}
        <div className="home-park-sign">P</div>

        <div className="home-deco-light">
          <div className="hd-pole" />
          <div className="hd-box">
            <span className="hd-bulb red" />
            <span className="hd-bulb yellow" />
            <span className="hd-bulb green" />
          </div>
        </div>
        <div className="home-deco-tree tree-l">🌳</div>
        <div className="home-deco-tree tree-r">🌲</div>
        <div className="home-deco-cone cone-l">
          <svg viewBox="0 0 40 50" width="32" height="40">
            <path d="M 12 44 L 28 44 L 24 12 L 16 12 Z" fill="#ff7b3a" stroke="#3a1010" strokeWidth="1.5" />
            <rect x="12" y="42" width="16" height="4" rx="1" fill="#3a3a3a" />
            <rect x="14" y="26" width="12" height="3" fill="#fff" />
          </svg>
        </div>
        <div className="home-deco-cone cone-r">
          <svg viewBox="0 0 40 50" width="32" height="40">
            <path d="M 12 44 L 28 44 L 24 12 L 16 12 Z" fill="#ff7b3a" stroke="#3a1010" strokeWidth="1.5" />
            <rect x="12" y="42" width="16" height="4" rx="1" fill="#3a3a3a" />
            <rect x="14" y="26" width="12" height="3" fill="#fff" />
          </svg>
        </div>

        <div className="home-runway" />

        {/* 主车 */}
        <CartoonCar className="hero" />

        <div className="home-start-flag">
          <span>START</span>
        </div>
      </section>

      <section className="home-actions">
        {limitReached ? (
          <div className="home-limit-card">
            <span className="moon" aria-hidden>🌙</span>
            <div>
              <strong>今天已经玩够啦</strong>
              <p>明天再来开车吧</p>
            </div>
          </div>
        ) : (
          <GameButton
            variant="primary"
            size="lg"
            emoji="🚗"
            pulse
            badge={`第 ${Math.min(nextLevelId, totalLevels)} 关`}
            onClick={handleStart}
          >
            开始闯关
          </GameButton>
        )}

        <div className="home-mini-btns">
          <GameButton variant="blue" size="sm" emoji="🗺️" onClick={onLevels}>
            选关
          </GameButton>
          <GameButton variant="yellow" size="sm" emoji="🎨" onClick={onStickers}>
            贴纸册
          </GameButton>
          <GameButton variant="green" size="sm" emoji="🎮" onClick={onMinigames}>
            小游戏
          </GameButton>
          <GameButton
            variant="ghost"
            size="sm"
            emoji="👨‍👩‍👧"
            onPointerDown={beginParentPress}
            onPointerUp={cancelParentPress}
            onPointerCancel={cancelParentPress}
            onPointerLeave={cancelParentPress}
          >
            家长长按
          </GameButton>
        </div>
      </section>
    </main>
  );
}
