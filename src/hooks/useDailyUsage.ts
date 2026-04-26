import { useMemo, useState } from 'react';
import {
  addDailyUsage,
  getDailyUsage,
  resetDailyUsage,
} from '../utils/storage';

export function useDailyUsage(limitMinutes: number) {
  const [usage, setUsage] = useState(() => getDailyUsage());
  const limitSeconds = limitMinutes * 60;

  const limitReached = useMemo(
    () => usage.seconds >= limitSeconds,
    [limitSeconds, usage.seconds],
  );

  const addUsage = (seconds: number) => {
    const next = addDailyUsage(seconds);
    setUsage(next);
    return next;
  };

  const refresh = () => setUsage(getDailyUsage());

  const reset = () => {
    resetDailyUsage();
    refresh();
  };

  return {
    usage,
    limitSeconds,
    limitReached,
    addUsage,
    refresh,
    reset,
  };
}
