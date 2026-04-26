import { useMemo, useState } from 'react';
import {
  getTodayCount,
  incrementPlayCount,
  reachedDailyLimit,
} from '../utils/storage';

export function useDailyLimit(limit: number) {
  const [todayCount, setTodayCount] = useState(() => getTodayCount());

  const limitReached = useMemo(
    () => reachedDailyLimit(limit),
    [limit, todayCount],
  );

  const refresh = () => setTodayCount(getTodayCount());

  const countFinishedRound = () => {
    const next = incrementPlayCount();
    setTodayCount(next.count);
    return next.count;
  };

  return {
    todayCount,
    limitReached,
    refresh,
    countFinishedRound,
  };
}
