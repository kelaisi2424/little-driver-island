import { useState } from 'react';
import { getMuted, playSound, setMuted } from '../utils/sound';

export function useSound() {
  const [muted, setMutedState] = useState(() => getMuted());

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playSound('click');
  };

  return {
    muted,
    toggle,
    playSound,
  };
}
