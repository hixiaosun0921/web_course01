<script setup>
import { toasts } from '../composables/toast';
</script>

<template>
  <div class="toast-wrap">
    <div v-for="item in toasts" :key="item.id" class="toast" :class="`toast--${item.type}`">{{ item.text }}</div>
  </div>
</template>
