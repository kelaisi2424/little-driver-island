import type { ConeConfig } from '../data/levels3d';

interface ObstaclesProps {
  cones: ConeConfig[];
}

function Cone({ x, z }: ConeConfig) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.72, 24]} />
        <meshBasicMaterial color="black" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.5, 0.62, 0.26, 4]} />
        <meshStandardMaterial color="#f06f25" roughness={0.54} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <coneGeometry args={[0.42, 1.16, 28]} />
        <meshStandardMaterial color="#ff842e" roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.61, 0]}>
        <cylinderGeometry args={[0.31, 0.34, 0.1, 24]} />
        <meshStandardMaterial color="#fff4df" roughness={0.36} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.43, 0.47, 0.08, 24]} />
        <meshStandardMaterial color="#fff4df" roughness={0.36} />
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
