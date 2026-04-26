import { useEffect, useState } from 'react';
import type { GameMode, TaskType } from '../types';
import { getQuiz } from '../data/safetyQuizzes';
import { taskToArrivalPrompt } from '../utils/routeMeta';
import { speak } from '../utils/speech';
import ProgressBar from './ProgressBar';
import TrafficLightTask from './tasks/TrafficLightTask';
import ParkingTask from './tasks/ParkingTask';
import ColorRepairTask from './tasks/ColorRepairTask';
import QuizTask from './QuizTask';

interface GamePlayProps {
  tasks: TaskType[];
  mode: GameMode;
  onComplete: (stars: number) => void;
  onExit: () => void;
}

// 中间层：负责任务进度推进，渲染当前任务组件。
// 后续要加新任务类型时，在 renderTask 中追加 case 即可。
export default function GamePlay({
  tasks,
  mode,
  onComplete,
  onExit,
}: GamePlayProps) {
  const [index, setIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [showStationIntro, setShowStationIntro] = useState(true);

  useEffect(() => {
    const current = tasks[index];
    if (!current) return;
    const prompt = taskToArrivalPrompt(current);
    setShowStationIntro(true);
    speak(prompt);
    const timer = window.setTimeout(() => setShowStationIntro(false), 1300);
    return () => window.clearTimeout(timer);
  }, [index, tasks]);

  const handleTaskComplete = () => {
    const nextStars = stars + 1;
    if (index + 1 >= tasks.length) {
      onComplete(nextStars);
    } else {
      setStars(nextStars);
      setIndex(index + 1);
    }
  };

  const renderTask = (type: TaskType) => {
    switch (type) {
      case 'traffic-light':
        return <TrafficLightTask onComplete={handleTaskComplete} mode={mode} />;
      case 'parking':
        return <ParkingTask onComplete={handleTaskComplete} mode={mode} />;
      case 'color-repair':
        return <ColorRepairTask onComplete={handleTaskComplete} mode={mode} />;
      case 'crosswalk':
      case 'pedestrian':
      case 'red-light':
      case 'seatbelt': {
        const quiz = getQuiz(type);
        if (!quiz) return null;
        return (
          <QuizTask
            quiz={quiz}
            mode={mode}
            onComplete={handleTaskComplete}
          />
        );
      }
      default:
        return null;
    }
  };

  const currentType = tasks[index];

  return (
    <>
      <ProgressBar
        current={index + 1}
        total={tasks.length}
        stars={stars}
        onExit={onExit}
      />
      {/* key 让任务切换时彻底重置子组件内部状态 */}
      <div className="task" key={index}>
        {currentType && !showStationIntro && renderTask(currentType)}
      </div>
      {showStationIntro && currentType && (
        <div className="station-intro" aria-live="polite">
          <span aria-hidden>🚗</span>
          {taskToArrivalPrompt(currentType)}
        </div>
      )}
    </>
  );
}
