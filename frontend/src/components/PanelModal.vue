<script setup>
import { computed } from 'vue';
import { useUiStore } from '../store/ui';
import { useSelectionStore } from '../store/selection';
import SelectedPanel from './SelectedPanel.vue';
import WishPanel from './WishPanel.vue';
import ProfilePanel from './ProfilePanel.vue';

const ui = useUiStore();
const selection = useSelectionStore();

const TITLES = { selected: '已选课信息', wish: '意向单', profile: '个人资料' };
const title = computed(() => TITLES[ui.panel] || '');
const bodyComponent = computed(() => ({
  selected: SelectedPanel,
  wish: WishPanel,
  profile: ProfilePanel
}[ui.panel] || null));
</script>

<template>
  <div v-if="ui.panel" class="modal-mask" @click.self="ui.closePanel()">
    <div class="modal">
      <div class="modal-head">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close" type="button" aria-label="关闭" @click="ui.closePanel()">×</button>
      </div>
      <div class="modal-body">
        <component :is="bodyComponent" />
      </div>
      <div class="modal-foot">
        <button v-if="ui.panel === 'wish'" class="btn btn--primary" type="button" @click="selection.wishSelectAll()">
          一键选课
        </button>
        <button class="btn" type="button" @click="ui.closePanel()">关闭</button>
      </div>
    </div>
  </div>
</template>
