import { lazy, Suspense, useEffect, useState } from 'react';
import DeckView from '../components/DeckView';
import { deckFromParams, deckSize, type Deck } from '../lib/deck';
import { siteBase } from '../lib/util';
import Builder from './Builder';
import { setDeck, useStore } from './store';

const ImageDialog = lazy(() => import('./ImageDialog'));

type Route = { page: 'builder'; open?: Deck } | { page: 'view'; deck: Deck };

/** hash 路由：#/view?deck=… 只读分享页；#/?deck=… 在组卡器中打开 */
function parseHash(): Route {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = h.split('?');
  const deck = deckFromParams(new URLSearchParams(query));
  if (path === 'view' && deck) return { page: 'view', deck };
  return { page: 'builder', open: deck ?? undefined };
}

/** 编辑链接：把链接里的卡组载入组卡器（同一个链接只处理一次） */
let handledHash = '';
function openDeckLink(deck: Deck) {
  if (handledHash === location.hash) return;
  handledHash = location.hash;
  const current = useStore.getState().deck;
  if (!deckSize(current) || confirm(`打开链接中的卡组「${deck.name || '未命名'}」？当前编辑中的卡组会被替换（已保存的不受影响）。`)) {
    setDeck(deck);
  }
  history.replaceState(null, '', location.pathname + location.search);
}

const THEME_KEY = 'ygo-deck:theme';
const THEMES: Record<string, [next: string, icon: string]> = { auto: ['light', '◐'], light: ['dark', '☀'], dark: ['auto', '☾'] };

function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY) ?? 'auto';
  } catch {
    return 'auto';
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [theme, setTheme] = useState(readTheme);
  const [imageOpen, setImageOpen] = useState(false);
  const meta = useStore((s) => s.meta);
  const error = useStore((s) => s.error);
  const toast = useStore((s) => s.toast);

  useEffect(() => {
    if (route.page === 'builder' && route.open) openDeckLink(route.open);
  }, [route]);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* 存储不可用时忽略 */
    }
  }, [theme]);

  return (
    <>
      <header className="top">
        <a className="logo" href="#/">
          YGO 组卡器
        </a>
        {route.page === 'builder' && meta && (
          <span className="meta muted">
            {meta.cardCount} 张卡 · 数据 {meta.builtAt.slice(0, 10)}
          </span>
        )}
        <span className="spacer" />
        {route.page === 'view' && (
          <a className="btn small" href="#/">
            打开组卡器
          </a>
        )}
        <button className="btn small" title="切换主题（自动 / 浅色 / 深色）" onClick={() => setTheme(THEMES[theme][0])}>
          {THEMES[theme][1]}
        </button>
      </header>

      {route.page === 'view' ? (
        <div className="view-page">
          <DeckView deck={route.deck} builderUrl={siteBase()} onExportImage={() => setImageOpen(true)} />
          {imageOpen && (
            <Suspense>
              <ImageDialog deck={route.deck} onClose={() => setImageOpen(false)} />
            </Suspense>
          )}
        </div>
      ) : error ? (
        <p className="load-error">卡片数据加载失败：{error}</p>
      ) : (
        <Builder />
      )}

      {toast && <div className="ygo-toast">{toast}</div>}
    </>
  );
}
