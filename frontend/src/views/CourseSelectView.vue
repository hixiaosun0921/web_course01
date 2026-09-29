<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import TopBar from '../components/TopBar.vue';
import SearchBar from '../components/SearchBar.vue';
import FilterBar from '../components/FilterBar.vue';
import CreditBar from '../components/CreditBar.vue';
import CategoryTabs from '../components/CategoryTabs.vue';
import CourseList from '../components/CourseList.vue';
import SideRail from '../components/SideRail.vue';
import BatchBar from '../components/BatchBar.vue';
import { useCatalogStore } from '../store/catalog';
import { useSelectionStore } from '../store/selection';
import { clockText } from '../utils/format';

const catalog = useCatalogStore();
const selection = useSelectionStore();

const REFRESH_MS = 30000;
let timer = null;

const lastRefreshText = computed(() => (catalog.lastRefresh ? clockText(catalog.lastRefresh) : '--:--:--'));

function onVisibilityChange() {
  if (document.hidden) return;
  const last = catalog.lastRefresh ? catalog.lastRefresh.getTime() : 0;
  if (Date.now() - last > REFRESH_MS) catalog.refresh(false);
}

onMounted(async () => {
  await Promise.all([catalog.loadCourses(), selection.load()]);
  catalog.lastRefresh = new Date();
  timer = setInterval(() => {
    if (!document.hidden) catalog.refresh(false);
  }, REFRESH_MS);
  document.addEventListener('visibilitychange', onVisibilityChange);
});

onUnmounted(() => {
  clearInterval(timer);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});
</script>

<template>
  <div>
    <TopBar />
    <main class="page">
      <SearchBar />
      <p class="refresh-note">
        最后刷新：<span class="time">{{ lastRefreshText }}</span> · 每 30 秒自动刷新一次，余量以提交选课时服务端校验为准
      </p>
      <FilterBar />
      <CreditBar />
      <CategoryTabs />
      <CourseList />
    </main>
    <SideRail />
    <BatchBar />
  </div>
</template>
