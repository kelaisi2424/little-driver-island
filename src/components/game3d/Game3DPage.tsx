import { useEffect, useMemo, useRef, useState } from 'react';
import { LEVELS_3D, getLevel3D, type Level3D } from '../../data/levels3d';
import { CHAPTERS_3D, chapterOfLevel, isChapterEndLevel, type Chapter3D } from '../../data/chapters3d';
import { useDailyUsage } from '../../hooks/useDailyUsage';
import type { ParentConfig } from '../../types';
import { primeVoice, setVoiceEnabled, speak } from '../../utils/speech';
import { getMuted, playSound, toggleMuted } from '../../utils/sound';
import {
  addLearningRecord,
  loadConfig,
  loadProgress,
  saveConfig,
  updateLevelProgress,
} from '../../utils/storage';
import { awardSticker } from '../../utils/stickers';
import DrivingScene from '../../three/DrivingScene';
import { useDrivingControls } from '../../three/useDrivingControls';
import ParentSettings from '../ParentSettings';
import RestPage from '../RestPage';
import StickerBook from '../StickerBook';
import GameHUD from './GameHUD';
import LevelComplete3D from './LevelComplete3D';
import MissionCard from './MissionCard';
import VirtualControls from './VirtualControls';
import ChapterSelect, { type ChapterProgress } from './ChapterSelect';
import LevelSelectChapter from './LevelSelectChapter';

type Game3DScreen =
  | 'home'
  | 'chapters'
  | 'levels'
  | 'mission'
  | 'playing'
  | 'complete'
  | 'parent'
  | 'stickers'
  | 'rest';

const DEFAULT_CONFIG: ParentConfig = {
  totalTasks: 5,
  reminder: '眼睛休息一下，去喝口水，看看远处吧。',
  voiceEnabled: true,
  dailyLimit: 3,
  dailyMinutes: 15,
  restAfterLevels: 5,
};

function normalizeConfig(config: Partial<ParentConfig>): ParentConfig {
  const merged = { ...DEFAULT_CONFIG, ...config };
  return {
    ...merged,
    dailyMinutes: [10, 15, 20].includes(merged.dailyMinutes) ? merged.dailyMinutes : 15,
    restAfterLevels: [3, 5, 8].includes(merged.restAfterLevels) ? merged.restAfterLevels : 5,
  };
}

function getUnlocked3DLevel() {
  const progress = loadProgress();
  return Math.min(LEVELS_3D.length, progress.driving3d?.currentLevel ?? 1);
}

function buildChapterProgress(starsByLevel: Record<string, number>): Record<number, ChapterProgress> {
  const out: Record<number, ChapterProgress> = {};
  for (const ch of CHAPTERS_3D) {
    let completed = 0;
    let totalStars = 0;
    for (let n = 1; n <= 10; n++) {
      const id = (ch.id - 1) * 10 + n;
      const stars = starsByLevel[String(id)] ?? 0;
      if (stars > 0) completed += 1;
      totalStars += stars;
    }
    out[ch.id] = { completed, totalStars };
  }
  return out;
}

