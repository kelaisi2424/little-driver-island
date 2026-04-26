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
  // v12 hotfix：iOS Safari 在 setPointerCapture 后仍会因为手指轻微移动出按钮边缘
  // 触发 pointerleave，导致油门一按就松。
  // 解决：去掉 pointerleave 释放，只在 pointerup / pointercancel / lostpointercapture 释放。
  // 同时手指即使滑出按钮，因为已 capture，pointer events 仍发到这个按钮，
  // 真正抬手时才会 pointerup，对孩子持续按住油门更友好。
  const bind = (key: DrivingControlKey) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* 忽略 */ }
      setControl(key, true);
    },
    onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setControl(key, false);
    },
    onPointerCancel: () => setControl(key, false),
    onLostPointerCapture: () => setControl(key, false),
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
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
