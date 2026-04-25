import type { GameMode } from '../types';
import { primeVoice } from '../utils/speech';
import CarSvg from './CarSvg';

interface StartPageProps {
  onStart: (mode: GameMode) => void;
  onParent: () => void;
  onStickers: () => void;
  limitReached: boolean;
  todayCount: number;
  dailyLimit: number;
}

export default function StartPage({
  onStart,
  onParent,
  onStickers,
  limitReached,
  todayCount,
  dailyLimit,
}: StartPageProps) {
  // 在用户首次点击时唤醒语音引擎，避免 iOS 拦截
  const handleStart = (mode: GameMode) => {
    primeVoice();
    onStart(mode);
  };

  return (
    <div className="start-page">
      <div className="start-header">
        <h1 className="start-title">小小司机任务岛</h1>
        <p className="start-subtitle">完成安全任务，成为小小文明司机</p>
      </div>

      <div className="start-art">
        <span className="sun" aria-hidden>☀️</span>
        <span className="cloud cloud-1" aria-hidden />
        <span className="cloud cloud-2" aria-hidden />
        <CarSvg color="#ff8c69" size={170} />
      </div>

      {limitReached ? (
        <div className="limit-card">
          <span className="moon" aria-hidden>🌙</span>
          <p className="limit-text">今天已经完成任务啦，明天再来吧。</p>
          <p className="limit-sub">今天已玩 {todayCount} 局</p>
        </div>
      ) : (
        <div className="mode-row">
          <button
            className="btn mode-card mode-learning"
            onClick={() => handleStart('learning')}
          >
            <span className="emoji" aria-hidden>📖</span>
            <span className="main">学习模式</span>
            <span className="sub">边玩边学，每步都有讲解</span>
          </button>
          <button
            className="btn mode-card mode-game"
            onClick={() => handleStart('game')}
          >
            <span className="emoji" aria-hidden>🚗</span>
            <span className="main">游戏模式</span>
            <span className="sub">直接闯关</span>
          </button>
        </div>
      )}

      <div className="start-links">
        <button className="link-btn" onClick={onStickers}>
          🎨 我的贴纸册
        </button>
        <span className="link-divider" aria-hidden>·</span>
        <button className="link-btn" onClick={onParent}>
          家长设置
        </button>
      </div>
      <p className="start-meta">
        今天玩了 {todayCount} / {dailyLimit} 局
      </p>
    </div>
  );
}
