<script setup>
import { computed } from 'vue';
import { useCatalogStore } from '../store/catalog';
import { useSelectionStore } from '../store/selection';
import ClassRow from './ClassRow.vue';

const props = defineProps({
  item: { type: Object, required: true }
});

const catalog = useCatalogStore();
const selection = useSelectionStore();

const open = computed(() => catalog.expanded.includes(props.item.courseId));
const picked = computed(() => props.item.classes.some(cls => selection.chosenSet.has(cls.classId)));
const waiting = computed(() => !picked.value && props.item.classes.some(cls => selection.waitlistMap.has(cls.classId)));
</script>

<template>
  <article class="course" :class="{ 'course--selected': picked }">
    <header class="course-head" @click="catalog.toggleExpand(item.courseId)">
      <span class="course-code">{{ item.courseId }}</span>
      <h3 class="course-name">{{ item.name }}</h3>
      <span class="course-meta">{{ item.credit }} 学分</span>
      <span class="meta-sep">·</span>
      <span class="course-meta">{{ item.classCount }} 个教学班</span>
      <span v-if="picked" class="badge badge--green">已选</span>
      <span v-else-if="waiting" class="badge badge--amber">候补中</span>
      <span v-else class="badge badge--gray">未选</span>
      <svg class="chev" :class="{ 'chev--open': open }" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </header>

    <div v-if="open" class="class-panel">
      <div class="class-head">
        <span></span><span>教学班</span><span>任课教师</span><span>上课时间</span>
        <span>上课地点</span><span>容量</span><span>余量</span><span>操作</span>
      </div>
      <ClassRow v-for="cls in item.classes" :key="cls.classId" :cls="cls" :course-name="item.name" />
    </div>
  </article>
</template>
