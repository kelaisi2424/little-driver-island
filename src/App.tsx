import { useEffect, useState } from 'react';
import type { GameCompletePayload, GameId, ParentConfig, Screen } from './types';
import { loadConfig, saveConfig } from './utils/storage';
import { setVoiceEnabled } from './utils/speech';
import { awardSticker, type Sticker } from './utils/stickers';
import { useDailyLimit } from './hooks/useDailyLimit';
import { getGameDefinition } from './data/games';
import HomeGameBox from './components/HomeGameBox';
import ResultPage from './components/ResultPage';
import ParentSettings from './components/ParentSettings';
import StickerBook from './components/StickerBook';
import ObstacleDriveGame from './games/ObstacleDriveGame';
import ParkingPuzzleGame from './games/ParkingPuzzleGame';
import TrafficLightGame from './games/TrafficLightGame';
import CarWashGame from './games/CarWashGame';
import BusPickupGame from './games/BusPickupGame';
import RepairGarageGame from './games/RepairGarageGame';

const DEFAULT_CONFIG: ParentConfig = {
  totalTasks: 4,
  reminder: '眼睛休息一下，去喝口水，看看远处吧。',
  voiceEnabled: true,
  dailyLimit: 3,
};

function normalizeConfig(config: ParentConfig): ParentConfig {
  return {
    ...config,
    totalTasks: Math.min(5, Math.max(3, config.totalTasks)),
    dailyLimit: Math.min(3, Math.max(1, config.dailyLimit)),
  };
}

function loadInitialConfig(): ParentConfig {
  return normalizeConfig({ ...DEFAULT_CONFIG, ...(loadConfig() ?? {}) });
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('box');
  const [config, setConfigState] = useState<ParentConfig>(loadInitialConfig);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [lastResult, setLastResult] = useState<GameCompletePayload | null>(null);
  const [newSticker, setNewSticker] = useState<Sticker | null>(null);
  const daily = useDailyLimit(config.dailyLimit);

  useEffect(() => {
    saveConfig(config);
    setVoiceEnabled(config.voiceEnabled);
  }, [config]);

  const updateConfig = (next: ParentConfig) => {
    setConfigState(normalizeConfig(next));
  };

  const startGame = (gameId: GameId) => {
    if (daily.limitReached) return;
    setActiveGame(gameId);
    setLastResult(null);
    setNewSticker(null);
    setScreen('game');
  };

  const completeGame = (payload: GameCompletePayload) => {
    setLastResult(payload);
    setNewSticker(awardSticker(payload.stickerId));
    daily.countFinishedRound();
    setScreen('result');
  };

  const renderGame = () => {
    const props = { onComplete: completeGame };
    switch (activeGame) {
      case 'obstacle-drive':
        return <ObstacleDriveGame {...props} />;
      case 'parking-puzzle':
        return <ParkingPuzzleGame {...props} />;
      case 'traffic-light':
        return <TrafficLightGame {...props} />;
      case 'car-wash':
        return <CarWashGame {...props} />;
      case 'bus-pickup':
        return <BusPickupGame {...props} />;
      case 'repair-garage':
        return <RepairGarageGame {...props} />;
      default:
        return null;
    }
  };

  const goBox = () => {
    daily.refresh();
    setScreen('box');
  };

  return (
    <div className="app">
      {screen === 'box' && (
        <HomeGameBox
          config={config}
          todayCount={daily.todayCount}
          limitReached={daily.limitReached}
          onStartGame={startGame}
          onParent={() => setScreen('parent')}
          onStickers={() => setScreen('stickers')}
        />
      )}
      {screen === 'game' && (
        <>
          <button
            className="game-exit-btn"
            onClick={goBox}
            type="button"
            aria-label="关闭游戏，返回游戏盒"
          >
            ✕
          </button>
          {renderGame()}
        </>
      )}
      {screen === 'result' && (
        <ResultPage
          game={lastResult ? getGameDefinition(lastResult.gameId) ?? null : null}
          stars={lastResult?.stars ?? 0}
          sticker={newSticker}
          limitReached={daily.limitReached}
          onBack={goBox}
          onReplay={() => {
            daily.refresh();
            if (activeGame && !daily.limitReached) startGame(activeGame);
          }}
        />
      )}
      {screen === 'parent' && (
        <ParentSettings
          config={config}
          onSave={updateConfig}
          onBack={goBox}
        />
      )}
      {screen === 'stickers' && (
        <StickerBook onBack={goBox} />
      )}
    </div>
  );
}
