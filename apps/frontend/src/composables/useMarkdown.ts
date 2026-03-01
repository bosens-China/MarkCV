import { computed, toRef } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import MarkdownIt from 'markdown-it';
import Container from 'markdown-it-container';

const CONTAINER_NAMES = ['row', 'left', 'right', 'center'] as const;

function getNesting(tokens: unknown[], idx: number): number {
  const token = tokens[idx] as { nesting?: number } | undefined;
  return token?.nesting ?? -1;
}

function createMarkdownParser(): MarkdownIt {
  const md = new MarkdownIt({
    html: true,
    linkify: false,
    typographer: true,
    breaks: true,
  });

  md.use(Container, 'row', {
    render: (tokens: unknown[], idx: number) =>
      getNesting(tokens, idx) === 1 ? '<div class="layout-row">' : '</div>',
  });

  CONTAINER_NAMES.filter((name) => name !== 'row').forEach((name) => {
    md.use(Container, name, {
      render: (tokens: unknown[], idx: number) =>
        getNesting(tokens, idx) === 1 ? `<div class="layout-${name}">` : '</div>',
    });
  });

  return md;
}

const mdParser = createMarkdownParser();

/**
 * Markdown 渲染 Composable
 * 支持传入普通值、ref 或 getter
 * @param content - Markdown 内容
 */
export function useMarkdown(content: MaybeRefOrGetter<string>) {
  const contentRef = toRef(content);
  const renderedContent = computed(() => mdParser.render(contentRef.value));

  return {
    renderedContent,
    mdParser,
  };
}
