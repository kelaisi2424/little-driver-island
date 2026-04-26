import { useCallback, useMemo, useState } from 'react';

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
  const [controls, setControls] = useState<DrivingControls>(EMPTY_CONTROLS);

  const setControl = useCallback((key: DrivingControlKey, pressed: boolean) => {
    setControls((current) => ({ ...current, [key]: pressed }));
  }, []);

  const resetControls = useCallback(() => {
    setControls(EMPTY_CONTROLS);
  }, []);

  return useMemo(
    () => ({ controls, setControl, resetControls }),
    [controls, resetControls, setControl],
  );
}
