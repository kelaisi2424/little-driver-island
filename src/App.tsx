// 主流程：home → play → complete → (rest 每 N 关) → home / 下一关
// 配套页面：level-select / parent / stickers / minigames

import { useEffect, useMemo, useState } from 'react';
import type {
  ParentConfig,
  PlayCompletePayload,
  PlayLevel,
  PlayProgress,
  Screen,
} from './types';
import { PLAY_LEVELS, TOTAL_LEVELS, getPlayLevel } from './data/playLevels';
import { useDailyUsage } from './hooks/useDailyUsage';
import { setVoiceEnabled } from './utils/speech';
import {
  addLearningRecord,
  loadConfig,
  loadProgress,
  saveConfig,
  updateLevelProgress,
} from './utils/storage';
import { awardSticker, type Sticker } from './utils/stickers';
import HomePage from './components/HomePage';
import LevelSelect from './components/LevelSelect';
import LevelComplete from './components/LevelComplete';
import RestPage from './components/RestPage';
import ParentSettings from './components/ParentSettings';
import StickerBook from './components/StickerBook';
import MinigamesPage from './components/MinigamesPage';
import DrivingLevel from './game/DrivingLevel';

const DEFAULT_CONFIG: ParentConfig = {
  voiceEnabled: true,
  dailyMinutes: 15,
  restAfterLevels: 5,
  reminder: '眼睛休息一下，去喝口水，看看远处吧。',
};

function normalizeConfig(input: Partial<ParentConfig>): ParentConfig {
  const merged = { ...DEFAULT_CONFIG, ...input };
  return {
    ...merged,
    dailyMinutes: [10, 15, 20].includes(merged.dailyMinutes) ? merged.dailyMinutes : 15,
    restAfterLevels: [3, 5, 8].includes(merged.restAfterLevels) ? merged.restAfterLevels : 5,
  };
}

function loadInitialConfig(): ParentConfig {
  return normalizeConfig(loadConfig() ?? {});
}

function loadPlayProgress(): PlayProgress {
  const all = loadProgress();
  const rec = all.driving;
  return {
    currentLevel: Math.min(TOTAL_LEVELS, rec?.currentLevel ?? 1),
    stars: (rec?.stars as PlayProgress['stars']) ?? {},
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [config, setConfigState] = useState<ParentConfig>(loadInitialConfig);
  const [progressVersion, setProgressVersion] = useState(0);
  const [activeLevel, setActiveLevel] = useState<PlayLevel | null>(null);
  const [lastResult, setLastResult] = useState<PlayCompletePayload | null>(null);
  const [newSticker, setNewSticker] = useState<Sticker | null>(null);
  const [sessionLevels, setSessionLevels] = useState(0);
  const usage = useDailyUsage(config.dailyMinutes);

  useEffect(() => {
    saveConfig(config);
    setVoiceEnabled(config.voiceEnabled);
  }, [config]);

  // 每次状态变化时重新读 progress
  const progress = useMemo(() => loadPlayProgress(), [progressVersion]);

  const refreshProgress = () => setProgressVersion((v) => v + 1);

  const startLevel = (levelId: number) => {
    if (usage.limitReached) return;
    setActiveLevel(getPlayLevel(levelId));
    setNewSticker(null);
    setScreen('play');
  };

  const handleStartFromHome = () => {
    startLevel(progress.currentLevel);
  };

  const completeLevel = (payload: PlayCompletePayload) => {
    if (!activeLevel) return;
    usage.addUsage(payload.elapsedSeconds);
    updateLevelProgress('driving', payload.levelId, payload.stars);
    addLearningRecord({
      gameId: 'driving',
      level: payload.levelId,
      learningGoal: activeLevel.title,
      summary: activeLevel.summary,
    });
    setSessionLevels((v) => v + 1);
    setLastResult(payload);
    setNewSticker(activeLevel.stickerId ? awardSticker(activeLevel.stickerId) : null);
    refreshProgress();
    setScreen('complete');
  };

  const goNextFromComplete = () => {
    if (!lastResult || !activeLevel) {
      setScreen('home');
      return;
    }
    // 强制休息
    if (sessionLevels >= config.restAfterLevels) {
      setSessionLevels(0);
      setScreen('rest');
      return;
    }
    // 最后一关 → 回首页
    if (activeLevel.id >= TOTAL_LEVELS) {
      setScreen('home');
      return;
    }
    startLevel(activeLevel.id + 1);
  };

  const retryLevel = () => {
    if (!activeLevel) return;
    startLevel(activeLevel.id);
  };

  const saveParentConfig = (next: ParentConfig) => {
    setConfigState(normalizeConfig(next));
    usage.refresh();
    setScreen('home');
  };

  return (
    <div className="app driving-app">
      {screen === 'home' && (
        <HomePage
          nextLevelId={progress.currentLevel}
          totalLevels={TOTAL_LEVELS}
          usedSeconds={usage.usage.seconds}
          limitMinutes={config.dailyMinutes}
          completedLevels={usage.usage.completedLevels}
          limitReached={usage.limitReached}
          onStart={handleStartFromHome}
          onLevels={() => setScreen('level-select')}
          onStickers={() => setScreen('stickers')}
          onMinigames={() => setScreen('minigames')}
          onParent={() => setScreen('parent')}
        />
      )}

      {screen === 'level-select' && (
        <LevelSelect
          progress={progress}
          onPick={(id) => startLevel(id)}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'play' && activeLevel && (
        <DrivingLevel
          key={`${activeLevel.id}-${progressVersion}`}
          level={activeLevel}
          onComplete={completeLevel}
          onExit={() => {
            setSessionLevels(0);
            setScreen('home');
          }}
        />
      )}

      {screen === 'complete' && lastResult && activeLevel && (
        <LevelComplete
          level={activeLevel}
          result={lastResult}
          sticker={newSticker}
          needRest={sessionLevels >= config.restAfterLevels}
          isLastLevel={activeLevel.id >= TOTAL_LEVELS}
          onNext={goNextFromComplete}
          onRetry={retryLevel}
          onHome={() => {
            setSessionLevels(0);
            setScreen('home');
          }}
        />
      )}

      {screen === 'rest' && <RestPage onDone={() => setScreen('home')} />}

      {screen === 'parent' && (
        <ParentSettings
          config={config}
          onSave={saveParentConfig}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'stickers' && (
        <StickerBook onBack={() => setScreen('home')} />
      )}

      {screen === 'minigames' && (
        <MinigamesPage onBack={() => setScreen('home')} />
      )}

      {/* 兜底：如果 PLAY_LEVELS 为空（防御性）*/}
      {screen === 'home' && PLAY_LEVELS.length === 0 && (
        <div style={{ padding: 30, textAlign: 'center' }}>
          <p>关卡数据缺失，请检查 data/playLevels.ts</p>
        </div>
      )}
    </div>
  );
}
