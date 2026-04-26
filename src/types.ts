export type Screen =
  | 'home'
  | 'level-select'
  | 'game'
  | 'complete'
  | 'rest'
  | 'parent'
  | 'stickers';

export type DrivingScreen =
  | 'garage'
  | 'car-select'
  | 'level-select'
  | 'mission'
  | 'drive'
  | 'complete'
  | 'rest'
  | 'parent'
  | 'stickers';

export type CarId = 'red-car' | 'blue-car' | 'yellow-bus' | 'green-truck';

export type DrivingLevelType =
  | 'starter'
  | 'parking'
  | 'traffic'
  | 'bus'
  | 'curve'
  | 'school';

export type GameId =
  | 'parking-move'
  | 'car-rush'
  | 'bus-pickup'
  | 'jump-car'
  | 'find-car'
  | 'tire-roll';

export interface GameDefinition {
  id: GameId;
  icon: string;
  title: string;
  tag: string;
  color: string;
  stickerId: string;
}

export interface LevelDefinition {
  gameId: GameId;
  level: number;
  goal: string;
  difficulty: 1 | 2 | 3;
  learningGoal: string;
  summary: string;
  config?: Record<string, unknown>;
}

export interface LevelCompletePayload {
  gameId: GameId;
  level: number;
  stars: number;
  stickerId?: string;
  learningGoal: string;
  summary: string;
}

export interface ParentConfig {
  totalTasks: number;
  reminder: string;
  voiceEnabled: boolean;
  dailyLimit: number;
  dailyMinutes: number;
  restAfterLevels: number;
}

export interface CarDefinition {
  id: CarId;
  name: string;
  shortName: string;
  bodyColor: string;
  roofColor: string;
  accentColor: string;
  emoji: string;
}

export interface DrivingLevel {
  id: number;
  category: DrivingLevelType;
  categoryName: string;
  indexInCategory: number;
  name: string;
  mission: string;
  learningGoal: string;
  summary: string;
  map: 'straight' | 'curve' | 'traffic' | 'parking' | 'bus' | 'school';
  difficulty: 1 | 2 | 3;
  checkpoints: number;
  obstacles: 'none' | 'cones' | 'water' | 'people' | 'mixed';
  stickerId?: string;
}

export interface DrivingCompletePayload {
  level: DrivingLevel;
  stars: number;
  elapsedSeconds: number;
}

export interface LevelGameProps {
  level: LevelDefinition;
  onComplete: (payload: LevelCompletePayload) => void;
  onFail?: () => void;
}

// Legacy mini-game files are kept in the repo during the transition.
export interface MiniGameProps {
  onComplete: (payload: Record<string, unknown>) => void;
}

// Legacy task-game types retained so older components still type-check.
export type GameMode = 'learning' | 'game';

export type TaskType =
  | 'traffic-light'
  | 'parking'
  | 'color-repair'
  | 'crosswalk'
  | 'pedestrian'
  | 'red-light'
  | 'seatbelt';

export interface TaskComponentProps {
  onComplete: () => void;
  mode: GameMode;
}
