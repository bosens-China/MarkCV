<template>
  <header
    class="h-16 border-b border-gray-200 bg-white flex items-center px-4 justify-between flex-shrink-0 z-10 sticky top-0 no-print shadow-sm gap-4"
  >
    <!-- ================================================= -->
    <!-- 左侧：导航与元数据 -->
    <!-- ================================================= -->
    <div class="flex items-center gap-3 min-w-0">
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button quaternary circle size="small" @click="$emit('back')">
            <template #icon>
              <div class="i-lucide:arrow-left text-lg text-gray-500" />
            </template>
          </n-button>
        </template>
        返回仪表盘
      </n-tooltip>

      <div class="h-6 w-px bg-gray-200 mx-1"></div>

      <div class="flex flex-col justify-center min-w-0">
        <n-input
          :value="title"
          @update:value="$emit('update:title', $event)"
          placeholder="未命名简历"
          size="small"
          :bordered="false"
          class="font-semibold text-base min-w-[200px] hover:bg-gray-50 -ml-2"
        />
        <!-- 保存状态指示器 (Notion 风格) -->
        <div
          class="text-[10px] flex items-center gap-1.5 cursor-pointer select-none transition-colors -ml-1 px-1 rounded hover:bg-gray-100 w-fit"
          :class="hasUnsavedChanges ? 'text-amber-600' : 'text-gray-400'"
          @click="$emit('save')"
        >
          <div
            :class="
              hasUnsavedChanges ? 'i-lucide:cloud-off' : 'i-lucide:cloud-check'
            "
            class="text-xs"
          />
          <span>{{
            hasUnsavedChanges ? '有未保存更改 (点击保存)' : '已自动保存'
          }}</span>
        </div>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- 右侧：工具区 -->
    <!-- ================================================= -->
    <div class="flex items-center gap-2">
      <!-- 显式保存按钮 -->
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            size="small"
            :type="hasUnsavedChanges ? 'primary' : 'default'"
            :secondary="!hasUnsavedChanges"
            :disabled="!hasUnsavedChanges"
            @click="$emit('save')"
          >
            <template #icon>
              <div
                :class="hasUnsavedChanges ? 'i-lucide:save' : 'i-lucide:check'"
              />
            </template>
            {{ hasUnsavedChanges ? '保存' : '已保存' }}
          </n-button>
        </template>
        {{ hasUnsavedChanges ? '保存更改并创建历史快照' : '所有更改已保存' }}
      </n-tooltip>
      <div class="h-6 w-px bg-gray-200 mx-1"></div>

      <!-- 1. 写作辅助 -->
      <n-dropdown
        trigger="click"
        :options="snippetOptions"
        @select="(key: string) => $emit('insert-snippet', key)"
      >
        <n-button size="small" secondary>
          <template #icon>
            <div class="i-lucide:layout-template" />
          </template>
          插入模版
        </n-button>
      </n-dropdown>

      <!-- 2. 外观设置 (Popver 收纳) -->
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
            外观设置
          </n-button>
        </template>

        <!-- 外观面板内容 -->
        <div
          class="w-72 bg-white rounded-lg shadow-xl border border-gray-100 p-4 flex flex-col gap-5"
        >
          <!-- 主题色 -->
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

          <!-- 排版设置 -->
          <div class="flex flex-col gap-3">
            <span
              class="text-xs font-bold text-gray-500 uppercase tracking-wider"
              >排版</span
            >

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <span class="text-xs text-gray-400">页面边距</span>
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

          <!-- 高级 -->
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

      <!-- 3. 功能按钮组 -->
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            quaternary
            circle
            size="small"
            @click="$emit('show-history')"
          >
            <template #icon>
              <div class="i-lucide:history text-gray-500" />
            </template>
          </n-button>
        </template>
        历史记录
      </n-tooltip>

      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button quaternary circle size="small" @click="$emit('copy')">
            <template #icon>
              <div class="i-lucide:copy text-gray-500" />
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
            @click="$emit('export-markdown')"
          >
            <template #icon>
              <div class="i-lucide:file-down text-gray-500" />
            </template>
          </n-button>
        </template>
        导出 Markdown
      </n-tooltip>

      <!-- 导出 PDF (主按钮) -->
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
import type { DropdownOption } from 'naive-ui';
import {
  THEME_COLORS,
  MARGIN_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  FONT_OPTIONS,
} from '../composables/useResumeSettings';

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
      {
        label: '左对齐 (left)',
        key: '\n::: left\n\n:::\n',
      },
      {
        label: '居中对齐 (center)',
        key: '\n::: center\n\n:::\n',
      },
      {
        label: '右对齐 (right)',
        key: '\n::: right\n\n:::\n',
      },
    ],
  },
];

defineProps<{
  title: string;
  themeColor: string;
  pageMargin: number;
  lineHeight: number;
  currentFont: string;
  showCssPane: boolean;
  isRendering: boolean;
  copied: boolean;
  hasUnsavedChanges: boolean;
}>();

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
  (e: 'save'): void;
  (e: 'show-history'): void;
}>();
</script>
