<script lang="ts">
  import {
    LINK_MARKERS,
    attributeLabel,
    isLink,
    isMonster,
    isPendulum,
    levelLabel,
    otLabel,
    raceLabel,
    statLabel,
    typeLabel,
    type Card,
  } from '../lib/card';

  interface Props {
    card: Card;
    setnames?: Map<number, string>;
    /** 当前禁卡表中的数量限制 */
    limit?: number;
  }
  let { card, setnames, limit }: Props = $props();

  const archetypes = $derived(
    setnames ? card.setcodes.map((c) => setnames.get(c)).filter((n): n is string => !!n) : [],
  );
  const limitText = $derived(limit === 0 ? '禁止' : limit === 1 ? '限制' : limit === 2 ? '准限制' : '');
</script>

<div class="card-text">
  <h3>{card.name}</h3>
  <div class="tags">
    <span>{typeLabel(card)}</span>
    {#if isMonster(card)}
      <span>{attributeLabel(card)}</span>
      <span>{raceLabel(card)}族</span>
      <span>{levelLabel(card)}</span>
    {/if}
    {#if limitText}<span class="limit">{limitText}</span>{/if}
  </div>
  {#if isMonster(card)}
    <div class="stats">
      <span>ATK {statLabel(card.atk)}</span>
      {#if isLink(card)}
        <span class="markers" aria-label="连接箭头">
          {#each LINK_MARKERS as m, i (i)}
            <i class:on={m && card.def & m} class:center={!m}></i>
          {/each}
        </span>
      {:else}
        <span>DEF {statLabel(card.def)}</span>
      {/if}
      {#if isPendulum(card)}
        <span>刻度 {card.lscale}/{card.rscale}</span>
      {/if}
    </div>
  {/if}
  <p class="desc">{card.desc}</p>
  <div class="meta">
    <span>卡号 {card.id}</span>
    {#if card.alias}<span>同名 {card.alias}</span>{/if}
    <span>{otLabel(card.ot)}</span>
    {#if archetypes.length}<span>字段：{archetypes.join('、')}</span>{/if}
  </div>
</div>

<style>
  .card-text {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  h3 {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.3;
  }
  .tags,
  .stats,
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 10px;
    font-size: 0.85rem;
    align-items: center;
  }
  .tags span {
    background: var(--panel-2);
    border-radius: 4px;
    padding: 1px 6px;
  }
  .tags .limit {
    background: var(--danger);
    color: #fff;
  }
  .stats {
    font-weight: 600;
  }
  .desc {
    margin: 0;
    white-space: pre-wrap;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .meta {
    color: var(--muted);
    font-size: 0.78rem;
  }
  .markers {
    display: inline-grid;
    grid-template-columns: repeat(3, 7px);
    gap: 1px;
  }
  .markers i {
    width: 7px;
    height: 7px;
    background: var(--panel-2);
    border: 1px solid var(--border);
    box-sizing: border-box;
  }
  .markers i.on {
    background: var(--danger);
    border-color: var(--danger);
  }
  .markers i.center {
    visibility: hidden;
  }
</style>
