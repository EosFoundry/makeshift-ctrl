
import { rmSync } from 'fs'
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'

const rendererDir = 'dist/renderer/'
rmSync(rendererDir, { recursive: true, force: true })

export default defineConfig({
  build: {
    minify: false,
    outDir: rendererDir,
  },
  plugins: [
    vue(),
  ],
})