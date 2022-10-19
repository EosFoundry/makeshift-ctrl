import { rmSync } from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron  from 'vite-electron-plugin'
import pkg from './package.json'

// const PACKAGE_ROOT = __dirname
// const pathInterface = path.resolve(__dirname, './interface')
// console.log(pathInterface)

rmSync('dist', { recursive: true, force: true }) // v14.14.0

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      include: ['electron'],
      transformOptions: {
        sourcemap: !!process.env.VSCODE_DEBUG,
      },

    }),
  ],
  server: process.env.VSCODE_DEBUG ? {
    host: pkg.debug.env.VITE_DEV_SERVER_HOSTNAME,
    port: pkg.debug.env.VITE_DEV_SERVER_PORT,
  } : undefined,
})
