// 休息页 v5：20 秒倒计时后显示"继续闯关"+"返回首页"两个大按钮。
// 进入时朗读温柔提示，倒计时结束后再朗读"休息好啦"。

import { useEffect, useRef, useState } from 'react';
import CartoonCar from './ui/CartoonCar';
import GameButton from './ui/GameButton';
import { speak } from '../utils/speech';
import { playSound } from '../utils/sound';

interface RestPageProps {
  onDone: () => void;            // 返回首页
  onContinue?: () => void;       // 继续闯关（可选，没有就只显示返回首页）
}

export default function RestPage({ onDone, onContinue }: RestPageProps) {
  const [left, setLeft] = useState(20);
  const finishedRef = useRef(false);

  useEffect(() => {
    speak('小司机休息一下，看看远处吧。');
    const timer = window.setInterval(() => {
      setLeft((value) => {
        const next = Math.max(0, value - 1);
        if (next === 0 && !finishedRef.current) {
          finishedRef.current = true;
          playSound('star');
          speak('休息好啦，可以继续啦。');
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isResting = left > 0;

  return (
    <main className="rest-page drive-rest">
      <div className="rest-header">
        <h1 className="rest-title">小司机休息一下啦</h1>
        <p className="rest-stars-text">喝口水，看看远处，眼睛会更舒服哦</p>
      </div>

      <div className="rest-illustration">
        <span className="rest-tree" aria-hidden>🌳</span>
        <span className="rest-cup" aria-hidden>🥛</span>
        <CartoonCar size={200} bobbing spinning={false} />
      </div>

      <div className="rest-reminder">
        {isResting ? `还要休息 ${left} 秒` : '休息好啦，可以继续啦！'}
      </div>

      <div className="rest-actions">
        {onContinue && (
          <GameButton
            variant="primary"
            size="lg"
            emoji="🚗"
            disabled={isResting}
            onClick={onContinue}
          >
            {isResting ? `${left} 秒` : '继续闯关'}
          </GameButton>
        )}
        <GameButton
          variant={onContinue ? 'ghost' : 'primary'}
          size="lg"
          emoji="🏠"
          disabled={isResting}
          onClick={onDone}
        >
          返回首页
        </GameButton>
      </div>
    </main>
  );
}
