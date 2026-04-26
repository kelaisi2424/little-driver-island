// 2.5D 透视赛道：clip-path 梯形 + 侧面厚度层 + 多层阴影 + 由远到近放大的车道线。

export default function Road3D() {
  return (
    <div className="road-3d">
      {/* 道路下方深色厚度层（侧面） */}
      <div className="road-3d-side" />

      {/* 草地（道路两侧） */}
      <div className="road-3d-grass left" />
      <div className="road-3d-grass right" />

      {/* 道路上表面（梯形） */}
      <div className="road-3d-top">
        {/* 路边白线 */}
        <div className="road-3d-edge edge-l" />
        <div className="road-3d-edge edge-r" />

        {/* 中央车道虚线，由远（小）到近（大） */}
        <div className="road-3d-dash dash-1" />
        <div className="road-3d-dash dash-2" />
        <div className="road-3d-dash dash-3" />
        <div className="road-3d-dash dash-4" />

        {/* 起点黑白格，铺在远端 */}
        <div className="road-3d-checker">
          <span /><span /><span /><span /><span /><span />
          <span /><span /><span /><span /><span /><span />
        </div>
      </div>

      {/* 路面整体落地阴影 */}
      <div className="road-3d-ground-shadow" />
    </div>
  );
}
