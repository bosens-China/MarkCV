import { defineStore } from 'pinia';
import { ref } from 'vue';
import localforage from 'localforage';

export interface ResumeHistoryItem {
  timestamp: number;
  content: string;
  title: string;
}

export interface Resume {
  id: string;
  title: string;
  content: string;
  themeColor: string;
  pageMargin: number;
  lineHeight: number;
  customCss: string;
  updatedAt: number;
  history: ResumeHistoryItem[];
  activeHistoryTimestamp?: number;
}

export const useResumeStore = defineStore('resume', () => {
  const resumes = ref<Resume[]>([]);
  const isReady = ref(false);

  // 初始化存储配置
  localforage.config({
    name: 'mark-cv',
    storeName: 'resumes',
  });

  async function init() {
    try {
      const stored = await localforage.getItem<Resume[]>('resumes-data');
      if (stored) {
        resumes.value = stored;
      }
    } catch (e) {
      console.error('从存储加载简历失败:', e);
    } finally {
      isReady.value = true;
    }
  }

  // 显式保存逻辑
  async function saveData() {
    try {
      // 序列化为普通对象以避免潜在的代理问题
      await localforage.setItem(
        'resumes-data',
        JSON.parse(JSON.stringify(resumes.value)),
      );
    } catch (e) {
      console.error('保存简历到存储失败:', e);
    }
  }

  function addResume() {
    const id = crypto.randomUUID();
    const newResume: Resume = {
      id,
      title: '未命名简历',
      themeColor: '#111827',
      pageMargin: 20,
      lineHeight: 1.5,
      customCss: '',
      history: [],
      content: `:::: row
::: left
**联系方式**

- 📞 (123) 456-7890
- 📧 email@example.com
- 🔗 [github.com/yourname](https://github.com)
- 📍 中国 · 上海

**技术栈**

- TypeScript / Vue 3
- Node.js / Python
- Docker / AWS
- TailwindCSS / UnoCSS
:::

::: right
# 陆远 (John Doe)
## 高级前端工程师

> 热衷于构建高性能、可扩展的 Web 应用，拥有 5 年以上的大型 SaaS 平台开发经验。

### 工作经历
**某科技创新有限公司** | *高级前端开发*
*2020/06 - 至今*
- 主导公司核心 CRM 系统的重构...

**初创网络科技** | *全栈开发工程师*
*2018/07 - 2020/05*
- 独立负责公司官网及管理后台的开发...
:::
::::`,
      updatedAt: Date.now(),
    };
    resumes.value.push(newResume);
    return id;
  }

  function getResume(id: string) {
    return resumes.value.find((r) => r.id === id);
  }

  function updateResume(
    id: string,
    updates: Partial<Omit<Resume, 'id' | 'history'>>,
  ) {
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      const current = resumes.value[index];
      if (!current) return;

      const now = Date.now();

      resumes.value[index] = {
        ...current,
        ...updates,
        updatedAt: now,
      };
    }
  }

  function deleteResume(id: string) {
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      resumes.value.splice(index, 1);
    }
  }

  function addHistorySnapshot(id: string) {
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      const current = resumes.value[index];
      if (!current) return;

      const newHistory = [...(current.history || [])];
      const lastHistory =
        newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
      const now = Date.now();

      if (!lastHistory || lastHistory.content !== current.content) {
        newHistory.push({
          timestamp: now,
          content: current.content,
          title: current.title,
        });

        if (newHistory.length > 50) {
          newHistory.shift();
        }

        resumes.value[index] = {
          ...current,
          history: newHistory,
          activeHistoryTimestamp: now,
        };
      } else {
        // 如果内容没变，仅更新激活状态指向最新的那条
        current.activeHistoryTimestamp = lastHistory.timestamp;
      }
    }
  }

  function setActiveVersion(id: string, timestamp: number) {
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      const current = resumes.value[index];
      if (current) {
        current.activeHistoryTimestamp = timestamp;
      }
    }
  }

  return {
    resumes,
    isReady,
    init,
    saveData,
    addResume,
    getResume,
    updateResume,
    deleteResume,
    addHistorySnapshot,
    setActiveVersion,
  };
});
