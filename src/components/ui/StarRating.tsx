// 三星评分。filled = 当前获得几颗，size 为单星 px 大小，animate 控制弹出动画。

interface StarRatingProps {
  filled: number;
  total?: number;
  size?: number;
  animate?: boolean;
}

export default function StarRating({
  filled,
  total = 3,
  size = 36,
  animate = false,
}: StarRatingProps) {
  return (
    <div className="star-rating" style={{ fontSize: `${size}px` }}>
      {Array.from({ length: total }).map((_, i) => {
        const on = i < filled;
        const cls = ['star', on ? 'on' : 'off', animate ? 'animate' : ''].filter(Boolean).join(' ');
        return (
          <span
            key={i}
            className={cls}
            style={{ animationDelay: animate && on ? `${i * 0.18}s` : undefined }}
            aria-hidden
          >
            {on ? '⭐' : '☆'}
          </span>
        );
      })}
    </div>
  );
}
