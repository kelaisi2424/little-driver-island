// 小游戏盒（次入口）：v4 风格的占位页

import GameButton from './ui/GameButton';

interface MinigamesPageProps {
  onBack: () => void;
}

const GAMES = [
  { id: 'parking-move', emoji: '🅿️', title: '停车挪一挪', tag: '小心绕开障碍', color: '#5fb3ff' },
  { id: 'car-rush', emoji: '💨', title: '小车冲冲冲', tag: '看准时机出发', color: '#ff5e3a' },
  { id: 'bus-pickup', emoji: '🚌', title: '小巴士接送', tag: '把小朋友接回家', color: '#ffd000' },
  { id: 'jump-car', emoji: '🤸', title: '飞车跳一跳', tag: '跳过水坑', color: '#5cd684' },
  { id: 'find-car', emoji: '🔍', title: '找到目标车', tag: '观察颜色和数字', color: '#a07ad6' },
  { id: 'tire-roll', emoji: '🛞', title: '轮胎滚一滚', tag: '滚过终点线', color: '#ff9eb6' },
];

export default function MinigamesPage({ onBack }: MinigamesPageProps) {
  return (
    <main className="mg-page">
      <header className="ls-header">
        <button className="ls-back gpanel-back" onClick={onBack} type="button" aria-label="返回">←</button>
        <h1>小游戏盒</h1>
        <div style={{ width: 44 }} />
      </header>

      <p className="ls-desc">先把"开始闯关"玩好，小游戏正在准备中</p>

      <div className="mg-grid">
        {GAMES.map((g) => (
          <div key={g.id} className="mg-card coming-soon">
            <div
              className="mg-emoji"
              style={{
                background: g.color,
                width: 56,
                height: 56,
                borderRadius: 16,
                margin: '0 auto',
                border: '3px solid var(--outline-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                boxShadow: '0 4px 0 rgba(0,0,0,0.18)',
              }}
            >
              {g.emoji}
            </div>
            <div className="mg-name" style={{ marginTop: 8 }}>{g.title}</div>
            <div className="mg-tag">{g.tag}</div>
            <div className="mg-soon">敬请期待</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <GameButton variant="ghost" size="md" emoji="🏠" onClick={onBack}>
          回首页
        </GameButton>
      </div>
    </main>
  );
}
