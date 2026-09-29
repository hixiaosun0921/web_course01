import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    panel: '',            // '' | 'selected' | 'wish' | 'profile'
    confirmText: '',
    confirmHandler: null
  }),
  actions: {
    openPanel(panel) {
      this.panel = panel;
    },
    closePanel() {
      this.panel = '';
    },
    askConfirm(text, handler) {
      this.confirmText = text;
      this.confirmHandler = handler;
    },
    closeConfirm() {
      this.confirmText = '';
      this.confirmHandler = null;
    },
    runConfirm() {
      const handler = this.confirmHandler;
      this.closeConfirm();
      if (handler) handler();
    }
  }
});
