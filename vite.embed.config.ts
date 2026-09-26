import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// <ygo-deck> Web Component：单文件 ES 模块（含 React），样式注入 Shadow DOM
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    minify: true,
    // Vite 8 库模式下需在输出选项中显式开启压缩
    rollupOptions: { output: { minify: true } },
    lib: {
      entry: resolve(import.meta.dirname, 'src/embed/ygo-deck.tsx'),
      formats: ['es'],
      fileName: () => 'ygo-deck.js',
    },
  },
});
