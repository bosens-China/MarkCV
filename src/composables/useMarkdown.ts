/**
 * Markdown 解析引擎 Composable
 * 基于 markdown-it，支持自定义容器语法用于简历布局
 */
import { computed, type Ref } from 'vue';
import MarkdownIt from 'markdown-it';
import Container from 'markdown-it-container';

/**
 * 自定义容器配置
 * 支持的容器: row, left, right, center
 */
const CONTAINER_NAMES = ['row', 'left', 'right', 'center'] as const;

/**
 * 创建 Markdown 解析器实例
 */
function createMarkdownParser(): MarkdownIt {
  const md = new MarkdownIt({
    html: true, // 允许 HTML 标签
    linkify: false, // 禁止自动将 URL 转换为链接
    typographer: true, // 启用智能引号等排版优化
    breaks: true, // 将换行符转换为 <br>
  });

  // 注册 row 容器（使用 4 个冒号 :::: 支持嵌套）
  md.use(Container, 'row', {
    render: (tokens: any, idx: number) =>
      tokens[idx].nesting === 1 ? '<div class="layout-row">' : '</div>',
  });

  // 注册其他容器（使用 3 个冒号 :::）
  CONTAINER_NAMES.filter((name) => name !== 'row').forEach((name) => {
    md.use(Container, name, {
      render: (tokens: any, idx: number) =>
        tokens[idx].nesting === 1 ? `<div class="layout-${name}">` : '</div>',
    });
  });

  return md;
}

// 单例 Markdown 解析器
const mdParser = createMarkdownParser();

/**
 * useMarkdown Composable
 * @param content - 响应式的 Markdown 内容
 * @returns 渲染后的 HTML 内容（computed）
 */
export function useMarkdown(content: Ref<string>) {
  const renderedContent = computed(() => mdParser.render(content.value));

  return {
    renderedContent,
    mdParser,
  };
}

/**
 * 支持的 Markdown 语法参考
 *
 * 基础语法:
 * - # H1 ~ ###### H6  标题
 * - **bold**          粗体
 * - *italic*          斜体
 * - [text](url)       链接
 * - ![alt](url)       图片
 * - `code`            行内代码
 * - ```code```        代码块
 * - - item            无序列表
 * - 1. item           有序列表
 * - > quote           引用块
 * - ---               水平线
 * - | table |         表格
 *
 * 自定义容器语法（用于简历布局）:
 *
 * :::: row
 * ::: left
 * 左侧内容
 * :::
 * ::: right
 * 右侧内容
 * :::
 * ::::
 *
 * ::: center
 * 居中内容
 * :::
 */
