import type { Level3D } from '../../data/levels3d';

interface MissionCardProps {
  level: Level3D;
  onStart: () => void;
  onBack: () => void;
}

export default function MissionCard({ level, onStart, onBack }: MissionCardProps) {
  return (
    <div className="game3d-overlay">
      <section className="game3d-mission-card">
        <div className="game3d-level-pill">第 {level.id} 关</div>
        <h1>{level.name}</h1>
        <p>{level.mission}</p>
        <div className="game3d-mini-road">
          <span className="game3d-mini-car">🚗</span>
          <span className="game3d-mini-flag">🏁</span>
        </div>
        <button className="game3d-primary" onClick={onStart} type="button">开始</button>
        <button className="game3d-link" onClick={onBack} type="button">回首页</button>
      </section>
    </div>
  );
}
