/*
 * 由仓库根目录的两个 txt 生成 data.sql（种子数据）
 * 用法：node backend/tools/generate-seed.mjs
 *
 * 说明：
 * - 教学班时间为模拟生成（txt 暂无时间列），生成规则与前端 mock 一致，确定可复现；
 *   以后 txt 补充时间/教室列后，改本脚本重新生成即可。
 * - 学生初始密码统一 123456（BCrypt 哈希写入）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const outFile = path.resolve(__dirname, '..', 'src', 'main', 'resources', 'db', 'data.sql');

const CATEGORY_MAP = {
  '计算机类': '主修课程',
  '思政类': '通识选修课',
  '英语': '英语分项',
  '体育': '体育分项'
};
const DAY_NAMES = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

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

function readTsv(fileName) {
  const file = path.join(repoRoot, fileName);
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    .map(line => line.split('\t').map(cell => cell.trim()));
}

const q = value => `'${String(value).replace(/'/g, "''")}'`;

/* ---------- 学生 ---------- */
const studentRows = readTsv('学生信息模拟.txt').slice(1).filter(row => row[0]);
const passwordHash = bcrypt.hashSync('123456', 10);
const studentValues = studentRows.map((row, index) =>
  `(${index + 1}, ${q(row[0])}, ${q(passwordHash)}, ${q(row[1] || row[0])})`);

/* ---------- 课程与教学班 ---------- */
const classRows = readTsv('教学班模拟.txt').slice(1).filter(row => row[0]);
const courseIndex = new Map();
const courses = [];
const classes = [];

classRows.forEach(row => {
  const [classNo, courseName, teacher, capacityText, creditText, typeText] = row;
  const baseNo = classNo.replace(/-\d+$/, '');
  const suffix = classNo.slice(baseNo.length + 1) || '01';

  if (!courseIndex.has(baseNo)) {
    courseIndex.set(baseNo, courses.length + 1);
    courses.push({
      id: courses.length + 1,
      courseNo: baseNo,
      name: courseName,
      credit: Number(creditText) || 0,
      category: CATEGORY_MAP[typeText] || typeText || '未分类'
    });
  }

  const rng = mulberry32(hashSeed(classNo));
  const day = 1 + Math.floor(rng() * 5);
  const start = 1 + Math.floor(rng() * 5) * 2;
  const end = start + 1;
  const capacity = Number(capacityText) || 0;
  const isFull = hashSeed(classNo) % 11 === 0;
  const ratio = isFull ? 1 : 0.55 + rng() * 0.4;
  const selected = Math.min(capacity, Math.max(0, Math.floor(capacity * ratio)));

  classes.push({
    id: classes.length + 1,
    courseId: courseIndex.get(baseNo),
    className: `${suffix} 班`,
    teacher: teacher || '待定',
    classTime: `${DAY_NAMES[day]} ${start}-${end} 节 · 1-16 周`,
    classroom: '未定',
    day,
    start,
    end,
    capacity,
    selected
  });
});

const courseValues = courses.map(c =>
  `(${c.id}, ${q(c.courseNo)}, ${q(c.name)}, ${c.credit}, ${q(c.category)})`);

const classValues = classes.map(c =>
  `(${c.id}, ${c.courseId}, ${q(c.className)}, ${q(c.teacher)}, ${q(c.classTime)}, ${q(c.classroom)}, `
  + `${c.day}, ${c.start}, ${c.end}, 1, 16, ${c.capacity}, ${c.selected})`);

const sql = `-- 由 backend/tools/generate-seed.mjs 自动生成，请勿手工修改
-- 数据来源：教学班模拟.txt（38 个教学班 / ${courses.length} 门课程）、学生信息模拟.txt（${studentRows.length} 名学生）
-- 学生初始密码统一为 123456（BCrypt）

INSERT INTO student (id, student_no, password, name) VALUES
${studentValues.join(',\n')}
ON CONFLICT (id) DO NOTHING;
-- 同步序列，避免后续自增主键冲突
SELECT setval(pg_get_serial_sequence('student', 'id'), (SELECT MAX(id) FROM student));

INSERT INTO course (id, course_no, name, credit, category) VALUES
${courseValues.join(',\n')}
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('course', 'id'), (SELECT MAX(id) FROM course));

INSERT INTO teaching_class (id, course_id, class_name, teacher, class_time, classroom, day_of_week, start_section, end_section, start_week, end_week, capacity, selected_count) VALUES
${classValues.join(',\n')}
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('teaching_class', 'id'), (SELECT MAX(id) FROM teaching_class));
`;

fs.writeFileSync(outFile, sql, 'utf8');
console.log(`已生成 ${outFile}`);
console.log(`课程 ${courses.length} 门，教学班 ${classes.length} 个，学生 ${studentRows.length} 名`);
console.log(`满员教学班：${classes.filter(c => c.selected >= c.capacity).length} 个`);
