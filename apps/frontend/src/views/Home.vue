<template>
  <div class="home-page">
    <!-- 导航栏 -->
    <Navbar />

    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-text">✨ 现已开源</span>
          </div>
          <h1 class="hero-title">
            用 Markdown 制作
            <br />
            <span class="gradient-text">精美的专业简历</span>
          </h1>
          <p class="hero-desc">
            MarkCV 是一款专为开发者和技术从业者设计的简历制作工具。
            无需复杂的排版，专注内容创作，让简历制作变得简单而优雅。
          </p>
          <div class="hero-actions">
            <router-link v-if="isAuthenticated" to="/dashboard" class="btn-primary">
              <span>我的简历</span>
              <div class="i-lucide:arrow-right text-lg" />
            </router-link>
            <router-link v-else to="/login" class="btn-primary">
              <span>免费开始使用</span>
              <div class="i-lucide:arrow-right text-lg" />
            </router-link>
            <router-link to="/templates" class="btn-outline">
              浏览模板
            </router-link>
          </div>
          <dl class="hero-stats">
            <div class="stat-item">
              <dt class="stat-value">100%</dt>
              <dd class="stat-label">免费开源</dd>
            </div>
            <div class="stat-divider" aria-hidden="true" />
            <div class="stat-item">
              <dt class="stat-value">A4</dt>
              <dd class="stat-label">完美打印</dd>
            </div>
            <div class="stat-divider" aria-hidden="true" />
            <div class="stat-item">
              <dt class="stat-value">云端</dt>
              <dd class="stat-label">同步保存</dd>
            </div>
          </dl>
        </div>

        <div class="hero-visual">
          <div class="preview-card">
            <div class="preview-header">
              <div class="preview-dot red" />
              <div class="preview-dot yellow" />
              <div class="preview-dot green" />
              <span class="preview-title">resume.md</span>
            </div>
            <div class="preview-body">
              <div class="markdown-content">
                <div class="md-line heading">
                  <span class="md-hash">#</span> 张三
                </div>
                <div class="md-line subheading">
                  <span class="md-hash">##</span> 高级前端工程师
                </div>
                <div class="md-line empty" />
                <div class="md-line">
                  <span class="md-bold">**联系方式**</span>
                </div>
                <div class="md-line">- 邮箱: zhangsan@example.com</div>
                <div class="md-line">- 电话: 138-0000-0000</div>
                <div class="md-line empty" />
                <div class="md-line">
                  <span class="md-bold">**工作经历**</span>
                </div>
                <div class="md-line">**某公司** | 前端工程师</div>
              </div>
              <div class="rendered-preview">
                <div class="rp-header">张三</div>
                <div class="rp-subtitle">高级前端工程师</div>
                <div class="rp-section">
                  <div class="rp-section-title">联系方式</div>
                  <div class="rp-item">zhangsan@example.com</div>
                  <div class="rp-item">138-0000-0000</div>
                </div>
              </div>
            </div>
          </div>
          <div class="floating-card card-1">
            <div class="i-lucide:sparkles text-yellow-400 text-xl" />
            <span>实时预览</span>
          </div>
          <div class="floating-card card-2">
            <div class="i-lucide:download text-blue-400 text-xl" />
            <span>PDF 导出</span>
          </div>
        </div>
      </div>

      <div class="hero-decoration">
        <div class="blur-circle circle-1" />
        <div class="blur-circle circle-2" />
      </div>
    </section>

    <!-- 特性区域 -->
    <section class="features">
      <div class="section-container">
        <div class="section-header">
          <span class="section-tag">特性</span>
          <h2 class="section-title">为什么选择 MarkCV？</h2>
          <p class="section-desc">
            我们专注于打造极致的简历编辑体验，让技术人能够轻松制作出专业、美观的简历。
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon blue">
              <div class="i-lucide:pencil-line text-2xl text-white" />
            </div>
            <h3 class="feature-title">Markdown 编辑</h3>
            <p class="feature-desc">
              使用熟悉的 Markdown 语法编写内容，无需学习复杂的排版工具，专注表达。
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon purple">
              <div class="i-lucide:eye text-2xl text-white" />
            </div>
            <h3 class="feature-title">实时预览</h3>
            <p class="feature-desc">
              边写边看，编辑器与预览窗口实时同步，所见即所得的编辑体验。
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon green">
              <div class="i-lucide:file-output text-2xl text-white" />
            </div>
            <h3 class="feature-title">PDF 导出</h3>
            <p class="feature-desc">
              基于 Paged.js 的 A4 分页预览，确保打印和导出的 PDF 完美呈现。
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon orange">
              <div class="i-lucide:cloud text-2xl text-white" />
            </div>
            <h3 class="feature-title">云端同步</h3>
            <p class="feature-desc">
              使用 GitHub 登录，简历数据自动同步到云端，随时随地访问编辑。
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon pink">
              <div class="i-lucide:history text-2xl text-white" />
            </div>
            <h3 class="feature-title">版本历史</h3>
            <p class="feature-desc">
              自动保存编辑历史，可随时回滚到任意版本，不再担心误操作。
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon cyan">
              <div class="i-lucide:palette text-2xl text-white" />
            </div>
            <h3 class="feature-title">自定义样式</h3>
            <p class="feature-desc">
              支持自定义主题色、字体、边距等样式，也支持自定义 CSS。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 使用流程 -->
    <section class="workflow">
      <div class="section-container">
        <div class="section-header">
          <span class="section-tag">使用流程</span>
          <h2 class="section-title">三步制作专业简历</h2>
        </div>

        <div class="workflow-steps">
          <div class="workflow-step">
            <div class="step-number">01</div>
            <div class="step-content">
              <div class="step-icon">
                <div class="i-lucide:user-plus text-3xl text-blue-500" />
              </div>
              <h3 class="step-title">登录账号</h3>
              <p class="step-desc">使用 GitHub 账号一键登录，无需额外注册</p>
            </div>
          </div>

          <div class="workflow-arrow">
            <div class="i-lucide:arrow-right text-3xl text-slate-300" />
          </div>

          <div class="workflow-step">
            <div class="step-number">02</div>
            <div class="step-content">
              <div class="step-icon">
                <div class="i-lucide:file-edit text-3xl text-purple-500" />
              </div>
              <h3 class="step-title">编辑内容</h3>
              <p class="step-desc">选择模板，使用 Markdown 编写简历内容</p>
            </div>
          </div>

          <div class="workflow-arrow">
            <div class="i-lucide:arrow-right text-3xl text-slate-300" />
          </div>

          <div class="workflow-step">
            <div class="step-number">03</div>
            <div class="step-content">
              <div class="step-icon">
                <div class="i-lucide:download text-3xl text-green-500" />
              </div>
              <h3 class="step-title">导出 PDF</h3>
              <p class="step-desc">预览效果满意后，一键导出 PDF 简历</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta">
      <div class="cta-container">
        <div class="cta-content">
          <h2 class="cta-title">准备好制作你的简历了吗？</h2>
          <p class="cta-desc">
            立即开始使用 MarkCV，免费制作专业的技术简历。
          </p>
          <div class="cta-actions">
            <router-link
              v-if="isAuthenticated"
              to="/dashboard"
              class="inline-block px-10 py-4 bg-white text-gray-900 text-lg font-semibold rounded-[10px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/20"
            >
              我的简历
            </router-link>
            <router-link
              v-else
              to="/login"
              class="inline-block px-10 py-4 bg-white text-gray-900 text-lg font-semibold rounded-[10px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/20"
            >
              免费开始使用
            </router-link>
          </div>
        </div>
        <div class="cta-decoration">
          <div class="cta-circle circle-1" />
          <div class="cta-circle circle-2" />
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Navbar from '../components/Navbar.vue';
import AppFooter from '../components/AppFooter.vue';
import { useAuthStore } from '../stores/auth';

