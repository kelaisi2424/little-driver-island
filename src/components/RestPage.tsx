// 休息页 v4：温柔插画，小车停在树下，水杯，倒计时按钮。

import { useEffect, useState } from 'react';
import CartoonCar from './ui/CartoonCar';
import GameButton from './ui/GameButton';

interface RestPageProps {
  onDone: () => void;
}

export default function RestPage({ onDone }: RestPageProps) {
  const [left, setLeft] = useState(20);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="rest-page drive-rest">
      <div>
        <h1 className="rest-title">小司机休息一下啦</h1>
        <p className="rest-stars-text">喝口水，看看远处，眼睛会更舒服哦</p>
      </div>

      <div className="rest-illustration">
        <span className="rest-tree" aria-hidden>🌳</span>
        <span className="rest-cup" aria-hidden>🥛</span>
        <CartoonCar size={200} bobbing spinning={false} />
      </div>

      <div className="rest-reminder">
        休息 {left} 秒，让小眼睛舒服一下。
      </div>

      <div className="rest-countdown-btn">
        <GameButton
          variant={left > 0 ? 'ghost' : 'primary'}
          size="lg"
          emoji={left > 0 ? '⏳' : '🚗'}
          disabled={left > 0}
          onClick={onDone}
        >
          {left > 0 ? `${left} 秒后继续` : '回到首页'}
        </GameButton>
      </div>
    </main>
  );
}
