<script lang="ts">
  import Modal from '../components/Modal.svelte';
  import { deckSize, parseAny } from '../lib/deck';
  import { setDeck, toast } from './state.svelte';

  let { onclose }: { onclose: () => void } = $props();
  let text = $state('');
  let name = $state('');
  let error = $state('');

  async function onfile(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    text = await file.text();
    if (!name) name = file.name.replace(/\.ydk$/i, '');
  }

  function submit() {
    const deck = parseAny(text, name.trim());
    if (!deck || !deckSize(deck)) {
      error = '无法识别：请粘贴 ydke:// 卡组码、YDK 文件内容或本站分享链接';
      return;
    }
    if (!deck.name) deck.name = name.trim();
    setDeck(deck);
    toast(`已导入 ${deckSize(deck)} 张卡`);
    onclose();
  }
</script>

<Modal title="导入卡组" {onclose}>
  <label class="row">选择 .ydk 文件 <input type="file" accept=".ydk,.txt" onchange={onfile} /></label>
  <textarea class="input" rows="8" placeholder={'粘贴以下任意格式：\nydke://…\nYDK 文件内容（#main / #extra / !side）\n本站分享链接'} bind:value={text}></textarea>
  <input class="input" placeholder="卡组名称（可选）" bind:value={name} />
  {#if error}<p class="error">{error}</p>{/if}
  <div class="row end">
    <button class="btn" onclick={onclose}>取消</button>
    <button class="btn primary" onclick={submit} disabled={!text.trim()}>导入（替换当前卡组）</button>
  </div>
</Modal>

<style>
  .row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .end {
    justify-content: flex-end;
  }
  .error {
    color: var(--danger);
    margin: 0;
  }
</style>
