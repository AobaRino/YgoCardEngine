import { useState } from 'react';
import CardImage from '../components/CardImage';
import CardText from '../components/CardText';
import CardZoom from '../components/CardZoom';
import { countCopies, defaultZone } from '../lib/deck';
import { addCard, lookup, removeOne, select, useLimitOf, useStore } from './store';

export default function DetailPanel() {
  const id = useStore((s) => s.selected);
  const deck = useStore((s) => s.deck);
  const setnames = useStore((s) => s.setnames);
  useStore((s) => s.cardMap);
  const limitOf = useLimitOf();
  const [zoom, setZoom] = useState(false);
  const card = id !== null ? lookup(id) : undefined;

  if (!card || id === null) {
    return (
      <div className="detail placeholder muted">
        <p>点击任意卡片查看详情</p>
        <p>点击大图可放大查看，←/→ 翻页</p>
      </div>
    );
  }

  const inDeck = countCopies(deck, card, lookup);
  return (
    <div className="detail">
      <button className="detail-close" onClick={() => select(null)} aria-label="关闭">
        ✕
      </button>
      <button className="detail-image" onClick={() => setZoom(true)} title="点击放大">
        <CardImage id={id} card={card} lazy={false} />
      </button>
      <div className="detail-actions">
        <button className="btn primary" onClick={() => addCard(id)}>
          + {defaultZone(card) === 'extra' ? '额外' : '主卡组'}
        </button>
        <button className="btn" onClick={() => addCard(id, 'side')}>
          + 副卡组
        </button>
        <button className="btn danger" disabled={!inDeck} onClick={() => removeOne(id)}>
          − 移除
        </button>
        <span className="muted">
          卡组中 {inDeck}/{limitOf(card)}
        </span>
      </div>
      <CardText card={card} setnames={setnames} limit={limitOf(card)} />
      {zoom && <CardZoom ids={[id]} index={0} lookup={lookup} setnames={setnames} limitOf={limitOf} onClose={() => setZoom(false)} />}
    </div>
  );
}
