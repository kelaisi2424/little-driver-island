import { useEffect, useRef, useState } from 'react';
import type { TaskComponentProps } from '../../types';
import { pickRandom } from '../../utils/random';
import { randomSuccess } from '../../utils/messages';
import { playSound } from '../../utils/sound';
import { speak } from '../../utils/speech';
import CarSvg from '../CarSvg';
import Encouragement from '../Encouragement';
import LearningIntro from '../LearningIntro';
import Toast from '../Toast';

type Light = 'red' | 'yellow' | 'green';
type Action = 'stop' | 'wait' | 'go';
type Phase = 'intro' | 'play' | 'success';

const ANSWERS: Record<Light, Action> = {
  red: 'stop',
  yellow: 'wait',
  green: 'go',
};

const HINTS: Record<Light, string> = {
  red: '再想想，红灯要停下来哦',
  yellow: '黄灯要等一等哦',
  green: '绿灯就可以前进啦',
};

const SUCCESS_DETAIL: Record<Light, string> = {
  red: '红灯亮了，就要停下来。',
  yellow: '黄灯亮了，要慢一慢，等一等。',
  green: '绿灯亮了，可以安全地往前走啦！',
};

const LEARNING_INTRO =
  '看，这是红绿灯。红灯亮要停下来，黄灯亮要等一等，绿灯亮才能往前走。';

const LIGHTS: Light[] = ['red', 'yellow', 'green'];

export default function TrafficLightTask({ onComplete, mode }: TaskComponentProps) {
  const [light] = useState<Light>(() => pickRandom(LIGHTS));
  const [phase, setPhase] = useState<Phase>(
    mode === 'learning' ? 'intro' : 'play',
  );
  const [hint, setHint] = useState<string | null>(null);
  const [carDriving, setCarDriving] = useState(false);
  const hintTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'play') speak('看看，是什么灯？');
  }, [phase]);

  const showHint = (text: string) => {
    setHint(text);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => setHint(null), 2200);
  };

  const handleAction = (action: Action) => {
    if (phase !== 'play') return;
    if (ANSWERS[light] === action) {
      playSound('success');
      if (action === 'go') setCarDriving(true);
      window.setTimeout(
        () => setPhase('success'),
        action === 'go' ? 900 : 500,
      );
    } else {
      playSound('fail');
      const h = HINTS[light];
      showHint(h);
      speak(h);
    }
  };

  return (
    <div className="task tl-task">
      <div className="task-prompt">看看是什么灯？</div>

      <div className="sky-area">
        <span className="sun" aria-hidden style={{ top: 12, right: 18 }}>☀️</span>
        <span className="cloud cloud-1" aria-hidden />
        <div className="traffic-light" aria-label="红绿灯">
          <div className={`tl-light ${light === 'red' ? 'on-red' : ''}`} />
          <div className={`tl-light ${light === 'yellow' ? 'on-yellow' : ''}`} />
          <div className={`tl-light ${light === 'green' ? 'on-green' : ''}`} />
        </div>
      </div>

      <div className="road">
        <div className={`car-on-road ${carDriving ? 'driving' : ''}`}>
          <CarSvg color="#ff8c69" size={90} />
        </div>
      </div>

      <div className="action-row">
        <button
          className="action-btn stop"
          onClick={() => handleAction('stop')}
          aria-label="停下"
        >
          <span className="icon" aria-hidden>🛑</span>
          停下
        </button>
        <button
          className="action-btn wait"
          onClick={() => handleAction('wait')}
          aria-label="等等"
        >
          <span className="icon" aria-hidden>⏸️</span>
          等等
        </button>
        <button
          className="action-btn go"
          onClick={() => handleAction('go')}
          aria-label="前进"
        >
          <span className="icon" aria-hidden>🚗</span>
          前进
        </button>
      </div>

      {phase === 'intro' && (
        <LearningIntro
          emoji="🚦"
          text={LEARNING_INTRO}
          onContinue={() => setPhase('play')}
        />
      )}

      {hint && <Toast message={hint} />}

      {phase === 'success' && (
        <Encouragement
          message={randomSuccess()}
          detail={mode === 'learning' ? SUCCESS_DETAIL[light] : undefined}
          onContinue={onComplete}
        />
      )}
    </div>
  );
}
