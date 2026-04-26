import type { CarState } from './physics';
import type { MapRuntime, Obstacle, Point } from './maps';

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function hitObstacle(car: CarState, obstacles: Obstacle[]): Obstacle | null {
  return obstacles.find((obstacle) => distance(car, obstacle) < obstacle.radius + 24) ?? null;
}

export function reachedCheckpoint(car: CarState, map: MapRuntime, nextIndex: number): boolean {
  const point = map.checkpoints[nextIndex];
  return Boolean(point && distance(car, point) < 38);
}

export function reachedFinish(car: CarState, map: MapRuntime, checkpointCount: number): boolean {
  if (checkpointCount < map.checkpoints.length) return false;
  if (map.parking) {
    const { x, y, w, h } = map.parking;
    return car.x > x && car.x < x + w && car.y > y && car.y < y + h && car.speed < 1.6;
  }
  return distance(car, map.finish) < 44;
}

export function isFarFromRoad(car: CarState, map: MapRuntime): boolean {
  const nearest = Math.min(...map.road.map((point) => distance(car, point)));
  return nearest > 135;
}
