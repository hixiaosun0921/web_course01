import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import './assets/app.css';
import './assets/mobile.css';

createApp(App).use(createPinia()).use(router).mount('#app');
