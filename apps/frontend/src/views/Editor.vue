<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <div v-if="!isReady" class="h-full flex items-center justify-center">
      <div class="animate-spin i-lucide:loader-2 text-blue-500 text-2xl"></div>
    </div>

    <template v-else>
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
        :is-auto-saving="isAutoSaving"
        :last-saved-at="lastSavedAt"
        @back="router.push('/dashboard')"
        @copy="copyMarkdown"
        @print="handlePrint"
        @export-markdown="exportMarkdown"
        @insert-snippet="insertSnippet"
        @apply-template="handleApplyTemplate"
        @save="handleManualSave"
        @show-history="showHistoryDrawer = true"
      />

      <div class="flex-1 overflow-hidden relative">
        <splitpanes class="default-theme" style="height: 100%">
          <pane min-size="20" :size="50">
            <EditorPane
              v-model:content="content"
              v-model:customCss="customCss"
              :show-css-pane="showCssPane"
              @change="onContentChange"
              @editor-ready="handleEditorReady"
            />
          </pane>

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

      <HistoryDrawer
        v-model:show="showHistoryDrawer"
        :history="currentResumeHistory"
        :active-timestamp="activeHistoryTimestamp"
        :loading="isHistoryLoading"
        @restore="handleRestore"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useClipboard, useDebounceFn, useEventListener } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import type { EditorView } from '@codemirror/view';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useMessage } from 'naive-ui';
import { useMarkdown } from '../composables/useMarkdown';
import { useResumeStore, type ResumeHistoryItem } from '../stores/resume';
import EditorToolbar from '../components/EditorToolbar.vue';
import HistoryDrawer from '../components/HistoryDrawer.vue';
import EditorPane from '../components/EditorPane.vue';
import PreviewPane from '../components/PreviewPane.vue';
import { RESUME_TEMPLATES } from '../constants/templates';

defineOptions({
  name: 'ResumeEditorPage',
});

interface LocalBackupPayload {
  title: string;
  content: string;
  themeColor: string;
  pageMargin: number;
  lineHeight: number;
  currentFont: string;
  customCss: string;
  savedAt: number;
}

const route = useRoute();
const router = useRouter();
const message = useMessage();
const resumeStore = useResumeStore();
const { isReady } = storeToRefs(resumeStore);
const resumeId = computed(() => route.params.id as string);

const resumeTitle = ref('');
const content = ref('');
const currentFont = ref('font-sans');
const themeColor = ref('#111827');
const pageMargin = ref(20);
const lineHeight = ref(1.5);
const customCss = ref('');
const showCssPane = ref(false);
const isDirty = ref(false);
const isAutoSaving = ref(false);
const isHistoryLoading = ref(false);
const showHistoryDrawer = ref(false);
const lastSavedAt = ref<number | null>(null);
const isHydrating = ref(false);

const previewPaneRef = ref<InstanceType<typeof PreviewPane> | null>(null);
const isRendering = computed(() => previewPaneRef.value?.isRendering || false);

const currentResumeHistory = computed(() => {
  const resume = resumeStore.getResume(resumeId.value);
  return resume?.history || [];
});

const activeHistoryTimestamp = computed(() => {
  const resume = resumeStore.getResume(resumeId.value);
  return resume?.activeHistoryTimestamp;
});

const editorView = shallowRef<EditorView | null>(null);

const backupStorageKey = computed(() => `markcv:resume-backup:${resumeId.value}`);

const buildLocalSnapshot = (): LocalBackupPayload => ({
  title: resumeTitle.value,
  content: content.value,
  themeColor: themeColor.value,
  pageMargin: pageMargin.value,
  lineHeight: lineHeight.value,
  currentFont: currentFont.value,
  customCss: customCss.value,
  savedAt: Date.now(),
});

const applySnapshot = (snapshot: LocalBackupPayload) => {
  resumeTitle.value = snapshot.title;
  content.value = snapshot.content;
  themeColor.value = snapshot.themeColor;
  pageMargin.value = snapshot.pageMargin;
  lineHeight.value = snapshot.lineHeight;
  currentFont.value = snapshot.currentFont;
  customCss.value = snapshot.customCss;
};

const readLocalBackup = (): LocalBackupPayload | null => {
  const raw = localStorage.getItem(backupStorageKey.value);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalBackupPayload;
  } catch {
    localStorage.removeItem(backupStorageKey.value);
    return null;
  }
};

const writeLocalBackup = () => {
  const payload = buildLocalSnapshot();
  localStorage.setItem(backupStorageKey.value, JSON.stringify(payload));
};

const clearLocalBackup = () => {
  localStorage.removeItem(backupStorageKey.value);
};

const hasMeaningfulBackup = (backup: LocalBackupPayload) => {
  const current = buildLocalSnapshot();
  return (
    backup.title !== current.title ||
    backup.content !== current.content ||
    backup.themeColor !== current.themeColor ||
    backup.pageMargin !== current.pageMargin ||
    backup.lineHeight !== current.lineHeight ||
    backup.currentFont !== current.currentFont ||
    backup.customCss !== current.customCss
  );
};

const handleEditorReady = (view: EditorView) => {
  editorView.value = view;
};

const { renderedContent } = useMarkdown(content);
const { copy, copied } = useClipboard();

