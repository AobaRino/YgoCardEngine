<script lang="ts">
  import { copyText } from '../lib/util';

  interface Props {
    label: string;
    value: string;
    rows?: number;
    hint?: string;
  }
  let { label, value, rows = 1, hint }: Props = $props();
  let copied = $state(false);

  async function copy() {
    copied = await copyText(value);
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="field">
  <div class="head">
    <strong>{label}</strong>
    <button class="btn small" onclick={copy}>{copied ? '已复制 ✓' : '复制'}</button>
  </div>
  {#if rows > 1}
    <textarea class="input" readonly {rows} {value} onfocus={(e) => e.currentTarget.select()}></textarea>
  {:else}
    <input class="input" readonly {value} onfocus={(e) => e.currentTarget.select()} />
  {/if}
  {#if hint}<small class="muted">{hint}</small>{/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  input.input {
    width: 100%;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.8rem;
  }
</style>
