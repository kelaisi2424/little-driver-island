// 高质量卡通汽车 SVG。可作为首页主视觉 / 选关地图小图标 / 通关页装饰。
// 全部矢量绘制，自带渐变、高光、阴影、轮胎旋转动画。

interface CartoonCarProps {
  size?: number;
  bodyColor?: string;
  variant?: 'side' | 'small';   // side = 侧视图（首页主视觉）；small = 用作图标
  spinning?: boolean;            // 轮胎是否旋转
  bobbing?: boolean;             // 整车是否上下浮动
  glow?: boolean;                // 大灯是否闪烁
  className?: string;
}

let uid = 0;
const newId = () => `cc${++uid}`;

export default function CartoonCar({
  size = 240,
  bodyColor = '#ff5e3a',
  variant = 'side',
  spinning = true,
  bobbing = true,
  glow = true,
  className,
}: CartoonCarProps) {
  const id = newId();
  const bodyGradId = `${id}-body`;
  const roofGradId = `${id}-roof`;
  const windowGradId = `${id}-win`;
  const tireGradId = `${id}-tire`;
  const lightGradId = `${id}-light`;

  const wrapClass = [
    'cartoon-car',
    bobbing ? 'is-bobbing' : '',
    glow ? 'is-glowing' : '',
    spinning ? 'is-spinning' : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  if (variant === 'small') {
    // 小型图标版（用于关卡节点等）
    return (
      <svg
        viewBox="0 0 80 60"
        width={size}
        height={size * 0.75}
        className={wrapClass}
        aria-hidden
      >
        <defs>
          <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighten(bodyColor, 0.18)} />
            <stop offset="100%" stopColor={bodyColor} />
          </linearGradient>
        </defs>
        <ellipse cx="40" cy="55" rx="30" ry="3" fill="rgba(0,0,0,0.18)" />
        <rect x="6" y="22" width="68" height="22" rx="9" fill={`url(#${bodyGradId})`} stroke="#3a1010" strokeWidth="2" />
        <path d="M 22 22 L 28 10 Q 30 8 33 8 L 52 8 Q 56 8 58 12 L 64 22 Z" fill={`url(#${bodyGradId})`} stroke="#3a1010" strokeWidth="2" />
        <rect x="28" y="11" width="14" height="11" rx="3" fill="#cdeaff" />
        <rect x="44" y="11" width="14" height="11" rx="3" fill="#cdeaff" />
        <circle cx="22" cy="48" r="8" fill="#1a1a1a" />
        <circle cx="22" cy="48" r="3.5" fill="#9a9a9a" />
        <circle cx="58" cy="48" r="8" fill="#1a1a1a" />
        <circle cx="58" cy="48" r="3.5" fill="#9a9a9a" />
      </svg>
    );
  }

  // side：完整侧视图（首页主视觉用）
  return (
    <svg
      viewBox="0 0 320 200"
      width={size}
      height={size * 200 / 320}
      className={wrapClass}
      aria-hidden
    >
      <defs>
        {/* 车身渐变 */}
        <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(bodyColor, 0.22)} />
          <stop offset="55%" stopColor={bodyColor} />
          <stop offset="100%" stopColor={darken(bodyColor, 0.18)} />
        </linearGradient>
        {/* 顶棚渐变 */}
        <linearGradient id={roofGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(bodyColor, 0.15)} />
          <stop offset="100%" stopColor={bodyColor} />
        </linearGradient>
        {/* 车窗渐变（玻璃感） */}
        <linearGradient id={windowGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfe2ff" />
          <stop offset="55%" stopColor="#7ab9e8" />
          <stop offset="100%" stopColor="#4f8db7" />
        </linearGradient>
        {/* 轮胎渐变 */}
        <radialGradient id={tireGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5a5a5a" />
          <stop offset="65%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </radialGradient>
        {/* 大灯渐变 */}
        <radialGradient id={lightGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fff7a3" />
          <stop offset="100%" stopColor="#ffd166" />
        </radialGradient>
      </defs>

      {/* 地面阴影 */}
      <ellipse cx="160" cy="186" rx="135" ry="10" fill="rgba(0,0,0,0.22)" />

      {/* 后保险杠（深色底） */}
      <rect x="30" y="130" width="260" height="20" rx="8" fill="#3a1a14" />

      {/* 主车身 */}
      <rect
        x="20" y="78" width="280" height="62" rx="26"
        fill={`url(#${bodyGradId})`}
        stroke="#3a1010" strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* 车身高光带（顶部细线） */}
      <rect x="34" y="86" width="226" height="6" rx="3" fill="rgba(255,255,255,0.5)" />

      {/* 顶棚 */}
      <path
        d="M 86 78 L 110 38 Q 116 30 126 30 L 208 30 Q 218 30 224 40 L 246 78 Z"
        fill={`url(#${roofGradId})`}
        stroke="#3a1010" strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* 顶棚高光 */}
      <path d="M 100 75 L 122 40 L 158 40 L 148 75 Z" fill="rgba(255,255,255,0.28)" />

      {/* 车窗（前 + 后，中间车柱） */}
      <rect x="120" y="44" width="40" height="32" rx="6" fill={`url(#${windowGradId})`} stroke="#3a1010" strokeWidth="2.5" />
      <rect x="166" y="44" width="56" height="32" rx="6" fill={`url(#${windowGradId})`} stroke="#3a1010" strokeWidth="2.5" />
      {/* 车窗强光 */}
      <path d="M 124 50 L 140 50 L 132 64 L 124 64 Z" fill="rgba(255,255,255,0.5)" />
      <path d="M 170 50 L 188 50 L 178 66 L 170 66 Z" fill="rgba(255,255,255,0.42)" />

      {/* 车门接缝 */}
      <line x1="160" y1="82" x2="160" y2="138" stroke="rgba(0,0,0,0.28)" strokeWidth="2.5" strokeLinecap="round" />
      {/* 把手 */}
      <rect x="138" y="108" width="16" height="4" rx="2" fill="rgba(0,0,0,0.42)" />
      <rect x="180" y="108" width="16" height="4" rx="2" fill="rgba(0,0,0,0.42)" />

      {/* 前大灯 */}
      <g className="cc-headlight">
        <circle cx="282" cy="100" r="13" fill={`url(#${lightGradId})`} stroke="#3a1010" strokeWidth="2" />
        <circle cx="280" cy="98" r="4" fill="#ffffff" opacity="0.85" />
      </g>

      {/* 后小尾灯 */}
      <rect x="22" y="92" width="14" height="14" rx="4" fill="#ffd166" stroke="#3a1010" strokeWidth="2" />

      {/* 笑脸（在前部车窗内表达"车有人"） */}
      <g className="cc-face">
        <circle cx="178" cy="60" r="2.6" fill="#3a1010" />
        <circle cx="194" cy="60" r="2.6" fill="#3a1010" />
        <path d="M 176 68 Q 186 74 196 68" stroke="#3a1010" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>

      {/* 车牌 BABY */}
      <rect x="138" y="118" width="44" height="14" rx="3" fill="#fff" stroke="#3a1010" strokeWidth="1.5" />
      <text x="160" y="129" textAnchor="middle" fontSize="10" fontWeight="900" fill="#3a1010" fontFamily="monospace">BABY</text>

      {/* 后视镜 */}
      <ellipse cx="98" cy="90" rx="6" ry="8" fill={bodyColor} stroke="#3a1010" strokeWidth="2" />
      <ellipse cx="246" cy="90" rx="6" ry="8" fill={bodyColor} stroke="#3a1010" strokeWidth="2" />

      {/* 轮胎 */}
      <g className="cc-wheel cc-wheel-l">
        <circle cx="78" cy="150" r="26" fill={`url(#${tireGradId})`} stroke="#3a1010" strokeWidth="2.5" />
        <circle cx="78" cy="150" r="14" fill="#5a5a5a" stroke="#1a1a1a" strokeWidth="1.5" />
        <circle cx="78" cy="150" r="6" fill="#2a2a2a" />
        {/* 轮辐 */}
        <g stroke="#bcbcbc" strokeWidth="2.5" strokeLinecap="round">
          <line x1="78" y1="138" x2="78" y2="162" />
          <line x1="66" y1="150" x2="90" y2="150" />
          <line x1="69" y1="141" x2="87" y2="159" />
          <line x1="69" y1="159" x2="87" y2="141" />
        </g>
      </g>
      <g className="cc-wheel cc-wheel-r">
        <circle cx="242" cy="150" r="26" fill={`url(#${tireGradId})`} stroke="#3a1010" strokeWidth="2.5" />
        <circle cx="242" cy="150" r="14" fill="#5a5a5a" stroke="#1a1a1a" strokeWidth="1.5" />
        <circle cx="242" cy="150" r="6" fill="#2a2a2a" />
        <g stroke="#bcbcbc" strokeWidth="2.5" strokeLinecap="round">
          <line x1="242" y1="138" x2="242" y2="162" />
          <line x1="230" y1="150" x2="254" y2="150" />
          <line x1="233" y1="141" x2="251" y2="159" />
          <line x1="233" y1="159" x2="251" y2="141" />
        </g>
      </g>
    </svg>
  );
}

// 颜色辅助：把 hex 颜色变亮 / 变暗
function lighten(hex: string, amount: number): string {
  return mix(hex, '#ffffff', amount);
}
function darken(hex: string, amount: number): string {
  return mix(hex, '#000000', amount);
}
function mix(c1: string, c2: string, amount: number): string {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  if (!a || !b) return c1;
  const r = Math.round(a.r + (b.r - a.r) * amount);
  const g = Math.round(a.g + (b.g - a.g) * amount);
  const bl = Math.round(a.b + (b.b - a.b) * amount);
  return `rgb(${r}, ${g}, ${bl})`;
}
function hexToRgb(h: string): { r: number; g: number; b: number } | null {
  const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
