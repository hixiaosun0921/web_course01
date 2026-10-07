<script setup>
import { onMounted, ref } from 'vue';
import { adminApi, downloadCsv } from '../../api/admin';
import { toast } from '../../composables/toast';

const rows = ref([]);
const courses = ref([]);
const keyword = ref('');
const courseId = ref(0);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    rows.value = await adminApi.classes({
      keyword: keyword.value,
      courseId: courseId.value || undefined
    });
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    loading.value = false;
  }
}

async function loadCourses() {
  courses.value = await adminApi.courses('');
}

async function exportCsv() {
  const query = `?keyword=${encodeURIComponent(keyword.value || '')}`
    + (courseId.value ? `&courseId=${courseId.value}` : '');
  await downloadCsv(`/admin/overview.csv${query}`, 'overview.csv');
  toast('已导出选课总览', 'success');
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
    <h2 class="admin-title">选课总览</h2>
    <div class="admin-toolbar">
      <input v-model="keyword" placeholder="课程名 / 课程号 / 教师" @keydown.enter="load">
      <select v-model="courseId">
        <option :value="0">全部课程</option>
        <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <button class="btn btn--primary" type="button" @click="load">查询</button>
      <span class="spacer"></span>
      <button class="btn btn--ghost" type="button" @click="exportCsv">导出统计 CSV</button>
    </div>

    <div v-if="loading" class="admin-empty">加载中…</div>
    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>课程号</th><th>课程名</th><th>教学班</th><th>教师</th><th>上课时间</th>
          <th>已选 / 容量</th><th>余量</th><th>候补</th><th>使用率</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td class="num">{{ row.courseId }}</td>
          <td class="strong">{{ row.courseName }}</td>
          <td>{{ row.className }}</td>
          <td>{{ row.teacher }}</td>
          <td>{{ row.classTime }}</td>
          <td class="num">{{ row.selected }} / {{ row.capacity }}</td>
          <td class="num">{{ row.remaining }}</td>
          <td class="num">{{ row.waitCount }}</td>
          <td>
            <span class="usage">
              <span class="usage-bar"><i :class="usageClass(row.usage)" :style="{ width: `${Math.min(100, row.usage)}%` }"></i></span>
              <span class="num">{{ row.usage }}%</span>
            </span>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="9" class="admin-empty">没有符合条件的教学班</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
