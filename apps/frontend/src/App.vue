<template>
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme-overrides="themeOverrides"
  >
    <n-message-provider>
      <n-dialog-provider>
        <router-view></router-view>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui';
import { zhCN, dateZhCN } from 'naive-ui';
import type { GlobalThemeOverrides } from 'naive-ui';
import { onMounted } from 'vue';
import { useResumeStore } from './stores/resume';
import { useAuthStore } from './stores/auth';

const resumeStore = useResumeStore();
const authStore = useAuthStore();

onMounted(() => {
  void (async () => {
    await authStore.init();
    if (authStore.isAuthenticated) {
      await resumeStore.init();
      return;
    }
    resumeStore.markReady();
  })();
});

/**
 * 自定义主题配置
 * 调整 Naive UI 的默认样式以匹配现代简约风格
 */
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#111827', // Gray-900 作为主色
    primaryColorHover: '#374151',
    primaryColorPressed: '#030712',
    primaryColorSuppl: '#374151',
    borderRadius: '8px', // 更圆润的边角
    fontFamily: '"Noto Sans SC", system-ui, -apple-system, sans-serif',
  },
  Button: {
    fontWeight: '500',
  },
  Card: {
    borderRadius: '12px',
  },
  Input: {
    borderRadius: '8px',
  },
};
</script>
