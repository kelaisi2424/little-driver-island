export type Level3DKind = 'finish' | 'cones' | 'checkpoints' | 'traffic' | 'parking';

export interface ConeConfig {
  x: number;
  z: number;
}

export interface CheckpointConfig {
  x: number;
  z: number;
}

export interface Level3D {
  id: number;
  name: string;
  mission: string;
  learningGoal: string;
  summary: string;
  kind: Level3DKind;
  roadLength: number;
  finishZ: number;
  cones: ConeConfig[];
  checkpoints: CheckpointConfig[];
}

export const LEVELS_3D: readonly Level3D[] = [
  {
    id: 1,
    name: '直路到终点',
    mission: '按住油门，沿着路开到终点线。',
    learningGoal: '小车要沿着路走',
    summary: '小车沿着路走，会更安全。',
    kind: 'finish',
    roadLength: 135,
    finishZ: -108,
    cones: [],
    checkpoints: [],
  },
  {
    id: 2,
    name: '躲开路锥',
    mission: '绕开路锥，慢慢开到终点。',
    learningGoal: '看到障碍要慢慢绕开',
    summary: '看到路锥，提前绕开更安全。',
    kind: 'cones',
    roadLength: 145,
    finishZ: -118,
    cones: [
      { x: -1.9, z: -34 },
      { x: 1.7, z: -58 },
      { x: -0.4, z: -82 },
    ],
    checkpoints: [],
  },
  {
    id: 3,
    name: '通过检查点',
    mission: '开过 3 个蓝色光圈，再到终点。',
    learningGoal: '开车要看路线',
    summary: '看着路线开，才能稳稳到达。',
    kind: 'checkpoints',
    roadLength: 150,
    finishZ: -122,
    cones: [],
    checkpoints: [
      { x: 0, z: -28 },
      { x: -1.7, z: -58 },
      { x: 1.5, z: -88 },
    ],
  },
  {
    id: 4,
    name: '红灯停一停',
    mission: '红灯前慢下来，绿灯后通过。',
    learningGoal: '红灯停，绿灯行',
    summary: '红灯亮了，小车要停下来。',
    kind: 'traffic',
    roadLength: 145,
    finishZ: -118,
    cones: [],
    checkpoints: [{ x: 0, z: -58 }],
  },
  {
    id: 5,
    name: '停车入位',
    mission: '慢慢开进 P 停车框。',
    learningGoal: 'P 是停车的地方',
    summary: '看到 P 标志，就知道这里可以停车。',
    kind: 'parking',
    roadLength: 110,
    finishZ: -85,
    cones: [],
    checkpoints: [],
  },
];

export function getLevel3D(levelId: number): Level3D {
  return LEVELS_3D.find((level) => level.id === levelId) ?? LEVELS_3D[0];
}
