// 收藏册中的单张贴纸卡片：解锁的鲜艳，未解锁的灰色剪影 + 锁。

interface StickerCardProps {
  name: string;
  emoji: string;
  color: string;
  unlocked: boolean;
  source?: string;     // 来源描述，如 "完成第 5 关获得"
}

export default function StickerCard({
  name,
  emoji,
  color,
  unlocked,
  source,
}: StickerCardProps) {
  return (
    <div className={`sticker-card ${unlocked ? 'sticker-on' : 'sticker-off'}`}>
      <div className="sticker-art" style={{ ['--sticker-color' as string]: color }}>
        <span className="sticker-emoji" aria-hidden>{unlocked ? emoji : '🔒'}</span>
        {unlocked && <span className="sticker-shine" aria-hidden />}
      </div>
      <div className="sticker-meta">
        <div className="sticker-name">{unlocked ? name : '尚未收集'}</div>
        {source && <div className="sticker-source">{source}</div>}
      </div>
    </div>
  );
}
