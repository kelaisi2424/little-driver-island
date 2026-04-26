// v1.6 重写：按 carCfg.bodyType 渲染 6 种完全不同剪影的低模卡通车。
//   - compact (红色小轿车): 三厢车
//   - sport   (蓝色小跑车): 低矮，长车头，溜背
//   - bus     (黄色小巴士): 长车厢，多侧窗
//   - truck   (绿色工程车): 货斗后箱
//   - utility (白色警示车): 顶部黄色警示灯条
//   - cute    (粉色可爱车): 小圆润，单厢
//
// 共享：底盘 + 4 轮 + 头尾灯 + 后视镜 + 车牌 + 车底阴影
// 差异：车身轮廓、车顶/驾驶舱、附加件（货斗、警示灯条、巴士侧窗带）

import { useMemo, useRef, type MutableRefObject, type ReactElement } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Car3D, CarBodyType } from '../data/cars3d';
import { getDefaultCar3D } from '../data/cars3d';
import type { DrivingState } from './useDrivingPhysics';

interface CarModelProps {
  stateRef: MutableRefObject<DrivingState>;
  car?: Car3D;
}

interface WheelProps {
  x: number;
  z: number;
  front?: boolean;
  big?: boolean;
  wheelRotation: MutableRefObject<number>;
  steering: MutableRefObject<number>;
}

// 三层嵌套保证旋转轴正确：position → steer(Y) → spin(X)，最内层 mesh z=π/2 立成轮子
function Wheel({ x, z, front, big = false, wheelRotation, steering }: WheelProps) {
  const steerGroupRef = useRef<THREE.Group | null>(null);
  const spinGroupRef = useRef<THREE.Group | null>(null);
  const r = big ? 0.42 : 0.34;
  const w = big ? 0.36 : 0.3;

  useFrame(() => {
    if (steerGroupRef.current) {
      steerGroupRef.current.rotation.y = front ? steering.current * 0.32 : 0;
    }
    if (spinGroupRef.current) {
      // 取负让前进时轮子顶部朝前转
      spinGroupRef.current.rotation.x = -wheelRotation.current * (0.34 / r);
    }
  });

  return (
    <group position={[x, -0.16 + (big ? 0.08 : 0), z]}>
      <group ref={steerGroupRef}>
        <group ref={spinGroupRef}>
          {/* 轮胎 */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow={false} receiveShadow={false}>
            <cylinderGeometry args={[r, r, w, 28]} />
            <meshStandardMaterial color="#0e1013" roughness={0.82} metalness={0.05} />
          </mesh>
          {/* 轮毂 */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r * 0.6, r * 0.6, w + 0.01, 22]} />
            <meshStandardMaterial color="#dde2e6" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* 中心螺帽 */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r * 0.22, r * 0.22, w + 0.04, 12]} />
            <meshStandardMaterial color="#5a5f66" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* 5 根辐条 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} rotation={[0, 0, Math.PI / 2 + (i * Math.PI) / 5]}>
              <boxGeometry args={[0.04, r * 1.05, 0.05]} />
              <meshStandardMaterial color="#a0a7ad" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// 共享玻璃材质（整辆车复用一份，省 GPU）
function useGlassMaterial() {
  return useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#bfeaff',
      transparent: true,
      opacity: 0.75,
      roughness: 0.08,
      metalness: 0.18,
      emissive: '#7fcfff',
      emissiveIntensity: 0.18,
    }),
    [],
  );
}

// =====================================================================
// 不同车型的"驾驶舱 + 车身上层"渲染
// 全部以车体中心为原点，z>0 为车头，z<0 为车尾
// =====================================================================

interface ShellProps {
  car: Car3D;
  glassMaterial: THREE.Material;
}

// 共用：底盘 box（车身下层），所有车都要
function ChassisBlock({ car }: { car: Car3D }) {
  return (
    <>
      {/* 主车身（底盘） */}
      <mesh position={[0, 0.18, 0]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[1.96, 0.5, 2.55]} />
        <meshStandardMaterial color={car.bodyColor} roughness={0.35} metalness={0.18} />
      </mesh>
      {/* 侧裙暗带 */}
      <mesh position={[-0.99, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.2, 2.45]} />
        <meshStandardMaterial color={car.bodyDarkColor} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.99, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.2, 2.45]} />
        <meshStandardMaterial color={car.bodyDarkColor} roughness={0.6} metalness={0.1} />
      </mesh>
    </>
  );
}

