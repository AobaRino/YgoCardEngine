<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Card } from '../lib/card';
  import CardImage from './CardImage.svelte';
  import CardText from './CardText.svelte';

  interface Props {
    /** 可左右翻页的卡片序列 */
    ids: number[];
    index: number;
    lookup: (id: number) => Card | undefined;
    limitOf?: (card: Card) => number | undefined;
    setnames?: Map<number, string>;
    onclose: () => void;
    actions?: Snippet<[Card]>;
  }
  let { ids, index = $bindable(), lookup, limitOf, setnames, onclose, actions }: Props = $props();

  const id = $derived(ids[index]);
  const card = $derived(lookup(id));
  let big = $state(false);
  let dialog: HTMLDivElement;

  function go(delta: number) {
    if (!ids.length) return;
    index = (index + delta + ids.length) % ids.length;
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else return;
    e.preventDefault();
    e.stopPropagation();
  }

  let touchX = 0;
  const ontouchstart = (e: TouchEvent) => (touchX = e.touches[0].clientX);
  function ontouchend(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50 && !big) go(dx < 0 ? 1 : -1);
  }

  $effect(() => {
    dialog?.focus();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={onclose}>
  <div
    class="zoom"
    class:big
    role="dialog"
    aria-modal="true"
    aria-label={card?.name ?? '卡片详情'}
    tabindex="-1"
    bind:this={dialog}
    onclick={(e) => e.stopPropagation()}
    {onkeydown}
    {ontouchstart}
    {ontouchend}
  >
    <button class="close" onclick={onclose} aria-label="关闭">✕</button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="image" onclick={() => (big = !big)} title={big ? '点击缩小' : '点击放大'}>
      {#key id}
        <CardImage {id} {card} lazy={false} />
      {/key}
    </div>
    {#if !big}
      <div class="info">
        {#if card}
          <CardText {card} {setnames} limit={limitOf?.(card)} />
          {#if actions}
            <div class="actions">{@render actions(card)}</div>
          {/if}
        {:else}
          <p>卡号 {id} 不在数据库中</p>
        {/if}
      </div>
    {/if}
    {#if ids.length > 1}
      <button class="nav prev" onclick={() => go(-1)} aria-label="上一张">‹</button>
      <button class="nav next" onclick={() => go(1)} aria-label="下一张">›</button>
      <span class="pos">{index + 1} / {ids.length}</span>
    {/if}
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 2147483000;
    background: rgb(0 0 0 / 0.72);
    display: grid;
    place-items: center;
    padding: 16px;
    box-sizing: border-box;
  }
  .zoom {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, min(420px, 42vw)) minmax(0, 420px);
    gap: 20px;
    max-width: 100%;
    max-height: calc(100vh - 32px);
    padding: 20px 20px 36px;
    box-sizing: border-box;
    background: var(--panel);
    color: var(--text);
    border-radius: 12px;
    box-shadow: var(--shadow);
    outline: none;
    overflow: auto;
  }
  .zoom.big {
    grid-template-columns: minmax(0, min(620px, calc((100vh - 100px) * 59 / 86)));
  }
  .image {
    cursor: zoom-in;
    align-self: start;
  }
  .big .image {
    cursor: zoom-out;
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    overflow: auto;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  button {
    font: inherit;
    cursor: pointer;
  }
  .close {
    position: absolute;
    top: 6px;
    right: 8px;
    border: 0;
    background: none;
    color: var(--muted);
    font-size: 18px;
    z-index: 1;
  }
  .nav {
    position: absolute;
    bottom: 6px;
    width: 32px;
    height: 26px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--panel-2);
    color: var(--text);
    font-size: 18px;
    line-height: 1;
  }
  .prev { left: 20px; }
  .next { left: 58px; }
  .pos {
    position: absolute;
    bottom: 10px;
    right: 20px;
    font-size: 0.8rem;
    color: var(--muted);
  }
  @media (max-width: 640px) {
    .zoom,
    .zoom.big {
      grid-template-columns: minmax(0, 1fr);
      width: 100%;
    }
    .image {
      width: min(72vw, 320px);
      justify-self: center;
    }
    .big .image {
      width: 100%;
    }
  }
</style>
