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
      color: '#8bdcff',
      transparent: true,
      opacity: 0.72,
      roughness: 0.12,
      metalness: 0.08,
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

      <mesh position={[0, 0.22, 0.12]}>
        <boxGeometry args={[1.92, 0.42, 2.42]} />
        <meshStandardMaterial color="#e92323" roughness={0.42} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.28, -1.2]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[1.64, 0.32, 0.98]} />
        <meshStandardMaterial color="#ff5148" roughness={0.36} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.35, 1.03]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[1.74, 0.48, 1.0]} />
        <meshStandardMaterial color="#c9141c" roughness={0.46} metalness={0.02} />
      </mesh>

      <mesh position={[0, 0.78, -0.1]} rotation={[0.03, 0, 0]}>
        <boxGeometry args={[1.13, 0.5, 1.24]} />
        <meshStandardMaterial color="#fa6a60" roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.8, -0.65]}>
        <boxGeometry args={[0.95, 0.3, 0.08]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0.79, 0.38]}>
        <boxGeometry args={[0.92, 0.28, 0.08]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.62, 0.73, -0.08]}>
        <boxGeometry args={[0.08, 0.28, 0.72]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[0.62, 0.73, -0.08]}>
        <boxGeometry args={[0.08, 0.28, 0.72]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 0.12, -1.74]}>
        <boxGeometry args={[1.44, 0.2, 0.16]} />
        <meshStandardMaterial color="#f2f4f5" roughness={0.35} metalness={0.2} />
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
