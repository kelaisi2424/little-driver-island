import type { Level3D } from '../../data/levels3d';
import type { ChallengeConfig, DrivingTelemetry } from '../../data/challenge3d';
import { encouragementFor } from '../../data/challenge3d';
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
  /** v1.7: easy=普通模式（旧行为），challenge=挑战模式（显示 telemetry + 鼓励） */
  drivingMode?: 'easy' | 'challenge';
  challengeConfig?: ChallengeConfig | null;
  telemetry?: DrivingTelemetry | null;
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
  drivingMode = 'easy',
  challengeConfig,
  telemetry,
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

  const isChallenge = drivingMode === 'challenge' && challengeConfig?.enabled;
  const encouragement = isChallenge && challengeConfig && telemetry
    ? encouragementFor(telemetry, challengeConfig)
    : null;

  return (
    <div className="game3d-overlay">
      <section className={`game3d-complete-card ${isChallenge ? 'is-challenge' : ''}`}>
        <div className="game3d-complete-star">{mode === 'final' ? '🏆' : isChallenge ? '🎯' : '⭐'}</div>

        {/* 标题 */}
        {mode === 'final' ? (
          <h1>🎉 安全驾驶大师完成啦！</h1>
        ) : mode === 'chapter-end' ? (
          <h1>第 {level.id} 关 · 本章完成啦！</h1>
        ) : isChallenge ? (
          <h1>第 {level.id} 关 · 挑战完成！</h1>
        ) : (
          <h1>第 {level.id} 关完成啦！</h1>
        )}

        {/* 星星 */}
        <p className="game3d-stars">
          {[1, 2, 3].map((i) => (
            <span key={i} className={i <= stars ? 'star-on' : 'star-off'}>
              {i <= stars ? '⭐' : '☆'}
            </span>
          ))}
        </p>

        {/* 挑战模式：本关表现 */}
        {isChallenge && telemetry && challengeConfig && (
          <div className="game3d-challenge-result">
            <h3>本关表现</h3>
            <ul>
              <li>
                <span>时间</span>
                <strong>
                  {telemetry.elapsedTime} 秒 / {challengeConfig.targetTime} 秒
                </strong>
              </li>
              <li>
                <span>碰撞</span>
                <strong>{telemetry.collisions} 次</strong>
              </li>
              <li>
                <span>检查点</span>
                <strong>
                  {telemetry.checkpointPassed} / {level.checkpoints.length || '终点'}
                </strong>
              </li>
              {challengeConfig.challengeType === 'precisionParking' && (
                <li>
                  <span>停车精度</span>
                  <strong>{telemetry.parkingAccuracy.toFixed(2)} 米</strong>
                </li>
              )}
            </ul>
            {encouragement && stars < 3 && (
              <p className="game3d-encouragement">💡 {encouragement}</p>
            )}
          </div>
        )}

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
              <button onClick={onRetry} type="button">{isChallenge ? '再挑战一次' : '再玩一次'}</button>
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
              <button onClick={onRetry} type="button">{isChallenge ? '再挑战一次' : '再来一次'}</button>
              <button onClick={onHome} type="button">回首页</button>
            </>
          )}

          {mode === 'regular' && (
            <>
              <button className="game3d-primary" onClick={onNext} type="button">
                下一关 →
              </button>
              <button onClick={onRetry} type="button">{isChallenge ? '再挑战一次' : '再来一次'}</button>
              {onChapters && <button onClick={onChapters} type="button">回选关</button>}
              <button onClick={onHome} type="button">回首页</button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
