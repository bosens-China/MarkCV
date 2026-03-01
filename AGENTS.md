# AGENTS.md（AI 书写简历）

这个是一个面向C端的简历书写平台，目前群体是互联网从业人员。

## 通用要求

- 使用Typescript
- 代码和回复使用中文
- 编写的代码需要符合最佳工程实践
- 避免出现 any类型，不知道的可以使用 unknown 替代
- 注意操作系统，不同系统的命令调用方式不同

## 前端要求

- 优先使用unocss书写代码，复杂样式可以使用style
- 优先考虑复用vueuse和naive-ui库，非必要不手动造轮子
- 书写完成后运行 pnpm run build 和 pnpm run lint 检查代码质量
- 创建vue组件的时候，注意避免出现 `Component name "Home" should always be multi-word.` 错误
- 可以使用 @ 导入项目的文件，@代表项目/src目录

## 后端要求

- 书写完成后运行 pnpm run build 和 pnpm run lint 检查代码质量
