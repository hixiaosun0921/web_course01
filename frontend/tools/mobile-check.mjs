/*
 * 移动端响应式检查（无头 Edge，手机视口）
 * 前置：前端开发服务器（默认 5173）+ 后端（8080）已启动
 * 运行：node tools/mobile-check.mjs
 */
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const STUDENT_NO = process.env.STUDENT_NO || '2024010001';
const PASSWORD = process.env.PASSWORD || '123456';

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

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + '/api' + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return res.json();
}

const login = await api('POST', '/auth/login', { studentNo: STUDENT_NO, password: PASSWORD });
if (login.code !== 0) {
  console.error('后端登录失败，请确认后端与前端均已启动：', login.message);
  process.exit(1);
}
const token = login.data.token;

async function resetStudent() {
  const mine = await api('GET', '/selections', undefined, token);
  if (mine.data.classIds.length) {
    await api('POST', '/selections/batch-cancel', { teachingClassIds: mine.data.classIds }, token);
  }
  const wishes = await api('GET', '/wishes', undefined, token);
  for (const id of wishes.data.classIds) {
    await api('DELETE', `/wishes/${id}`, undefined, token);
  }
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-first-run', '--disable-gpu'] });

for (const vp of [{ width: 375, height: 812 }, { width: 414, height: 896 }, { width: 768, height: 1024 }]) {
  const label = `${vp.width}×${vp.height}`;
  await resetStudent();
  const page = await browser.newPage();
  page.on('pageerror', err => results.push(`PAGEERROR[${label}] ` + err.message));
  await page.setViewport({ ...vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  /* 直接写入登录态，跳过表单 */
  await page.goto(BASE + '/login', { waitUntil: 'networkidle0' });
  await page.evaluate((data) => {
    localStorage.setItem('course-select-token', data.token);
    localStorage.setItem('course-select-role', data.role);
    localStorage.setItem('course-select-user', JSON.stringify(data.user));
  }, { token, role: login.data.role, user: login.data.user });
  await page.goto(BASE + '/course-select', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.course-list .course');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${label} 页面无横向溢出`, overflow <= 1, `超出 ${overflow}px`);

  const navVisible = await page.evaluate(() => {
    const el = document.querySelector('.topnav');
    return !!el && el.offsetParent !== null && el.getBoundingClientRect().height > 0;
  });
  check(`${label} 顶栏导航可见`, navVisible);

  const navItems = await page.$$eval('.topnav a', els => els.map(e => e.textContent.trim()));
  check(`${label} 导航含我的已选/意向单/个人资料`,
    ['我的已选', '意向单', '个人资料'].every(t => navItems.includes(t)), navItems.join(' / '));

  const rowInfo = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.class-row'));
    return { total: rows.length, bad: rows.filter(r => r.getBoundingClientRect().right > window.innerWidth + 1).length };
  });
  check(`${label} 教学班行不超宽`, rowInfo.bad === 0, `共 ${rowInfo.total} 行，超出 ${rowInfo.bad}`);

  const labelShown = await page.evaluate(() => {
    const el = document.querySelector('.class-row .cell-label');
    return !!el && getComputedStyle(el).display !== 'none';
  });
  if (vp.width <= 640) {
    check(`${label} 移动端字段标签显示`, labelShown);
  } else {
    check(`${label} 平板不显示字段标签（沿用表头）`, !labelShown);
  }

  const headFit = await page.evaluate(() => {
    const r = document.querySelector('.course-head').getBoundingClientRect();
    return { right: r.right, vw: window.innerWidth };
  });
  check(`${label} 课程头不超宽`, headFit.right <= headFit.vw + 1, JSON.stringify(headFit));

  const selected = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.class-row button')).find(b => b.textContent.trim() === '选课');
    if (btn) { btn.click(); return true; }
    return false;
  });
  check(`${label} 可选教学班`, selected);
  await page.waitForFunction(
    () => Number(document.querySelector('.creditbar .item:last-child .num').textContent.trim()) > 0,
    { timeout: 5000 });
  await page.evaluate(() => {
    const cb = document.querySelector('.class-row input[type="checkbox"]');
    if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await page.waitForSelector('.batch-bar');
  const batchFit = await page.evaluate(() => {
    const r = document.querySelector('.batch-bar').getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), vw: window.innerWidth };
  });
  check(`${label} 批量操作条不溢出`, batchFit.left >= 0 && batchFit.right <= batchFit.vw + 1, JSON.stringify(batchFit));

  await page.click('.topnav a:nth-child(2)');
  await page.waitForSelector('.modal .timetable');
  const modalFit = await page.evaluate(() => {
    const r = document.querySelector('.modal').getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), vw: window.innerWidth };
  });
  check(`${label} 弹窗不溢出`, modalFit.left >= 0 && modalFit.right <= modalFit.vw + 1, JSON.stringify(modalFit));
  const ttFit = await page.evaluate(() => {
    const r = document.querySelector('.tt-grid').getBoundingClientRect();
    return { right: Math.round(r.right), vw: window.innerWidth };
  });
  check(`${label} 周课表不溢出`, ttFit.right <= ttFit.vw + 1, JSON.stringify(ttFit));

  await page.close();
}

await browser.close();
console.log(results.join('\n'));
const passCount = results.filter(r => r.startsWith('PASS')).length;
const failCount = results.filter(r => !r.startsWith('PASS')).length;
console.log(`总计: ${passCount} PASS / ${failCount} FAIL`);
process.exit(failCount === 0 ? 0 : 1);
