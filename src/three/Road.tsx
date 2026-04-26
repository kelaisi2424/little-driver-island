// v1.6 升级：路面分段 + 黄色双向线 + 路沿砖块 + 边缘草地 + 路灯/路牌/树
// 视觉目标：从"黑板路"升级为"卡通赛道"。
// 性能：复用 geometry/material（树、路灯、路牌都是 useMemo 共享几何）。

import { useMemo } from 'react';

interface RoadProps {
  length: number;
}

function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      {/* 圆形假阴影 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial color="black" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* 树干 */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.0, 8]} />
        <meshStandardMaterial color="#7a4a25" roughness={0.85} />
      </mesh>
      {/* 多层球叶（更立体） */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.55, 14, 10]} />
        <meshStandardMaterial color="#3aa86a" roughness={0.85} />
      </mesh>
      <mesh position={[0.18, 1.32, 0.05]}>
        <sphereGeometry args={[0.4, 12, 10]} />
        <meshStandardMaterial color="#4cbf78" roughness={0.85} />
      </mesh>
      <mesh position={[-0.18, 1.34, -0.06]}>
        <sphereGeometry args={[0.36, 12, 10]} />
        <meshStandardMaterial color="#2f9858" roughness={0.85} />
      </mesh>
    </group>
  );
}

function StreetLight({ x, z, side }: { x: number; z: number; side: 'left' | 'right' }) {
  const armDir = side === 'left' ? 1 : -1;
  return (
    <group position={[x, 0, z]}>
      {/* 阴影 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 14]} />
        <meshBasicMaterial color="black" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {/* 灯柱 */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 2.4, 10]} />
        <meshStandardMaterial color="#5d6770" roughness={0.42} metalness={0.5} />
      </mesh>
      {/* 横臂 */}
      <mesh position={[armDir * 0.35, 2.32, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.06]} />
        <meshStandardMaterial color="#5d6770" roughness={0.42} metalness={0.5} />
      </mesh>
      {/* 灯头 */}
      <mesh position={[armDir * 0.65, 2.28, 0]}>
        <boxGeometry args={[0.32, 0.12, 0.18]} />
        <meshStandardMaterial color="#3a3f44" roughness={0.4} />
      </mesh>
      {/* 灯泡 emissive */}
      <mesh position={[armDir * 0.65, 2.18, 0]}>
        <sphereGeometry args={[0.12, 14, 10]} />
        <meshStandardMaterial color="#fff8c2" emissive="#ffd56a" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

function ArrowSign({ x, z, flip = false }: { x: number; z: number; flip?: boolean }) {
  return (
    <group position={[x, 0, z]} rotation={[0, flip ? Math.PI : 0, 0]}>
      {/* 阴影 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 12]} />
        <meshBasicMaterial color="black" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {/* 杆 */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 1.7, 8]} />
        <meshStandardMaterial color="#a4abb0" roughness={0.45} metalness={0.5} />
      </mesh>
      {/* 牌底（黄色菱形圆角矩形） */}
      <mesh position={[0, 1.7, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.55, 0.55, 0.05]} />
        <meshStandardMaterial color="#ffcc4d" emissive="#ffaa00" emissiveIntensity={0.18} roughness={0.4} />
      </mesh>
      {/* 黑色箭头（往前指） */}
      <mesh position={[0, 1.7, -0.03]}>
        <boxGeometry args={[0.36, 0.08, 0.02]} />
        <meshStandardMaterial color="#231a14" roughness={0.5} />
      </mesh>
      <mesh position={[0.13, 1.7, -0.03]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.18, 0.08, 0.02]} />
        <meshStandardMaterial color="#231a14" roughness={0.5} />
      </mesh>
      <mesh position={[0.13, 1.7, -0.03]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.18, 0.08, 0.02]} />
        <meshStandardMaterial color="#231a14" roughness={0.5} />
      </mesh>
    </group>
  );
}

