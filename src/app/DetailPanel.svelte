<script lang="ts">
  import CardImage from '../components/CardImage.svelte';
  import CardText from '../components/CardText.svelte';
  import CardZoom from '../components/CardZoom.svelte';
  import { countCopies, defaultZone } from '../lib/deck';
  import { addCard, app, db, limitOf, lookup, removeOne } from './state.svelte';

  const id = $derived(app.selected);
  const card = $derived(id !== null ? lookup(id) : undefined);
  const inDeck = $derived(card ? countCopies(app.deck, card, lookup) : 0);
  let zoom = $state(false);
</script>

{#if card && id !== null}
  <div class="detail">
    <button class="close" onclick={() => (app.selected = null)} aria-label="关闭">✕</button>
    <button class="image" onclick={() => (zoom = true)} title="点击放大">
      <CardImage {id} {card} lazy={false} />
    </button>
    <div class="actions">
      <button class="btn primary" onclick={() => addCard(id)}>+ {defaultZone(card) === 'extra' ? '额外' : '主卡组'}</button>
      <button class="btn" onclick={() => addCard(id, 'side')}>+ 副卡组</button>
      <button class="btn danger" disabled={!inDeck} onclick={() => removeOne(id)}>− 移除</button>
      <span class="muted">卡组中 {inDeck}/{limitOf(card)}</span>
    </div>
    <CardText {card} setnames={db.setnames} limit={limitOf(card)} />
  </div>
{:else}
  <div class="detail placeholder muted">
    <p>点击任意卡片查看详情</p>
    <p>点击大图可放大查看，←/→ 翻页</p>
  </div>
{/if}

{#if zoom && id !== null}
  <CardZoom ids={[id]} index={0} {lookup} setnames={db.setnames} {limitOf} onclose={() => (zoom = false)} />
{/if}

<style>
  .detail {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .close {
    display: none;
    position: absolute;
    top: -4px;
    right: 0;
    border: 0;
    background: none;
    color: var(--muted);
    font-size: 18px;
    cursor: pointer;
  }
  .image {
    width: min(100%, 260px);
    align-self: center;
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .actions .muted {
    font-size: 0.8rem;
  }
  .placeholder {
    text-align: center;
    padding-top: 40px;
    font-size: 0.85rem;
  }
  /* 窄屏：详情作为底部抽屉显示 */
  @media (max-width: 1099px) {
    .close {
      display: block;
    }
    .detail {
      display: grid;
      grid-template-columns: 110px 1fr;
      grid-template-areas: 'img actions' 'img text';
      align-items: start;
      column-gap: 12px;
    }
    .image {
      grid-area: img;
      width: 110px;
    }
    .actions {
      grid-area: actions;
      padding-right: 24px;
    }
    .detail :global(.card-text) {
      grid-area: text;
    }
    .placeholder {
      display: none;
    }
  }
</style>
