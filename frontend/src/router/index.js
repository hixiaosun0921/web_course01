import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/course-select' },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { guest: true } },
    {
      path: '/course-select',
      name: 'course-select',
      component: () => import('../views/CourseSelectView.vue'),
      meta: { auth: true, role: 'student' }
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { auth: true, role: 'admin' },
      children: [
        { path: '', name: 'admin-overview', component: () => import('../views/admin/AdminOverview.vue') },
        { path: 'courses', name: 'admin-courses', component: () => import('../views/admin/AdminCourses.vue') },
        { path: 'classes', name: 'admin-classes', component: () => import('../views/admin/AdminClasses.vue') },
        { path: 'students', name: 'admin-students', component: () => import('../views/admin/AdminStudents.vue') },
        { path: 'colleges', name: 'admin-colleges', component: () => import('../views/admin/AdminColleges.vue') }
      ]
    }
  ]
});

router.beforeEach(to => {
  const user = useUserStore();
  if (to.meta.auth && !user.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.meta.auth && to.meta.role && to.meta.role !== user.role) {
    return { path: user.homePath };
  }
  if (to.meta.guest && user.isLoggedIn) {
    return { path: user.homePath };
  }
  return true;
});

export default router;
