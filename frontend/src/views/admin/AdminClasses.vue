<script setup>
import { onMounted, ref } from 'vue';
import { adminApi, downloadCsv } from '../../api/admin';
import { toast } from '../../composables/toast';
import { useUiStore } from '../../store/ui';

const ui = useUiStore();
const rows = ref([]);
const courses = ref([]);
const keyword = ref('');
const courseId = ref(0);
const form = ref(null);
const roster = ref(null);      // { classId, title, keyword, rows }
const DAY_NAMES = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function emptyForm() {
  return {
    id: null, courseId: courses.value[0]?.id ?? null, className: '', teacher: '',
    dayOfWeek: 1, startSection: 3, endSection: 4, startWeek: 1, endWeek: 16,
    classroom: '未定', capacity: 50
  };
}

async function load() {
  rows.value = await adminApi.classes({ keyword: keyword.value, courseId: courseId.value || undefined });
}

async function loadCourses() {
  courses.value = await adminApi.courses('');
}

function openCreate() {
  form.value = emptyForm();
}

function openEdit(row) {
  form.value = {
    id: row.id, courseId: null, courseLabel: `${row.courseName}（${row.courseId}）`,
    className: row.className, teacher: row.teacher,
    dayOfWeek: row.day, startSection: row.start, endSection: row.end,
    startWeek: row.startWeek, endWeek: row.endWeek, classroom: row.room, capacity: row.capacity
  };
}

