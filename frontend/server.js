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

/* 安全解码：畸形百分号编码（如 /% ）不能让进程崩溃 */
function decodePath(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}

function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname.startsWith('/api/')) {
    req.url = url.pathname.slice(4) + url.search;
    apiHandler(req, res);
    return;
  }

  const pathname = decodePath(url.pathname);
  if (pathname === null) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  let filePath = path.join(DIST, pathname);
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
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff'
  });
  fs.createReadStream(filePath).pipe(res);
}

http.createServer((req, res) => {
  try {
    handleRequest(req, res);
  } catch (err) {
    console.error('[server]', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('500 Server Error');
  }
}).listen(PORT, () => {
  console.log(`选课系统前端已启动：http://localhost:${PORT}`);
  console.log('接口数据来自 mock/，密码统一为 123456');
});
