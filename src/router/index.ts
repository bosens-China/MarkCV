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
];

const router = createRouter({
  history: import.meta.env.DEV ? createWebHashHistory() : createWebHistory(),
  routes,
});

export default router;
