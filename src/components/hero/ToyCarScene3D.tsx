// 主视觉场景组合器：在 perspective 容器里堆放 远景/中景/近景 + 主车。
// 整个 stage 是一个 2.5D 玩具盒视觉。

import { useRef } from 'react';
import { playSound } from '../../utils/sound';
import Road3D from './Road3D';
import SceneDecorations3D from './SceneDecorations3D';
import ToyCar3D from './ToyCar3D';

export default function ToyCarScene3D() {
  const carRef = useRef<HTMLDivElement>(null);

  const handleCarTap = () => {
    if (!carRef.current) return;
    carRef.current.classList.remove('is-pop');
    void carRef.current.offsetWidth; // 强制重排
    carRef.current.classList.add('is-pop');
    playSound('horn');
  };

  return (
    <div className="toy-scene-3d">
      <div className="scene-sky" />
      <div className="world-stage-3d">
        <SceneDecorations3D />
        <Road3D />
        <div ref={carRef} className="hero-car-3d-slot" onClick={handleCarTap}>
          <ToyCar3D />
        </div>
      </div>
    </div>
  );
}
