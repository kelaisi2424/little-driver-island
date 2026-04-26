// 3D 大启动按钮：可按下去的"游戏机按键"质感。

import type { ReactNode } from 'react';
import { playSound } from '../../utils/sound';

interface StartButton3DProps {
  emoji?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function StartButton3D({
  emoji = '🚗',
  title,
  subtitle,
  onClick,
  disabled,
}: StartButton3DProps) {
  const handleClick = () => {
    if (disabled) return;
    playSound('click');
    onClick?.();
  };

  return (
    <button
      className={`start-button-3d ${disabled ? 'is-disabled' : ''}`}
      onClick={handleClick}
      type="button"
    >
      <span className="sb-glow" aria-hidden />
      <span className="sb-emoji" aria-hidden>{emoji}</span>
      <span className="sb-text">
        <span className="sb-title">{title}</span>
        {subtitle && <span className="sb-sub">{subtitle}</span>}
      </span>
    </button>
  );
}
