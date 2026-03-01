<template>
  <div class="about-page">
    <!-- 导航栏 -->
    <Navbar />

    <!-- 关于内容 -->
    <main class="about-content">
      <div class="about-container">
        <h1 class="about-title">关于 MarkCV</h1>
        <div class="about-text">
          <p>
            市面上已有不少简历工具，有的通过配置项生成，有的支持 Markdown 编辑，但大多存在功能限制或需要付费。
          </p>
          <p>
            作为一名程序员，我希望在解决自己需求的同时，也能把这个项目开源出来，让更多人受益。MarkCV 由此诞生——一个简洁、免费、开源的 Markdown 简历制作工具。
          </p>
        </div>
        <div class="about-actions">
          <a :href="GITHUB_REPO" target="_blank" rel="noopener" class="btn-github">
            <div class="i-lucide:github text-lg" />
            <span>查看 GitHub 仓库</span>
          </a>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
import AppFooter from '../components/AppFooter.vue';
import { GITHUB_REPO } from '../constants';

defineOptions({
  name: 'AboutPage',
});
</script>

<style scoped>
/* 关于内容 */
.about-content {
  min-height: 100vh;
  padding: 120px 2rem 80px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-container {
  max-width: 680px;
  text-align: center;
}

.about-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
}

.about-text {
  margin-bottom: 2.5rem;
}

.about-text p {
  font-size: 1.125rem;
  color: #4b5563;
  line-height: 1.8;
  margin: 0 0 1rem;
}

.about-text p:last-child {
  margin-bottom: 0;
}

.about-actions {
  display: flex;
  justify-content: center;
}

.btn-github {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: #111827;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.btn-github:hover {
  background: #374151;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 响应式 */
@media (max-width: 640px) {
  .about-title {
    font-size: 1.875rem;
  }

  .about-text {
    font-size: 1.125rem;
  }
}
</style>
