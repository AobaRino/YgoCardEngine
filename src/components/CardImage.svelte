<script lang="ts">
  import { frameKind, isMonster, isLink, statLabel, type Card } from '../lib/card';
  import { firstImage, markFailed } from '../lib/images';

  interface Props {
    id: number;
    card?: Card;
    /** 禁限数量角标：0 禁止 1 限制 2 准限制 */
    limit?: number;
    lazy?: boolean;
  }
  let { id, card, limit, lazy = true }: Props = $props();

  // 失败次数变化时重新挑选下一个可用图床
  let fails = $state(0);
  let src = $derived.by(() => {
    void fails;
    return firstImage(id);
  });

  let loaded = $state(false);
  $effect.pre(() => {
    void src;
    loaded = false;
  });

  function onError() {
    if (src) markFailed(src);
    loaded = false;
    fails++;
  }
</script>

<div class="card-image" data-frame={card ? frameKind(card) : 'effect'} title={card?.name ?? String(id)}>
  <!-- 文字卡面始终垫在底下：图片加载中或所有图床都失败时也能看到卡名 -->
  <div class="text-face" aria-hidden={src && loaded ? 'true' : undefined}>
    <div class="name">{card?.name ?? id}</div>
    <div class="art"></div>
    {#if card && isMonster(card)}
      <div class="stats">
        {statLabel(card.atk)}{isLink(card) ? ` / L${card.level}` : ` / ${statLabel(card.def)}`}
      </div>
    {/if}
  </div>
  {#if src}
    <img
      {src}
      alt={card?.name ?? String(id)}
      class:loaded
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      draggable="false"
      onload={() => (loaded = true)}
      onerror={onError}
    />
  {/if}
  {#if limit !== undefined && limit < 3}
    <span class="limit l{limit}">{limit}</span>
  {/if}
</div>

<style>
  .card-image {
    position: relative;
    aspect-ratio: var(--card-ratio, 59 / 86);
    border-radius: 4px;
    overflow: hidden;
    background: var(--panel-2, #eee);
    user-select: none;
    container-type: inline-size;
  }
  img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.15s;
  }
  img.loaded {
    opacity: 1;
  }
  .text-face {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 4%;
    padding: 6%;
    box-sizing: border-box;
    color: #111;
    background: var(--frame, #c9793b);
    font-size: clamp(8px, 11cqi, 14px);
    line-height: 1.2;
  }
  .name {
    background: rgb(255 255 255 / 0.75);
    border-radius: 2px;
    padding: 2% 4%;
    font-weight: 600;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    word-break: break-all;
  }
  .art {
    flex: 1;
    background: rgb(0 0 0 / 0.18);
    border-radius: 2px;
  }
  .stats {
    text-align: right;
    font-weight: 600;
  }
  [data-frame='normal'] { --frame: var(--frame-normal); }
  [data-frame='effect'] { --frame: var(--frame-effect); }
  [data-frame='ritual'] { --frame: var(--frame-ritual); }
  [data-frame='fusion'] { --frame: var(--frame-fusion); }
  [data-frame='synchro'] { --frame: var(--frame-synchro); }
  [data-frame='xyz'] { --frame: var(--frame-xyz); }
  [data-frame='xyz'] .text-face { color: #eee; }
  [data-frame='link'] { --frame: var(--frame-link); }
  [data-frame='token'] { --frame: var(--frame-token); }
  [data-frame='spell'] { --frame: var(--frame-spell); }
  [data-frame='trap'] { --frame: var(--frame-trap); }
  .limit {
    position: absolute;
    top: 3%;
    left: 3%;
    min-width: 1.4em;
    height: 1.4em;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font: 700 clamp(9px, 14cqi, 16px) / 1 system-ui, sans-serif;
    color: #fff;
    background: #e8a200;
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.5);
  }
  .limit.l0 { background: #d92d20; }
  .limit.l1 { background: #e8590c; }
</style>
