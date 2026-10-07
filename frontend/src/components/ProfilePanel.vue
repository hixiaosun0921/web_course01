<script setup>
import { useUserStore } from '../store/user';

const user = useUserStore();
</script>

<template>
  <div class="profile-grid">
    <span class="p-label">学号</span><span>{{ user.user?.no }}</span>
    <span class="p-label">姓名</span><span>{{ user.user?.name }}</span>
  </div>
  <p class="profile-note">学院、专业、联系电话等字段待学生数据补充后展示与修改。</p>
</template>
