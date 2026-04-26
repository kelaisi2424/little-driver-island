import type { DrivingEvent } from '../../utils/gameEvents';
import { COLOR_VALUES } from '../../utils/gameEvents';

interface RoadEventProps {
  event: DrivingEvent;
  y: number;
  targetLane: number | null;
}

export default function RoadEvent({ event, y, targetLane }: RoadEventProps) {
  const style = { top: `${y}%` };

  if (event.type === 'traffic') {
    return (
      <div className="road-event traffic-event" style={style}>
        <div className="runner-traffic">
          <span className={event.light === 'red' ? 'on red' : ''} />
          <span />
          <span className={event.light === 'green' ? 'on green' : ''} />
        </div>
      </div>
    );
  }

  if (event.type === 'number-lane') {
    return (
      <div className="road-event lane-event" style={style}>
        {event.laneNumbers?.map((n, index) => (
          <div className={`lane-gate ${n === targetLane ? 'target' : ''}`} key={n}>
            <span>{n}</span>
            <small>{index + 1}</small>
          </div>
        ))}
      </div>
    );
  }

  if (event.type === 'color-garage') {
    const colors = Object.entries(COLOR_VALUES);
    return (
      <div className="road-event garage-event" style={style}>
        {colors.map(([name, color]) => (
          <div className="garage-gate" key={name} style={{ background: color }}>
            <span>🫧</span>
          </div>
        ))}
      </div>
    );
  }

  if (event.type === 'crosswalk') {
    return (
      <div className="road-event crosswalk-event" style={style}>
        <div className="runner-zebra" />
        <span className="walker">🚶</span>
      </div>
    );
  }

  if (event.type === 'roadblock') {
    return (
      <div className="road-event block-event" style={style}>
        <span>🚧</span>
        <small>慢</small>
        <span>🚧</span>
      </div>
    );
  }

  return (
    <div className="road-event finish-event" style={style}>
      <div className="finish-parking">
        <strong>P</strong>
      </div>
    </div>
  );
}
