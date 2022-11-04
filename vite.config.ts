import { rmSync } from 'fs'
import path from 'path'
import { defineConfig } from 'vite'

import { builtinModules } from 'node:module' 
import vue from '@vitejs/plugin-vue'
import electron from 'vite-electron-plugin'
import { BuildOptions } from 'esbuild'
// import { customStart } from 'vite-plugin-electron/plugin'

import pkg from './package.json'
import { validate } from 'uuid'
import { render } from 'vue'

const PACKAGE_ROOT = __dirname


rmSync('dist/electron', { recursive: true, force: true }) // v14.14.0

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
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules.flatMap((p) => [p, `node:${p}`]),
      ],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})