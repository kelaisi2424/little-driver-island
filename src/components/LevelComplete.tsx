// 关卡通关页：星星 + 学习总结 + 下一关 / 重玩 / 回首页

import { useEffect } from 'react';
import type { PlayLevel, PlayCompletePayload } from '../types';
import type { Sticker } from '../utils/stickers';
import { speak } from '../utils/speech';

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
  }, [level.id, level.summary]);

  const nextText = needRest ? '休息一下' : isLastLevel ? '回首页' : '下一关 →';

  return (
    <main className="lc-page">
      <div className="lc-card">
        <div className="lc-burst" aria-hidden>🎉</div>
        <h1 className="lc-title">第 {level.id} 关完成啦！</h1>
        <h2 className="lc-subtitle">{level.title}</h2>

        <div className="lc-stars">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < result.stars ? 'on' : 'off'}>⭐</span>
          ))}
        </div>

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
          <button className="lc-primary" onClick={onNext} type="button">
            {nextText}
          </button>
          <div className="lc-secondary-row">
            <button className="lc-secondary" onClick={onRetry} type="button">
              再试一次
            </button>
            <button className="lc-secondary ghost" onClick={onHome} type="button">
              回首页
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
