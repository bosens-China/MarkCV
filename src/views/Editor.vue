<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <div v-if="!isReady" class="h-full flex items-center justify-center">
      <div class="animate-spin i-lucide:loader-2 text-blue-500 text-2xl"></div>
    </div>

    <template v-else>
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
        @print="handlePrint"
        @export-markdown="exportMarkdown"
        @insert-snippet="insertSnippet"
        @save="handleManualSave"
        @show-history="showHistoryDrawer = true"
      />

      <!-- 主内容区 -->
      <div class="flex-1 overflow-hidden relative">
        <splitpanes class="default-theme" style="height: 100%">
          <!-- 左侧: 编辑器区域 -->
          <pane min-size="20" :size="50">
            <EditorPane
              v-model:content="content"
              v-model:customCss="customCss"
              :show-css-pane="showCssPane"
              @change="onContentChange"
              @editor-ready="handleEditorReady"
            />
          </pane>

          <!-- 右侧: 预览区 -->
          <pane min-size="20" :size="50">
            <PreviewPane
              ref="previewPaneRef"
              :html-content="renderedContent"
              :theme-color="themeColor"
              :page-margin="pageMargin"
              :line-height="lineHeight"
              :current-font="currentFont"
              :custom-css="customCss"
            />
          </pane>
        </splitpanes>
      </div>

      <!-- 历史记录抽屉 -->
      <HistoryDrawer
        v-model:show="showHistoryDrawer"
        :history="currentResumeHistory"
        :active-timestamp="activeHistoryTimestamp"
        @restore="handleRestore"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useClipboard } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useMessage } from 'naive-ui';

// Composables
import { useMarkdown } from '../composables/useMarkdown';
import { useResumeStore, type ResumeHistoryItem } from '../stores/resume';

// Components
import EditorToolbar from '../components/EditorToolbar.vue';
import HistoryDrawer from '../components/HistoryDrawer.vue';
import EditorPane from '../components/EditorPane.vue';
import PreviewPane from '../components/PreviewPane.vue';

// ============================================================================
// 路由与 Store
// ============================================================================
const route = useRoute();
const router = useRouter();
const message = useMessage();
const resumeStore = useResumeStore();
const { isReady } = storeToRefs(resumeStore);
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

const previewPaneRef = ref<InstanceType<typeof PreviewPane> | null>(null);
const isRendering = computed(() => previewPaneRef.value?.isRendering || false);

const currentResumeHistory = computed(() => {
  const resume = resumeStore.getResume(resumeId);
  return resume?.history || [];
});

const activeHistoryTimestamp = computed(() => {
  const resume = resumeStore.getResume(resumeId);
  return resume?.activeHistoryTimestamp;
});

// ============================================================================
// 初始化加载
// ============================================================================
const loadResume = () => {
  const resume = resumeStore.getResume(resumeId);
  if (resume) {
    resumeTitle.value = resume.title;
    content.value = resume.content;
    if (resume.themeColor) themeColor.value = resume.themeColor;
    if (resume.pageMargin !== undefined) pageMargin.value = resume.pageMargin;
    if (resume.lineHeight !== undefined) lineHeight.value = resume.lineHeight;
    if (resume.customCss) customCss.value = resume.customCss;
  } else {
    // 简历不存在
    router.replace('/');
  }
};

watch(
  isReady,
  (ready) => {
    if (ready) {
      loadResume();
    }
  },
  { immediate: true },
);

// ============================================================================
// 编辑器实例
// ============================================================================
const editorView = shallowRef<any>(null);

const handleEditorReady = (view: any) => {
  editorView.value = view;
};

// ============================================================================
// Markdown 解析
// ============================================================================
const { renderedContent } = useMarkdown(content);

// ============================================================================
// 剪贴板、导出与模板插入
// ============================================================================
const { copy, copied } = useClipboard();

const copyMarkdown = () => {
  copy(content.value);
  message.success('Markdown 内容已复制');
};

const exportMarkdown = () => {
  const title = resumeTitle.value || '未命名简历';
  const blob = new Blob([content.value], {
    type: 'text/markdown;charset=utf-8',
  });
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
const onContentChange = () => {
  isDirty.value = true;
};

const handleManualSave = async () => {
  // 更新 store 状态
  resumeStore.updateResume(resumeId, {
    title: resumeTitle.value,
    content: content.value,
    themeColor: themeColor.value,
    pageMargin: pageMargin.value,
    lineHeight: lineHeight.value,
    customCss: customCss.value,
  });

  // 持久化到存储
  await resumeStore.saveData();

  // 创建历史快照
  resumeStore.addHistorySnapshot(resumeId);

  isDirty.value = false;
  message.success('保存成功');
};

const handleRestore = async (item: ResumeHistoryItem) => {
  content.value = item.content;
  if (item.title) resumeTitle.value = item.title;
  // 恢复后立即触发保存
  await handleManualSave();
  message.success('已恢复到选定版本');
};

// 监听其他UI控件变化以标记为未保存
watch([resumeTitle, themeColor, pageMargin, lineHeight, currentFont], () => {
  onContentChange();
});

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
});

// ============================================================================
// 打印功能
// ============================================================================
const handlePrint = () => {
  previewPaneRef.value?.print();
};
</script>
