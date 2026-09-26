import { useEffect, useState } from 'react';
import DeckEditor from './DeckEditor';
import DetailPanel from './DetailPanel';
import SearchPanel from './SearchPanel';
import { init, useStore } from './store';

export default function Builder() {
  const deck = useStore((s) => s.deck);
  const selected = useStore((s) => s.selected);
  const [tab, setTab] = useState<'deck' | 'search'>('deck');

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <div className="tabs">
        <button className={tab === 'deck' ? 'on' : undefined} onClick={() => setTab('deck')}>
          卡组 ({deck.main.length}/{deck.extra.length}/{deck.side.length})
        </button>
        <button className={tab === 'search' ? 'on' : undefined} onClick={() => setTab('search')}>
          搜索卡片
        </button>
      </div>
      <main className="builder" data-tab={tab}>
        <section className="deck-col">
          <DeckEditor />
        </section>
        <aside className={selected !== null ? 'detail-col open' : 'detail-col'}>
          <DetailPanel />
        </aside>
        <section className="search-col">
          <SearchPanel />
        </section>
      </main>
    </>
  );
}
