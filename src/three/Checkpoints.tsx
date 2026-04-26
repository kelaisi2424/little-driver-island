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
      {/* 大门左立柱 */}
      <mesh position={[-1.55, 1.4, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 2.8, 12]} />
        <meshStandardMaterial color={done ? '#67e68a' : '#42c6ff'} emissive={done ? '#2ed35c' : '#198cff'} emissiveIntensity={0.6} />
      </mesh>
      {/* 大门右立柱 */}
      <mesh position={[1.55, 1.4, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 2.8, 12]} />
        <meshStandardMaterial color={done ? '#67e68a' : '#42c6ff'} emissive={done ? '#2ed35c' : '#198cff'} emissiveIntensity={0.6} />
      </mesh>
      {/* 地面发光圆环 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.12, 14, 56]} />
        <meshStandardMaterial
          color={done ? '#9bf5b3' : '#7ee0ff'}
          emissive={done ? '#3eea6e' : '#3ab8ff'}
          emissiveIntensity={done ? 1.4 : 1.8}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* 顶部小圆环（拱门顶） */}
      <mesh position={[0, 2.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.09, 12, 46]} />
        <meshStandardMaterial
          color={done ? '#9bf5b3' : '#7ee0ff'}
          emissive={done ? '#3eea6e' : '#3ab8ff'}
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* 中心高亮球 */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.22, 18, 14]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={done ? '#bdffd2' : '#bff3ff'}
          emissiveIntensity={1.4}
        />
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
