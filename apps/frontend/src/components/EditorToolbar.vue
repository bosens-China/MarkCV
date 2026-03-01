<template>
  <header
    class="h-16 border-b border-gray-200 bg-white flex items-center px-4 justify-between shrink-0 z-10 sticky top-0 no-print shadow-sm gap-4"
  >
    <div class="flex items-center gap-3 min-w-0">
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            quaternary
            circle
            size="small"
            aria-label="返回管理台"
            @click="$emit('back')"
          >
            <template #icon>
              <div
                class="i-lucide:arrow-left text-lg text-gray-500"
                aria-hidden="true"
              />
            </template>
          </n-button>
        </template>
        返回管理台
      </n-tooltip>

      <div class="h-6 w-px bg-gray-200 mx-1"></div>

      <div class="flex flex-col justify-center min-w-0">
        <n-input
          :value="title"
          @update:value="$emit('update:title', $event)"
          placeholder="未命名简历"
          size="small"
          :bordered="false"
          class="font-semibold text-base min-w-[220px] hover:bg-gray-50 -ml-2"
        />
        <div
          class="text-[10px] flex items-center gap-1.5 select-none -ml-1 px-1 text-gray-500"
        >
          <div
            :class="
              isAutoSaving
                ? 'i-lucide:loader-2 animate-spin'
                : hasUnsavedChanges
                  ? 'i-lucide:cloud-off'
                  : 'i-lucide:cloud-check'
            "
            class="text-xs"
          />
          <span>
            {{ saveStatusText }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            size="small"
            :type="hasUnsavedChanges ? 'primary' : 'default'"
            :secondary="!hasUnsavedChanges"
            :disabled="!hasUnsavedChanges || isAutoSaving"
            @click="$emit('save')"
          >
            <template #icon>
              <div
                :class="
                  isAutoSaving
                    ? 'i-lucide:loader-2 animate-spin'
                    : 'i-lucide:save'
                "
              />
            </template>
            保存
          </n-button>
        </template>
        快捷键: Ctrl/Cmd + S
      </n-tooltip>

      <div class="h-6 w-px bg-gray-200 mx-1"></div>

      <n-dropdown
        trigger="click"
        :options="templateOptions"
        @select="(key: string) => $emit('apply-template', key)"
      >
        <n-button size="small" secondary>
          <template #icon>
            <div class="i-lucide:layout-panel-left" />
          </template>
          套用模板
        </n-button>
      </n-dropdown>

      <n-dropdown
        trigger="click"
        :options="snippetOptions"
        @select="(key: string) => $emit('insert-snippet', key)"
      >
        <n-button size="small" secondary>
          <template #icon>
            <div class="i-lucide:square-stack" />
          </template>
          插入块
        </n-button>
      </n-dropdown>

      <n-popover
        trigger="click"
        placement="bottom"
        :show-arrow="false"
        raw
        style="padding: 0"
      >
        <template #trigger>
          <n-button size="small" secondary>
            <template #icon>
              <div class="i-lucide:palette" />
            </template>
            外观
          </n-button>
        </template>

        <div
          class="w-72 bg-white rounded-lg shadow-xl border border-gray-100 p-4 flex flex-col gap-5"
        >
          <div class="flex flex-col gap-2">
            <span
              class="text-xs font-bold text-gray-500 uppercase tracking-wider"
              >主题色</span
            >
            <div class="flex flex-wrap gap-2">
              <div
                v-for="color in THEME_COLORS"
                :key="color.value"
                class="w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110"
                :style="{ backgroundColor: color.value }"
                :class="{
                  'ring-2 ring-offset-2 ring-gray-300':
                    themeColor === color.value,
                }"
                :title="color.label"
                @click="$emit('update:themeColor', color.value)"
              >
                <div
                  v-if="themeColor === color.value"
                  class="i-lucide:check text-white text-xs drop-shadow-md"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <span
              class="text-xs font-bold text-gray-500 uppercase tracking-wider"
              >排版</span
            >
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <span class="text-xs text-gray-400">页边距</span>
                <n-select
                  :value="pageMargin"
                  @update:value="$emit('update:pageMargin', $event)"
                  :options="
                    MARGIN_OPTIONS.map((m) => ({ label: `${m}mm`, value: m }))
                  "
                  size="small"
                />
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-gray-400">行高</span>
                <n-select
                  :value="lineHeight"
                  @update:value="$emit('update:lineHeight', $event)"
                  :options="LINE_HEIGHT_OPTIONS"
                  size="small"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-gray-400">字体</span>
              <n-select
                :value="currentFont"
                @update:value="$emit('update:currentFont', $event)"
                :options="FONT_OPTIONS"
                size="small"
              />
            </div>
          </div>

          <div class="h-px bg-gray-100"></div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="i-lucide:code text-gray-400" />
              <span class="text-sm text-gray-700">CSS 编辑器</span>
            </div>
            <n-switch
              :value="showCssPane"
              @update:value="$emit('update:showCssPane', $event)"
              size="small"
            />
          </div>
        </div>
      </n-popover>

      <div class="h-6 w-px bg-gray-200 mx-1"></div>

      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            quaternary
            circle
            size="small"
            aria-label="版本历史"
            @click="$emit('show-history')"
          >
            <template #icon>
              <div
                class="i-lucide:history text-gray-500"
                aria-hidden="true"
              />
            </template>
          </n-button>
        </template>
        版本历史
      </n-tooltip>

      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            quaternary
            circle
            size="small"
            aria-label="复制 Markdown"
            @click="$emit('copy')"
          >
            <template #icon>
              <div class="i-lucide:copy text-gray-500" aria-hidden="true" />
            </template>
          </n-button>
        </template>
        复制 Markdown
      </n-tooltip>

      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            quaternary
            circle
            size="small"
            aria-label="导出 Markdown"
            @click="$emit('export-markdown')"
          >
            <template #icon>
              <div
                class="i-lucide:file-down text-gray-500"
                aria-hidden="true"
              />
            </template>
          </n-button>
        </template>
        导出 Markdown
      </n-tooltip>

      <n-button
        type="primary"
        size="small"
        @click="$emit('print')"
        :loading="isRendering"
        class="ml-1"
      >
        <template #icon>
          <div class="i-lucide:download" />
        </template>
        导出 PDF
      </n-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DropdownOption } from 'naive-ui';
