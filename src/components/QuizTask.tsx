import { useEffect, useRef, useState } from 'react';
import type { GameMode, TaskComponentProps } from '../types';
import type { QuizOption, SafetyQuiz } from '../data/safetyQuizzes';
import { speak } from '../utils/speech';
import { randomSuccess } from '../utils/messages';
import { playSound } from '../utils/sound';
import LearningIntro from './LearningIntro';
import Encouragement from './Encouragement';
import Toast from './Toast';
import QuizScene from './scenes/QuizScene';

interface QuizTaskProps extends TaskComponentProps {
  quiz: SafetyQuiz;
}

type Phase = 'intro' | 'play' | 'success';

// 通用安全题组件：任何 SafetyQuiz 配置都能渲染。
export default function QuizTask({ quiz, mode, onComplete }: QuizTaskProps) {
  const [phase, setPhase] = useState<Phase>(
    mode === 'learning' ? 'intro' : 'play',
  );
  const [hint, setHint] = useState<string | null>(null);
  const [pickedWrong, setPickedWrong] = useState<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);
  const wrongTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase === 'play') speak(quiz.question);
  }, [phase, quiz.question]);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    };
  }, []);

  const showHint = (text: string) => {
    setHint(text);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => setHint(null), 2400);
  };

  const handlePick = (option: QuizOption, index: number) => {
    if (phase !== 'play') return;
    if (option.correct) {
      playSound('success');
      const praise = randomSuccess();
      const detail = mode === 'learning' ? quiz.successDetail : '';
      speak(detail ? `${praise}${detail}` : praise);
      setPhase('success');
    } else {
      playSound('fail');
      const h = option.hint ?? '再想想看哦';
      speak(h);
      showHint(h);
      setPickedWrong(index);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = window.setTimeout(() => setPickedWrong(null), 600);
    }
  };

  return (
    <div className="task quiz-task">
      <div className="task-prompt">{quiz.question}</div>

      <div className="quiz-scene-wrap">
        <QuizScene scene={quiz.scene} />
      </div>

      <div className="quiz-options">
        {quiz.options.map((opt, i) => {
          const wrongCls = pickedWrong === i ? 'picked-wrong' : '';
          return (
            <button
              key={opt.text}
              className={`quiz-option ${wrongCls}`}
              onClick={() => handlePick(opt, i)}
            >
              <span className="emoji" aria-hidden>{opt.emoji}</span>
              <span className="text">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {phase === 'intro' && (
        <LearningIntro
          emoji={quiz.learningIntroEmoji}
          text={quiz.learningIntro}
          onContinue={() => setPhase('play')}
        />
      )}

      {hint && <Toast message={hint} />}

      {phase === 'success' && (
        <Encouragement
          message={randomSuccess()}
          detail={mode === 'learning' ? quiz.successDetail : undefined}
          onContinue={onComplete}
        />
      )}
    </div>
  );
}

// 提供给 GamePlay 的便捷 props 类型
export type QuizTaskWithMode = QuizTaskProps & { mode: GameMode };
