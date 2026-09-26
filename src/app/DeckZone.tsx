import { useState } from 'react';
import CardImage from '../components/CardImage';
import { isMonster, isSpell, isTrap } from '../lib/card';
import { LIMITS, ZONE_LABELS, type Zone } from '../lib/deck';
import { DRAG_TYPE, readDrag, writeDrag } from './drag';
import { addCard, lookup, moveCard, removeAt, select, useLimitOf, useStore } from './store';

const MAX: Record<Zone, number> = { main: LIMITS.mainMax, extra: LIMITS.extraMax, side: LIMITS.sideMax };

export default function DeckZone({ zone }: { zone: Zone }) {
  const ids = useStore((s) => s.deck[zone]);
  const selected = useStore((s) => s.selected);
  useStore((s) => s.cardMap); // 数据加载完成后重新渲染
  const limitOf = useLimitOf();
  const [dropping, setDropping] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const over = ids.length > MAX[zone] || (zone === 'main' && ids.length < LIMITS.mainMin);
  const stats = { m: 0, s: 0, t: 0 };
  for (const id of ids) {
    const c = lookup(id);
    if (!c) continue;
    if (isMonster(c)) stats.m++;
    else if (isSpell(c)) stats.s++;
    else if (isTrap(c)) stats.t++;
  }

  function onDragOver(e: React.DragEvent, index: number | null) {
    if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
    e.preventDefault();
    e.stopPropagation();
    setDropping(true);
    setDropIndex(index);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const d = readDrag(e.nativeEvent);
    const at = dropIndex ?? undefined;
    setDropping(false);
    setDropIndex(null);
    if (!d) return;
    if (d.from === 'search') {
      const target = addCard(d.id, zone);
      // 放到指定位置（卡片被自动分到其它区域时保持在末尾）
      if (target === zone && at !== undefined) moveCard(zone, useStore.getState().deck[zone].length - 1, zone, at);
    } else {
      moveCard(d.from, d.index, zone, at);
    }
  }

  return (
    <section
      className={dropping ? 'zone dropping' : 'zone'}
      data-zone={zone}
      onDragOver={(e) => onDragOver(e, null)}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDropping(false);
          setDropIndex(null);
        }
      }}
      onDrop={onDrop}
    >
      <h3>
        {ZONE_LABELS[zone]}
        <span className={over ? 'bad' : undefined}>{ids.length}</span>
        {zone !== 'extra' && ids.length > 0 && (
          <small className="muted">
            怪兽 {stats.m} · 魔法 {stats.s} · 陷阱 {stats.t}
          </small>
        )}
      </h3>
      <div className="zone-grid">
        {ids.map((id, i) => {
          const card = lookup(id);
          const cls = ['cell', selected === id && 'selected', dropIndex === i && 'insert'].filter(Boolean).join(' ');
          return (
            <button
              key={`${i}:${id}`}
              className={cls}
              draggable
              title={`${card?.name ?? id}（双击或右键移除）`}
              onDragStart={(e) => writeDrag(e.nativeEvent, { from: zone, index: i, id })}
              onDragOver={(e) => onDragOver(e, i)}
              onClick={() => select(id)}
              onDoubleClick={() => removeAt(zone, i)}
              onContextMenu={(e) => {
                e.preventDefault();
                removeAt(zone, i);
              }}
            >
              <CardImage id={id} card={card} limit={card ? limitOf(card) : undefined} />
            </button>
          );
        })}
        {ids.length === 0 && (
          <p className="empty muted">{zone === 'side' ? '把卡拖到这里，或在卡片详情里点「+ 副卡组」' : '在搜索结果中双击、点 + 或把卡片拖到这里'}</p>
        )}
      </div>
    </section>
  );
}
