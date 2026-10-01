/*
 * 后端接口冒烟测试：node backend/tools/api-smoke-test.mjs
 * 需先启动后端（默认 http://localhost:8080）与 PostgreSQL
 * 覆盖：登录鉴权、课程数据、选退课校验、候补、意向单、学分上限、批量退课明细
 */
const BASE = process.env.API_BASE || 'http://localhost:8080/api';
const STUDENT_NO = process.env.STUDENT_NO || '2024010001';
const PASSWORD = process.env.PASSWORD || '123456';

const results = [];
const check = (name, cond, extra = '') =>
  results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' | ' + extra : ''}`);

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return res.json();
}

/* 1. 登录 */
const bad = await api('POST', '/auth/login', { studentNo: STUDENT_NO, password: 'wrong' });
check('错误密码拒绝', bad.code === 1002, bad.message);
const login = await api('POST', '/auth/login', { studentNo: STUDENT_NO, password: PASSWORD });
check('登录成功', login.code === 0 && !!login.data.token && login.data.student.studentNo === STUDENT_NO);
const token = login.data.token;

const noAuth = await api('GET', '/courses');
check('未登录访问拒绝', noAuth.code === 1001, noAuth.message);

/* 2. 课程数据 */
const courses = await api('GET', '/courses', undefined, token);
check('课程与教学班加载', courses.code === 0 && courses.data.length === 26,
  `课程=${courses.code === 0 ? courses.data.length : '-'}`);
const classes = courses.code === 0
  ? courses.data.flatMap(c => c.classes.map(x => ({ ...x, courseId: c.courseId, credit: c.credit, name: c.name })))
  : [];
check('教学班数量', classes.length === 38, `教学班=${classes.length}`);
check('教室为未定', classes[0] && classes[0].room === '未定');

/* 3. 清空该学生已有数据，保证可重复执行 */
const mine = await api('GET', '/selections', undefined, token);
if (mine.data.classIds.length) {
  await api('POST', '/selections/batch-cancel', { teachingClassIds: mine.data.classIds }, token);
}
const myWishes = await api('GET', '/wishes', undefined, token);
for (const id of myWishes.data.classIds) {
  await api('DELETE', `/wishes/${id}`, undefined, token);
}
const myWait = await api('GET', '/waitlist', undefined, token);
for (const item of myWait.data.list) {
  await api('DELETE', `/waitlist/${item.classId}`, undefined, token);
}

/* 4. 选课校验链 */
const first = classes[0];
const sel1 = await api('POST', '/selections', { teachingClassId: first.classId }, token);
check('选课成功', sel1.code === 0 && sel1.data.count === 1, JSON.stringify(sel1.data));
const dup = await api('POST', '/selections', { teachingClassId: first.classId }, token);
check('重复选课拒绝', dup.code === 2002, dup.message);
const sameCourse = classes.find(c => c.courseId === first.courseId && c.classId !== first.classId);
const same = await api('POST', '/selections', { teachingClassId: sameCourse.classId }, token);
check('同课程互斥', same.code === 2002, same.message);

const conflictClass = classes.find(c => c.courseId !== first.courseId
  && c.day === first.day && c.start <= first.end && c.end >= first.start);
if (conflictClass) {
  const conflict = await api('POST', '/selections', { teachingClassId: conflictClass.classId }, token);
  check('时间冲突拒绝', conflict.code === 2004, conflict.message);
} else {
  check('时间冲突拒绝（无冲突样本，跳过）', true);
}

const drop = await api('DELETE', `/selections/${first.classId}`, undefined, token);
check('退课成功', drop.code === 0 && drop.data.count === 0);
const dropAgain = await api('DELETE', `/selections/${first.classId}`, undefined, token);
check('重复退课拒绝', dropAgain.code === 2006, dropAgain.message);

/* 5. 候补（找一个满员教学班） */
const full = classes.find(c => c.remaining === 0);
if (full) {
  const wait = await api('POST', '/waitlist', { teachingClassId: full.classId }, token);
  check('候补申请成功', wait.code === 0 && wait.data.position >= 1, JSON.stringify(wait.data));
  const waitDup = await api('POST', '/waitlist', { teachingClassId: full.classId }, token);
  check('候补重复拒绝', waitDup.code === 3001, waitDup.message);
  const waitLeave = await api('DELETE', `/waitlist/${full.classId}`, undefined, token);
  check('退出候补成功', waitLeave.code === 0);
} else {
  check('候补用例（无满员班，跳过）', true);
}

/* 6. 意向单 */
const wish = await api('POST', '/wishes', { teachingClassId: first.classId }, token);
check('加入意向单', wish.code === 0 && wish.data.classIds.includes(first.classId));
const wishRemove = await api('DELETE', `/wishes/${first.classId}`, undefined, token);
check('移除意向单', wishRemove.code === 0 && !wishRemove.data.classIds.includes(first.classId));

/* 7. 学分上限 */
const chosen = [];
let credit = 0;
for (const cls of classes) {
  if (chosen.some(x => x.courseId === cls.courseId)) continue;
  if (cls.remaining <= 0) continue;
  if (chosen.some(x => x.day === cls.day && x.start <= cls.end && x.end >= cls.start)) continue;
  const res = await api('POST', '/selections', { teachingClassId: cls.classId }, token);
  if (res.code === 0) {
    chosen.push(cls);
    credit = Number(res.data.credit);
    if (credit >= 36) break;
  }
}
const over = classes.find(cls =>
  !chosen.some(x => x.courseId === cls.courseId)
  && cls.remaining > 0
  && !chosen.some(x => x.day === cls.day && x.start <= cls.end && x.end >= cls.start)
  && credit + Number(cls.credit) > 36);
if (over) {
  const res = await api('POST', '/selections', { teachingClassId: over.classId }, token);
  check('超出学分上限拒绝', res.code === 2005, `已选=${credit} + ${over.credit} | ${res.message}`);
} else {
  check('学分上限用例（构造失败，跳过）', true);
}

/* 8. 批量退课明细 */
const batch = await api('POST', '/selections/batch-cancel', {
  teachingClassIds: [...chosen.map(c => c.classId), 999999]
}, token);
check('批量退课逐条明细',
  batch.code === 0 && batch.data.results.length === chosen.length + 1
  && batch.data.results.filter(r => r.success).length === chosen.length
  && batch.data.results.some(r => r.success === false && r.reason));

const failCount = results.filter(r => r.startsWith('FAIL')).length;
console.log(results.join('\n'));
console.log(`总计: ${results.length - failCount} PASS / ${failCount} FAIL`);
process.exit(failCount === 0 ? 0 : 1);
