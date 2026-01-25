# MarkCV

MarkCV 是一个极简、专注且强大的在线简历编辑器，专为程序员、产品经理及所有崇尚“内容为王”的创作者设计。

它基于 **Markdown** 和 **CSS**，致力于提供最纯粹的写作体验，让你摆脱繁杂的排版干扰，专注于打磨简历内容本身。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue 3](https://img.shields.io/badge/vue-3.x-green.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)

## ✨ 核心特性

- **Markdown 驱动**：使用你最熟悉的语法编写简历，支持实时预览。
- **专业排版引擎**：基于 [Paged.js](https://pagedjs.org/)，完美模拟 A4 纸张排版，所见即所得。
- **灵活布局**：
  - 内置 `::: row` 双栏、`::: cols-3` 三栏等自定义容器语法。
  - 支持 `::: left`, `::: right`, `::: center` 对齐控制。
- **隐私优先**：所有数据（包括历史记录）仅保存在浏览器本地 (LocalStorage)，无服务器端存储，安全无忧。
- **版本回溯**：支持创建历史快照，随时回滚到任意版本的简历状态。
- **完全免费**：开源且免费，不受任何付费墙或导出限制。

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) (推荐 v18+)
- [pnpm](https://pnpm.io/) (推荐) 或 npm/yarn

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/yourusername/mark-cv.git

# 进入目录
cd mark-cv

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

打开浏览器访问 `http://localhost:5173` 即可开始使用。

## 🛠️ 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **UI 库**: Naive UI + UnoCSS
- **编辑器**: CodeMirror 6
- **排版**: Paged.js + Markdown-it
- **状态管理**: Pinia (配合持久化插件)

## 📝 使用指南

### 自定义布局

MarkCV 扩展了 Markdown 语法以支持简历常见的布局需求：

**双栏布局：**
```markdown
:::: row
::: left
**联系方式**
- 📞 123-456-7890
:::

::: right
# 你的名字
## 职位头衔
:::
::::
```

**三栏布局：**
```markdown
:::: cols-3
<div>栏目一</div>
<div>栏目二</div>
<div>栏目三</div>
::::
```

### 导出

点击顶部工具栏的 **"导出 PDF"** 按钮，系统将调用浏览器原生打印功能。请确保在打印设置中：
- 目标打印机选择 **"另存为 PDF"**
- 纸张尺寸选择 **A4**
- 勾选 **"背景图形"** (Background graphics) 以确保样式正确渲染

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

Copyright (c) 2026 yliu
