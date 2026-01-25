<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 顶部工具栏 -->
    <EditorToolbar
      v-model:title="resumeTitle"
      v-model:themeColor="themeColor"
      v-model:pageMargin="pageMargin"
      v-model:lineHeight="lineHeight"
      v-model:currentFont="currentFont"
      v-model:showCssPane="showCssPane"
      :is-rendering="isRendering"
      :copied="copied"
      :has-unsaved-changes="isDirty"
      @back="router.push('/')"
      @copy="copyMarkdown"
      @print="printResume"
      @export-markdown="exportMarkdown"
      @insert-snippet="insertSnippet"
      @save="handleManualSave"
      @show-history="showHistoryDrawer = true"
    />

    <!-- 主内容区 -->
    <div class="flex-1 overflow-hidden flex flex-row relative">
      
      <!-- 左侧: 编辑器区域 -->
      <div class="flex-1 flex flex-col min-w-0 bg-white shadow-sm">
        <splitpanes class="custom-splitter h-full border-r border-gray-200">
          
          <!-- Markdown 编辑器 -->
          <pane min-size="20">
            <div class="h-full flex flex-col">
              <div class="panel-header justify-between">
                <div class="flex items-center gap-2">
                  <div class="i-lucide:file-text text-gray-400" />
                  <span>Markdown 内容</span>
                </div>
                <span class="text-blue-500 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">实时预览</span>
              </div>
              <codemirror
                v-model="content"
                placeholder="# 开始编写你的简历..."
                :style="{ height: '100%' }"
                :autofocus="true"
                :indent-with-tab="true"
                :tab-size="2"
                :extensions="editorExtensions"
                @ready="handleEditorReady"
                @change="debouncedSave"
              />
            </div>
          </pane>

          <!-- CSS 编辑器 -->
          <pane v-if="showCssPane" min-size="10" size="30">
            <div class="h-full flex flex-col border-l border-gray-200">
              <div class="panel-header justify-between">
                <div class="flex items-center gap-2">
                  <div class="i-lucide:code text-gray-400" />
                  <span>自定义 CSS</span>
                </div>
                <span class="text-[10px] text-gray-400 font-mono">.pagedjs_area</span>
              </div>
              <codemirror
                v-model="customCss"
                placeholder="/* 输入 CSS 覆盖默认样式 */"
                :style="{ height: '100%' }"
                :indent-with-tab="true"
                :tab-size="2"
                :extensions="cssExtensions"
                @change="debouncedSave"
              />
            </div>
          </pane>
        </splitpanes>
      </div>

      <!-- 右侧: 预览区 -->
      <div 
        class="bg-gray-100/50 overflow-y-auto flex-shrink-0 preview-pane print:bg-white print:w-full print:block relative scrollbar-hide"
        style="width: calc(210mm + 80px);"
      >
        <!-- 加载状态 -->
        <div v-if="isRendering" class="absolute top-6 right-6 z-50 bg-white/80 backdrop-blur rounded-full p-2 shadow-lg">
          <div class="animate-spin i-lucide:loader-2 text-blue-500 text-xl"></div>
        </div>

        <div class="flex justify-center py-8 min-h-full print:py-0 print:block">
          <div ref="previewTarget" class="pagedjs-render-container"></div>
          
          <!-- 隐藏的源内容 -->
          <div style="display: none;">
            <div ref="sourceContent">
              <div :class="currentFont" class="resume-content-wrapper">
                <div v-html="renderedContent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 动态注入样式 -->
    <component :is="'style'" v-if="customCss">
      {{ customCss }}
    </component>
    <component :is="'style'">
      :root {
        --theme-color: {{ themeColor }};
        --page-margin: {{ pageMargin }}mm;
      }
    </component>

    <!-- 历史记录抽屉 -->
    <HistoryDrawer
      v-model:show="showHistoryDrawer"
      :history="currentResumeHistory"
      :active-timestamp="activeHistoryTimestamp"
      @restore="handleRestore"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useDebounceFn, useClipboard } from '@vueuse/core';
import { Codemirror } from 'vue-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

// Composables
import { useMarkdown } from '../composables/useMarkdown';
import { useResumeStore, type ResumeHistoryItem } from '../stores/resume';
import { usePaged } from '../composables/usePaged';

// Components
import EditorToolbar from '../components/EditorToolbar.vue';
import HistoryDrawer from '../components/HistoryDrawer.vue';

// ============================================================================
// 路由与 Store
// ============================================================================
const route = useRoute();
const router = useRouter();
const resumeStore = useResumeStore();
const resumeId = route.params.id as string;

// ============================================================================
// 简历数据状态
// ============================================================================
const resumeTitle = ref('');
const content = ref('');
const currentFont = ref('font-sans');
const themeColor = ref('#111827');
const pageMargin = ref(20);
const lineHeight = ref(1.5);
const customCss = ref('');
const showCssPane = ref(false);
const isDirty = ref(false); // 未保存状态
const showHistoryDrawer = ref(false);

const currentResumeHistory = computed(() => {
  const resume = resumeStore.getResume(resumeId);
  return resume?.history || [];
});

