import { useEffect, useMemo, useState } from 'react';
import { LEVELS_3D, getLevel3D, type Level3D } from '../../data/levels3d';
import { useDailyUsage } from '../../hooks/useDailyUsage';
import type { ParentConfig } from '../../types';
import { setVoiceEnabled } from '../../utils/speech';
import { getMuted, playSound, toggleMuted } from '../../utils/sound';
import {
  addLearningRecord,
  loadConfig,
  loadProgress,
  saveConfig,
  updateLevelProgress,
} from '../../utils/storage';
import DrivingScene from '../../three/DrivingScene';
import { useDrivingControls } from '../../three/useDrivingControls';
import ParentSettings from '../ParentSettings';
import RestPage from '../RestPage';
import StickerBook from '../StickerBook';
import GameHUD from './GameHUD';
import LevelComplete3D from './LevelComplete3D';
import MissionCard from './MissionCard';
import VirtualControls from './VirtualControls';

type Game3DScreen = 'home' | 'mission' | 'playing' | 'complete' | 'parent' | 'stickers' | 'rest';

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

export default function Game3DPage() {
  const debugLandscape = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('debugLandscape');
  const [config, setConfig] = useState(() => normalizeConfig(loadConfig() ?? {}));
  const [screen, setScreen] = useState<Game3DScreen>('home');
  const [level, setLevel] = useState<Level3D>(() => getLevel3D(getUnlocked3DLevel()));
  const [progressVersion, setProgressVersion] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkpointPassed, setCheckpointPassed] = useState(0);
  const [hint, setHint] = useState('准备发车');
  const [muted, setMuted] = useState(getMuted);
  const [paused, setPaused] = useState(false);
  const [lastStars, setLastStars] = useState(3);
  const [sessionLevels, setSessionLevels] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
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

  const startLevel = (nextLevel: Level3D) => {
    if (usage.limitReached) return;
    playSound('click');
    setLevel(nextLevel);
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
    setScreen('complete');
  };

  const goNext = () => {
    if (sessionLevels >= config.restAfterLevels) {
      setSessionLevels(0);
      setScreen('rest');
      return;
    }
    startLevel(getLevel3D(Math.min(LEVELS_3D.length, level.id + 1)));
  };

  const toggleSound = () => {
    const next = toggleMuted();
    setMuted(next);
    if (!next) playSound('click');
  };

  const saveParentConfig = (next: ParentConfig) => {
    setConfig(normalizeConfig(next));
    usage.refresh();
    setScreen('home');
  };

  return (
    <main className={`game3d-page ${debugLandscape ? 'debug-landscape' : ''}`}>
      {screen === 'home' && (
        <section className="game3d-home">
          <div className="game3d-home-top">
            <div>
              <h1>小小汽车 3D 驾驶</h1>
              <p>今日已玩 {Math.floor(usage.usage.seconds / 60)} / {config.dailyMinutes} 分钟</p>
            </div>
            <strong>已到第 {unlockedLevel} 关</strong>
          </div>
          <div className="game3d-garage-preview">
            <div className="game3d-preview-road" />
            <div className="game3d-preview-car">
              <span />
            </div>
          </div>
          <div className="game3d-home-actions">
            <button
              className="game3d-primary"
              onClick={() => startLevel(getLevel3D(unlockedLevel))}
              disabled={usage.limitReached}
              type="button"
            >
              {usage.limitReached ? '今天任务完成啦' : '开始驾驶'}
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
          <div className="game3d-level-strip">
            {LEVELS_3D.map((item) => (
              <button
                key={item.id}
                disabled={item.id > unlockedLevel}
                onClick={() => startLevel(item)}
                type="button"
              >
                <span>第 {item.id} 关</span>
                <small>{item.name}</small>
              </button>
            ))}
          </div>
        </section>
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
          onNext={goNext}
          onRetry={() => startLevel(level)}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'parent' && (
        <ParentSettings config={config} onSave={saveParentConfig} onBack={() => setScreen('home')} />
      )}
      {screen === 'stickers' && <StickerBook onBack={() => setScreen('home')} />}
      {screen === 'rest' && <RestPage onDone={() => setScreen('home')} />}
    </main>
  );
}
