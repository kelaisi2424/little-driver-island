// 远景 / 中景 / 近景 三层装饰。每层用不同 scale + opacity + 投影深度，营造空间纵深感。

export default function SceneDecorations3D() {
  return (
    <>
      {/* 远景层：太阳 + 山 + 云 */}
      <div className="dec-far">
        <div className="dec-sun">
          <div className="sun-core" />
          <div className="sun-glow" />
        </div>
        <div className="dec-cloud cloud-a" />
        <div className="dec-cloud cloud-b" />
        <div className="dec-cloud cloud-c" />
        <div className="dec-mountain m-l" />
        <div className="dec-mountain m-mid" />
        <div className="dec-mountain m-r" />
      </div>

      {/* 中景层：幼儿园 + 红绿灯 + P 牌 + 树 */}
      <div className="dec-mid">
        {/* 幼儿园 */}
        <div className="dec-kindergarten">
          <div className="kg-roof" />
          <div className="kg-house">
            <div className="kg-window" />
            <div className="kg-door" />
            <div className="kg-bell">🏫</div>
          </div>
          <div className="kg-shadow" />
        </div>

        {/* 红绿灯 */}
        <div className="dec-traffic">
          <div className="tr-pole" />
          <div className="tr-box">
            <span className="tr-bulb red" />
            <span className="tr-bulb yellow" />
            <span className="tr-bulb green" />
          </div>
          <div className="tr-shadow" />
        </div>

        {/* P 停车牌 */}
        <div className="dec-park">
          <div className="park-pole" />
          <div className="park-sign">P</div>
          <div className="park-shadow" />
        </div>

        {/* 树 */}
        <div className="dec-tree tree-l">
          <div className="tree-top" />
          <div className="tree-trunk" />
          <div className="tree-shadow" />
        </div>
        <div className="dec-tree tree-r">
          <div className="tree-top alt" />
          <div className="tree-trunk" />
          <div className="tree-shadow" />
        </div>
      </div>

      {/* 近景层：路锥 + START 牌 */}
      <div className="dec-near">
        <div className="dec-cone cone-l">
          <div className="cone-body" />
          <div className="cone-base" />
          <div className="cone-shadow" />
        </div>
        <div className="dec-cone cone-r">
          <div className="cone-body" />
          <div className="cone-base" />
          <div className="cone-shadow" />
        </div>
        <div className="dec-start">
          <div className="start-cloth">START</div>
          <div className="start-pole" />
        </div>
      </div>
    </>
  );
}
