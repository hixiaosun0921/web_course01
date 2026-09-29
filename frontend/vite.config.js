import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createApiHandler } from './mock/api.js';
import { dataFilePaths, reloadData } from './mock/store.js';

/* 开发/预览阶段：由 Vite 中间件直接提供 /api（无需 Java 后端） */
function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api', createApiHandler());
      const files = dataFilePaths();
      server.watcher.add(files);
      server.watcher.on('change', changed => {
        if (files.includes(changed)) {
          reloadData();
          server.config.logger.info('[mock-api] 数据文件已变更，已重新加载');
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api', createApiHandler());
    }
  };
}

export default defineConfig({
  plugins: [vue(), mockApiPlugin()],
  server: {
    port: 5173,
    open: false
  }
});