async function save() {
  const data = {
    courseId: form.value.id ? undefined : form.value.courseId,
    className: form.value.className,
    teacher: form.value.teacher,
    dayOfWeek: Number(form.value.dayOfWeek),
    startSection: Number(form.value.startSection),
    endSection: Number(form.value.endSection),
    startWeek: Number(form.value.startWeek),
    endWeek: Number(form.value.endWeek),
    classroom: form.value.classroom,
    capacity: Number(form.value.capacity)
  };
  try {
    if (form.value.id) {
      await adminApi.updateClass(form.value.id, data);
    } else {
      await adminApi.createClass(data);
    }
    form.value = null;
    await load();
    toast('教学班已保存', 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
}

function remove(row) {
  ui.askConfirm(`确定删除《${row.courseName}》${row.className} 吗？已有选课或候补时无法删除。`, async () => {
    try {
      await adminApi.deleteClass(row.id);
      await load();
      toast('教学班已删除', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

async function openRoster(row) {
  roster.value = { classId: row.id, title: `《${row.courseName}》${row.className}`, keyword: '', rows: [] };
  await loadRoster();
}

async function loadRoster() {
  roster.value.rows = await adminApi.roster(roster.value.classId, roster.value.keyword);
}

async function exportRoster() {
  await downloadCsv(`/admin/classes/${roster.value.classId}/students.csv`, `class-${roster.value.classId}-students.csv`);
  toast('名单已导出', 'success');
}

function usageClass(usage) {
  return usage >= 100 ? 'lv-full' : usage >= 80 ? 'lv-mid' : '';
}

onMounted(async () => {
  await Promise.all([load(), loadCourses()]);
});
</script>

<template>
  <section class="admin-card">
    <h2 class="admin-title">教学班管理</h2>
    <div class="admin-toolbar">
      <input v-model="keyword" placeholder="课程名 / 课程号 / 教师" @keydown.enter="load">
      <select v-model="courseId">
        <option :value="0">全部课程</option>
        <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <button class="btn" type="button" @click="load">查询</button>
      <span class="spacer"></span>
      <button class="btn btn--primary" type="button" @click="openCreate">开设教学班</button>
    </div>

    <table class="admin-table">
      <thead>
        <tr>
          <th>课程</th><th>教学班</th><th>教师</th><th>上课时间</th><th>地点</th>
          <th>已选 / 容量</th><th>候补</th><th>使用率</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td class="strong">{{ row.courseName }}<br><span class="num">{{ row.courseId }}</span></td>
          <td>{{ row.className }}</td>
          <td>{{ row.teacher }}</td>
          <td>{{ row.classTime }}</td>
          <td>{{ row.room }}</td>
          <td class="num">{{ row.selected }} / {{ row.capacity }}</td>
          <td class="num">{{ row.waitCount }}</td>
          <td>
            <span class="usage">
              <span class="usage-bar"><i :class="usageClass(row.usage)" :style="{ width: `${Math.min(100, row.usage)}%` }"></i></span>
              <span class="num">{{ row.usage }}%</span>
            </span>
          </td>
          <td>
            <span class="admin-actions">
              <button class="btn" type="button" @click="openRoster(row)">名单</button>
              <button class="btn" type="button" @click="openEdit(row)">编辑</button>
              <button class="btn btn--danger" type="button" @click="remove(row)">删除</button>
            </span>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="9" class="admin-empty">没有符合条件的教学班</td>
        </tr>
      </tbody>
    </table>

    <!-- 新增 / 编辑教学班 -->
    <div v-if="form" class="modal-mask" @click.self="form = null">
      <div class="modal">
        <div class="modal-head">
          <h3 class="modal-title">{{ form.id ? '编辑教学班' : '开设教学班' }}</h3>
          <button class="modal-close" type="button" @click="form = null">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <span class="p-label">课程</span>
            <select v-if="!form.id" v-model="form.courseId">
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}（{{ c.courseNo }}）</option>
            </select>
            <input v-else :value="form.courseLabel" disabled>
            <span class="p-label">班名</span>
            <input v-model="form.className" placeholder="如：01 班" :disabled="!!form.id">
            <span class="p-label">教师</span>
            <input v-model="form.teacher" placeholder="任课教师姓名">
            <span class="p-label">星期</span>
            <select v-model="form.dayOfWeek">
              <option v-for="d in 7" :key="d" :value="d">{{ DAY_NAMES[d] }}</option>
            </select>
            <span class="p-label">节次</span>
            <span class="admin-actions">
              <select v-model="form.startSection">
                <option v-for="s in SECTIONS" :key="s" :value="s">{{ s }}</option>
              </select>
              <span>—</span>
              <select v-model="form.endSection">
                <option v-for="s in SECTIONS" :key="s" :value="s">{{ s }}</option>
              </select>
            </span>
            <span class="p-label">周次</span>
            <span class="admin-actions">
              <input v-model="form.startWeek" type="number" min="1" max="20" style="width:80px">
              <span>—</span>
              <input v-model="form.endWeek" type="number" min="1" max="20" style="width:80px">
            </span>
            <span class="p-label">地点</span>
            <input v-model="form.classroom" placeholder="如：三教 305">
            <span class="p-label">容量</span>
            <input v-model="form.capacity" type="number" min="0">
          </div>
          <p class="form-tip">修改容量不能小于当前已选人数；已有学生选课时修改时间或地点请谨慎。</p>
        </div>
        <div class="modal-foot">
          <button class="btn" type="button" @click="form = null">取消</button>
          <button class="btn btn--primary" type="button" @click="save">保存</button>
        </div>
      </div>
    </div>

    <!-- 选课名单 -->
    <div v-if="roster" class="modal-mask" @click.self="roster = null">
      <div class="modal">
        <div class="modal-head">
          <h3 class="modal-title">选课名单 · {{ roster.title }}</h3>
          <button class="modal-close" type="button" @click="roster = null">×</button>
        </div>
        <div class="modal-body">
          <div class="admin-toolbar">
            <input v-model="roster.keyword" placeholder="学号 / 姓名" @keydown.enter="loadRoster">
            <button class="btn" type="button" @click="loadRoster">搜索</button>
            <span class="spacer"></span>
            <button class="btn btn--ghost" type="button" @click="exportRoster">导出 CSV</button>
          </div>
          <table class="admin-table">
            <thead>
              <tr><th>学号</th><th>姓名</th><th>专业</th><th>年级</th><th>选课时间</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in roster.rows" :key="row.studentId">
                <td class="num">{{ row.studentNo }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.major || '—' }}</td>
                <td>{{ row.grade || '—' }}</td>
                <td>{{ (row.selectTime || '').replace('T', ' ').slice(0, 19) }}</td>
              </tr>
              <tr v-if="!roster.rows.length">
                <td colspan="5" class="admin-empty">暂无学生选课</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-foot">
          <button class="btn" type="button" @click="roster = null">关闭</button>
        </div>
      </div>
    </div>
  </section>
</template>
