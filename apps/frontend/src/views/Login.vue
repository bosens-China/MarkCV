<template>
  <div class="login-page min-h-screen flex items-center justify-center">
    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <div class="i-lucide:file-text text-3xl text-white" />
            </div>
            <span class="logo-text">MarkCV</span>
          </div>
          <h1 class="brand-title">
            用 Markdown
            <br />
            <span class="gradient-text">书写专业简历</span>
          </h1>
          <p class="brand-desc">
            简洁、优雅的在线简历制作工具。支持实时预览、版本管理、PDF 导出，
            让你的简历脱颖而出。
          </p>
          <div class="feature-list">
            <div class="feature-item">
              <div class="i-lucide:check-circle text-emerald-400 text-lg" />
              <span>Markdown 实时编辑与预览</span>
            </div>
            <div class="feature-item">
              <div class="i-lucide:check-circle text-emerald-400 text-lg" />
              <span>A4 分页完美打印导出</span>
            </div>
            <div class="feature-item">
              <div class="i-lucide:check-circle text-emerald-400 text-lg" />
              <span>云端同步与版本历史</span>
            </div>
            <div class="feature-item">
              <div class="i-lucide:check-circle text-emerald-400 text-lg" />
              <span>多种精美模板一键套用</span>
            </div>
          </div>
        </div>
        <div class="brand-decoration">
          <div class="decoration-circle circle-1" />
          <div class="decoration-circle circle-2" />
          <div class="decoration-circle circle-3" />
        </div>
      </div>

      <!-- 右侧登录区域 -->
      <div class="auth-section">
        <div class="auth-card">
          <div class="auth-header">
            <h2 class="auth-title">欢迎回来</h2>
            <p class="auth-subtitle">使用 GitHub 账号快速登录</p>
          </div>

          <div class="auth-content">
            <button class="github-login-btn" @click="handleLogin">
              <div class="i-lucide:github text-xl" />
              <span>使用 GitHub 登录</span>
            </button>

            <div class="divider">
              <span>或</span>
            </div>

            <div class="guest-option">
              <router-link to="/home" class="guest-link">
                <div class="i-lucide:arrow-left text-sm" />
                <span>先逛逛，暂不登录</span>
              </router-link>
            </div>
          </div>

          <div class="auth-footer">
            <p class="terms-text">
              登录即表示你同意我们的
              <a href="#" @click.prevent="showTerms">使用条款</a>
              和
              <a href="#" @click.prevent="showPrivacy">隐私政策</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui';

defineOptions({
  name: 'LoginPage',
});
import { getGithubLoginUrl } from '../api/client';

const message = useMessage();

const handleLogin = () => {
  window.location.href = getGithubLoginUrl();
};

const showTerms = () => {
  message.info('使用条款功能开发中');
};

const showPrivacy = () => {
  message.info('隐私政策功能开发中');
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(56, 189, 248, 0.15), transparent),
    radial-gradient(ellipse 60% 40% at 80% 60%, rgba(99, 102, 241, 0.1), transparent);
  pointer-events: none;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 480px;
  max-width: 1200px;
  width: 100%;
  min-height: 600px;
  margin: 2rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* 品牌区域 */
.brand-section {
  position: relative;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.brand-content {
  position: relative;
  z-index: 2;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.brand-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  line-height: 1.15;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-desc {
  font-size: 1.125rem;
  color: rgba(226, 232, 240, 0.7);
  line-height: 1.7;
  max-width: 480px;
  margin-bottom: 2.5rem;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.9375rem;
}

/* 装饰圆圈 */
.brand-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 50px;
  right: 50px;
  opacity: 0.6;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: 30%;
  opacity: 0.4;
}

/* 登录区域 */
.auth-section {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
}

.auth-card {
  width: 100%;
  max-width: 360px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 0.9375rem;
  color: rgba(226, 232, 240, 0.6);
}

.auth-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.github-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #333, #1a1a1a);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.github-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.github-login-btn:active {
  transform: translateY(0);
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(226, 232, 240, 0.4);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.guest-option {
  text-align: center;
}

.guest-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(226, 232, 240, 0.6);
  font-size: 0.9375rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.guest-link:hover {
  color: rgba(226, 232, 240, 0.9);
}

.auth-footer {
  margin-top: 2.5rem;
  text-align: center;
}

.terms-text {
  font-size: 0.8125rem;
  color: rgba(226, 232, 240, 0.4);
  line-height: 1.5;
}

.terms-text a {
  color: rgba(226, 232, 240, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
}

.terms-text a:hover {
  color: rgba(226, 232, 240, 0.9);
}

/* 响应式 */
@media (max-width: 900px) {
  .login-container {
    grid-template-columns: 1fr;
    margin: 1rem;
  }

  .brand-section {
    padding: 2.5rem;
    min-height: auto;
  }

  .brand-title {
    font-size: 2rem;
  }

  .auth-section {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 2rem;
  }
}
</style>
