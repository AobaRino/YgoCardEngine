import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // YgoDeck.svelte 只在 vite.embed.config.ts 中以 customElement 模式编译
    warningFilter: (w) => w.code !== 'options_missing_custom_element',
  },
};
