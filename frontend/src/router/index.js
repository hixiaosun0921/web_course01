import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/course-select' },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { guest: true } },
    { path: '/course-select', name: 'course-select', component: () => import('../views/CourseSelectView.vue'), meta: { auth: true } }
  ]
});

router.beforeEach(to => {
  const user = useUserStore();
  if (to.meta.auth && !user.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guest && user.isLoggedIn) {
    return { path: '/course-select' };
  }
  return true;
});

export default router;
