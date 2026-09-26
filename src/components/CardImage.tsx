import { useState } from 'react';
import { frameKind, isLink, isMonster, statLabel, type Card } from '../lib/card';
import { firstImage, markFailed } from '../lib/images';

interface Props {
  id: number;
  card?: Card;
  /** 禁限数量角标：0 禁止 1 限制 2 准限制 */
  limit?: number;
  lazy?: boolean;
}

export default function CardImage({ id, card, limit, lazy = true }: Props) {
  // 失败次数变化时重新挑选下一个可用图床
  const [, setFails] = useState(0);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const src = firstImage(id);
  const loaded = src !== null && loadedSrc === src;

  return (
    <div className="ygo-card" data-frame={card ? frameKind(card) : 'effect'} title={card?.name ?? String(id)}>
      {/* 文字卡面始终垫在底下：图片加载中或所有图床都失败时也能看到卡名 */}
      <div className="ygo-face" aria-hidden={loaded || undefined}>
        <div className="ygo-face-name">{card?.name ?? id}</div>
        <div className="ygo-face-art" />
        {card && isMonster(card) && (
          <div className="ygo-face-stats">
            {statLabel(card.atk)}
            {isLink(card) ? ` / L${card.level}` : ` / ${statLabel(card.def)}`}
          </div>
        )}
      </div>
      {src && (
        <img
          key={src}
          src={src}
          alt={card?.name ?? String(id)}
          className={loaded ? 'loaded' : undefined}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          draggable={false}
          onLoad={() => setLoadedSrc(src)}
          onError={() => {
            markFailed(src);
            setFails((n) => n + 1);
          }}
        />
      )}
      {limit !== undefined && limit < 3 && <span className={`ygo-limit l${limit}`}>{limit}</span>}
    </div>
  );
}
