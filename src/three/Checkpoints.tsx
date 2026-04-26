// v1.6 升级：发光拱门更亮 + 上下双圆环 + 通过后变绿 + 缓慢"呼吸"光强
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
  const innerRef = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y += delta * 1.2;
    // 内层球 emissiveIntensity 呼吸
    if (innerRef.current) {
      const t = Date.now() * 0.003;
      const m = innerRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.1 + Math.sin(t) * 0.4;
    }
  });

  const baseColor = done ? '#67e68a' : '#42c6ff';
  const emissiveColor = done ? '#2ed35c' : '#198cff';

  return (
    <group ref={ringRef} position={[checkpoint.x, 0.06, checkpoint.z]}>
      {/* 假阴影 */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 24]} />
        <meshBasicMaterial color="black" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* 大门左立柱（更粗 + 更高） */}
      <mesh position={[-1.55, 1.55, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 3.1, 14]} />
        <meshStandardMaterial color={baseColor} emissive={emissiveColor} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[1.55, 1.55, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 3.1, 14]} />
        <meshStandardMaterial color={baseColor} emissive={emissiveColor} emissiveIntensity={0.7} />
      </mesh>
      {/* 顶部连接横梁 */}
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[3.3, 0.18, 0.22]} />
        <meshStandardMaterial color={baseColor} emissive={emissiveColor} emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      {/* 横梁中央"GO"小灯 */}
      <mesh position={[0, 3.0, 0.16]}>
        <boxGeometry args={[0.7, 0.12, 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} />
      </mesh>
      {/* 地面发光圆环 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.14, 16, 56]} />
        <meshStandardMaterial
          color={done ? '#9bf5b3' : '#7ee0ff'}
          emissive={emissiveColor}
          emissiveIntensity={done ? 1.6 : 2.0}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* 第二个地面圆环（外圈，更暗） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <torusGeometry args={[1.7, 0.06, 12, 48]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={0.8}
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* 中心发光球（呼吸） */}
      <mesh ref={innerRef} position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.26, 18, 14]} />
        <meshStandardMaterial color="#ffffff" emissive={done ? '#bdffd2' : '#bff3ff'} emissiveIntensity={1.4} />
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
