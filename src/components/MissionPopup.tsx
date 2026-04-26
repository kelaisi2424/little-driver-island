import type { DrivingLevel } from '../types';

interface MissionPopupProps {
  level: DrivingLevel;
  onStart: () => void;
  onBack: () => void;
}

export default function MissionPopup({ level, onStart, onBack }: MissionPopupProps) {
  return (
    <main className="mission-screen">
      <section className="mission-card">
        <div className="mission-level">第 {level.id} 关</div>
        <h1>{level.name}</h1>
        <p className="mission-goal">{level.mission}</p>
        <p className="mission-learn">小提示：{level.learningGoal}</p>
        <div className="mission-map-preview">
          <span className="preview-road" />
          <span className="preview-car">🚗</span>
          <span className="preview-flag">🏁</span>
        </div>
        <button className="master-start-btn" onClick={onStart} type="button">
          开始驾驶
        </button>
        <button className="small-text-btn" onClick={onBack} type="button">
          回到车库
        </button>
      </section>
    </main>
  );
}
