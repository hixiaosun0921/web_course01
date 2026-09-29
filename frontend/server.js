/*
 * 无后端部署入口：node server.js
 * - 托管 vite build 产物 dist/
 * - /api 由内存 mock 提供（数据来自同目录的 学生信息模拟.txt / 教学班模拟.txt）
 * 接入 Spring Boot 后可不再使用本文件，改由 Nginx 托管 dist 并反代 /api。
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiHandler } from './mock/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT) || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const apiHandler = createApiHandler();

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname.startsWith('/api/')) {
    req.url = url.pathname.slice(4) + url.search;
    apiHandler(req, res);
    return;
  }

  let filePath = path.join(DIST, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html'); // SPA 回退
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404).end('请先执行 npm run build 生成 dist/');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log(`选课系统前端已启动：http://localhost:${PORT}`);
  console.log('接口数据来自 mock/，密码统一为 123456');
});
