<script setup>
import { useCatalogStore } from '../store/catalog';
import CourseCard from './CourseCard.vue';

const catalog = useCatalogStore();
</script>

<template>
  <section class="course-list">
    <div v-if="catalog.loading" class="empty">
      <b>课程加载中…</b>正在读取教学班数据
    </div>
    <div v-else-if="!catalog.visibleCourses.length" class="empty">
      <b>未找到符合条件的课程</b>可尝试重置查询条件、切换类别或移除筛选标签
    </div>
    <template v-else>
      <CourseCard v-for="item in catalog.visibleCourses" :key="item.courseId" :item="item" />
    </template>
  </section>
</template>