defineOptions({
  name: 'HomePage',
});

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
</script>

<style scoped>
/* 基础布局 */
.home-page {
  min-height: 100vh;
  background: #fafafa;
}

/* Hero 区域 */
.hero {
  position: relative;
  padding: 120px 0 80px;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  margin-bottom: 1.5rem;
}

.badge-text {
  padding: 0.375rem 1rem;
  background: linear-gradient(135deg, #dbeafe, #ede9fe);
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 9999px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.7;
  max-width: 480px;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

/* 按钮样式已迁移到 unocss shortcuts: btn-lg, btn-primary, btn-outline */

.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #9ca3af;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e5e7eb;
}

/* Hero 视觉 */
.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
}

.preview-card {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 16px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.preview-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.preview-dot.red {
  background: #ef4444;
}

.preview-dot.yellow {
  background: #f59e0b;
}

.preview-dot.green {
  background: #10b981;
}

.preview-title {
  margin-left: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
  font-family: monospace;
}

.preview-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 300px;
}

.markdown-content {
  padding: 1rem;
  background: #1e293b;
  font-family: monospace;
  font-size: 0.75rem;
  line-height: 1.6;
  overflow: hidden;
}

.md-line {
  color: #e2e8f0;
}

.md-line.heading {
  font-size: 1rem;
  font-weight: 700;
}

