<template>
  <div class="dashboard-page min-h-screen">
    <!-- 导航栏 -->
    <Navbar />

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <!-- 用户信息卡片 -->
        <div class="sidebar-card user-card">
          <div class="user-header">
            <img
              v-if="user?.avatarUrl"
              :src="user.avatarUrl"
              alt="avatar"
              class="user-avatar-lg"
            />
            <div v-else class="user-avatar-placeholder">
              <div class="i-lucide:user text-2xl text-slate-400" />
            </div>
            <div class="user-meta">
              <h3 class="user-display-name">{{ user?.name || user?.login || '访客' }}</h3>
              <p class="user-login">@{{ user?.login || 'guest' }}</p>
            </div>
          </div>
          <div class="user-stats">
            <div class="stat-box">
              <span class="stat-num">{{ resumeStore.resumes.length }}</span>
              <span class="stat-label">简历</span>
            </div>
            <div class="stat-divider" />
            <div class="stat-box">
              <span class="stat-num">{{ isSyncing ? '...' : '✓' }}</span>
              <span class="stat-label">{{ isSyncing ? '同步中' : '已同步' }}</span>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="sidebar-card actions-card">
          <h4 class="card-title">快捷操作</h4>
          <button
            class="action-btn primary"
            :disabled="!isAuthenticated"
            @click="createResume"
          >
            <div class="i-lucide:plus text-lg" />
            <span>新建简历</span>
          </button>
          <button
            class="action-btn"
            :disabled="!isAuthenticated"
            @click="refreshData"
          >
            <div class="i-lucide:refresh-cw text-lg" :class="{ 'animate-spin': isSyncing }" />
            <span>刷新数据</span>
          </button>
          <router-link to="/templates" class="action-btn">
            <div class="i-lucide:layout-template text-lg" />
            <span>浏览模板</span>
          </router-link>
        </div>

        <!-- 提示卡片 -->
        <div v-if="!isAuthenticated" class="sidebar-card tip-card">
          <div class="tip-icon">
            <div class="i-lucide:info text-xl text-blue-500" />
          </div>
          <p class="tip-text">登录后可创建和管理云端简历</p>
          <button class="btn-primary w-full mt-3" @click="goGithubLogin">
            GitHub 登录
          </button>
        </div>

      </aside>

      <!-- 右侧内容区 -->
      <main class="content-area">
        <!-- 搜索栏 -->
        <div class="content-header">
          <div class="search-box">
            <div class="i-lucide:search text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索简历..."
              :disabled="!isAuthenticated"
            />
          </div>
          <div class="view-toggle">
            <button
              :class="['toggle-btn', viewMode === 'grid' && 'active']"
              @click="viewMode = 'grid'"
            >
              <div class="i-lucide:layout-grid text-lg" />
            </button>
            <button
              :class="['toggle-btn', viewMode === 'list' && 'active']"
              @click="viewMode = 'list'"
            >
              <div class="i-lucide:list text-lg" />
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="!isAuthenticated" class="empty-state">
          <div class="empty-icon">
            <div class="i-lucide:shield-check text-5xl text-slate-300" />
          </div>
          <h3>请先登录</h3>
          <p>使用 GitHub 登录后可创建和管理你的云端简历</p>
        </div>

        <div v-else-if="!isReady || isInitialLoading" class="loading-state">
          <div class="i-lucide:loader-2 animate-spin text-4xl text-blue-500" />
          <p>正在加载简历...</p>
        </div>

        <div v-else-if="resumeStore.resumes.length === 0" class="empty-state">
          <div class="empty-icon">
            <div class="i-lucide:file-plus-2 text-5xl text-slate-300" />
          </div>
          <h3>还没有简历</h3>
          <p>创建第一份简历并开始云端编辑</p>
          <button class="btn-primary mt-4" @click="createResume">
            <div class="i-lucide:plus" />
            立即创建
          </button>
        </div>

        <div v-else-if="filteredResumes.length === 0" class="empty-state">
          <div class="empty-icon">
            <div class="i-lucide:search-x text-5xl text-slate-300" />
          </div>
          <h3>未找到简历</h3>
          <p>没有找到包含「{{ searchQuery }}」的简历</p>
        </div>

        <!-- 简历列表 - 网格视图 -->
        <ul
          v-else-if="viewMode === 'grid'"
          class="resume-grid"
          role="list"
        >
          <li
            v-for="resume in filteredResumes"
            :key="resume.id"
            class="resume-card"
            @click="openResume(resume.id)"
          >
            <div class="card-header">
              <div class="file-icon">
                <div class="i-lucide:file-text text-2xl text-white" />
              </div>
              <n-dropdown
                trigger="click"
                :options="dropdownOptions"
                placement="bottom-end"
                @select="(key: string) => handleMenuSelect(key, resume.id)"
              >
                <button class="menu-btn" @click.stop>
                  <div class="i-lucide:more-horizontal text-lg" />
                </button>
              </n-dropdown>
            </div>
            <div class="card-body">
              <h3 class="resume-title" :title="resume.title">
                {{ resume.title || '未命名简历' }}
              </h3>
              <p class="resume-date">更新于 {{ formatDate(resume.updatedAt) }}</p>
            </div>
            <div class="card-footer">
              <span class="badge">{{ resume.currentFont === 'font-serif' ? '衬线' : '无衬线' }}</span>
              <span class="badge">A4</span>
            </div>
          </li>
        </ul>

        <!-- 简历列表 - 列表视图 -->
        <ul v-else class="resume-list" role="list">
          <li
            v-for="resume in filteredResumes"
            :key="resume.id"
            class="resume-list-item"
            @click="openResume(resume.id)"
          >
            <div class="item-icon">
              <div class="i-lucide:file-text text-xl text-slate-500" />
            </div>
            <div class="item-info">
              <h3 class="item-title">{{ resume.title || '未命名简历' }}</h3>
              <p class="item-meta">更新于 {{ formatDate(resume.updatedAt) }}</p>
            </div>
            <div class="item-tags">
              <span class="badge">{{ resume.currentFont === 'font-serif' ? '衬线' : '无衬线' }}</span>
            </div>
            <n-dropdown
              trigger="click"
              :options="dropdownOptions"
              placement="bottom-end"
              @select="(key: string) => handleMenuSelect(key, resume.id)"
            >
              <button class="menu-btn" @click.stop>
                <div class="i-lucide:more-horizontal text-lg" />
              </button>
            </n-dropdown>
          </li>
        </ul>
      </main>
    </div>

    <!-- 删除确认弹窗 -->
    <n-modal
      v-model:show="showDeleteDialog"
      preset="dialog"
      title="确认删除"
      type="warning"
      content="删除后将无法恢复，确认继续吗？"
      positive-text="删除"
      negative-text="取消"
      @positive-click="handleDelete"
      @negative-click="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { storeToRefs } from 'pinia';
