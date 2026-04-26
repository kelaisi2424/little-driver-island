// 加载页：小车转轮 + 进度文字。Three.js chunk 加载期间显示。

interface LoadingCarProps {
  text?: string;
}

export default function LoadingCar({ text = '小车正在发动中...' }: LoadingCarProps) {
  return (
    <div className="loading-car-page">
      <div className="loading-sky" />
      <div className="loading-ground" />

      <div className="loading-car">
        <div className="lc-shadow" />
        <div className="lc-body" />
        <div className="lc-cabin">
          <div className="lc-window" />
        </div>
        <div className="lc-light" />
        <div className="lc-wheel front">
          <span /><span /><span /><span />
        </div>
        <div className="lc-wheel back">
          <span /><span /><span /><span />
        </div>
        {/* 排气小尾烟 */}
        <span className="lc-puff p1" />
        <span className="lc-puff p2" />
        <span className="lc-puff p3" />
      </div>

      <div className="loading-text">{text}</div>
      <div className="loading-bar"><span /></div>
    </div>
  );
}
