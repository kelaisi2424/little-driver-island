interface FinishLineProps {
  z: number;
  parking?: boolean;
}

function FinishArch({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-3.9, 1.55, 0]}>
        <boxGeometry args={[0.26, 3.1, 0.28]} />
        <meshStandardMaterial color="#ff5c55" emissive="#b60f16" emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[3.9, 1.55, 0]}>
        <boxGeometry args={[0.26, 3.1, 0.28]} />
        <meshStandardMaterial color="#ff5c55" emissive="#b60f16" emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[0, 3.08, 0]}>
        <boxGeometry args={[8.05, 0.45, 0.28]} />
        <meshStandardMaterial color="#ff5c55" emissive="#ff2222" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 3.1, -0.17]}>
        <boxGeometry args={[2.7, 0.22, 0.04]} />
        <meshStandardMaterial color="#fff7cf" emissive="#fff0a0" emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
}

export default function FinishLine({ z, parking }: FinishLineProps) {
  if (parking) {
    return (
      <group position={[0, 0.04, z]}>
        <mesh>
          <boxGeometry args={[3.8, 0.05, 4.85]} />
          <meshStandardMaterial color="#384047" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[3.0, 0.04, 4.2]} />
          <meshStandardMaterial color="#ffe16b" roughness={0.42} emissive="#f2c64a" emissiveIntensity={0.08} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[2.42, 0.05, 3.58]} />
          <meshStandardMaterial color="#384047" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.12, -1.48]}>
          <boxGeometry args={[1.4, 0.04, 0.32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <group position={[0, 0.08, z]}>
        {Array.from({ length: 12 }).map((_, index) => (
          <mesh key={index} position={[-3.75 + index * 0.68, 0, index % 2 === 0 ? -0.32 : 0.32]}>
            <boxGeometry args={[0.64, 0.06, 0.68]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#ffffff' : '#202020'} roughness={0.45} />
          </mesh>
        ))}
        {Array.from({ length: 12 }).map((_, index) => (
          <mesh key={`b-${index}`} position={[-3.75 + index * 0.68, 0, index % 2 === 0 ? 0.32 : -0.32]}>
            <boxGeometry args={[0.64, 0.06, 0.68]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#202020' : '#ffffff'} roughness={0.45} />
          </mesh>
        ))}
      </group>
      <FinishArch z={z} />
    </group>
  );
}
