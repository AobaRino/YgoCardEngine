import { useState } from 'react';
import { deleteDeck, listDecks } from '../lib/storage';
import Modal from './Modal';
import { clearSavedId, setDeck, useStore } from './store';

export default function DecksDialog({ onClose }: { onClose: () => void }) {
  const [decks, setDecks] = useState(listDecks);
  const savedId = useStore((s) => s.savedId);

  function remove(id: string, name: string) {
    if (!confirm(`删除卡组「${name || '未命名'}」？`)) return;
    deleteDeck(id);
    setDecks(listDecks());
    if (savedId === id) clearSavedId();
  }

  return (
    <Modal title="我的卡组（保存在本浏览器）" onClose={onClose}>
      {decks.length === 0 && <p className="muted">还没有保存的卡组。编辑卡组后点击「保存」即可。</p>}
      <ul className="deck-list">
        {decks.map((d) => (
          <li key={d.id} className={d.id === savedId ? 'current' : undefined}>
            <button
              className="deck-list-open"
              onClick={() => {
                setDeck(d, d.id);
                onClose();
              }}
            >
              <strong>{d.name || '未命名卡组'}</strong>
              <span className="muted">
                主 {d.main.length} · 额外 {d.extra.length} · 副 {d.side.length} · {new Date(d.updatedAt).toLocaleString()}
              </span>
            </button>
            <button className="btn small danger" onClick={() => remove(d.id, d.name)}>
              删除
            </button>
          </li>
        ))}
      </ul>
      <p className="muted small">提示：本地保存只在当前浏览器有效，换设备请用分享链接或 YDK 文件。</p>
    </Modal>
  );
}
