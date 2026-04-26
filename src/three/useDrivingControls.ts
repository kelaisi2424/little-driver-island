import { useCallback, useMemo, useRef, useState } from 'react';

export interface DrivingControls {
  left: boolean;
  right: boolean;
  throttle: boolean;
  brake: boolean;
}

export type DrivingControlKey = keyof DrivingControls;

const EMPTY_CONTROLS: DrivingControls = {
  left: false,
  right: false,
  throttle: false,
  brake: false,
};

export function useDrivingControls() {
  const controlsRef = useRef<DrivingControls>({ ...EMPTY_CONTROLS });
  const [controls, setControls] = useState<DrivingControls>(EMPTY_CONTROLS);

  const setControl = useCallback((key: DrivingControlKey, pressed: boolean) => {
    controlsRef.current = { ...controlsRef.current, [key]: pressed };
    setControls(controlsRef.current);
  }, []);

  const resetControls = useCallback(() => {
    controlsRef.current = { ...EMPTY_CONTROLS };
    setControls(controlsRef.current);
  }, []);

  return useMemo(
    () => ({ controls, controlsRef, setControl, resetControls }),
    [controls, resetControls, setControl],
  );
}
