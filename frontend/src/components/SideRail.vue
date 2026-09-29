<script setup>
import { useUiStore } from '../store/ui';

const ui = useUiStore();

function goTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <aside class="side-rail">
    <span class="rail-item rail-item--active" @click="goTop">选课信息</span>
    <span class="rail-item" @click="ui.openPanel('selected')">已选课信息</span>
    <span class="rail-item" @click="ui.openPanel('wish')">意向单</span>
  </aside>
</template>
