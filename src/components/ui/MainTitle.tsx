// 首页大标题：红橙渐变 + 白色描边 + 深色阴影，像小游戏 Logo。
// 用 SVG 实现稳定的描边效果（CSS text-stroke 在中文上效果差）。

interface MainTitleProps {
  text: string;
  subtitle?: string;
}

export default function MainTitle({ text, subtitle }: MainTitleProps) {
  // SVG 用 stroke 实现描边，多层叠加：先粗白边，再彩色填充
  return (
    <div className="main-title">
      <svg
        className="main-title-svg"
        viewBox="0 0 360 60"
        preserveAspectRatio="xMidYMid meet"
        aria-label={text}
      >
        <defs>
          <linearGradient id="mt-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="40%" stopColor="#ff9b3a" />
            <stop offset="100%" stopColor="#ff3d2e" />
          </linearGradient>
        </defs>
        {/* 阴影层 */}
        <text
          x="180" y="44"
          textAnchor="middle"
          fontSize="40"
          fontWeight="900"
          fill="rgba(58, 16, 16, 0.35)"
          fontFamily='"PingFang SC","Microsoft YaHei",sans-serif'
          transform="translate(2,3)"
        >{text}</text>
        {/* 白色描边 */}
        <text
          x="180" y="44"
          textAnchor="middle"
          fontSize="40"
          fontWeight="900"
          fill="none"
          stroke="#fff"
          strokeWidth="6"
          strokeLinejoin="round"
          fontFamily='"PingFang SC","Microsoft YaHei",sans-serif'
        >{text}</text>
        {/* 深色描边（细） */}
        <text
          x="180" y="44"
          textAnchor="middle"
          fontSize="40"
          fontWeight="900"
          fill="none"
          stroke="#3a1010"
          strokeWidth="2"
          strokeLinejoin="round"
          fontFamily='"PingFang SC","Microsoft YaHei",sans-serif'
        >{text}</text>
        {/* 渐变填充 */}
        <text
          x="180" y="44"
          textAnchor="middle"
          fontSize="40"
          fontWeight="900"
          fill="url(#mt-gradient)"
          fontFamily='"PingFang SC","Microsoft YaHei",sans-serif'
        >{text}</text>
      </svg>
      {subtitle && <p className="main-subtitle">{subtitle}</p>}
    </div>
  );
}
