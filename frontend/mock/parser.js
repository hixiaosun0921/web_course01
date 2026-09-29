import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DAY_NAMES = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
export const DEFAULT_WEEKS = { startWeek: 1, endWeek: 16 };

/* 课程类型 -> 界面类别（需求文档 4 个类别 Tab） */
export const CATEGORY_MAP = {
  '计算机类': '主修课程',
  '思政类': '通识选修课',
  '英语': '英语分项',
  '体育': '体育分项'
};

/* ---------- 稳定伪随机（同一教学班每次生成结果一致） ---------- */
function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 数据文件定位：兼容开发目录与部署目录 ---------- */
export function findFile(fileName) {
  const candidates = [
    path.join(__dirname, '..', '..', fileName),   // 仓库根目录（开发）
    path.join(process.cwd(), fileName),           // 启动目录
    path.join(__dirname, '..', fileName),         // frontend/（部署时 txt 与工程同放）
    path.join(__dirname, '..', 'data', fileName)  // frontend/data/（部署时集中放数据）
  ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

function readTsv(fileName) {
  const file = findFile(fileName);
  if (!file) throw new Error(`未找到数据文件：${fileName}（可放在仓库根目录或 frontend/ 目录）`);
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split('\t').map(cell => cell.trim()));
}

/* 解析学生：学号 姓名 */
export function loadStudents() {
  const rows = readTsv('学生信息模拟.txt');
  return rows.slice(1)
    .filter(row => row[0])
    .map(row => ({ studentNo: row[0], name: row[1] || row[0] }));
}

/* 解析教学班并按课程分组；上课时间与已选人数为模拟生成（txt 暂未提供） */
export function loadCourses() {
  const rows = readTsv('教学班模拟.txt');
  const courseMap = new Map();

  rows.slice(1).filter(row => row[0]).forEach(row => {
    const [classNo, courseName, teacher, capacityText, creditText, typeText] = row;
    if (!classNo) return;

    const baseNo = classNo.replace(/-\d+$/, '');
    const suffix = classNo.slice(baseNo.length + 1) || '01';

    if (!courseMap.has(baseNo)) {
      courseMap.set(baseNo, {
        courseId: baseNo,
        name: courseName,
        credit: Number(creditText) || 0,
        category: CATEGORY_MAP[typeText] || typeText || '未分类',
        sourceType: typeText || '',
        classes: []
      });
    }

    const rng = mulberry32(hashSeed(classNo));
    const day = 1 + Math.floor(rng() * 5);              // 周一 ~ 周五
    const start = 1 + Math.floor(rng() * 5) * 2;        // 第 1/3/5/7/9 节开始，连上 2 节
    const capacity = Number(capacityText) || 0;
    const isFull = hashSeed(classNo) % 11 === 0;        // 少量满员班，便于演示候补
    const ratio = isFull ? 1 : 0.55 + rng() * 0.4;
    const selected = Math.min(capacity, Math.max(0, Math.floor(capacity * ratio)));

    courseMap.get(baseNo).classes.push({
      classId: classNo,
      className: `${suffix} 班`,
      teacher: teacher || '待定',
      room: '未定',
      day,
      start,
      end: start + 1,
      startWeek: DEFAULT_WEEKS.startWeek,
      endWeek: DEFAULT_WEEKS.endWeek,
      capacity,
      selected,
      remaining: Math.max(0, capacity - selected)
    });
  });

  return Array.from(courseMap.values());
}

export function timeText(cls) {
  return `${DAY_NAMES[cls.day]} ${cls.start}-${cls.end} 节 · ${cls.startWeek}-${cls.endWeek} 周`;
}