const activeHistoryTimestamp = computed(() => {
  const resume = resumeStore.getResume(resumeId);
  return resume?.activeHistoryTimestamp;
});

// ============================================================================
// 编辑器实例
// ============================================================================
const editorView = shallowRef<any>(null);

const handleEditorReady = (payload: any) => {
  editorView.value = payload.view;
};

// ============================================================================
// Markdown 解析
// ============================================================================
const { renderedContent } = useMarkdown(content);

// ============================================================================
// Paged.js 预览 (使用 Composable)
// ============================================================================
const {
  previewTarget,
  sourceContent,
  isRendering,
  updatePreview
} = usePaged({
  content: renderedContent,
  themeColor,
  pageMargin,
  lineHeight,
  currentFont,
  customCss,
});

// ============================================================================
// 剪贴板、导出与模板插入
// ============================================================================
const { copy, copied } = useClipboard();

const copyMarkdown = () => {
  copy(content.value);
};

const exportMarkdown = () => {
  const title = resumeTitle.value || '未命名简历';
  const blob = new Blob([content.value], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

const insertSnippet = (snippet: string) => {
  const view = editorView.value;
  if (!view) return;

  const from = view.state.selection.main.head;
  let cursorPos = from + snippet.length;

  // 智能光标定位
  const rowBlockPos = snippet.indexOf('::: left\n');
  if (rowBlockPos !== -1) {
    cursorPos = from + rowBlockPos + '::: left\n'.length + 1;
  }

  view.dispatch({
    changes: { from, insert: snippet },
    selection: { anchor: cursorPos },
    userEvent: 'input',
  });
  view.focus();
};

// ============================================================================
// 数据持久化与未保存拦截
// ============================================================================
const saveChanges = () => {
  resumeStore.updateResume(resumeId, {
    title: resumeTitle.value,
    content: content.value,
    themeColor: themeColor.value,
    pageMargin: pageMargin.value,
    lineHeight: lineHeight.value,
    customCss: customCss.value,
  });
  isDirty.value = false;
};

const debouncedSave = useDebounceFn(saveChanges, 500);

const handleManualSave = () => {
  saveChanges();
  // 强制创建历史快照
  resumeStore.addHistorySnapshot(resumeId);
  // 提示用户保存成功（可选，使用 naive-ui message，这里简化处理）
};

const handleRestore = (item: ResumeHistoryItem) => {
  content.value = item.content;
  if (item.title) resumeTitle.value = item.title;
  // 恢复后立即保存并重置脏状态
  saveChanges();
  resumeStore.addHistorySnapshot(resumeId); // 恢复也是一种修改，记录一下
};

// 监听UI控件变化以自动保存
watch(
  [content, resumeTitle, themeColor, pageMargin, lineHeight, currentFont, customCss],
  () => {
    isDirty.value = true;
    debouncedSave();
  },
  { deep: true, immediate: false }
);

// 路由离开拦截
onBeforeRouteLeave((_to, _from, next) => {
  if (isDirty.value) {
    const answer = window.confirm('您有未保存的更改，确定要离开吗？');
    if (answer) {
      next();
    }
  } else {
    next();
  }
});

// 窗口关闭/刷新拦截
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

window.addEventListener('beforeunload', handleBeforeUnload);

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  // 组件卸载前尝试最后一次保存
  if (isDirty.value) {
    saveChanges();
  }
});

// ============================================================================
// 打印功能
// ============================================================================
const printResume = async () => {
  if (isRendering.value) {
    alert('正在进行排版计算，请稍后...');
    return;
  }
  
  await nextTick();
  
  // 移除空白页
  const pages = previewTarget.value?.querySelectorAll('.pagedjs_page');
  if (pages && pages.length > 0) {
    pages.forEach((page, index) => {
      const pageContent = page.querySelector('.pagedjs_page_content');
      if (pageContent && !pageContent.textContent?.trim() && index > 0) {
        (page as HTMLElement).style.display = 'none';
      }
    });
  }
  
  window.print();
};

// ============================================================================
// CodeMirror 配置
// ============================================================================
const editorExtensions = [markdown(), oneDark];
const cssExtensions = [css(), oneDark];

// ============================================================================
// 初始化
// ============================================================================
onMounted(async () => {
  const resume = resumeStore.getResume(resumeId);
  if (resume) {
    resumeTitle.value = resume.title;
    content.value = resume.content;
    if (resume.themeColor) themeColor.value = resume.themeColor;
    if (resume.pageMargin !== undefined) pageMargin.value = resume.pageMargin;
    if (resume.lineHeight !== undefined) lineHeight.value = resume.lineHeight;
    if (resume.customCss) customCss.value = resume.customCss;
    await nextTick();
    // 显式访问 sourceContent 以避免 TS 报错（虽然它在模板中已绑定）
    if (sourceContent.value) { /* no-op */ }
    updatePreview();
  } else {
    router.replace('/');
  }
});
</script>

<style scoped>
:deep(.splitpanes__splitter) {
  background-color: #f3f4f6;
  width: 4px;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
}
:deep(.splitpanes__splitter:hover) {
  background-color: #d1d5db;
}
</style>
