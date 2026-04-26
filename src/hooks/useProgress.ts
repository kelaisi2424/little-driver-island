import { useState } from 'react';
import type { GameId } from '../types';
import {
  loadLearningRecords,
  loadProgress,
  updateLevelProgress,
} from '../utils/storage';

export function useProgress() {
  const [progress, setProgress] = useState(() => loadProgress());

  const completeLevel = (gameId: GameId, level: number, stars: number) => {
    setProgress(updateLevelProgress(gameId, level, stars));
  };

  const getCurrentLevel = (gameId: GameId) =>
    progress[gameId]?.currentLevel ?? 1;

  const getStars = (gameId: GameId, level: number) =>
    progress[gameId]?.stars[String(level)] ?? 0;

  const refresh = () => setProgress(loadProgress());

  return {
    progress,
    completeLevel,
    getCurrentLevel,
    getStars,
    learningRecords: loadLearningRecords(),
    refresh,
  };
}
