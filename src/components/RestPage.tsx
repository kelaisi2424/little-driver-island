import { useEffect } from 'react';
import type { Sticker } from '../utils/stickers';
import { speak } from '../utils/speech';
import CarSvg from './CarSvg';

interface RestPageProps {
  stars: number;
  totalTasks: number;
  reminder: string;
  newSticker: Sticker | null;
  limitReached: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
  onStickers: () => void;
}

export default function RestPage({
  stars,
  totalTasks,
  reminder,
  newSticker,
  limitReached,
  onPlayAgain,
  onExit,
  onStickers,
}: RestPageProps) {
  const starRow =
    '⭐️'.repeat(stars) + '☆'.repeat(Math.max(0, totalTasks - stars));

  useEffect(() => {
    // 一进入休息页就朗读提醒
    if (limitReached) {
      speak('今天已经完成任务啦，明天再来吧。');
    } else {
      speak(`今天的小司机任务完成啦！${reminder}`);
    }
  }, [limitReached, reminder]);

  return (
    <div className="rest-page">
      <div>
        <h1 className="rest-title">今天的小司机任务完成啦！</h1>
        <div className="rest-stars">{starRow}</div>
        <p className="rest-stars-text">获得 {stars} 颗小星星</p>
      </div>

      {newSticker ? (
        <div className="sticker-reward">
          <p className="new-text">你获得了一张新贴纸</p>
          <div className="sticker-art">
            <CarSvg color={newSticker.color} size={110} />
          </div>
          <p className="sticker-name">{newSticker.name}</p>
          <button className="link-btn" onClick={onStickers}>
            查看贴纸册 →
          </button>
        </div>
      ) : (
        <div className="sticker-reward all-collected">
          <p className="new-text">🎉 你已经集齐了所有贴纸！</p>
          <button className="link-btn" onClick={onStickers}>
            查看贴纸册 →
          </button>
        </div>
      )}

      <div className="rest-reminder">
        <span className="eye" aria-hidden>👀</span>
        {reminder}
      </div>

      {limitReached ? (
        <div className="limit-card compact">
          <span className="moon" aria-hidden>🌙</span>
          <p className="limit-text">今天已经完成任务啦，明天再来吧。</p>
        </div>
      ) : null}

      <div className="start-actions">
        {!limitReached && (
          <button className="btn" onClick={onPlayAgain}>
            再玩一局
          </button>
        )}
        <button className="btn btn-ghost" onClick={onExit}>
          退出
        </button>
      </div>
    </div>
  );
}
