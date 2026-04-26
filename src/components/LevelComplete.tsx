import type { DrivingCompletePayload } from '../types';
import type { Sticker } from '../utils/stickers';

interface LevelCompleteProps {
  result: DrivingCompletePayload;
  sticker: Sticker | null;
  needRest: boolean;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export default function LevelComplete({
  result,
  sticker,
  needRest,
  onNext,
  onRetry,
  onHome,
}: LevelCompleteProps) {
  return (
    <main className="complete-screen">
      <section className="complete-card">
        <div className="complete-burst">⭐</div>
        <h1>第 {result.level.id} 关完成啦！</h1>
        <p className="complete-stars">{'⭐'.repeat(result.stars)}</p>
        <p className="complete-summary">今天学到：{result.level.summary}</p>
        {sticker && (
          <div className="sticker-unlock">
            <span>{sticker.emoji}</span>
            <strong>获得：{sticker.name}</strong>
          </div>
        )}
        <div className="complete-actions">
          <button className="master-start-btn" onClick={onNext} type="button">
            {needRest ? '休息一下' : '下一关'}
          </button>
          <button onClick={onRetry} type="button">再试一次</button>
          <button onClick={onHome} type="button">回到车库</button>
        </div>
      </section>
    </main>
  );
}
