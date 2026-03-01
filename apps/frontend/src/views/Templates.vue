<template>
  <div class="templates-page">
    <!-- 导航栏 -->
    <Navbar />

    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-container">
        <h1 class="hero-title">简历模板</h1>
        <p class="hero-desc">
          选择适合你的简历模板，一键套用，快速开始制作专业简历。
          所有模板均可自由定制样式和内容。
        </p>
      </div>
    </section>

    <!-- 模板列表 -->
    <section class="templates-section">
      <div class="templates-container">
        <!-- 筛选标签 -->
        <div class="filter-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            class="filter-tab"
            :class="{ active: currentFilter === tab.key }"
            @click="currentFilter = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 模板网格 -->
        <div class="templates-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            @click="previewTemplate(template)"
          >
            <div class="template-preview">
              <div class="preview-placeholder" :class="template.id">
                <div class="placeholder-header">
                  <div class="ph-avatar" />
                  <div class="ph-title">
                    <div class="ph-line short" />
                    <div class="ph-line shorter" />
                  </div>
                </div>
                <div class="ph-body">
                  <div class="ph-section" v-for="i in 3" :key="i">
                    <div class="ph-line" />
                    <div class="ph-line medium" />
                  </div>
                </div>
              </div>
              <div class="template-overlay">
                <button class="preview-btn" @click.stop="previewTemplate(template)">
                  <div class="i-lucide:eye text-lg" />
                  <span>预览</span>
                </button>
                <button class="use-btn" @click.stop="useTemplate(template)">
                  <span>使用模板</span>
                </button>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">{{ template.name }}</h3>
              <p class="template-desc">{{ template.description }}</p>
              <div class="template-tags">
                <span v-for="tag in template.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 预览弹窗 -->
    <n-modal
      v-model:show="showPreview"
      preset="card"
      class="preview-modal"
      :style="{ width: '1100px', maxWidth: '95vw' }"
      :title="previewingTemplate?.name"
    >
      <div class="preview-content">
        <div class="preview-sidebar">
          <div class="preview-meta">
            <h4>{{ previewingTemplate?.name }}</h4>
            <p>{{ previewingTemplate?.description }}</p>
          </div>
          <div class="preview-features">
            <div class="feature-item">
              <div class="i-lucide:check text-green-500" />
              <span>Markdown 格式</span>
            </div>
            <div class="feature-item">
              <div class="i-lucide:check text-green-500" />
              <span>A4 分页适配</span>
            </div>
            <div class="feature-item">
              <div class="i-lucide:check text-green-500" />
              <span>自定义样式</span>
            </div>
          </div>
          <button class="use-template-btn" @click="useTemplate(previewingTemplate!)">
            使用此模板
          </button>
        </div>
        <div class="preview-resume">
          <div class="resume-page">
            <div class="resume-content" v-html="previewHtml" />
          </div>
        </div>
      </div>
    </n-modal>

    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { storeToRefs } from 'pinia';
import MarkdownIt from 'markdown-it';
import Container from 'markdown-it-container';
import Navbar from '../components/Navbar.vue';
import AppFooter from '../components/AppFooter.vue';
import { useAuthStore } from '../stores/auth';
import { useResumeStore } from '../stores/resume';
import { RESUME_TEMPLATES } from '../constants/templates';
import type { ResumeTemplate } from '../constants/templates';

defineOptions({
  name: 'TemplatesPage',
});

const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();
const resumeStore = useResumeStore();
const { isAuthenticated } = storeToRefs(authStore);

const currentFilter = ref('all');
const showPreview = ref(false);
const previewingTemplate = ref<ResumeTemplate | null>(null);

const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'two-column', label: '双栏' },
  { key: 'single', label: '单栏' },
  { key: 'tech', label: '技术向' },
];

const filteredTemplates = computed(() => {
  if (currentFilter.value === 'all') return RESUME_TEMPLATES;
  return RESUME_TEMPLATES.filter((t) =>
    t.tags.includes(
      currentFilter.value === 'two-column'
        ? '双栏'
        : currentFilter.value === 'single'
          ? '单栏'
          : '技术向',
    ),
  );
});

// Markdown 解析器
const md = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: true,
  breaks: true,
});

