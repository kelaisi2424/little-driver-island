import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Level3D } from '../data/levels3d';
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
  paused: boolean;
  onSpeedChange: (speed: number) => void;
  onCheckpointChange: (passed: number) => void;
  onHint: (message: string) => void;
  onComplete: (stars: number, elapsedSeconds: number) => void;
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
  paused,
  onSpeedChange,
  onCheckpointChange,
  onHint,
  onComplete,
}: DrivingSceneProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const stateRef = useRef(createDrivingState());
  const passedRef = useRef(0);
  const completedRef = useRef(false);
  const startRef = useRef(Date.now());
  const lastHitRef = useRef(0);
  const lastOffRoadHintRef = useRef(0);
  const smoothSpeedRef = useRef(0);
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
    onSpeedChange(0);
    onCheckpointChange(0);
    onHint(level.kind === 'parking' ? '慢慢开进 P 车位。' : '按住油门，开始驾驶。');
  }, [level, onCheckpointChange, onHint, onSpeedChange]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.04);
    const state = stateRef.current;

    if (!paused && !completedRef.current) {
      const { offRoad } = updateDrivingPhysics(state, controls, delta);
      const now = Date.now();
      for (const cone of conePositions) {
        if (state.position.distanceTo(cone) < 1.05 && now - lastHitRef.current > 850) {
          bumpDrivingState(state);
          lastHitRef.current = now;
          onHint('慢一点，注意安全。');
          playSound('fail');
        }
      }

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
        window.setTimeout(() => onComplete(stars, elapsedSeconds), 500);
      }
    }

    if (groupRef.current) {
      const shake = state.shakeTime > 0 ? Math.sin(Date.now() * 0.08) * 0.07 : 0;
      groupRef.current.position.copy(state.position);
      groupRef.current.position.x += shake;
      groupRef.current.rotation.y = state.rotationY;
    }

    const speedFactor = THREE.MathUtils.clamp(state.speed / 19.5, 0, 1);
    // 刹车时镜头靠近 + 平视；油门时镜头拉远 + 看更远
    const brakeZoom = controls.brake ? -1.4 : 0;
    const followDistance = 6.4 + speedFactor * 3.6 + brakeZoom;
    const cameraHeight = 2.95 + speedFactor * 0.85;
    const sideLean = -state.steering * speedFactor * 0.55;
    const desiredCamera = new THREE.Vector3(
      state.position.x + Math.sin(state.rotationY) * followDistance + Math.cos(state.rotationY) * sideLean,
      state.position.y + cameraHeight,
      state.position.z + Math.cos(state.rotationY) * followDistance - Math.sin(state.rotationY) * sideLean,
    );
    camera.position.lerp(desiredCamera, 0.085);
    const lookAhead = new THREE.Vector3(
      state.position.x - Math.sin(state.rotationY) * (10 + speedFactor * 5.5),
      state.position.y + 1.2,
      state.position.z - Math.cos(state.rotationY) * (10 + speedFactor * 5.5),
    );
    camera.lookAt(lookAhead);
    smoothSpeedRef.current = THREE.MathUtils.lerp(smoothSpeedRef.current, kmh(state.speed), 0.16);
    onSpeedChange(Math.round(smoothSpeedRef.current));
  });

  return (
    <>
      <Sky sunPosition={[80, 40, 20]} turbidity={3} rayleigh={0.7} />
      <fog attach="fog" args={['#dff7ff', 34, 128]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 8]} intensity={1.45} />
      <Road length={level.roadLength} />
      <City />
      <Obstacles cones={level.cones} />
      <Checkpoints checkpoints={level.checkpoints} passed={passedRef.current} />
      {level.kind === 'traffic' && <TrafficLight z={-56} />}
      <FinishLine z={level.finishZ} parking={level.kind === 'parking'} />
      <group ref={groupRef}>
        <CarModel stateRef={stateRef} />
      </group>
    </>
  );
}

export default function DrivingScene(props: DrivingSceneProps) {
  return (
    <Canvas
      className="game3d-canvas"
      dpr={[1, 1.5]}
      camera={{ position: [0, 3.3, 7.2], fov: 66, near: 0.1, far: 180 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
