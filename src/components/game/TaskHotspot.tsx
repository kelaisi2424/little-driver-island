import type { TaskType } from '../../types';

export interface HotspotDef {
  type: TaskType;
  label: string;
  emoji: string;
  x: number;
  y: number;
  className: string;
}

interface TaskHotspotProps {
  hotspot: HotspotDef;
  active: boolean;
  completed: boolean;
  near: boolean;
  impact: boolean;
  onClick: () => void;
}

export default function TaskHotspot({
  hotspot,
  active,
  completed,
  near,
  impact,
  onClick,
}: TaskHotspotProps) {
  return (
    <button
      className={`task-hotspot ${hotspot.className} ${active ? 'active' : ''} ${near ? 'near' : ''} ${impact ? 'impact' : ''} ${completed ? 'done' : ''}`}
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      onClick={onClick}
      type="button"
      aria-label={hotspot.label}
      disabled={completed}
    >
      <span className="hotspot-emoji" aria-hidden>{completed ? '⭐' : hotspot.emoji}</span>
      <span className="hotspot-label">{completed ? '完成' : hotspot.label}</span>
    </button>
  );
}
