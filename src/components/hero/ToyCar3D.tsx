// 2.5D 玩具车：纯 div + CSS，多层堆叠，自带 3/4 视角的 rotateY/rotateX，
// 带厚阴影 / 高光 / 渐变 / 4 个轮胎（前后大小不同模拟透视）。

interface ToyCar3DProps {
  className?: string;
  onClick?: () => void;
  popping?: boolean;
}

export default function ToyCar3D({ className, onClick, popping }: ToyCar3DProps) {
  return (
    <div
      className={`toy-car-3d ${popping ? 'is-pop' : ''} ${className ?? ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* 地面阴影 */}
      <div className="tc-shadow" />

      {/* 远侧后轮（先画，被车体覆盖） */}
      <div className="tc-wheel back-far" />
      <div className="tc-wheel front-far" />

      {/* 主车身 */}
      <div className="tc-body">
        <div className="tc-body-shine" />
      </div>

      {/* 车头格栅（在车身上） */}
      <div className="tc-grille">
        <span /><span /><span />
      </div>

      {/* 顶棚/驾驶舱 */}
      <div className="tc-cabin">
        <div className="tc-cabin-shine" />
        <div className="tc-window front" />
        <div className="tc-window back" />
        {/* 笑脸 */}
        <div className="tc-face">
          <span className="tc-eye" />
          <span className="tc-eye" />
          <div className="tc-mouth" />
        </div>
      </div>

      {/* 车头大灯 */}
      <div className="tc-light light-l" />
      <div className="tc-light light-r" />

      {/* 后视镜 */}
      <div className="tc-mirror" />

      {/* 车牌 */}
      <div className="tc-plate">BABY</div>

      {/* 近侧轮胎（在车身上方层） */}
      <div className="tc-wheel back-near">
        <span className="rim" />
        <span className="hub" />
      </div>
      <div className="tc-wheel front-near">
        <span className="rim" />
        <span className="hub" />
      </div>
    </div>
  );
}
