import CarSvg from './CarSvg';

interface CuteCarProps {
  driving?: boolean;
  jumping?: boolean;
  size?: number;
  onClick?: () => void;
}

export default function CuteCar({
  driving = false,
  jumping = false,
  size = 142,
  onClick,
}: CuteCarProps) {
  return (
    <button
      className={`cute-car ${driving ? 'is-driving' : ''} ${jumping ? 'is-jumping' : ''}`}
      onClick={onClick}
      type="button"
      aria-label="小汽车"
    >
      <span className="car-light" aria-hidden />
      <CarSvg color="#ff8c69" size={size} />
    </button>
  );
}
