/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// 组卡器 + iframe 嵌入页。base 用相对路径，部署到任意子目录（如 GitHub Pages）都能用。
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        embed: resolve(import.meta.dirname, 'embed.html'),
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
