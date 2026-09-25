<script lang="ts">
  import { ZONES, deckSize, emptyDeck, toYdk, toYdke, validateDeck } from '../lib/deck';
  import { saveDeck } from '../lib/storage';
  import { copyText, downloadText } from '../lib/util';
  import DeckZone from './DeckZone.svelte';
  import DecksDialog from './DecksDialog.svelte';
  import DrawDialog from './DrawDialog.svelte';
  import ImportDialog from './ImportDialog.svelte';
  import ShareDialog from './ShareDialog.svelte';
  import { app, currentBanlist, db, lookup, markSaved, renameDeck, setBanlist, setDeck, sortDeck, toast } from './state.svelte';

  let dialog = $state<'' | 'share' | 'import' | 'decks' | 'draw'>('');
  let showIssues = $state(false);

  const issues = $derived(app.loading ? [] : validateDeck(app.deck, lookup, currentBanlist()));
  const errors = $derived(issues.filter((i) => i.level === 'error').length);

  function save() {
    const saved = saveDeck($state.snapshot(app.deck), app.savedId);
    markSaved(saved.id);
    toast('已保存到本浏览器');
  }

  function newDeck() {
    if (deckSize(app.deck) && !confirm('新建卡组会清空当前编辑内容（已保存的卡组不受影响），继续？')) return;
    setDeck(emptyDeck());
  }

  function clearDeck() {
    if (deckSize(app.deck) && confirm('清空当前卡组中的所有卡片？')) setDeck({ ...emptyDeck(app.deck.name) }, app.savedId);
  }

  async function copyCode() {
    toast((await copyText(toYdke(app.deck))) ? '卡组码已复制' : '复制失败');
  }
</script>

<div class="editor">
  <div class="head">
    <input class="input name" placeholder="卡组名称" value={app.deck.name} oninput={(e) => renameDeck(e.currentTarget.value)} />
    <label class="banlist">
      <span class="muted">禁卡表</span>
      <select class="input" value={app.banlistName} onchange={(e) => setBanlist(e.currentTarget.value)}>
        <option value="">无限制</option>
        {#each db.banlists as b (b.name)}<option value={b.name}>{b.name}</option>{/each}
      </select>
    </label>
  </div>

  <div class="toolbar">
    <button class="btn" onclick={newDeck}>新建</button>
    <button class="btn primary" onclick={save}>保存</button>
    <button class="btn" onclick={() => (dialog = 'decks')}>我的卡组</button>
    <button class="btn" onclick={() => (dialog = 'import')}>导入</button>
    <button class="btn" onclick={() => downloadText(`${app.deck.name || 'deck'}.ydk`, toYdk(app.deck))} disabled={!deckSize(app.deck)}>导出 YDK</button>
    <button class="btn" onclick={copyCode} disabled={!deckSize(app.deck)}>复制卡组码</button>
    <button class="btn primary" onclick={() => (dialog = 'share')} disabled={!deckSize(app.deck)}>分享 / 嵌入</button>
    <button class="btn" onclick={sortDeck}>排序</button>
    <button class="btn" onclick={() => (dialog = 'draw')} disabled={!app.deck.main.length}>试抽</button>
    <button class="btn danger" onclick={clearDeck}>清空</button>
  </div>

  {#if issues.length}
    <div class="issues" class:has-error={errors}>
      <button class="summary" onclick={() => (showIssues = !showIssues)}>
        {errors ? `✗ ${errors} 个问题` : '⚠ 提示'}：{issues[0].message}{issues.length > 1 ? ` 等 ${issues.length} 项` : ''}
        <span>{showIssues ? '▴' : '▾'}</span>
      </button>
      {#if showIssues}
        <ul>
          {#each issues as i, n (n)}<li class={i.level}>{i.message}</li>{/each}
        </ul>
      {/if}
    </div>
  {:else if deckSize(app.deck)}
    <div class="issues ok">✓ 卡组符合规则</div>
  {/if}

  {#each ZONES as zone (zone)}
    <DeckZone {zone} />
  {/each}
</div>

{#if dialog === 'share'}<ShareDialog onclose={() => (dialog = '')} />{/if}
{#if dialog === 'import'}<ImportDialog onclose={() => (dialog = '')} />{/if}
{#if dialog === 'decks'}<DecksDialog onclose={() => (dialog = '')} />{/if}
{#if dialog === 'draw'}<DrawDialog onclose={() => (dialog = '')} />{/if}

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .head {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .name {
    flex: 1 1 200px;
    font-size: 1rem;
    font-weight: 600;
  }
  .banlist {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .issues {
    font-size: 0.85rem;
    border-radius: 6px;
    padding: 4px 10px;
    background: color-mix(in srgb, var(--warn) 12%, transparent);
    color: var(--warn);
  }
  .issues.has-error {
    background: color-mix(in srgb, var(--danger) 12%, transparent);
    color: var(--danger);
  }
  .issues.ok {
    background: color-mix(in srgb, var(--ok) 12%, transparent);
    color: var(--ok);
  }
  .summary {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 8px;
    border: 0;
    background: none;
    color: inherit;
    padding: 0;
    cursor: pointer;
    text-align: left;
  }
  ul {
    margin: 4px 0 2px;
    padding-left: 18px;
  }
  li.warn {
    color: var(--warn);
  }
</style>
