<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { toast } from '../composables/toast';

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const account = ref('');
const password = ref('');
const submitting = ref(false);

async function submit() {
  if (!account.value.trim()) {
    toast('请输入学号或管理员账号', 'warn');
    return;
  }
  if (!password.value) {
    toast('请输入密码', 'warn');
    return;
  }
  submitting.value = true;
  try {
    await user.login(account.value.trim(), password.value);
    toast(`登录成功，欢迎回来，${user.user.name}`, 'success');
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '';
    const target = redirect && redirect.startsWith(user.isAdmin ? '/admin' : '/course-select')
      ? redirect
      : user.homePath;
    router.push(target);
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
      <div class="brand">选课系统<span class="term">2026—2027 学年 第一学期 · 学生 / 管理员入口</span></div>
      <form class="login-form" @submit.prevent="submit">
        <label class="login-field">学号 / 管理员账号
          <input v-model="account" type="text" autocomplete="username" placeholder="请输入学号或管理员账号">
        </label>
        <label class="login-field">密码
          <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入密码">
        </label>
        <button class="btn btn--primary login-submit" type="submit" :disabled="submitting">
          {{ submitting ? '登录中…' : '登 录' }}
        </button>
      </form>
      <p class="login-tip">
        学生：学号 2024010001 ~ 2024010040（任选，请各用不同学号）<br>
        管理员：admin · 密码均为 123456
      </p>
    </div>
  </div>
</template>
