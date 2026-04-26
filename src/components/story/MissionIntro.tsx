// v1.8 任务开始前剧情对话页：替代/包裹原 MissionCard
// 兼容 V1.7 挑战模式：如果 mode === 'challenge' 显示挑战目标 + "开始挑战"

import type { Level3D } from '../../data/levels3d';
import type { StoryMission } from '../../data/storyMissions';
import type { ChallengeConfig } from '../../data/challenge3d';
import { getStoryChapter } from '../../data/storyChapters';
import NpcDialog from './NpcDialog';

interface MissionIntroProps {
  level: Level3D;
  mission: StoryMission;
  /** v1.7 兼容：'easy' | 'challenge' */
  mode?: 'easy' | 'challenge';
  challengeConfig?: ChallengeConfig | null;
  onStart: () => void;
  onBack: () => void;
}

export default function MissionIntro({
  level,
  mission,
  mode = 'easy',
  challengeConfig,
  onStart,
  onBack,
}: MissionIntroProps) {
  const chapter = getStoryChapter(mission.chapterId);
  const isChallenge = mode === 'challenge' && challengeConfig?.enabled;

  return (
    <div className="game3d-overlay mission-intro-overlay">
      <section
        className={`mission-intro-card ${isChallenge ? 'is-challenge' : ''}`}
        style={{
          ['--story-color' as string]: chapter.themeColor,
          ['--story-accent' as string]: chapter.themeAccent,
        }}
      >
        {/* 章节顶栏 */}
        <div className="mi-chapter-strip">
          <span className="mi-chapter-emoji">{chapter.emoji}</span>
          <div className="mi-chapter-text">
            <small>第 {chapter.id} 章 · {chapter.title}</small>
            <strong>第 {mission.levelId} 关 · {mission.missionTitle}</strong>
          </div>
          <button className="mi-back" onClick={onBack} type="button" aria-label="返回">←</button>
        </div>

        {/* NPC 对话 */}
        <NpcDialog
          npc={mission.npc}
          text={mission.introDialog}
          location={mission.location}
          size="lg"
        />

        {/* 任务目标 */}
        <div className="mi-objective">
          <span className="mi-label">任务</span>
          <p>{mission.objectiveText}</p>
        </div>

        {/* 学习点（藏在 NPC 提醒里，不像上课） */}
        <div className="mi-learning-quote">
          <span>💡</span>
          <em>"{mission.learningPoint}"</em>
        </div>

        {/* 挑战模式额外目标 */}
        {isChallenge && challengeConfig && (
          <div className="mi-challenge-block">
            <div className="mi-challenge-banner">
              <span className="mi-challenge-tag">🏆 {challengeConfig.label}</span>
              <span className="mi-challenge-time">⏱ 目标 {challengeConfig.targetTime} 秒</span>
            </div>
            <ul className="mi-challenge-list">
              {challengeConfig.bonusObjectives.map((obj, i) => (
                <li key={i}>★ {obj}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          className={`mi-start ${isChallenge ? 'is-challenge' : ''}`}
          onClick={onStart}
          type="button"
        >
          {isChallenge ? '🏆 开始挑战' : '🚗 开始任务'}
        </button>
        <button className="mi-skip-link" onClick={onBack} type="button">
          回汽车城
        </button>
      </section>
    </div>
  );
}
