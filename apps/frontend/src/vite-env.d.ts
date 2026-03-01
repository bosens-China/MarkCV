/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

declare module 'splitpanes' {
  import type { DefineComponent } from 'vue';
  export const Splitpanes: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export const Pane: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
}

declare module '@fontsource/noto-sans-sc';
declare module '@fontsource/noto-serif-sc';
