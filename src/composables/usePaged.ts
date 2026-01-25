import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
import type { Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { Previewer } from 'pagedjs';

interface UsePagedOptions {
  content: Ref<string>;
  themeColor: Ref<string>;
  pageMargin: Ref<number>;
  lineHeight: Ref<number>;
  currentFont: Ref<string>;
  customCss: Ref<string>;
}

export function usePaged(options: UsePagedOptions) {
  const {
    content,
    themeColor,
    pageMargin,
    lineHeight,
    currentFont,
    customCss,
  } = options;

  const previewTarget = ref<HTMLElement | null>(null);
  const sourceContent = ref<HTMLElement | null>(null);
  const isRendering = ref(false);
  let pagedPreviewer: Previewer | null = null;
  let lastRenderedHash = '';

  const generatePagedStyles = (marginValue: string) => `
    :root {
      --pagedjs-width: 210mm;
      --pagedjs-height: 297mm;
      --pagedjs-pagebox-width: 210mm;
      --pagedjs-pagebox-height: 297mm;
      --pagedjs-margin-top: ${marginValue};
      --pagedjs-margin-right: ${marginValue};
      --pagedjs-margin-bottom: ${marginValue};
      --pagedjs-margin-left: ${marginValue};
      --resume-line-height: ${lineHeight.value};
      --theme-color: ${themeColor.value};
      --page-margin: ${marginValue};
    }
    
    @page { size: A4; margin: ${marginValue}; }
  `;

  // 简单的字符串哈希用于变更检测
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString();
  };

  const cleanup = () => {
    if (previewTarget.value) {
      previewTarget.value.innerHTML = '';
    }
    document
      .querySelectorAll('head > style[data-pagedjs-inserted-styles]')
      .forEach((el) => el.remove());
    pagedPreviewer = null;
  };

  const updatePreview = useDebounceFn(
    async (force = false) => {
      if (!previewTarget.value || !sourceContent.value) return;

      const marginValue = `${pageMargin.value}mm`;
      const styleString = generatePagedStyles(marginValue) + customCss.value;
      const contentString = sourceContent.value.innerHTML;

      // 创建当前状态的签名
      const currentHash = getHash(
        styleString + contentString + currentFont.value,
      );

      if (!force && currentHash === lastRenderedHash) {
        return;
      }

      isRendering.value = true;
      cleanup();

      await nextTick();

      pagedPreviewer = new Previewer();

      try {
        const contentClone = sourceContent.value.cloneNode(true) as HTMLElement;
        contentClone.style.display = 'block';

        const styleFragment = document.createDocumentFragment();

        // 继承样式
        document
          .querySelectorAll('style, link[rel="stylesheet"]')
          .forEach((el) => {
            if (!el.hasAttribute('data-pagedjs-inserted-styles')) {
              styleFragment.appendChild(el.cloneNode(true));
            }
          });

        const pagedStyleEl = document.createElement('style');
        pagedStyleEl.innerHTML = styleString;
        styleFragment.appendChild(pagedStyleEl);

        contentClone.insertBefore(styleFragment, contentClone.firstChild);

        await pagedPreviewer.preview(
          contentClone.innerHTML,
          [],
          previewTarget.value,
        );
        lastRenderedHash = currentHash;
      } catch (error) {
        console.error('Paged.js 渲染失败:', error);
      } finally {
        isRendering.value = false;
      }
    },
    500,
    { maxWait: 2000 },
  );

  watch(
    [content, themeColor, pageMargin, lineHeight, currentFont, customCss],
    () => {
      updatePreview();
    },
    { immediate: false },
  );

  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    previewTarget,
    sourceContent,
    isRendering,
    updatePreview,
  };
}
