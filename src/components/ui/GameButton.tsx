// 小游戏风格按钮：渐变色、厚底阴影、按下凹陷、可选脉冲、可选呼吸 emoji。

import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { playSound } from '../../utils/sound';

export type GameButtonVariant = 'primary' | 'yellow' | 'blue' | 'green' | 'ghost';
export type GameButtonSize = 'lg' | 'md' | 'sm';

interface GameButtonProps {
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  emoji?: string;
  children: ReactNode;
  badge?: ReactNode;       // 右侧小标签（如 "第 3 关"）
  pulse?: boolean;         // 是否轻微脉冲
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: PointerEvent) => void;
  onPointerUp?: (e: PointerEvent) => void;
  onPointerCancel?: (e: PointerEvent) => void;
  onPointerLeave?: (e: PointerEvent) => void;
  style?: CSSProperties;
  ariaLabel?: string;
  type?: 'button' | 'submit';
}

export default function GameButton({
  variant = 'primary',
  size = 'md',
  emoji,
  children,
  badge,
  pulse = false,
  fullWidth = true,
  disabled = false,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  style,
  ariaLabel,
  type = 'button',
}: GameButtonProps) {
  const cls = [
    'gbtn',
    `gbtn-${variant}`,
    `gbtn-${size}`,
    pulse ? 'gbtn-pulse' : '',
    fullWidth ? 'gbtn-fullwidth' : '',
    disabled ? 'gbtn-disabled' : '',
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (disabled) return;
    playSound('click');
    onClick?.();
  };

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      onClick={handleClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerLeave}
      style={style}
      aria-label={ariaLabel}
    >
      {emoji && <span className="gbtn-emoji" aria-hidden>{emoji}</span>}
      <span className="gbtn-label">{children}</span>
      {badge && <span className="gbtn-badge">{badge}</span>}
    </button>
  );
}
