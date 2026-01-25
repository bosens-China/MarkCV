import { ref, watch } from 'vue';
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
  const { content, themeColor, pageMargin, lineHeight, currentFont, customCss } = options;

  const previewTarget = ref<HTMLElement | null>(null);
  const sourceContent = ref<HTMLElement | null>(null);
  const isRendering = ref(false);
  let pagedPreviewer: any = null;

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

  const updatePreview = useDebounceFn(async () => {
    if (!previewTarget.value || !sourceContent.value) return;

    isRendering.value = true;
    document.querySelectorAll('head > style[data-pagedjs-inserted-styles]').forEach(el => el.remove());
    previewTarget.value.innerHTML = '';
    pagedPreviewer = new Previewer();
    
    try {
      const contentClone = sourceContent.value.cloneNode(true) as HTMLElement;
      contentClone.style.display = 'block';
      const styleFragment = document.createDocumentFragment();
      const marginValue = `${pageMargin.value}mm`;
      
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
        styleFragment.appendChild(el.cloneNode(true));
      });
      
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
  }, 400, { maxWait: 2000 });

  watch(
    [content, themeColor, pageMargin, lineHeight, currentFont, customCss],
    () => {
      updatePreview();
    },
    { immediate: false }
  );

  return {
    previewTarget,
    sourceContent,
    isRendering,
    updatePreview,
  };
}
