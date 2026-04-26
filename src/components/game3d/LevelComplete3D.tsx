import type { Level3D } from '../../data/levels3d';
import { CHAPTERS_3D, type Chapter3D } from '../../data/chapters3d';

// 三种通关结局：
// - regular   : 普通关  → 下一关 / 再来 / 回首页
// - chapter-end : 章节最后一关 (10/20/.../90) → 进入下一章 / 回选关 / 回首页
// - final     : 第 100 关  → 完成啦 / 回首页
export type CompletionMode = 'regular' | 'chapter-end' | 'final';

interface LevelComplete3DProps {
  level: Level3D;
  stars: number;
  mode: CompletionMode;
  chapterStickerId?: string | null;
  nextChapter?: Chapter3D | null;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
  onChapters?: () => void;
}

export default function LevelComplete3D({
  level,
  stars,
  mode,
  chapterStickerId,
  nextChapter,
  onNext,
  onRetry,
  onHome,
  onChapters,
}: LevelComplete3DProps) {
  const chapter = chapterStickerId
    ? CHAPTERS_3D.find((c) => c.stickerId === chapterStickerId)
    : null;

  return (
    <div className="game3d-overlay">
      <section className="game3d-complete-card">
        <div className="game3d-complete-star">{mode === 'final' ? '🏆' : '⭐'}</div>

        {/* 标题 */}
        {mode === 'final' ? (
          <h1>🎉 安全驾驶大师完成啦！</h1>
        ) : mode === 'chapter-end' ? (
          <h1>第 {level.id} 关 · 本章完成啦！</h1>
        ) : (
          <h1>第 {level.id} 关完成啦！</h1>
        )}

        <p className="game3d-stars">{'⭐'.repeat(stars)}</p>
        <p>今天学到：{level.summary}</p>

        {/* 章节贴纸解锁提示 */}
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

        {/* 解锁下一章提示 */}
        {mode === 'chapter-end' && nextChapter && (
          <div className="game3d-next-chapter-info">
            <div className="cs-sticker-emoji" style={{ background: nextChapter.color }}>
              {nextChapter.emoji}
            </div>
            <div className="game3d-chapter-sticker-text">
              <strong>解锁新章节</strong>
              <span>第 {nextChapter.id} 章 · {nextChapter.title}</span>
            </div>
          </div>
        )}

        {/* 按钮组 - 按模式切换 */}
        <div className="game3d-complete-actions">
          {mode === 'final' && (
            <>
              <button className="game3d-primary" onClick={onHome} type="button">
                🏠 完成啦，回首页
              </button>
              <button onClick={onRetry} type="button">再玩一次</button>
            </>
          )}

          {mode === 'chapter-end' && (
            <>
              <button className="game3d-primary" onClick={onNext} type="button">
                进入下一章 →
              </button>
              {onChapters && (
                <button onClick={onChapters} type="button">回到选关</button>
              )}
              <button onClick={onHome} type="button">回首页</button>
            </>
          )}

          {mode === 'regular' && (
            <>
              <button className="game3d-primary" onClick={onNext} type="button">
                下一关 →
              </button>
              <button onClick={onRetry} type="button">再来一次</button>
              <button onClick={onHome} type="button">回首页</button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