.md-line.subheading {
  font-size: 0.875rem;
  color: #94a3b8;
}

.md-line.empty {
  height: 0.75rem;
}

.md-hash {
  color: #f472b6;
}

.md-bold {
  color: #60a5fa;
}

.rendered-preview {
  padding: 1.5rem;
  background: white;
  font-size: 0.75rem;
  overflow: hidden;
}

.rp-header {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.rp-subtitle {
  font-size: 0.875rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.rp-section {
  margin-bottom: 0.75rem;
}

.rp-section-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.rp-item {
  color: #6b7280;
  font-size: 0.6875rem;
}

.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.card-1 {
  top: 10%;
  right: -10%;
  animation: float 4s ease-in-out infinite;
}

.card-2 {
  bottom: 15%;
  right: 5%;
  animation: float 4s ease-in-out infinite 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.blur-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.blur-circle.circle-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  top: -100px;
  right: 10%;
}

.blur-circle.circle-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  bottom: -50px;
  left: 30%;
}

/* 特性区域 */
.features {
  padding: 80px 0;
  background: white;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 4rem;
}

.section-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 9999px;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 1rem;
}

.section-desc {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  background: #fafafa;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: #e5e7eb;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.feature-icon.blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.feature-icon.purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.feature-icon.green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.feature-icon.orange {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.feature-icon.pink {
  background: linear-gradient(135deg, #ec4899, #db2777);
}

.feature-icon.cyan {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.feature-desc {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
}

/* 工作流程 */
.workflow {
  padding: 80px 0;
  background: linear-gradient(180deg, #fafafa 0%, #f3f4f6 100%);
}

.workflow-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.workflow-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-number {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 700;
  color: #d1d5db;
}

.step-content {
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  min-width: 200px;
}

.step-icon {
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.step-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

.workflow-arrow {
  color: #cbd5e1;
}

/* CTA 区域 */
.cta {
  padding: 80px 0;
  background: #111827;
  position: relative;
  overflow: hidden;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
  position: relative;
  z-index: 2;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
}

.cta-desc {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2rem;
}

/* CTA 按钮样式使用 unocss btn-primary 变体 */

.cta-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cta-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
}

.cta-circle.circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  left: -100px;
}

.cta-circle.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  right: -50px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .hero-visual {
    order: -1;
  }

  .preview-card {
    max-width: 400px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-container {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .nav-links {
    display: none;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .workflow-steps {
    flex-direction: column;
  }

  .workflow-arrow {
    transform: rotate(90deg);
  }

  .footer-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .cta-title {
    font-size: 1.75rem;
  }
}
</style>