import gsap from 'gsap';
import Navbar from '../components/Navbar.vue';
import { useResumeStore } from '../stores/resume';
import { useAuthStore } from '../stores/auth';
import { getGithubLoginUrl } from '../api/client';
import { formatSmartDate } from '../utils/date';


defineOptions({
  name: 'ResumeDashboardPage',
});

const router = useRouter();
const message = useMessage();
const resumeStore = useResumeStore();
const authStore = useAuthStore();
const { isReady, isSyncing } = storeToRefs(resumeStore);
const { isAuthenticated, user } = storeToRefs(authStore);

const searchQuery = ref('');
const showDeleteDialog = ref(false);
const resumeToDelete = ref<string | null>(null);
const isInitialLoading = ref(false);
const viewMode = ref<'grid' | 'list'>('grid');

const dropdownOptions = [
  {
    label: '删除简历',
    key: 'delete',
    props: {
      style: { color: '#ef4444' },
    },
    icon: () => h('div', { class: 'i-lucide:trash-2' }),
  },
];

const filteredResumes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return resumeStore.resumes;
  return resumeStore.resumes.filter((resume) =>
    resume.title.toLowerCase().includes(query),
  );
});

const createResume = async () => {
  if (!isAuthenticated.value) {
    message.warning('请先使用 GitHub 登录');
    return;
  }
  try {
    const id = await resumeStore.createResume();
    message.success('已创建新简历');
    await router.push(`/editor/${id}`);
  } catch (error) {
    message.error(`创建失败: ${(error as Error).message}`);
  }
};

const openResume = (id: string) => {
  void router.push(`/editor/${id}`);
};

const confirmDelete = (id: string) => {
  resumeToDelete.value = id;
  showDeleteDialog.value = true;
};

const handleMenuSelect = (key: string, id: string) => {
  if (key === 'delete') confirmDelete(id);
};

const handleDelete = async () => {
  const id = resumeToDelete.value;
  if (!id) return;
  try {
    await resumeStore.deleteResume(id);
    message.success('删除成功');
  } catch (error) {
    message.error(`删除失败: ${(error as Error).message}`);
  } finally {
    resumeToDelete.value = null;
    showDeleteDialog.value = false;
  }
};

