import type React from 'react';
import type { CarDefinition, CarId } from '../types';
import { CARS } from '../data/cars';

interface CarSelectProps {
  selectedCarId: CarId;
  onSelect: (car: CarDefinition) => void;
  onBack: () => void;
}

export default function CarSelect({ selectedCarId, onSelect, onBack }: CarSelectProps) {
  return (
    <main className="panel-screen car-select-screen">
      <header className="panel-header">
        <button onClick={onBack} type="button">返回</button>
        <h1>我的车库</h1>
        <span>4 辆车都能开</span>
      </header>

      <section className="car-choice-grid">
        {CARS.map((car) => (
          <button
            key={car.id}
            className={`car-choice ${selectedCarId === car.id ? 'active' : ''}`}
            onClick={() => onSelect(car)}
            type="button"
          >
            <div
              className="mini-show-car"
              style={{ '--car': car.bodyColor, '--roof': car.roofColor } as React.CSSProperties}
            >
              <span className="car-roof" />
              <span className="wheel left" />
              <span className="wheel right" />
            </div>
            <strong>{car.name}</strong>
            <small>{selectedCarId === car.id ? '正在开' : '点一下开这辆'}</small>
          </button>
        ))}
      </section>
    </main>
  );
}
