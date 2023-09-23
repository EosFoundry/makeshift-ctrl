import { rmSync } from 'fs'
import { readdirSync } from 'node:fs'
import { defineConfig } from 'vite'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const pluginDir = 'dist/node/plugin/'
const pluginSrcDir = 'node-src/plugin/'

rmSync(pluginDir, { recursive: true, force: true })
function getInputPaths(srcDir: string) {
  const inputPaths = {
    'index': 'node-src/plugin/index.ts',
  }
  for (const file of readdirSync(srcDir)) {
    console.log(file)
    if (file.endsWith('.ts')) {
      inputPaths[file.replace('.ts', '')] = srcDir + file
    }
  }
  console.dir(inputPaths)
  return inputPaths
}

getInputPaths(pluginSrcDir)

export default defineConfig({
  build: {
    minify: false,
    outDir: pluginDir,
    target: 'node18',
    rollupOptions: {
      input: getInputPaths(pluginSrcDir),
      output: {
        entryFileNames: '[name].js',
      },
      external: [
        '@eos-makeshift/serial',
        '@nut-tree/nut-js',
        'uuid',
        'nanoid',
        'blockly',
        'original-fs',
      ],
      plugins: [
        nodeResolve({
          exportConditions: ['node'],
        }),
      ],
    }
  },
  publicDir: false,
})
