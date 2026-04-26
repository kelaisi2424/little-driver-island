import { useEffect, useRef } from 'react';

export function useGameLoop(
  callback: (deltaMs: number) => void,
  running: boolean,
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!running) return undefined;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(40, now - last);
      last = now;
      callbackRef.current(delta);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [running]);
}
