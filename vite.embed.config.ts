import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

// <ygo-deck> Web Component：单文件 ES 模块，样式注入 Shadow DOM
export default defineConfig({
  plugins: [svelte({ compilerOptions: { customElement: true, css: 'injected' } })],
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/embed/ygo-deck.ts'),
      formats: ['es'],
      fileName: () => 'ygo-deck.js',
    },
  },
});
