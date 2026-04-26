// 玩家小车 SVG，正视图（车头朝上），适合从后方看到向前开。

interface PlayerCarProps {
  bodyColor?: string;
  shake?: boolean;
}

export default function PlayerCar({ bodyColor = '#ff7e7e', shake = false }: PlayerCarProps) {
  return (
    <svg
      viewBox="0 0 100 140"
      width="100%"
      height="100%"
      className={shake ? 'player-car shake' : 'player-car'}
    >
      {/* 阴影 */}
      <ellipse cx="50" cy="132" rx="36" ry="4" fill="rgba(0,0,0,0.22)" />

      {/* 后保险杠 */}
      <rect x="14" y="118" width="72" height="10" rx="4" fill="#3a3a3a" />

      {/* 车身（从后看的梯形） */}
      <path
        d="M 18 30 Q 22 18 32 18 L 68 18 Q 78 18 82 30 L 88 118 L 12 118 Z"
        fill={bodyColor}
      />

      {/* 车身高光 */}
      <path
        d="M 26 36 Q 30 26 38 26 L 50 26 L 48 70 L 22 70 Z"
        fill="rgba(255,255,255,0.18)"
      />

      {/* 后挡风玻璃 */}
      <path
        d="M 30 28 Q 34 22 42 22 L 58 22 Q 66 22 70 28 L 72 50 L 28 50 Z"
        fill="#3a587a"
      />

      {/* 后窗玻璃高光 */}
      <rect x="33" y="28" width="14" height="6" rx="2" fill="rgba(255,255,255,0.35)" />

      {/* 车顶（露出一小段） */}
      <rect x="32" y="14" width="36" height="8" rx="3" fill={bodyColor} opacity="0.85" />

      {/* 后车灯 */}
      <rect x="20" y="58" width="16" height="10" rx="3" fill="#ffd166" />
      <rect x="64" y="58" width="16" height="10" rx="3" fill="#ffd166" />

      {/* 中间装饰线 */}
      <line x1="50" y1="55" x2="50" y2="115" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />

      {/* 车牌 */}
      <rect x="38" y="98" width="24" height="10" rx="2" fill="#fff" />
      <text
        x="50"
        y="106"
        textAnchor="middle"
        fontSize="7"
        fontWeight="900"
        fill="#3a3a3a"
        fontFamily="monospace"
      >
        BABY
      </text>

      {/* 排气管 */}
      <rect x="22" y="125" width="8" height="5" rx="2" fill="#666" />
      <rect x="70" y="125" width="8" height="5" rx="2" fill="#666" />

      {/* 后视镜 */}
      <ellipse cx="14" cy="42" rx="5" ry="6" fill={bodyColor} />
      <ellipse cx="86" cy="42" rx="5" ry="6" fill={bodyColor} />
      <circle cx="14" cy="42" r="2" fill="#3a587a" />
      <circle cx="86" cy="42" r="2" fill="#3a587a" />

      {/* 轮胎（侧面凸出小块） */}
      <rect x="6" y="78" width="10" height="32" rx="3" fill="#1a1a1a" />
      <rect x="84" y="78" width="10" height="32" rx="3" fill="#1a1a1a" />
    </svg>
  );
}
