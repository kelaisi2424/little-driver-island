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
}

function Billboard({ x, z, labelColor }: { x: number; z: number; labelColor: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, x < 0 ? 0.16 : -0.16, 0]}>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.045, 0.055, 1.65, 8]} />
        <meshStandardMaterial color="#5f6870" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[1.65, 0.78, 0.08]} />
        <meshStandardMaterial color={labelColor} roughness={0.38} />
      </mesh>
      <mesh position={[0, 1.65, -0.055]}>
        <boxGeometry args={[1.2, 0.16, 0.03]} />
        <meshStandardMaterial color="#fff6d8" emissive="#ffe9a3" emissiveIntensity={0.12} />
      </mesh>
    </group>
  );
}

export default function City() {
  const buildings = useMemo<Building[]>(() => {
    return Array.from({ length: 22 }).map((_, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const far = index / 22;
      const height = 1.9 + ((index * 1.43) % 4.8);
      return {
        x: side * (9.2 + (index % 4) * 1.35),
        z: -12 - index * 6.4,
        h: height,
        w: 1.45 + (index % 5) * 0.28,
        d: 1.7 + (index % 4) * 0.32,
        color: ['#ccd6dc', '#aebfcb', '#d7dde5', '#9fb1bd', '#c4d3dc'][index % 5],
        windowColor: index % 3 === 0 ? '#fff0a8' : '#c9efff',
        fade: 1 - far * 0.42,
      };
    });
  }, []);

  return (
    <group>
      {buildings.map((building, index) => (
        <group key={index} position={[building.x, building.h / 2 - 0.04, building.z]}>
          <mesh>
            <boxGeometry args={[building.w, building.h, building.d]} />
            <meshStandardMaterial color={building.color} roughness={0.74} transparent opacity={building.fade} />
          </mesh>
          {Array.from({ length: Math.max(2, Math.floor(building.h / 0.62)) }).map((_, row) => (
            <group key={row} position={[0, row * 0.55 - building.h / 2 + 0.55, building.d / 2 + 0.012]}>
              <mesh position={[-building.w * 0.22, 0, 0]}>
                <boxGeometry args={[0.24, 0.14, 0.025]} />
                <meshStandardMaterial color={building.windowColor} emissive={building.windowColor} emissiveIntensity={0.04} />
              </mesh>
              <mesh position={[building.w * 0.22, 0, 0]}>
                <boxGeometry args={[0.24, 0.14, 0.025]} />
                <meshStandardMaterial color={building.windowColor} emissive={building.windowColor} emissiveIntensity={0.04} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      <Billboard x={-7.3} z={-30} labelColor="#ff7a45" />
      <Billboard x={7.4} z={-54} labelColor="#4ab7ff" />
      <Billboard x={-7.1} z={-86} labelColor="#5cd684" />
    </group>
  );
}
