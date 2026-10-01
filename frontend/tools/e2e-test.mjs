/*
 * 前端端到端测试（真实浏览器，puppeteer-core 驱动本机 Edge）
 * 前置：1) 后端已启动（默认 http://localhost:8080）
 *       2) 前端开发服务器已启动（默认 http://localhost:5173，/api 代理到后端）
 * 运行：npm run test:e2e
 * 环境变量：E2E_BASE 前端地址；EDGE_PATH 指定浏览器路径
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

/* 登录并清空该学生数据，保证用例可重复执行 */
const login = await api('POST', '/auth/login', { studentNo: STUDENT_NO, password: PASSWORD });
if (login.code !== 0) {
  console.error('后端登录失败，请确认后端已启动：', login.message);
  process.exit(1);
}
const token = login.data.token;
const mine = await api('GET', '/selections', undefined, token);
if (mine.data.classIds.length) {
  await api('POST', '/selections/batch-cancel', { teachingClassIds: mine.data.classIds }, token);
}
const wishes = await api('GET', '/wishes', undefined, token);
for (const id of wishes.data.classIds) {
  await api('DELETE', `/wishes/${id}`, undefined, token);
}
const waitlist = await api('GET', '/waitlist', undefined, token);
for (const item of waitlist.data.list) {
  await api('DELETE', `/waitlist/${item.classId}`, undefined, token);
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-first-run', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on('pageerror', err => results.push('PAGEERROR ' + err.message));
const creditNow = () => page.$eval('.creditbar .item:last-child .num', el => Number(el.textContent.trim()));

try {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle0' });
  check('登录页渲染', (await page.$('.login-box')) !== null);

  await page.type('input[autocomplete="username"]', STUDENT_NO);
  await page.type('input[type="password"]', 'wrong');
  await page.click('.login-submit');
  await page.waitForSelector('.toast');
  const errText = await page.$eval('.toast', el => el.textContent);
  check('错误密码提示', errText.includes('学号或密码错误'), errText);

  await page.waitForFunction(() => !document.querySelector('.toast'));
  await page.$eval('input[type="password"]', el => { el.value = ''; });
  await page.type('input[type="password"]', PASSWORD);
  await page.click('.login-submit');
  await page.waitForSelector('.course-list .course', { timeout: 10000 });
  check('登录成功进入选课页', page.url().includes('/course-select'));

  const courseCount = await page.$$eval('.course-list .course', els => els.length);
  check('课程渲染', courseCount > 0, `课程数=${courseCount}`);
  const activeTab = await page.$eval('.tab--active', el => el.textContent.trim());
  check('默认类别为主修课程', activeTab === '主修课程');
  const rowCount = await page.$$eval('.class-row', els => els.length);
  check('教学班行渲染', rowCount > 0, `行数=${rowCount}`);
  const cellTexts = await page.$$eval('.cls-cell', els => els.map(e => e.textContent));
  check('上课地点显示未定', cellTexts.some(t => t.includes('未定')));

  const clickedSelect = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.class-row button')).find(b => b.textContent.trim() === '选课');
    if (btn) { btn.click(); return true; }
    return false;
  });
  check('存在可选教学班', clickedSelect);
  await page.waitForFunction(() => Number(document.querySelector('.creditbar .item:last-child .num').textContent.trim()) > 0, { timeout: 5000 });
  check('选课后学分更新', (await creditNow()) > 0, `已选=${await creditNow()} 学分`);

  await page.click('.topnav a:nth-child(2)');
  await page.waitForSelector('.modal .timetable');
  const redCount = await page.$$eval('.tt-slot.on', els => els.length);
  check('周课表红块', redCount >= 2, `红块=${redCount}`);
  const ttText = await page.$eval('.timetable', el => el.textContent);
  check('课表不显示课程名', !/程序设计|思想道德|大学英语|数据结构/.test(ttText));
  const slots = await page.$$eval('.tt-slot', els => els.length);
  check('课表格子完整', slots === 84, `格子=${slots}`);
  await page.click('.modal-foot .btn');
  await page.waitForFunction(() => !document.querySelector('.modal-mask'));

  const clickedDrop = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.class-row button')).find(b => b.textContent.trim() === '退课');
    if (btn) { btn.click(); return true; }
    return false;
  });
  check('存在退课按钮', clickedDrop);
  await page.waitForSelector('.modal .confirm-text');
  await page.click('.modal-foot .btn--primary');
  await page.waitForFunction(() => Number(document.querySelector('.creditbar .item:last-child .num').textContent.trim()) === 0, { timeout: 5000 });
  check('退课后学分归零', (await creditNow()) === 0);

  await page.evaluate(() => {
    Array.from(document.querySelectorAll('.tab')).find(t => t.textContent.trim() === '英语分项').click();
  });
  await page.waitForFunction(() => document.querySelector('.tab--active').textContent.trim() === '英语分项');
  const enCount = await page.$$eval('.course-list .course', els => els.length);
  check('英语分项有课程', enCount > 0, `课程数=${enCount}`);
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('.tab')).find(t => t.textContent.trim() === '主修课程').click();
  });
  await page.waitForFunction(() => document.querySelector('.tab--active').textContent.trim() === '主修课程');

  const clickedStar = await page.evaluate(() => {
    const btn = document.querySelector('.star-btn');
    if (btn) { btn.click(); return true; }
    return false;
  });
  check('存在收藏星标', clickedStar);
  await page.waitForSelector('.star-btn.is-on');
  await page.click('.topnav a:nth-child(3)');
  await page.waitForSelector('.modal .panel-item');
  const wishCount = await page.$$eval('.modal .panel-item', els => els.length);
  check('意向单弹窗内容', wishCount === 1, `条目=${wishCount}`);
  await page.click('.modal-foot .btn--primary');
  await page.waitForFunction(() => Number(document.querySelector('.creditbar .item:last-child .num').textContent.trim()) > 0, { timeout: 5000 });
  check('一键选课成功', (await creditNow()) > 0, `已选=${await creditNow()}`);
  await page.waitForFunction(() => document.querySelectorAll('.modal .panel-item').length === 0, { timeout: 5000 });
  check('选课后自动移出意向单', true);
  await page.click('.modal-foot .btn:not(.btn--primary)');
  await page.waitForFunction(() => !document.querySelector('.modal-mask'));

  await page.click('.logout');
  await page.waitForSelector('.modal .confirm-text');
  await page.click('.modal-foot .btn--primary');
  await page.waitForFunction(() => window.location.pathname.includes('/login'));
  check('退出登录回到登录页', page.url().includes('/login'));
} catch (err) {
  results.push('EXCEPTION ' + err.message);
} finally {
  const pageErrors = results.filter(r => r.startsWith('PAGEERROR'));
  check('无页面 JS 错误', pageErrors.length === 0, pageErrors.join(';'));
  console.log(results.join('\n'));
  const passCount = results.filter(r => r.startsWith('PASS')).length;
  const failCount = results.filter(r => r.startsWith('FAIL') || r.startsWith('EXCEPTION')).length;
  console.log(`总计: ${passCount} PASS / ${failCount} FAIL`);
  await browser.close();
  process.exit(failCount === 0 ? 0 : 1);
}
