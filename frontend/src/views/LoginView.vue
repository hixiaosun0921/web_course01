<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { toast } from '../composables/toast';

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const studentNo = ref('');
const password = ref('');
const submitting = ref(false);

async function submit() {
  if (!studentNo.value.trim()) {
    toast('请输入学号', 'warn');
    return;
  }
  if (!password.value) {
    toast('请输入密码', 'warn');
    return;
  }
  submitting.value = true;
  try {
    await user.login(studentNo.value.trim(), password.value);
    toast(`登录成功，欢迎回来，${user.student.name}`, 'success');
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/course-select';
    router.push(redirect);
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <div class="brand">自主选课<span class="term">2026—2027 学年 第一学期 · 学生选课系统</span></div>
      <form class="login-form" @submit.prevent="submit">
        <label class="login-field">学号
          <input v-model="studentNo" type="text" autocomplete="username" placeholder="请输入学号">
        </label>
        <label class="login-field">密码
          <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入密码">
        </label>
        <button class="btn btn--primary login-submit" type="submit" :disabled="submitting">
          {{ submitting ? '登录中…' : '登 录' }}
        </button>
      </form>
      <p class="login-tip">演示账号：学号 2024010001，密码 123456（所有学生通用）</p>
    </div>
  </div>
</template>
