// v1.9 任务 3D 物体：根据 gameplayType 在场景里添加对应物体
// - 小朋友（接送）
// - 颜色屋（送货）
// - 数字门（数字车道）
// - 颜色门（颜色路线）
// - 站点标记（多站点）
// - 红绿灯（交规）
// - 斑马线 + 行人（让行）
// - 水坑（雨天）
// 都是低模 / 简单形状，不引入贴图。

import { useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { Level3D } from '../data/levels3d';
import type { StoryMission } from '../data/storyMissions';
import { COLOR_TABLE, type MissionProgress, type ColorKey } from './missionObjectives';

interface MissionObjectsProps {
  level: Level3D;
  mission: StoryMission;
  progressRef: RefObject<MissionProgress>;
}

// =====================================================================
// 子物体组件
// =====================================================================

function Passenger({
  x,
  z,
  color,
  hidden,
}: { x: number; z: number; color: ColorKey; hidden: boolean }) {
  const groupRef = useRef<THREE.Group | null>(null);
  useFrame(() => {
    if (groupRef.current && !hidden) {
      // 招手小动画
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.004 + x * 7 + z * 3) * 0.15;
    }
  });
  if (hidden) return null;
  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* 假阴影 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 16]} />
        <meshBasicMaterial color="black" transparent opacity={0.32} depthWrite={false} />
      </mesh>
      {/* 身体（衣服色） */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.7, 14]} />
        <meshStandardMaterial color={COLOR_TABLE[color].hex} roughness={0.5} />
      </mesh>
      {/* 头 */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.6} />
      </mesh>
      {/* 双眼 */}
      <mesh position={[-0.08, 1.05, 0.18]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.08, 1.05, 0.18]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* 嘴 */}
      <mesh position={[0, 0.96, 0.2]}>
        <boxGeometry args={[0.1, 0.02, 0.02]} />
        <meshStandardMaterial color="#7f1d1d" />
      </mesh>
      {/* 头顶小帽（颜色与衣服同） */}
      <mesh position={[0, 1.22, 0]}>
        <coneGeometry args={[0.18, 0.2, 14]} />
        <meshStandardMaterial color={COLOR_TABLE[color].hex} roughness={0.5} />
      </mesh>
      {/* 招手"等车"气泡 */}
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#fffae0" emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
}

function ColorHouse({
  x,
  z,
  color,
  isTarget,
}: { x: number; z: number; color: ColorKey; isTarget: boolean }) {
  const ref = useRef<THREE.Group | null>(null);
  useFrame(() => {
    if (ref.current && isTarget) {
      // 目标屋子轻微脉动
      const s = 1 + Math.sin(Date.now() * 0.004) * 0.05;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <group ref={ref} position={[x, 0, z]}>
      {/* 阴影 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 18]} />
        <meshBasicMaterial color="black" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {/* 屋子主体 */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.4, 1.1, 1.4]} />
        <meshStandardMaterial color={COLOR_TABLE[color].hex} roughness={0.5} />
      </mesh>
      {/* 屋顶（深色三角） */}
      <mesh position={[0, 1.42, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.05, 0.6, 4]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
      </mesh>
      {/* 门 */}
      <mesh position={[0, 0.4, 0.71]}>
        <boxGeometry args={[0.4, 0.7, 0.05]} />
        <meshStandardMaterial color="#3f2a14" roughness={0.7} />
      </mesh>
      {/* 窗 */}
      <mesh position={[-0.4, 0.75, 0.71]}>
        <boxGeometry args={[0.28, 0.28, 0.04]} />
        <meshStandardMaterial color="#bfe5ff" emissive="#bfe5ff" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0.4, 0.75, 0.71]}>
        <boxGeometry args={[0.28, 0.28, 0.04]} />
        <meshStandardMaterial color="#bfe5ff" emissive="#bfe5ff" emissiveIntensity={0.45} />
      </mesh>
      {/* 目标光圈 */}
      {isTarget && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <torusGeometry args={[1.4, 0.1, 14, 36]} />
          <meshStandardMaterial
            color={COLOR_TABLE[color].hex}
            emissive={COLOR_TABLE[color].hex}
            emissiveIntensity={1.4}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}
    </group>
  );
}

