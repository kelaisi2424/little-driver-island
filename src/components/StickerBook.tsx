import { STICKER_POOL, loadStickers } from '../utils/stickers';
import CarSvg from './CarSvg';

interface StickerBookProps {
  onBack: () => void;
}

// 贴纸册：展示已收集和未收集的贴纸。
// 不展示稀有度、不展示获得概率，只是单纯的收藏视图。
export default function StickerBook({ onBack }: StickerBookProps) {
  const owned = new Set(loadStickers());

  return (
    <div className="sticker-book">
      <h2>我的小车贴纸册</h2>
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
              <div className="sticker-art">
                <CarSvg
                  color={has ? s.color : '#cfcfcf'}
                  size={92}
                  smile={has}
                />
              </div>
              <div className="sticker-name">
                {has ? s.name : '尚未收集'}
              </div>
            </div>
          );
        })}
      </div>

      {owned.size >= STICKER_POOL.length && (
        <div className="sticker-complete">
          🎉 你集齐了所有贴纸！
        </div>
      )}

      <div className="sticker-back-row">
        <button className="btn btn-ghost" onClick={onBack}>
          返回
        </button>
      </div>
    </div>
  );
}
