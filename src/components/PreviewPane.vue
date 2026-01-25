<template>
  <div
    class="bg-gray-100/50 overflow-auto flex-shrink-0 preview-pane print:bg-white print:w-full print:block relative scrollbar-hide w-full h-full"
  >
    <!-- 加载状态 -->
    <div
      v-if="isRendering"
      class="absolute top-6 right-6 z-50 bg-white/80 backdrop-blur rounded-full p-2 shadow-lg"
    >
      <div class="animate-spin i-lucide:loader-2 text-blue-500 text-xl"></div>
    </div>

    <div class="flex justify-center py-8 min-h-full print:py-0 print:block">
      <div ref="previewTarget" class="pagedjs-render-container"></div>

      <!-- 隐藏的源内容 -->
      <div style="display: none">
        <div ref="sourceContent">
          <div :class="currentFont" class="resume-content-wrapper">
            <div v-html="htmlContent"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, nextTick, onMounted } from 'vue';
import { usePaged } from '../composables/usePaged';

const props = defineProps<{
  htmlContent: string;
  themeColor: string;
  pageMargin: number;
  lineHeight: number;
  currentFont: string;
  customCss: string;
}>();

const {
  htmlContent,
  themeColor,
  pageMargin,
  lineHeight,
  currentFont,
  customCss,
} = toRefs(props);

const { previewTarget, sourceContent, isRendering, updatePreview } = usePaged({
  content: htmlContent, // usePaged expects a Ref<string>, toRefs provides it
  themeColor,
  pageMargin,
  lineHeight,
  currentFont,
  customCss,
});

onMounted(() => {
  // 确保初次渲染
  if (sourceContent.value) {
    updatePreview();
  }
});

const handlePrint = async () => {
  if (isRendering.value) {
    alert('正在进行排版计算，请稍后...');
    return;
  }

  await nextTick();

  // 移除空白页逻辑
  const pages = previewTarget.value?.querySelectorAll('.pagedjs_page');
  if (pages && pages.length > 0) {
    pages.forEach((page, index) => {
      const pageContent = page.querySelector('.pagedjs_page_content');
      // 简单的检查，如果内容看起来是空的
      if (pageContent && !pageContent.textContent?.trim() && index > 0) {
        (page as HTMLElement).style.display = 'none';
      }
    });
  }

  window.print();
};

defineExpose({
  print: handlePrint,
  isRendering,
});
</script>

<style scoped>
@media print {
  .preview-pane {
    position: static !important;
    overflow: visible !important;
    height: auto !important;
    width: 100% !important;
    display: block !important;
    background: white !important;
  }
}
</style>