// compact: 三厢车（默认轿车）
function CompactShell({ car, glassMaterial }: ShellProps) {
  return (
    <>
      <ChassisBlock car={car} />
      {/* 车头略低（鼻子向前） */}
      <mesh position={[0, 0.34, 1.1]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[1.78, 0.44, 1.0]} />
        <meshStandardMaterial color={car.bodyDarkColor} roughness={0.42} metalness={0.16} />
      </mesh>
      {/* 车尾略高 */}
      <mesh position={[0, 0.36, -1.18]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[1.7, 0.4, 1.05]} />
        <meshStandardMaterial color={car.bodyLightColor} roughness={0.32} metalness={0.18} />
      </mesh>
      {/* 驾驶舱：标准三厢 */}
      <mesh position={[0, 0.7, -0.05]}>
        <boxGeometry args={[1.55, 0.5, 1.4]} />
        <meshStandardMaterial color={car.bodyLightColor} roughness={0.3} metalness={0.06} />
      </mesh>
      {/* 前挡风 */}
      <mesh position={[0, 0.78, 0.5]} rotation={[0.32, 0, 0]}>
        <boxGeometry args={[1.42, 0.5, 0.06]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 后挡风 */}
      <mesh position={[0, 0.78, -0.62]} rotation={[-0.28, 0, 0]}>
        <boxGeometry args={[1.42, 0.48, 0.06]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 左右侧窗 */}
      <mesh position={[-0.78, 0.78, -0.05]}>
        <boxGeometry args={[0.06, 0.32, 0.92]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[0.78, 0.78, -0.05]}>
        <boxGeometry args={[0.06, 0.32, 0.92]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 车顶亮带 */}
      <mesh position={[0, 0.96, -0.05]}>
        <boxGeometry args={[1.4, 0.04, 1.32]} />
        <meshStandardMaterial color="#ffffff" emissive={car.bodyColor} emissiveIntensity={0.18} roughness={0.2} metalness={0.4} transparent opacity={0.6} />
      </mesh>
    </>
  );
}

