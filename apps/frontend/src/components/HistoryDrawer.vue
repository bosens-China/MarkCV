<template>
  <n-drawer
    :show="show"
    @update:show="$emit('update:show', $event)"
    width="360"
    placement="right"
  >
    <n-drawer-content title="版本历史">
      <div
        v-if="!history || history.length === 0"
        class="flex flex-col items-center justify-center h-40 text-gray-400"
      >
        <div class="i-lucide:history text-4xl mb-2" />
        <span>暂无版本记录</span>
      </div>

      <n-timeline v-else>
        <n-timeline-item
          v-for="item in sortedHistory"
          :key="item.versionId || item.timestamp"
          :type="item.timestamp === activeTimestamp ? 'success' : 'default'"
          :title="
            formatDate(item.timestamp) +
            (item.timestamp === activeTimestamp ? '（当前）' : '')
          "
          :content="item.title || '未命名版本'"
          :time="formatTime(item.timestamp)"
        >
          <template #default>
            <div class="flex flex-col gap-2 mt-1">
              <div
                class="text-xs text-gray-500 line-clamp-3 bg-gray-50 p-2 rounded border border-gray-100 font-mono whitespace-pre-wrap"
              >
                {{ item.content.slice(0, 90) }}{{ item.content.length > 90 ? '...' : '' }}
              </div>
              <n-button
                size="tiny"
                secondary
                :type="item.timestamp === activeTimestamp ? 'success' : 'warning'"
                :disabled="item.timestamp === activeTimestamp || loading"
                @click="handleRestore(item)"
              >
                <template #icon>
                  <div
                    :class="
                      item.timestamp === activeTimestamp
                        ? 'i-lucide:check'
                        : 'i-lucide:rotate-ccw'
                    "
                  />
                </template>
                {{ item.timestamp === activeTimestamp ? '当前版本' : '恢复此版本' }}
              </n-button>
            </div>
          </template>
        </n-timeline-item>
      </n-timeline>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ResumeHistoryItem } from '../stores/resume';
import { formatDate, formatTime } from '../utils/date';

const props = defineProps<{
  show: boolean;
  history: ResumeHistoryItem[];
  activeTimestamp?: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'restore', item: ResumeHistoryItem): void;
}>();

const sortedHistory = computed(() => {
  return [...props.history].sort((a, b) => b.timestamp - a.timestamp);
});

const handleRestore = (item: ResumeHistoryItem) => {
  const dateStr = formatDate(item.timestamp);
  const timeStr = formatTime(item.timestamp);
  if (
    window.confirm(
      `确定恢复到 ${dateStr} ${timeStr} 吗？当前未保存内容将丢失。`,
    )
  ) {
    emit('restore', item);
    emit('update:show', false);
  }
};
</script>
