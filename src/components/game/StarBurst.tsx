interface StarBurstProps {
  show: boolean;
}

export default function StarBurst({ show }: StarBurstProps) {
  if (!show) return null;
  return (
    <div className="star-burst" aria-hidden>
      <span>⭐</span>
      <span>🌟</span>
      <span>⭐</span>
      <span>✨</span>
      <span>⭐</span>
    </div>
  );
}
