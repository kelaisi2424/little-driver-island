import type { DrivingLevel } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface Obstacle extends Point {
  kind: 'cone' | 'water' | 'person' | 'flower';
  radius: number;
}

export interface MapRuntime {
  road: Point[];
  checkpoints: Point[];
  finish: Point;
  parking?: { x: number; y: number; w: number; h: number };
  trafficLight?: Point & { redUntilCheckpoint: number };
  busStop?: Point;
  school?: Point;
  obstacles: Obstacle[];
}

const baseRoad: Point[] = [
  { x: 70, y: 260 },
  { x: 230, y: 260 },
  { x: 390, y: 260 },
  { x: 570, y: 260 },
  { x: 800, y: 260 },
];

function spreadCheckpoints(level: DrivingLevel, points: Point[]): Point[] {
  return points.slice(0, Math.max(1, level.checkpoints));
}

function obstacleSet(level: DrivingLevel): Obstacle[] {
  if (level.obstacles === 'none') return [];
  const cones: Obstacle[] = [
    { x: 310, y: 220, kind: 'cone', radius: 28 },
    { x: 475, y: 305, kind: 'cone', radius: 28 },
  ];
  const water: Obstacle[] = [
    { x: 330, y: 305, kind: 'water', radius: 32 },
    { x: 610, y: 220, kind: 'water', radius: 34 },
  ];
  const people: Obstacle[] = [
    { x: 520, y: 258, kind: 'person', radius: 30 },
  ];
  if (level.obstacles === 'cones') return cones;
  if (level.obstacles === 'water') return water;
  if (level.obstacles === 'people') return people;
  return [...cones.slice(0, 1), ...water.slice(0, 1), ...people];
}

export function createMap(level: DrivingLevel): MapRuntime {
  if (level.map === 'curve') {
    const road = [
      { x: 70, y: 275 },
      { x: 210, y: 180 },
      { x: 390, y: 340 },
      { x: 575, y: 185 },
      { x: 820, y: 255 },
    ];
    return {
      road,
      checkpoints: spreadCheckpoints(level, [
        { x: 220, y: 180 },
        { x: 390, y: 340 },
        { x: 590, y: 190 },
      ]),
      finish: { x: 815, y: 255 },
      obstacles: obstacleSet(level),
    };
  }

  if (level.map === 'parking') {
    return {
      road: [
        { x: 70, y: 260 },
        { x: 250, y: 260 },
        { x: 430, y: 200 },
        { x: 590, y: 200 },
        { x: 720, y: 315 },
      ],
      checkpoints: spreadCheckpoints(level, [{ x: 410, y: 205 }, { x: 640, y: 260 }]),
      finish: { x: 725, y: 315 },
      parking: { x: 665, y: 260, w: 120, h: 110 },
      obstacles: obstacleSet(level),
    };
  }

  if (level.map === 'traffic') {
    return {
      road: baseRoad,
      checkpoints: spreadCheckpoints(level, [
        { x: 330, y: 260 },
        { x: 520, y: 260 },
        { x: 690, y: 260 },
      ]),
      finish: { x: 820, y: 260 },
      trafficLight: { x: 455, y: 160, redUntilCheckpoint: 1 },
      obstacles: obstacleSet(level),
    };
  }

  if (level.map === 'bus') {
    return {
      road: [
        { x: 70, y: 290 },
        { x: 245, y: 290 },
        { x: 420, y: 215 },
        { x: 610, y: 265 },
        { x: 820, y: 265 },
      ],
      checkpoints: spreadCheckpoints(level, [
        { x: 250, y: 292 },
        { x: 430, y: 218 },
        { x: 650, y: 265 },
      ]),
      finish: { x: 820, y: 265 },
      busStop: { x: 250, y: 210 },
      school: { x: 785, y: 170 },
      obstacles: obstacleSet(level),
    };
  }

  if (level.map === 'school') {
    return {
      road: [
        { x: 70, y: 260 },
        { x: 230, y: 320 },
        { x: 410, y: 230 },
        { x: 610, y: 285 },
        { x: 820, y: 250 },
      ],
      checkpoints: spreadCheckpoints(level, [
        { x: 230, y: 320 },
        { x: 420, y: 230 },
        { x: 620, y: 285 },
      ]),
      finish: { x: 820, y: 250 },
      school: { x: 790, y: 145 },
      obstacles: obstacleSet(level),
    };
  }

  return {
    road: baseRoad,
    checkpoints: spreadCheckpoints(level, [
      { x: 320, y: 260 },
      { x: 520, y: 260 },
      { x: 700, y: 260 },
    ]),
    finish: { x: 820, y: 260 },
    obstacles: obstacleSet(level),
  };
}
