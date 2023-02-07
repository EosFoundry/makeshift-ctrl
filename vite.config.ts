import { rmSync } from 'fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-electron-plugin'
import pkg from './package.json'

const PACKAGE_ROOT = __dirname


rmSync('dist/electron', { recursive: true, force: true })

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      include: ['electron'],
      transformOptions: {
        sourcemap: !!process.env.VSCODE_DEBUG,
        target: 'node16',
        format: 'cjs',
      },
      outDir: 'dist/electron',
      plugins: [
        // Other plugins here
      ],
    }),
  ],
  server: process.env.VSCODE_DEBUG
    ? (() => {
      const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
      return {
        host: url.hostname,
        port: +url.port,
      }
    })()
    : undefined,
  clearScreen: false,
  build: {
    outDir: 'dist/client',
    // minify: false,
    rollupOptions: {
      external: [
        'electron',
      ],
      output: {
        inlineDynamicImports: true,
        
        format:'esm'
      },
    },
  },
})
