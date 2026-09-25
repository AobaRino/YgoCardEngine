<script lang="ts">
  import DeckEditor from './DeckEditor.svelte';
  import DetailPanel from './DetailPanel.svelte';
  import SearchPanel from './SearchPanel.svelte';
  import { app } from './state.svelte';

  let tab = $state<'deck' | 'search'>('deck');
</script>

<div class="tabs">
  <button class:on={tab === 'deck'} onclick={() => (tab = 'deck')}>卡组 ({app.deck.main.length}/{app.deck.extra.length}/{app.deck.side.length})</button>
  <button class:on={tab === 'search'} onclick={() => (tab = 'search')}>搜索卡片</button>
</div>

<main class="builder" data-tab={tab}>
  <section class="deck-col"><DeckEditor /></section>
  <aside class="detail-col" class:open={app.selected !== null}><DetailPanel /></aside>
  <section class="search-col"><SearchPanel /></section>
</main>

<style>
  .builder {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px 380px;
    gap: 12px;
    padding: 12px;
    height: calc(100vh - 52px);
    height: calc(100dvh - 52px);
  }
  .deck-col,
  .detail-col,
  .search-col {
    min-height: 0;
    overflow-y: auto;
  }
  .detail-col,
  .search-col {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
  }
  .search-col {
    overflow: hidden;
  }
  .tabs {
    display: none;
  }

  /* 中等宽度：详情改为底部抽屉 */
  @media (max-width: 1099px) {
    .builder {
      grid-template-columns: minmax(0, 1fr) 360px;
    }
    .detail-col {
      position: fixed;
      left: 12px;
      right: 12px;
      bottom: 12px;
      z-index: 50;
      max-height: 45vh;
      box-shadow: var(--shadow);
      display: none;
    }
    .detail-col.open {
      display: block;
    }
  }

  /* 手机：卡组 / 搜索切换 */
  @media (max-width: 719px) {
    .tabs {
      display: flex;
      position: sticky;
      top: 0;
      z-index: 40;
      background: var(--bg);
      padding: 8px 12px 0;
      gap: 6px;
    }
    .tabs button {
      flex: 1;
      padding: 6px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--panel);
      cursor: pointer;
    }
    .tabs button.on {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--accent-contrast);
    }
    .builder {
      grid-template-columns: minmax(0, 1fr);
      height: auto;
      padding: 8px 12px 12px;
    }
    .builder[data-tab='deck'] .search-col,
    .builder[data-tab='search'] .deck-col {
      display: none;
    }
    .search-col {
      height: calc(100dvh - 110px);
    }
    .builder :global(.grid) {
      --deck-cell: 52px;
    }
  }
</style>
