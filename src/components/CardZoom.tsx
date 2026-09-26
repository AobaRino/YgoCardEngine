import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Card } from '../lib/card';
import CardImage from './CardImage';
import CardText from './CardText';

interface Props {
  /** 可左右翻页的卡片序列 */
  ids: number[];
  index: number;
  onIndexChange?: (index: number) => void;
  lookup: (id: number) => Card | undefined;
  limitOf?: (card: Card) => number | undefined;
  setnames?: Map<number, string>;
  onClose: () => void;
  actions?: (card: Card) => ReactNode;
}

export default function CardZoom({ ids, index, onIndexChange, lookup, limitOf, setnames, onClose, actions }: Props) {
  const [big, setBig] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);
  const id = ids[index];
  const card = lookup(id);

  useEffect(() => {
    dialog.current?.focus();
  }, []);

  const go = (delta: number) => {
    if (ids.length > 1) onIndexChange?.((index + delta + ids.length) % ids.length);
  };

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else return;
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div className="ygo-zoom-backdrop" onClick={onClose}>
      <div
        ref={dialog}
        className={big ? 'ygo-zoom big' : 'ygo-zoom'}
        role="dialog"
        aria-modal="true"
        aria-label={card?.name ?? '卡片详情'}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50 && !big) go(dx < 0 ? 1 : -1);
        }}
      >
        <button className="ygo-zoom-close" onClick={onClose} aria-label="关闭">
          ✕
        </button>
        <div className="ygo-zoom-image" onClick={() => setBig(!big)} title={big ? '点击缩小' : '点击放大'}>
          <CardImage key={id} id={id} card={card} lazy={false} />
        </div>
        {!big && (
          <div className="ygo-zoom-info">
            {card ? (
              <>
                <CardText card={card} setnames={setnames} limit={limitOf?.(card)} />
                {actions && <div className="ygo-zoom-actions">{actions(card)}</div>}
              </>
            ) : (
              <p>卡号 {id} 不在数据库中</p>
            )}
          </div>
        )}
        {ids.length > 1 && (
          <>
            <button className="ygo-zoom-nav prev" onClick={() => go(-1)} aria-label="上一张">
              ‹
            </button>
            <button className="ygo-zoom-nav next" onClick={() => go(1)} aria-label="下一张">
              ›
            </button>
            <span className="ygo-zoom-pos">
              {index + 1} / {ids.length}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
