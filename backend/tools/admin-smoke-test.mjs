/*
 * 管理员接口冒烟测试：node backend/tools/admin-smoke-test.mjs
 * 覆盖：管理员登录/权限隔离、学院 CRUD 约束、课程 CRUD 约束、教学班约束、学生 CRUD、代选退课、CSV 导出
 */
const BASE = process.env.API_BASE || 'http://localhost:8080/api';
const ADMIN = { no: process.env.ADMIN_NO || 'admin', password: process.env.ADMIN_PASSWORD || '123456' };
const STUDENT_NO = process.env.STUDENT_NO || '2024010002';

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
  const type = res.headers.get('content-type') || '';
  if (type.includes('csv')) {
    const buffer = await res.arrayBuffer();
    // ignoreBOM: true 保留 UTF-8 BOM，便于校验导出内容
    const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(buffer);
    return { code: 0, text };
  }
  return res.json();
}

/* 1. 登录与权限隔离 */
const badAdmin = await api('POST', '/auth/login', { studentNo: ADMIN.no, password: 'wrong' });
check('管理员错误密码拒绝', badAdmin.code === 1002, badAdmin.message);

const login = await api('POST', '/auth/login', { studentNo: ADMIN.no, password: ADMIN.password });
check('管理员登录成功', login.code === 0 && login.data.role === 'admin', JSON.stringify(login.data?.user));
const token = login.data.token;

const studentLogin = await api('POST', '/auth/login', { studentNo: STUDENT_NO, password: '123456' });
check('学生登录成功', studentLogin.code === 0 && studentLogin.data.role === 'student');
const studentToken = studentLogin.data.token;

/* 清空该学生历史选课，保证用例可重复执行 */
const mine = await api('GET', '/selections', undefined, studentToken);
if (mine.data.classIds.length) {
  await api('POST', '/selections/batch-cancel', { teachingClassIds: mine.data.classIds }, studentToken);
}

const studentBlocked = await api('GET', '/admin/colleges', undefined, studentToken);
check('学生访问管理员接口被拒', studentBlocked.code === 1003, studentBlocked.message);
const anonBlocked = await api('GET', '/admin/colleges');
check('未登录访问管理员接口被拒', anonBlocked.code === 1001, anonBlocked.message);

/* 2. 学院 */
/* 先清理历史遗留的测试数据，保证用例可重复执行 */
const leftoverCourses = await api('GET', '/admin/courses?keyword=TEST001', undefined, token);
for (const course of leftoverCourses.data) {
  const classes = await api('GET', `/admin/classes?courseId=${course.id}`, undefined, token);
  for (const cls of classes.data) {
    const roster = await api('GET', `/admin/classes/${cls.id}/students`, undefined, token);
    for (const row of roster.data) {
      await api('DELETE', `/admin/selections/${row.studentId}/${cls.id}`, undefined, token);
    }
    await api('DELETE', `/admin/classes/${cls.id}`, undefined, token);
  }
  await api('DELETE', `/admin/courses/${course.id}`, undefined, token);
}
const leftoverStudents = await api('GET', '/admin/students?keyword=2024019999', undefined, token);
for (const row of leftoverStudents.data) {
  await api('DELETE', `/admin/students/${row.id}`, undefined, token);
}
const allColleges = await api('GET', '/admin/colleges', undefined, token);
for (const college of allColleges.data.filter(c => c.name.startsWith('测试学院'))) {
  await api('DELETE', `/admin/colleges/${college.id}`, undefined, token);
}

const colleges = await api('GET', '/admin/colleges', undefined, token);
check('学院列表', colleges.code === 0 && colleges.data.length >= 4,
  `学院数=${colleges.code === 0 ? colleges.data.length : '-'}`);

const created = await api('POST', '/admin/colleges', { name: '测试学院A' }, token);
check('新增学院', created.code === 0);
const dupCollege = await api('POST', '/admin/colleges', { name: '测试学院A' }, token);
check('学院重名拒绝', dupCollege.code === 4002, dupCollege.message);
const listAfter = await api('GET', '/admin/colleges', undefined, token);
const tempCollege = listAfter.data.find(c => c.name === '测试学院A');
const renamed = await api('PUT', `/admin/colleges/${tempCollege.id}`, { name: '测试学院B' }, token);
check('修改学院', renamed.code === 0);
const delLinked = await api('DELETE', `/admin/colleges/${colleges.data[0].id}`, undefined, token);
check('有课程/学生的学院禁止删除', delLinked.code === 4003, delLinked.message);
const delTemp = await api('DELETE', `/admin/colleges/${tempCollege.id}`, undefined, token);
check('删除空学院', delTemp.code === 0);

/* 3. 课程 */
const courses = await api('GET', '/admin/courses?keyword=', undefined, token);
check('课程列表', courses.code === 0 && courses.data.length === 26, `课程数=${courses.data.length}`);
const newCourse = await api('POST', '/admin/courses',
  { courseNo: 'TEST001', name: '测试课程', credit: 2, category: '通识选修课', collegeId: colleges.data[0].id }, token);
check('新增课程', newCourse.code === 0);
const dupCourse = await api('POST', '/admin/courses',
  { courseNo: 'TEST001', name: '重复课程', credit: 2, category: '通识选修课' }, token);
