import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // GitHub Pages 项目站点部署在 https://zxeqzzg.github.io/--AI-Coding-/ 子路径下，
    // 资源必须带上该前缀，否则线上会因 404 白屏。本地开发与其它托管平台可用
    // VITE_BASE 环境变量覆盖（例如 VITE_BASE=/）。
    base: process.env.VITE_BASE ?? '/--AI-Coding-/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
