<script lang="ts">
  import { isMonster, isSpell, isTrap, type Card } from '../lib/card';
  import { loadBanlists, loadCards, loadSetnames, type Banlist } from '../lib/data';
  import { ZONES, ZONE_LABELS, allIds, copyLimit, deckToParams, toYdk, toYdke, type Deck } from '../lib/deck';
  import { copyText, downloadText } from '../lib/util';
  import CardImage from './CardImage.svelte';
  import CardZoom from './CardZoom.svelte';

  interface Props {
    deck: Deck;
    /** 组卡器地址，用于「在组卡器中打开」 */
    builderUrl?: string;
    compact?: boolean;
    showToolbar?: boolean;
  }
  let { deck, builderUrl, compact = false, showToolbar = true }: Props = $props();

  let cards = $state<Map<number, Card> | null>(null);
  let error = $state('');
  let banlist = $state<Banlist | null>(null);
  let setnames = $state<Map<number, string>>();
  let zoomIndex = $state<number | null>(null);
  let toast = $state('');

  $effect(() => {
    const ids = allIds(deck);
    error = '';
    loadCards(ids)
      .then((m) => (cards = new Map(m)))
      .catch((e) => (error = String(e.message ?? e)));
    loadBanlists()
      .then((l) => (banlist = l[0] ?? null))
      .catch(() => {});
    loadSetnames()
      .then((s) => (setnames = s))
      .catch(() => {});
  });

  const lookup = (id: number) => cards?.get(id);
  const flat = $derived(allIds(deck));
  const offsets = $derived({ main: 0, extra: deck.main.length, side: deck.main.length + deck.extra.length });

  const stats = $derived.by(() => {
    const s = { monster: 0, spell: 0, trap: 0 };
    for (const id of deck.main) {
      const c = lookup(id);
      if (!c) continue;
      if (isMonster(c)) s.monster++;
      else if (isSpell(c)) s.spell++;
      else if (isTrap(c)) s.trap++;
    }
    return s;
  });

  const openUrl = $derived(builderUrl ? `${builderUrl}#/?${deckToParams(deck)}` : '');

  function flash(msg: string) {
    toast = msg;
    setTimeout(() => (toast = ''), 1800);
  }

  async function copyCode() {
    flash((await copyText(toYdke(deck))) ? '卡组码已复制' : '复制失败');
  }
</script>

<div class="deck-view" class:compact>
  <header>
    <div class="title">
      <strong>{deck.name || '未命名卡组'}</strong>
      <span class="counts">
        主 {deck.main.length} · 额外 {deck.extra.length} · 副 {deck.side.length}
        {#if cards}
          <span class="mst">（怪兽 {stats.monster} / 魔法 {stats.spell} / 陷阱 {stats.trap}）</span>
        {/if}
      </span>
    </div>
    {#if showToolbar}
      <div class="toolbar">
        <button onclick={copyCode} title="复制 ydke:// 卡组码，可导入 YGOPro / EDOPro 等">复制卡组码</button>
        <button onclick={() => downloadText(`${deck.name || 'deck'}.ydk`, toYdk(deck))}>下载 YDK</button>
        {#if openUrl}
          <a href={openUrl} target="_blank" rel="noopener">在组卡器中打开</a>
        {/if}
      </div>
    {/if}
  </header>

  {#if error}
    <p class="error">卡片数据加载失败：{error}</p>
  {/if}

  {#each ZONES as zone (zone)}
    {#if deck[zone].length}
      <section>
        <h4>{ZONE_LABELS[zone]} <span>{deck[zone].length}</span></h4>
        <div class="grid">
          {#each deck[zone] as id, i (zone + i)}
            {@const card = lookup(id)}
            <button class="cell" onclick={() => (zoomIndex = offsets[zone] + i)} title={card?.name ?? String(id)}>
              <CardImage {id} {card} limit={card ? copyLimit(card, banlist) : undefined} />
            </button>
          {/each}
        </div>
      </section>
    {/if}
  {/each}

  {#if toast}<div class="toast">{toast}</div>{/if}
</div>

{#if zoomIndex !== null}
  <CardZoom
    ids={flat}
    bind:index={zoomIndex}
    {lookup}
    {setnames}
    limitOf={(c) => copyLimit(c, banlist)}
    onclose={() => (zoomIndex = null)}
  />
{/if}

<style>
  .deck-view {
    --cell: 76px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: var(--text);
    font-family: system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }
  .compact {
    --cell: 58px;
    gap: 8px;
  }
  header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 10px;
  }
  .title strong {
    font-size: 1.1rem;
  }
  .counts {
    color: var(--muted);
    font-size: 0.85rem;
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .toolbar button,
  .toolbar a {
    font: inherit;
    font-size: 0.85rem;
    padding: 4px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--panel);
    color: var(--text);
    cursor: pointer;
    text-decoration: none;
  }
  .toolbar button:hover,
  .toolbar a:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  h4 {
    margin: 0 0 6px;
    font-size: 0.9rem;
    font-weight: 600;
  }
  h4 span {
    color: var(--muted);
    font-weight: 400;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--cell), 1fr));
    gap: 4px;
  }
  .cell {
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
    transition: transform 0.12s;
    min-width: 0;
  }
  .cell:hover,
  .cell:focus-visible {
    transform: translateY(-3px) scale(1.04);
    z-index: 1;
    outline: none;
  }
  .error {
    color: var(--danger);
  }
  .toast {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    background: var(--text);
    color: var(--panel);
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.85rem;
    z-index: 2147483001;
  }
</style>
