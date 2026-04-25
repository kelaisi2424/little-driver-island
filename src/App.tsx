import { useEffect, useMemo, useState } from 'react';
import type { GameMode, ParentConfig, Screen, TaskType } from './types';
import { randomTaskSequence } from './utils/random';
import {
  getTodayCount,
  incrementPlayCount,
  loadConfig,
  reachedDailyLimit,
  saveConfig,
} from './utils/storage';
import { setVoiceEnabled } from './utils/speech';
import { awardNextSticker, type Sticker } from './utils/stickers';
import StartPage from './components/StartPage';
import RestPage from './components/RestPage';
import ParentSettings from './components/ParentSettings';
import GamePlay from './components/GamePlay';
import StickerBook from './components/StickerBook';

const DEFAULT_CONFIG: ParentConfig = {
  totalTasks: 5,
  reminder: '眼睛休息一下，去喝口水，看看远处吧。',
  voiceEnabled: true,
  dailyLimit: 3,
};

function loadInitialConfig(): ParentConfig {
  return { ...DEFAULT_CONFIG, ...(loadConfig() ?? {}) };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [config, setConfigState] = useState<ParentConfig>(loadInitialConfig);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [mode, setMode] = useState<GameMode>('game');
  const [stars, setStars] = useState(0);
  const [newSticker, setNewSticker] = useState<Sticker | null>(null);
  const [todayCount, setTodayCount] = useState<number>(() => getTodayCount());

  // 同步配置到 localStorage 与全局语音开关
  useEffect(() => {
    saveConfig(config);
    setVoiceEnabled(config.voiceEnabled);
  }, [config]);

  const limitReached = useMemo(
    () => reachedDailyLimit(config.dailyLimit),
    [config.dailyLimit, todayCount, screen],
  );

  const updateConfig = (next: ParentConfig) => {
    setConfigState(next);
  };

  const handleStart = (m: GameMode) => {
    if (reachedDailyLimit(config.dailyLimit)) return;
    const rec = incrementPlayCount();
    setTodayCount(rec.count);
    setMode(m);
    setTasks(randomTaskSequence(config.totalTasks));
    setStars(0);
    setNewSticker(null);
    setScreen('playing');
  };

  const handleAllComplete = (earned: number) => {
    setStars(earned);
    const sticker = awardNextSticker();
    setNewSticker(sticker);
    setScreen('rest');
  };

  return (
    <div className="app">
      {screen === 'start' && (
        <StartPage
          onStart={handleStart}
          onParent={() => setScreen('parent')}
          onStickers={() => setScreen('stickers')}
          limitReached={limitReached}
          todayCount={todayCount}
          dailyLimit={config.dailyLimit}
        />
      )}
      {screen === 'playing' && (
        <GamePlay
          tasks={tasks}
          mode={mode}
          onComplete={handleAllComplete}
          onExit={() => setScreen('start')}
        />
      )}
      {screen === 'rest' && (
        <RestPage
          stars={stars}
          totalTasks={config.totalTasks}
          reminder={config.reminder}
          newSticker={newSticker}
          limitReached={limitReached}
          onPlayAgain={() => handleStart(mode)}
          onExit={() => setScreen('start')}
          onStickers={() => setScreen('stickers')}
        />
      )}
      {screen === 'parent' && (
        <ParentSettings
          config={config}
          onSave={updateConfig}
          onBack={() => {
            setTodayCount(getTodayCount());
            setScreen('start');
          }}
        />
      )}
      {screen === 'stickers' && (
        <StickerBook onBack={() => setScreen('start')} />
      )}
    </div>
  );
}
