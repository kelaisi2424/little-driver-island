interface ProgressBarProps {
  current: number;
  total: number;
  stars: number;
  onExit: () => void;
}

export default function ProgressBar({
  current,
  total,
  stars,
  onExit,
}: ProgressBarProps) {
  const items = Array.from({ length: total });
  return (
    <div className="progress-bar">
      <button
        className="home-btn"
        onClick={onExit}
        aria-label="返回首页"
      >
        🏠
      </button>
      <div className="progress-text">
        第 {current} 站 / 共 {total} 站
      </div>
      <div className="progress-stars" aria-label={`已获得 ${stars} 颗星`}>
        {items.map((_, i) => (
          <span key={i} className={i < stars ? 'filled' : 'empty'}>
            ⭐️
          </span>
        ))}
      </div>
    </div>
  );
}
