<script setup>
import { computed } from 'vue';
import { useSelectionStore } from '../store/selection';
import { timeText } from '../utils/format';
import Timetable from './Timetable.vue';

const selection = useSelectionStore();
const classes = computed(() => selection.chosenClasses);
</script>

<template>
  <div class="panel-summary">
    已选 <b>{{ selection.credit }}</b> 学分 · <b>{{ selection.count }}</b> 门课程（学分要求 0 ~ 36）
  </div>

  <Timetable :classes="classes" />

  <div v-if="classes.length" class="panel-list">
    <div v-for="cls in classes" :key="cls.classId" class="panel-item panel-item--picked">
      <div class="panel-item-head">
        <span class="panel-item-title">《{{ cls.courseName }}》{{ cls.className }}</span>
        <span class="badge badge--green">已选</span>
        <span class="panel-item-actions"><span class="course-meta">{{ cls.credit }} 学分</span></span>
      </div>
      <div class="panel-item-meta">教师：{{ cls.teacher }} · {{ timeText(cls) }} · {{ cls.room }}</div>
    </div>
  </div>
  <div v-else class="panel-empty">本学期还没有已选课程</div>
</template>
