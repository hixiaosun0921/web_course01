<script setup>
import { computed } from 'vue';
import { DAY_NAMES } from '../utils/format';

const props = defineProps({
  classes: { type: Array, default: () => [] }
});

const TOTAL_SECTIONS = 12; // 按学校作息，可配置
const days = DAY_NAMES.slice(1, 8);

/* 有课时间段矩阵（FR-15：仅标记占用，不显示课程信息） */
const occupied = computed(() => {
  const matrix = Array.from({ length: TOTAL_SECTIONS + 1 }, () => Array(8).fill(false));
  props.classes.forEach(cls => {
    for (let section = cls.start; section <= cls.end; section += 1) {
      if (section >= 1 && section <= TOTAL_SECTIONS) matrix[section][cls.day] = true;
    }
  });
  return matrix;
});
</script>

<template>
  <div class="timetable">
    <p class="tt-title">周课表<span class="tt-legend"><i></i>有课</span></p>
    <div class="tt-grid">
      <div class="tt-corner"></div>
      <div v-for="name in days" :key="name" class="tt-day">{{ name }}</div>
      <template v-for="section in TOTAL_SECTIONS" :key="section">
        <div class="tt-sec">{{ section }}</div>
        <div v-for="day in 7" :key="day" class="tt-slot" :class="{ on: occupied[section][day] }"></div>
      </template>
    </div>
  </div>
</template>
