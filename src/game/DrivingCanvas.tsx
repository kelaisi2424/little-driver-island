import { useEffect, useMemo, useRef, useState } from 'react';
import type { CarDefinition, DrivingCompletePayload, DrivingLevel } from '../types';
import { playSound } from '../utils/sound';
import { bumpCar, createCarState, updateCarPhysics, type CarState, type ControlState } from './physics';
import { createMap } from './maps';
import { hitObstacle, isFarFromRoad, reachedCheckpoint, reachedFinish } from './collision';
import { renderDrivingScene } from './render';

interface DrivingCanvasProps {
  level: DrivingLevel;
  car: CarDefinition;
  controls: ControlState;
  paused: boolean;
  onSpeedChange: (speed: number) => void;
  onStarsChange: (stars: number) => void;
  onComplete: (payload: DrivingCompletePayload) => void;
}

const WIDTH = 900;
const HEIGHT = 520;

export default function DrivingCanvas({
  level,
  car,
  controls,
  paused,
  onSpeedChange,
  onStarsChange,
  onComplete,
}: DrivingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const carRef = useRef<CarState>(createCarState());
  const controlsRef = useRef(controls);
  const checkpointRef = useRef(0);
  const completedRef = useRef(false);
  const lastHitRef = useRef(0);
  const startRef = useRef(Date.now());
  const [tip, setTip] = useState('按住油门，小车就会动起来。');
  const [checkpointFlash, setCheckpointFlash] = useState(false);
  const map = useMemo(() => createMap(level), [level]);

  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  useEffect(() => {
    carRef.current = createCarState();
    checkpointRef.current = 0;
    completedRef.current = false;
    startRef.current = Date.now();
    onStarsChange(0);
    onSpeedChange(0);
    setTip(level.map === 'parking' ? '慢慢开进 P 车位。' : '按住油门，小车就会动起来。');
  }, [level, onSpeedChange, onStarsChange]);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        if (!paused && !completedRef.current) {
          let nextCar = updateCarPhysics(carRef.current, controlsRef.current, WIDTH, HEIGHT);
          const now = Date.now();
          const hit = hitObstacle(nextCar, map.obstacles);
          if ((hit || isFarFromRoad(nextCar, map)) && now - lastHitRef.current > 900) {
            nextCar = bumpCar(nextCar);
            lastHitRef.current = now;
            setTip(hit?.kind === 'person' ? '前面有人，慢一点。' : '慢一点，注意安全。');
            playSound('fail');
          }

          if (reachedCheckpoint(nextCar, map, checkpointRef.current)) {
            checkpointRef.current += 1;
            onStarsChange(Math.min(3, checkpointRef.current));
            setTip('做得好，开过检查点啦！');
            setCheckpointFlash(true);
            window.setTimeout(() => setCheckpointFlash(false), 420);
            playSound('star');
          }

          if (reachedFinish(nextCar, map, checkpointRef.current)) {
            completedRef.current = true;
            const stars = Math.max(1, Math.min(3, checkpointRef.current || 1));
            onStarsChange(stars);
            playSound('complete');
            window.setTimeout(() => {
              onComplete({
                level,
                stars,
                elapsedSeconds: Math.max(20, Math.round((Date.now() - startRef.current) / 1000)),
              });
            }, 650);
          }

          carRef.current = nextCar;
          onSpeedChange(nextCar.speed * 9);
          if (controlsRef.current.throttle && frame % 28 === 0) playSound('engine');
        }

        renderDrivingScene(ctx, map, carRef.current, car, checkpointRef.current, WIDTH, HEIGHT);
      }
      frame += 1;
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [car, level, map, onComplete, onSpeedChange, onStarsChange, paused]);

  return (
    <div className="canvas-wrap">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="driving-canvas" />
      <div className="drive-tip">{tip}</div>
      {checkpointFlash && <div className="checkpoint-flash">⭐</div>}
    </div>
  );
}
