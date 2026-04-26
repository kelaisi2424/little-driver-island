import { useEffect, useMemo, useState } from 'react';
import type {
  CarDefinition,
  CarId,
  DrivingCompletePayload,
  DrivingLevel,
  DrivingScreen,
  ParentConfig,
} from './types';
import { getCar } from './data/cars';
import { DRIVING_LEVELS, getDrivingLevel } from './data/levels';
import { useDailyUsage } from './hooks/useDailyUsage';
import { setVoiceEnabled, speak } from './utils/speech';
import { getMuted, playSound, toggleMuted } from './utils/sound';
import {
  addLearningRecord,
  loadConfig,
  loadProgress,
  saveConfig,
  updateLevelProgress,
} from './utils/storage';
import { awardSticker, type Sticker } from './utils/stickers';
import { EMPTY_CONTROLS, type ControlState } from './game/physics';
import GarageHome from './components/GarageHome';
import CarSelect from './components/CarSelect';
import LevelSelect from './components/LevelSelect';
import MissionPopup from './components/MissionPopup';
import GameHUD from './components/GameHUD';
import ControlPad from './components/ControlPad';
import DrivingCanvas from './game/DrivingCanvas';
import LevelComplete from './components/LevelComplete';
import RestPage from './components/RestPage';
import ParentSettings from './components/ParentSettings';
import StickerBook from './components/StickerBook';

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

function loadInitialConfig(): ParentConfig {
  return normalizeConfig(loadConfig() ?? {});
}

function getUnlockedLevel(): number {
  const progress = loadProgress();
  return Math.min(DRIVING_LEVELS.length, progress.driving?.currentLevel ?? 1);
}