function CurbBlock({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <mesh position={[x, 0.08, z]}>
      <boxGeometry args={[0.42, 0.12, 0.5]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  );
}

export default function Road({ length }: RoadProps) {
  const centerZ = -length / 2 + 8;
  const dashCount = Math.floor(length / 7);
  const segmentCount = Math.ceil(length / 10);
  const decorCount = Math.floor(length / 14);

  // v1.6: 红白路沿砖（沿路两侧交替），用 useMemo 计算位置
  const curbBlocks = useMemo(() => {
    const list: Array<{ x: number; z: number; color: string }> = [];
    const blockCount = Math.ceil(length / 1.0);
    for (let i = 0; i < blockCount; i++) {
      const z = -i * 1.0;
      const isRed = i % 2 === 0;
      list.push({ x: -4.7, z, color: isRed ? '#e63946' : '#f8f8f8' });
      list.push({ x: 4.7, z, color: isRed ? '#e63946' : '#f8f8f8' });
    }
    return list;
  }, [length]);

  return (
    <group>
      {/* 草地（深绿，更宽，让路看起来真"在城市中") */}
      <mesh position={[0, -0.13, centerZ]} receiveShadow={false}>
        <boxGeometry args={[68, 0.06, length + 60]} />
        <meshStandardMaterial color="#5db35a" roughness={0.95} />
      </mesh>
      {/* 草地表面纹理（浅色斑驳） */}
      <mesh position={[0, -0.105, centerZ]}>
        <boxGeometry args={[68, 0.02, length + 60]} />
        <meshStandardMaterial color="#6dc46b" roughness={0.95} transparent opacity={0.5} />
      </mesh>

      {/* v1.6: 路面分段，更深沥青色 */}
      {Array.from({ length: segmentCount }).map((_, index) => (
        <mesh key={`road-segment-${index}`} position={[0, -0.05, -index * 10 + 3]}>
          <boxGeometry args={[8.6, 0.08, 10.05]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#2c3236' : '#33393d'} roughness={0.78} />
        </mesh>
      ))}

      {/* v1.6: 道路边缘黄色实线（加上发光，赛车氛围） */}
      <mesh position={[-4.18, 0.0, centerZ]}>
        <boxGeometry args={[0.12, 0.05, length]} />
        <meshStandardMaterial color="#fff7c2" emissive="#ffe066" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[4.18, 0.0, centerZ]}>
        <boxGeometry args={[0.12, 0.05, length]} />
        <meshStandardMaterial color="#fff7c2" emissive="#ffe066" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>

      {/* v1.6: 中央双黄实线（一条粗一条细，分隔上下行） */}
      <mesh position={[-0.13, 0.0, centerZ]}>
        <boxGeometry args={[0.1, 0.04, length]} />
        <meshStandardMaterial color="#ffd54a" emissive="#ffc107" emissiveIntensity={0.3} roughness={0.3} />
      </mesh>
      <mesh position={[0.13, 0.0, centerZ]}>
        <boxGeometry args={[0.1, 0.04, length]} />
        <meshStandardMaterial color="#ffd54a" emissive="#ffc107" emissiveIntensity={0.3} roughness={0.3} />
      </mesh>

      {/* v1.6: 车道分隔白虚线（保持原有，但加宽 + 更亮，速度感更强） */}
      {Array.from({ length: dashCount }).map((_, index) => (
        <mesh key={`dash-${index}`} position={[-2.15, 0.01, -index * 7 - 2.5]}>
          <boxGeometry args={[0.32, 0.05, 3.6]} />
          <meshStandardMaterial color="#fff7e0" emissive="#fff" emissiveIntensity={0.5} roughness={0.28} />
        </mesh>
      ))}
      {Array.from({ length: dashCount }).map((_, index) => (
        <mesh key={`dash-r-${index}`} position={[2.15, 0.01, -index * 7 - 2.5]}>
          <boxGeometry args={[0.32, 0.05, 3.6]} />
          <meshStandardMaterial color="#fff7e0" emissive="#fff" emissiveIntensity={0.5} roughness={0.28} />
        </mesh>
      ))}

      {/* v1.6: 红白路沿砖（让道路边缘从灰条升级为赛车标志条） */}
      {curbBlocks.map((b, i) => (
        <CurbBlock key={`curb-${i}`} x={b.x} z={b.z} color={b.color} />
      ))}

      {/* v1.6: 外围护栏（白色金属杆，立在路沿外侧） */}
      <mesh position={[-5.05, 0.45, centerZ]}>
        <boxGeometry args={[0.08, 0.16, length * 0.96]} />
        <meshStandardMaterial color="#e8edf0" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[5.05, 0.45, centerZ]}>
        <boxGeometry args={[0.08, 0.16, length * 0.96]} />
        <meshStandardMaterial color="#e8edf0" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* v1.6 斑马线：升级条数 + 厚度 */}
      <group position={[0, 0.025, -18]}>
        {Array.from({ length: 8 }).map((_, index) => (
          <mesh key={`zebra-${index}`} position={[-3.5 + index * 1, 0.005, 0]}>
            <boxGeometry args={[0.7, 0.04, 2.6]} />
            <meshStandardMaterial color="#fafafa" emissive="#fff" emissiveIntensity={0.15} roughness={0.32} />
          </mesh>
        ))}
      </group>

      {/* 道路装饰：每 14 米一组（路灯 + 路牌 + 树 + 灌木） */}
      {Array.from({ length: decorCount }).map((_, index) => {
        const z = -12 - index * 14;
        const leftSide = index % 2 === 0;
        return (
          <group key={`decor-${index}`}>
            <ArrowSign x={leftSide ? -5.85 : 5.85} z={z - 2} flip={leftSide} />
            <StreetLight x={leftSide ? 5.85 : -5.85} z={z - 7} side={leftSide ? 'right' : 'left'} />
            <Tree x={leftSide ? -7.6 : 7.6} z={z - 4} scale={0.95 + (index % 3) * 0.18} />
            <Tree x={leftSide ? -8.2 : 8.2} z={z - 9} scale={0.7 + (index % 4) * 0.1} />
            {/* 灌木丛 */}
            <mesh position={[leftSide ? 7.0 : -7.0, 0.18, z + 2]}>
              <sphereGeometry args={[0.32, 12, 8]} />
              <meshStandardMaterial color="#3a8a4f" roughness={0.92} />
            </mesh>
            <mesh position={[leftSide ? 7.4 : -7.4, 0.16, z + 2.5]}>
              <sphereGeometry args={[0.26, 12, 8]} />
              <meshStandardMaterial color="#46a55c" roughness={0.92} />
            </mesh>
          </group>
        );
      })}

      {/* v1.6 远处低模"山"剪影（三角，让远景有层次） */}
      <mesh position={[-22, 4, -length - 8]}>
        <coneGeometry args={[8, 8, 6]} />
        <meshStandardMaterial color="#7d9aaf" roughness={0.95} transparent opacity={0.7} />
      </mesh>
      <mesh position={[22, 5, -length - 12]}>
        <coneGeometry args={[10, 10, 6]} />
        <meshStandardMaterial color="#6c8aa0" roughness={0.95} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 3.5, -length - 18]}>
        <coneGeometry args={[7, 7, 6]} />
        <meshStandardMaterial color="#8aa6ba" roughness={0.95} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
