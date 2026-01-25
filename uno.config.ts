import { defineConfig, presetIcons, presetWind3 } from "unocss";

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    fontFamily: {
      sans: '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif',
      serif: '"Noto Serif SC", "Source Han Serif SC", "STSong", Georgia, serif',
    },
    // 统一设计 Token - 中文场景优化
    colors: {
      // 品牌色（与 Naive UI 主题同步）
      brand: {
        DEFAULT: '#111827',
        hover: '#374151',
        pressed: '#030712',
      },
    },
  },
  // 简写工具类
  shortcuts: {
    // 布局相关
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    // UI 组件统一样式
    'panel-header': 'px-4 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center',
    'toolbar-divider': 'h-6 w-px bg-gray-200 mx-2',
    'toolbar-label': 'text-xs text-gray-400 font-medium',
    // 隐藏滚动条
    'scrollbar-hide': 'scrollbar-width-none [&::-webkit-scrollbar]:hidden',
  },
});
