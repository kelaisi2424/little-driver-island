import CarSvg from '../CarSvg';

interface PlayerCarProps {
  x: number;
  dragging: boolean;
  bumping: boolean;
}

export default function PlayerCar({ x, dragging, bumping }: PlayerCarProps) {
  return (
    <div
      className={`runner-car ${dragging ? 'dragging' : ''} ${bumping ? 'bumping' : ''}`}
      style={{ left: `${x}%` }}
      aria-label="小汽车"
    >
      <span className="runner-light" aria-hidden />
      <CarSvg color="#ff8c69" size={128} />
    </div>
  );
}
