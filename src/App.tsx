// 主入口：把 Game3DPage（包含 Three.js）做成 lazy chunk，首屏先出 loading 再加载 3D。

import { lazy, Suspense } from 'react';
import LoadingCar from './components/LoadingCar';

const Game3DPage = lazy(() => import('./components/game3d/Game3DPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingCar text="小车正在发动中..." />}>
      <Game3DPage />
    </Suspense>
  );
}
