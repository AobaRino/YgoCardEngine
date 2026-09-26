import { deckToParams, toYdk, toYdke } from '../lib/deck';
import { downloadText, siteBase } from '../lib/util';
import CopyField from './CopyField';
import Modal from './Modal';
import { useStore } from './store';

const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export default function ShareDialog({ onClose }: { onClose: () => void }) {
  const deck = useStore((s) => s.deck);
  const base = siteBase();
  const params = deckToParams(deck).toString();
  const ydke = toYdke(deck);
  const iframe = `<iframe src="${base}embed.html#${params}" title="${escAttr(deck.name || '游戏王卡组')}" style="width:100%;height:640px;border:0" loading="lazy"></iframe>`;
  const widget = `<script type="module" src="${base}ygo-deck.js"></script>\n<ygo-deck name="${escAttr(deck.name)}" deck="${ydke}"></ygo-deck>`;

  return (
    <Modal title="分享 / 嵌入" onClose={onClose} wide>
      <CopyField label="分享链接（只读展示）" value={`${base}#/view?${params}`} hint="卡组内容全部编码在链接里，不需要登录或服务器。" />
      <CopyField label="编辑链接（打开后可在组卡器中修改）" value={`${base}#/?${params}`} />
      <CopyField label="卡组码 ydke://" value={ydke} hint="YGOPro / EDOPro / 各类 Discord 机器人通用，可直接粘贴导入。" />
      <div>
        <button className="btn" onClick={() => downloadText(`${deck.name || 'deck'}.ydk`, toYdk(deck))}>
          下载 .ydk 文件
        </button>
      </div>
      <CopyField label="嵌入方式一：Web Component（推荐）" value={widget} rows={3} hint="高度自适应，点击卡片可在原网页上放大查看；样式隔离，不影响你的网站。" />
      <CopyField label="嵌入方式二：iframe" value={iframe} rows={3} hint="适用于不允许插入脚本的平台（论坛、部分博客）。" />
    </Modal>
  );
}
