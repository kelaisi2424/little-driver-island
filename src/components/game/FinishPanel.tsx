interface FinishPanelProps {
  stars: number;
}

export default function FinishPanel({ stars }: FinishPanelProps) {
  return (
    <div className="finish-panel">
      <h2>停车成功！</h2>
      <p>小司机完成今天任务啦！</p>
      <div>{'⭐'.repeat(stars)}</div>
    </div>
  );
}
