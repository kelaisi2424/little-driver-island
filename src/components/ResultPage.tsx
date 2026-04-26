import type { GameDefinition } from '../types';
import type { Sticker } from '../utils/stickers';

interface ResultPageProps {
  game: GameDefinition | null;
  stars: number;
  sticker: Sticker | null;
  limitReached: boolean;
  onBack: () => void;
  onReplay: () => void;
}

export default function ResultPage({
  game,
  stars,
  sticker,
  limitReached,
  onBack,
  onReplay,
}: ResultPageProps) {
  return (
    <div className="result-page">
      <div className="result-card">
        <div className="result-emoji" aria-hidden>{game?.icon ?? '🚗'}</div>
        <h1>完成啦！</h1>
        <div className="result-stars">{'⭐'.repeat(stars || 1)}</div>
        {sticker && (
          <div className="result-sticker">
            <span style={{ background: sticker.color }}>{sticker.emoji}</span>
            <p>获得：{sticker.name}</p>
          </div>
        )}
        <p className="result-reminder">眼睛休息一下，看看远处吧。</p>
        <div className="result-actions">
          <button className="btn btn-ghost" onClick={onBack}>回到游戏盒</button>
          <button className="btn" onClick={onReplay} disabled={limitReached}>
            再玩一次
          </button>
        </div>
        {limitReached && <p className="result-limit">今天已经完成啦，明天再来。</p>}
      </div>
    </div>
  );
}
