// 卡通面板：白色半透明圆角，可选标题条 + 关闭/返回。

import type { CSSProperties, ReactNode } from 'react';

interface GamePanelProps {
  title?: ReactNode;
  onBack?: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  toolbar?: ReactNode;
}

export default function GamePanel({
  title,
  onBack,
  children,
  className,
  style,
  toolbar,
}: GamePanelProps) {
  return (
    <section className={`game-panel ${className ?? ''}`} style={style}>
      {(title || onBack) && (
        <header className="game-panel-head">
          {onBack && (
            <button
              className="gpanel-back"
              onClick={onBack}
              type="button"
              aria-label="返回"
            >
              ←
            </button>
          )}
          {title && <h1 className="gpanel-title">{title}</h1>}
          <div className="gpanel-toolbar">{toolbar}</div>
        </header>
      )}
      <div className="game-panel-body">{children}</div>
    </section>
  );
}