md.use(Container, 'row', {
  render: (tokens: unknown[], idx: number) => {
    const token = tokens[idx] as { nesting?: number } | undefined;
    return token?.nesting === 1 ? '<div class="layout-row">' : '</div>';
  },
});

['left', 'right', 'center'].forEach((name) => {
  md.use(Container, name, {
    render: (tokens: unknown[], idx: number) => {
      const token = tokens[idx] as { nesting?: number } | undefined;
      return token?.nesting === 1 ? `<div class="layout-${name}">` : '</div>';
    },
  });
});

const previewHtml = computed(() => {
  if (!previewingTemplate.value) return '';
  return md.render(previewingTemplate.value.content);
});

const previewTemplate = (template: ResumeTemplate) => {
  previewingTemplate.value = template;
  showPreview.value = true;
};

const useTemplate = async (template: ResumeTemplate) => {
  if (!isAuthenticated.value) {
    message.warning('请先登录后再使用模板');
    router.push('/login');
    return;
  }

  try {
    const id = await resumeStore.createResume();
    // 更新简历内容为模板内容
    resumeStore.updateResume(id, {
      title: template.title,
      content: template.content,
    });
    await resumeStore.saveRemote(id);
    message.success('已创建简历并应用模板');
    router.push(`/editor/${id}`);
  } catch (error) {
    message.error(`创建失败: ${(error as Error).message}`);
  }
};
</script>

<style scoped>
/* Hero */
.hero {
  padding: 120px 0 60px;
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
  text-align: center;
}

.hero-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
}

.hero-desc {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

/* 模板区域 */
.templates-section {
  padding: 60px 0 100px;
  background: #f9fafb;
  min-height: 60vh;
}

.templates-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.filter-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
}

.filter-tab {
  padding: 0.5rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #6b7280;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  border-color: #d1d5db;
  color: #374151;
}

.filter-tab.active {
  background: #111827;
  color: white;
  border-color: #111827;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.template-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.template-preview {
  position: relative;
  height: 280px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  overflow: hidden;
}

.preview-placeholder {
  padding: 1.5rem;
  height: 100%;
}

.placeholder-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ph-avatar {
  width: 48px;
  height: 48px;
  background: #d1d5db;
  border-radius: 50%;
  flex-shrink: 0;
}

.ph-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
}

.ph-line {
  height: 8px;
  background: #d1d5db;
  border-radius: 4px;
}

.ph-line.short {
  width: 60%;
}

.ph-line.shorter {
  width: 40%;
}

.ph-line.medium {
  width: 80%;
}

.ph-section {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 不同模板的预览样式 */
.classic-two-column .ph-body {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1rem;
}

.minimal-single .ph-body {
  max-width: 80%;
}

.engineering-strong .ph-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.template-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.template-card:hover .template-overlay {
  opacity: 1;
}

.preview-btn,
.use-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.preview-btn {
  background: white;
  color: #111827;
}

.preview-btn:hover {
  background: #f3f4f6;
}

.use-btn {
  background: #111827;
  color: white;
}

.use-btn:hover {
  background: #374151;
}

.template-info {
  padding: 1.5rem;
}

.template-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.template-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.template-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #4f46e5;
  background: #eef2ff;
  border-radius: 9999px;
}

/* 预览弹窗 */
.preview-content {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
  height: 600px;
  overflow-x: hidden;
}

.preview-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-right: 1.5rem;
  border-right: 1px solid #e5e7eb;
}

.preview-meta h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.preview-meta p {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.preview-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.use-template-btn {
  margin-top: auto;
  padding: 0.875rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
  background: #111827;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.use-template-btn:hover {
  background: #374151;
}

.preview-resume {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 1.5rem;
  overflow: auto;
  display: flex;
  justify-content: center;
}

.resume-page {
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20mm;
}

.resume-content {
  font-size: 0.875rem;
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 1024px) {
  .templates-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .preview-content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .preview-sidebar {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding-right: 0;
    padding-bottom: 1.5rem;
  }

  .resume-page {
    width: 100%;
    min-height: auto;
    padding: 1.5rem;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 2rem;
  }

  .nav-links {
    display: none;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }
}
</style>