const copyMarkdown = () => {
  void copy(content.value);
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

const loadVersions = async () => {
  try {
    isHistoryLoading.value = true;
    await resumeStore.loadRemoteVersions(resumeId.value);
  } finally {
    isHistoryLoading.value = false;
  }
};

const loadResume = async () => {
  try {
    const resume = await resumeStore.fetchResumeById(resumeId.value);
    if (!resume) {
      router.replace('/');
      return;
    }

    isHydrating.value = true;
    applySnapshot({
      title: resume.title,
      content: resume.content,
      themeColor: resume.themeColor,
      pageMargin: resume.pageMargin,
      lineHeight: resume.lineHeight,
      currentFont: resume.currentFont,
      customCss: resume.customCss,
      savedAt: resume.updatedAt,
    });
    isDirty.value = false;
    isHydrating.value = false;

    const backup = readLocalBackup();
    if (backup && hasMeaningfulBackup(backup)) {
      const useBackup = window.confirm(
        '检测到本地备份内容，是否采用本地备份？',
      );
      if (useBackup) {
        isHydrating.value = true;
        applySnapshot(backup);
        isHydrating.value = false;
        isDirty.value = true;
        message.warning('已采用本地备份，请确认后保存');
      }
      clearLocalBackup();
    }

    await loadVersions();
  } catch {
    message.error('加载简历失败');
    router.replace('/');
  } finally {
    isHydrating.value = false;
  }
};

// 监听路由参数变化，重新加载简历
watch(
  () => route.params.id,
  () => {
    if (isReady.value) {
      void loadResume();
    }
  },
);

// 初始加载
watch(
  isReady,
  (ready) => {
    if (ready) {
      void loadResume();
    }
  },
  { immediate: true },
);

watch(showHistoryDrawer, (visible) => {
  if (visible) {
    void loadVersions();
  }
});

const persistCurrentResume = async () => {
  resumeStore.updateResume(resumeId.value, {
    title: resumeTitle.value,
    content: content.value,
    themeColor: themeColor.value,
    pageMargin: pageMargin.value,
    lineHeight: lineHeight.value,
    currentFont: currentFont.value,
    customCss: customCss.value,
  });
  await resumeStore.saveRemote(resumeId.value);
};

const handleManualSave = async () => {
  try {
    isAutoSaving.value = true;
    writeLocalBackup();
    await persistCurrentResume();
    await resumeStore.createVersionSnapshot(resumeId.value);
    await loadVersions();
    clearLocalBackup();
    isDirty.value = false;
    lastSavedAt.value = Date.now();
    message.success('保存成功');
  } catch {
    message.error('保存失败，已保留本地备份');
  } finally {
    isAutoSaving.value = false;
  }
};

const triggerAutoSave = useDebounceFn(async () => {
  if (!isDirty.value || isAutoSaving.value) return;
  try {
    isAutoSaving.value = true;
    writeLocalBackup();
    await persistCurrentResume();
    clearLocalBackup();
    isDirty.value = false;
    lastSavedAt.value = Date.now();
  } catch {
    // 鑷姩淇濆瓨澶辫触鏃朵繚鐣欐湰鍦板浠斤紝绛夊緟鐢ㄦ埛鎵嬪姩澶勭悊
  } finally {
    isAutoSaving.value = false;
  }
}, 1200);

const handleRestore = async (item: ResumeHistoryItem) => {
  try {
    if (item.versionId) {
      const restored = await resumeStore.restoreVersion(resumeId.value, item.versionId);
      if (restored) {
        isHydrating.value = true;
        applySnapshot({
          title: restored.title,
          content: restored.content,
          themeColor: restored.themeColor,
          pageMargin: restored.pageMargin,
          lineHeight: restored.lineHeight,
          currentFont: restored.currentFont,
          customCss: restored.customCss,
          savedAt: restored.updatedAt,
        });
        isHydrating.value = false;
      }
    } else {
      isHydrating.value = true;
      content.value = item.content;
      if (item.title) resumeTitle.value = item.title;
      isHydrating.value = false;
      await persistCurrentResume();
    }

    clearLocalBackup();
    await loadVersions();
    isDirty.value = false;
    lastSavedAt.value = Date.now();
    message.success('已恢复到选定版本');
  } catch {
    message.error('恢复版本失败');
  } finally {
    isHydrating.value = false;
  }
};

const handleApplyTemplate = async (templateId: string) => {
  const selected = RESUME_TEMPLATES.find((item) => item.id === templateId);
  if (!selected) return;

  const confirmed = window.confirm(
    `确定应用模板「${selected.name}」吗？当前内容将被覆盖。`,
  );
  if (!confirmed) return;

  resumeTitle.value = selected.title;
  content.value = selected.content;
  isDirty.value = true;
  writeLocalBackup();
  await triggerAutoSave();
  message.success(`已应用模板：${selected.name}`);
};

const onContentChange = () => {
  if (isHydrating.value) return;
  isDirty.value = true;
  writeLocalBackup();
  void triggerAutoSave();
};

watch(
  [resumeTitle, themeColor, pageMargin, lineHeight, currentFont, customCss],
  () => {
    if (isHydrating.value) return;
    isDirty.value = true;
    writeLocalBackup();
    void triggerAutoSave();
  },
);

useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  const isSaveKey =
    (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
  if (!isSaveKey) return;
  event.preventDefault();
  void handleManualSave();
});

onBeforeRouteLeave((_to, _from, next) => {
  if (isDirty.value || isAutoSaving.value) {
    const answer = window.confirm('有未保存更改，确定离开吗？');
    if (answer) next();
    return;
  }
  next();
});

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isDirty.value || isAutoSaving.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

window.addEventListener('beforeunload', handleBeforeUnload);
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

const handlePrint = () => {
  previewPaneRef.value?.print();
};
</script>