function NumberGate({ x, z, num, isTarget }: { x: number; z: number; num: number; isTarget: boolean }) {
  // 用门型 + 大数字（数字用白色长方块拼）
  return (
    <group position={[x, 0, z]}>
      {/* 阴影 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 18]} />
        <meshBasicMaterial color="black" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* 立柱 */}
      <mesh position={[-1.4, 1.4, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 2.8, 12]} />
        <meshStandardMaterial color={isTarget ? '#16a34a' : '#94a3b8'} emissive={isTarget ? '#16a34a' : '#000'} emissiveIntensity={isTarget ? 0.5 : 0} />
      </mesh>
      <mesh position={[1.4, 1.4, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 2.8, 12]} />
        <meshStandardMaterial color={isTarget ? '#16a34a' : '#94a3b8'} emissive={isTarget ? '#16a34a' : '#000'} emissiveIntensity={isTarget ? 0.5 : 0} />
      </mesh>
      {/* 顶横梁（数字面板） */}
      <mesh position={[0, 2.7, 0]}>
        <boxGeometry args={[3.0, 0.6, 0.3]} />
        <meshStandardMaterial color={isTarget ? '#22c55e' : '#475569'} roughness={0.4} />
      </mesh>
      {/* 大数字（用 emissive 白板模拟） */}
      <mesh position={[0, 2.7, 0.18]}>
        <boxGeometry args={[0.78, 0.5, 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
      {/* 数字字（用文字几何替代——黑色 box，按 num 不同布局） */}
      <DigitMesh num={num} />
      {/* 地面发光 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <torusGeometry args={[1.4, 0.1, 14, 36]} />
        <meshStandardMaterial
          color={isTarget ? '#86efac' : '#94a3b8'}
          emissive={isTarget ? '#22c55e' : '#475569'}
          emissiveIntensity={isTarget ? 1.4 : 0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

function DigitMesh({ num }: { num: number }) {
  // 简化：1-5 用 box 拼"7 段数字"概念。极简版只画大致形状。
  // 1: 单竖
  // 2: ⌐ 形
  // 3: ⊃ 形
  // 4: ⊢
  // 5: ⊃ 反
  // 偷懒：直接 emoji 文本不可行（webgl 文字麻烦），用色块拼。
  // 这里用 5 个粗短 box 组合最简数字。
  const blocks: { x: number; y: number; w: number; h: number }[] = [];
  switch (num) {
    case 1:
      blocks.push({ x: 0, y: 0, w: 0.08, h: 0.36 });
      break;
    case 2:
      blocks.push({ x: 0, y: 0.16, w: 0.32, h: 0.06 });
      blocks.push({ x: 0.13, y: 0.05, w: 0.06, h: 0.25 });
      blocks.push({ x: 0, y: 0, w: 0.32, h: 0.06 });
      blocks.push({ x: -0.13, y: -0.06, w: 0.06, h: 0.16 });
      blocks.push({ x: 0, y: -0.16, w: 0.32, h: 0.06 });
      break;
    case 3:
      blocks.push({ x: 0, y: 0.16, w: 0.32, h: 0.06 });
      blocks.push({ x: 0, y: 0, w: 0.32, h: 0.06 });
      blocks.push({ x: 0, y: -0.16, w: 0.32, h: 0.06 });
      blocks.push({ x: 0.13, y: 0.05, w: 0.06, h: 0.25 });
      blocks.push({ x: 0.13, y: -0.06, w: 0.06, h: 0.16 });
      break;
    case 4:
      blocks.push({ x: -0.12, y: 0.06, w: 0.06, h: 0.3 });
      blocks.push({ x: 0.12, y: 0, w: 0.06, h: 0.36 });
      blocks.push({ x: 0, y: 0, w: 0.32, h: 0.06 });
      break;
    case 5:
      blocks.push({ x: 0, y: 0.16, w: 0.32, h: 0.06 });
      blocks.push({ x: -0.13, y: 0.05, w: 0.06, h: 0.16 });
      blocks.push({ x: 0, y: 0, w: 0.32, h: 0.06 });
      blocks.push({ x: 0.13, y: -0.06, w: 0.06, h: 0.16 });
      blocks.push({ x: 0, y: -0.16, w: 0.32, h: 0.06 });
      break;
    default:
      blocks.push({ x: 0, y: 0, w: 0.08, h: 0.36 });
  }
  return (
    <>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, 2.7 + b.y, 0.22]}>
          <boxGeometry args={[b.w, b.h, 0.04]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
    </>
  );
}

function ColorGate({ x, z, color, isTarget }: { x: number; z: number; color: ColorKey; isTarget: boolean }) {
  const c = COLOR_TABLE[color].hex;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[-1.4, 1.4, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 2.8, 12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={isTarget ? 0.9 : 0.4} />
      </mesh>
      <mesh position={[1.4, 1.4, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 2.8, 12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={isTarget ? 0.9 : 0.4} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <boxGeometry args={[3.0, 0.4, 0.22]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={isTarget ? 0.6 : 0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <torusGeometry args={[1.4, 0.12, 14, 36]} />
        <meshStandardMaterial
          color={c}
          emissive={c}
          emissiveIntensity={isTarget ? 1.6 : 0.6}
          transparent
          opacity={0.88}
        />
      </mesh>
    </group>
  );
}

function StopMarker({
  x, z, num, picked,
}: { x: number; z: number; num: number; picked: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 18]} />
        <meshBasicMaterial color="black" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 2.0, 10]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[0.62, 0.42, 0.05]} />
        <meshStandardMaterial color={picked ? '#16a34a' : '#3b82f6'} emissive={picked ? '#16a34a' : '#3b82f6'} emissiveIntensity={picked ? 0.8 : 0.5} />
      </mesh>
      <DigitMesh num={num} />
    </group>
  );
}

function Puddle({ x, z }: { x: number; z: number }) {
  // 蓝色椭圆扁盘 + 边缘亮蓝
  return (
    <group position={[x, 0.02, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 24]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.4} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <torusGeometry args={[0.85, 0.07, 12, 32]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.55} />
      </mesh>
    </group>
  );
}

function CrosswalkAndStopLine({ z }: { z: number }) {
  return (
    <group>
      {/* 停止线（白色实线） */}
      <mesh position={[0, 0.045, z + 3]}>
        <boxGeometry args={[8.4, 0.04, 0.32]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.6} />
      </mesh>
      {/* 斑马线 */}
      <group position={[0, 0.04, z]}>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-3.5 + i * 0.85, 0.005, 0]}>
            <boxGeometry args={[0.62, 0.04, 2.4]} />
            <meshStandardMaterial color="#fafafa" emissive="#fff" emissiveIntensity={0.18} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Pedestrian({
  z,
  progressRef,
}: { z: number; progressRef: RefObject<MissionProgress> }) {
  const ref = useRef<THREE.Group | null>(null);
  useFrame(() => {
    const p = progressRef.current;
    if (!ref.current || !p) return;
    if (!p.pedestrianStarted) {
      ref.current.position.x = -5;
      return;
    }
    // 从左 -5 走到右 5
    ref.current.position.x = -5 + p.pedestrianCrossingProgress * 10;
    ref.current.rotation.y = Math.sin(Date.now() * 0.012) * 0.15;
  });
  return (
    <group ref={ref} position={[-5, 0, z]}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
        <meshStandardMaterial color="#ec4899" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.6} />
      </mesh>
    </group>
  );
}

function MissionTrafficLight({
  z,
  greenPhase,
  redPhase,
  cycleSeconds,
}: {
  z: number;
  greenPhase: number;
  redPhase: number;
  cycleSeconds: number;
}) {
  const redRef = useRef<THREE.Mesh | null>(null);
  const yellowRef = useRef<THREE.Mesh | null>(null);
  const greenRef = useRef<THREE.Mesh | null>(null);
  useFrame(() => {
    const phase = ((Date.now() / 1000) % cycleSeconds + cycleSeconds) % cycleSeconds;
    const isRed = phase < redPhase;
    const isYellow = !isRed && phase < redPhase + 1.0;
    const isGreen = !isRed && !isYellow;
    if (redRef.current) (redRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = isRed ? 1.5 : 0.05;
    if (yellowRef.current) (yellowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = isYellow ? 1.5 : 0.05;
    if (greenRef.current) (greenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = isGreen ? 1.5 : 0.05;
    void greenPhase;
  });
  return (
    <group position={[3.4, 0, z]}>
      {/* 杆 */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 2.8, 10]} />
        <meshStandardMaterial color="#3a4144" />
      </mesh>
      {/* 灯壳 */}
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[0.4, 1.0, 0.32]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* 红灯 */}
      <mesh ref={redRef} position={[0, 2.95, 0.18]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#ff4f4f" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      {/* 黄灯 */}
      <mesh ref={yellowRef} position={[0, 2.6, 0.18]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#fcd34d" emissive="#fbbf24" emissiveIntensity={0.05} />
      </mesh>
      {/* 绿灯 */}
      <mesh ref={greenRef} position={[0, 2.25, 0.18]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#86efac" emissive="#16a34a" emissiveIntensity={0.05} />
      </mesh>
    </group>
  );
}

function CargoOnCar({ emoji }: { emoji: string }) {
  // 把货物显示成 HUD 角标比放在车上更简单 → 这里其实不放在 3D，
  // 改成在 GameHUD 上角显示。这里返回 null 占位。
  void emoji;
  return null;
}

function RainOverlay({ enabled }: { enabled: boolean }) {
  // 用一群慢慢下落的小线段模拟雨；性能极低
  const groupRef = useRef<THREE.Group | null>(null);
  const drops = useMemo(() => {
    const list: { x: number; y: number; z: number; speed: number }[] = [];
    if (!enabled) return list;
    for (let i = 0; i < 60; i++) {
      list.push({
        x: (Math.random() - 0.5) * 30,
        y: Math.random() * 14,
        z: (Math.random() - 0.5) * 50,
        speed: 8 + Math.random() * 6,
      });
    }
    return list;
  }, [enabled]);
  useFrame((_, dt) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const d = drops[i];
      if (!d) return;
      d.y -= d.speed * dt;
      if (d.y < 0) d.y = 12 + Math.random() * 4;
      child.position.set(d.x, d.y, d.z);
    });
  });
  if (!enabled) return null;
  return (
    <group ref={groupRef}>
      {drops.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshBasicMaterial color="#bfd9ff" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

// =====================================================================
// 主组件：根据 gameplayType 决定渲染什么
// =====================================================================

export default function MissionObjects({ level, mission, progressRef }: MissionObjectsProps) {
  const params = mission.missionParams;
  void level;

  // 渲染时读 progressRef.current，但 progress 是 mutable 的；
  // 为了让 React 重渲（pickup 后小朋友消失），我们用 ResetTrigger 计数器…
  // 实际上 useFrame 内的状态变化通过 hidden 计算每帧重新渲染会有 OK 表现。
  // 这里做最简版本：渲染所有物体，hidden 状态从 progressRef.current.pickedStopIndices 推。

  switch (mission.gameplayType) {
    case 'schoolPickup':
      return (
        <>
          {(params.passengerStops ?? []).map((stop, i) => (
            <PassengerWithRef
              key={`p-${i}`}
              x={stop.x}
              z={stop.z}
              color={stop.color}
              index={i}
              progressRef={progressRef}
            />
          ))}
        </>
      );
    case 'delivery':
      return (
        <>
          {(params.deliveryHouses ?? []).map((h, i) => (
            <ColorHouse key={`h-${i}`} x={h.x} z={h.z} color={h.color} isTarget={h.color === params.targetColor} />
          ))}
        </>
      );
    case 'colorRoute':
      return (
        <>
          {(params.colorGates ?? []).map((g, i) => (
            <ColorGate
              key={`cg-${i}`}
              x={g.x}
              z={g.z}
              color={g.color}
              isTarget={g.color === params.targetColor}
            />
          ))}
        </>
      );
    case 'numberLane':
      return (
        <>
          {(params.numberGates ?? []).map((g, i) => {
            const target = params.targetNumbers?.[0];
            return (
              <NumberGate key={`ng-${i}`} x={g.x} z={g.z} num={g.number} isTarget={g.number === target} />
            );
          })}
        </>
      );
    case 'multiStopRoute':
      return (
        <>
          {(params.stops ?? []).map((s, i) => (
            <StopMarkerWithRef
              key={`s-${i}`}
              x={s.x}
              z={s.z}
              num={i + 1}
              index={i}
              progressRef={progressRef}
            />
          ))}
        </>
      );
    case 'trafficRule':
      return (
        <>
          {(params.trafficLights ?? []).map((l, i) => (
            <MissionTrafficLight
              key={`tl-${i}`}
              z={l.z}
              greenPhase={l.greenPhase}
              redPhase={l.redPhase}
              cycleSeconds={l.cycleSeconds}
            />
          ))}
          {/* 在每个灯前画一条停止线 */}
          {(params.trafficLights ?? []).map((l, i) => (
            <mesh key={`sl-${i}`} position={[0, 0.045, l.z + 4]}>
              <boxGeometry args={[8.4, 0.04, 0.28]} />
              <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.55} />
            </mesh>
          ))}
        </>
      );
    case 'pedestrianYield': {
      const z = params.crosswalkZ ?? -22;
      return (
        <>
          <CrosswalkAndStopLine z={z} />
          <Pedestrian z={z} progressRef={progressRef} />
        </>
      );
    }
    case 'rainyDrive':
      return (
        <>
          {(params.puddles ?? []).map((p, i) => (
            <Puddle key={`pd-${i}`} x={p.x} z={p.z} />
          ))}
          <RainOverlay enabled />
        </>
      );
    case 'repairDelivery':
      // 货物显示由 HUD 处理；3D 场景不放
      return <CargoOnCar emoji={params.cargoEmoji ?? '🛞'} />;
    case 'parking':
    case 'simpleDrive':
    case 'mixedMission':
    default:
      // 综合任务：把所有 sub 类型的物体都画出来
      if (mission.gameplayType === 'mixedMission') {
        return <MixedMissionObjects level={level} mission={mission} progressRef={progressRef} />;
      }
      return null;
  }
}

// 包一层让小朋友能根据 progressRef 决定隐藏
function PassengerWithRef({
  x, z, color, index, progressRef,
}: { x: number; z: number; color: ColorKey; index: number; progressRef: RefObject<MissionProgress> }) {
  const ref = useRef<THREE.Group | null>(null);
  // 用 useFrame 检测是否被接走 → 设置 visible 属性
  useFrame(() => {
    const p = progressRef.current;
    if (!ref.current) return;
    const picked = p?.pickedStopIndices.includes(index) ?? false;
    ref.current.visible = !picked;
  });
  return (
    <group ref={ref}>
      <Passenger x={x} z={z} color={color} hidden={false} />
    </group>
  );
}

function StopMarkerWithRef({
  x, z, num, index, progressRef,
}: { x: number; z: number; num: number; index: number; progressRef: RefObject<MissionProgress> }) {
  const ref = useRef<THREE.Group | null>(null);
  useFrame(() => {
    const p = progressRef.current;
    if (!ref.current) return;
    const visited = p ? p.checkpointsHit > index : false;
    ref.current.scale.y = visited ? 0.4 : 1;
  });
  return (
    <group ref={ref}>
      <StopMarker x={x} z={z} num={num} picked={false} />
    </group>
  );
}

function MixedMissionObjects({ level, mission, progressRef }: MissionObjectsProps) {
  const params = mission.missionParams;
  const subs = params.subTypes ?? [];
  return (
    <>
      {subs.map((sub) => {
        const subMission = { ...mission, gameplayType: sub };
        return <MissionObjects key={sub} level={level} mission={subMission} progressRef={progressRef} />;
      })}
    </>
  );
}
