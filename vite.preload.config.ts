import { rmSync } from 'fs'
import { defineConfig } from 'vite';

const preloadDir = 'dist/node/preload/'

rmSync(preloadDir, { recursive: true, force: true })

// https://vitejs.dev/config
export default defineConfig({
  build: {
    minify: false,
    target: 'node18',
    outDir: preloadDir,
  },
  publicDir: false,
});
