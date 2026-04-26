import type React from 'react';
import type { ControlState } from '../game/physics';

interface ControlPadProps {
  controls: ControlState;
  setControl: (key: keyof ControlState, pressed: boolean) => void;
}

const controlButtons: Array<{ key: keyof ControlState; label: string; icon: string; className: string }> = [
  { key: 'left', label: '左转', icon: '◀', className: 'left' },
  { key: 'right', label: '右转', icon: '▶', className: 'right' },
  { key: 'throttle', label: '油门', icon: '▲', className: 'throttle' },
  { key: 'brake', label: '刹车', icon: '■', className: 'brake' },
];

export default function ControlPad({ controls, setControl }: ControlPadProps) {
  const bind = (key: keyof ControlState) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setControl(key, true);
    },
    onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setControl(key, false);
    },
    onPointerCancel: () => setControl(key, false),
    onPointerLeave: () => setControl(key, false),
  });

  return (
    <div className="control-pad">
      <div className="turn-controls">
        {controlButtons.slice(0, 2).map((button) => (
          <button
            key={button.key}
            className={`drive-control ${button.className} ${controls[button.key] ? 'pressed' : ''}`}
            type="button"
            {...bind(button.key)}
          >
            <span className="control-icon">{button.icon}</span>
            <span>{button.label}</span>
          </button>
        ))}
      </div>
      <div className="pedal-controls">
        {controlButtons.slice(2).map((button) => (
          <button
            key={button.key}
            className={`drive-control ${button.className} ${controls[button.key] ? 'pressed' : ''}`}
            type="button"
            {...bind(button.key)}
          >
            <span className="control-icon">{button.icon}</span>
            <span>{button.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
