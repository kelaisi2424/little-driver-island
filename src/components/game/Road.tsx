import type { ReactNode } from 'react';

interface RoadProps {
  roadOffset: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  children: ReactNode;
}

export default function Road({
  roadOffset,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  children,
}: RoadProps) {
  return (
    <div
      className="runner-road-wrap"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ '--road-offset': `${roadOffset}px` } as React.CSSProperties}
    >
      <div className="runner-grass left" aria-hidden>
        <span>🌳</span>
        <span>🌼</span>
        <span>🌲</span>
      </div>
      <div className="runner-grass right" aria-hidden>
        <span>🌸</span>
        <span>🌳</span>
        <span>🚏</span>
      </div>
      <div className="runner-road" aria-hidden />
      <div className="speed-lines" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      {children}
    </div>
  );
}
