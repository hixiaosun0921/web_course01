<script setup>
import { onMounted, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { toast } from '../../composables/toast';
import { useUiStore } from '../../store/ui';

const ui = useUiStore();
const rows = ref([]);
const colleges = ref([]);
const keyword = ref('');
const form = ref(null);

/* 代选退课 */
const delegate = ref(null);   // { student, selections: [], keyword, results: [] }

async function load() {
  rows.value = await adminApi.students(keyword.value);
}

async function loadColleges() {
  colleges.value = await adminApi.colleges();
}

function openCreate() {
  form.value = {
    id: null, studentNo: '', name: '', gender: '男', major: '', grade: '',
    phone: '', email: '', collegeId: colleges.value[0]?.id ?? null
  };
}

function openEdit(row) {
  form.value = {
    id: row.id, studentNo: row.studentNo, name: row.name, gender: row.gender || '男',
    major: row.major || '', grade: row.grade || '', phone: row.phone || '',
    email: row.email || '', collegeId: row.collegeId
  };
}

async function save() {
  const data = {
    studentNo: form.value.studentNo,
    name: form.value.name,
    gender: form.value.gender,
    major: form.value.major,
    grade: form.value.grade,
    phone: form.value.phone,
    email: form.value.email,
    collegeId: form.value.collegeId
  };
  try {
    if (form.value.id) {
      await adminApi.updateStudent(form.value.id, data);
    } else {
      await adminApi.createStudent(data);
    }
    form.value = null;
    await load();
    toast('学生信息已保存', 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
}

function resetPassword(row) {
  ui.askConfirm(`确定将「${row.name}」的密码重置为 123456 吗？`, async () => {
    try {
      await adminApi.resetPassword(row.id);
      toast('密码已重置为 123456', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

function remove(row) {
  ui.askConfirm(`确定删除学生「${row.name}」吗？其选课、意向单、候补记录将一并清理。`, async () => {
    try {
      await adminApi.deleteStudent(row.id);
      await load();
      toast('学生已删除', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

/* ---------- 代选退课 ---------- */

async function openDelegate(row) {
  delegate.value = { student: row, selections: [], keyword: '', results: [] };
  await Promise.all([loadSelections(), searchClasses()]);
}

async function loadSelections() {
  const data = await adminApi.studentSelections(delegate.value.student.id);
  delegate.value.selections = data.list;
}

async function searchClasses() {
  delegate.value.results = await adminApi.classes({ keyword: delegate.value.keyword });
}

async function doSelect(cls) {
  try {
    await adminApi.adminSelect({ studentId: delegate.value.student.id, teachingClassId: cls.id });
    await Promise.all([loadSelections(), searchClasses()]);
    await load();
    toast(`已为 ${delegate.value.student.name} 选上《${cls.courseName}》${cls.className}`, 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function doDrop(item) {
  try {
    await adminApi.adminDrop(delegate.value.student.id, item.classId);
    await Promise.all([loadSelections(), searchClasses()]);
    await load();
    toast(`已退选《${item.courseName}》${item.className}`, 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
}

onMounted(async () => {
  await Promise.all([load(), loadColleges()]);
});
</script>

<template>
  <section class="admin-card">
    <h2 class="admin-title">学生管理</h2>
    <div class="admin-toolbar">
      <input v-model="keyword" placeholder="学号 / 姓名" @keydown.enter="load">
      <button class="btn" type="button" @click="load">查询</button>
      <span class="spacer"></span>
      <button class="btn btn--primary" type="button" @click="openCreate">新增学生</button>
    </div>

    <table class="admin-table">
      <thead>
        <tr>
          <th>学号</th><th>姓名</th><th>性别</th><th>学院</th><th>专业</th>
          <th>年级</th><th>已选课程</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td class="num">{{ row.studentNo }}</td>
          <td class="strong">{{ row.name }}</td>
          <td>{{ row.gender || '—' }}</td>
          <td>{{ row.collegeName || '—' }}</td>
          <td>{{ row.major || '—' }}</td>
          <td>{{ row.grade || '—' }}</td>
          <td class="num">{{ row.selectionCount }}</td>
          <td>
            <span class="admin-actions">
              <button class="btn" type="button" @click="openDelegate(row)">代选退课</button>
              <button class="btn" type="button" @click="openEdit(row)">编辑</button>
              <button class="btn" type="button" @click="resetPassword(row)">重置密码</button>
              <button class="btn btn--danger" type="button" @click="remove(row)">删除</button>
            </span>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="8" class="admin-empty">没有符合条件的学生</td>
        </tr>
      </tbody>
    </table>

    <!-- 新增 / 编辑学生 -->
    <div v-if="form" class="modal-mask" @click.self="form = null">
      <div class="modal">
        <div class="modal-head">
          <h3 class="modal-title">{{ form.id ? '编辑学生' : '新增学生' }}</h3>
          <button class="modal-close" type="button" @click="form = null">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <span class="p-label">学号</span>
            <input v-model="form.studentNo" placeholder="如：2024010041" :disabled="!!form.id">
            <span class="p-label">姓名</span>
            <input v-model="form.name">
            <span class="p-label">性别</span>
            <select v-model="form.gender">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
            <span class="p-label">学院</span>
            <select v-model="form.collegeId">
              <option :value="null">未指定</option>
              <option v-for="c in colleges" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <span class="p-label">专业</span>
            <input v-model="form.major">
            <span class="p-label">年级</span>
            <input v-model="form.grade" placeholder="如：2024 级">
            <span class="p-label">电话</span>
            <input v-model="form.phone">
            <span class="p-label">邮箱</span>
            <input v-model="form.email">
          </div>
          <p class="form-tip">新增学生的初始密码为 123456；学号创建后不可修改。</p>
        </div>
        <div class="modal-foot">
          <button class="btn" type="button" @click="form = null">取消</button>
          <button class="btn btn--primary" type="button" @click="save">保存</button>
        </div>
      </div>
    </div>

    <!-- 代选退课 -->
    <div v-if="delegate" class="modal-mask" @click.self="delegate = null">
      <div class="modal">
        <div class="modal-head">
          <h3 class="modal-title">代选退课 · {{ delegate.student.name }}（{{ delegate.student.studentNo }}）</h3>
          <button class="modal-close" type="button" @click="delegate = null">×</button>
        </div>
        <div class="modal-body">
          <h4 class="admin-title">已选课程（{{ delegate.selections.length }}）</h4>
          <table class="admin-table">
            <thead>
              <tr><th>课程</th><th>教学班</th><th>教师</th><th>上课时间</th><th>学分</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in delegate.selections" :key="item.classId">
                <td class="strong">{{ item.courseName }}</td>
                <td>{{ item.className }}</td>
                <td>{{ item.teacher }}</td>
                <td>{{ item.timeText }}</td>
                <td class="num">{{ item.credit }}</td>
                <td>
                  <span class="admin-actions">
                    <button class="btn btn--danger" type="button" @click="doDrop(item)">退课</button>
                  </span>
                </td>
              </tr>
              <tr v-if="!delegate.selections.length">
                <td colspan="6" class="admin-empty">该学生暂未选课</td>
              </tr>
            </tbody>
          </table>

          <h4 class="admin-title" style="margin-top:18px">添加选课</h4>
          <div class="admin-toolbar">
            <input v-model="delegate.keyword" placeholder="课程名 / 课程号 / 教师" @keydown.enter="searchClasses">
            <button class="btn" type="button" @click="searchClasses">搜索教学班</button>
          </div>
          <table class="admin-table">
            <thead>
              <tr><th>课程</th><th>教学班</th><th>教师</th><th>上课时间</th><th>余量</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="cls in delegate.results" :key="cls.id">
                <td class="strong">{{ cls.courseName }}</td>
                <td>{{ cls.className }}</td>
                <td>{{ cls.teacher }}</td>
                <td>{{ cls.classTime }}</td>
                <td class="num">余 {{ cls.remaining }}</td>
                <td>
                  <span class="admin-actions">
                    <button class="btn" type="button" :disabled="cls.remaining <= 0" @click="doSelect(cls)">选课</button>
                  </span>
                </td>
              </tr>
              <tr v-if="!delegate.results.length">
                <td colspan="6" class="admin-empty">没有符合条件的教学班</td>
              </tr>
            </tbody>
          </table>
          <p class="form-tip">代选退课与学生自助操作执行同一套校验（重复、容量、时间冲突、学分上限）。</p>
        </div>
        <div class="modal-foot">
          <button class="btn" type="button" @click="delegate = null">关闭</button>
        </div>
      </div>
    </div>
  </section>
</template>
