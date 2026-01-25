<template>
  <div class="min-h-screen bg-gray-50/50 font-sans">
    <div class="max-w-7xl mx-auto px-6 py-12">
      
      <!-- 头部区域 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 header-section opacity-0 translate-y-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">我的文稿</h1>
          <p class="text-gray-500 mt-1">在这里查看和管理您的所有简历设计</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="w-64">
            <n-input
              v-model:value="searchQuery"
              placeholder="搜索简历名称..."
              round
              clearable
            >
              <template #prefix>
                <div class="i-lucide:search text-gray-400" />
              </template>
            </n-input>
          </div>
          
          <n-button 
            type="primary" 
            round
            @click="createResume"
          >
            <template #icon>
              <div class="i-lucide:plus" />
            </template>
            新建简历
          </n-button>
        </div>
      </div>
      
      <!-- 列表区域 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        <!-- 简历卡片 -->
        <div 
          v-for="resume in filteredResumes" 
          :key="resume.id"
          class="resume-card-wrapper opacity-0 translate-y-8"
        >
          <n-card 
            hoverable 
            class="h-full cursor-pointer transition-all duration-300 hover:-translate-y-1" 
            content-style="display: flex; flex-direction: column; height: 100%; padding: 1.25rem;"
            :bordered="false"
            @click="openResume(resume.id)"
          >
            <!-- 顶部：图标与菜单 -->
            <div class="flex items-start justify-between mb-6">
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-colors duration-300">
                <div class="i-lucide:file-text text-2xl"></div>
              </div>
              
              <div @click.stop>
                <n-dropdown 
                  trigger="click" 
                  :options="dropdownOptions" 
                  placement="bottom-end"
                  @select="(key) => handleMenuSelect(key, resume.id)"
                >
                  <n-button text class="text-gray-400 hover:text-gray-600">
                    <div class="i-lucide:more-vertical text-xl" />
                  </n-button>
                </n-dropdown>
              </div>
            </div>

            <!-- 中部：标题与时间 -->
            <div class="flex-1 min-w-0 mb-4">
              <h3 class="text-lg font-bold text-gray-900 truncate mb-1" :title="resume.title">
                {{ resume.title || '未命名简历' }}
              </h3>
              <p class="text-xs text-gray-400">
                最后更新: {{ formatDate(resume.updatedAt) }}
              </p>
            </div>

            <!-- 底部：状态标签 -->
            <div class="pt-4 border-t border-gray-100 flex items-center gap-2 mt-auto">
               <n-tag size="small" :bordered="false" type="default" class="bg-gray-100 text-gray-500 font-bold text-[10px]">A4 Paper</n-tag>
               <n-tag size="small" :bordered="false" type="default" class="bg-gray-100 text-gray-500 font-bold text-[10px]">Standard</n-tag>
            </div>
          </n-card>
        </div>

        <!-- 初始空状态 -->
        <div 
          v-if="resumeStore.resumes.length === 0" 
          class="col-span-full py-24 flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-3xl"
        >
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <div class="i-lucide:file-plus-2 text-4xl text-gray-300"></div>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">准备好创建第一份简历了吗？</h2>
          <p class="text-gray-500 mb-8 max-w-sm text-center">专业的排版，现代的设计，让你的简历在众多竞争者中脱颖而出。</p>
          <n-button type="primary" size="large" round @click="createResume">
            立即开始
          </n-button>
        </div>

        <!-- 搜索无结果 -->
        <div v-else-if="filteredResumes.length === 0" class="col-span-full py-20 text-center">
          <div class="i-lucide:search-x text-5xl text-gray-200 mx-auto mb-4"></div>
          <p class="text-gray-400">未找到名称包含 "{{ searchQuery }}" 的简历</p>
        </div>

      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <n-modal 
      v-model:show="showDeleteDialog"
      preset="dialog"
      title="安全确认"
      type="warning"
      content="确认要删除这份简历吗？该操作将永久移除文稿，无法撤销。"
      positive-text="确认删除"
      negative-text="取消"
      @positive-click="handleDelete"
      @negative-click="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { useResumeStore } from '../stores/resume';
import gsap from 'gsap';

const router = useRouter();
const resumeStore = useResumeStore();

const searchQuery = ref('');
const showDeleteDialog = ref(false);
const resumeToDelete = ref<string | null>(null);

const filteredResumes = computed(() => {
  if (!searchQuery.value) return resumeStore.resumes;
  const lowerQuery = searchQuery.value.toLowerCase();
  return resumeStore.resumes.filter(r => 
    (r.title || '').toLowerCase().includes(lowerQuery)
  );
});

// Dropdown options
const dropdownOptions = [
  {
    label: '删除文稿',
    key: 'delete',
    props: {
      style: { color: '#d03050' }
    },
    icon: () => h('div', { class: 'i-lucide:trash-2' })
  }
];

const handleMenuSelect = (key: string, id: string) => {
  if (key === 'delete') {
    confirmDelete(id);
  }
};

const createResume = () => {
  const id = resumeStore.addResume();
  router.push(`/editor/${id}`);
};

const openResume = (id: string) => {
  router.push(`/editor/${id}`);
};

const confirmDelete = (id: string) => {
  resumeToDelete.value = id;
  showDeleteDialog.value = true;
};

const handleDelete = () => {
  if (resumeToDelete.value) {
    resumeStore.deleteResume(resumeToDelete.value);
    resumeToDelete.value = null;
    showDeleteDialog.value = false;
  }
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return '昨天';
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
};

onMounted(() => {
  const tl = gsap.timeline();
  tl.to('.header-section', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  })
  .to('.resume-card-wrapper', {
    y: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.08, 
    ease: 'power2.out'
  }, '-=0.3');
});
</script>

<style scoped>
/* 无需额外的 deep 样式，Naive UI 配合 UnoCSS 已经很好 */
</style>