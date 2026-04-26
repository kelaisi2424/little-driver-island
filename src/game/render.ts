import type { CarDefinition } from '../types';
import type { CarState } from './physics';
import type { MapRuntime, Point } from './maps';

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawPath(ctx: CanvasRenderingContext2D, points: Point[], width: number, color: string) {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#8fdfff');
  sky.addColorStop(0.48, '#bdf0ff');
  sky.addColorStop(0.49, '#98dc70');
  sky.addColorStop(1, '#6fbd56');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.font = '34px sans-serif';
  ctx.fillText('☀️', width - 76, 54);
  ctx.fillText('🌳', 40, 105);
  ctx.fillText('🌳', width - 105, height - 70);
  ctx.fillText('🌼', 120, height - 38);
  ctx.fillText('🌼', width - 170, height - 42);
}

function drawMapObjects(ctx: CanvasRenderingContext2D, map: MapRuntime, checkpointIndex: number) {
  if (map.parking) {
    ctx.fillStyle = '#44505a';
    drawRoundRect(ctx, map.parking.x, map.parking.y, map.parking.w, map.parking.h, 16);
    ctx.strokeStyle = '#ffdf5d';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(map.parking.x + 8, map.parking.y + 8, map.parking.w - 16, map.parking.h - 16);
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffdf5d';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText('P', map.parking.x + 42, map.parking.y + 72);
  }

  if (map.trafficLight) {
    ctx.fillStyle = '#2f3538';
    drawRoundRect(ctx, map.trafficLight.x - 24, map.trafficLight.y - 62, 48, 118, 14);
    const isRed = checkpointIndex < map.trafficLight.redUntilCheckpoint;
    ctx.fillStyle = isRed ? '#ff5252' : '#5cd684';
    ctx.beginPath();
    ctx.arc(map.trafficLight.x, map.trafficLight.y - 26, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isRed ? '#5d5d5d' : '#ff5252';
    ctx.beginPath();
    ctx.arc(map.trafficLight.x, map.trafficLight.y + 24, 13, 0, Math.PI * 2);
    ctx.fill();
  }

  if (map.busStop) {
    ctx.fillStyle = '#ffe16b';
    drawRoundRect(ctx, map.busStop.x - 36, map.busStop.y - 42, 72, 62, 12);
    ctx.fillStyle = '#6a5419';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('BUS', map.busStop.x - 23, map.busStop.y - 6);
  }

  if (map.school) {
    ctx.font = '46px sans-serif';
    ctx.fillText('🏫', map.school.x - 28, map.school.y + 18);
  }

  map.obstacles.forEach((obstacle) => {
    ctx.font = obstacle.kind === 'person' ? '38px sans-serif' : '32px sans-serif';
    const icon = obstacle.kind === 'cone'
      ? '🚧'
      : obstacle.kind === 'water'
        ? '💧'
        : obstacle.kind === 'flower'
          ? '🌷'
          : '🚶';
    ctx.fillText(icon, obstacle.x - 18, obstacle.y + 13);
  });

  map.checkpoints.forEach((checkpoint, index) => {
    const done = index < checkpointIndex;
    ctx.beginPath();
    ctx.arc(checkpoint.x, checkpoint.y, done ? 22 : 28, 0, Math.PI * 2);
    ctx.fillStyle = done ? 'rgba(92, 214, 132, 0.65)' : 'rgba(255, 223, 93, 0.75)';
    ctx.fill();
    ctx.strokeStyle = done ? '#47b86a' : '#fff3a0';
    ctx.lineWidth = 4;
    ctx.stroke();
  });

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(map.finish.x - 10, map.finish.y - 45, 20, 90);
  ctx.fillStyle = '#222';
  for (let i = 0; i < 6; i += 1) {
    ctx.fillRect(map.finish.x - 10 + (i % 2) * 10, map.finish.y - 45 + i * 15, 10, 15);
    ctx.fillRect(map.finish.x + (i % 2) * 10, map.finish.y - 30 + i * 15, 10, 15);
  }
}

function drawCar(ctx: CanvasRenderingContext2D, car: CarState, carDef: CarDefinition) {
  ctx.save();
  const shake = car.shake > 0 ? Math.sin(car.shake) * 4 : 0;
  ctx.translate(car.x + shake, car.y);
  ctx.rotate(car.angle);

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  if (car.speed > 0.25) {
    ctx.globalAlpha = Math.min(0.42, car.speed / car.maxSpeed);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-52, -11, 20 + car.speed * 3, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(-52, 13, 20 + car.speed * 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = '#222';
  drawRoundRect(ctx, -34, -30, 18, 18, 5);
  drawRoundRect(ctx, 16, -30, 18, 18, 5);
  drawRoundRect(ctx, -34, 12, 18, 18, 5);
  drawRoundRect(ctx, 16, 12, 18, 18, 5);

  ctx.fillStyle = carDef.bodyColor;
  drawRoundRect(ctx, -44, -24, 88, 48, 16);
  ctx.fillStyle = carDef.roofColor;
  drawRoundRect(ctx, -16, -18, 34, 32, 9);
  ctx.fillStyle = '#fff5a8';
  drawRoundRect(ctx, 32, -15, 10, 10, 5);
  drawRoundRect(ctx, 32, 5, 10, 10, 5);

  ctx.restore();
}

export function renderDrivingScene(
  ctx: CanvasRenderingContext2D,
  map: MapRuntime,
  car: CarState,
  carDef: CarDefinition,
  checkpointIndex: number,
  width: number,
  height: number,
) {
  drawBackground(ctx, width, height);
  drawPath(ctx, map.road, 104, '#4f5d5f');
  drawPath(ctx, map.road, 78, '#6f7b7d');
  drawPath(ctx, map.road, 6, '#ffe16b');
  drawMapObjects(ctx, map, checkpointIndex);
  drawCar(ctx, car, carDef);
}
