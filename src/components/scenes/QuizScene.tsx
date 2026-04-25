import type { SceneKind } from '../../data/safetyQuizzes';
import CarSvg from '../CarSvg';

interface QuizSceneProps {
  scene: SceneKind;
}

// 安全题的场景插画。纯 SVG/CSS/emoji，无外部图片依赖。
export default function QuizScene({ scene }: QuizSceneProps) {
  switch (scene) {
    case 'crosswalk':
      return <CrosswalkScene />;
    case 'pedestrian':
      return <PedestrianScene />;
    case 'red-light':
      return <RedLightScene />;
    case 'seatbelt':
      return <SeatbeltScene />;
    default:
      return null;
  }
}

function CrosswalkScene() {
  return (
    <div className="scene crosswalk-scene">
      <span className="cloud cloud-1" aria-hidden />
      <div className="zebra-road">
        <div className="zebra-stripes" />
      </div>
      <div className="scene-car">
        <CarSvg color="#ff8c69" size={110} />
      </div>
    </div>
  );
}

function PedestrianScene() {
  return (
    <div className="scene pedestrian-scene">
      <span className="cloud cloud-1" aria-hidden />
      <div className="ground-line" />
      <div className="scene-car">
        <CarSvg color="#4a90e2" size={100} />
      </div>
      <div className="pedestrian-walking" aria-hidden>🧒</div>
    </div>
  );
}

function RedLightScene() {
  return (
    <div className="scene redlight-scene">
      <span className="cloud cloud-1" aria-hidden />
      <div className="traffic-light scene-light" aria-hidden>
        <div className="tl-light on-red" />
        <div className="tl-light" />
        <div className="tl-light" />
      </div>
      <div className="scene-car redlight-car">
        <CarSvg color="#5cd684" size={90} />
      </div>
    </div>
  );
}

function SeatbeltScene() {
  return (
    <div className="scene seatbelt-scene" aria-hidden>
      {/* 简化的车内视图：用 SVG 画车厢 + 座位 + 小朋友 */}
      <svg viewBox="0 0 240 200" width="100%" height="100%">
        {/* 车厢轮廓 */}
        <rect x="20" y="40" width="200" height="130" rx="20" fill="#fff5e6" stroke="#d6c0a8" strokeWidth="3" />
        {/* 后窗 */}
        <rect x="36" y="56" width="60" height="44" rx="6" fill="#cdeaff" />
        <rect x="108" y="56" width="60" height="44" rx="6" fill="#cdeaff" />
        {/* 仪表台 */}
        <rect x="180" y="56" width="32" height="44" rx="6" fill="#e6d2b8" />
        <circle cx="196" cy="78" r="6" fill="#a07ad6" />
        {/* 座椅 */}
        <rect x="40" y="110" width="62" height="50" rx="10" fill="#ff9eb6" />
        <rect x="116" y="110" width="62" height="50" rx="10" fill="#ff9eb6" />
        {/* 安全带 - 在右侧座椅 */}
        <line x1="146" y1="108" x2="170" y2="155" stroke="#3a3a3a" strokeWidth="4" strokeLinecap="round" />
        <circle cx="170" cy="155" r="6" fill="#666" />
        {/* 小朋友 */}
        <g transform="translate(120, 78)">
          <circle cx="14" cy="14" r="14" fill="#ffd6b8" />
          <circle cx="9" cy="13" r="1.6" fill="#3a3a3a" />
          <circle cx="19" cy="13" r="1.6" fill="#3a3a3a" />
          <path d="M 9 19 Q 14 22 19 19" stroke="#3a3a3a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* 头顶呆毛 */}
          <path d="M 14 0 L 14 -4" stroke="#5a3a2a" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* 地面阴影 */}
        <ellipse cx="120" cy="178" rx="100" ry="6" fill="rgba(0,0,0,0.08)" />
      </svg>
    </div>
  );
}
