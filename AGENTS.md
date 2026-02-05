# AGENTS.md

## 项目说明

这是一个 **前后端分离** 的在线 Markdown 简历制作平台。

- **Frontend**：Vue 3 + Vite，用于 Markdown 编辑与渲染
- **Backend**：API 服务，负责用户体系与简历数据持久化（PostgreSQL）

## 通用要求

1. 代码注释在必要时添加，保持代码可读性。
2. 代码注释和回复使用中文。

## 项目结构

PNPM + MONOREPO 项目

```sh

apps/frontend   # 编辑器与简历渲染
apps/backend    # API（用户 / 简历 / 样式）

```

## Frontend

### 技术栈

- Vue 3（Composition API, `<script setup>`）
- Vite
- TypeScript（Strict）
- UnoCSS（需保证 `@media print` 正确）
- Markdown：`markdown-it` + `markdown-it-container`
- Hooks：`@vueuse/core`

请尽量复用以上技术栈

## Backend

### 职责

- 用户注册 / 登录（JWT）
- 简历增删改查
- 简历自定义 CSS 绑定
- PostgreSQL + ORM

### 约束

- 不解析 Markdown
- 不生成 HTML
- 只返回原始数据
- 所有资源需校验用户归属
