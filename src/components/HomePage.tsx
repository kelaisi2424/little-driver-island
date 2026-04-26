// 首页 v6：真 2.5D 玩具车场景 + 3D 按钮
// 层级：HUD → Logo → ToyCarScene3D → StartButton3D → 三个小卡片 → 底部链接

import { useEffect, useRef } from 'react';
import { primeVoice, speak } from '../utils/speech';
import IconBubble from './ui/IconBubble';
import MainTitle from './ui/MainTitle';
import ToyCarScene3D from './hero/ToyCarScene3D';
import StartButton3D from './hero/StartButton3D';

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

      {/* 真 2.5D 主视觉舞台 */}
      <ToyCarScene3D />

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
          <StartButton3D
            emoji="🚗"
            title="开始闯关"
            subtitle={`第 ${Math.min(nextLevelId, totalLevels)} 关`}
            onClick={handleStart}
          />
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
    </main>
  );
}
