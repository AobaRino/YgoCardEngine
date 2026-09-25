<script lang="ts">
  import Modal from '../components/Modal.svelte';
  import CardImage from '../components/CardImage.svelte';
  import CardZoom from '../components/CardZoom.svelte';
  import { shuffle } from '../lib/util';
  import { app, db, limitOf, lookup } from './state.svelte';

  let { onclose }: { onclose: () => void } = $props();
  let second = $state(false);
  let pile = $state<number[]>([]);
  let hand = $state<number[]>([]);
  let zoom = $state<number | null>(null);

  function deal() {
    pile = shuffle(app.deck.main);
    hand = pile.splice(0, second ? 6 : 5);
  }
  function drawOne() {
    const c = pile.shift();
    if (c !== undefined) hand.push(c);
  }
  deal();
</script>

<Modal title="试抽起手" {onclose} wide>
  <div class="bar">
    <label><input type="checkbox" bind:checked={second} onchange={deal} /> 后攻（6 张）</label>
    <button class="btn primary" onclick={deal} disabled={!app.deck.main.length}>重新洗切</button>
    <button class="btn" onclick={drawOne} disabled={!pile.length}>再抽一张</button>
    <span class="muted">卡组剩余 {pile.length}</span>
  </div>
  {#if hand.length}
    <div class="hand">
      {#each hand as id, i (i)}
        <button class="cell" onclick={() => (zoom = i)}><CardImage {id} card={lookup(id)} lazy={false} /></button>
      {/each}
    </div>
  {:else}
    <p class="muted">主卡组是空的。</p>
  {/if}
</Modal>

{#if zoom !== null}
  <CardZoom ids={hand} bind:index={zoom} {lookup} setnames={db.setnames} {limitOf} onclose={() => (zoom = null)} />
{/if}

<style>
  .bar {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .hand {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
  }
  .cell {
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
  }
</style>
