// 起点赛道：近宽远窄的梯形透视，自带车道虚线、起点线、草地边缘。

export default function PerspectiveTrack() {
  return (
    <svg
      className="perspective-track"
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="pt-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a5a5a" />
          <stop offset="100%" stopColor="#2e2e2e" />
        </linearGradient>
        <linearGradient id="pt-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a0d672" />
          <stop offset="100%" stopColor="#6fb45a" />
        </linearGradient>
      </defs>
      {/* 草地两侧 */}
      <polygon points="0,0 56,0 0,100" fill="url(#pt-grass)" />
      <polygon points="200,0 144,0 200,100" fill="url(#pt-grass)" />
      {/* 草地与路交界深色描边 */}
      <line x1="56" y1="0" x2="0" y2="100" stroke="#3a1010" strokeWidth="1.2" />
      <line x1="144" y1="0" x2="200" y2="100" stroke="#3a1010" strokeWidth="1.2" />

      {/* 主路面（远窄近宽） */}
      <polygon
        points="56,0 144,0 200,100 0,100"
        fill="url(#pt-road)"
      />

      {/* 起点白线（顶部） */}
      <rect x="56" y="0" width="88" height="3" fill="#fff" />
      {/* 起点黑白格 */}
      <g>
        <rect x="56" y="3" width="11" height="6" fill="#fff" />
        <rect x="78" y="3" width="11" height="6" fill="#fff" />
        <rect x="100" y="3" width="11" height="6" fill="#fff" />
        <rect x="122" y="3" width="11" height="6" fill="#fff" />
        <rect x="67" y="9" width="11" height="6" fill="#fff" />
        <rect x="89" y="9" width="11" height="6" fill="#fff" />
        <rect x="111" y="9" width="11" height="6" fill="#fff" />
        <rect x="133" y="9" width="11" height="6" fill="#fff" />
      </g>

      {/* 透视车道虚线（4 条短黄线，从远向近放大） */}
      <g fill="#ffd54a">
        <polygon points="98,30 102,30 103,38 97,38" />
        <polygon points="96,52 104,52 106,64 94,64" />
        <polygon points="92,78 108,78 112,96 88,96" />
      </g>

      {/* 路边白线 */}
      <line x1="56" y1="0" x2="0" y2="100" stroke="#fff" strokeWidth="1.5" opacity="0.85" />
      <line x1="144" y1="0" x2="200" y2="100" stroke="#fff" strokeWidth="1.5" opacity="0.85" />
    </svg>
  );
}
