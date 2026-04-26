// 首页 v5：2.5D 卡通玩具车封面
// 层级：HUD → Logo → 主视觉(三层场景+大车) → 大主按钮 → 三个小卡片 → 底部链接

import { useEffect, useRef } from 'react';
import { primeVoice, speak } from '../utils/speech';
import { playSound } from '../utils/sound';
import CartoonCar from './ui/CartoonCar';
import Clouds from './ui/Clouds';
import GameButton from './ui/GameButton';
import IconBubble from './ui/IconBubble';
import MainTitle from './ui/MainTitle';
import PerspectiveTrack from './ui/PerspectiveTrack';

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
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (limitReached) speak('今天已经玩够啦，明天再来吧。');
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

  // 点击主车：弹一下 + 喇叭
  const handleHeroCarTap = () => {
    if (!heroRef.current) return;
    heroRef.current.classList.remove('car-pop');
    void heroRef.current.offsetWidth;
    heroRef.current.classList.add('car-pop');
    playSound('horn');
  };

  return (
    <main className="home-v5">
      {/* HUD 胶囊 */}
      <header className="hud-bar">
        <div className="hud-left">
          <IconBubble size={32} color="#ff5e3a">🚗</IconBubble>
          <span className="hud-game-name">小小汽车闯关王</span>
        </div>
        <div className="hud-right">
          <div className="hud-pill">
            <span aria-hidden>⏱</span>
            <span>{fmtMin(usedSeconds)}/{limitMinutes}</span>
          </div>
          <div className="hud-pill">
            <span aria-hidden>🏁</span>
            <span>{completedLevels}</span>
          </div>
        </div>
      </header>

      {/* 标题 + 副标题 */}
      <div className="logo-block">
        <MainTitle text="小小汽车闯关王" subtitle="开车闯关，安全到达！" />
      </div>

      {/* 主视觉舞台 */}
      <section className="hero-stage" aria-hidden>
        {/* 远景层 */}
        <div className="layer-far">
          <span className="hs-sun" />
          <Clouds variant="sky" />
          <div className="hs-mountain m-l" />
          <div className="hs-mountain m-r" />
          <div className="hs-mountain m-mid" />
        </div>

        {/* 中景层 */}
        <div className="layer-mid">
          {/* 幼儿园 */}
          <div className="hs-kindergarten">
            <div className="hs-roof" />
            <div className="hs-house">
              <div className="hs-window" />
              <div className="hs-door" />
            </div>
          </div>
          {/* 红绿灯 */}
          <div className="hs-traffic-light">
            <div className="tl-pole" />
            <div className="tl-box">
              <span className="tl-bulb red" />
              <span className="tl-bulb yellow" />
              <span className="tl-bulb green" />
            </div>
          </div>
          {/* P 牌 */}
          <div className="hs-p-sign">
            <div className="p-pole" />
            <div className="p-circle">P</div>
          </div>
          {/* 树 */}
          <span className="hs-tree tree-l">🌳</span>
          <span className="hs-tree tree-r">🌲</span>
        </div>

        {/* 近景：透视赛道 */}
        <div className="layer-near">
          <PerspectiveTrack />
          {/* START 牌 */}
          <div className="hs-start-flag">
            <div className="flag-pole" />
            <div className="flag-cloth">START</div>
          </div>
          {/* 路锥 */}
          <div className="hs-cone cone-l">
            <ConeSvg />
          </div>
          <div className="hs-cone cone-r">
            <ConeSvg />
          </div>
        </div>

        {/* 主角小车 */}
        <div
          ref={heroRef}
          className="hero-car-slot"
          onClick={handleHeroCarTap}
        >
          <CartoonCar bobbing glow />
        </div>
      </section>

      {/* 主按钮区 */}
      <section className="actions-area">
        {limitReached ? (
          <div className="limit-pill">
            <span className="moon" aria-hidden>🌙</span>
            <div className="limit-text">
              <strong>今天已经玩够啦</strong>
              <p>明天再来开车吧</p>
            </div>
          </div>
        ) : (
          <button className="big-start-btn" onClick={handleStart} type="button">
            <span className="big-start-row1">
              <span className="big-start-emoji" aria-hidden>🚗</span>
              <span>开始闯关</span>
            </span>
            <span className="big-start-row2">第 {Math.min(nextLevelId, totalLevels)} 关</span>
          </button>
        )}

        {/* 三个玩具积木卡片 */}
        <div className="toy-blocks">
          <button className="toy-block tb-blue" onClick={onLevels} type="button">
            <IconBubble size={42} color="#4a9ff0">🗺️</IconBubble>
            <span>地图选关</span>
          </button>
          <button className="toy-block tb-yellow" onClick={onMinigames} type="button">
            <IconBubble size={42} color="#ffd000">🎮</IconBubble>
            <span>小游戏盒</span>
          </button>
          <button className="toy-block tb-green" onClick={onStickers} type="button">
            <IconBubble size={42} color="#5cd684">🎨</IconBubble>
            <span>贴纸册</span>
          </button>
        </div>

        {/* 底部小入口 */}
        <div className="bottom-links">
          <button
            className="bottom-link parent-hold"
            onPointerDown={beginParentPress}
            onPointerUp={cancelParentPress}
            onPointerCancel={cancelParentPress}
            onPointerLeave={cancelParentPress}
            type="button"
          >
            <IconBubble size={28} color="#fff">👨‍👩‍👧</IconBubble>
            <span>家长设置（长按）</span>
          </button>
        </div>
      </section>

      {/* 防止 GameButton 触发未使用警告 */}
      {false && <GameButton onClick={() => {}}>x</GameButton>}
    </main>
  );
}

function ConeSvg() {
  return (
    <svg viewBox="0 0 40 50" width="100%" height="100%">
      <ellipse cx="20" cy="46" rx="16" ry="3" fill="rgba(0,0,0,0.18)" />
      <path d="M 12 44 L 28 44 L 24 12 L 16 12 Z" fill="#ff7b3a" stroke="#3a1010" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="11" y="42" width="18" height="4" rx="1.5" fill="#3a3a3a" stroke="#1a1a1a" strokeWidth="1" />
      <rect x="14" y="26" width="12" height="3.5" fill="#fff" />
      <rect x="15.5" y="18" width="9" height="2.5" fill="#fff" />
    </svg>
  );
}
