interface CarSvgProps {
  color?: string;
  size?: number;
  smile?: boolean;
}

// 可爱的卡通小汽车 SVG，纯矢量绘制，不依赖外部图片。
export default function CarSvg({
  color = '#ff7e7e',
  size = 100,
  smile = true,
}: CarSvgProps) {
  const w = size;
  const h = size * 0.72;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 120 86"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 车身阴影 */}
      <ellipse cx="60" cy="80" rx="50" ry="4" fill="rgba(0,0,0,0.15)" />
      {/* 主车身 */}
      <rect x="8" y="38" width="104" height="32" rx="12" fill={color} />
      {/* 顶棚 */}
      <path
        d="M 30 38 L 42 16 Q 44 14 47 14 L 80 14 Q 83 14 86 17 L 96 38 Z"
        fill={color}
      />
      {/* 顶棚高光 */}
      <path
        d="M 34 36 L 44 18 L 60 18 L 56 36 Z"
        fill="rgba(255,255,255,0.18)"
      />
      {/* 车窗 */}
      <rect x="42" y="20" width="17" height="14" rx="3" fill="#cdeaff" />
      <rect x="62" y="20" width="20" height="14" rx="3" fill="#cdeaff" />
      <rect x="44" y="22" width="6" height="4" rx="1" fill="rgba(255,255,255,0.7)" />
      {/* 车门接缝 */}
      <line x1="60" y1="40" x2="60" y2="68" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
      {/* 车灯 */}
      <circle cx="106" cy="48" r="4" fill="#fff7a3" />
      <circle cx="106" cy="48" r="2" fill="#fff" />
      <rect x="6" y="46" width="6" height="6" rx="2" fill="#ffd166" />
      {/* 车牌区域 */}
      <rect x="50" y="58" width="20" height="6" rx="1" fill="rgba(255,255,255,0.6)" />
      {/* 笑脸 */}
      {smile && (
        <>
          <circle cx="48" cy="48" r="2.2" fill="#3a3a3a" />
          <circle cx="72" cy="48" r="2.2" fill="#3a3a3a" />
          <path
            d="M 50 54 Q 60 60 70 54"
            stroke="#3a3a3a"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {/* 轮胎 */}
      <g className="car-wheel wheel-left">
        <circle cx="30" cy="70" r="11" fill="#2a2a2a" />
        <circle cx="30" cy="70" r="5" fill="#9a9a9a" />
        <circle cx="30" cy="70" r="2" fill="#444" />
      </g>
      <g className="car-wheel wheel-right">
        <circle cx="90" cy="70" r="11" fill="#2a2a2a" />
        <circle cx="90" cy="70" r="5" fill="#9a9a9a" />
        <circle cx="90" cy="70" r="2" fill="#444" />
      </g>
    </svg>
  );
}
