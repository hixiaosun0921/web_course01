<script setup>
import { computed, reactive, ref } from 'vue';
import { SORT_LABELS, useCatalogStore } from '../store/catalog';
import { DAY_NAMES } from '../utils/format';

const catalog = useCatalogStore();
const sortOpen = ref(false);
const advOpen = ref(false);
const adv = reactive({ teacher: '', day: 0, section: 0 });

const tags = computed(() => {
  const list = [];
  const filters = catalog.filters;
  if (filters.onlyAvailable) list.push({ key: 'onlyAvailable', text: '有剩余量' });
  if (filters.onlyNoConflict) list.push({ key: 'onlyNoConflict', text: '仅看无冲突' });
  if (filters.teacher) list.push({ key: 'teacher', text: `教师：${filters.teacher}` });
  if (filters.day) list.push({ key: 'day', text: DAY_NAMES[filters.day] });
  if (filters.section) list.push({ key: 'section', text: `${filters.section}-${filters.section + 1} 节` });
  return list;
});

function removeTag(key) {
  const filters = catalog.filters;
  if (key === 'onlyAvailable') filters.onlyAvailable = false;
  if (key === 'onlyNoConflict') filters.onlyNoConflict = false;
  if (key === 'teacher') filters.teacher = '';
  if (key === 'day') filters.day = 0;
  if (key === 'section') filters.section = 0;
}

function chooseSort(key) {
  catalog.filters.sortBy = key;
  sortOpen.value = false;
}

function toggleAdv() {
  advOpen.value = !advOpen.value;
  if (advOpen.value) {
    adv.teacher = catalog.filters.teacher;
    adv.day = catalog.filters.day;
    adv.section = catalog.filters.section;
  }
}

function applyAdv() {
  catalog.filters.teacher = adv.teacher.trim();
  catalog.filters.day = Number(adv.day);
  catalog.filters.section = Number(adv.section);
  advOpen.value = false;
}

function clearAdv() {
  adv.teacher = '';
  adv.day = 0;
  adv.section = 0;
  catalog.filters.teacher = '';
  catalog.filters.day = 0;
  catalog.filters.section = 0;
}
</script>

<template>
  <div>
    <section class="filterbar" @click="sortOpen = false">
      <span class="filter-label">已选条件</span>
      <span class="filter-tags">
        <span v-for="tag in tags" :key="tag.key" class="tag">
          {{ tag.text }}
          <span class="x" title="移除该条件" @click="removeTag(tag.key)">×</span>
        </span>
        <span v-if="!tags.length" class="filter-empty">暂无筛选条件</span>
      </span>
      <div class="filter-right">
        <span class="ctl-wrap">
          <span class="ctl" :class="{ 'ctl--open': sortOpen }" @click.stop="sortOpen = !sortOpen">
            排序：<span>{{ SORT_LABELS[catalog.filters.sortBy] }}</span><i class="caret"></i>
          </span>
          <div v-if="sortOpen" class="dropdown">
            <button
              v-for="(label, key) in SORT_LABELS"
              :key="key"
              type="button"
              :class="{ 'is-active': key === catalog.filters.sortBy }"
              @click="chooseSort(key)"
            >
              {{ label }}
            </button>
          </div>
        </span>
        <span class="ctl" :class="{ 'ctl--open': advOpen }" @click="toggleAdv">展开筛选<i class="caret"></i></span>
      </div>
    </section>

    <section v-if="advOpen" class="adv-panel">
      <label class="adv-field">任课教师
        <input v-model="adv.teacher" type="text" placeholder="按教师姓名筛选">
      </label>
      <label class="adv-field">星期
        <select v-model="adv.day">
          <option :value="0">全部</option>
          <option v-for="day in 7" :key="day" :value="day">{{ DAY_NAMES[day] }}</option>
        </select>
      </label>
      <label class="adv-field">节次
        <select v-model="adv.section">
          <option :value="0">全部</option>
          <option :value="1">1-2 节</option>
          <option :value="3">3-4 节</option>
          <option :value="5">5-6 节</option>
          <option :value="7">7-8 节</option>
          <option :value="9">9-10 节</option>
        </select>
      </label>
      <div class="adv-actions">
        <button class="btn btn--primary" type="button" @click="applyAdv">应用筛选</button>
        <button class="btn" type="button" @click="clearAdv">清空</button>
      </div>
    </section>
  </div>
</template>
