// v1.8 任务完成剧情页：替代/包裹原 LevelComplete3D
// 兼容 V1.7 挑战模式：显示 telemetry + 鼓励文案

import type { Level3D } from '../../data/levels3d';
import type { StoryMission } from '../../data/storyMissions';
import type { ChallengeConfig, DrivingTelemetry } from '../../data/challenge3d';
import { encouragementFor } from '../../data/challenge3d';
import { CHAPTERS_3D, type Chapter3D } from '../../data/chapters3d';
import { getStoryChapter } from '../../data/storyChapters';
import NpcDialog from './NpcDialog';

export type CompletionMode = 'regular' | 'chapter-end' | 'final';

interface MissionCompleteProps {
  level: Level3D;
  mission: StoryMission;
  stars: number;
  completion: CompletionMode;
  /** v1.7：drivingMode 'easy' | 'challenge' */
  drivingMode?: 'easy' | 'challenge';
  challengeConfig?: ChallengeConfig | null;
  telemetry?: DrivingTelemetry | null;
  chapterStickerId?: string | null;
  nextChapter?: Chapter3D | null;
  onNext: () => void;
  onRetry: () => void;
  onMap: () => void;
  onChapters?: () => void;
}

export default function MissionComplete({
  level,
  mission,
  stars,
  completion,
  drivingMode = 'easy',
  challengeConfig,
  telemetry,
  chapterStickerId,
  nextChapter,
  onNext,
  onRetry,
  onMap,
  onChapters,
}: MissionCompleteProps) {
  const chapter = getStoryChapter(mission.chapterId);
  const isChallenge = drivingMode === 'challenge' && challengeConfig?.enabled;
  const sticker = chapterStickerId
    ? CHAPTERS_3D.find((c) => c.stickerId === chapterStickerId)
    : null;
  const encouragement = isChallenge && challengeConfig && telemetry && stars < 3
    ? encouragementFor(telemetry, challengeConfig)
    : null;

  return (
    <div className="game3d-overlay mission-complete-overlay">
      <section
        className={`mission-complete-card ${isChallenge ? 'is-challenge' : ''}`}
        style={{
          ['--story-color' as string]: chapter.themeColor,
          ['--story-accent' as string]: chapter.themeAccent,
        }}
      >
        {/* 顶部祝贺标题 */}
        <div className="mc-trophy">
          {completion === 'final' ? '🏆' : isChallenge ? '🎯' : '⭐'}
        </div>
        <h1>
          {completion === 'final'
            ? '🎉 安全驾驶小达人！'
            : completion === 'chapter-end'
            ? `第 ${chapter.id} 章 · 完成啦！`
            : isChallenge
            ? '挑战完成！'
            : '任务完成啦！'}
        </h1>

        {/* 星级 */}
        <p className="mc-stars">
          {[1, 2, 3].map((i) => (
            <span key={i} className={i <= stars ? 'on' : 'off'}>{i <= stars ? '⭐' : '☆'}</span>
          ))}
        </p>

        {/* NPC 感谢对话 */}
        <NpcDialog
          npc={mission.npc}
          text={mission.successDialog}
          location={mission.location}
          size="lg"
        />

        {/* 学习点小卡片（藏在角色提醒里） */}
        <div className="mc-learning">
          <span>💡 今天学到</span>
          <p>"{mission.learningPoint}"</p>
        </div>

        {/* 挑战模式表现表 */}
        {isChallenge && telemetry && challengeConfig && (
          <div className="mc-challenge-result">
            <h3>本关表现</h3>
            <ul>
              <li><span>时间</span><strong>{telemetry.elapsedTime} 秒 / {challengeConfig.targetTime} 秒</strong></li>
              <li><span>碰撞</span><strong>{telemetry.collisions} 次</strong></li>
              <li><span>检查点</span><strong>{telemetry.checkpointPassed} / {level.checkpoints.length || '终点'}</strong></li>
              {challengeConfig.challengeType === 'precisionParking' && (
                <li><span>停车精度</span><strong>{telemetry.parkingAccuracy.toFixed(2)} 米</strong></li>
              )}
            </ul>
            {encouragement && (
              <p className="mc-encouragement">💡 {encouragement}</p>
            )}
          </div>
        )}

        {/* 章节贴纸解锁 */}
        {sticker && (
          <div className="mc-sticker-unlock">
            <div className="cs-sticker-emoji" style={{ background: sticker.stickerColor }}>
              {sticker.stickerEmoji}
            </div>
            <div className="mc-sticker-text">
              <strong>章节贴纸解锁！</strong>
              <span>{sticker.stickerName}</span>
            </div>
          </div>
        )}

        {/* 下一章解锁 */}
        {completion === 'chapter-end' && nextChapter && (
          <div className="mc-sticker-unlock is-next-chapter">
            <div className="cs-sticker-emoji" style={{ background: nextChapter.color }}>
              {nextChapter.emoji}
            </div>
            <div className="mc-sticker-text">
              <strong>新章节开启</strong>
              <span>第 {nextChapter.id} 章 · {nextChapter.title}</span>
            </div>
          </div>
        )}

        {/* 奖励文案 */}
        <div className="mc-reward">
          🎁 {mission.rewardText}
        </div>

        {/* 按钮 */}
        <div className="mc-actions">
          {completion === 'final' ? (
            <>
              <button className="mc-primary" onClick={onMap} type="button">
                🏠 回汽车城
              </button>
              <button onClick={onRetry} type="button">{isChallenge ? '再挑战一次' : '再玩一次'}</button>
            </>
          ) : (
            <>
              <button className="mc-primary" onClick={onNext} type="button">
                {completion === 'chapter-end' ? '进入下一章 →' : '继续下一个任务 →'}
              </button>
              <button onClick={onRetry} type="button">{isChallenge ? '再挑战一次' : '再来一次'}</button>
              <button onClick={onMap} type="button">回汽车城</button>
              {onChapters && (
                <button className="mc-link" onClick={onChapters} type="button">章节选关</button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
