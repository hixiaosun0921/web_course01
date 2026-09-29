<script setup>
import { computed } from 'vue';
import { useSelectionStore } from '../store/selection';
import { useUiStore } from '../store/ui';
import { timeText } from '../utils/format';

const props = defineProps({
  cls: { type: Object, required: true },
  courseName: { type: String, default: '' }
});

const selection = useSelectionStore();
const ui = useUiStore();

const picked = computed(() => selection.chosenSet.has(props.cls.classId));
const waiting = computed(() => selection.waitlistMap.has(props.cls.classId));
const conflict = computed(() => (!picked.value && !waiting.value ? props.cls.conflict : null));
const wished = computed(() => selection.wishSet.has(props.cls.classId));
const checked = computed(() => selection.batch.includes(props.cls.classId));

const percent = computed(() => Math.min(100, Math.round((props.cls.selected / props.cls.capacity) * 100)));
const levelClass = computed(() => (percent.value >= 100 ? 'lv-full' : percent.value >= 80 ? 'lv-mid' : ''));
const remainClass = computed(() => (props.cls.remaining <= 0 ? 'remain--full' : props.cls.remaining <= 3 ? 'remain--low' : ''));
const remainText = computed(() => (props.cls.remaining <= 0 ? '已满' : `余 ${props.cls.remaining}`));
const waitPosition = computed(() => selection.waitlistMap.get(props.cls.classId));

function select() {
  selection.select(props.cls.classId);
}

function drop() {
  ui.askConfirm(
    `确定退选《${props.courseName}》${props.cls.className}（${timeText(props.cls)}）吗？退课后名额将释放给候补队列。`,
    () => selection.drop(props.cls.classId)
  );
}

function wait() {
  selection.joinWaitlist(props.cls.classId);
}

function toggleCheck(event) {
  selection.toggleBatch(props.cls.classId, event.target.checked);
}
</script>

<template>
  <div
    class="class-row"
    :class="{
      'class-row--picked': picked,
      'class-row--conflict': conflict,
      'class-row--wait': waiting
    }"
  >
    <span class="cls-check">
      <input v-if="picked" type="checkbox" :checked="checked" @change="toggleCheck">
    </span>
    <span class="cls-name">
      {{ cls.className }}
      <span v-if="waiting" class="badge badge--amber">候补中 · 第 {{ waitPosition }} 位</span>
    </span>
    <span class="cls-cell">{{ cls.teacher }}</span>
    <span class="cls-cell cls-time">
      {{ timeText(cls) }}
      <span v-if="conflict" class="conflict-note">冲突</span>
    </span>
    <span class="cls-cell">{{ cls.room }}</span>
    <span class="cap">
      <span class="cap-bar"><i :class="levelClass" :style="{ width: `${percent}%` }"></i></span>
      <span class="cap-num">{{ cls.selected }} / {{ cls.capacity }}</span>
    </span>
    <span class="remain" :class="remainClass">{{ remainText }}</span>
    <span class="class-actions">
      <button
        v-if="!picked"
        class="star-btn"
        :class="{ 'is-on': wished }"
        type="button"
        :title="wished ? '移出意向单' : '加入意向单'"
        @click="selection.toggleWish(cls.classId)"
      >
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
          <path d="M10 2.7l2.25 4.6 5.05.72-3.65 3.56.86 5.02L10 14.23l-4.51 2.37.86-5.02L2.7 8.02l5.05-.72z" />
        </svg>
      </button>
      <button v-if="picked" class="btn btn--danger" type="button" @click="drop">退课</button>
      <button v-else-if="waiting" class="btn btn--warn" type="button" @click="selection.leaveWaitlist(cls.classId)">
        退出候补
      </button>
      <button v-else-if="conflict" class="btn" type="button" disabled>时间冲突</button>
      <button v-else-if="cls.remaining <= 0" class="btn btn--warn" type="button" @click="wait">加入候补</button>
      <button v-else class="btn" type="button" @click="select">选课</button>
    </span>
  </div>
</template>
