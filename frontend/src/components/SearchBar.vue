<script setup>
import { ref } from 'vue';
import { useCatalogStore } from '../store/catalog';
import { toast } from '../composables/toast';

const catalog = useCatalogStore();
const input = ref(catalog.filters.keyword);

function search() {
  catalog.filters.keyword = input.value;
  if (!catalog.visibleCourses.length) toast('未找到符合条件的课程', 'warn');
}

function reset() {
  input.value = '';
  catalog.resetFilters();
  toast('已重置查询条件', 'info');
}
</script>

<template>
  <section class="searchbar">
    <input
      v-model="input"
      class="search-input"
      type="text"
      autocomplete="off"
      placeholder="请输入课程号、课程名称或教学班名称查询"
      @keydown.enter="search"
    >
    <div class="search-actions">
      <button class="btn btn--primary" type="button" @click="search">查询</button>
      <button class="btn" type="button" @click="reset">重置</button>
      <button class="btn btn--ghost" type="button" @click="catalog.refresh(true)">↻ 刷新余量</button>
    </div>
  </section>
</template>
