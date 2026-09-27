import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * <ygo-deck> Web Component：单文件 ES 模块，样式注入 Shadow DOM。
 * 组件代码与组卡器共用（React 写法），但这里用 preact/compat 替换 React，
 * 让嵌入别人网站的脚本体积小得多。
 */
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  resolve: {
    alias: [
      { find: /^react-dom\/client$/, replacement: 'preact/compat/client' },
      { find: /^react-dom$/, replacement: 'preact/compat' },
      { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
      { find: /^react\/jsx-dev-runtime$/, replacement: 'preact/jsx-dev-runtime' },
      { find: /^react$/, replacement: 'preact/compat' },
    ],
  },
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
