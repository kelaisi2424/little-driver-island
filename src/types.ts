// Game-wide shared types. Add new task types here when extending.

export type Screen = 'box' | 'game' | 'result' | 'parent' | 'stickers';

export type GameId =
  | 'obstacle-drive'
  | 'parking-puzzle'
  | 'traffic-light'
  | 'car-wash'
  | 'bus-pickup'
  | 'repair-garage';

export interface GameDefinition {
  id: GameId;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  stickerId: string;
  learning: string;
}

export interface GameCompletePayload {
  gameId: GameId;
  stars: number;
  stickerId: string;
}

export interface MiniGameProps {
  onComplete: (payload: GameCompletePayload) => void;
}

export type GameMode = 'learning' | 'game';

export type TaskType =
  | 'traffic-light'
  | 'parking'
  | 'color-repair'
  | 'crosswalk'   // 斑马线前要停
  | 'pedestrian'  // 看到行人要让行
  | 'red-light'   // 不能闯红灯
  | 'seatbelt';   // 坐车系安全带
// 后续可扩展: | 'literacy' | 'pinyin' | 'math'

export interface ParentConfig {
  totalTasks: number;
  reminder: string;
  voiceEnabled: boolean;
  dailyLimit: number;
}

export interface TaskComponentProps {
  onComplete: () => void;
  mode: GameMode;
}
