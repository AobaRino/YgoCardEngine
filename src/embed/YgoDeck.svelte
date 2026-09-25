<svelte:options
  customElement={{
    tag: 'ygo-deck',
    shadow: 'open',
    props: {
      deck: { type: 'String', reflect: false },
      name: { type: 'String' },
      compact: { type: 'Boolean' },
      toolbar: { type: 'String' },
    },
  }}
/>

<script lang="ts">
  import themeCss from '../lib/theme.css?inline';
  import DeckView from '../components/DeckView.svelte';
  import { parseAny, type Deck } from '../lib/deck';
  import { BUILDER_URL } from './config';

  interface Props {
    /** ydke:// 卡组码或 YDK 文本；不填时读取标签内的文本 */
    deck?: string;
    name?: string;
    compact?: boolean;
    /** "false" 时隐藏工具栏 */
    toolbar?: string;
  }
  let { deck = '', name = '', compact = false, toolbar = 'true' }: Props = $props();

  // 未设置 deck 属性时读取标签内的文本（如 <ygo-deck>ydke://...</ygo-deck>）
  let root = $state<HTMLElement>();
  let inner = $state('');
  $effect(() => {
    const host = (root?.getRootNode() as ShadowRoot | undefined)?.host;
    if (host) inner = host.textContent ?? '';
  });
  const parsed = $derived<Deck | null>(parseAny(deck || inner, name));
</script>

{@html `<style>${themeCss}</style>`}
<div class="root" bind:this={root}>
  {#if parsed}
    <DeckView deck={parsed} builderUrl={BUILDER_URL} {compact} showToolbar={toolbar !== 'false'} />
  {:else}
    <p class="error">ygo-deck：无法识别卡组内容（支持 ydke:// 卡组码或 YDK 文本）</p>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: system-ui, -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    text-align: left;
  }
  .root {
    background: var(--panel);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
    font-size: 14px;
    line-height: 1.5;
  }
  .error {
    color: var(--danger);
    margin: 0;
  }
</style>
