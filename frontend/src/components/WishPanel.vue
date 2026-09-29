<script setup>
import { computed } from 'vue';
import { useSelectionStore } from '../store/selection';
import { useCatalogStore } from '../store/catalog';
import { conflictOf } from '../utils/conflict';
import { timeText } from '../utils/format';

const selection = useSelectionStore();
const catalog = useCatalogStore();

const items = computed(() => selection.wishes.map(id => catalog.classMap.get(id)).filter(Boolean));

function stateOf(cls) {
  if (selection.chosenSet.has(cls.classId)) {
    return { badge: 'green', text: '已选', canSelect: false };
  }
  const position = selection.waitlistMap.get(cls.classId);
  if (position) {
    return { badge: 'amber', text: `候补中 · 第 ${position} 位`, canSelect: true };
  }
  if (conflictOf(cls, selection.chosenSet, catalog.classMap)) {
    return { badge: 'red', text: '时间冲突', canSelect: false };
  }
  if (cls.remaining <= 0) {
    return { badge: 'amber', text: '已满', canSelect: false };
  }
  return { badge: 'gray', text: `余 ${cls.remaining}`, canSelect: true };
}
</script>

<template>
  <div class="panel-summary">
    共收藏 <b>{{ items.length }}</b> 个教学班（上限 20 个）· 意向单不占容量，选课仍需通过校验
  </div>

  <div v-if="items.length" class="panel-list">
    <div v-for="cls in items" :key="cls.classId" class="panel-item">
      <div class="panel-item-head">
        <span class="panel-item-title">《{{ cls.courseName }}》{{ cls.className }}</span>
        <span class="badge" :class="`badge--${stateOf(cls).badge}`">{{ stateOf(cls).text }}</span>
        <span class="panel-item-actions">
          <button v-if="stateOf(cls).canSelect" class="btn" type="button" @click="selection.select(cls.classId)">
            选课
          </button>
          <button class="btn" type="button" @click="selection.toggleWish(cls.classId)">移除</button>
        </span>
      </div>
      <div class="panel-item-meta">教师：{{ cls.teacher }} · {{ timeText(cls) }} · {{ cls.room }}</div>
    </div>
  </div>
  <div v-else class="panel-empty">意向单还是空的，可点击教学班行中的星标收藏备选教学班</div>
</template>
