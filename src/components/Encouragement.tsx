import { useEffect } from 'react';
import { randomSuccessEmoji } from '../utils/messages';
import { speak } from '../utils/speech';

interface EncouragementProps {
  message: string;
  onContinue: () => void;
  emoji?: string;
  buttonText?: string;
  detail?: string; // 学习模式下额外的解释
  spokenText?: string; // 自定义朗读内容（默认朗读 message）
}

export default function Encouragement({
  message,
  onContinue,
  emoji,
  buttonText = '下一关 →',
  detail,
  spokenText,
}: EncouragementProps) {
  const finalEmoji = emoji ?? randomSuccessEmoji();

  useEffect(() => {
    const text = spokenText ?? (detail ? `${message}${detail}` : message);
    speak(text);
  }, [message, detail, spokenText]);

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="success-card">
        <div className="success-emoji" aria-hidden>
          {finalEmoji}
        </div>
        <div className="success-text">{message}</div>
        {detail && <div className="success-detail">{detail}</div>}
        <button className="btn btn-success" onClick={onContinue}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
