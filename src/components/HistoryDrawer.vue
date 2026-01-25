<template>
  <n-drawer :show="show" @update:show="$emit('update:show', $event)" width="320" placement="right">
    <n-drawer-content title="历史记录">
      <div v-if="!history || history.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-400">
        <div class="i-lucide:history text-4xl mb-2" />
        <span>暂无历史记录</span>
      </div>

      <n-timeline v-else>
        <n-timeline-item
          v-for="item in reversedHistory"
          :key="item.timestamp"
          :type="item.timestamp === activeTimestamp ? 'success' : 'default'"
          :title="formatDate(item.timestamp) + (item.timestamp === activeTimestamp ? ' (当前)' : '')"
          :content="item.title || '无标题'"
          :time="formatTime(item.timestamp)"
        >
          <template #default>
            <div class="flex flex-col gap-2 mt-1">
              <div class="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100 font-mono">
                {{ item.content.slice(0, 60) }}...
              </div>
              <n-button 
                size="tiny" 
                secondary 
                :type="item.timestamp === activeTimestamp ? 'success' : 'warning'" 
                :disabled="item.timestamp === activeTimestamp"
                @click="handleRestore(item)"
              >
                <template #icon>
                  <div :class="item.timestamp === activeTimestamp ? 'i-lucide:check' : 'i-lucide:rotate-ccw'" />
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
import { useDateFormat } from '@vueuse/core';

const props = defineProps<{
  show: boolean;
  history: ResumeHistoryItem[];
  activeTimestamp?: number;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'restore', item: ResumeHistoryItem): void;
}>();

// 按时间倒序排列，最新的在上面
const reversedHistory = computed(() => {
  return [...props.history].reverse();
});

const formatDate = (timestamp: number) => {
  return useDateFormat(timestamp, 'YYYY-MM-DD').value;
};

const formatTime = (timestamp: number) => {
  return useDateFormat(timestamp, 'HH:mm:ss').value;
};

const handleRestore = (item: ResumeHistoryItem) => {
  if (window.confirm(`确定要恢复到 ${formatDate(item.timestamp)} ${formatTime(item.timestamp)} 的版本吗？当前未保存的内容将丢失。`)) {
    emit('restore', item);
    emit('update:show', false);
  }
};
</script>
