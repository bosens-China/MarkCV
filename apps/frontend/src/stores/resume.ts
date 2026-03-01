import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import {
  createResume as createResumeApi,
  createResumeVersion,
  deleteResume as deleteResumeApi,
  fetchResumeById as fetchResumeByIdApi,
  fetchResumeList,
  fetchResumeVersions,
  type ResumeApiModel,
  type ResumeVersionApiModel,
  restoreResumeVersion,
  updateResume as updateResumeApi,
} from '../api/resumes';

/** 历史记录最大保存数量 */
const MAX_HISTORY_ITEMS = 50;

/** 获取消息提示实例 */
function getMessage() {
  return useMessage();
}

export interface ResumeHistoryItem {
  versionId?: string;
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
  currentFont: string;
  customCss: string;
  updatedAt: number;
  history: ResumeHistoryItem[];
  activeHistoryTimestamp?: number;
}

const DEFAULT_CONTENT = `:::: row
::: left
**联系方式**

- (123) 456-7890
- email@example.com
- [github.com/yourname](https://github.com)
- 中国 · 上海

**技术栈**

- TypeScript / Vue 3
- Node.js / Python
- Docker / AWS
- TailwindCSS / UnoCSS
:::

::: right
# 张三 (John Doe)
## 高级前端工程师
> 热爱构建高性能、可扩展的 Web 应用，具备大型 SaaS 平台开发经验。

### 工作经历
**某科技创新有限公司** | *高级前端开发*
*2020/06 - 至今*
- 主导核心系统重构，提升首屏速度与稳定性

**初创网络科技** | *全栈开发工程师*
*2018/07 - 2020/05*
- 负责官网与管理后台开发
:::
::::`;

function toResume(model: ResumeApiModel): Resume {
  const updated = new Date(model.updatedAt).getTime();
  return {
    id: model.id,
    title: model.title,
    content: model.content,
    themeColor: model.themeColor,
    pageMargin: model.pageMargin,
    lineHeight: model.lineHeight,
    currentFont: model.currentFont || 'font-sans',
    customCss: model.customCss,
    updatedAt: Number.isNaN(updated) ? Date.now() : updated,
    history: [],
  };
}

function toHistoryItem(version: ResumeVersionApiModel): ResumeHistoryItem {
  return {
    versionId: version.id,
    timestamp: new Date(version.createdAt).getTime(),
    title: version.title,
    content: version.content,
  };
}

