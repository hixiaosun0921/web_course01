import * as store from './store.js';
import { BusinessError } from './store.js';

/* 路由表：method + 正则路径 + 是否需要登录 */
const routes = [
  { method: 'GET', path: /^\/health$/, auth: false, handler: () => ({ ok: true }) },
  { method: 'POST', path: /^\/auth\/login$/, auth: false, handler: ctx => store.login(ctx.body) },
  { method: 'GET', path: /^\/courses$/, auth: true, handler: () => store.listCourses() },
  { method: 'POST', path: /^\/classes\/refresh$/, auth: true, handler: () => store.refreshAvailability() },
  { method: 'GET', path: /^\/classes\/availability$/, auth: true, handler: () => store.availability() },
  { method: 'GET', path: /^\/selections$/, auth: true, handler: ctx => store.getSelections(ctx.studentNo) },
  { method: 'POST', path: /^\/selections\/batch-cancel$/, auth: true, handler: ctx => store.batchCancel(ctx.studentNo, ctx.body.teachingClassIds) },
  { method: 'POST', path: /^\/selections$/, auth: true, handler: ctx => store.select(ctx.studentNo, ctx.body.teachingClassId) },
  { method: 'DELETE', path: /^\/selections\/([^/]+)$/, auth: true, handler: ctx => store.drop(ctx.studentNo, ctx.params[0]) },
  { method: 'GET', path: /^\/waitlist$/, auth: true, handler: ctx => store.getWaitlist(ctx.studentNo) },
  { method: 'POST', path: /^\/waitlist$/, auth: true, handler: ctx => store.joinWaitlist(ctx.studentNo, ctx.body.teachingClassId) },
  { method: 'DELETE', path: /^\/waitlist\/([^/]+)$/, auth: true, handler: ctx => store.leaveWaitlist(ctx.studentNo, ctx.params[0]) },
  { method: 'GET', path: /^\/wishes$/, auth: true, handler: ctx => store.getWishes(ctx.studentNo) },
  { method: 'POST', path: /^\/wishes$/, auth: true, handler: ctx => store.addWish(ctx.studentNo, ctx.body.teachingClassId) },
  { method: 'DELETE', path: /^\/wishes\/([^/]+)$/, auth: true, handler: ctx => store.removeWish(ctx.studentNo, ctx.params[0]) }
];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new BusinessError(5000, '请求体格式错误'));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/* 生成 connect 风格的中间件（Vite 插件与 server.js 共用） */
export function createApiHandler() {
  return function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const route = routes.find(item => item.method === req.method && item.path.test(url.pathname));
    if (!route) {
      send(res, 404, { code: 5000, message: '接口不存在' });
      return;
    }

    (async () => {
      try {
        const body = await readBody(req);
        let studentNo = null;
        if (route.auth) {
          const auth = req.headers.authorization || '';
          studentNo = auth.startsWith('Bearer ') ? auth.slice(7) : '';
          if (!studentNo || !store.findStudent(studentNo)) {
            throw new BusinessError(1001, '未登录或登录已过期');
          }
        }
        const params = url.pathname.match(route.path).slice(1).map(decodeURIComponent);
        const data = await route.handler({ studentNo, body, query: url.searchParams, params });
        send(res, 200, { code: 0, message: 'success', data });
      } catch (err) {
        if (err instanceof BusinessError) {
          send(res, 200, { code: err.code, message: err.message });
          return;
        }
        console.error('[mock-api]', err);
        send(res, 500, { code: 5000, message: '系统异常，请稍后重试' });
      }
    })();
  };
}
