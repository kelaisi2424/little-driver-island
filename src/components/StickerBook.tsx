import { STICKER_POOL, loadStickers } from '../utils/stickers';

interface StickerBookProps {
  onBack: () => void;
}

export default function StickerBook({ onBack }: StickerBookProps) {
  const owned = new Set(loadStickers());

  return (
    <main className="panel-screen sticker-book">
      <header className="panel-header">
        <button onClick={onBack} type="button">返回</button>
        <h1>贴纸册</h1>
        <span>{owned.size} / {STICKER_POOL.length}</span>
      </header>

      <section className="sticker-grid">
        {STICKER_POOL.map((sticker) => {
          const hasSticker = owned.has(sticker.id);
          return (
            <div key={sticker.id} className={`sticker-cell ${hasSticker ? 'owned' : 'locked'}`}>
              <div className="sticker-emoji" style={{ background: hasSticker ? sticker.color : '#d8d8d8' }}>
                {hasSticker ? sticker.emoji : '🔒'}
              </div>
              <strong>{hasSticker ? sticker.name : '还没解锁'}</strong>
              <small>{hasSticker ? '已经收集' : '完成第 5 关解锁'}</small>
            </div>
          );
        })}
      </section>
    </main>
  );
}
