<script setup>
import ToastHost from './components/ToastHost.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import PanelModal from './components/PanelModal.vue';
</script>

<template>
  <RouterView />
  <PanelModal />
  <ConfirmDialog />
  <ToastHost />
</template>
