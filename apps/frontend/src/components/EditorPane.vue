<template>
  <div class="flex-1 flex flex-col min-w-0 bg-white shadow-sm h-full">
    <splitpanes class="custom-splitter h-full border-r border-gray-200">
      <!-- Markdown 编辑器 -->
      <pane min-size="20">
        <div class="h-full flex flex-col">
          <div class="panel-header justify-between flex-none">
            <div class="flex items-center gap-2">
              <div class="i-lucide:file-text text-gray-400" />
              <span>Markdown 内容</span>
            </div>
            <span
              class="text-blue-500 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded"
              >实时预览</span
            >
          </div>
          <div class="flex-1 overflow-hidden min-h-0">
            <codemirror
              v-model="localContent"
              placeholder="# 开始编写你的简历..."
              :style="{ height: '100%' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="editorExtensions"
              @ready="handleEditorReady"
              @change="handleChange"
            />
          </div>
        </div>
      </pane>

      <!-- CSS 编辑器 -->
      <pane v-if="showCssPane" min-size="10" size="30">
        <div class="h-full flex flex-col border-l border-gray-200">
          <div class="panel-header justify-between flex-none">
            <div class="flex items-center gap-2">
              <div class="i-lucide:code text-gray-400" />
              <span>自定义 CSS</span>
            </div>
            <span class="text-[10px] text-gray-400 font-mono"
              >.pagedjs_area</span
            >
          </div>
          <div class="flex-1 overflow-hidden min-h-0">
            <codemirror
              v-model="localCustomCss"
              placeholder="/* 输入 CSS 覆盖默认样式 */"
              :style="{ height: '100%' }"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="cssExtensions"
              @change="handleChange"
            />
          </div>
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { markdown } from '@codemirror/lang-markdown';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';

const props = defineProps<{
  content: string;
  customCss: string;
  showCssPane: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:content', value: string): void;
  (e: 'update:customCss', value: string): void;
  (e: 'change'): void;
  (e: 'editor-ready', view: any): void;
}>();

const localContent = computed({
  get: () => props.content,
  set: (val) => emit('update:content', val),
});

const localCustomCss = computed({
  get: () => props.customCss,
  set: (val) => emit('update:customCss', val),
});

const editorExtensions = [markdown(), oneDark];
const cssExtensions = [css(), oneDark];

const handleEditorReady = (payload: any) => {
  emit('editor-ready', payload.view);
};

const handleChange = () => {
  emit('change');
};
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

.panel-header {
  display: flex;
  align-items: center;
  height: 2.5rem; /* h-10 */
  padding-left: 1rem;
  padding-right: 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem; /* text-sm */
  font-weight: 500;
  color: #374151; /* text-gray-700 */
}
</style>
