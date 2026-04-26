import type { ConeConfig } from '../data/levels3d';

interface ObstaclesProps {
  cones: ConeConfig[];
}

function Cone({ x, z }: ConeConfig) {
  return (
    <group position={[x, 0, z]}>
      {/* 地面阴影 */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 24]} />
        <meshBasicMaterial color="black" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {/* 黑色底座 */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.65, 0.78, 0.32, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      {/* 主锥体 - 加亮加大 */}
      <mesh position={[0, 0.95, 0]}>
        <coneGeometry args={[0.55, 1.55, 28]} />
        <meshStandardMaterial color="#ff7a2a" emissive="#ff5e10" emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
      {/* 顶端反光环 (亮白) */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.4, 0.43, 0.15, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} roughness={0.25} />
      </mesh>
      {/* 中部第二条反光环 */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.52, 0.55, 0.13, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} roughness={0.25} />
      </mesh>
      {/* 顶端小球（更显眼） */}
      <mesh position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial color="#ffeb40" emissive="#ffeb40" emissiveIntensity={0.8} />
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
