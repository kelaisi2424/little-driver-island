// 首页：主视觉 + 闯关主入口 + 4 个小入口。设计目标——5 岁小朋友一眼想点"开始闯关"。

import { useEffect, useRef } from 'react';
import { primeVoice, speak } from '../utils/speech';
import MainHeroCar from './MainHeroCar';

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
      {/* 顶部状态条 */}
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

      {/* 主视觉舞台 */}
      <section className="home-stage" aria-hidden>
        <span className="home-sun">☀️</span>
        <span className="home-cloud cloud-1" />
        <span className="home-cloud cloud-2" />
        <span className="home-cloud cloud-3" />

        <div className="home-mountain m1" />
        <div className="home-mountain m2" />

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
            <path d="M 12 44 L 28 44 L 24 12 L 16 12 Z" fill="#ff7b3a" />
            <rect x="12" y="42" width="16" height="4" rx="1" fill="#3a3a3a" />
            <rect x="14" y="26" width="12" height="3" fill="#fff" />
          </svg>
        </div>
        <div className="home-deco-cone cone-r">
          <svg viewBox="0 0 40 50" width="32" height="40">
            <path d="M 12 44 L 28 44 L 24 12 L 16 12 Z" fill="#ff7b3a" />
            <rect x="12" y="42" width="16" height="4" rx="1" fill="#3a3a3a" />
            <rect x="14" y="26" width="12" height="3" fill="#fff" />
          </svg>
        </div>

        <div className="home-grass" />

        <div className="home-runway">
          <div className="home-runway-stripe" />
        </div>

        <MainHeroCar />

        <div className="home-start-flag">
          <span>START</span>
        </div>
      </section>

      {/* 主按钮 + 4 个小按钮 */}
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
          <button className="home-main-btn" onClick={handleStart} type="button">
            <span className="btn-emoji" aria-hidden>🚀</span>
            <span className="btn-main">开始闯关</span>
            <span className="btn-sub">第 {Math.min(nextLevelId, totalLevels)} 关</span>
          </button>
        )}

        <div className="home-mini-btns">
          <button className="mini-btn" onClick={onLevels} type="button">
            <span className="emoji" aria-hidden>🗺️</span>
            <span>选关</span>
          </button>
          <button className="mini-btn" onClick={onStickers} type="button">
            <span className="emoji" aria-hidden>🎨</span>
            <span>贴纸册</span>
          </button>
          <button className="mini-btn" onClick={onMinigames} type="button">
            <span className="emoji" aria-hidden>🎮</span>
            <span>小游戏</span>
          </button>
          <button
            className="mini-btn parent-btn"
            onPointerDown={beginParentPress}
            onPointerUp={cancelParentPress}
            onPointerCancel={cancelParentPress}
            onPointerLeave={cancelParentPress}
            type="button"
          >
            <span className="emoji" aria-hidden>👨‍👩‍👧</span>
            <span>家长（长按）</span>
          </button>
        </div>
      </section>
    </main>
  );
}
