import { STICKER_POOL, loadStickers } from '../utils/stickers';

interface StickerBookProps {
  onBack: () => void;
}

export default function StickerBook({ onBack }: StickerBookProps) {
  const owned = new Set(loadStickers());

  return (
    <div className="sticker-book">
      <h2>我的汽车贴纸册</h2>
      <p className="sticker-count">
        已收集 {owned.size} / {STICKER_POOL.length}
      </p>

      <div className="sticker-grid">
        {STICKER_POOL.map((s) => {
          const has = owned.has(s.id);
          return (
            <div
              key={s.id}
              className={`sticker-cell ${has ? 'owned' : 'locked'}`}
            >
              <div
                className="sticker-emoji"
                style={{ background: has ? s.color : '#d8d8d8' }}
                aria-hidden
              >
                {has ? s.emoji : '🔒'}
              </div>
              <div className="sticker-name">
                {has ? s.name : '尚未收集'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticker-back-row">
        <button className="btn btn-ghost" onClick={onBack}>
          返回
        </button>
      </div>
    </div>
  );
}
