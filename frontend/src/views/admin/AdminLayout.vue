<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/user';
import { useUiStore } from '../../store/ui';

const router = useRouter();
const user = useUserStore();
const ui = useUiStore();

const MENU = [
  { path: '/admin', label: '选课总览' },
  { path: '/admin/courses', label: '课程管理' },
  { path: '/admin/classes', label: '教学班管理' },
  { path: '/admin/students', label: '学生管理' },
  { path: '/admin/colleges', label: '学院管理' }
];

function logout() {
  ui.askConfirm('确定退出登录吗？', () => {
    user.logout();
    router.push('/login');
  });
}
</script>

<template>
  <div class="admin-wrap">
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">教务管理台<span class="term">学生选课系统 · 管理员入口</span></div>
        <div class="userbox">
          <span class="avatar">{{ user.user?.name?.slice(0, 1) }}</span>
          <span>{{ user.user?.name }} · {{ user.user?.no }}</span>
          <span class="logout" @click="logout">退出登录</span>
        </div>
      </div>
    </header>

    <div class="admin-body">
      <aside class="admin-side">
        <RouterLink v-for="item in MENU" :key="item.path" :to="item.path">{{ item.label }}</RouterLink>
      </aside>
      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
