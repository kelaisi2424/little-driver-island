import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { LEVELS_3D, getLevel3D, validateLevels, type Level3D } from '../../data/levels3d';
import { CHAPTERS_3D, chapterOfLevel, isChapterEndLevel, type Chapter3D } from '../../data/chapters3d';
import { useDailyUsage } from '../../hooks/useDailyUsage';
import type { ParentConfig } from '../../types';
import { primeVoice, setVoiceEnabled, speak } from '../../utils/speech';
import { getMuted, playSound, toggleMuted } from '../../utils/sound';
import {
  addLearningRecord,
  getChallengeStars,
  loadConfig,
  loadProgress,
  loadSelectedCarId,
  loadSelectedMode,
  saveConfig,
  saveSelectedMode,
  updateChallengeProgress,
  updateLevelProgress,
  type DrivingMode,
} from '../../utils/storage';
import { CARS_3D, getCar3D } from '../../data/cars3d';
import {
  getChallengeConfig,
  scoreChallenge,
  type ChallengeConfig,
  type DrivingTelemetry,
} from '../../data/challenge3d';
import { awardSticker } from '../../utils/stickers';
import DrivingScene, { type DrivingDebugState } from '../../three/DrivingScene';
import { useDrivingControls } from '../../three/useDrivingControls';
import ParentSettings from '../ParentSettings';
import RestPage from '../RestPage';
import StickerBook from '../StickerBook';
import GameHUD from './GameHUD';
import VirtualControls from './VirtualControls';
// LevelComplete3D / MissionCard 仍保留在仓库（章节选关流程的内嵌渲染可复用），
// 但 v1.8 默认走剧情包装的 MissionIntro / MissionComplete。
import ChapterSelect, { type ChapterProgress } from './ChapterSelect';
import LevelSelectChapter from './LevelSelectChapter';
import GaragePage from './GaragePage';
// v1.8: 剧情系统
import StoryMap from '../story/StoryMap';
import MissionIntro from '../story/MissionIntro';
import MissionComplete from '../story/MissionComplete';
import { getStoryMission, validateStoryMissions } from '../../data/storyMissions';

type Game3DScreen =
  | 'home'      // 旧首页，保留为"经典视图"，剧情模式默认走 storymap
  | 'storymap'  // v1.8 新主入口：汽车城地图
  | 'chapters'
  | 'levels'
  | 'mission'
  | 'playing'
  | 'complete'
  | 'parent'
  | 'stickers'
  | 'garage'
  | 'rest';

const DEFAULT_CONFIG: ParentConfig = {
  totalTasks: 5,
  reminder: '眼睛休息一下，去喝口水，看看远处吧。',
  voiceEnabled: true,
  dailyLimit: 3,
  dailyMinutes: 15,
  restAfterLevels: 5,
  challengeEnabled: true,    // v1.7：默认开启挑战模式入口
};

function normalizeConfig(config: Partial<ParentConfig>): ParentConfig {
  const merged = { ...DEFAULT_CONFIG, ...config };
  return {
    ...merged,
    dailyMinutes: [10, 15, 20].includes(merged.dailyMinutes) ? merged.dailyMinutes : 15,
    restAfterLevels: [3, 5, 8].includes(merged.restAfterLevels) ? merged.restAfterLevels : 5,
    challengeEnabled: merged.challengeEnabled !== false,
  };
}

function getUnlocked3DLevel() {
  const progress = loadProgress();
  return Math.min(LEVELS_3D.length, progress.driving3d?.currentLevel ?? 1);
}

function buildChapterProgress(
  starsByLevel: Record<string, number>,
  challengeStarsByLevel: Record<string, number>,
): Record<number, ChapterProgress> {
  const out: Record<number, ChapterProgress> = {};
  for (const ch of CHAPTERS_3D) {
    let completed = 0;
    let totalStars = 0;
    let challengeCompleted = 0;
    let challengeStars = 0;
    for (let n = 1; n <= 10; n++) {
      const id = (ch.id - 1) * 10 + n;
      const stars = starsByLevel[String(id)] ?? 0;
      if (stars > 0) completed += 1;
      totalStars += stars;
      const cStars = challengeStarsByLevel[String(id)] ?? 0;
      if (cStars > 0) challengeCompleted += 1;
      challengeStars += cStars;
    }
    out[ch.id] = { completed, totalStars, challengeCompleted, challengeStars };
  }
  return out;
}

