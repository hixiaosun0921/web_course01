<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useSelectionStore } from '../store/selection';
import { pad } from '../utils/format';

const selection = useSelectionStore();

/* 本轮截止时间：演示用，从进入页面起算 2 天 06:12:45 */
const DEADLINE = Date.now() + ((2 * 24 + 6) * 3600 + 12 * 60 + 45) * 1000;
const now = ref(Date.now());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});
onUnmounted(() => clearInterval(timer));

const countdownText = computed(() => {
  const ms = DEADLINE - now.value;
  if (ms <= 0) return '本轮已截止';
  const total = Math.floor(ms / 1000);
  const day = Math.floor(total / 86400);
  const hour = Math.floor((total % 86400) / 3600);
  const minute = Math.floor((total % 3600) / 60);
  const second = total % 60;
  return `${day} 天 ${pad(hour)}:${pad(minute)}:${pad(second)}`;
});
</script>

<template>
  <section class="creditbar">
    <div class="item">
      <span class="round-chip">第 1 轮</span>
      <span class="label">距本轮截止</span>
      <span class="countdown">{{ countdownText }}</span>
    </div>
    <div class="item">
      <span class="label">学分要求</span>
      <span class="num">0 ~ 36</span>
    </div>
    <div class="item">
      <span class="label">已获得学分</span>
      <span class="num">0</span>
    </div>
    <div class="item">
      <span class="label">本学期已选</span>
      <span class="num">{{ selection.credit }}</span>
      <span class="label">学分 · {{ selection.count }} 门课程</span>
    </div>
  </section>
</template>
