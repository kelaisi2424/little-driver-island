import * as THREE from 'three';
import type { DrivingControls } from './useDrivingControls';

export interface DrivingState {
  position: THREE.Vector3;
  rotationY: number;
  speed: number;
  steering: number;
  shakeTime: number;
  tilt: number;
}

export interface PhysicsOptions {
  roadHalfWidth: number;
  maxSpeed: number;
  acceleration: number;
  braking: number;
  friction: number;
  turnSpeed: number;
}

export const DEFAULT_PHYSICS: PhysicsOptions = {
  roadHalfWidth: 3.65,
  maxSpeed: 19.5,
  acceleration: 18,
  braking: 34,
  friction: 3.8,
  turnSpeed: 1.42,
};

export function createDrivingState() {
  return {
    position: new THREE.Vector3(0, 0.48, 0),
    rotationY: 0,
    speed: 0,
    steering: 0,
    shakeTime: 0,
    tilt: 0,
  };
}

export function resetDrivingState(state: DrivingState) {
  state.position.set(0, 0.48, 0);
  state.rotationY = 0;
  state.speed = 0;
  state.steering = 0;
  state.shakeTime = 0;
  state.tilt = 0;
}

export function updateDrivingPhysics(
  state: DrivingState,
  controls: DrivingControls,
  delta: number,
  options = DEFAULT_PHYSICS,
) {
  if (controls.throttle) state.speed += options.acceleration * delta;
  if (controls.brake) state.speed -= options.braking * delta;
  if (!controls.throttle && !controls.brake) {
    state.speed -= options.friction * delta;
  }

  state.speed = THREE.MathUtils.clamp(state.speed, 0, options.maxSpeed);

  const steerTarget = controls.left ? 1 : controls.right ? -1 : 0;
  state.steering = THREE.MathUtils.lerp(state.steering, steerTarget, 0.16);
  const speedRatio = THREE.MathUtils.clamp(state.speed / options.maxSpeed, 0, 1);
  const turnPower = THREE.MathUtils.lerp(0.34, 0.86, speedRatio);
  state.rotationY += state.steering * options.turnSpeed * turnPower * delta;
  state.tilt = THREE.MathUtils.lerp(state.tilt, -state.steering * speedRatio * 0.12, 0.12);

  const forward = new THREE.Vector3(
    -Math.sin(state.rotationY),
    0,
    -Math.cos(state.rotationY),
  );
  state.position.addScaledVector(forward, state.speed * delta);
  state.position.x = THREE.MathUtils.clamp(
    state.position.x,
    -options.roadHalfWidth - 1.4,
    options.roadHalfWidth + 1.4,
  );

  const offRoad = Math.abs(state.position.x) > options.roadHalfWidth;
  if (offRoad) {
    state.speed *= 0.992;
  }

  state.shakeTime = Math.max(0, state.shakeTime - delta);
  return { offRoad };
}

export function kmh(speed: number) {
  return Math.round(speed * 3.6);
}

export function bumpDrivingState(state: DrivingState) {
  state.speed *= 0.46;
  state.shakeTime = 0.42;
}
