/**
 * 简历设置 Composable
 * 管理简历的主题色、边距、行高、字体等设置
 */
import { ref, type Ref } from 'vue';

/**
 * 主题色选项
 */
export const THEME_COLORS = [
  { label: '经典黑', value: '#111827' },
  { label: '深空蓝', value: '#1E40AF' },
  { label: '翡翠绿', value: '#047857' },
  { label: '魅惑紫', value: '#6D28D9' },
  { label: '勃艮第红', value: '#9F1239' },
] as const;

/**
 * 边距选项 (mm)
 * 中文简历推荐 15-25mm
 */
export const MARGIN_OPTIONS = [10, 12, 15, 18, 20, 22, 25, 28, 30] as const;

/**
 * 行高选项
 * 中文排版推荐 1.4-1.8
 */
export const LINE_HEIGHT_OPTIONS = [
  { label: '1.3 紧凑', value: 1.3 },
  { label: '1.4', value: 1.4 },
  { label: '1.5 标准', value: 1.5 },
  { label: '1.6', value: 1.6 },
  { label: '1.7', value: 1.7 },
  { label: '1.8 宽松', value: 1.8 },
];

/**
 * 字体选项
 */
export const FONT_OPTIONS = [
  { label: '思源黑体', value: 'font-sans' },
  { label: '思源宋体', value: 'font-serif' },
];

/**
 * 默认设置值
 */
export const DEFAULT_SETTINGS = {
  themeColor: '#111827',
  pageMargin: 20,
  lineHeight: 1.5,
  currentFont: 'font-sans',
  customCss: '',
} as const;

export interface ResumeSettings {
  themeColor: Ref<string>;
  pageMargin: Ref<number>;
  lineHeight: Ref<number>;
  currentFont: Ref<string>;
  customCss: Ref<string>;
  showCssPane: Ref<boolean>;
}

/**
 * useResumeSettings Composable
 * @param initialSettings - 初始设置值
 */
export function useResumeSettings(
  initialSettings?: Partial<typeof DEFAULT_SETTINGS>,
): ResumeSettings {
  const settings = { ...DEFAULT_SETTINGS, ...initialSettings };

  return {
    themeColor: ref(settings.themeColor),
    pageMargin: ref(settings.pageMargin),
    lineHeight: ref(settings.lineHeight),
    currentFont: ref(settings.currentFont),
    customCss: ref(settings.customCss),
    showCssPane: ref(false),
  };
}

/**
 * 从简历数据加载设置
 */
export function loadSettingsFromResume(
  settings: ResumeSettings,
  resume: {
    themeColor?: string;
    pageMargin?: number;
    lineHeight?: number;
    customCss?: string;
  },
) {
  if (resume.themeColor) settings.themeColor.value = resume.themeColor;
  if (resume.pageMargin !== undefined)
    settings.pageMargin.value = resume.pageMargin;
  if (resume.lineHeight !== undefined)
    settings.lineHeight.value = resume.lineHeight;
  if (resume.customCss) settings.customCss.value = resume.customCss;
}

/**
 * 导出设置为对象
 */
export function exportSettings(settings: ResumeSettings) {
  return {
    themeColor: settings.themeColor.value,
    pageMargin: settings.pageMargin.value,
    lineHeight: settings.lineHeight.value,
    customCss: settings.customCss.value,
  };
}
