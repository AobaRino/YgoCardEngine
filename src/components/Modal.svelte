<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    onclose: () => void;
    children: Snippet;
    wide?: boolean;
  }
  let { title, onclose, children, wide = false }: Props = $props();
  let panel: HTMLDivElement;

  $effect(() => {
    panel?.focus();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={onclose}>
  <div
    class="modal"
    class:wide
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
    bind:this={panel}
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.key === 'Escape' && onclose()}
  >
    <header>
      <h2>{title}</h2>
      <button class="close" onclick={onclose} aria-label="关闭">✕</button>
    </header>
    <div class="body">{@render children()}</div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgb(0 0 0 / 0.55);
    display: grid;
    place-items: center;
    padding: 16px;
  }
  .modal {
    width: min(520px, 100%);
    max-height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
    background: var(--panel);
    color: var(--text);
    border-radius: 12px;
    box-shadow: var(--shadow);
    outline: none;
  }
  .modal.wide {
    width: min(820px, 100%);
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
  }
  h2 {
    margin: 0;
    font-size: 1.05rem;
  }
  .close {
    border: 0;
    background: none;
    color: var(--muted);
    font-size: 18px;
    cursor: pointer;
  }
  .body {
    padding: 16px 18px 18px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
