<script setup>
import { useUiStore } from '../store/ui';

const ui = useUiStore();
</script>

<template>
  <div v-if="ui.confirmText" class="modal-mask" @click.self="ui.closeConfirm()">
    <div class="modal">
      <div class="modal-head">
        <h3 class="modal-title">操作确认</h3>
        <button class="modal-close" type="button" aria-label="关闭" @click="ui.closeConfirm()">×</button>
      </div>
      <div class="modal-body">
        <p class="confirm-text">{{ ui.confirmText }}</p>
      </div>
      <div class="modal-foot">
        <button class="btn" type="button" @click="ui.closeConfirm()">取消</button>
        <button class="btn btn--primary" type="button" @click="ui.runConfirm()">确定</button>
      </div>
    </div>
  </div>
</template>
