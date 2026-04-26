// 车库页：6 辆车选择 + 解锁状态。
// 点击已解锁车 → 持久化选择 → 返回首页。

import { CARS_3D, isCarUnlocked, type Car3D } from '../../data/cars3d';
import { saveSelectedCarId } from '../../utils/storage';
import { playSound } from '../../utils/sound';

interface GaragePageProps {
  unlockedLevel: number;        // 当前已解锁的关卡 id（用于判断车辆是否解锁）
  selectedCarId: string;
  onBack: () => void;
  onSelect: (carId: string) => void;
}

export default function GaragePage({
  unlockedLevel,
  selectedCarId,
  onBack,
  onSelect,
}: GaragePageProps) {
  const handlePick = (car: Car3D) => {
    if (!isCarUnlocked(car, unlockedLevel)) return;
    playSound('click');
    saveSelectedCarId(car.id);
    onSelect(car.id);
  };

  return (
    <main className="garage-page">
      <header className="cs-header">
        <button className="cs-back" onClick={onBack} type="button" aria-label="返回">←</button>
        <h1>我的车库</h1>
        <div className="cs-spacer" />
      </header>
      <p className="cs-desc">选一辆喜欢的小车，进关卡时就用它开车</p>

      <div className="garage-grid">
        {CARS_3D.map((car) => {
          const unlocked = isCarUnlocked(car, unlockedLevel);
          const selected = car.id === selectedCarId;
          return (
            <button
              key={car.id}
              type="button"
              disabled={!unlocked}
              className={`garage-card ${unlocked ? 'unlocked' : 'locked'} ${selected ? 'selected' : ''}`}
              style={{
                ['--car-color' as string]: car.bodyColor,
                ['--car-dark' as string]: car.bodyDarkColor,
              }}
              onClick={() => handlePick(car)}
            >
              <div className="garage-emoji">{unlocked ? car.emoji : '🔒'}</div>
              <div className="garage-name">{car.name}</div>
              <div className="garage-desc">{car.description}</div>
              <div className="garage-status">
                {selected ? (
                  <span className="badge badge-selected">✓ 已选择</span>
                ) : unlocked ? (
                  <span className="badge badge-ok">点击使用</span>
                ) : (
                  <span className="badge badge-lock">完成第 {car.unlockLevel} 关解锁</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