// sport: 跑车（低矮 + 溜背 + 长车头 + 大尾翼）
function SportShell({ car, glassMaterial }: ShellProps) {
  return (
    <>
      <ChassisBlock car={car} />
      {/* 长低车头 */}
      <mesh position={[0, 0.28, 1.2]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[1.86, 0.32, 1.18]} />
        <meshStandardMaterial color={car.bodyDarkColor} roughness={0.36} metalness={0.22} />
      </mesh>
      {/* 引擎盖凸起 */}
      <mesh position={[0, 0.4, 0.85]}>
        <boxGeometry args={[1.5, 0.06, 0.7]} />
        <meshStandardMaterial color={car.bodyLightColor} roughness={0.32} metalness={0.28} />
      </mesh>
      {/* 溜背驾驶舱（很低） */}
      <mesh position={[0, 0.62, -0.08]}>
        <boxGeometry args={[1.5, 0.34, 1.5]} />
        <meshStandardMaterial color={car.bodyColor} roughness={0.32} metalness={0.18} />
      </mesh>
      {/* 前挡风（大角度溜背） */}
      <mesh position={[0, 0.66, 0.62]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[1.4, 0.5, 0.06]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 后窗（强溜背） */}
      <mesh position={[0, 0.6, -0.7]} rotation={[-0.55, 0, 0]}>
        <boxGeometry args={[1.4, 0.6, 0.06]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.76, 0.7, -0.05]}>
        <boxGeometry args={[0.06, 0.22, 1.05]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[0.76, 0.7, -0.05]}>
        <boxGeometry args={[0.06, 0.22, 1.05]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 大尾翼 */}
      <mesh position={[0, 0.72, -1.45]}>
        <boxGeometry args={[1.7, 0.05, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[-0.7, 0.6, -1.45]}>
        <boxGeometry args={[0.06, 0.22, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.55} />
      </mesh>
      <mesh position={[0.7, 0.6, -1.45]}>
        <boxGeometry args={[0.06, 0.22, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.55} />
      </mesh>
      {/* 跑车赛道贴 */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.15, 0.02, 2.4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.12} />
      </mesh>
    </>
  );
}

// bus: 长车身 + 高顶 + 一排侧窗
function BusShell({ car, glassMaterial }: ShellProps) {
  return (
    <>
      {/* 巴士底盘比标准更长 */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.96, 0.58, 2.7]} />
        <meshStandardMaterial color={car.bodyColor} roughness={0.45} metalness={0.12} />
      </mesh>
      {/* 大方车厢（巴士主体） */}
      <mesh position={[0, 1.0, -0.1]}>
        <boxGeometry args={[1.86, 1.05, 2.5]} />
        <meshStandardMaterial color={car.bodyColor} roughness={0.4} metalness={0.12} />
      </mesh>
      {/* 顶盖（更亮一点） */}
      <mesh position={[0, 1.55, -0.1]}>
        <boxGeometry args={[1.78, 0.06, 2.42]} />
        <meshStandardMaterial color={car.bodyLightColor} roughness={0.4} metalness={0.18} />
      </mesh>
      {/* 前挡风（垂直一些，巴士特征） */}
      <mesh position={[0, 1.16, 1.21]} rotation={[0.06, 0, 0]}>
        <boxGeometry args={[1.6, 0.6, 0.06]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 后挡风 */}
      <mesh position={[0, 1.16, -1.36]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[1.6, 0.55, 0.06]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 一排侧窗（巴士特征） - 左 4 个 */}
      {[-0.85, -0.28, 0.3, 0.88].map((zPos, idx) => (
        <mesh key={`bus-l-${idx}`} position={[-0.94, 1.18, zPos]}>
          <boxGeometry args={[0.06, 0.5, 0.46]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>
      ))}
      {[-0.85, -0.28, 0.3, 0.88].map((zPos, idx) => (
        <mesh key={`bus-r-${idx}`} position={[0.94, 1.18, zPos]}>
          <boxGeometry args={[0.06, 0.5, 0.46]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>
      ))}
      {/* 顶部行李架 */}
      <mesh position={[0, 1.62, -0.1]}>
        <boxGeometry args={[1.1, 0.04, 1.6]} />
        <meshStandardMaterial color="#2c3036" roughness={0.6} />
      </mesh>
      {/* 巴士牌（前） */}
      <mesh position={[0, 1.42, 1.27]}>
        <boxGeometry args={[0.86, 0.18, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
      </mesh>
    </>
  );
}

// truck: 工程车（短驾驶舱 + 后货斗）
function TruckShell({ car, glassMaterial }: ShellProps) {
  return (
    <>
      {/* 主车身 */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.96, 0.56, 2.55]} />
        <meshStandardMaterial color={car.bodyColor} roughness={0.45} metalness={0.12} />
      </mesh>
      {/* 短驾驶舱（在车头） */}
      <mesh position={[0, 0.92, 0.7]}>
        <boxGeometry args={[1.7, 0.7, 1.05]} />
        <meshStandardMaterial color={car.bodyDarkColor} roughness={0.4} metalness={0.14} />
      </mesh>
      {/* 前挡风（直立） */}
      <mesh position={[0, 1.0, 1.22]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.5, 0.55, 0.06]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 驾驶舱顶 */}
      <mesh position={[0, 1.3, 0.7]}>
        <boxGeometry args={[1.62, 0.06, 1.0]} />
        <meshStandardMaterial color={car.bodyLightColor} roughness={0.35} metalness={0.18} />
      </mesh>
      {/* 侧窗 */}
      <mesh position={[-0.86, 1.0, 0.7]}>
        <boxGeometry args={[0.06, 0.42, 0.92]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[0.86, 1.0, 0.7]}>
        <boxGeometry args={[0.06, 0.42, 0.92]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 货斗（后段，开放式） */}
      {/* 货斗左帮 */}
      <mesh position={[-0.92, 0.8, -0.65]}>
        <boxGeometry args={[0.08, 0.65, 1.4]} />
        <meshStandardMaterial color={car.bodyLightColor} roughness={0.55} metalness={0.16} />
      </mesh>
      {/* 货斗右帮 */}
      <mesh position={[0.92, 0.8, -0.65]}>
        <boxGeometry args={[0.08, 0.65, 1.4]} />
        <meshStandardMaterial color={car.bodyLightColor} roughness={0.55} metalness={0.16} />
      </mesh>
      {/* 货斗后挡板 */}
      <mesh position={[0, 0.8, -1.32]}>
        <boxGeometry args={[1.86, 0.65, 0.08]} />
        <meshStandardMaterial color={car.bodyDarkColor} roughness={0.55} metalness={0.16} />
      </mesh>
      {/* 货斗底（深色） */}
      <mesh position={[0, 0.5, -0.65]}>
        <boxGeometry args={[1.78, 0.06, 1.45]} />
        <meshStandardMaterial color="#2a2e34" roughness={0.7} />
      </mesh>
      {/* 货斗里随便放点小箱子 */}
      <mesh position={[-0.4, 0.7, -0.65]}>
        <boxGeometry args={[0.5, 0.36, 0.55]} />
        <meshStandardMaterial color="#a98058" roughness={0.7} />
      </mesh>
      <mesh position={[0.42, 0.74, -0.85]}>
        <boxGeometry args={[0.45, 0.42, 0.45]} />
        <meshStandardMaterial color="#c19a6b" roughness={0.7} />
      </mesh>
    </>
  );
}

// utility: 警示车（标准车身 + 顶部黄色警示灯条）
function UtilityShell({ car, glassMaterial }: ShellProps) {
  return (
    <>
      {/* 沿用 compact 主体 */}
      <CompactShell car={car} glassMaterial={glassMaterial} />
      {/* 顶部警示灯条（黄色发光，扁长方） */}
      <mesh position={[0, 1.06, -0.05]}>
        <boxGeometry args={[1.08, 0.14, 0.42]} />
        <meshStandardMaterial color="#3a3f44" roughness={0.5} />
      </mesh>
      <mesh position={[-0.32, 1.14, -0.05]}>
        <boxGeometry args={[0.32, 0.08, 0.34]} />
        <meshStandardMaterial color="#ffd54a" emissive="#ffb900" emissiveIntensity={1.1} roughness={0.2} />
      </mesh>
      <mesh position={[0.32, 1.14, -0.05]}>
        <boxGeometry args={[0.32, 0.08, 0.34]} />
        <meshStandardMaterial color="#ffd54a" emissive="#ffb900" emissiveIntensity={1.1} roughness={0.2} />
      </mesh>
      {/* 车身侧面"SAFETY"色带（暗灰格） */}
      <mesh position={[-0.99, 0.18, 0]}>
        <boxGeometry args={[0.02, 0.16, 2.0]} />
        <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.99, 0.18, 0]}>
        <boxGeometry args={[0.02, 0.16, 2.0]} />
        <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={0.3} />
      </mesh>
    </>
  );
}

// cute: 小圆润可爱车（mini Cooper / Bug 风格）
function CuteShell({ car, glassMaterial }: ShellProps) {
  return (
    <>
      <ChassisBlock car={car} />
      {/* 圆润大顶（用扁球+box 组合） */}
      <mesh position={[0, 0.7, -0.05]}>
        <sphereGeometry args={[1.05, 18, 14]} />
        <meshStandardMaterial color={car.bodyLightColor} roughness={0.36} metalness={0.12} />
      </mesh>
      {/* 把球切平：用一块跟车身同色的 box 把下半遮住 */}
      <mesh position={[0, 0.18, -0.05]}>
        <boxGeometry args={[2.2, 1.1, 2.4]} />
        <meshStandardMaterial color={car.bodyColor} roughness={0.36} />
      </mesh>
      {/* 重新画车身（盖回上面那块切割 box） */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[1.92, 0.5, 2.5]} />
        <meshStandardMaterial color={car.bodyColor} roughness={0.36} metalness={0.12} />
      </mesh>
      {/* 前挡风（大角度，圆润） */}
      <mesh position={[0, 0.78, 0.55]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[1.32, 0.5, 0.06]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 后挡风 */}
      <mesh position={[0, 0.78, -0.65]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.32, 0.5, 0.06]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 圆形侧窗（用扁圆柱模拟） */}
      <mesh position={[-0.78, 0.78, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 18]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[0.78, 0.78, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 18]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 圆头灯（替代普通方头灯） */}
      <mesh position={[-0.62, 0.36, 1.28]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#fff8ad" emissive="#fff1a0" emissiveIntensity={0.95} />
      </mesh>
      <mesh position={[0.62, 0.36, 1.28]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#fff8ad" emissive="#fff1a0" emissiveIntensity={0.95} />
      </mesh>
      {/* 头顶蝴蝶结 */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[0.36, 0.06, 0.18]} />
        <meshStandardMaterial color={car.accentColor} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.14]} />
        <meshStandardMaterial color={car.accentColor} roughness={0.35} />
      </mesh>
    </>
  );
}

