import { useEffect, useState } from 'react';

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
        <h1 className="rest-title">眼睛休息一下</h1>
        <div className="rest-stars">👀</div>
        <p className="rest-stars-text">去喝口水，看看远处吧。</p>
      </div>
      <div className="rest-reminder">
        连续闯关很棒，现在休息 {left} 秒。
      </div>
      <button className="master-start-btn" onClick={onDone} disabled={left > 0} type="button">
        {left > 0 ? `${left} 秒后继续` : '回到车库'}
      </button>
    </main>
  );
}
