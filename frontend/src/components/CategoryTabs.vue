<script setup>
import { useCatalogStore } from '../store/catalog';

const catalog = useCatalogStore();
const CATEGORIES = ['主修课程', '通识选修课', '体育分项', '英语分项'];
</script>

<template>
  <nav class="tabsbar">
    <button
      v-for="name in CATEGORIES"
      :key="name"
      class="tab"
      :class="{ 'tab--active': catalog.filters.category === name }"
      type="button"
      @click="catalog.filters.category = name"
    >
      {{ name }}
    </button>
    <div class="legend">
      <span><span class="dot dot--plain"></span>未选</span>
      <span><span class="dot dot--green"></span>已选</span>
      <span><span class="dot dot--red"></span>时间冲突</span>
      <span><span class="dot dot--amber"></span>已满 · 可候补</span>
      <span class="expand-all" @click="catalog.toggleExpandAll()">
        {{ catalog.allVisibleExpanded ? '全部收起' : '全部展开' }}
      </span>
    </div>
  </nav>
</template>
