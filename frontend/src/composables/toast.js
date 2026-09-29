import { reactive } from 'vue';

export const toasts = reactive([]);
let seed = 0;

export function toast(text, type = 'info') {
  const id = ++seed;
  toasts.push({ id, text, type });
  setTimeout(() => {
    const index = toasts.findIndex(item => item.id === id);
    if (index >= 0) toasts.splice(index, 1);
  }, 2600);
}