import {
  THEME_COLORS,
  MARGIN_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  FONT_OPTIONS,
} from '../composables/useResumeSettings';
import { RESUME_TEMPLATES } from '../constants/templates';

const snippetOptions: DropdownOption[] = [
  {
    type: 'group',
    label: '布局容器',
    key: 'layouts',
    children: [
      {
        label: '双栏布局 (row)',
        key: '\n:::: row\n::: left\n\n:::\n::: right\n\n:::\n::::\n',
      },
      {
        label: '三栏布局 (3-cols)',
        key: '\n:::: cols-3\n<div>\n\n</div>\n<div>\n\n</div>\n<div>\n\n</div>\n::::\n',
      },
    ],
  },
  {
    type: 'group',
    label: '对齐方式',
    key: 'alignments',
    children: [
      { label: '左对齐 (left)', key: '\n::: left\n\n:::\n' },
      { label: '居中 (center)', key: '\n::: center\n\n:::\n' },
      { label: '右对齐 (right)', key: '\n::: right\n\n:::\n' },
    ],
  },
];

const templateOptions: DropdownOption[] = RESUME_TEMPLATES.map((item) => ({
  label: `${item.name} · ${item.description}`,
  key: item.id,
}));

const props = defineProps<{
  title: string;
  themeColor: string;
  pageMargin: number;
  lineHeight: number;
  currentFont: string;
  showCssPane: boolean;
  isRendering: boolean;
  copied: boolean;
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
  lastSavedAt: number | null;
}>();

const saveStatusText = computed(() => {
  if (props.isAutoSaving) return '自动保存中...';
  if (props.hasUnsavedChanges) return '有未保存更改';
  if (props.lastSavedAt) {
    return `已保存于 ${new Date(props.lastSavedAt).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;
  }
  return '已同步';
});

defineEmits<{
  (e: 'back'): void;
  (e: 'update:title', value: string): void;
  (e: 'update:themeColor', value: string): void;
  (e: 'update:pageMargin', value: number): void;
  (e: 'update:lineHeight', value: number): void;
  (e: 'update:currentFont', value: string): void;
  (e: 'update:showCssPane', value: boolean): void;
  (e: 'copy'): void;
  (e: 'print'): void;
  (e: 'export-markdown'): void;
  (e: 'insert-snippet', snippet: string): void;
  (e: 'apply-template', templateId: string): void;
  (e: 'save'): void;
  (e: 'show-history'): void;
}>();
</script>
