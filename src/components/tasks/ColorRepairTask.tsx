import { useEffect, useRef, useState } from 'react';
import type { TaskComponentProps } from '../../types';
import { pickRandom, shuffle } from '../../utils/random';
import { randomSuccess } from '../../utils/messages';
import { playSound } from '../../utils/sound';
import { speak } from '../../utils/speech';
import CarSvg from '../CarSvg';
import Encouragement from '../Encouragement';
import LearningIntro from '../LearningIntro';
import Toast from '../Toast';

interface ColorOption {
  name: string;
  value: string;
  hint: string;
}

type Phase = 'intro' | 'play' | 'success';

const COLORS: readonly ColorOption[] = [
  { name: '红色', value: '#ff5252', hint: '红色像苹果一样' },
  { name: '蓝色', value: '#4a90e2', hint: '蓝色像天空一样' },
  { name: '黄色', value: '#ffd166', hint: '黄色像香蕉一样' },
  { name: '绿色', value: '#5cd684', hint: '绿色像树叶一样' },
];

const LEARNING_INTRO =
  '看，这里有 4 辆颜色不一样的小车。仔细看一看，找到题目说的颜色。';

export default function ColorRepairTask({ onComplete, mode }: TaskComponentProps) {
  const [target] = useState<ColorOption>(() => pickRandom(COLORS));
  const [order] = useState<ColorOption[]>(() => shuffle(COLORS));
  const [hint, setHint] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>(
    mode === 'learning' ? 'intro' : 'play',
  );
  const [feedbackIndex, setFeedbackIndex] = useState<number | null>(null);
  const [feedbackKind, setFeedbackKind] = useState<'correct' | 'wrong' | null>(null);
  const hintTimerRef = useRef<number | null>(null);
  const fbTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (fbTimerRef.current) clearTimeout(fbTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'play') speak(`请找到${target.name}小车`);
  }, [phase, target]);

  const showHint = (text: string) => {
    setHint(text);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => setHint(null), 2400);
  };

  const handlePick = (color: ColorOption, index: number) => {
    if (phase !== 'play') return;
    if (color.value === target.value) {
      playSound('success');
      setFeedbackIndex(index);
      setFeedbackKind('correct');
      window.setTimeout(() => setPhase('success'), 500);
    } else {
      playSound('fail');
      setFeedbackIndex(index);
      setFeedbackKind('wrong');
      const h = `再看看，${target.hint}`;
      showHint(h);
      speak(h);
      if (fbTimerRef.current) clearTimeout(fbTimerRef.current);
      fbTimerRef.current = window.setTimeout(() => {
        setFeedbackIndex(null);
        setFeedbackKind(null);
      }, 600);
    }
  };

  return (
    <div className="task color-task">
      <div className="task-prompt">
        请找到{' '}
        <span className="target-color" style={{ background: target.value }}>
          {target.name}
        </span>{' '}
        小车
      </div>

      <div className="color-grid">
        {order.map((c, i) => {
          const cls =
            feedbackIndex === i && feedbackKind
              ? feedbackKind === 'correct'
                ? 'picked-correct'
                : 'picked-wrong'
              : '';
          return (
            <div
              key={c.value}
              className={`color-cell ${cls}`}
              onClick={() => handlePick(c, i)}
              aria-label={`${c.name}小车`}
            >
              <CarSvg color={c.value} size={120} />
            </div>
          );
        })}
      </div>

      {phase === 'intro' && (
        <LearningIntro
          emoji="🎨"
          text={LEARNING_INTRO}
          onContinue={() => setPhase('play')}
        />
      )}

      {hint && <Toast message={hint} />}

      {phase === 'success' && (
        <Encouragement
          message={randomSuccess()}
          detail={mode === 'learning' ? target.hint : undefined}
          onContinue={onComplete}
        />
      )}
    </div>
  );
}
