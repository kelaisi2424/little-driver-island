import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Car3D } from '../data/cars3d';
import { getDefaultCar3D } from '../data/cars3d';
import type { DrivingState } from './useDrivingPhysics';

interface CarModelProps {
  stateRef: MutableRefObject<DrivingState>;
  car?: Car3D;     // 选中的车辆配置；不传则用默认红色小轿车
}

interface WheelProps {
  x: number;
  z: number;
  front?: boolean;
  wheelRotation: MutableRefObject<number>;
  steering: MutableRefObject<number>;
}

// v15: 修复轮胎旋转
// 三层嵌套：position → steering(Y) → spin(X)
// 内层 mesh 自己 rotation-z=π/2 把 cylinder 立起来变成轮子
// → spin 围绕真实"车轴"方向（世界 X 经 steering 旋转）
function Wheel({ x, z, front, wheelRotation, steering }: WheelProps) {
  const steerGroupRef = useRef<THREE.Group | null>(null);
  const spinGroupRef = useRef<THREE.Group | null>(null);

  useFrame(() => {
    if (steerGroupRef.current) {
      steerGroupRef.current.rotation.y = front ? steering.current * 0.32 : 0;
    }
    if (spinGroupRef.current) {
      // 取负让车前进时轮子上半部分朝前转（视觉正确：车走 -Z 方向 → 轮子顶点向前）
      spinGroupRef.current.rotation.x = -wheelRotation.current;
    }
  });

  return (
    <group position={[x, -0.16, z]}>
      {/* 转向：前轮左右摆动，后轮固定 */}
      <group ref={steerGroupRef}>
        {/* 滚动：每帧根据车速旋转 */}
        <group ref={spinGroupRef}>
          {/* 轮胎本体（cylinder 默认轴沿 Y，rotation-z=π/2 让它平躺成轮子） */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.34, 0.34, 0.3, 32]} />
            <meshStandardMaterial color="#0f1113" roughness={0.78} />
          </mesh>
          {/* 轮毂（亮金属圆盘） */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.31, 24]} />
            <meshStandardMaterial color="#d8dde2" metalness={0.55} roughness={0.32} />
          </mesh>
          {/* 中心螺帽 */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.34, 12]} />
            <meshStandardMaterial color="#5a5f66" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* 4 根辐条（用扁 box，让旋转视觉更明显） */}
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[0, 0, Math.PI / 2 + (i * Math.PI) / 4]}>
              <boxGeometry args={[0.04, 0.34, 0.06]} />
              <meshStandardMaterial color="#9aa1a8" metalness={0.45} roughness={0.4} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

export default function CarModel({ stateRef, car }: CarModelProps) {
  const carCfg = car ?? getDefaultCar3D();
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
    // v15: 用 |speed| 累加 + 倍率 → 转得快慢真实跟随车速
    // wheelRadius = 0.34 米，车速 m/s → 角速度 = speed / radius
    wheelRotation.current += (stateRef.current.speed * delta) / 0.34;
    steering.current = stateRef.current.steering;
    if (rootRef.current) {
      rootRef.current.rotation.z = stateRef.current.tilt;
      rootRef.current.position.y = Math.sin(Date.now() * 0.012) * Math.min(0.025, stateRef.current.speed * 0.002);
      // v15: 应用车辆比例缩放
      rootRef.current.scale.set(carCfg.scale[0], carCfg.scale[1], carCfg.scale[2]);
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
        <meshStandardMaterial color={carCfg.bodyColor} roughness={0.36} metalness={0.16} />
      </mesh>
      {/* 车尾稍微高一点（甲虫感） */}
      <mesh position={[0, 0.32, -1.18]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[1.7, 0.36, 1.05]} />
        <meshStandardMaterial color={carCfg.bodyLightColor} roughness={0.32} metalness={0.18} />
      </mesh>
      {/* 车头稍低（鼻子向前） */}
      <mesh position={[0, 0.32, 1.05]} rotation={[-0.07, 0, 0]}>
        <boxGeometry args={[1.78, 0.42, 1.05]} />
        <meshStandardMaterial color={carCfg.bodyDarkColor} roughness={0.42} metalness={0.16} />
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
        <meshStandardMaterial color={carCfg.bodyLightColor} roughness={0.32} metalness={0.06} />
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
        <meshStandardMaterial color={carCfg.bodyDarkColor} roughness={0.4} />
      </mesh>
      <mesh position={[-1.12, 0.68, -0.32]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshStandardMaterial color="#3a587a" emissive="#82d2ff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[1.04, 0.66, -0.32]}>
        <boxGeometry args={[0.18, 0.12, 0.16]} />
        <meshStandardMaterial color={carCfg.bodyDarkColor} roughness={0.4} />
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
