import { rmSync } from 'fs'
import { defineConfig } from 'vite';

const mainDir = 'dist/node/main/'

rmSync(mainDir, { recursive: true, force: true })

export default defineConfig({
  build: {
    minify: false,
    outDir: mainDir,
    target: 'node18',
    rollupOptions: {
      external: [
        '@eos-makeshift/serial',
        '@nut-tree/nut-js',
        'blockly',
        'original-fs',
      ],
    }
  },
  publicDir: false,
})