import type { TaskType } from '../types';
import { taskToDestination } from '../utils/routeMeta';

interface TodayRouteProps {
  tasks: TaskType[];
}

export default function TodayRoute({ tasks }: TodayRouteProps) {
  const stops = ['家', ...tasks.map(taskToDestination)];

  return (
    <div className="today-route" aria-label="今天路线">
      <div className="route-title">今天路线</div>
      <div className="route-stops">
        {stops.map((stop, index) => (
          <span className="route-stop" key={`${stop}-${index}`}>
            {stop}
          </span>
        ))}
      </div>
    </div>
  );
}
