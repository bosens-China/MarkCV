import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Editor from '../views/Editor.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/editor/:id',
    name: 'Editor',
    component: Editor,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  // 开发环境使用 HTML5 History (无 #)，生产环境使用 Hash History (适配 GitHub Pages)
  history: import.meta.env.DEV ? createWebHistory() : createWebHashHistory(),
  routes,
});

export default router;