function getNextLevelId(levelId: number): number | null {
  return levelId >= LEVELS_3D.length ? null : levelId + 1;
}

function DebugDrivingHud({ debug }: { debug: DrivingDebugState | null }) {
  if (!import.meta.env.DEV || !debug) return null;
  return (
    <div className="game3d-debug-hud">
      <span>acc:{String(debug.accelerate)}</span>
      <span>brake:{String(debug.brake)}</span>
      <span>left:{String(debug.left)}</span>
      <span>right:{String(debug.right)}</span>
      <span>speed:{debug.speed}</span>
      <span>z:{debug.positionZ}</span>
      <span>off:{String(debug.offRoad)}</span>
      <span>hit:{String(debug.collision)}</span>
    </div>
  );
}

export default function Game3DPage() {
  const [config, setConfig] = useState(() => normalizeConfig(loadConfig() ?? {}));
  // v1.8: 默认进汽车城地图（剧情主入口）。'home' 仍可通过家长入口回退访问。
  const [screen, setScreen] = useState<Game3DScreen>('storymap');
  const [level, setLevel] = useState<Level3D>(() => getLevel3D(getUnlocked3DLevel()));
  const [activeChapter, setActiveChapter] = useState<Chapter3D>(() => chapterOfLevel(getUnlocked3DLevel()));
  const [progressVersion, setProgressVersion] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkpointPassed, setCheckpointPassed] = useState(0);
  const [hint, setHintRaw] = useState('准备发车');
  const lastSpokenRef = useRef<{ text: string; t: number }>({ text: '', t: 0 });
  // v14 关键修复：setHint 必须 useCallback 包装，否则每次 Game3DPage 渲染都会
  // 创建新函数 → 作为 DrivingScene 的 onHint prop 变化 → DrivingScene 的
  // useEffect [level, ..., onHint, ...] 重跑 → resetDrivingState 把车的速度
  // 和位置重置 → 油门按了车不动！
  const setHint = useCallback((text: string) => {
    setHintRaw(text);
    const now = Date.now();
    if (text && text !== lastSpokenRef.current.text && now - lastSpokenRef.current.t > 1500) {
      lastSpokenRef.current = { text, t: now };
      speak(text);
    }
  }, []);
  const [muted, setMuted] = useState(getMuted);
  const [paused, setPaused] = useState(false);
  const [lastStars, setLastStars] = useState(3);
  const [sessionLevels, setSessionLevels] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [chapterStickerJustUnlocked, setChapterStickerJustUnlocked] = useState<string | null>(null);
  const [pendingNextLevelId, setPendingNextLevelId] = useState<number | null>(null);
  const [shouldRestBeforeNext, setShouldRestBeforeNext] = useState(false);
  const [drivingDebug, setDrivingDebug] = useState<DrivingDebugState | null>(null);
  const { controls, controlsRef, setControl, resetControls } = useDrivingControls();
  // v15: 当前选中车
  const [selectedCarId, setSelectedCarId] = useState<string>(() => loadSelectedCarId() ?? CARS_3D[0].id);
  const selectedCar = useMemo(() => getCar3D(selectedCarId), [selectedCarId]);
  // v1.7: 当前模式
  const [selectedMode, setSelectedMode] = useState<DrivingMode>(() => loadSelectedMode());
  const challengeConfig = useMemo<ChallengeConfig | null>(
    () => (selectedMode === 'challenge' ? getChallengeConfig(level) : null),
    [selectedMode, level],
  );
  // v1.7: 实时 telemetry（HUD 显示用）+ ref（下层每帧写入）
  const [telemetry, setTelemetry] = useState<DrivingTelemetry | null>(null);
  const telemetryRef = useRef<DrivingTelemetry | null>(null);
  if (!telemetryRef.current) {
    telemetryRef.current = {
      elapsedTime: 0,
      collisions: 0,
      offRoadTime: 0,
      checkpointPassed: 0,
      brakeCount: 0,
      maxSpeed: 0,
      averageSpeed: 0,
      parkingAccuracy: 0,
      completed: false,
    };
  }
  // v1.7：useCallback 包装 onTelemetryChange，否则触发 DrivingScene 重渲染（油门 BUG 教训）
  const handleTelemetryChange = useCallback((t: DrivingTelemetry) => {
    setTelemetry({ ...t });
  }, []);
  const usage = useDailyUsage(config.dailyMinutes);

  useEffect(() => {
    if (import.meta.env.DEV) {
      validateLevels();
      validateStoryMissions();
    }
  }, []);

  useEffect(() => {
    saveConfig(config);
    setVoiceEnabled(config.voiceEnabled);
  }, [config]);

  useEffect(() => {
    if (screen !== 'playing') return undefined;
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startedAt) / 1000));
    }, 500);
    return () => window.clearInterval(timer);
  }, [screen, startedAt]);

  const unlockedLevel = useMemo(() => {
    progressVersion;
    return getUnlocked3DLevel();
  }, [progressVersion]);

  const starsByLevel = useMemo<Record<string, number>>(() => {
    progressVersion;
    return (loadProgress().driving3d?.stars as Record<string, number>) ?? {};
  }, [progressVersion]);

  // v1.7: 挑战模式星级（一并刷新）
  const challengeStarsByLevel = useMemo<Record<string, number>>(() => {
    progressVersion;
    return getChallengeStars('driving3d');
  }, [progressVersion]);

  const chapterProgress = useMemo(
    () => buildChapterProgress(starsByLevel, challengeStarsByLevel),
    [starsByLevel, challengeStarsByLevel],
  );

  const totalChallengeStars = useMemo(() => {
    progressVersion;
    return Object.values(challengeStarsByLevel).reduce((sum, s) => sum + (Number(s) || 0), 0);
  }, [challengeStarsByLevel, progressVersion]);

  const startLevel = (nextLevel: Level3D) => {
    if (usage.limitReached) return;
    playSound('click');
    setLevel(nextLevel);
    setActiveChapter(chapterOfLevel(nextLevel.id));
    setScreen('mission');
    setHint(nextLevel.mission);
  };

  const enterDriving = () => {
    resetControls();
    setSpeed(0);
    setElapsedSeconds(0);
    setCheckpointPassed(0);
    setPaused(false);
    setStartedAt(Date.now());
    // v1.7: 清空 telemetry
    setTelemetry(null);
    if (telemetryRef.current) {
      telemetryRef.current.elapsedTime = 0;
      telemetryRef.current.collisions = 0;
      telemetryRef.current.offRoadTime = 0;
      telemetryRef.current.checkpointPassed = 0;
      telemetryRef.current.brakeCount = 0;
      telemetryRef.current.maxSpeed = 0;
      telemetryRef.current.averageSpeed = 0;
      telemetryRef.current.parkingAccuracy = 0;
      telemetryRef.current.completed = false;
    }
    setScreen('playing');
    playSound('engine');
    // v11 hotfix：解锁 iOS 语音 + 朗读关卡任务
    primeVoice();
    lastSpokenRef.current = { text: '', t: 0 };
    window.setTimeout(() => {
      speak(
        selectedMode === 'challenge'
          ? `挑战模式开始。目标 ${challengeConfig?.targetTime ?? 30} 秒，加油！`
          : `小司机准备出发啦。${level.mission}`,
      );
    }, 250);
  };

  const completeLevel = (
    starsFromScene: number,
    playSeconds: number,
    finalTelemetry?: DrivingTelemetry,
  ) => {
    // v1.7: 普通模式仍走 starsFromScene；挑战模式根据 telemetry 算
    let actualStars: 1 | 2 | 3 = starsFromScene as 1 | 2 | 3;
    if (selectedMode === 'challenge' && challengeConfig && finalTelemetry) {
      actualStars = scoreChallenge(finalTelemetry, challengeConfig, level);
      // 挑战模式记录到 challenge progress（独立于普通进度）
      updateChallengeProgress(
        'driving3d',
        level.id,
        actualStars,
        finalTelemetry.elapsedTime,
        finalTelemetry.collisions,
      );
    }
    setLastStars(actualStars);
    setTelemetry(finalTelemetry ?? telemetry);

    usage.addUsage(playSeconds);
    // 普通进度始终更新（即便挑战模式也算"通过过这关"）
    updateLevelProgress('driving3d', level.id, actualStars);

    const nextLevelId = getNextLevelId(level.id);
    const nextSessionLevels = sessionLevels + 1;
    setPendingNextLevelId(nextLevelId);
    setShouldRestBeforeNext(nextLevelId !== null && nextSessionLevels >= config.restAfterLevels);
    addLearningRecord({
      gameId: 'driving3d',
      level: level.id,
      learningGoal: level.learningGoal,
      summary: level.summary,
    });
    setSessionLevels(nextSessionLevels);
    setProgressVersion((value) => value + 1);

    // 章节末关：颁发章节贴纸
    if (isChapterEndLevel(level.id)) {
      const ch = chapterOfLevel(level.id);
      const sticker = awardSticker(ch.stickerId);
      if (sticker) setChapterStickerJustUnlocked(ch.stickerId);
    } else {
      setChapterStickerJustUnlocked(null);
    }

    setScreen('complete');
    // v11 hotfix：通关语音
    window.setTimeout(() => {
      speak(
        selectedMode === 'challenge'
          ? actualStars === 3
            ? '太厉害了，三颗星！'
            : `完成第 ${level.id} 关，再挑战一次拿三星！`
          : `做得好，完成第 ${level.id} 关啦！`,
      );
    }, 200);
  };

  const goNext = () => {
    if (shouldRestBeforeNext) {
      setSessionLevels(0);
      setShouldRestBeforeNext(false);
      setScreen('rest');
      return;
    }
    if (pendingNextLevelId === null) {
      // 已经是 100 关，回汽车城
      setScreen('storymap');
      return;
    }
    startLevel(getLevel3D(pendingNextLevelId));
  };

  const toggleSound = () => {
    const next = toggleMuted();   // next === true 表示静音
    setMuted(next);
    setVoiceEnabled(!next);       // v11 hotfix：与音效同步开关
    if (!next) playSound('click');
  };

  const saveParentConfig = (next: ParentConfig) => {
    const normalized = normalizeConfig(next);
    setConfig(normalized);
    // 如果家长把挑战模式关掉，且当前模式是挑战，自动切回普通
    if (!normalized.challengeEnabled && selectedMode === 'challenge') {
      setSelectedMode('easy');
      saveSelectedMode('easy');
    }
    usage.refresh();
    setScreen('storymap');
  };

  // v1.7: 切换模式
  const switchMode = (mode: DrivingMode) => {
    if (mode === 'challenge' && config.challengeEnabled === false) return;
    setSelectedMode(mode);
    saveSelectedMode(mode);
    playSound('click');
  };

  const currentChapter = chapterOfLevel(unlockedLevel);
  const challengeAvailable = config.challengeEnabled !== false;

  // v1.8: 当前关卡对应的剧情任务
  const currentMission = useMemo(() => getStoryMission(level.id), [level.id]);
  // v1.8: 章节完成数 map（地图上的勾标识用）
  const chapterCompletionMap = useMemo<Record<number, number>>(() => {
    const out: Record<number, number> = {};
    for (const ch of CHAPTERS_3D) {
      out[ch.id] = chapterProgress[ch.id]?.completed ?? 0;
    }
    return out;
  }, [chapterProgress]);

  return (
    <main className="game3d-page">
      {/* v1.8: 汽车城地图 - 新主入口 */}
      {screen === 'storymap' && (
        <StoryMap
          unlockedLevel={unlockedLevel}
          currentChapterId={currentChapter.id}
          chapterCompletion={chapterCompletionMap}
          selectedCar={selectedCar}
          totalChallengeStars={totalChallengeStars}
          challengeAvailable={challengeAvailable}
          drivingMode={selectedMode}
          dailyMinutes={config.dailyMinutes}
          usedSeconds={usage.usage.seconds}
          onPickActiveMission={() => startLevel(getLevel3D(unlockedLevel))}
          onPickLocation={(chapterId) => {
            const chapter = CHAPTERS_3D[chapterId - 1];
            if (chapter) {
              setActiveChapter(chapter);
              setScreen('levels');
            }
          }}
          onSwitchMode={switchMode}
          onChapters={() => setScreen('chapters')}
          onGarage={() => setScreen('garage')}
          onStickers={() => setScreen('stickers')}
          onParent={() => setScreen('parent')}
        />
      )}

      {screen === 'home' && (
        <section className="game3d-home">
          <div className="game3d-home-top">
            <div>
              <h1>小小汽车 3D 驾驶</h1>
              <p>今日已玩 {Math.floor(usage.usage.seconds / 60)} / {config.dailyMinutes} 分钟 · 第 {unlockedLevel} / {LEVELS_3D.length} 关</p>
            </div>
            <strong>{currentChapter.emoji} 第 {currentChapter.id} 章</strong>
          </div>

          <div className="game3d-garage-preview">
            <div className="game3d-preview-road" />
            <div className="game3d-preview-car"><span /></div>
          </div>

          {/* v1.7: 模式切换（仅当家长允许挑战模式时显示） */}
          {challengeAvailable && (
            <div className="game3d-mode-switch" role="tablist" aria-label="选择模式">
              <button
                role="tab"
                type="button"
                aria-selected={selectedMode === 'easy'}
                className={`game3d-mode-tab ${selectedMode === 'easy' ? 'is-active' : ''}`}
                onClick={() => switchMode('easy')}
              >
                <span className="mode-emoji">🎈</span>
                <span className="mode-name">轻松练习</span>
                <small>5-7 岁</small>
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={selectedMode === 'challenge'}
                className={`game3d-mode-tab ${selectedMode === 'challenge' ? 'is-active' : ''}`}
                onClick={() => switchMode('challenge')}
              >
                <span className="mode-emoji">🏆</span>
                <span className="mode-name">挑战闯关</span>
                <small>8-10 岁 · ⭐ {totalChallengeStars}/300</small>
              </button>
            </div>
          )}

          <div className="game3d-home-actions">
            <button
              className={`game3d-primary ${selectedMode === 'challenge' ? 'game3d-primary-challenge' : ''}`}
              onClick={() => startLevel(getLevel3D(unlockedLevel))}
              disabled={usage.limitReached}
              type="button"
            >
              {usage.limitReached
                ? '今天任务完成啦'
                : selectedMode === 'challenge'
                ? `🏆 挑战第 ${unlockedLevel} 关`
                : `继续第 ${unlockedLevel} 关`}
            </button>
            <button onClick={() => setScreen('chapters')} type="button">章节选关</button>
            <button onClick={() => setScreen('garage')} type="button">
              {selectedCar.emoji} 我的车库
            </button>
            <button onClick={() => setScreen('stickers')} type="button">贴纸册</button>
            <button
              onPointerDown={(event) => {
                const target = event.currentTarget;
                const timer = window.setTimeout(() => setScreen('parent'), 850);
                const clear = () => window.clearTimeout(timer);
                target.addEventListener('pointerup', clear, { once: true });
                target.addEventListener('pointerleave', clear, { once: true });
              }}
              type="button"
            >
              家长设置 长按
            </button>
          </div>

          {/* 简化首页：只展示当前章节 + 下一章节卡片 */}
          <div className="game3d-chapter-strip">
            {[currentChapter.id, currentChapter.id + 1]
              .filter((id) => id >= 1 && id <= 10)
              .map((id) => {
                const ch = CHAPTERS_3D[id - 1];
                const prog = chapterProgress[id] ?? { completed: 0, totalStars: 0 };
                const firstLevel = (id - 1) * 10 + 1;
                const lockedHere = unlockedLevel < firstLevel;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={lockedHere}
                    onClick={() => { setActiveChapter(ch); setScreen('levels'); }}
                  >
                    <span>{ch.emoji} 第 {ch.id} 章</span>
                    <small>{ch.title} · {prog.completed}/10</small>
                  </button>
                );
              })}
          </div>
        </section>
      )}

      {screen === 'chapters' && (
        <ChapterSelect
          unlockedLevel={unlockedLevel}
          progress={chapterProgress}
          mode={selectedMode}
          onSelect={(ch) => { setActiveChapter(ch); setScreen('levels'); }}
          onBack={() => setScreen('storymap')}
        />
      )}

      {screen === 'levels' && (
        <LevelSelectChapter
          chapter={activeChapter}
          unlockedLevel={unlockedLevel}
          starsByLevel={starsByLevel}
          mode={selectedMode}
          challengeStarsByLevel={challengeStarsByLevel}
          onPick={(id) => startLevel(getLevel3D(id))}
          onBack={() => setScreen('chapters')}
        />
      )}

      {screen === 'mission' && (
        <MissionIntro
          level={level}
          mission={currentMission}
          mode={selectedMode}
          challengeConfig={challengeConfig}
          onStart={enterDriving}
          onBack={() => setScreen('storymap')}
        />
      )}

      {screen === 'playing' && (
        <section className="game3d-play">
          <DrivingScene
            level={level}
            controls={controls}
            controlsRef={controlsRef}
            car={selectedCar}
            paused={paused}
            telemetryRef={telemetryRef as RefObject<DrivingTelemetry>}
            onSpeedChange={setSpeed}
            onCheckpointChange={setCheckpointPassed}
            onHint={setHint}
            onComplete={completeLevel}
            onTelemetryChange={selectedMode === 'challenge' ? handleTelemetryChange : undefined}
            onDebugChange={import.meta.env.DEV ? setDrivingDebug : undefined}
          />
          {import.meta.env.DEV && <DebugDrivingHud debug={drivingDebug} />}
          <GameHUD
            level={level}
            speed={speed}
            elapsedSeconds={elapsedSeconds}
            checkpointPassed={checkpointPassed}
            muted={muted}
            mode={selectedMode}
            challengeConfig={challengeConfig}
            telemetry={telemetry}
            onPause={() => setPaused((value) => !value)}
            onToggleMute={toggleSound}
            onHome={() => setScreen('storymap')}
          />
          <div className="game3d-hint">{hint}</div>
          <VirtualControls controls={controls} setControl={setControl} />
          {paused && (
            <div className="game3d-overlay">
              <section className="game3d-complete-card">
                <h1>暂停</h1>
                <button className="game3d-primary" onClick={() => setPaused(false)} type="button">继续驾驶</button>
                <button onClick={() => setScreen('storymap')} type="button">回汽车城</button>
              </section>
            </div>
          )}
        </section>
      )}

      {screen === 'complete' && (() => {
        // v11 hotfix：根据 level.id 计算通关页模式
        const isFinal = level.id >= LEVELS_3D.length;
        const isChapterEnd = level.id % 10 === 0 && !isFinal;
        const completion = isFinal ? 'final' : isChapterEnd ? 'chapter-end' : 'regular';
        const nextChapter = isChapterEnd
          ? CHAPTERS_3D[Math.floor(level.id / 10)] ?? null  // L10 → idx 1 = ch2
          : null;
        return (
          <MissionComplete
            level={level}
            mission={currentMission}
            stars={lastStars}
            completion={completion}
            drivingMode={selectedMode}
            challengeConfig={challengeConfig}
            telemetry={telemetry}
            chapterStickerId={chapterStickerJustUnlocked}
            nextChapter={nextChapter}
            onNext={goNext}
            onRetry={() => startLevel(level)}
            onMap={() => setScreen('storymap')}
            onChapters={() => setScreen('chapters')}
          />
        );
      })()}

      {screen === 'parent' && (
        <ParentSettings config={config} onSave={saveParentConfig} onBack={() => setScreen('storymap')} />
      )}
      {screen === 'stickers' && <StickerBook onBack={() => setScreen('storymap')} />}
      {screen === 'garage' && (
        <GaragePage
          unlockedLevel={unlockedLevel}
          selectedCarId={selectedCarId}
          onBack={() => setScreen('storymap')}
          onSelect={(id) => {
            setSelectedCarId(id);
            setScreen('storymap');
          }}
        />
      )}
      {screen === 'rest' && (
        <RestPage
          onDone={() => setScreen('storymap')}
          onContinue={() => {
            const nextId = Math.min(LEVELS_3D.length, level.id + 1);
            startLevel(getLevel3D(nextId));
          }}
        />
      )}
    </main>
  );
}
