// 贴纸册 v4：相册风格。每个贴纸卡片显示来源与状态。

import { STICKER_POOL, loadStickers } from '../utils/stickers';
import StickerCard from './ui/StickerCard';
import GameButton from './ui/GameButton';

interface StickerBookProps {
  onBack: () => void;
}

const SOURCE: Record<string, string> = {
  'safe-car': '完成第 5 关获得',
  'parking-p': '完成第 7 关获得',
  'little-bus': '完成第 9 关获得',
  'wrench': '完成第 10 关获得',
  'traffic-light': '红绿灯专项关获得',
  'bubble-car': '隐藏关卡奖励',
};

export default function StickerBook({ onBack }: StickerBookProps) {
  const owned = new Set(loadStickers());

  return (
    <main className="sticker-book">
      <header className="ls-header">
        <button className="ls-back gpanel-back" onClick={onBack} type="button" aria-label="返回">←</button>
        <h1>贴纸册</h1>
        <div style={{ width: 44 }} />
      </header>

      <div style={{ textAlign: 'center' }}>
        <div className="sticker-count">
          已收集 {owned.size} / {STICKER_POOL.length}
        </div>
      </div>

      <div className="sticker-album">
        <div className="sticker-grid">
          {STICKER_POOL.map((s) => (
            <StickerCard
              key={s.id}
              name={s.name}
              emoji={s.emoji}
              color={s.color}
              unlocked={owned.has(s.id)}
              source={SOURCE[s.id]}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <GameButton variant="ghost" size="md" emoji="🏠" onClick={onBack}>
          回首页
        </GameButton>
      </div>
    </main>
  );
}
