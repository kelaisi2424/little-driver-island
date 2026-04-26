import type { Point } from '../../hooks/useCarDrag';
import DraggableCar from './DraggableCar';
import TaskHotspot, { type HotspotDef } from './TaskHotspot';
import StarBurst from './StarBurst';

interface GameMapProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  hotspots: HotspotDef[];
  activeTypes: Set<string>;
  completedTypes: Set<string>;
  nearType: string | null;
  impactType: string | null;
  carPosition: Point;
  dragging: boolean;
  celebrating: boolean;
  showStars: boolean;
  onHotspotClick: (hotspot: HotspotDef) => void;
  carHandlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onTap: () => void;
  };
}

export default function GameMap({
  mapRef,
  hotspots,
  activeTypes,
  completedTypes,
  nearType,
  impactType,
  carPosition,
  dragging,
  celebrating,
  showStars,
  onHotspotClick,
  carHandlers,
}: GameMapProps) {
  return (
    <div className="game-map" ref={mapRef}>
      <div className="game-sky" aria-hidden>
        <span className="game-sun">☀️</span>
        <span className="game-cloud cloud-one" />
        <span className="game-cloud cloud-two" />
      </div>
      <div className="game-road road-main" aria-hidden />
      <div className="game-road road-side" aria-hidden />
      <div className="game-crosswalk" aria-hidden />
      <div className="game-trees" aria-hidden>
        <span>🌳</span>
        <span>🌼</span>
        <span>🌲</span>
        <span>🌸</span>
      </div>
      <div className="wash-bubbles" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      {hotspots.map((hotspot) => (
        <TaskHotspot
          key={hotspot.type}
          hotspot={hotspot}
          active={activeTypes.has(hotspot.type)}
          completed={completedTypes.has(hotspot.type)}
          near={nearType === hotspot.type}
          impact={impactType === hotspot.type}
          onClick={() => onHotspotClick(hotspot)}
        />
      ))}

      <DraggableCar
        position={carPosition}
        dragging={dragging}
        celebrating={celebrating}
        {...carHandlers}
      />
      <StarBurst show={showStars} />
    </div>
  );
}