export const useResumeStore = defineStore('resume', () => {
  const resumes = ref<Resume[]>([]);
  const isReady = ref(false);
  const isSyncing = ref(false);

  function getResume(id: string) {
    return resumes.value.find((r) => r.id === id);
  }

  function upsertResume(model: ResumeApiModel) {
    const mapped = toResume(model);
    const index = resumes.value.findIndex((r) => r.id === mapped.id);
    if (index === -1) {
      resumes.value.unshift(mapped);
      return mapped;
    }

    const history = resumes.value[index]?.history || [];
    const activeHistoryTimestamp = resumes.value[index]?.activeHistoryTimestamp;
    resumes.value[index] = {
      ...mapped,
      history,
      activeHistoryTimestamp,
    };
    return resumes.value[index] as Resume;
  }

  async function init() {
    try {
      isSyncing.value = true;
      const response = await fetchResumeList();
      resumes.value = response.items.map(toResume);
    } catch {
      getMessage().error('初始化简历列表失败，请检查网络连接');
      resumes.value = [];
    } finally {
      isSyncing.value = false;
      isReady.value = true;
    }
  }

  function markReady() {
    isReady.value = true;
  }

  function reset() {
    resumes.value = [];
    isSyncing.value = false;
    isReady.value = false;
  }

  async function refresh() {
    isSyncing.value = true;
    try {
      const response = await fetchResumeList();
      resumes.value = response.items.map((item) => {
        const previous = getResume(item.id);
        const mapped = toResume(item);
        if (!previous) return mapped;
        return {
          ...mapped,
          history: previous.history,
          activeHistoryTimestamp: previous.activeHistoryTimestamp,
        };
      });
    } finally {
      isSyncing.value = false;
    }
  }

  async function fetchResumeById(id: string) {
    const local = getResume(id);
    if (local) return local;
    const remote = await fetchResumeByIdApi(id);
    return upsertResume(remote);
  }

  async function loadRemoteVersions(id: string) {
    const response = await fetchResumeVersions(id);
    const history = response.items.map(toHistoryItem);
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index === -1) return history;

    const current = resumes.value[index];
    if (!current) return history;
    const activeTimestamp = history.length > 0 ? history[0]?.timestamp : undefined;
    resumes.value[index] = {
      ...current,
      history,
      activeHistoryTimestamp: activeTimestamp,
    };
    return history;
  }

  async function createResume() {
    const created = await createResumeApi({
      title: '未命名简历',
      content: DEFAULT_CONTENT,
      themeColor: '#111827',
      pageMargin: 20,
      lineHeight: 1.5,
      currentFont: 'font-sans',
      customCss: '',
    });
    const resume = upsertResume(created);
    return resume.id;
  }

  function updateResume(
    id: string,
    updates: Partial<Omit<Resume, 'id' | 'history'>>,
  ) {
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index === -1) return;
    const current = resumes.value[index];
    if (!current) return;

    resumes.value[index] = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    };
  }

  async function saveRemote(id: string) {
    const current = getResume(id);
    if (!current) return;

    const updated = await updateResumeApi(id, {
      title: current.title,
      content: current.content,
      themeColor: current.themeColor,
      pageMargin: current.pageMargin,
      lineHeight: current.lineHeight,
      currentFont: current.currentFont,
      customCss: current.customCss,
    });
    upsertResume(updated);
  }

  async function createVersionSnapshot(id: string) {
    const current = getResume(id);
    if (!current) return;

    const version = await createResumeVersion(id, {
      title: current.title,
      content: current.content,
    });
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index === -1) return;
    const resume = resumes.value[index];
    if (!resume) return;

    const incoming = toHistoryItem(version);
    const newHistory = [incoming, ...resume.history].slice(0, MAX_HISTORY_ITEMS);
    resumes.value[index] = {
      ...resume,
      history: newHistory,
      activeHistoryTimestamp: incoming.timestamp,
    };
  }

  async function restoreVersion(id: string, versionId: string) {
    const restored = await restoreResumeVersion(id, versionId);
    const updated = upsertResume(restored);
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      const current = resumes.value[index];
      resumes.value[index] = {
        ...updated,
        history: current?.history || [],
        activeHistoryTimestamp: current?.activeHistoryTimestamp,
      };
    }
    return getResume(id);
  }

  async function deleteResume(id: string) {
    await deleteResumeApi(id);
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index !== -1) resumes.value.splice(index, 1);
  }

  function addHistorySnapshot(id: string) {
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index === -1) return;
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

      if (newHistory.length > MAX_HISTORY_ITEMS) {
        newHistory.shift();
      }

      resumes.value[index] = {
        ...current,
        history: newHistory,
        activeHistoryTimestamp: now,
      };
      return;
    }

    resumes.value[index] = {
      ...current,
      activeHistoryTimestamp: lastHistory.timestamp,
    };
  }

  function setActiveVersion(id: string, timestamp: number) {
    const index = resumes.value.findIndex((r) => r.id === id);
    if (index === -1) return;
    const current = resumes.value[index];
    if (!current) return;
    resumes.value[index] = {
      ...current,
      activeHistoryTimestamp: timestamp,
    };
  }

  return {
    resumes,
    isReady,
    isSyncing,
    init,
    markReady,
    reset,
    refresh,
    getResume,
    fetchResumeById,
    loadRemoteVersions,
    createResume,
    updateResume,
    saveRemote,
    createVersionSnapshot,
    restoreVersion,
    deleteResume,
    addHistorySnapshot,
    setActiveVersion,
  };
});
