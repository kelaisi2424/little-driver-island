import type { TaskType } from '../types';
import { taskToDestination } from '../utils/routeMeta';
import CuteCar from './CuteCar';
import Destination from './Destination';
import RoadPath from './RoadPath';

interface HomeMapProps {
  route: TaskType[];
  driving: boolean;
  carJumping: boolean;
  carMessage: string | null;
  onCarClick: () => void;
  onDestinationClick: (label: string) => void;
  onStartClick: () => void;
  startDisabled?: boolean;
}

const LANDMARKS = [
  {
    label: '幼儿园',
    emoji: '🏫',
    placeClass: 'dest-school',
    slotClass: 'slot-school',
  },
  {
    label: '洗车店',
    emoji: '🫧',
    placeClass: 'dest-wash',
    slotClass: 'slot-wash',
  },
  {
    label: '停车场',
    emoji: '🅿️',
    placeClass: 'dest-parking',
    slotClass: 'slot-parking',
  },
  {
    label: '公园',
    emoji: '🌳',
    placeClass: 'dest-park',
    slotClass: 'slot-park',
  },
  {
    label: '红绿灯',
    emoji: '🚦',
    placeClass: 'dest-light',
    slotClass: 'slot-light',
  },
];

function taskMatchesLandmark(task: TaskType | undefined, label: string): boolean {
  if (!task) return false;
  if (label === '幼儿园') return task === 'seatbelt';
  if (label === '洗车店') return task === 'color-repair';
  if (label === '停车场') return task === 'parking';
  if (label === '公园') return task === 'pedestrian' || task === 'crosswalk';
  if (label === '红绿灯') return task === 'traffic-light' || task === 'red-light';
  return false;
}

export default function HomeMap({
  route,
  driving,
  carJumping,
  carMessage,
  onCarClick,
  onDestinationClick,
  onStartClick,
  startDisabled = false,
}: HomeMapProps) {
  const currentStop = route[0];
  const currentStopLabel = currentStop ? taskToDestination(currentStop) : '小镇';

  return (
    <div className="home-map">
      <div className="map-next-card">
        <span aria-hidden>📍</span>
        <span>下一站：{currentStopLabel}</span>
      </div>

      <div className="map-sky">
        <span className="map-sun" aria-hidden>☀️</span>
        <span className="map-cloud cloud-a" aria-hidden />
        <span className="map-cloud cloud-b" aria-hidden />
      </div>

      <RoadPath />

      <div className="map-grass" aria-hidden>
        <span className="flower flower-a">✿</span>
        <span className="flower flower-b">✿</span>
        <span className="bush bush-a" />
        <span className="bush bush-b" />
      </div>

      {LANDMARKS.map((landmark) => (
        <Destination
          key={landmark.label}
          className={landmark.slotClass}
          label={landmark.label}
          emoji={landmark.emoji}
          placeClass={landmark.placeClass}
          active={taskMatchesLandmark(currentStop, landmark.label)}
          onClick={() => onDestinationClick(landmark.label)}
        />
      ))}

      <button
        className="map-home"
        aria-label="家"
        type="button"
        onClick={() => onDestinationClick('家')}
      >
        <span aria-hidden>🏠</span>
        <b>家</b>
      </button>

      <div className={`map-car-wrap ${driving ? 'is-driving' : ''}`}>
        {carMessage && <div className="car-bubble">{carMessage}</div>}
        <CuteCar
          driving={driving}
          jumping={carJumping}
          onClick={onCarClick}
        />
      </div>

      <button
        className="map-start-sign"
        onClick={onStartClick}
        disabled={startDisabled}
        type="button"
      >
        <span aria-hidden>🚗</span>
        出发做任务
      </button>
    </div>
  );
}
