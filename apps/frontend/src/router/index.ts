import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Editor from '../views/Editor.vue';
import Templates from '../views/Templates.vue';
import About from '../views/About.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  // 主页
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true },
  },
  // 简历管理台
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  // 简历编辑器
  {
    path: '/editor/:id',
    name: 'Editor',
    component: Editor,
    meta: { requiresAuth: true },
  },
  // 模板页面
  {
    path: '/templates',
    name: 'Templates',
    component: Templates,
  },
  // 关于页面
  {
    path: '/about',
    name: 'About',
    component: About,
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 导航守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // 需要登录的页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // 仅限游客访问的页面（如登录页）
  if (to.meta.guestOnly && isAuthenticated) {
    next('/dashboard');
    return;
  }

  next();
});

export default router;
