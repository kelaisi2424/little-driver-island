import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CheckpointConfig } from '../data/levels3d';

interface CheckpointsProps {
  checkpoints: CheckpointConfig[];
  passed: number;
}

function Checkpoint({ checkpoint, done }: { checkpoint: CheckpointConfig; done: boolean }) {
  const ringRef = useRef<THREE.Group | null>(null);
  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y += delta * 1.2;
  });

  return (
    <group ref={ringRef} position={[checkpoint.x, 0.06, checkpoint.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.18, 0.075, 12, 48]} />
        <meshStandardMaterial
          color={done ? '#67e68a' : '#42c6ff'}
          emissive={done ? '#2ed35c' : '#198cff'}
          emissiveIntensity={0.48}
          transparent
          opacity={0.86}
        />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <torusGeometry args={[0.72, 0.055, 10, 42]} />
        <meshStandardMaterial
          color={done ? '#67e68a' : '#42c6ff'}
          emissive={done ? '#2ed35c' : '#198cff'}
          emissiveIntensity={0.5}
          transparent
          opacity={0.78}
        />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.17, 16, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#bff3ff" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export default function Checkpoints({ checkpoints, passed }: CheckpointsProps) {
  return (
    <group>
      {checkpoints.map((checkpoint, index) => (
        <Checkpoint
          key={`${checkpoint.x}-${checkpoint.z}-${index}`}
          checkpoint={checkpoint}
          done={index < passed}
        />
      ))}
    </group>
  );
}
