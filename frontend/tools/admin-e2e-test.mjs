/*
 * 管理员端端到端测试（真实浏览器）
 * 前置：后端（8080）与前端开发服务器（5173）已启动
 * 运行：npm run test:admin
 */
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const ADMIN_NO = 'admin';
const ADMIN_PASSWORD = '123456';
const STUDENT_NO = '2024010001';

const EDGE_CANDIDATES = [
  process.env.EDGE_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
].filter(Boolean);
const executablePath = EDGE_CANDIDATES.find(p => fs.existsSync(p));
if (!executablePath) {
  console.error('未找到 Edge 浏览器，可用 EDGE_PATH 环境变量指定');
  process.exit(1);
}

const results = [];
const check = (name, cond, extra = '') =>
  results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' | ' + extra : ''}`);

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-first-run', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on('pageerror', err => results.push('PAGEERROR ' + err.message));

async function login(account, password) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle0' });
  await page.$eval('input[autocomplete="username"]', el => { el.value = ''; });
  await page.$eval('input[type="password"]', el => { el.value = ''; });
  await page.type('input[autocomplete="username"]', account);
  await page.type('input[type="password"]', password);
  await page.click('.login-submit');
}

async function waitToast() {
  await page.waitForSelector('.toast');
}

async function waitToastsGone() {
  await page.waitForFunction(() => !document.querySelector('.toast'), { timeout: 8000 });
}

async function lastToastText() {
  return page.$$eval('.toast', els => els[els.length - 1].textContent);
}

/* 等待表格数据加载完成（排除空态占位行） */
async function waitTableLoaded() {
  await page.waitForFunction(() => !document.querySelector('.admin-table tbody .admin-empty'), { timeout: 8000 });
}

try {
  /* 学生访问管理员页面应被重定向 */
  await login(STUDENT_NO, '123456');
  await page.waitForSelector('.course-list .course', { timeout: 10000 });
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.location.pathname.includes('/course-select'), { timeout: 5000 });
  check('学生访问 /admin 被重定向', page.url().includes('/course-select'));
  await page.evaluate(() => localStorage.clear());

  /* 管理员登录 */
  await login(ADMIN_NO, ADMIN_PASSWORD);
  await page.waitForFunction(() => window.location.pathname === '/admin', { timeout: 10000 });
  check('管理员登录进入控制台', page.url().endsWith('/admin'));

  const menus = await page.$$eval('.admin-side a', els => els.map(e => e.textContent.trim()));
  check('侧边菜单完整', ['选课总览', '课程管理', '教学班管理', '学生管理', '学院管理'].every(m => menus.includes(m)),
    menus.join(' / '));

  await page.waitForSelector('.admin-table tbody tr');
  await waitTableLoaded();
  const overviewRows = await page.$$eval('.admin-table tbody tr', els => els.length);
  check('选课总览有数据', overviewRows > 0, `行数=${overviewRows}`);

  /* 课程管理 */
  await page.click('.admin-side a:nth-child(2)');
  await page.waitForFunction(() => document.querySelector('.admin-title')?.textContent.includes('课程管理'));
  await waitTableLoaded();
  const courseRows = await page.$$eval('.admin-table tbody tr', els => els.length);
  check('课程管理列表', courseRows === 26, `课程数=${courseRows}`);

  /* 新增课程弹窗（校验必填） */
  await waitToastsGone();
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '新增课程').click();
  });
  await page.waitForSelector('.modal .form-grid');
  check('新增课程弹窗打开', true);
  await page.click('.modal-foot .btn--primary');
  await page.waitForSelector('.toast');
  const errText = await lastToastText();
  check('空课程号被拒绝', errText.includes('课程号'), errText);
  await page.evaluate(() => document.querySelector('.modal-close').click());
  await page.waitForFunction(() => !document.querySelector('.modal-mask'));

  /* 教学班管理 + 名单 */
  await page.click('.admin-side a:nth-child(3)');
  await page.waitForFunction(() => document.querySelector('.admin-title')?.textContent.includes('教学班管理'));
  await page.waitForSelector('.admin-table tbody tr');
  await waitTableLoaded();
  const classRows = await page.$$eval('.admin-table tbody tr', els => els.length);
  check('教学班列表', classRows >= 38, `教学班数=${classRows}`);
  const hasUsage = await page.$$eval('.usage-bar', els => els.length);
  check('使用率进度条渲染', hasUsage > 0, `个数=${hasUsage}`);

  await page.evaluate(() => {
    Array.from(document.querySelectorAll('.admin-actions button')).find(b => b.textContent.trim() === '名单').click();
  });
  await page.waitForSelector('.modal .admin-table');
  const rosterTitle = await page.$eval('.modal-title', el => el.textContent);
  check('名单弹窗打开', rosterTitle.includes('选课名单'), rosterTitle);
  const hasExport = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.modal button')).some(b => b.textContent.includes('导出 CSV')));
  check('名单导出按钮存在', hasExport);
  await page.evaluate(() => document.querySelector('.modal-close').click());
  await page.waitForFunction(() => !document.querySelector('.modal-mask'));

  /* 学生管理 + 代选退课 */
  await page.click('.admin-side a:nth-child(4)');
  await page.waitForFunction(() => document.querySelector('.admin-title')?.textContent.includes('学生管理'));
  await page.waitForSelector('.admin-table tbody tr');
  await waitTableLoaded();
  const studentRows = await page.$$eval('.admin-table tbody tr', els => els.length);
  check('学生列表', studentRows >= 40, `学生数=${studentRows}`);

  await page.evaluate(() => {
    Array.from(document.querySelectorAll('.admin-actions button')).find(b => b.textContent.trim() === '代选退课').click();
  });
  await page.waitForFunction(() => document.querySelector('.modal-title')?.textContent.includes('代选退课'));
  const sections = await page.$$eval('.modal .admin-title', els => els.map(e => e.textContent));
  check('代选退课弹窗含已选与添加两区', sections.some(t => t.includes('已选课程')) && sections.some(t => t.includes('添加选课')),
    sections.join(' / '));
  await page.evaluate(() => document.querySelector('.modal-close').click());
  await page.waitForFunction(() => !document.querySelector('.modal-mask'));

  /* 学院管理 */
  await page.click('.admin-side a:nth-child(5)');
  await page.waitForFunction(() => document.querySelector('.admin-title')?.textContent.includes('学院管理'));
  await page.waitForSelector('.admin-table tbody tr');
  await waitTableLoaded();
  const collegeRows = await page.$$eval('.admin-table tbody tr', els => els.length);
  check('学院列表', collegeRows >= 4, `学院数=${collegeRows}`);

  /* 退出登录 */
  await page.click('.logout');
  await page.waitForSelector('.modal .confirm-text');
  await page.click('.modal-foot .btn--primary');
  await page.waitForFunction(() => window.location.pathname.includes('/login'));
  check('管理员退出登录', page.url().includes('/login'));
} catch (err) {
  results.push('EXCEPTION ' + err.message);
} finally {
  const pageErrors = results.filter(r => r.startsWith('PAGEERROR'));
  check('无页面 JS 错误', pageErrors.length === 0, pageErrors.join(';'));
  console.log(results.join('\n'));
  const passCount = results.filter(r => r.startsWith('PASS')).length;
  const failCount = results.filter(r => !r.startsWith('PASS')).length;
  console.log(`总计: ${passCount} PASS / ${failCount} FAIL`);
  await browser.close();
  process.exit(failCount === 0 ? 0 : 1);
}