const SHELL_MAP: Record<CarBodyType, (props: ShellProps) => ReactElement> = {
  compact: CompactShell,
  sport: SportShell,
  bus: BusShell,
  truck: TruckShell,
  utility: UtilityShell,
  cute: CuteShell,
};

// =====================================================================
// 主车模型：共享灯/牌/镜/轮 + bodyType 对应的 Shell
// =====================================================================

export default function CarModel({ stateRef, car }: CarModelProps) {
  const carCfg = car ?? getDefaultCar3D();
  const Shell = SHELL_MAP[carCfg.bodyType];
  const rootRef = useRef<THREE.Group | null>(null);
  const wheelRotation = useRef(0);
  const steering = useRef(0);
  const glassMaterial = useGlassMaterial();

  // 巴士/卡车前后轮距更大（视觉更长）
  const wheelLong = carCfg.bodyType === 'bus' ? 1.18
    : carCfg.bodyType === 'truck' ? 1.05
    : carCfg.bodyType === 'sport' ? 1.05
    : 0.98;
  const wheelWide = carCfg.bodyType === 'sport' ? 1.08 : 1.05;
  const big = carCfg.bodyType === 'truck' || carCfg.bodyType === 'bus';

  useFrame((_, delta) => {
    // wheelRotation 累加：由车速 / 半径决定（车速 m/s ÷ 米 = rad/s）
    wheelRotation.current += (stateRef.current.speed * delta) / 0.34;
    steering.current = stateRef.current.steering;
    if (rootRef.current) {
      rootRef.current.rotation.z = stateRef.current.tilt;
      rootRef.current.position.y = Math.sin(Date.now() * 0.012) * Math.min(0.025, stateRef.current.speed * 0.002);
      rootRef.current.scale.set(carCfg.scale[0], carCfg.scale[1], carCfg.scale[2]);
    }
  });

  return (
    <group ref={rootRef}>
      {/* 车底假阴影（圆形，永远地面之上） */}
      <mesh position={[0, -0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.85, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.32} depthWrite={false} />
      </mesh>

      {/* 车身（按 bodyType 切换） */}
      <Shell car={carCfg} glassMaterial={glassMaterial} />

      {/* 共享：4 个轮子 */}
      <Wheel x={-wheelWide} z={-wheelLong} wheelRotation={wheelRotation} steering={steering} big={big} />
      <Wheel x={wheelWide} z={-wheelLong} wheelRotation={wheelRotation} steering={steering} big={big} />
      <Wheel x={-wheelWide} z={wheelLong} front wheelRotation={wheelRotation} steering={steering} big={big} />
      <Wheel x={wheelWide} z={wheelLong} front wheelRotation={wheelRotation} steering={steering} big={big} />

      {/* 共享：前大灯（巴士/卡车放更高） */}
      {carCfg.bodyType !== 'cute' && (
        <>
          <mesh position={[-0.6, big ? 0.54 : 0.32, 1.7]}>
            <sphereGeometry args={[0.13, 16, 12]} />
            <meshStandardMaterial color="#fff8ad" emissive="#fff1a0" emissiveIntensity={0.85} />
          </mesh>
          <mesh position={[0.6, big ? 0.54 : 0.32, 1.7]}>
            <sphereGeometry args={[0.13, 16, 12]} />
            <meshStandardMaterial color="#fff8ad" emissive="#fff1a0" emissiveIntensity={0.85} />
          </mesh>
        </>
      )}

      {/* 共享：尾灯 */}
      <mesh position={[-0.55, big ? 0.6 : 0.32, -1.78]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#ff2020" emissive="#ff0000" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0.55, big ? 0.6 : 0.32, -1.78]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#ff2020" emissive="#ff0000" emissiveIntensity={0.7} />
      </mesh>

      {/* 共享：保险杠 */}
      <mesh position={[0, 0.12, 1.66]}>
        <boxGeometry args={[1.84, 0.18, 0.14]} />
        <meshStandardMaterial color="#2a2e34" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.12, -1.74]}>
        <boxGeometry args={[1.84, 0.18, 0.14]} />
        <meshStandardMaterial color="#2a2e34" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* 共享：前/后车牌 */}
      <mesh position={[0, 0.18, 1.74]}>
        <boxGeometry args={[0.62, 0.18, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 0.18, -1.82]}>
        <boxGeometry args={[0.62, 0.18, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={0.1} />
      </mesh>

      {/* 共享：后视镜（驾驶舱前部两侧） */}
      {carCfg.bodyType !== 'bus' && carCfg.bodyType !== 'truck' && (
        <>
          <mesh position={[-1.04, 0.66, 0.4]}>
            <boxGeometry args={[0.12, 0.1, 0.14]} />
            <meshStandardMaterial color={carCfg.bodyDarkColor} roughness={0.4} />
          </mesh>
          <mesh position={[1.04, 0.66, 0.4]}>
            <boxGeometry args={[0.12, 0.1, 0.14]} />
            <meshStandardMaterial color={carCfg.bodyDarkColor} roughness={0.4} />
          </mesh>
        </>
      )}
    </group>
  );
}
