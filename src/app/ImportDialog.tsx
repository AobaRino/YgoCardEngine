import { useState } from 'react';
import { deckSize, parseAny } from '../lib/deck';
import Modal from './Modal';
import { setDeck, toast } from './store';

export default function ImportDialog({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    setText(await file.text());
    if (!name) setName(file.name.replace(/\.ydk$/i, ''));
  }

  function submit() {
    const deck = parseAny(text, name.trim());
    if (!deck || !deckSize(deck)) {
      setError('无法识别：请粘贴 ydke:// 卡组码、YDK 文件内容或本站分享链接');
      return;
    }
    if (!deck.name) deck.name = name.trim();
    setDeck(deck);
    toast(`已导入 ${deckSize(deck)} 张卡`);
    onClose();
  }

  return (
    <Modal title="导入卡组" onClose={onClose}>
      <label className="row">
        选择 .ydk 文件 <input type="file" accept=".ydk,.txt" onChange={onFile} />
      </label>
      <textarea
        className="input mono"
        rows={8}
        placeholder={'粘贴以下任意格式：\nydke://…\nYDK 文件内容（#main / #extra / !side）\n本站分享链接'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input className="input" placeholder="卡组名称（可选）" value={name} onChange={(e) => setName(e.target.value)} />
      {error && <p className="ygo-error">{error}</p>}
      <div className="row end">
        <button className="btn" onClick={onClose}>
          取消
        </button>
        <button className="btn primary" onClick={submit} disabled={!text.trim()}>
          导入（替换当前卡组）
        </button>
      </div>
    </Modal>
  );
}
