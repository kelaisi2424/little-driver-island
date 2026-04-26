import type React from 'react';
import type { DrivingControlKey, DrivingControls } from '../../three/useDrivingControls';

interface VirtualControlsProps {
  controls: DrivingControls;
  setControl: (key: DrivingControlKey, pressed: boolean) => void;
}

const buttonGroups: Array<Array<{ key: DrivingControlKey; icon: string; label: string; className: string }>> = [
  [
    { key: 'left', icon: '←', label: '左转', className: 'steer' },
    { key: 'right', icon: '→', label: '右转', className: 'steer' },
  ],
  [
    { key: 'throttle', icon: '▲', label: '油门', className: 'gas' },
    { key: 'brake', icon: '■', label: '刹车', className: 'brake' },
  ],
];

export default function VirtualControls({ controls, setControl }: VirtualControlsProps) {
  const bind = (key: DrivingControlKey) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setControl(key, true);
    },
    onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setControl(key, false);
    },
    onPointerLeave: () => setControl(key, false),
    onPointerCancel: () => setControl(key, false),
  });

  return (
    <div className="game3d-controls">
      {buttonGroups.map((group, groupIndex) => (
        <div className="game3d-control-group" key={groupIndex}>
          {group.map((button) => (
            <button
              key={button.key}
              className={`game3d-control ${button.className} ${controls[button.key] ? 'pressed' : ''}`}
              type="button"
              aria-label={button.label}
              {...bind(button.key)}
            >
              <span>{button.icon}</span>
              <small>{button.label}</small>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
