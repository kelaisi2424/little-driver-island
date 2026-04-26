// v1.6 升级：低模卡通城市
// - 建筑高度/颜色/屋顶造型分 5 种
// - 每栋多 3 排窗户，远处建筑配合 fog 自然变淡
// - 增加屋顶配件（水箱 / 天线 / AC 机 / 旗子）
// - 街边广告牌保留

import { useMemo } from 'react';

interface Building {
  x: number;
  z: number;
  h: number;
  w: number;
  d: number;
  color: string;
  windowColor: string;
  fade: number;
  variant: 'flat' | 'tilt' | 'ledge' | 'water-tank' | 'antenna';
  rows: number;
}

function Billboard({ x, z, labelColor, accent }: { x: number; z: number; labelColor: string; accent: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, x < 0 ? 0.18 : -0.18, 0]}>
      {/* 阴影 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 14]} />
        <meshBasicMaterial color="black" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* 杆 */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 2.0, 8]} />
        <meshStandardMaterial color="#5d6770" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* 板 */}
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[1.85, 0.95, 0.1]} />
        <meshStandardMaterial color={labelColor} roughness={0.36} metalness={0.1} />
      </mesh>
      {/* 板边白框 */}
      <mesh position={[0, 2.05, 0.06]}>
        <boxGeometry args={[1.78, 0.86, 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive={labelColor} emissiveIntensity={0.18} roughness={0.3} />
      </mesh>
      {/* 板上文字色块（用对比色横条模拟） */}
      <mesh position={[0, 2.16, 0.085]}>
        <boxGeometry args={[1.4, 0.18, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 1.92, 0.085]}>
        <boxGeometry args={[1.05, 0.14, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

const BUILDING_COUNT = 18;

function BuildingDecor({ variant, w, d, hAbove }: { variant: Building['variant']; w: number; d: number; hAbove: number }) {
  switch (variant) {
    case 'tilt':
      return (
        <mesh position={[0, hAbove + 0.35, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[Math.max(w, d) * 0.62, 0.7, 4]} />
          <meshStandardMaterial color="#a64b3a" roughness={0.7} />
        </mesh>
      );
    case 'ledge':
      return (
        <>
          <mesh position={[0, hAbove + 0.07, 0]}>
            <boxGeometry args={[w + 0.12, 0.14, d + 0.12]} />
            <meshStandardMaterial color="#6e7a86" roughness={0.6} />
          </mesh>
          <mesh position={[0, hAbove + 0.22, 0]}>
            <boxGeometry args={[w * 0.6, 0.18, d * 0.6]} />
            <meshStandardMaterial color="#5b6772" roughness={0.6} />
          </mesh>
        </>
      );
    case 'water-tank':
      return (
        <group position={[w * 0.18, hAbove + 0.18, d * 0.12]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.36, 12]} />
            <meshStandardMaterial color="#7c8997" roughness={0.5} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <coneGeometry args={[0.2, 0.18, 12]} />
            <meshStandardMaterial color="#65727f" roughness={0.5} metalness={0.5} />
          </mesh>
        </group>
      );
    case 'antenna':
      return (
        <>
          <mesh position={[0, hAbove + 0.02, 0]}>
            <boxGeometry args={[w + 0.06, 0.04, d + 0.06]} />
            <meshStandardMaterial color="#3f4750" roughness={0.6} />
          </mesh>
          <mesh position={[w * 0.22, hAbove + 0.55, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.05, 8]} />
            <meshStandardMaterial color="#a4abb0" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[w * 0.22, hAbove + 1.06, 0]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <meshStandardMaterial color="#ff5c5c" emissive="#ff0000" emissiveIntensity={1.0} />
          </mesh>
        </>
      );
    case 'flat':
    default:
      return (
        <mesh position={[0, hAbove + 0.04, 0]}>
          <boxGeometry args={[w + 0.06, 0.08, d + 0.06]} />
          <meshStandardMaterial color="#5b6772" roughness={0.6} />
        </mesh>
      );
  }
}

export default function City() {
  const buildings = useMemo<Building[]>(() => {
    return Array.from({ length: BUILDING_COUNT }).map((_, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const far = index / BUILDING_COUNT;
      // 远的更高 + 颜色更冷
      const height = 2.4 + ((index * 1.61) % 5.4);
      const palette = ['#cbd5dc', '#aec3cf', '#dde1e7', '#9eb4c0', '#bcd0d9', '#d6c8ad', '#b1a8b9'];
      const variantList: Building['variant'][] = ['flat', 'tilt', 'ledge', 'water-tank', 'antenna'];
      return {
        x: side * (9.6 + (index % 4) * 1.45),
        z: -10 - index * 8.5,
        h: height,
        w: 1.55 + (index % 5) * 0.36,
        d: 1.85 + (index % 4) * 0.42,
        color: palette[index % palette.length],
        windowColor: index % 3 === 0 ? '#ffe48a' : '#bfe5ff',
        fade: 1 - far * 0.5,
        variant: variantList[index % variantList.length],
        rows: Math.max(2, Math.min(4, Math.floor(height / 0.85))),
      };
    });
  }, []);

  return (
    <group>
      {buildings.map((building, index) => (
        <group key={index} position={[building.x, building.h / 2 - 0.04, building.z]}>
          {/* 主体（淡淡更暗的下半 + 亮一点的上半 → 立体感） */}
          <mesh>
            <boxGeometry args={[building.w, building.h, building.d]} />
            <meshStandardMaterial color={building.color} roughness={0.78} transparent opacity={building.fade} />
          </mesh>
          {/* 底部阴影带 */}
          <mesh position={[0, -building.h / 2 + 0.18, 0]}>
            <boxGeometry args={[building.w + 0.02, 0.36, building.d + 0.02]} />
            <meshStandardMaterial color="#646e76" roughness={0.85} transparent opacity={building.fade * 0.6} />
          </mesh>

          {/* 多排窗户（前面 + 侧面各两列） */}
          {Array.from({ length: building.rows }).map((_, row) => {
            const yLocal = row * 0.85 - building.h / 2 + 0.7;
            const lit = (row + index) % 2 === 0;
            return (
              <group key={row}>
                {/* 正面 */}
                <mesh position={[-building.w * 0.24, yLocal, building.d / 2 + 0.012]}>
                  <boxGeometry args={[0.26, 0.18, 0.025]} />
                  <meshStandardMaterial
                    color={building.windowColor}
                    emissive={building.windowColor}
                    emissiveIntensity={lit ? 0.5 : 0.04}
                  />
                </mesh>
                <mesh position={[building.w * 0.24, yLocal, building.d / 2 + 0.012]}>
                  <boxGeometry args={[0.26, 0.18, 0.025]} />
                  <meshStandardMaterial
                    color={building.windowColor}
                    emissive={building.windowColor}
                    emissiveIntensity={!lit ? 0.5 : 0.04}
                  />
                </mesh>
                {/* 侧面（朝向道路的那一面） */}
                <mesh position={[building.x < 0 ? building.w / 2 + 0.012 : -building.w / 2 - 0.012, yLocal, 0]}>
                  <boxGeometry args={[0.025, 0.18, 0.26]} />
                  <meshStandardMaterial
                    color={building.windowColor}
                    emissive={building.windowColor}
                    emissiveIntensity={lit ? 0.4 : 0.04}
                  />
                </mesh>
              </group>
            );
          })}

          {/* 屋顶装饰（按 variant 切换） */}
          <BuildingDecor
            variant={building.variant}
            w={building.w}
            d={building.d}
            hAbove={building.h / 2}
          />

          {/* 楼门（深色色带 + 黄色玻璃） */}
          <mesh position={[0, -building.h / 2 + 0.32, building.d / 2 + 0.018]}>
            <boxGeometry args={[0.36, 0.6, 0.04]} />
            <meshStandardMaterial color="#3b424a" roughness={0.6} />
          </mesh>
          <mesh position={[0, -building.h / 2 + 0.4, building.d / 2 + 0.025]}>
            <boxGeometry args={[0.28, 0.36, 0.02]} />
            <meshStandardMaterial color="#ffe27a" emissive="#ffd24a" emissiveIntensity={0.55} />
          </mesh>
        </group>
      ))}

      {/* 三块广告牌（保留，颜色更跳） */}
      <Billboard x={-7.6} z={-32} labelColor="#ff6b6b" accent="#ffd166" />
      <Billboard x={7.6} z={-58} labelColor="#4ecdc4" accent="#ffe66d" />
      <Billboard x={-7.5} z={-92} labelColor="#a55ad6" accent="#ffffff" />
      <Billboard x={7.4} z={-128} labelColor="#ff9f43" accent="#1e90ff" />
    </group>
  );
}
