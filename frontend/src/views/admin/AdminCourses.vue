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
const CATEGORIES = ['主修课程', '通识选修课', '英语分项', '体育分项'];

async function load() {
  rows.value = await adminApi.courses(keyword.value);
}

async function loadColleges() {
  colleges.value = await adminApi.colleges();
}

function openCreate() {
  form.value = {
    id: null, courseNo: '', name: '', credit: 2,
    category: '主修课程', collegeId: colleges.value[0]?.id ?? null
  };
}

function openEdit(row) {
  form.value = {
    id: row.id, courseNo: row.courseNo, name: row.name,
    credit: Number(row.credit), category: row.category, collegeId: row.collegeId
  };
}

async function save() {
  const data = {
    courseNo: form.value.courseNo,
    name: form.value.name,
    credit: Number(form.value.credit),
    category: form.value.category,
    collegeId: form.value.collegeId
  };
  try {
    if (form.value.id) {
      await adminApi.updateCourse(form.value.id, data);
    } else {
      await adminApi.createCourse(data);
    }
    form.value = null;
    await load();
    toast('课程已保存', 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
}

function remove(row) {
  ui.askConfirm(`确定删除课程「${row.name}」吗？存在教学班时将无法删除。`, async () => {
    try {
      await adminApi.deleteCourse(row.id);
      await load();
      toast('课程已删除', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

onMounted(async () => {
  await Promise.all([load(), loadColleges()]);
});
</script>

<template>
  <section class="admin-card">
    <h2 class="admin-title">课程管理</h2>
    <div class="admin-toolbar">
      <input v-model="keyword" placeholder="课程号 / 课程名" @keydown.enter="load">
      <button class="btn" type="button" @click="load">查询</button>
      <span class="spacer"></span>
      <button class="btn btn--primary" type="button" @click="openCreate">新增课程</button>
    </div>

    <table class="admin-table">
      <thead>
        <tr>
          <th>课程号</th><th>课程名</th><th>学分</th><th>类别</th>
          <th>开课学院</th><th>教学班数</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td class="num">{{ row.courseNo }}</td>
          <td class="strong">{{ row.name }}</td>
          <td class="num">{{ row.credit }}</td>
          <td>{{ row.category }}</td>
          <td>{{ row.collegeName || '—' }}</td>
          <td class="num">{{ row.classCount }}</td>
          <td>
            <span class="admin-actions">
              <button class="btn" type="button" @click="openEdit(row)">编辑</button>
              <button class="btn btn--danger" type="button" @click="remove(row)">删除</button>
            </span>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="7" class="admin-empty">没有符合条件的课程</td>
        </tr>
      </tbody>
    </table>

    <div v-if="form" class="modal-mask" @click.self="form = null">
      <div class="modal">
        <div class="modal-head">
          <h3 class="modal-title">{{ form.id ? '编辑课程' : '新增课程' }}</h3>
          <button class="modal-close" type="button" @click="form = null">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <span class="p-label">课程号</span>
            <input v-model="form.courseNo" placeholder="如：CS009">
            <span class="p-label">课程名</span>
            <input v-model="form.name" placeholder="如：编译原理">
            <span class="p-label">学分</span>
            <input v-model="form.credit" type="number" min="0.5" step="0.5">
            <span class="p-label">类别</span>
            <select v-model="form.category">
              <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
            <span class="p-label">开课学院</span>
            <select v-model="form.collegeId">
              <option :value="null">未指定</option>
              <option v-for="c in colleges" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" type="button" @click="form = null">取消</button>
          <button class="btn btn--primary" type="button" @click="save">保存</button>
        </div>
      </div>
    </div>
  </section>
</template>
