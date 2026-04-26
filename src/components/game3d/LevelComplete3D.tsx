import type { Level3D } from '../../data/levels3d';

interface LevelComplete3DProps {
  level: Level3D;
  stars: number;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export default function LevelComplete3D({
  level,
  stars,
  onNext,
  onRetry,
  onHome,
}: LevelComplete3DProps) {
  return (
    <div className="game3d-overlay">
      <section className="game3d-complete-card">
        <div className="game3d-complete-star">⭐</div>
        <h1>第 {level.id} 关完成啦！</h1>
        <p className="game3d-stars">{'⭐'.repeat(stars)}</p>
        <p>今天学到：{level.summary}</p>
        <div className="game3d-complete-actions">
          <button className="game3d-primary" onClick={onNext} type="button">下一关</button>
          <button onClick={onRetry} type="button">再来一次</button>
          <button onClick={onHome} type="button">回首页</button>
        </div>
      </section>
    </div>
  );
}
