/** iframe 嵌入页：embed.html#deck=ydke://...&name=... */
import { createRoot } from 'react-dom/client';
import '../lib/theme.css';
import '../components/components.css';
import '../app/app.css';
import DeckView from '../components/DeckView';
import { deckFromParams } from '../lib/deck';
import { siteBase } from '../lib/util';

const params = new URLSearchParams(location.hash.replace(/^#\/?/, '').replace(/^[^?=&]*\?/, ''));
const deck = deckFromParams(params);
const target = document.getElementById('app')!;
const theme = params.get('theme');
if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);

if (deck) {
  createRoot(target).render(<DeckView deck={deck} builderUrl={siteBase()} compact={params.has('compact')} />);
} else {
  target.textContent = '链接中没有卡组数据';
}

// 把内容高度告诉父页面，方便自适应高度
const post = () => parent.postMessage({ type: 'ygo-deck:height', height: document.documentElement.scrollHeight }, '*');
new ResizeObserver(post).observe(document.body);
