import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import type { Level3D } from '../data/levels3d';
import type { Car3D } from '../data/cars3d';
import type { DrivingTelemetry } from '../data/challenge3d';
import { playSound } from '../utils/sound';
import CarModel from './CarModel';
import Checkpoints from './Checkpoints';
import City from './City';
import FinishLine from './FinishLine';
import Obstacles from './Obstacles';
import Road from './Road';
import type { DrivingControls } from './useDrivingControls';
import {
  bumpDrivingState,
  createDrivingState,
  kmh,
  resetDrivingState,
  updateDrivingPhysics,
} from './useDrivingPhysics';

interface DrivingSceneProps {
  level: Level3D;
  controls: DrivingControls;
  controlsRef: RefObject<DrivingControls>;
  paused: boolean;
  car?: Car3D;
  /** v1.7: 共享 telemetry ref，DrivingScene 每帧写入，外面读 */
  telemetryRef?: RefObject<DrivingTelemetry>;
  onSpeedChange: (speed: number) => void;
  onCheckpointChange: (passed: number) => void;
  onHint: (message: string) => void;
  /** v1.7: 通关回调签名扩展 → 多带 telemetry，挑战模式打分用 */
  onComplete: (stars: number, elapsedSeconds: number, telemetry?: DrivingTelemetry) => void;
  onTelemetryChange?: (telemetry: DrivingTelemetry) => void;
  onDebugChange?: (debug: DrivingDebugState) => void;
}

export interface DrivingDebugState {
  accelerate: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
  speed: number;
  positionZ: number;
  offRoad: boolean;
  collision: boolean;
}

function TrafficLight({ z }: { z: number }) {
  return (
    <group position={[3.25, 0, z]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.42, 1.2, 0.28]} />
        <meshStandardMaterial color="#2a3033" />
      </mesh>
      <mesh position={[0, 1.42, -0.16]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#ff4f4f" emissive="#ff0000" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 1.08, -0.16]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#5cd684" emissive="#2fce58" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.9, 12]} />
        <meshStandardMaterial color="#3a4144" />
      </mesh>
    </group>
  );
}

