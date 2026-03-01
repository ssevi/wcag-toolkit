import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'A11yToolkit',
      fileName: (format) => `a11y-toolkit.${format}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'a11y-toolkit.css';
          return assetInfo.name;
        },
      },
    },
  },
});