check('课程号重复拒绝', dupCourse.code === 4002, dupCourse.message);
const badCategory = await api('POST', '/admin/courses',
  { courseNo: 'TEST002', name: '坏类别', credit: 2, category: '不存在' }, token);
check('非法类别拒绝', badCategory.code === 4002, badCategory.message);
const courseList = await api('GET', '/admin/courses?keyword=TEST001', undefined, token);
const testCourse = courseList.data[0];
const delLinkedCourse = await api('DELETE', `/admin/courses/${courses.data[0].id}`, undefined, token);
check('有教学班的课程禁止删除', delLinkedCourse.code === 4003, delLinkedCourse.message);

/* 4. 教学班：开设 → 约束 → 删除 */
const newClass = await api('POST', '/admin/classes',
  { courseId: testCourse.id, className: '01 班', teacher: '测试教师', dayOfWeek: 2, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, classroom: '一教 101', capacity: 40 }, token);
check('开设教学班', newClass.code === 0);
const badTime = await api('POST', '/admin/classes',
  { courseId: testCourse.id, className: '02 班', teacher: '测试教师', dayOfWeek: 2, startSection: 5, endSection: 3, startWeek: 1, endWeek: 16, capacity: 40 }, token);
check('节次倒置拒绝', badTime.code === 4002, badTime.message);

const classList = await api('GET', '/admin/classes?keyword=测试课程', undefined, token);
const testClass = classList.data[0];
check('教学班列表（含使用率）', classList.code === 0 && testClass.usage !== undefined,
  `使用率=${testClass?.usage}%`);

/* 5. 代选退课 */
const rosterBefore = await api('GET', `/admin/classes/${testClass.id}/students`, undefined, token);
check('名单初始为空', rosterBefore.code === 0 && rosterBefore.data.length === 0);

const studentList = await api('GET', `/admin/students?keyword=${STUDENT_NO}`, undefined, token);
const student = studentList.data[0];
const adminSelect = await api('POST', '/admin/selections',
  { studentId: student.id, teachingClassId: testClass.id }, token);
check('管理员代选课', adminSelect.code === 0 && adminSelect.data.count >= 1,
  `${adminSelect.code} ${adminSelect.message || JSON.stringify(adminSelect.data)}`);

/* 已有学生选课时，容量不能小于已选人数 */
const shrink = await api('PUT', `/admin/classes/${testClass.id}`,
  { className: testClass.className, teacher: '测试教师', dayOfWeek: 2, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, classroom: '一教 101', capacity: 0 }, token);
check('容量小于已选拒绝', shrink.code === 4002 && shrink.message.includes('容量'), shrink.message);

const rosterAfter = await api('GET', `/admin/classes/${testClass.id}/students`, undefined, token);
check('名单出现该学生', rosterAfter.data.some(r => r.studentNo === STUDENT_NO));
const rosterCsv = await api('GET', `/admin/classes/${testClass.id}/students.csv`, undefined, token);
check('名单 CSV 导出（含 BOM）', rosterCsv.code === 0 && rosterCsv.text.startsWith('\uFEFF') && rosterCsv.text.includes(STUDENT_NO));
const blockedDeleteClass = await api('DELETE', `/admin/classes/${testClass.id}`, undefined, token);
check('有选课记录的教学班禁止删除', blockedDeleteClass.code === 4003, blockedDeleteClass.message);
const adminDrop = await api('DELETE', `/admin/selections/${student.id}/${testClass.id}`, undefined, token);
check('管理员代退课', adminDrop.code === 0);

/* 6. 学生管理 */
const newStudent = await api('POST', '/admin/students',
  { studentNo: '2024019999', name: '测试学生', gender: '男', major: '测试专业', grade: '2024 级', collegeId: colleges.data[0].id }, token);
check('新增学生', newStudent.code === 0);
const dupStudent = await api('POST', '/admin/students', { studentNo: '2024019999', name: '重复' }, token);
check('学号重复拒绝', dupStudent.code === 4002, dupStudent.message);
const newStudentLogin = await api('POST', '/auth/login', { studentNo: '2024019999', password: '123456' });
check('新学生可用默认密码登录', newStudentLogin.code === 0 && newStudentLogin.data.role === 'student');
const studentRows = await api('GET', '/admin/students?keyword=2024019999', undefined, token);
const testStudent = studentRows.data[0];
const reset = await api('POST', `/admin/students/${testStudent.id}/reset-password`, undefined, token);
check('重置密码', reset.code === 0 && reset.data.password === '123456');
const delStudent = await api('DELETE', `/admin/students/${testStudent.id}`, undefined, token);
check('删除学生（级联清理）', delStudent.code === 0);

/* 7. 总览导出与清理 */
const overviewCsv = await api('GET', '/admin/overview.csv', undefined, token);
check('总览 CSV 导出', overviewCsv.code === 0 && overviewCsv.text.includes('使用率'));
const delClass = await api('DELETE', `/admin/classes/${testClass.id}`, undefined, token);
check('删除空教学班', delClass.code === 0);
const delCourse = await api('DELETE', `/admin/courses/${testCourse.id}`, undefined, token);
check('删除无教学班的课程', delCourse.code === 0);

const failCount = results.filter(r => r.startsWith('FAIL')).length;
console.log(results.join('\n'));
console.log(`总计: ${results.length - failCount} PASS / ${failCount} FAIL`);
process.exit(failCount === 0 ? 0 : 1);
