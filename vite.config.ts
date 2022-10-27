import { rmSync } from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-electron-plugin'
import { customStart } from 'vite-electron-plugin/plugin'
import pkg from './package.json'

// const PACKAGE_ROOT = __dirname
// const pathInterface = path.resolve(__dirname, './interface')
// console.log(pathInterface)

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
        format: 'esm',
      },
      outDir: 'dist/electron',
      // the following will start Electron via VSCode Debug
      plugins: [
        ...process.env.VSCODE_DEBUG
          ? [customStart(debounce(() => console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App')))]
          : [],
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
  },
})

function debounce<Fn extends (...args: any[]) => void>(fn: Fn, delay = 299) {
  let t: NodeJS.Timeout
  return ((...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }) as Fn
}