export default function App() {
  const [screen, setScreen] = useState<DrivingScreen>('garage');
  const [config, setConfig] = useState<ParentConfig>(loadInitialConfig);
  const [selectedCarId, setSelectedCarId] = useState<CarId>('red-car');
  const [activeLevel, setActiveLevel] = useState<DrivingLevel>(() => getDrivingLevel(getUnlockedLevel()));
  const [progressVersion, setProgressVersion] = useState(0);
  const [result, setResult] = useState<DrivingCompletePayload | null>(null);
  const [newSticker, setNewSticker] = useState<Sticker | null>(null);
  const [controls, setControls] = useState<ControlState>(EMPTY_CONTROLS);
  const [speed, setSpeed] = useState(0);
  const [stars, setStars] = useState(0);
  const [muted, setMuted] = useState(getMuted);
  const [paused, setPaused] = useState(false);
  const [sessionLevels, setSessionLevels] = useState(0);
  const usage = useDailyUsage(config.dailyMinutes);

  useEffect(() => {
    saveConfig(config);
    setVoiceEnabled(config.voiceEnabled);
  }, [config]);

  const selectedCar = getCar(selectedCarId);
  const progress = useMemo(() => loadProgress(), [progressVersion]);
  const currentLevel = Math.min(DRIVING_LEVELS.length, progress.driving?.currentLevel ?? 1);
  const nextLevel = getDrivingLevel(currentLevel);

  const refreshProgress = () => setProgressVersion((value) => value + 1);

  const selectCar = (car: CarDefinition) => {
    playSound('click');
    setSelectedCarId(car.id);
    setScreen('garage');
  };

  const startLevel = (level: DrivingLevel) => {
    if (usage.limitReached) return;
    playSound('click');
    setActiveLevel(level);
    setStars(0);
    setSpeed(0);
    setControls(EMPTY_CONTROLS);
    setPaused(false);
    setScreen('mission');
    if (config.voiceEnabled && level.id === 1) {
      speak('按住油门，方向键转弯。');
    }
  };

  const completeLevel = (payload: DrivingCompletePayload) => {
    usage.addUsage(payload.elapsedSeconds);
    updateLevelProgress('driving', payload.level.id, payload.stars);
    addLearningRecord({
      gameId: 'driving',
      level: payload.level.id,
      learningGoal: payload.level.learningGoal,
      summary: payload.level.summary,
    });
    setSessionLevels((value) => value + 1);
    setResult(payload);
    setNewSticker(payload.level.stickerId ? awardSticker(payload.level.stickerId) : null);
    refreshProgress();
    setScreen('complete');
  };

  const nextFromComplete = () => {
    if (!result) {
      setScreen('garage');
      return;
    }
    if (sessionLevels >= config.restAfterLevels) {
      setSessionLevels(0);
      setScreen('rest');
      return;
    }
    const nextId = Math.min(DRIVING_LEVELS.length, result.level.id + 1);
    startLevel(getDrivingLevel(nextId));
  };

  const setControl = (key: keyof ControlState, pressed: boolean) => {
    setControls((value) => ({ ...value, [key]: pressed }));
  };

  const toggleSound = () => {
    const next = toggleMuted();
    setMuted(next);
    if (!next) playSound('click');
  };

  const saveParentConfig = (next: ParentConfig) => {
    setConfig(normalizeConfig(next));
    usage.refresh();
    setScreen('garage');
  };

  return (
    <div className="app driving-app">
      <div className="portrait-rotate">
        <div className="rotate-card">
          <div>📱➡️</div>
          <h1>请把手机横过来</h1>
          <p>小司机准备出发啦！</p>
        </div>
      </div>

      <div className="driving-master">
        {screen === 'garage' && (
          <GarageHome
            car={selectedCar}
            nextLevel={nextLevel}
            usedSeconds={usage.usage.seconds}
            limitSeconds={usage.limitSeconds}
            completedLevels={usage.usage.completedLevels}
            limitReached={usage.limitReached}
            onStart={() => startLevel(nextLevel)}
            onLevels={() => setScreen('level-select')}
            onCars={() => setScreen('car-select')}
            onStickers={() => setScreen('stickers')}
            onParent={() => setScreen('parent')}
          />
        )}

        {screen === 'car-select' && (
          <CarSelect
            selectedCarId={selectedCarId}
            onSelect={selectCar}
            onBack={() => setScreen('garage')}
          />
        )}

        {screen === 'level-select' && (
          <LevelSelect
            currentLevel={currentLevel}
            getStars={(levelId) => progress.driving?.stars[String(levelId)] ?? 0}
            onStartLevel={startLevel}
            onBack={() => setScreen('garage')}
          />
        )}

        {screen === 'mission' && (
          <MissionPopup
            level={activeLevel}
            onStart={() => {
              playSound('engine');
              setScreen('drive');
            }}
            onBack={() => setScreen('garage')}
          />
        )}

        {screen === 'drive' && (
          <main className="drive-screen">
            <GameHUD
              level={activeLevel}
              stars={stars}
              speed={speed}
              usedSeconds={usage.usage.seconds}
              muted={muted}
              onPause={() => setPaused((value) => !value)}
              onToggleMute={toggleSound}
            />
            <DrivingCanvas
              level={activeLevel}
              car={selectedCar}
              controls={controls}
              paused={paused}
              onSpeedChange={setSpeed}
              onStarsChange={setStars}
              onComplete={completeLevel}
            />
            <ControlPad controls={controls} setControl={setControl} />
            {paused && (
              <div className="pause-panel">
                <section>
                  <h2>暂停一下</h2>
                  <button className="master-start-btn" onClick={() => setPaused(false)} type="button">继续驾驶</button>
                  <button onClick={() => setScreen('garage')} type="button">回到车库</button>
                </section>
              </div>
            )}
          </main>
        )}

        {screen === 'complete' && result && (
          <LevelComplete
            result={result}
            sticker={newSticker}
            needRest={sessionLevels >= config.restAfterLevels}
            onNext={nextFromComplete}
            onRetry={() => startLevel(result.level)}
            onHome={() => setScreen('garage')}
          />
        )}

        {screen === 'rest' && <RestPage onDone={() => setScreen('garage')} />}

        {screen === 'parent' && (
          <ParentSettings
            config={config}
            onSave={saveParentConfig}
            onBack={() => setScreen('garage')}
          />
        )}

        {screen === 'stickers' && <StickerBook onBack={() => setScreen('garage')} />}
      </div>
    </div>
  );
}
