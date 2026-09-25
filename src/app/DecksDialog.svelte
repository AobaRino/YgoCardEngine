<script lang="ts">
  import Modal from '../components/Modal.svelte';
  import { deleteDeck, listDecks } from '../lib/storage';
  import { app, setDeck } from './state.svelte';

  let { onclose }: { onclose: () => void } = $props();
  let decks = $state(listDecks());

  function remove(id: string, name: string) {
    if (!confirm(`删除卡组「${name || '未命名'}」？`)) return;
    deleteDeck(id);
    decks = listDecks();
    if (app.savedId === id) app.savedId = undefined;
  }
</script>

<Modal title="我的卡组（保存在本浏览器）" {onclose}>
  {#if !decks.length}
    <p class="muted">还没有保存的卡组。编辑卡组后点击「保存」即可。</p>
  {/if}
  <ul>
    {#each decks as d (d.id)}
      <li class:current={d.id === app.savedId}>
        <button
          class="open"
          onclick={() => {
            setDeck(d, d.id);
            onclose();
          }}
        >
          <strong>{d.name || '未命名卡组'}</strong>
          <span class="muted">主 {d.main.length} · 额外 {d.extra.length} · 副 {d.side.length} · {new Date(d.updatedAt).toLocaleString()}</span>
        </button>
        <button class="btn small danger" onclick={() => remove(d.id, d.name)}>删除</button>
      </li>
    {/each}
  </ul>
  <p class="muted small">提示：本地保存只在当前浏览器有效，换设备请用分享链接或 YDK 文件。</p>
</Modal>

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--border);
  }
  li.current {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }
  .open {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 4px;
    border: 0;
    background: none;
    cursor: pointer;
    text-align: left;
  }
  .open span {
    font-size: 0.8rem;
  }
  .small {
    font-size: 0.8rem;
    margin: 0;
  }
</style>
