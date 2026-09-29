import { loadStudents, loadCourses, findFile, timeText } from './parser.js';

export const CREDIT_MAX = 36;     // 学分上限（BR-01）
export const WISH_MAX = 20;       // 意向单上限（BR-09）
export const PASSWORD = '123456'; // 演示统一密码（学生数据暂无密码列）

/* 业务异常：code 与《系统设计文档》错误码一致 */
export class BusinessError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

let state = {};

export function loadData() {
  const students = loadStudents();
  const courses = loadCourses();
  state = {
    students,
    studentMap: new Map(students.map(s => [s.studentNo, s])),
    courses,
    selections: new Map(),  // studentNo -> Set(classId)
    waitlists: new Map(),   // studentNo -> Map(classId, position)
    wishes: new Map()       // studentNo -> Set(classId)
  };
  return state;
}

export function reloadData() {
  loadData();
}

export function dataFilePaths() {
  return [findFile('学生信息模拟.txt'), findFile('教学班模拟.txt')].filter(Boolean);
}

loadData();

/* ---------- 内部工具 ---------- */
function allClasses() {
  return state.courses.flatMap(course => course.classes);
}

function findClass(classId) {
  for (const course of state.courses) {
    const cls = course.classes.find(item => item.classId === classId);
    if (cls) return { course, cls };
  }
  return null;
}

function chosenSet(studentNo) {
  if (!state.selections.has(studentNo)) state.selections.set(studentNo, new Set());
  return state.selections.get(studentNo);
}

function waitMap(studentNo) {
  if (!state.waitlists.has(studentNo)) state.waitlists.set(studentNo, new Map());
  return state.waitlists.get(studentNo);
}

function wishSet(studentNo) {
  if (!state.wishes.has(studentNo)) state.wishes.set(studentNo, new Set());
  return state.wishes.get(studentNo);
}

function selectedCredit(studentNo) {
  let credit = 0;
  chosenSet(studentNo).forEach(classId => {
    const found = findClass(classId);
    if (found) credit += found.course.credit;
  });
  return credit;
}

function hasConflict(a, b) {
  return a.day === b.day
    && a.start <= b.end && a.end >= b.start
    && a.startWeek <= b.endWeek && a.endWeek >= b.startWeek;
}

function conflictFor(studentNo, cls) {
  const chosen = chosenSet(studentNo);
  for (const classId of chosen) {
    const found = findClass(classId);
    if (found && found.cls.classId !== cls.classId && hasConflict(found.cls, cls)) {
      return { ...found.cls, courseName: found.course.name };
    }
  }
  return null;
}

function chosenCount(classId) {
  let count = 0;
  state.selections.forEach(set => {
    if (set.has(classId)) count += 1;
  });
  return count;
}

function availabilityOf(cls) {
  return { classId: cls.classId, selected: cls.selected, remaining: Math.max(0, cls.capacity - cls.selected) };
}

function selectionState(classId) {
  const found = findClass(classId);
  return {
    classId,
    selected: found ? found.cls.selected : 0,
    remaining: found ? Math.max(0, found.cls.capacity - found.cls.selected) : 0
  };
}

/* ---------- 查询 ---------- */
export function findStudent(studentNo) {
  return state.studentMap.get(studentNo) || null;
}

export function login({ studentNo, password }) {
  const no = String(studentNo || '').trim();
  const student = state.studentMap.get(no);
  if (!student || password !== PASSWORD) throw new BusinessError(1002, '学号或密码错误');
  return { token: student.studentNo, student: { studentNo: student.studentNo, name: student.name } };
}

export function listCourses() {
  return state.courses;
}

export function availability() {
  return allClasses().map(availabilityOf);
}

/* 模拟其他学生选退课引起的余量波动（BR-07） */
export function refreshAvailability() {
  allClasses().forEach(cls => {
    if (Math.random() > 0.3) return;
    const delta = Math.random() < 0.5 ? 1 : -1;
    const actual = chosenCount(cls.classId);
    cls.selected = Math.min(cls.capacity, Math.max(actual, cls.selected + delta));
    cls.remaining = Math.max(0, cls.capacity - cls.selected);
  });
  return availability();
}

export function getSelections(studentNo) {
  const chosen = chosenSet(studentNo);
  const list = [];
  chosen.forEach(classId => {
    const found = findClass(classId);
    if (!found) return;
    const { course, cls } = found;
    list.push({
      classId,
      courseId: course.courseId,
      courseName: course.name,
      className: cls.className,
      teacher: cls.teacher,
      room: cls.room,
      credit: course.credit,
      category: course.category,
      day: cls.day,
      start: cls.start,
      end: cls.end,
      startWeek: cls.startWeek,
      endWeek: cls.endWeek,
      timeText: timeText(cls)
    });
  });
  return {
    classIds: Array.from(chosen),
    credit: selectedCredit(studentNo),
    count: list.length,
    list
  };
}

