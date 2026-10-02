import { useEffect, useMemo, useState } from 'react';
import { isMonster, isSpell, isTrap, type Card } from '../lib/card';
import { loadBanlists, loadCards, loadSetnames, type Banlist } from '../lib/data';
import { ZONES, ZONE_LABELS, allIds, copyLimit, deckToParams, toYdk, toYdke, type Deck } from '../lib/deck';
import { copyText, downloadText } from '../lib/util';
import CardImage from './CardImage';
import CardZoom from './CardZoom';

interface Props {
  deck: Deck;
  /** 组卡器地址，用于「在组卡器中打开」 */
  builderUrl?: string;
  compact?: boolean;
  showToolbar?: boolean;
  /** 提供时工具栏显示「导出图片」（嵌入组件不提供，以免增加脚本体积） */
  onExportImage?: () => void;
}

/** 只读卡组展示：分享页、iframe 嵌入页、<ygo-deck> 组件共用 */
export default function DeckView({ deck, builderUrl, compact = false, showToolbar = true, onExportImage }: Props) {
  const [cards, setCards] = useState<Map<number, Card> | null>(null);
  const [error, setError] = useState('');
  const [banlist, setBanlist] = useState<Banlist | null>(null);
  const [setnames, setSetnames] = useState<Map<number, string>>();
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let alive = true;
    setError('');
    loadCards(allIds(deck))
      .then((m) => alive && setCards(new Map(m)))
      .catch((e: Error) => alive && setError(e.message));
    loadBanlists()
      .then((l) => alive && setBanlist(l[0] ?? null))
      .catch(() => {});
    loadSetnames()
      .then((s) => alive && setSetnames(s))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [deck]);

  const lookup = (id: number) => cards?.get(id);
  const flat = useMemo(() => allIds(deck), [deck]);
  const offsets = { main: 0, extra: deck.main.length, side: deck.main.length + deck.extra.length };

  const stats = { monster: 0, spell: 0, trap: 0 };
  for (const id of deck.main) {
    const c = lookup(id);
    if (!c) continue;
    if (isMonster(c)) stats.monster++;
    else if (isSpell(c)) stats.spell++;
    else if (isTrap(c)) stats.trap++;
  }

  const openUrl = builderUrl ? `${builderUrl}#/?${deckToParams(deck)}` : '';

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  }

  return (
    <div className={compact ? 'ygo-deck compact' : 'ygo-deck'}>
      <header className="ygo-deck-head">
        <div className="ygo-deck-title">
          <strong>{deck.name || '未命名卡组'}</strong>
          <span className="ygo-deck-counts">
            主 {deck.main.length} · 额外 {deck.extra.length} · 副 {deck.side.length}
            {cards && ` （怪兽 ${stats.monster} / 魔法 ${stats.spell} / 陷阱 ${stats.trap}）`}
          </span>
        </div>
        {showToolbar && (
          <div className="ygo-deck-toolbar">
            <button
              onClick={async () => flash((await copyText(toYdke(deck))) ? '卡组码已复制' : '复制失败')}
              title="复制 ydke:// 卡组码，可导入 YGOPro / EDOPro 等"
            >
              复制卡组码
            </button>
            <button onClick={() => downloadText(`${deck.name || 'deck'}.ydk`, toYdk(deck))}>下载 YDK</button>
            {onExportImage && <button onClick={onExportImage}>导出图片</button>}
            {openUrl && (
              <a href={openUrl} target="_blank" rel="noopener">
                在组卡器中打开
              </a>
            )}
          </div>
        )}
      </header>

      {error && <p className="ygo-error">卡片数据加载失败：{error}</p>}

      {ZONES.map(
        (zone) =>
          deck[zone].length > 0 && (
            <section key={zone}>
              <h4>
                {ZONE_LABELS[zone]} <span>{deck[zone].length}</span>
              </h4>
              <div className="ygo-deck-grid">
                {deck[zone].map((id, i) => {
                  const card = lookup(id);
                  return (
                    <button key={i} className="ygo-deck-cell" onClick={() => setZoomIndex(offsets[zone] + i)} title={card?.name ?? String(id)}>
                      <CardImage id={id} card={card} limit={card ? copyLimit(card, banlist) : undefined} />
                    </button>
                  );
                })}
              </div>
            </section>
          ),
      )}

      {toast && <div className="ygo-toast">{toast}</div>}

      {zoomIndex !== null && (
        <CardZoom
          ids={flat}
          index={zoomIndex}
          onIndexChange={setZoomIndex}
          lookup={lookup}
          setnames={setnames}
          limitOf={(c) => copyLimit(c, banlist)}
          onClose={() => setZoomIndex(null)}
        />
      )}
    </div>
  );
}
