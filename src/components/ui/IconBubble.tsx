// 统一的圆形图标底板：把所有 emoji / SVG 图标包在同一种气泡里，整体风格一致。

import type { CSSProperties, ReactNode } from 'react';

interface IconBubbleProps {
  size?: number;
  color?: string;            // 底板色
  shadow?: boolean;
  outline?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function IconBubble({
  size = 44,
  color = '#fff',
  shadow = true,
  outline = true,
  className,
  style,
  children,
}: IconBubbleProps) {
  return (
    <span
      className={`icon-bubble ${shadow ? 'has-shadow' : ''} ${outline ? 'has-outline' : ''} ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.55,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