const refreshData = async () => {
  if (!isAuthenticated.value) {
    message.warning('请先使用 GitHub 登录');
    return;
  }
  try {
    await resumeStore.refresh();
    message.success('数据已刷新');
  } catch (error) {
    message.error(`刷新失败: ${(error as Error).message}`);
  }
};

const goGithubLogin = () => {
  window.location.href = getGithubLoginUrl();
};

const formatDate = (timestamp: number): string => {
  return formatSmartDate(timestamp);
};

const animateIn = () => {
  gsap.to('.sidebar-card', {
    opacity: 1,
    x: 0,
    duration: 0.4,
    stagger: 0.1,
    ease: 'power2.out',
  });
  gsap.to('.content-area', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    delay: 0.2,
    ease: 'power2.out',
  });
};

onMounted(async () => {
  if (!isAuthenticated.value) {
    animateIn();
    return;
  }
  if (!resumeStore.resumes.length) {
    isInitialLoading.value = true;
    try {
      await resumeStore.refresh();
    } catch {
      message.error('加载简历失败，请检查后端服务');
    } finally {
      isInitialLoading.value = false;
    }
  }
  animateIn();
});

watch(
  () => resumeStore.resumes.length,
  () => {
    setTimeout(animateIn, 50);
  },
);
</script>

<style scoped>
/* 主容器 */
.dashboard-page {
  background: #f8fafc;
  min-height: 100vh;
}

.main-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 1.5rem 2rem;
}

/* 左侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  opacity: 0;
  transform: translateX(-20px);
}

/* 用户信息卡片 */
.user-card .user-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1rem;
}

.user-avatar-lg {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-meta {
  flex: 1;
  min-width: 0;
}

.user-display-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-login {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0.125rem 0 0;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e5e7eb;
}

/* 快捷操作 */
.actions-card .card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.action-btn:last-child {
  margin-bottom: 0;
}

.action-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.action-btn.primary {
  color: white;
  background: #111827;
  border-color: #111827;
}

.action-btn.primary:hover {
  background: #374151;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 提示卡片 */
.tip-card {
  background: linear-gradient(135deg, #eff6ff, #f0f9ff);
  border-color: #bfdbfe;
}

.tip-icon {
  margin-bottom: 0.5rem;
}

.tip-text {
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
}

/* 开源链接 */
.links-card .card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link-item:hover {
  color: #111827;
}

/* 右侧内容区 */
.content-area {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  min-height: calc(100vh - 100px);
  opacity: 0;
  transform: translateY(20px);
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  max-width: 360px;
  padding: 0.5rem 0.875rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-box input {
  flex: 1;
  font-size: 0.875rem;
  color: #111827;
  background: transparent;
  border: none;
  outline: none;
}

.search-box input::placeholder {
  color: #9ca3af;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  color: #374151;
}

.toggle-btn.active {
  color: #111827;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 状态展示 */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.loading-state p {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 1rem;
}

/* 网格视图 */
.resume-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
}

.resume-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resume-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.875rem;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #111827, #374151);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #9ca3af;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.resume-card:hover .menu-btn {
  opacity: 1;
}

.menu-btn:hover {
  color: #374151;
  background: #f3f4f6;
}

.card-body {
  margin-bottom: 0.875rem;
}

.resume-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resume-date {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.card-footer {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.875rem;
  border-top: 1px solid #f3f4f6;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  background: #f3f4f6;
  border-radius: 9999px;
}

/* 列表视图 */
.resume-list {
  padding: 0.5rem;
}

.resume-list-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resume-list-item:hover {
  background: #f9fafb;
}

.item-icon {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.item-tags {
  display: flex;
  gap: 0.5rem;
}

.resume-list-item .menu-btn {
  opacity: 0;
}

.resume-list-item:hover .menu-btn {
  opacity: 1;
}

/* 响应式 */
@media (max-width: 1024px) {
  .main-container {
    grid-template-columns: 260px 1fr;
  }
}

@media (max-width: 768px) {
  .main-container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-card {
    flex: 1;
    min-width: 200px;
  }

  .user-card {
    flex: 2;
    min-width: 300px;
  }

  .nav-links {
    display: none;
  }
}

@media (max-width: 640px) {
  .resume-grid {
    grid-template-columns: 1fr;
  }

  .content-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .search-box {
    max-width: none;
    width: 100%;
    order: 2;
  }

  .view-toggle {
    order: 1;
    margin-left: auto;
  }
}
</style>
