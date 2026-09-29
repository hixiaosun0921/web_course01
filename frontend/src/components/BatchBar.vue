<script setup>
import { computed } from 'vue';
import { useSelectionStore } from '../store/selection';
import { useCatalogStore } from '../store/catalog';
import { useUiStore } from '../store/ui';

const selection = useSelectionStore();
const catalog = useCatalogStore();
const ui = useUiStore();

const credit = computed(() => selection.batch.reduce((sum, id) => {
  const cls = catalog.classMap.get(id);
  return sum + (cls ? cls.credit : 0);
}, 0));

function batchDrop() {
  ui.askConfirm(
    `确定退选勾选的 ${selection.batch.length} 个教学班吗？本次将退 ${credit.value} 学分。`,
    () => selection.batchDrop()
  );
}
</script>

<template>
  <div v-if="selection.batch.length" class="batch-bar">
    <span>
      已勾选 <span class="num">{{ selection.batch.length }}</span> 个教学班 · 共
      <span class="num">{{ credit }}</span> 学分
    </span>
    <button class="btn btn--danger" type="button" @click="batchDrop">批量退课</button>
    <button class="btn" type="button" @click="selection.clearBatch()">取消勾选</button>
  </div>
</template>
