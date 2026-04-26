export interface ControlState {
  left: boolean;
  right: boolean;
  throttle: boolean;
  brake: boolean;
}

export interface CarState {
  x: number;
  y: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  brakePower: number;
  turnSpeed: number;
  shake: number;
  drift: number;
}

export const EMPTY_CONTROLS: ControlState = {
  left: false,
  right: false,
  throttle: false,
  brake: false,
};

export function createCarState(): CarState {
  return {
    x: 95,
    y: 260,
    angle: 0,
    speed: 0,
    maxSpeed: 5.15,
    acceleration: 0.14,
    brakePower: 0.26,
    turnSpeed: 0.056,
    shake: 0,
    drift: 0,
  };
}

export function updateCarPhysics(
  car: CarState,
  controls: ControlState,
  width: number,
  height: number,
): CarState {
  let speed = car.speed;
  if (controls.throttle) speed += car.acceleration;
  if (controls.brake) speed -= car.brakePower;
  if (!controls.throttle && !controls.brake) speed *= 0.972;
  speed = Math.max(0, Math.min(car.maxSpeed, speed));

  const turningPower = Math.max(0.58, speed / car.maxSpeed);
  let angle = car.angle;
  if (controls.left) angle -= car.turnSpeed * turningPower;
  if (controls.right) angle += car.turnSpeed * turningPower;

  const steering = controls.left ? -1 : controls.right ? 1 : 0;
  const drift = steering === 0 ? car.drift * 0.84 : steering * Math.min(1, speed / car.maxSpeed);
  let x = car.x + Math.cos(angle) * speed;
  let y = car.y + Math.sin(angle) * speed + drift * 0.8;
  x = Math.max(40, Math.min(width - 40, x));
  y = Math.max(50, Math.min(height - 50, y));

  return {
    ...car,
    x,
    y,
    angle,
    speed,
    shake: Math.max(0, car.shake - 1),
    drift,
  };
}

export function bumpCar(car: CarState): CarState {
  return {
    ...car,
    speed: Math.max(0, car.speed * 0.28),
    shake: 18,
  };
}