export default function Game3DPage() {
  const [config, setConfig] = useState(() => normalizeConfig(loadConfig() ?? {}));
  const [screen, setScreen] = useState<Game3DScreen>('home');
  const [level, setLevel] = useState<Level3D>(() => getLevel3D(getUnlocked3DLevel()));
  const [activeChapter, setActiveChapter] = useState<Chapter3D>(() => chapterOfLevel(getUnlocked3DLevel()));
  const [progressVersion, setProgressVersion] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkpointPassed, setCheckpointPassed] = useState(0);
  const [hint, setHintRaw] = useState('准备发车');
  const lastSpokenRef = useRef<{ text: string; t: number }>({ text: '', t: 0 });
  // 防止同一句话短时间反复朗读
  const setHint = (text: string) => {
    setHintRaw(text);
    const now = Date.now();
    if (text && text !== lastSpokenRef.current.text && now - lastSpokenRef.current.t > 1500) {
      lastSpokenRef.current = { text, t: now };
      speak(text);
    }
  };
  const [muted, setMuted] = useState(getMuted);
  const [paused, setPaused] = useState(false);
  const [lastStars, setLastStars] = useState(3);
  const [sessionLevels, setSessionLevels] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [chapterStickerJustUnlocked, setChapterStickerJustUnlocked] = useState<string | null>(null);
  const { controls, setControl, resetControls } = useDrivingControls();
  const usage = useDailyUsage(config.dailyMinutes);

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

  const chapterProgress = useMemo(
    () => buildChapterProgress(starsByLevel),
    [starsByLevel],
  );

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
    setScreen('playing');
    playSound('engine');
    // v11 hotfix：解锁 iOS 语音 + 朗读关卡任务
    primeVoice();
    lastSpokenRef.current = { text: '', t: 0 };
    window.setTimeout(() => {
      speak(`小司机准备出发啦。${level.mission}`);
    }, 250);
  };

  const completeLevel = (stars: number, playSeconds: number) => {
    setLastStars(stars);
    usage.addUsage(playSeconds);
    updateLevelProgress('driving3d', level.id, stars);
    addLearningRecord({
      gameId: 'driving3d',
      level: level.id,
      learningGoal: level.learningGoal,
      summary: level.summary,
    });
    setSessionLevels((value) => value + 1);
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
      speak(`做得好，完成第 ${level.id} 关啦！`);
    }, 200);
  };

  const goNext = () => {
    if (sessionLevels >= config.restAfterLevels) {
      setSessionLevels(0);
      setScreen('rest');
      return;
    }
    const nextId = Math.min(LEVELS_3D.length, level.id + 1);
    if (nextId === level.id) {
      // 已经是 100 关，回首页
      setScreen('home');
      return;
    }
    startLevel(getLevel3D(nextId));
  };

  const toggleSound = () => {
    const next = toggleMuted();   // next === true 表示静音
    setMuted(next);
    setVoiceEnabled(!next);       // v11 hotfix：与音效同步开关
    if (!next) playSound('click');
  };

  const saveParentConfig = (next: ParentConfig) => {
    setConfig(normalizeConfig(next));
    usage.refresh();
    setScreen('home');
  };

  const currentChapter = chapterOfLevel(unlockedLevel);

  return (
    <main className="game3d-page">
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

          <div className="game3d-home-actions">
            <button
              className="game3d-primary"
              onClick={() => startLevel(getLevel3D(unlockedLevel))}
              disabled={usage.limitReached}
              type="button"
            >
              {usage.limitReached ? '今天任务完成啦' : `继续第 ${unlockedLevel} 关`}
            </button>
            <button onClick={() => setScreen('chapters')} type="button">章节选关</button>
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
          onSelect={(ch) => { setActiveChapter(ch); setScreen('levels'); }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'levels' && (
        <LevelSelectChapter
          chapter={activeChapter}
          unlockedLevel={unlockedLevel}
          starsByLevel={starsByLevel}
          onPick={(id) => startLevel(getLevel3D(id))}
          onBack={() => setScreen('chapters')}
        />
      )}

      {screen === 'mission' && (
        <MissionCard level={level} onStart={enterDriving} onBack={() => setScreen('home')} />
      )}

      {screen === 'playing' && (
        <section className="game3d-play">
          <DrivingScene
            level={level}
            controls={controls}
            paused={paused}
            onSpeedChange={setSpeed}
            onCheckpointChange={setCheckpointPassed}
            onHint={setHint}
            onComplete={completeLevel}
          />
          <GameHUD
            level={level}
            speed={speed}
            elapsedSeconds={elapsedSeconds}
            checkpointPassed={checkpointPassed}
            muted={muted}
            onPause={() => setPaused((value) => !value)}
            onToggleMute={toggleSound}
            onHome={() => setScreen('home')}
          />
          <div className="game3d-hint">{hint}</div>
          <VirtualControls controls={controls} setControl={setControl} />
          {paused && (
            <div className="game3d-overlay">
              <section className="game3d-complete-card">
                <h1>暂停</h1>
                <button className="game3d-primary" onClick={() => setPaused(false)} type="button">继续驾驶</button>
                <button onClick={() => setScreen('home')} type="button">回首页</button>
              </section>
            </div>
          )}
        </section>
      )}

      {screen === 'complete' && (
        <LevelComplete3D
          level={level}
          stars={lastStars}
          chapterStickerId={chapterStickerJustUnlocked}
          onNext={goNext}
          onRetry={() => startLevel(level)}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'parent' && (
        <ParentSettings config={config} onSave={saveParentConfig} onBack={() => setScreen('home')} />
      )}
      {screen === 'stickers' && <StickerBook onBack={() => setScreen('home')} />}
      {screen === 'rest' && (
        <RestPage
          onDone={() => setScreen('home')}
          onContinue={() => {
            const nextId = Math.min(LEVELS_3D.length, level.id + 1);
            startLevel(getLevel3D(nextId));
          }}
        />
      )}
    </main>
  );
}
