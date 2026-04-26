interface RoadProps {
  length: number;
}

function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 0.9, 10]} />
        <meshStandardMaterial color="#8a5a2f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.13, 0]}>
        <coneGeometry args={[0.5, 1.0, 12]} />
        <meshStandardMaterial color="#2f9858" roughness={0.86} />
      </mesh>
    </group>
  );
}

function RoadSign({ x, z, flip = false }: { x: number; z: number; flip?: boolean }) {
  return (
    <group position={[x, 0, z]} rotation={[0, flip ? Math.PI : 0, 0]}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
        <meshStandardMaterial color="#d7dde0" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <boxGeometry args={[0.72, 0.38, 0.05]} />
        <meshStandardMaterial color="#ffcc4d" roughness={0.4} />
      </mesh>
      <mesh position={[0.12, 1.45, -0.035]} rotation={[0, 0, -0.65]}>
        <boxGeometry args={[0.32, 0.07, 0.03]} />
        <meshStandardMaterial color="#563b16" roughness={0.5} />
      </mesh>
      <mesh position={[-0.12, 1.45, -0.035]} rotation={[0, 0, 0.65]}>
        <boxGeometry args={[0.32, 0.07, 0.03]} />
        <meshStandardMaterial color="#563b16" roughness={0.5} />
      </mesh>
    </group>
  );
}

function StreetLight({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 2.0, 10]} />
        <meshStandardMaterial color="#6d7780" roughness={0.42} />
      </mesh>
      <mesh position={[0.22 * Math.sign(-x), 2.02, 0]}>
        <sphereGeometry args={[0.16, 16, 10]} />
        <meshStandardMaterial color="#fff4a5" emissive="#ffe27a" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

export default function Road({ length }: RoadProps) {
  const centerZ = -length / 2 + 8;
  const dashCount = Math.floor(length / 7);
  const segmentCount = Math.ceil(length / 10);
  const decorCount = Math.floor(length / 14);

  return (
    <group>
      <mesh position={[0, -0.12, centerZ]}>
        <boxGeometry args={[46, 0.06, length + 42]} />
        <meshStandardMaterial color="#5eb45a" roughness={0.94} />
      </mesh>

      {Array.from({ length: segmentCount }).map((_, index) => (
        <mesh key={`road-segment-${index}`} position={[0, -0.045, -index * 10 + 3]}>
          <boxGeometry args={[8.65, 0.08, 10.05]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#30383b' : '#363f42'} roughness={0.78} />
        </mesh>
      ))}

      <mesh position={[-4.55, 0.05, centerZ]}>
        <boxGeometry args={[0.32, 0.22, length]} />
        <meshStandardMaterial color="#d9e1e4" roughness={0.55} />
      </mesh>
      <mesh position={[4.55, 0.05, centerZ]}>
        <boxGeometry args={[0.32, 0.22, length]} />
        <meshStandardMaterial color="#d9e1e4" roughness={0.55} />
      </mesh>
      <mesh position={[-4.95, 0.48, centerZ]}>
        <boxGeometry args={[0.12, 0.18, length * 0.98]} />
        <meshStandardMaterial color="#aeb8bd" roughness={0.45} />
      </mesh>
      <mesh position={[4.95, 0.48, centerZ]}>
        <boxGeometry args={[0.12, 0.18, length * 0.98]} />
        <meshStandardMaterial color="#aeb8bd" roughness={0.45} />
      </mesh>

      {Array.from({ length: dashCount }).map((_, index) => (
        <mesh key={`dash-${index}`} position={[0, 0.035, -index * 7 - 2.5]}>
          <boxGeometry args={[0.28, 0.045, 3.2]} />
          {/* v14 画质：车道虚线增强发光，速度感更强 */}
          <meshStandardMaterial color="#fff7c2" emissive="#ffd54a" emissiveIntensity={0.35} roughness={0.32} />
        </mesh>
      ))}

      <group position={[0, 0.04, -18]}>
        {Array.from({ length: 7 }).map((_, index) => (
          <mesh key={`zebra-${index}`} position={[-3 + index, 0.01, 0]}>
            <boxGeometry args={[0.48, 0.035, 2.25]} />
            <meshStandardMaterial color="#f4f7f8" roughness={0.35} />
          </mesh>
        ))}
      </group>

      {Array.from({ length: decorCount }).map((_, index) => {
        const z = -12 - index * 14;
        return (
          <group key={`decor-${index}`}>
            <RoadSign x={index % 2 === 0 ? -5.85 : 5.85} z={z - 2} flip={index % 2 === 0} />
            <StreetLight x={index % 2 === 0 ? 5.8 : -5.8} z={z - 7} />
            <Tree x={index % 2 === 0 ? -7.3 : 7.4} z={z - 4} scale={0.9 + (index % 3) * 0.12} />
            <mesh position={[index % 2 === 0 ? 6.95 : -6.9, 0.06, z + 2]}>
              <sphereGeometry args={[0.22, 12, 8]} />
              <meshStandardMaterial color="#43a85f" roughness={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
