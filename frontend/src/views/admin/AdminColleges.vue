<script setup>
import { onMounted, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { toast } from '../../composables/toast';
import { useUiStore } from '../../store/ui';

const ui = useUiStore();
const rows = ref([]);
const form = ref(null);

async function load() {
  rows.value = await adminApi.colleges();
}

function openCreate() {
  form.value = { id: null, name: '' };
}

function openEdit(row) {
  form.value = { id: row.id, name: row.name };
}

async function save() {
  const data = { name: form.value.name };
  if (form.value.id) {
    await adminApi.updateCollege(form.value.id, data);
  } else {
    await adminApi.createCollege(data);
  }
  form.value = null;
  await load();
  toast('学院信息已保存', 'success');
}

function remove(row) {
  ui.askConfirm(`确定删除学院「${row.name}」吗？`, async () => {
    try {
      await adminApi.deleteCollege(row.id);
      await load();
      toast('学院已删除', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

onMounted(load);
</script>

<template>
  <section class="admin-card">
    <h2 class="admin-title">学院管理</h2>
    <div class="admin-toolbar">
      <span class="spacer"></span>
      <button class="btn btn--primary" type="button" @click="openCreate">新增学院</button>
    </div>

    <table class="admin-table">
      <thead>
        <tr><th>ID</th><th>学院名称</th><th>课程数</th><th>学生数</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td class="num">{{ row.id }}</td>
          <td class="strong">{{ row.name }}</td>
          <td class="num">{{ row.courseCount }}</td>
          <td class="num">{{ row.studentCount }}</td>
          <td>
            <span class="admin-actions">
              <button class="btn" type="button" @click="openEdit(row)">编辑</button>
              <button class="btn btn--danger" type="button" @click="remove(row)">删除</button>
            </span>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="5" class="admin-empty">暂无学院数据</td>
        </tr>
      </tbody>
    </table>

    <div v-if="form" class="modal-mask" @click.self="form = null">
      <div class="modal">
        <div class="modal-head">
          <h3 class="modal-title">{{ form.id ? '编辑学院' : '新增学院' }}</h3>
          <button class="modal-close" type="button" @click="form = null">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <span class="p-label">学院名称</span>
            <input v-model="form.name" placeholder="如：计算机学院">
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
