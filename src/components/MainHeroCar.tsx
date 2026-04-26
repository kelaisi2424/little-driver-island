// 首页主视觉：一辆很大的卡通汽车，带轻浮动 + 轮胎转 + 大灯闪。
// 不依赖外部图片。

interface MainHeroCarProps {
  bodyColor?: string;
}

export default function MainHeroCar({ bodyColor = '#ff7e7e' }: MainHeroCarProps) {
  return (
    <div className="hero-car-wrap" aria-hidden>
      <svg viewBox="0 0 280 180" className="hero-car-svg">
        {/* 阴影 */}
        <ellipse cx="140" cy="170" rx="115" ry="8" fill="rgba(0,0,0,0.18)" />

        {/* 后保险杠 */}
        <rect x="22" y="118" width="236" height="18" rx="6" fill="#3a3a3a" />

        {/* 车身（侧视图） */}
        <rect x="16" y="74" width="248" height="56" rx="22" fill={bodyColor} />

        {/* 车身高光 */}
        <rect x="22" y="80" width="180" height="10" rx="5" fill="rgba(255,255,255,0.25)" />

        {/* 顶棚 */}
        <path
          d="M 70 74 L 92 36 Q 96 30 104 30 L 184 30 Q 192 30 196 38 L 218 74 Z"
          fill={bodyColor}
        />

        {/* 顶棚高光 */}
        <path d="M 84 70 L 100 36 L 130 36 L 122 70 Z" fill="rgba(255,255,255,0.20)" />

        {/* 车窗 */}
        <rect x="100" y="40" width="36" height="32" rx="6" fill="#cdeaff" />
        <rect x="142" y="40" width="48" height="32" rx="6" fill="#cdeaff" />
        <rect x="106" y="46" width="14" height="8" rx="2" fill="rgba(255,255,255,0.7)" />

        {/* 车门接缝 */}
        <line x1="140" y1="78" x2="140" y2="126" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
        {/* 把手 */}
        <rect x="124" y="98" width="14" height="3" rx="1.5" fill="rgba(0,0,0,0.25)" />
        <rect x="166" y="98" width="14" height="3" rx="1.5" fill="rgba(0,0,0,0.25)" />

        {/* 前大灯（会闪） */}
        <g className="hero-headlight">
          <circle cx="248" cy="92" r="9" fill="#fff7a3" />
          <circle cx="248" cy="92" r="5" fill="#fff" />
        </g>

        {/* 后小灯 */}
        <rect x="20" y="86" width="10" height="10" rx="3" fill="#ffd166" />

        {/* 笑脸（车头方向 - 这里用车窗中间画） */}
        <circle cx="158" cy="58" r="2.4" fill="#3a3a3a" />
        <circle cx="174" cy="58" r="2.4" fill="#3a3a3a" />
        <path
          d="M 156 66 Q 166 70 176 66"
          stroke="#3a3a3a"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* 车牌 */}
        <rect x="124" y="116" width="32" height="10" rx="2" fill="#fff" />
        <text
          x="140"
          y="124"
          textAnchor="middle"
          fontSize="8"
          fontWeight="900"
          fill="#3a3a3a"
          fontFamily="monospace"
        >
          BABY
        </text>

        {/* 轮胎（会转） */}
        <g className="hero-wheel hero-wheel-l">
          <circle cx="68" cy="138" r="22" fill="#1a1a1a" />
          <circle cx="68" cy="138" r="14" fill="#3a3a3a" />
          <circle cx="68" cy="138" r="6" fill="#9a9a9a" />
          <rect x="62" y="120" width="3" height="36" fill="#666" />
          <rect x="50" y="132" width="36" height="3" fill="#666" />
          <rect
            x="62" y="120" width="3" height="36" fill="#666"
            transform="rotate(45 68 138)"
          />
          <rect
            x="50" y="132" width="36" height="3" fill="#666"
            transform="rotate(45 68 138)"
          />
        </g>
        <g className="hero-wheel hero-wheel-r">
          <circle cx="212" cy="138" r="22" fill="#1a1a1a" />
          <circle cx="212" cy="138" r="14" fill="#3a3a3a" />
          <circle cx="212" cy="138" r="6" fill="#9a9a9a" />
          <rect x="206" y="120" width="3" height="36" fill="#666" />
          <rect x="194" y="132" width="36" height="3" fill="#666" />
          <rect
            x="206" y="120" width="3" height="36" fill="#666"
            transform="rotate(45 212 138)"
          />
          <rect
            x="194" y="132" width="36" height="3" fill="#666"
            transform="rotate(45 212 138)"
          />
        </g>
      </svg>
    </div>
  );
}
