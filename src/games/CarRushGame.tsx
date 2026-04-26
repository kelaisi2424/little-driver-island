import DrivingGame from '../components/game/DrivingGame';
import type { LevelGameProps } from '../types';
import { getGameDefinition } from '../data/games';

export default function CarRushGame({ level, onComplete }: LevelGameProps) {
  const game = getGameDefinition('car-rush');
  return (
    <DrivingGame
      config={{
        totalTasks: Math.min(5, Math.max(3, level.level + 1)),
        reminder: '',
        voiceEnabled: true,
        dailyLimit: 3,
        dailyMinutes: 15,
        restAfterLevels: 5,
      }}
      todayCount={0}
      onFinish={(stars) =>
        onComplete({
          gameId: 'car-rush',
          level: level.level,
          stars: Math.max(1, stars),
          stickerId: level.level >= 5 ? game.stickerId : undefined,
          learningGoal: level.learningGoal,
          summary: level.summary,
        })
      }
    />
  );
}
