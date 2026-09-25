<script lang="ts">
  import { ATTRIBUTES, RACES, TYPE, isMonster, isLink, levelLabel, statLabel, typeLabel, attributeLabel, raceLabel } from '../lib/card';
  import { defaultQuery, search, type SearchQuery, type SortKey } from '../lib/search';
  import CardImage from '../components/CardImage.svelte';
  import { addCard, app, currentBanlist, db, limitOf, removeAt } from './state.svelte';
  import { DRAG_TYPE, readDrag, writeDrag } from './drag';

  let q = $state<SearchQuery>(defaultQuery());
  let text = $state('');
  let showFilters = $state(false);
  let setnameInput = $state('');
  let pageSize = $state(60);
  let dropping = $state(false);

  // 输入防抖
  $effect(() => {
    const t = text;
    const timer = setTimeout(() => (q.text = t), 150);
    return () => clearTimeout(timer);
  });

  const setnameList = $derived([...new Set(db.setnames.values())]);
  const setnameByName = $derived.by(() => {
    const m = new Map<string, number[]>();
    for (const [code, name] of db.setnames) m.set(name, [...(m.get(name) ?? []), code]);
    return m;
  });
  $effect(() => {
    q.setcodes = setnameByName.get(setnameInput.trim()) ?? [];
  });

  const results = $derived(search(db.cards, q, currentBanlist()));
  const shown = $derived(results.slice(0, pageSize));

  $effect(() => {
    // 条件变化时回到第一页
    JSON.stringify(q);
    pageSize = 60;
  });

  const SUBTYPES: Record<string, [number, string][]> = {
    all: [],
    monster: [
      [TYPE.NORMAL, '通常'],
      [TYPE.EFFECT, '效果'],
      [TYPE.RITUAL, '仪式'],
      [TYPE.FUSION, '融合'],
      [TYPE.SYNCHRO, '同调'],
      [TYPE.XYZ, '超量'],
      [TYPE.LINK, '连接'],
      [TYPE.PENDULUM, '灵摆'],
      [TYPE.TUNER, '调整'],
      [TYPE.FLIP, '反转'],
      [TYPE.SPIRIT, '灵魂'],
      [TYPE.UNION, '同盟'],
      [TYPE.GEMINI, '二重'],
      [TYPE.TOON, '卡通'],
      [TYPE.SPSUMMON, '特殊召唤'],
    ],
    spell: [
      [TYPE.QUICKPLAY, '速攻'],
      [TYPE.CONTINUOUS, '永续'],
      [TYPE.EQUIP, '装备'],
      [TYPE.FIELD, '场地'],
      [TYPE.RITUAL, '仪式'],
    ],
    trap: [
      [TYPE.CONTINUOUS, '永续'],
      [TYPE.COUNTER, '反击'],
    ],
  };

  function setKind(k: SearchQuery['kind']) {
    q.kind = k;
    q.subtype = 0;
  }

  function reset() {
    q = defaultQuery();
    text = '';
    setnameInput = '';
  }

  const numInput = (v: string) => (v.trim() === '' ? null : Number(v));

  let sentinel = $state<HTMLElement>();
  $effect(() => {
    if (!sentinel) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && pageSize < results.length) pageSize += 60;
    });
    io.observe(sentinel);
    return () => io.disconnect();
  });

  // 从卡组拖回搜索栏 = 移出卡组
  function ondrop(e: DragEvent) {
    dropping = false;
    const d = readDrag(e);
    if (d && d.from !== 'search') {
      e.preventDefault();
      removeAt(d.from, d.index);
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="search-panel"
  class:dropping
  ondragover={(e) => {
    if (e.dataTransfer?.types.includes(DRAG_TYPE)) {
      e.preventDefault();
      dropping = true;
    }
  }}
  ondragleave={() => (dropping = false)}
  {ondrop}
>
  <div class="bar">
    <input class="input search" type="search" placeholder="搜索卡名 / 效果 / 卡号，空格分隔多个关键词" bind:value={text} />
  </div>
  <div class="bar kinds">
    {#each [['all', '全部'], ['monster', '怪兽'], ['spell', '魔法'], ['trap', '陷阱']] as [k, label] (k)}
      <button class="seg" class:on={q.kind === k} onclick={() => setKind(k as SearchQuery['kind'])}>{label}</button>
    {/each}
    <button class="btn small" class:on={showFilters} onclick={() => (showFilters = !showFilters)}>筛选{showFilters ? ' ▴' : ' ▾'}</button>
  </div>

  {#if showFilters}
    <div class="filters">
      {#if SUBTYPES[q.kind].length}
        <label>类型
          <select class="input" bind:value={q.subtype}>
            <option value={0}>不限</option>
            {#each SUBTYPES[q.kind] as [bit, label] (bit)}<option value={bit}>{label}</option>{/each}
          </select>
        </label>
      {/if}
      <label>属性
        <select class="input" bind:value={q.attribute}>
          <option value={0}>不限</option>
          {#each ATTRIBUTES as [bit, label] (bit)}<option value={bit}>{label}</option>{/each}
        </select>
      </label>
      <label>种族
        <select class="input" bind:value={q.race}>
          <option value={0}>不限</option>
          {#each RACES as [bit, label] (bit)}<option value={bit}>{label}族</option>{/each}
        </select>
      </label>
      <label>字段
        <input class="input" list="setnames" placeholder="输入系列名" bind:value={setnameInput} />
        <datalist id="setnames">
          {#each setnameList as name (name)}<option value={name}></option>{/each}
        </datalist>
      </label>
      <label>等级/阶级/连接
        <span class="range">
          <input class="input" type="number" min="0" max="13" placeholder="最小" value={q.levelMin ?? ''} oninput={(e) => (q.levelMin = numInput(e.currentTarget.value))} />
          <input class="input" type="number" min="0" max="13" placeholder="最大" value={q.levelMax ?? ''} oninput={(e) => (q.levelMax = numInput(e.currentTarget.value))} />
        </span>
      </label>
      <label>攻击力
        <span class="range">
          <input class="input" type="number" step="100" placeholder="最小" value={q.atkMin ?? ''} oninput={(e) => (q.atkMin = numInput(e.currentTarget.value))} />
          <input class="input" type="number" step="100" placeholder="最大" value={q.atkMax ?? ''} oninput={(e) => (q.atkMax = numInput(e.currentTarget.value))} />
        </span>
      </label>
      <label>守备力
        <span class="range">
          <input class="input" type="number" step="100" placeholder="最小" value={q.defMin ?? ''} oninput={(e) => (q.defMin = numInput(e.currentTarget.value))} />
          <input class="input" type="number" step="100" placeholder="最大" value={q.defMax ?? ''} oninput={(e) => (q.defMax = numInput(e.currentTarget.value))} />
        </span>
      </label>
      <label>禁限
        <select class="input" bind:value={q.limit}>
          <option value={-1}>不限</option>
          <option value={0}>禁止</option>
          <option value={1}>限制</option>
          <option value={2}>准限制</option>
        </select>
      </label>
      <label>地区
        <select class="input" bind:value={q.ot}>
          <option value={0}>不限</option>
          <option value={1}>OCG</option>
          <option value={2}>TCG</option>
          <option value={8}>简中</option>
        </select>
      </label>
      <label>排序
        <select class="input" bind:value={q.sort}>
          {#each [['relevance', '相关度'], ['id', '卡号'], ['name', '名称'], ['level', '等级'], ['atk', '攻击力'], ['def', '守备力']] as [k, label] (k)}
            <option value={k as SortKey}>{label}</option>
          {/each}
        </select>
      </label>
      <label class="check"><input type="checkbox" bind:checked={q.altArt} /> 显示异画卡</label>
      <button class="btn small" onclick={reset}>重置条件</button>
    </div>
  {/if}

  <div class="count muted">
    {#if app.loading}加载卡片数据…{:else}共 {results.length} 张{/if}
    <span class="hint">单击查看 · 双击或 + 加入卡组 · 可拖动</span>
  </div>

  <ul class="results">
    {#each shown as card (card.id)}
      {@const limit = limitOf(card)}
      <li
        class:selected={app.selected === card.id}
        draggable="true"
        ondragstart={(e) => writeDrag(e, { from: 'search', index: -1, id: card.id })}
      >
        <button class="row" onclick={() => (app.selected = card.id)} ondblclick={() => addCard(card.id)}>
          <span class="thumb"><CardImage id={card.id} {card} {limit} /></span>
          <span class="info">
            <span class="name">{card.name}</span>
            <span class="line">{typeLabel(card)}{#if isMonster(card)} · {attributeLabel(card)} · {raceLabel(card)}{/if}</span>
            {#if isMonster(card)}
              <span class="line">{levelLabel(card)} · {statLabel(card.atk)}{isLink(card) ? '' : ` / ${statLabel(card.def)}`}</span>
            {/if}
          </span>
        </button>
        <span class="add">
          <button class="btn small" title="加入主卡组 / 额外卡组" onclick={() => addCard(card.id)}>+</button>
          <button class="btn small" title="加入副卡组" onclick={() => addCard(card.id, 'side')}>副</button>
        </span>
      </li>
    {/each}
    <li class="sentinel" bind:this={sentinel}></li>
  </ul>
</div>

<style>
  .search-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    height: 100%;
  }
  .search-panel.dropping {
    outline: 2px dashed var(--danger);
    outline-offset: -2px;
  }
  .bar {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .search {
    flex: 1;
    padding: 8px 10px;
  }
  .kinds .seg {
    flex: 1;
    padding: 4px 0;
    border: 1px solid var(--border);
    background: var(--panel);
    border-radius: 6px;
    cursor: pointer;
  }
  .kinds .seg.on {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-contrast);
  }
  .filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 10px;
    padding: 10px;
    background: var(--panel-2);
    border-radius: var(--radius);
    font-size: 0.82rem;
  }
  .filters label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .filters label.check {
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }
  .range {
    display: flex;
    gap: 4px;
  }
  .range .input {
    width: 50%;
  }
  .count {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.8rem;
  }
  .results {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
  .results li {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border);
  }
  .results li.selected {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  .row {
    flex: 1;
    display: flex;
    gap: 8px;
    padding: 5px 4px;
    border: 0;
    background: none;
    text-align: left;
    cursor: pointer;
    min-width: 0;
  }
  .thumb {
    width: 44px;
    flex: none;
  }
  .info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .line {
    font-size: 0.78rem;
    color: var(--muted);
  }
  .add {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-right: 4px;
  }
  .sentinel {
    height: 1px;
    border: 0 !important;
  }
  @media (max-width: 480px) {
    .hint {
      display: none;
    }
    .filters {
      grid-template-columns: 1fr;
    }
  }
</style>
