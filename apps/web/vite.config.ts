import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    base: command === 'serve' ? '/' : '/MarkCV/',
    plugins: [
      vue(),
      UnoCSS(),

      Components({
        resolvers: [NaiveUiResolver()],
      }),
    ],
  };
});
