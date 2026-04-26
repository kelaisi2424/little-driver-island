import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DrivingState } from './useDrivingPhysics';

interface CarModelProps {
  stateRef: MutableRefObject<DrivingState>;
}

interface WheelProps {
  x: number;
  z: number;
  front?: boolean;
  wheelRotation: MutableRefObject<number>;
  steering: MutableRefObject<number>;
}

function Wheel({ x, z, front, wheelRotation, steering }: WheelProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const tireRef = useRef<THREE.Mesh | null>(null);
  const hubRef = useRef<THREE.Mesh | null>(null);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y = front ? steering.current * 0.32 : 0;
    if (tireRef.current) tireRef.current.rotation.x = wheelRotation.current;
    if (hubRef.current) hubRef.current.rotation.x = wheelRotation.current;
  });

  return (
    <group ref={groupRef} position={[x, -0.16, z]} rotation={[0, front ? steering.current * 0.32 : 0, Math.PI / 2]}>
      <mesh ref={tireRef}>
        <cylinderGeometry args={[0.34, 0.34, 0.3, 32]} />
        <meshStandardMaterial color="#101113" roughness={0.68} />
      </mesh>
      <mesh ref={hubRef}>
        <cylinderGeometry args={[0.19, 0.19, 0.32, 24]} />
        <meshStandardMaterial color="#c7d0d7" metalness={0.35} roughness={0.36} />
      </mesh>
      <mesh ref={hubRef} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.04, 0.34, 0.34]} />
        <meshStandardMaterial color="#818b93" metalness={0.25} roughness={0.36} />
      </mesh>
    </group>
  );
}

