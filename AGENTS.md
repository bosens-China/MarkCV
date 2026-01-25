# AGENTS.md

## 项目上下文

这是一个基于 Vue 3 + Vite 的在线 Markdown 简历制作平台。核心痛点是解决标准 Markdown 无法进行左右分栏排版的问题。我们通过自定义容器语法（Custom Containers）实现了类似 Grid/Flex 的布局能力。

## 启动与开发

- **安装依赖**: 使用 `pnpm install` (强制使用 pnpm)。
- **启动开发环境**: `pnpm dev`。
- **构建生产包**: `pnpm build`。
- **运行测试**: `pnpm test` (使用 Vitest)。
- **hooks 库**：`vueuse`

## 代码规范与技术栈

- **核心框架**: Vue 3 (Composition API, `<script setup>`)。
- **构建工具**: Vite。
- **样式方案**: Unocss。简历渲染部分需确保打印样式 (`@media print`) 正确。
- **语言标准**: TypeScript (Strict Mode)。
- **Markdown 解析**: 必须使用 `markdown-it` 配合 `markdown-it-container` 插件。
- **组件库**: 尽量轻量化，编辑器核心建议封装 CodeMirror 或简单的 Textarea。

## 关键业务逻辑 (AI 注意)

在处理 Markdown 解析逻辑时，请遵循以下规则：

1. **自定义语法**: 不要试图用 HTML 解析 `:::`, 必须通过 `markdown-it-container` 插件注册 token。
2. **布局结构**:
   - `::: row` -> 解析为 `<div class="layout-row">` (Flex 容器)
   - `::: left` -> 解析为 `<div class="layout-left">` (左栏)
   - `::: right` -> 解析为 `<div class="layout-right">` (右栏)
3. **数据流**: 左侧编辑器输入 -> 实时计算属性 (Computed) -> 右侧 `v-html` 渲染。

## 提交与 PR 规范

- 提交前请运行 `pnpm build` 确保无构建错误。
- 如果修改了 Markdown 解析器的逻辑，请添加对应的单元测试用例。
