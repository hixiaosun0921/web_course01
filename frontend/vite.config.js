import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/*
 * 纯前端工程：开发时 /api 代理到后端（默认 http://localhost:8080，
 * 可用环境变量 VITE_PROXY_TARGET 覆盖）。
 * 后端工程见仓库根目录 backend/（Spring Boot + PostgreSQL）。
 */
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173
  }
});
