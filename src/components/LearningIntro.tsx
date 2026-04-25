import { useEffect } from 'react';
import { speak, stopSpeaking } from '../utils/speech';

interface LearningIntroProps {
  emoji: string;
  text: string;
  onContinue: () => void;
  buttonText?: string;
}

// 学习模式的开场卡片，每个任务开始时显示一次。
// 进入时朗读解释文字，离开时停止朗读。
export default function LearningIntro({
  emoji,
  text,
  onContinue,
  buttonText = '好的，我知道啦',
}: LearningIntroProps) {
  useEffect(() => {
    speak(text);
    return () => stopSpeaking();
  }, [text]);

  return (
    <div className="overlay">
      <div className="learn-card">
        <div className="learn-emoji" aria-hidden>{emoji}</div>
        <div className="learn-text">{text}</div>
        <button className="btn btn-secondary" onClick={onContinue}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
