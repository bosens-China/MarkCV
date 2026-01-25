/**
 * Paged.js 预览渲染 Composable
 * 处理简历的分页预览和打印
 */
import { ref, watch, nextTick, type Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { Previewer } from 'pagedjs';

export interface PagedPreviewOptions {
  /** 预览目标容器 */
  previewTarget: Ref<HTMLElement | null>;
  /** 源内容容器 */
  sourceContent: Ref<HTMLElement | null>;
  /** 渲染后的 HTML 内容 */
  renderedContent: Ref<string>;
  /** 主题色 */
  themeColor: Ref<string>;
  /** 页面边距 (mm) */
  pageMargin: Ref<number>;
  /** 行高 */
  lineHeight: Ref<number>;
  /** 当前字体 */
  currentFont: Ref<string>;
  /** 自定义 CSS */
  customCss: Ref<string>;
}

/**
 * usePagedPreview Composable
 */
export function usePagedPreview(options: PagedPreviewOptions) {
  const {
    previewTarget,
    sourceContent,
    renderedContent,
    themeColor,
    pageMargin,
    lineHeight,
    currentFont,
    customCss,
  } = options;

  const isRendering = ref(false);
  let pagedPreviewer: any = null;

  /**
   * 生成 Paged.js 动态样式
   */
  const generatePagedStyles = (marginValue: string) => `
    /* Paged.js 动态配置 - 覆盖默认变量 */
    :root {
      /* 页面尺寸 - A4 */
      --pagedjs-width: 210mm;
      --pagedjs-height: 297mm;
      --pagedjs-pagebox-width: 210mm;
      --pagedjs-pagebox-height: 297mm;
      
      /* 页面边距 */
      --pagedjs-margin-top: ${marginValue};
      --pagedjs-margin-right: ${marginValue};
      --pagedjs-margin-bottom: ${marginValue};
      --pagedjs-margin-left: ${marginValue};
      
      /* 主题变量 */
      --resume-line-height: ${lineHeight.value};
      --theme-color: ${themeColor.value};
      --page-margin: ${marginValue};
    }
    
    @page { 
      size: A4; 
      margin: ${marginValue};
    }
    
    /* 预览区样式 */
    .pagedjs_pages { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      width: 100%; 
      padding: 0;
      gap: 24px;
    }
    
    .pagedjs_page { 
      background: white; 
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
      flex: none;
      width: var(--pagedjs-width) !important;
      height: var(--pagedjs-height) !important;
      overflow: hidden;
    }
    
    .pagedjs_area { 
      line-height: var(--resume-line-height, ${lineHeight.value}) !important;
    }
    
    /* 布局样式强化 */
    .layout-row {
      display: flex !important;
      flex-direction: row !important;
      justify-content: space-between !important;
      align-items: baseline !important;
      width: 100% !important;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    .layout-left {
      display: block !important;
      flex: 1 1 auto !important;
      text-align: left !important;
    }
    
    .layout-right {
      display: block !important;
      flex: 0 0 auto !important;
      text-align: right !important;
    }
    
    /* 防止标题跨页断裂 */
    h2, h3 {
      break-after: avoid;
      page-break-after: avoid;
    }
  `;

  /**
   * 更新预览（带防抖）
   */
  const updatePreview = useDebounceFn(async () => {
    if (!previewTarget.value || !sourceContent.value) return;

    isRendering.value = true;
    
    // 清理上一次 Paged.js 注入的样式
    document.querySelectorAll('head > style[data-pagedjs-inserted-styles]').forEach(el => el.remove());
    previewTarget.value.innerHTML = '';
    pagedPreviewer = new Previewer();
    
    try {
      const contentClone = sourceContent.value.cloneNode(true) as HTMLElement;
      contentClone.style.display = 'block';
      const styleFragment = document.createDocumentFragment();
      const marginValue = `${pageMargin.value}mm`;
      
      // 1. 先复制现有样式表
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
        styleFragment.appendChild(el.cloneNode(true));
      });
      
      // 2. 再注入动态样式
      const pagedStyleEl = document.createElement('style');
      pagedStyleEl.innerHTML = generatePagedStyles(marginValue);
      styleFragment.appendChild(pagedStyleEl);
      
      contentClone.insertBefore(styleFragment, contentClone.firstChild);

      await pagedPreviewer.preview(contentClone.innerHTML, [], previewTarget.value);
    } catch (error) {
      console.error('Paged.js rendering failed:', error);
    } finally {
      isRendering.value = false;
    }
  }, 300, { maxWait: 1500 });

  /**
   * 监听依赖变化自动更新预览
   */
  watch(
    [renderedContent, themeColor, pageMargin, lineHeight, currentFont, customCss],
    () => updatePreview(),
    { immediate: false }
  );

  /**
   * 打印简历
   */
  const printResume = async () => {
    if (isRendering.value) {
      alert('正在进行排版计算，请稍后...');
      return;
    }
    
    await nextTick();
    
    // 移除可能的空白页
    const pages = previewTarget.value?.querySelectorAll('.pagedjs_page');
    if (pages && pages.length > 0) {
      pages.forEach((page, index) => {
        const content = page.querySelector('.pagedjs_page_content');
        if (content && !content.textContent?.trim() && index > 0) {
          (page as HTMLElement).style.display = 'none';
        }
      });
    }
    
    window.print();
  };

  return {
    isRendering,
    updatePreview,
    printResume,
  };
}