function SceneContent({
  level,
  controls,
  controlsRef,
  paused,
  car,
  telemetryRef,
  onSpeedChange,
  onCheckpointChange,
  onHint,
  onComplete,
  onTelemetryChange,
  onDebugChange,
}: DrivingSceneProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const stateRef = useRef(createDrivingState());
  const passedRef = useRef(0);
  const completedRef = useRef(false);
  const startRef = useRef(Date.now());
  const lastHitRef = useRef(0);
  const lastOffRoadHintRef = useRef(0);
  const smoothSpeedRef = useRef(0);
  const lastDebugRef = useRef(0);
  const lastCollisionRef = useRef(false);
  // v1.7: telemetry 累加（每帧写入）
  const collisionsRef = useRef(0);
  const offRoadAccumRef = useRef(0);
  const maxSpeedRef = useRef(0);
  const speedSumRef = useRef(0);
  const speedSamplesRef = useRef(0);
  const brakeCountRef = useRef(0);
  const wasBrakingRef = useRef(false);
  const lastTelemetryEmitRef = useRef(0);
  const { camera } = useThree();
  const conePositions = useMemo(
    () => level.cones.map((cone) => new THREE.Vector3(cone.x, 0.45, cone.z)),
    [level.cones],
  );

  useEffect(() => {
    resetDrivingState(stateRef.current);
    passedRef.current = 0;
    completedRef.current = false;
    startRef.current = Date.now();
    smoothSpeedRef.current = 0;
    // v1.7: telemetry 也清零
    collisionsRef.current = 0;
    offRoadAccumRef.current = 0;
    maxSpeedRef.current = 0;
    speedSumRef.current = 0;
    speedSamplesRef.current = 0;
    brakeCountRef.current = 0;
    wasBrakingRef.current = false;
    lastTelemetryEmitRef.current = 0;
    if (telemetryRef?.current) {
      const t = telemetryRef.current;
      t.elapsedTime = 0;
      t.collisions = 0;
      t.offRoadTime = 0;
      t.checkpointPassed = 0;
      t.brakeCount = 0;
      t.maxSpeed = 0;
      t.averageSpeed = 0;
      t.parkingAccuracy = 0;
      t.completed = false;
    }
    onSpeedChange(0);
    onCheckpointChange(0);
    onHint(level.kind === 'parking' ? '慢慢开进 P 车位。' : '按住油门，开始驾驶。');
  }, [level, onCheckpointChange, onHint, onSpeedChange, telemetryRef]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.04);
    const state = stateRef.current;

    if (!paused && !completedRef.current) {
      const activeControls = controlsRef.current;
      const { offRoad } = updateDrivingPhysics(state, activeControls, delta);
      const now = Date.now();
      let collision = false;
      for (const cone of conePositions) {
        if (state.position.distanceTo(cone) < 1.05 && now - lastHitRef.current > 850) {
          collision = true;
          bumpDrivingState(state);
          lastHitRef.current = now;
          onHint('慢一点，注意安全。');
          playSound('fail');
          // v1.7: 累加碰撞计数
          collisionsRef.current += 1;
        }
      }
      lastCollisionRef.current = collision;

      // v1.7: telemetry 累加（每帧）
      if (offRoad) offRoadAccumRef.current += delta;
      if (state.speed > maxSpeedRef.current) maxSpeedRef.current = state.speed;
      speedSumRef.current += state.speed;
      speedSamplesRef.current += 1;
      // 刹车按下次数：上一帧未刹这帧刹 → +1
      const isBraking = activeControls.brake;
      if (isBraking && !wasBrakingRef.current) brakeCountRef.current += 1;
      wasBrakingRef.current = isBraking;

      if (offRoad && now - lastOffRoadHintRef.current > 1400) {
        lastOffRoadHintRef.current = now;
        onHint('开回路上哦。');
      }

      const nextCheckpoint = level.checkpoints[passedRef.current];
      if (
        nextCheckpoint
        && state.position.distanceTo(new THREE.Vector3(nextCheckpoint.x, 0.48, nextCheckpoint.z)) < 1.6
      ) {
        passedRef.current += 1;
        onCheckpointChange(passedRef.current);
        onHint('通过检查点！');
        playSound('star');
      }

      const checkpointsDone = passedRef.current >= level.checkpoints.length;
      const finishReached = level.kind === 'parking'
        ? state.position.z <= level.finishZ + 2.3 && Math.abs(state.position.x) < 1.7 && state.speed < 5
        : state.position.z <= level.finishZ;

      if (checkpointsDone && finishReached) {
        completedRef.current = true;
        state.speed = 0;
        playSound('complete');
        const elapsedSeconds = Math.max(8, Math.round((Date.now() - startRef.current) / 1000));
        const stars = level.id === 2 && lastHitRef.current > 0 ? 2 : 3;
        // v1.7: 把 telemetry 一起送回
        const telemetry: DrivingTelemetry = {
          elapsedTime: elapsedSeconds,
          collisions: collisionsRef.current,
          offRoadTime: offRoadAccumRef.current,
          checkpointPassed: passedRef.current,
          brakeCount: brakeCountRef.current,
          maxSpeed: maxSpeedRef.current,
          averageSpeed: speedSamplesRef.current > 0 ? speedSumRef.current / speedSamplesRef.current : 0,
          parkingAccuracy: level.kind === 'parking'
            ? Math.hypot(state.position.x, state.position.z - level.finishZ)
            : 0,
          completed: true,
        };
        if (telemetryRef?.current) Object.assign(telemetryRef.current, telemetry);
        window.setTimeout(() => onComplete(stars, elapsedSeconds, telemetry), 500);
      }
    }

    if (groupRef.current) {
      const shake = state.shakeTime > 0 ? Math.sin(Date.now() * 0.08) * 0.07 : 0;
      groupRef.current.position.copy(state.position);
      groupRef.current.position.x += shake;
      groupRef.current.rotation.y = state.rotationY;
    }

    const activeControlsForCamera = controlsRef.current;
    const speedFactor = THREE.MathUtils.clamp(state.speed / 19.5, 0, 1);
    // v1.6: 速度感 FOV 加大幅度 + 竖横屏分别校准
    const isPortrait = window.innerHeight > window.innerWidth;
    if (camera instanceof THREE.PerspectiveCamera) {
      const baseFov = isPortrait ? 68 : 60;
      // 低速 60，高速 70（10° 范围，比 v1.5 的 3.5° 大幅强化速度感）
      const targetFov = baseFov + speedFactor * 7;
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.08);
      camera.updateProjectionMatrix();
    }
    // v1.6: 镜头更低更近，更接近赛车视角
    const brakeZoom = activeControlsForCamera.brake ? -1.6 : 0;
    const baseFollow = isPortrait ? 7.8 : 5.8;
    const baseHeight = isPortrait ? 3.6 : 2.55;
    const followDistance = baseFollow + speedFactor * 3.4 + brakeZoom;
    const cameraHeight = baseHeight + speedFactor * 0.7;
    const sideLean = -state.steering * speedFactor * 0.55;
    // v14 画质：撞锥时摄像机轻微震动（用 state.shakeTime 同步）
    const shakeAmt = state.shakeTime > 0
      ? Math.sin(Date.now() * 0.04) * 0.12 * (state.shakeTime / 0.42)
      : 0;
    const desiredCamera = new THREE.Vector3(
      state.position.x + Math.sin(state.rotationY) * followDistance + Math.cos(state.rotationY) * sideLean + shakeAmt,
      state.position.y + cameraHeight + shakeAmt * 0.4,
      state.position.z + Math.cos(state.rotationY) * followDistance - Math.sin(state.rotationY) * sideLean,
    );
    camera.position.lerp(desiredCamera, 0.085);
    // v1.6: lookAhead 距离随速度变长，速度越快看越远
    const lookDist = 9 + speedFactor * 7;
    const lookAhead = new THREE.Vector3(
      state.position.x - Math.sin(state.rotationY) * lookDist,
      state.position.y + 0.9,  // 视线压低，更像驾驶视角
      state.position.z - Math.cos(state.rotationY) * lookDist,
    );
    camera.lookAt(lookAhead);
    smoothSpeedRef.current = THREE.MathUtils.lerp(smoothSpeedRef.current, kmh(state.speed), 0.16);
    onSpeedChange(Math.round(smoothSpeedRef.current));

    // v1.7: telemetry 实时同步给 HUD（每 250ms 一次，避免 setState 频率过高）
    if (!completedRef.current && (onTelemetryChange || telemetryRef)) {
      const tNow = performance.now();
      if (tNow - lastTelemetryEmitRef.current > 250) {
        lastTelemetryEmitRef.current = tNow;
        const elapsed = Math.max(0, (Date.now() - startRef.current) / 1000);
        const tele: DrivingTelemetry = {
          elapsedTime: Math.round(elapsed),
          collisions: collisionsRef.current,
          offRoadTime: offRoadAccumRef.current,
          checkpointPassed: passedRef.current,
          brakeCount: brakeCountRef.current,
          maxSpeed: maxSpeedRef.current,
          averageSpeed: speedSamplesRef.current > 0 ? speedSumRef.current / speedSamplesRef.current : 0,
          parkingAccuracy: 0,
          completed: false,
        };
        if (telemetryRef?.current) Object.assign(telemetryRef.current, tele);
        if (onTelemetryChange) onTelemetryChange(tele);
      }
    }
    const debugNow = performance.now();
    if (onDebugChange && debugNow - lastDebugRef.current > 180) {
      lastDebugRef.current = debugNow;
      onDebugChange({
        accelerate: activeControlsForCamera.throttle,
        brake: activeControlsForCamera.brake,
        left: activeControlsForCamera.left,
        right: activeControlsForCamera.right,
        speed: Math.round(kmh(state.speed)),
        positionZ: Number(state.position.z.toFixed(1)),
        offRoad: Math.abs(state.position.x) > 3.65,
        collision: lastCollisionRef.current,
      });
    }
  });

  return (
    <>
      <Sky sunPosition={[80, 40, 20]} turbidity={2.0} rayleigh={0.55} mieCoefficient={0.005} mieDirectionalG={0.86} />
      {/* v1.6 雾：远处雾化更柔，配合摄像机 lookAhead，沉浸感更强 */}
      <fog attach="fog" args={['#cfe6f6', 36, 155]} />
      {/* v1.6 灯光：四层光（半球光 + 环境 + 主太阳 + 蓝色补光 + 后方暖色边缘光） */}
      <hemisphereLight color="#fffaf0" groundColor="#83b463" intensity={0.62} />
      <ambientLight intensity={0.28} />
      {/* 主太阳光（左前上方暖白） */}
      <directionalLight
        position={[10, 18, 8]}
        intensity={1.55}
        color="#fff3d6"
        castShadow={false}
      />
      {/* 反向蓝色补光（车身阴面不死黑） */}
      <directionalLight position={[-7, 9, -5]} intensity={0.42} color="#b3d8ff" />
      {/* v1.6 新增：后方暖色边缘光（车尾轮廓更清楚） */}
      <directionalLight position={[0, 6, -10]} intensity={0.25} color="#ffd9a3" />
      <Road length={level.roadLength} />
      <City />
      <Obstacles cones={level.cones} />
      <Checkpoints checkpoints={level.checkpoints} passed={passedRef.current} />
      {level.kind === 'traffic' && <TrafficLight z={-56} />}
      <FinishLine z={level.finishZ} parking={level.kind === 'parking'} />
      <group ref={groupRef}>
        <CarModel stateRef={stateRef} car={car} />
      </group>
    </>
  );
}

export default function DrivingScene(props: DrivingSceneProps) {
  return (
    <Canvas
      className="game3d-canvas"
      dpr={[1, 2]}      // v1.6 仍 1-2x，但移动设备会被压回 1
      camera={{ position: [0, 3.0, 7.5], fov: 64, near: 0.1, far: 220 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.18,           // v1.6: 略亮（1.05 → 1.18）
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
