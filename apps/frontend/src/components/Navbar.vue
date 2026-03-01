<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { useResumeStore } from '../stores/resume';
import { GITHUB_REPO } from '../constants';

defineOptions({
  name: 'AppNavbar',
});

const route = useRoute();
const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();
const resumeStore = useResumeStore();
const { isAuthenticated, user } = storeToRefs(authStore);

const showUserDropdown = ref(false);

const navLinks = computed(() => [
  { path: '/', label: '首页' },
  { path: '/dashboard', label: '我的简历' },
  { path: '/templates', label: '模板' },
  { path: '/about', label: '关于' },
]);

const isActive = (path: string) => route.path === path;

const handleNavClick = (link: { path: string; label: string }) => {
  // 我的简历页面需要登录，未登录时跳转到登录页
  if (link.path === '/dashboard' && !isAuthenticated.value) {
    void router.push('/login');
    return;
  }
  void router.push(link.path);
};

const handleLogin = () => {
  void router.push('/login');
};

const handleLogout = async () => {
  try {
    await authStore.signOut();
    resumeStore.reset();
    resumeStore.markReady();
    message.success('已退出登录');
    showUserDropdown.value = false;
    // 如果在需要登录的页面，跳转到首页
    if (route.meta.requiresAuth) {
      void router.push('/');
    }
  } catch {
    message.error('退出失败');
  }
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/" class="nav-logo">
        <div class="logo-icon">
          <div class="i-lucide:file-text text-lg text-white" />
        </div>
        <span class="logo-text">MarkCV</span>
      </router-link>

      <!-- 导航链接 -->
      <div class="nav-links">
        <a
          v-for="link in navLinks"
          :key="link.path"
          class="nav-link"
          :class="{ active: isActive(link.path) }"
          @click.prevent="handleNavClick(link)"
        >
          {{ link.label }}
        </a>
      </div>

      <!-- 右侧操作区 -->
      <div class="nav-actions">
        <!-- GitHub 图标 -->
        <a
          :href="GITHUB_REPO"
          target="_blank"
          rel="noopener noreferrer"
          class="action-icon"
          title="GitHub 仓库"
          aria-label="访问 GitHub 仓库"
        >
          <div class="i-lucide:github text-xl" aria-hidden="true" />
        </a>

        <!-- 未登录：显示登录按钮 -->
        <button v-if="!isAuthenticated" class="btn-login" @click="handleLogin">
          登录
        </button>

        <!-- 已登录：显示头像下拉菜单 -->
        <div
          v-else
          class="user-menu"
          @mouseenter="showUserDropdown = true"
          @mouseleave="showUserDropdown = false"
        >
          <button
            class="user-avatar-wrapper"
            aria-haspopup="true"
            :aria-expanded="showUserDropdown"
            aria-label="用户菜单"
          >
            <img
              v-if="user?.avatarUrl"
              :src="user.avatarUrl"
              alt=""
              class="user-avatar"
            />
            <div v-else class="user-avatar-placeholder" aria-hidden="true">
              <div class="i-lucide:user text-lg" />
            </div>
          </button>

          <!-- 下拉菜单 -->
          <Transition name="dropdown">
            <div
              v-show="showUserDropdown"
              class="dropdown-menu"
              role="menu"
              aria-orientation="vertical"
            >
              <div class="dropdown-header">
                <span class="user-name">{{ user?.name || user?.login }}</span>
                <span class="user-login">@{{ user?.login }}</span>
              </div>
              <div class="dropdown-divider" />
              <button
                class="dropdown-item"
                role="menuitem"
                @click="handleLogout"
              >
                <div class="i-lucide:log-out text-base" aria-hidden="true" />
                <span>退出登录</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* 导航栏容器 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

/* 导航链接 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #374151;
  background: #f3f4f6;
}

.nav-link.active {
  color: #111827;
  background: #f3f4f6;
}

/* 右侧操作区 */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-icon:hover {
  color: #111827;
  background: #f3f4f6;
}

/* 登录按钮 */
.btn-login {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background: #111827;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-login:hover {
  background: #374151;
}

/* 用户菜单 */
.user-menu {
  position: relative;
}

.user-avatar-wrapper {
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s ease;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-wrapper:hover {
  background: #f3f4f6;
}

.user-avatar-wrapper:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  z-index: 101;
}

.dropdown-header {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
}

.user-login {
  font-size: 0.8125rem;
  color: #6b7280;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.25rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #111827;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式：平板 */
@media (max-width: 1024px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-links {
    gap: 0.25rem;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .logo-text {
    font-size: 1.125rem;
  }
}
</style>
