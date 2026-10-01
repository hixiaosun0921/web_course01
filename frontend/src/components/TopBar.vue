<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useUiStore } from '../store/ui';

const router = useRouter();
const user = useUserStore();
const ui = useUiStore();

function goTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function logout() {
  ui.askConfirm('确定退出登录吗？', () => {
    user.logout();
    router.push('/login');
  });
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner">
      <div class="brand">自主选课<span class="term">2026—2027 学年 第一学期</span></div>
      <nav class="topnav">
        <a class="active" href="#" @click.prevent="goTop">自主选课</a>
        <a href="#" @click.prevent="ui.openPanel('selected')">我的已选</a>
        <a href="#" @click.prevent="ui.openPanel('wish')">意向单</a>
        <a href="#" @click.prevent="ui.openPanel('profile')">个人资料</a>
      </nav>
      <div class="userbox">
        <span class="avatar">{{ user.student?.name?.slice(0, 1) }}</span>
        <span class="user-name">{{ user.student?.name }}</span>
        <span class="user-no">· {{ user.student?.studentNo }}</span>
        <span class="logout" @click="logout">退出登录</span>
      </div>
    </div>
  </header>
</template>
