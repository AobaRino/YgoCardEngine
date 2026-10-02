import { useEffect, useRef, useState } from 'react';
import { getCard, loadBanlists, loadCards, type Banlist } from '../lib/data';
import { allIds, deckToParams, type Deck } from '../lib/deck';
import { canvasToBlob, renderDeckImage } from '../lib/deckImage';
import { siteBase } from '../lib/util';
import Modal from './Modal';

interface Props {
  deck: Deck;
  /** 不传则用最新禁卡表；传 null 表示不标禁限 */
  banlist?: Banlist | null;
  onClose: () => void;
}

const fileName = (deck: Deck) => `${(deck.name || 'deck').replace(/[\\/:*?"<>|]/g, '_')}.jpg`;

export default function ImageDialog({ deck, banlist, onClose }: Props) {
  const [progress, setProgress] = useState<[number, number]>([0, 0]);
  const [result, setResult] = useState<{ url: string; jpeg: Blob; missing: number } | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let alive = true;
    let objectUrl = '';
    const base = siteBase();
    const banlistReady = banlist !== undefined ? Promise.resolve(banlist) : loadBanlists().then((l) => l[0] ?? null, () => null);
    // 卡片数据（卡名、类型、攻守）可能还没加载完，比如分享页刚打开就点了导出，先等它就绪
    Promise.all([banlistReady, loadCards(allIds(deck))])
      .then(([bl]) =>
        renderDeckImage(deck, {
          lookup: getCard,
          banlist: bl,
          // 卡组名只取前 12 个字，控制二维码密度（图片里已经印着完整卡组名）
          url: `${base}#/view?${deckToParams(deck, 12)}`,
          thumbBase: new URL('thumbs/', base).href,
          siteLabel: base.replace(/^https?:\/\//, '').replace(/\/$/, ''),
          onProgress: (n, total) => alive && setProgress([n, total]),
        }),
      )
      .then(async ({ canvas, missingImages }) => {
        const jpeg = await canvasToBlob(canvas, 'image/jpeg', 0.92);
        if (!alive) return;
        canvasRef.current = canvas;
        objectUrl = URL.createObjectURL(jpeg);
        setResult({ url: objectUrl, jpeg, missing: missingImages });
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [deck, banlist]);

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(''), 2000);
  }

  function download() {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = fileName(deck);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function copy() {
    try {
      // 剪贴板只普遍支持 PNG
      const png = await canvasToBlob(canvasRef.current!, 'image/png');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
      flash('图片已复制，可以直接粘贴到聊天窗口');
    } catch {
      flash('当前浏览器不支持复制图片，请下载后发送');
    }
  }

  const file = result ? new File([result.jpeg], fileName(deck), { type: 'image/jpeg' }) : null;
  const canShare = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
  const canCopy = typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;

  async function share() {
    try {
      await navigator.share({ files: [file!], title: deck.name || '游戏王卡组' });
    } catch {
      /* 用户取消分享 */
    }
  }

  return (
    <Modal title="导出卡组图片" onClose={onClose} wide>
      {error ? (
        <p className="ygo-error">生成失败：{error}</p>
      ) : !result ? (
        <p className="muted">
          正在生成图片…{progress[1] > 0 && ` 加载卡图 ${progress[0]}/${progress[1]}`}
        </p>
      ) : (
        <>
          <div className="row">
            <button className="btn primary" onClick={download}>
              下载图片
            </button>
            {canCopy && (
              <button className="btn" onClick={copy}>
                复制图片
              </button>
            )}
            {canShare && (
              <button className="btn" onClick={share}>
                分享…
              </button>
            )}
            <span className="muted small">{msg || `${(result.jpeg.size / 1024).toFixed(0)} KB · 手机上也可以长按图片保存`}</span>
          </div>
          {result.missing > 0 && (
            <p className="small" style={{ color: 'var(--warn)' }}>
              有 {result.missing} 种卡的卡图没能加载（可能是新卡还没生成缩略图，或网络问题），图中用文字卡面代替。
            </p>
          )}
          <img className="deck-image-preview" src={result.url} alt={`${deck.name || '卡组'}分享图`} />
        </>
      )}
    </Modal>
  );
}
