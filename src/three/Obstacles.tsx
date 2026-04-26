// v1.6 升级路锥：橙色锥体 + 双白条纹 + 立体方形底座 + 更明显假阴影
import type { ConeConfig } from '../data/levels3d';

interface ObstaclesProps {
  cones: ConeConfig[];
}

function Cone({ x, z }: ConeConfig) {
  return (
    <group position={[x, 0, z]}>
      {/* 地面假阴影 */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 24]} />
        <meshBasicMaterial color="black" transparent opacity={0.32} depthWrite={false} />
      </mesh>
      {/* 方形黑色底座（更稳重） */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.95, 0.14, 0.95]} />
        <meshStandardMaterial color="#15171a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.78, 0.08, 0.78]} />
        <meshStandardMaterial color="#22262b" roughness={0.7} />
      </mesh>
      {/* 主锥体（亮橙色发光） */}
      <mesh position={[0, 0.95, 0]}>
        <coneGeometry args={[0.55, 1.45, 28]} />
        <meshStandardMaterial color="#ff7e25" emissive="#ff5510" emissiveIntensity={0.45} roughness={0.42} />
      </mesh>
      {/* 上中下三圈反光白条 */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.5, 0.52, 0.13, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} roughness={0.22} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.34, 0.36, 0.12, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} roughness={0.22} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.1, 22]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} roughness={0.22} />
      </mesh>
      {/* 顶端小球（黄色发光，老远就能看见） */}
      <mesh position={[0, 1.74, 0]}>
        <sphereGeometry args={[0.11, 14, 12]} />
        <meshStandardMaterial color="#ffeb40" emissive="#ffeb40" emissiveIntensity={1.0} />
      </mesh>
    </group>
  );
}

export default function Obstacles({ cones }: ObstaclesProps) {
  return (
    <group>
      {cones.map((cone, index) => (
        <Cone key={`${cone.x}-${cone.z}-${index}`} x={cone.x} z={cone.z} />
      ))}
    </group>
  );
}
