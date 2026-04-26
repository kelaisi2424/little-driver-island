// 通关页 v4：彩屑 + 大星星弹出 + 旁边小车跳一跳。

import { useEffect } from 'react';
import type { PlayLevel, PlayCompletePayload } from '../types';
import type { Sticker } from '../utils/stickers';
import { speak } from '../utils/speech';
import { playSound } from '../utils/sound';
import CartoonCar from './ui/CartoonCar';
import GameButton from './ui/GameButton';
import StarRating from './ui/StarRating';

interface LevelCompleteProps {
  level: PlayLevel;
  result: PlayCompletePayload;
  sticker: Sticker | null;
  needRest: boolean;
  isLastLevel: boolean;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export default function LevelComplete({
  level,
  result,
  sticker,
  needRest,
  isLastLevel,
  onNext,
  onRetry,
  onHome,
}: LevelCompleteProps) {
  useEffect(() => {
    speak(`第 ${level.id} 关完成啦。${level.summary}`);
    playSound('complete');
  }, [level.id, level.summary]);

  const nextText = needRest ? '休息一下' : isLastLevel ? '回首页' : '下一关';
  const nextEmoji = needRest ? '🌙' : isLastLevel ? '🏠' : '🚀';

  return (
    <main className="lc-page">
      {/* 彩屑 */}
      <div className="lc-confetti" aria-hidden>
        <span /><span /><span /><span /><span /><span /><span />
      </div>

      <div className="lc-card">
        <div className="lc-burst" aria-hidden>🎉</div>
        <h1 className="lc-title">第 {level.id} 关完成啦！</h1>
        <h2 className="lc-subtitle">{level.title}</h2>

        <StarRating filled={result.stars} size={48} animate />

        <div className="lc-learn">
          <span className="lc-learn-label">今天学到</span>
          <p className="lc-learn-text">{level.summary}</p>
        </div>

        {sticker && (
          <div className="lc-sticker">
            <div className="lc-sticker-emoji" style={{ background: sticker.color }}>
              {sticker.emoji}
            </div>
            <div className="lc-sticker-name">+ {sticker.name}</div>
          </div>
        )}

        <div className="lc-actions">
          <GameButton variant="primary" size="lg" emoji={nextEmoji} onClick={onNext}>
            {nextText}
          </GameButton>
          <div className="lc-secondary-row" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <GameButton variant="yellow" size="sm" onClick={onRetry}>
              再试一次
            </GameButton>
            <GameButton variant="ghost" size="sm" onClick={onHome}>
              回首页
            </GameButton>
          </div>
        </div>
      </div>

      {/* 旁边小车 */}
      <div className="lc-side-car">
        <CartoonCar size={120} bobbing={false} />
      </div>
    </main>
  );
}
