// 选关 v4：糖果地图风格。10 关沿着弯弯小路排列，已通关有星星，当前关脉冲发光，未解锁灰锁。

import { useState } from 'react';
import { PLAY_LEVELS } from '../data/playLevels';
import type { PlayLevel, PlayProgress } from '../types';
import GameButton from './ui/GameButton';
import StarRating from './ui/StarRating';

interface LevelSelectProps {
  progress: PlayProgress;
  onPick: (levelId: number) => void;
  onBack: () => void;
}

// 10 关沿着 S 形路径分布的相对位置（百分比，相对 .ls-map）
const NODE_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 20, y: 5 },
  { x: 70, y: 13 },
  { x: 25, y: 22 },
  { x: 75, y: 32 },
  { x: 30, y: 42 },
  { x: 75, y: 52 },
  { x: 25, y: 62 },
  { x: 70, y: 72 },
  { x: 30, y: 82 },
  { x: 75, y: 92 },
];

// 用 SVG path 把 10 个点连起来
function pathBetween(): string {
  let d = '';
  for (let i = 0; i < NODE_POSITIONS.length - 1; i++) {
    const a = NODE_POSITIONS[i];
    const b = NODE_POSITIONS[i + 1];
    const cx = (a.x + b.x) / 2;
    const cy1 = a.y + (b.y - a.y) * 0.6;
    if (i === 0) d += `M ${a.x} ${a.y} `;
    d += `Q ${cx} ${cy1} ${b.x} ${b.y} `;
  }
  return d;
}

export default function LevelSelect({ progress, onPick, onBack }: LevelSelectProps) {
  const [popup, setPopup] = useState<PlayLevel | null>(null);

  const isUnlocked = (id: number) => id <= progress.currentLevel;
  const isCurrent = (id: number) => id === progress.currentLevel;

  const openPopup = (level: PlayLevel) => {
    if (!isUnlocked(level.id)) return;
    setPopup(level);
  };
  const startFromPopup = () => {
    if (!popup) return;
    const id = popup.id;
    setPopup(null);
    onPick(id);
  };

  return (
    <main className="ls-page">
      <header className="ls-header">
        <button className="ls-back gpanel-back" onClick={onBack} type="button" aria-label="返回">←</button>
        <h1>关卡地图</h1>
        <div className="ls-spacer" style={{ width: 44 }} />
      </header>

      <p className="ls-desc">沿着小路一关一关闯过去</p>

      <div className="ls-map">
        {/* 路径 SVG */}
        <svg
          className="ls-path"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d={pathBetween()}
            fill="none"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="0.5 2.5"
            opacity="0.85"
          />
          <path
            d={pathBetween()}
            fill="none"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        {/* 关卡节点 */}
        {PLAY_LEVELS.map((level, i) => {
          const pos = NODE_POSITIONS[i];
          const unlocked = isUnlocked(level.id);
          const current = isCurrent(level.id);
          const stars = progress.stars[String(level.id)] ?? 0;
          const cls = [
            'ls-node',
            !unlocked ? 'is-locked' : '',
            current ? 'is-current' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={level.id}
              type="button"
              className={cls}
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -50%)` }}
              onClick={() => openPopup(level)}
              aria-label={`第 ${level.id} 关：${level.title}`}
              disabled={!unlocked}
            >
              {unlocked ? (
                <>
                  <span className="ls-node-num">{level.id}</span>
                  <div className="ls-node-stars" aria-hidden>
                    {[0, 1, 2].map((s) => (
                      <span key={s} className={s < stars ? 'on' : 'off'}>⭐</span>
                    ))}
                  </div>
                </>
              ) : (
                <span className="ls-node-lock">🔒</span>
              )}
              <span className="ls-node-name">{level.title}</span>
            </button>
          );
        })}
      </div>

      {popup && (
        <div className="ls-popup" onClick={() => setPopup(null)}>
          <div className="ls-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="ls-popup-num">第 {popup.id} 关</div>
            <h2 className="ls-popup-title">{popup.title}</h2>
            <StarRating filled={progress.stars[String(popup.id)] ?? 0} size={26} />
            <div className="ls-popup-mission" style={{ marginTop: 12 }}>
              <span className="ls-popup-mission-label">关卡目标</span>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--text-dark)' }}>{popup.intro}</p>
            </div>
            <div className="ls-popup-learn">
              <span className="ls-popup-learn-label">今天学到</span>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--text-dark)' }}>{popup.summary}</p>
            </div>
            <div className="ls-popup-actions">
              <GameButton variant="primary" size="md" emoji="🚗" onClick={startFromPopup}>
                开始
              </GameButton>
              <div className="ls-popup-secondary">
                <GameButton variant="ghost" size="sm" onClick={() => setPopup(null)}>
                  返回
                </GameButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