export default function CarModel({ stateRef }: CarModelProps) {
  const rootRef = useRef<THREE.Group | null>(null);
  const wheelRotation = useRef(0);
  const steering = useRef(0);
  const glassMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#bdf0ff',
      transparent: true,
      opacity: 0.78,
      roughness: 0.08,
      metalness: 0.18,
      emissive: '#7fcfff',
      emissiveIntensity: 0.25,
    }),
    [],
  );

  useFrame((_, delta) => {
    wheelRotation.current += stateRef.current.speed * delta * 5.6;
    steering.current = stateRef.current.steering;
    if (rootRef.current) {
      rootRef.current.rotation.z = stateRef.current.tilt;
      rootRef.current.position.y = Math.sin(Date.now() * 0.012) * Math.min(0.025, stateRef.current.speed * 0.002);
    }
  });

  return (
    <group ref={rootRef}>
      <mesh position={[0, -0.34, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.75, 34]} />
        <meshBasicMaterial color="black" transparent opacity={0.26} depthWrite={false} />
      </mesh>

      {/* v13 升级：主车身用更扁平赛车比例 + 多层红色 */}
      <mesh position={[0, 0.18, 0.12]}>
        <boxGeometry args={[1.96, 0.46, 2.5]} />
        <meshStandardMaterial color="#dc2626" roughness={0.36} metalness={0.16} />
      </mesh>
      {/* 车尾稍微高一点（甲虫感） */}
      <mesh position={[0, 0.32, -1.18]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[1.7, 0.36, 1.05]} />
        <meshStandardMaterial color="#ef4444" roughness={0.32} metalness={0.18} />
      </mesh>
      {/* 车头稍低（鼻子向前） */}
      <mesh position={[0, 0.32, 1.05]} rotation={[-0.07, 0, 0]}>
        <boxGeometry args={[1.78, 0.42, 1.05]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.42} metalness={0.16} />
      </mesh>
      {/* 车身侧裙（暗色描边边） */}
      <mesh position={[-0.97, 0.12, 0.1]}>
        <boxGeometry args={[0.06, 0.24, 2.4]} />
        <meshStandardMaterial color="#5a0a0a" roughness={0.6} />
      </mesh>
      <mesh position={[0.97, 0.12, 0.1]}>
        <boxGeometry args={[0.06, 0.24, 2.4]} />
        <meshStandardMaterial color="#5a0a0a" roughness={0.6} />
      </mesh>
      {/* 车顶高光带 */}
      <mesh position={[0, 0.42, 0.12]}>
        <boxGeometry args={[1.78, 0.05, 2.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ff8a8a" emissiveIntensity={0.25} roughness={0.2} metalness={0.4} transparent opacity={0.55} />
      </mesh>

      {/* 驾驶舱：更小更低更像跑车 */}
      <mesh position={[0, 0.7, -0.05]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[1.05, 0.42, 1.18]} />
        <meshStandardMaterial color="#fa6a60" roughness={0.32} metalness={0.06} />
      </mesh>
      {/* v13 升级：玻璃 - 后挡风斜一点 + 前挡风斜一点 */}
      <mesh position={[0, 0.74, -0.6]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.92, 0.34, 0.08]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0.74, 0.42]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.9, 0.32, 0.08]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 侧窗 */}
      <mesh position={[-0.58, 0.66, -0.05]}>
        <boxGeometry args={[0.06, 0.26, 0.7]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[0.58, 0.66, -0.05]}>
        <boxGeometry args={[0.06, 0.26, 0.7]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 0.12, -1.74]}>
        <boxGeometry args={[1.44, 0.2, 0.16]} />
        <meshStandardMaterial color="#f2f4f5" roughness={0.35} metalness={0.2} />
      </mesh>
      {/* 车牌 (前后) - 白底深字 */}
      <mesh position={[0, 0.32, 1.79]}>
        <boxGeometry args={[0.66, 0.18, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 0.32, -1.79]}>
        <boxGeometry args={[0.66, 0.18, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.12} />
      </mesh>
      {/* v13 后视镜：跟随驾驶舱降低位置 + 椭圆镜片 */}
      <mesh position={[-1.04, 0.66, -0.32]}>
        <boxGeometry args={[0.18, 0.12, 0.16]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.4} />
      </mesh>
      <mesh position={[-1.12, 0.68, -0.32]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshStandardMaterial color="#3a587a" emissive="#82d2ff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[1.04, 0.66, -0.32]}>
        <boxGeometry args={[0.18, 0.12, 0.16]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.4} />
      </mesh>
      <mesh position={[1.12, 0.68, -0.32]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshStandardMaterial color="#3a587a" emissive="#82d2ff" emissiveIntensity={0.3} />
      </mesh>
      {/* v13 尾翼小扰流板 */}
      <mesh position={[0, 0.6, -1.55]}>
        <boxGeometry args={[1.5, 0.06, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[-0.65, 0.5, -1.55]}>
        <boxGeometry args={[0.06, 0.18, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0.65, 0.5, -1.55]}>
        <boxGeometry args={[0.06, 0.18, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.18, 1.65]}>
        <boxGeometry args={[1.38, 0.18, 0.16]} />
        <meshStandardMaterial color="#30343a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.33, 1.76]}>
        <boxGeometry args={[0.62, 0.22, 0.04]} />
        <meshStandardMaterial color="#fff4cf" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.64, 1.56]}>
        <boxGeometry args={[1.65, 0.08, 0.16]} />
        <meshStandardMaterial color="#b81921" roughness={0.4} />
      </mesh>

      <Wheel x={-1.05} z={-0.95} front wheelRotation={wheelRotation} steering={steering} />
      <Wheel x={1.05} z={-0.95} front wheelRotation={wheelRotation} steering={steering} />
      <Wheel x={-1.05} z={1.0} wheelRotation={wheelRotation} steering={steering} />
      <Wheel x={1.05} z={1.0} wheelRotation={wheelRotation} steering={steering} />

      <mesh position={[-0.54, 0.29, -1.72]}>
        <sphereGeometry args={[0.13, 18, 12]} />
        <meshStandardMaterial color="#fff8ad" emissive="#fff1a0" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.54, 0.29, -1.72]}>
        <sphereGeometry args={[0.13, 18, 12]} />
        <meshStandardMaterial color="#fff8ad" emissive="#fff1a0" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.58, 0.32, 1.78]}>
        <sphereGeometry args={[0.1, 16, 10]} />
        <meshStandardMaterial color="#ff2020" emissive="#ff0000" emissiveIntensity={0.65} />
      </mesh>
      <mesh position={[0.58, 0.32, 1.78]}>
        <sphereGeometry args={[0.1, 16, 10]} />
        <meshStandardMaterial color="#ff2020" emissive="#ff0000" emissiveIntensity={0.65} />
      </mesh>
    </group>
  );
}
