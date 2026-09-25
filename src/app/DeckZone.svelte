<script lang="ts">
  import { ZONE_LABELS, LIMITS, type Zone } from '../lib/deck';
  import { isMonster, isSpell, isTrap } from '../lib/card';
  import CardImage from '../components/CardImage.svelte';
  import { addCard, app, limitOf, lookup, moveCard, removeAt } from './state.svelte';
  import { DRAG_TYPE, readDrag, writeDrag } from './drag';

  interface Props {
    zone: Zone;
  }
  let { zone }: Props = $props();

  const ids = $derived(app.deck[zone]);
  const max = $derived(zone === 'main' ? LIMITS.mainMax : zone === 'extra' ? LIMITS.extraMax : LIMITS.sideMax);
  const over = $derived(ids.length > max || (zone === 'main' && ids.length < LIMITS.mainMin));

  const stats = $derived.by(() => {
    const s = { m: 0, s: 0, t: 0 };
    for (const id of ids) {
      const c = lookup(id);
      if (!c) continue;
      if (isMonster(c)) s.m++;
      else if (isSpell(c)) s.s++;
      else if (isTrap(c)) s.t++;
    }
    return s;
  });

  let dropping = $state(false);
  let dropIndex = $state<number | null>(null);

  function ondragover(e: DragEvent, index: number | null) {
    if (!e.dataTransfer?.types.includes(DRAG_TYPE)) return;
    e.preventDefault();
    e.stopPropagation();
    dropping = true;
    dropIndex = index;
  }

  function ondrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const d = readDrag(e);
    const at = dropIndex ?? undefined;
    dropping = false;
    dropIndex = null;
    if (!d) return;
    if (d.from === 'search') {
      if (addCard(d.id, zone) && at !== undefined && zone !== 'extra') {
        // 放到指定位置
        const arr = app.deck[zone === 'side' ? 'side' : 'main'];
        const last = arr.length - 1;
        if (arr[last] === d.id) moveCard(zone, last, zone, at);
      }
    } else {
      moveCard(d.from, d.index, zone, at);
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
  class="zone"
  class:dropping
  data-zone={zone}
  ondragover={(e) => ondragover(e, null)}
  ondragleave={(e) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      dropping = false;
      dropIndex = null;
    }
  }}
  {ondrop}
>
  <h3>
    {ZONE_LABELS[zone]}
    <span class:bad={over}>{ids.length}</span>
    {#if zone !== 'extra' && ids.length}
      <small class="muted">怪兽 {stats.m} · 魔法 {stats.s} · 陷阱 {stats.t}</small>
    {/if}
  </h3>
  <div class="grid">
    {#each ids as id, i (i + ':' + id)}
      {@const card = lookup(id)}
      <button
        class="cell"
        class:selected={app.selected === id}
        class:insert={dropIndex === i}
        draggable="true"
        title="{card?.name ?? id}（双击或右键移除）"
        ondragstart={(e) => writeDrag(e, { from: zone, index: i, id })}
        ondragover={(e) => ondragover(e, i)}
        onclick={() => (app.selected = id)}
        ondblclick={() => removeAt(zone, i)}
        oncontextmenu={(e) => {
          e.preventDefault();
          removeAt(zone, i);
        }}
      >
        <CardImage {id} {card} limit={card ? limitOf(card) : undefined} />
      </button>
    {/each}
    {#if !ids.length}
      <p class="empty muted">{zone === 'side' ? '把卡拖到这里，或在卡片详情里点「加入副卡组」' : '在搜索结果中双击、点 + 或把卡片拖到这里'}</p>
    {/if}
  </div>
</section>

<style>
  .zone {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 10px 10px;
  }
  .zone.dropping {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent);
  }
  h3 {
    margin: 0 0 6px;
    font-size: 0.92rem;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  h3 span {
    color: var(--ok);
  }
  h3 span.bad {
    color: var(--warn);
  }
  small {
    font-weight: 400;
    font-size: 0.78rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--deck-cell, 64px), 1fr));
    gap: 3px;
    min-height: 60px;
  }
  .cell {
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    position: relative;
    min-width: 0;
    transition: transform 0.1s;
  }
  .cell:hover {
    transform: translateY(-2px);
  }
  .cell.selected {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
    border-radius: 4px;
  }
  .cell.insert::before {
    content: '';
    position: absolute;
    left: -3px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
    border-radius: 2px;
  }
  .empty {
    grid-column: 1 / -1;
    margin: 0;
    padding: 16px 0;
    text-align: center;
    font-size: 0.85rem;
  }
</style>
