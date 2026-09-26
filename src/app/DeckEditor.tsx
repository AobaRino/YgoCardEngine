import { useState } from 'react';
import { ZONES, deckSize, emptyDeck, toYdk, toYdke, validateDeck } from '../lib/deck';
import { saveDeck } from '../lib/storage';
import { copyText, downloadText } from '../lib/util';
import DeckZone from './DeckZone';
import DecksDialog from './DecksDialog';
import DrawDialog from './DrawDialog';
import ImportDialog from './ImportDialog';
import ShareDialog from './ShareDialog';
import { lookup, markSaved, renameDeck, selectBanlist, setBanlist, setDeck, sortDeck, toast, useStore } from './store';

type Dialog = '' | 'share' | 'import' | 'decks' | 'draw';

export default function DeckEditor() {
  const deck = useStore((s) => s.deck);
  const savedId = useStore((s) => s.savedId);
  const loading = useStore((s) => s.loading);
  const banlists = useStore((s) => s.banlists);
  const banlistName = useStore((s) => s.banlistName);
  const banlist = useStore(selectBanlist);
  const [dialog, setDialog] = useState<Dialog>('');
  const [showIssues, setShowIssues] = useState(false);
  const close = () => setDialog('');

  const issues = loading ? [] : validateDeck(deck, lookup, banlist);
  const errors = issues.filter((i) => i.level === 'error').length;
  const size = deckSize(deck);

  function save() {
    markSaved(saveDeck(deck, savedId).id);
    toast('已保存到本浏览器');
  }

  function newDeck() {
    if (size && !confirm('新建卡组会清空当前编辑内容（已保存的卡组不受影响），继续？')) return;
    setDeck(emptyDeck());
  }

  function clearDeck() {
    if (size && confirm('清空当前卡组中的所有卡片？')) setDeck(emptyDeck(deck.name), savedId);
  }

  return (
    <div className="editor">
      <div className="editor-head">
        <input className="input deck-name" placeholder="卡组名称" value={deck.name} onChange={(e) => renameDeck(e.target.value)} />
        <label className="banlist">
          <span className="muted">禁卡表</span>
          <select className="input" value={banlistName} onChange={(e) => setBanlist(e.target.value)}>
            <option value="">无限制</option>
            {banlists.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="toolbar">
        <button className="btn" onClick={newDeck}>新建</button>
        <button className="btn primary" onClick={save}>保存</button>
        <button className="btn" onClick={() => setDialog('decks')}>我的卡组</button>
        <button className="btn" onClick={() => setDialog('import')}>导入</button>
        <button className="btn" onClick={() => downloadText(`${deck.name || 'deck'}.ydk`, toYdk(deck))} disabled={!size}>导出 YDK</button>
        <button className="btn" onClick={async () => toast((await copyText(toYdke(deck))) ? '卡组码已复制' : '复制失败')} disabled={!size}>复制卡组码</button>
        <button className="btn primary" onClick={() => setDialog('share')} disabled={!size}>分享 / 嵌入</button>
        <button className="btn" onClick={sortDeck}>排序</button>
        <button className="btn" onClick={() => setDialog('draw')} disabled={!deck.main.length}>试抽</button>
        <button className="btn danger" onClick={clearDeck}>清空</button>
      </div>

      {issues.length > 0 ? (
        <div className={errors ? 'issues has-error' : 'issues'}>
          <button className="issues-summary" onClick={() => setShowIssues(!showIssues)}>
            {errors ? `✗ ${errors} 个问题` : '⚠ 提示'}：{issues[0].message}
            {issues.length > 1 ? ` 等 ${issues.length} 项` : ''}
            <span>{showIssues ? '▴' : '▾'}</span>
          </button>
          {showIssues && (
            <ul>
              {issues.map((i, n) => (
                <li key={n} className={i.level}>
                  {i.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        size > 0 && <div className="issues ok">✓ 卡组符合规则</div>
      )}

      {ZONES.map((zone) => (
        <DeckZone key={zone} zone={zone} />
      ))}

      {dialog === 'share' && <ShareDialog onClose={close} />}
      {dialog === 'import' && <ImportDialog onClose={close} />}
      {dialog === 'decks' && <DecksDialog onClose={close} />}
      {dialog === 'draw' && <DrawDialog onClose={close} />}
    </div>
  );
}