export function getWaitlist(studentNo) {
  const map = waitMap(studentNo);
  return { list: Array.from(map, ([classId, position]) => ({ classId, position })) };
}

export function getWishes(studentNo) {
  return { classIds: Array.from(wishSet(studentNo)) };
}

/* ---------- 选课 / 退课（FR-06 / FR-07） ---------- */
export function select(studentNo, classId) {
  const found = findClass(classId);
  if (!found) throw new BusinessError(2001, '教学班不存在');
  const { course, cls } = found;
  const chosen = chosenSet(studentNo);

  if (chosen.has(classId)) throw new BusinessError(2002, '已选该教学班');
  const sameCourse = course.classes.find(item => chosen.has(item.classId));
  if (sameCourse) {
    throw new BusinessError(2002, `已选《${course.name}》${sameCourse.className}，同一课程只能选一个教学班`);
  }
  if (cls.selected >= cls.capacity) throw new BusinessError(2003, '该教学班已满，可加入候补');

  const conflict = conflictFor(studentNo, cls);
  if (conflict) {
    throw new BusinessError(2004, `与已选《${conflict.courseName}》${conflict.className}（${timeText(conflict)}）时间冲突`);
  }

  const credit = selectedCredit(studentNo);
  if (credit + course.credit > CREDIT_MAX) {
    throw new BusinessError(2005, `超出学分上限 ${CREDIT_MAX} 学分，当前已选 ${credit} 学分`);
  }

  chosen.add(classId);
  wishSet(studentNo).delete(classId);
  cls.selected += 1;
  cls.remaining = Math.max(0, cls.capacity - cls.selected);

  return { ...selectionState(classId), credit: credit + course.credit, count: chosen.size };
}

export function drop(studentNo, classId) {
  const chosen = chosenSet(studentNo);
  if (!chosen.has(classId)) throw new BusinessError(2006, '未选该教学班');
  chosen.delete(classId);

  const found = findClass(classId);
  if (found) {
    found.cls.selected = Math.max(0, found.cls.selected - 1);
    found.cls.remaining = Math.max(0, found.cls.capacity - found.cls.selected);
  }

  return { ...selectionState(classId), credit: selectedCredit(studentNo), count: chosen.size };
}

/* 批量退课：逐条执行并返回明细（BR-10） */
export function batchCancel(studentNo, classIds) {
  const results = (classIds || []).map(classId => {
    try {
      drop(studentNo, classId);
      return { teachingClassId: classId, success: true };
    } catch (err) {
      return { teachingClassId: classId, success: false, reason: err.message };
    }
  });
  return { results, credit: selectedCredit(studentNo), count: chosenSet(studentNo).size };
}

/* ---------- 候补（FR-14） ---------- */
export function joinWaitlist(studentNo, classId) {
  const found = findClass(classId);
  if (!found) throw new BusinessError(2001, '教学班不存在');
  const { course, cls } = found;
  const chosen = chosenSet(studentNo);
  const wait = waitMap(studentNo);

  if (chosen.has(classId)) throw new BusinessError(2002, '已选该教学班，无需候补');
  if (wait.has(classId)) throw new BusinessError(3001, '已在候补队列中');
  const sameCourse = course.classes.find(item => chosen.has(item.classId));
  if (sameCourse) {
    throw new BusinessError(2002, `已选《${course.name}》${sameCourse.className}，同一课程只能选一个教学班`);
  }
  const conflict = conflictFor(studentNo, cls);
  if (conflict) {
    throw new BusinessError(2004, `与已选《${conflict.courseName}》${conflict.className}（${timeText(conflict)}）时间冲突`);
  }
  if (selectedCredit(studentNo) + course.credit > CREDIT_MAX) {
    throw new BusinessError(2005, `超出学分上限 ${CREDIT_MAX} 学分`);
  }
  if (cls.selected < cls.capacity) throw new BusinessError(2007, '该教学班尚有余量，请直接选课');

  const position = wait.size + 1;
  wait.set(classId, position);
  return { classId, position };
}

export function leaveWaitlist(studentNo, classId) {
  const wait = waitMap(studentNo);
  if (!wait.has(classId)) throw new BusinessError(3002, '候补不存在或已失效');
  wait.delete(classId);
  return { classId };
}

/* ---------- 意向单（FR-13） ---------- */
export function addWish(studentNo, classId) {
  if (!findClass(classId)) throw new BusinessError(2001, '教学班不存在');
  const wishes = wishSet(studentNo);
  if (!wishes.has(classId)) {
    if (wishes.size >= WISH_MAX) throw new BusinessError(4001, `意向单最多收藏 ${WISH_MAX} 个教学班`);
    wishes.add(classId);
  }
  return { classIds: Array.from(wishes) };
}

export function removeWish(studentNo, classId) {
  wishSet(studentNo).delete(classId);
  return { classIds: Array.from(wishSet(studentNo)) };
}
