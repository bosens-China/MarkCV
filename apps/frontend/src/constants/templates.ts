export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  title: string;
  content: string;
  tags: string[];
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'classic-two-column',
    name: '经典双栏',
    description: '适合大多数岗位，信息层次清晰。',
    title: '产品/前端工程师简历',
    content: `:::: row
::: left
## 联系方式
- 手机：138-0000-0000
- 邮箱：name@example.com
- GitHub：github.com/yourname
- 城市：上海

## 核心技能
- Vue 3 / TypeScript / Vite
- Node.js / Fastify / PostgreSQL
- 设计系统 / 组件库
- 性能优化 / 工程化
:::

::: right
# 你的名字
## 前端工程师 / 全栈工程师

### 个人简介
3-5 年 Web 开发经验，擅长复杂业务系统与工程化体系搭建，关注交付效率与用户体验。

### 工作经历
**某互联网公司** | 前端工程师  
*2022.03 - 至今*
- 负责核心业务模块重构，首屏性能提升 35%
- 建立组件规范与自动化测试流程，缺陷率下降 28%

### 项目经历
**在线简历平台**
- 负责 Markdown 编辑器与分页预览架构
- 完成后端 API 设计与数据模型落地

### 教育背景
某某大学 · 软件工程 · 本科
:::
::::`,
    tags: ['双栏', '技术向'],
  },
  {
    id: 'minimal-single',
    name: '极简单栏',
    description: '内容连续阅读体验好，适合产品/运营/设计方向。',
    title: '通用岗位简历',
    content: `# 你的名字
前端工程师 / 产品工程师

## 联系方式
- 手机：138-0000-0000
- 邮箱：name@example.com
- 地点：北京
- 个人主页：https://example.com

## 个人简介
具备跨团队协作和端到端交付经验，擅长在不确定需求下推进产品上线并持续优化。

## 工作经历
### 某科技公司 | 前端工程师
*2021.07 - 至今*
- 负责中后台系统建设与性能优化
- 推动设计规范落地，统一 30+ 页面交互体验

## 重点项目
### 增长分析平台
- 搭建指标看板与可视化报表体系
- 接入埋点分析，帮助业务定位关键转化瓶颈

## 教育经历
- 某某大学 · 计算机科学与技术 · 本科
`,
    tags: ['单栏'],
  },
  {
    id: 'engineering-strong',
    name: '工程强化',
    description: '突出技术深度、架构能力和平台化建设经验。',
    title: '高级工程师简历',
    content: `# 你的名字
高级前端工程师 / Tech Lead

## 技术标签
TypeScript · Vue 3 · React · Node.js · Fastify · PostgreSQL · Docker

## 专业概述
专注中大型前端系统架构与工程效率建设，具备从 0 到 1 设计平台级能力的经验。

## 工作经历
### 某 SaaS 公司 | 高级前端工程师
*2020.05 - 至今*
- 设计并落地前端分层架构，支持多业务并行迭代
- 建立 Monorepo + CI/CD 工作流，构建时长缩短 40%
- 负责关键模块可观测性建设，线上异常发现效率提升显著

## 代表项目
### 在线简历编辑平台
- 实现 Markdown 编辑、A4 分页预览、打印导出
- 设计后端 API 与版本管理能力，支持云端协作
- 主导鉴权接入方案（GitHub OAuth）

## 教育背景
某某大学 · 软件工程 · 本科
`,
    tags: ['单栏', '技术向'],
  },
];
