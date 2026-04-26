import type { Level3D } from '../../data/levels3d';
import { CHAPTERS_3D } from '../../data/chapters3d';

interface LevelComplete3DProps {
  level: Level3D;
  stars: number;
  chapterStickerId?: string | null;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export default function LevelComplete3D({
  level,
  stars,
  chapterStickerId,
  onNext,
  onRetry,
  onHome,
}: LevelComplete3DProps) {
  const chapter = chapterStickerId ? CHAPTERS_3D.find((c) => c.stickerId === chapterStickerId) : null;
  return (
    <div className="game3d-overlay">
      <section className="game3d-complete-card">
        <div className="game3d-complete-star">⭐</div>
        <h1>第 {level.id} 关完成啦！</h1>
        <p className="game3d-stars">{'⭐'.repeat(stars)}</p>
        <p>今天学到：{level.summary}</p>

        {chapter && (
          <div className="game3d-chapter-sticker-unlock">
            <div className="cs-sticker-emoji" style={{ background: chapter.stickerColor }}>
              {chapter.stickerEmoji}
            </div>
            <div className="game3d-chapter-sticker-text">
              <strong>章节贴纸解锁！</strong>
              <span>{chapter.stickerName} · 第 {chapter.id} 章 完成</span>
            </div>
          </div>
        )}

        <div className="game3d-complete-actions">
          <button className="game3d-primary" onClick={onNext} type="button">下一关</button>
          <button onClick={onRetry} type="button">再来一次</button>
          <button onClick={onHome} type="button">回首页</button>
        </div>
      </section>
    </div>
  );
}
