import type { Point } from '../../hooks/useCarDrag';
import CarSvg from '../CarSvg';

interface DraggableCarProps {
  position: Point;
  dragging: boolean;
  celebrating: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onTap: () => void;
}

export default function DraggableCar({
  position,
  dragging,
  celebrating,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onTap,
}: DraggableCarProps) {
  return (
    <button
      className={`driver-car ${dragging ? 'dragging' : ''} ${celebrating ? 'celebrating' : ''}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={onTap}
      type="button"
      aria-label="拖动小汽车"
    >
      <span className="driver-headlight" aria-hidden />
      <CarSvg color="#ff8c69" size={138} />
    </button>
  );
}
