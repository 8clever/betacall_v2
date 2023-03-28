/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const port = 3000;
const host = '0.0.0.0'
const base = process.env.BASE_URL || "/"

console.log("BASE_URL: ", base);

export default defineConfig({
  cacheDir: '../../node_modules/.vite/ui-auth',

  base,

  server: {
    port,
    host,
    fs: {
      allow: ['..']
    }
  },

  preview: {
    port,
    host
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
