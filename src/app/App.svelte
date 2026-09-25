<script lang="ts">
  import DeckView from '../components/DeckView.svelte';
  import { deckFromParams, deckSize, type Deck } from '../lib/deck';
  import { siteBase } from '../lib/util';
  import Builder from './Builder.svelte';
  import { app, db, init, setDeck } from './state.svelte';

  type Route = { page: 'builder' } | { page: 'view'; deck: Deck };

  function parseHash(): Route {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, query = ''] = h.split('?');
    const deck = deckFromParams(new URLSearchParams(query));
    if (path === 'view' && deck) return { page: 'view', deck };
    if (deck) {
      // 编辑链接：把链接里的卡组载入组卡器
      if (!deckSize(app.deck) || confirm(`打开链接中的卡组「${deck.name || '未命名'}」？当前编辑中的卡组会被替换（已保存的不受影响）。`)) {
        setDeck(deck);
      }
      history.replaceState(null, '', location.pathname + location.search);
    }
    return { page: 'builder' };
  }

  let route = $state<Route>(parseHash());
  let builderStarted = false;
  $effect(() => {
    if (route.page === 'builder' && !builderStarted) {
      builderStarted = true;
      init();
    }
  });

  // 主题：auto / light / dark
  const THEME_KEY = 'ygo-card-engine:theme';
  let theme = $state<string>((() => {
    try {
      return localStorage.getItem(THEME_KEY) ?? 'auto';
    } catch {
      return 'auto';
    }
  })());
  $effect(() => {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* 忽略 */
    }
  });
  const THEMES: Record<string, [string, string]> = { auto: ['light', '☀'], light: ['dark', '☾'], dark: ['auto', '◐'] };
</script>

<svelte:window onhashchange={() => (route = parseHash())} />

<header class="top">
  <a class="logo" href="#/">YGO 组卡器</a>
  {#if route.page === 'builder' && db.meta}
    <span class="meta muted">{db.meta.cardCount} 张卡 · 数据 {db.meta.builtAt.slice(0, 10)}</span>
  {/if}
  <span class="spacer"></span>
  {#if route.page === 'view'}
    <a class="btn small" href="#/">打开组卡器</a>
  {/if}
  <button class="btn small" title="切换主题（自动 / 浅色 / 深色）" onclick={() => (theme = THEMES[theme][0])}>{THEMES[theme][1]}</button>
</header>

{#if route.page === 'view'}
  <div class="view-page">
    <DeckView deck={route.deck} builderUrl={siteBase()} />
  </div>
{:else if app.error}
  <p class="load-error">卡片数据加载失败：{app.error}</p>
{:else}
  <Builder />
{/if}

{#if app.toast}<div class="toast">{app.toast}</div>{/if}

<style>
  .top {
    height: 52px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
  }
  .logo {
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--text);
    text-decoration: none;
  }
  .meta {
    font-size: 0.8rem;
  }
  .spacer {
    flex: 1;
  }
  .view-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 16px;
  }
  .load-error {
    padding: 24px;
    color: var(--danger);
  }
  .toast {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    background: var(--text);
    color: var(--panel);
    padding: 8px 16px;
    border-radius: 6px;
    z-index: 2000;
    box-shadow: var(--shadow);
  }
  @media (max-width: 480px) {
    .meta {
      display: none;
    }
  }
</style>
