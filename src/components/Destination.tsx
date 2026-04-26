import type { TaskType } from '../types';
import { getRouteMeta } from '../utils/routeMeta';

interface DestinationProps {
  type?: TaskType;
  className: string;
  label?: string;
  emoji?: string;
  placeClass?: string;
  active?: boolean;
  onClick?: () => void;
}

export default function Destination({
  type,
  className,
  label,
  emoji,
  placeClass,
  active = false,
  onClick,
}: DestinationProps) {
  const meta = type ? getRouteMeta(type) : null;
  const finalLabel = label ?? meta?.shortLabel ?? '';
  const finalEmoji = emoji ?? meta?.emoji ?? '📍';
  const finalPlaceClass = placeClass ?? meta?.placeClass ?? 'dest-park';
  const fullLabel = meta?.label ?? finalLabel;

  return (
    <button
      className={`map-destination ${className} ${finalPlaceClass} ${active ? 'active' : ''}`}
      aria-label={fullLabel}
      onClick={onClick}
      type="button"
    >
      <span className="dest-icon" aria-hidden>{finalEmoji}</span>
      <span className="dest-label">{finalLabel}</span>
    </button>
  );
}
