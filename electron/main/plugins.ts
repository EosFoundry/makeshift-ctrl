// import * as chokidar from 'chokidar'
import { dialog } from 'electron'
import { readdir, mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync } from 'original-fs'
import { isAbsolute, join } from 'pathe'

export const plugins = {}

export async function loadPlugins() {
  try {
    const dir = await readdir(process.env.PLUGINS)
    console.log(dir)
    dir.forEach(async (path) => {
      const plugPath = join(process.env.PLUGINS, path)
      const toast = await readdir(plugPath)
      console.log(toast)
      const manifest = join(plugPath, 'manifest.json')
      if (lstatSync(manifest).isFile()) {
        if (lstatSync(plugPath).isDirectory()) {
          load(plugPath)
        }
        // } else {
        //   // nuke the directory if it does not contain a plugin
        //   rmSync(process.env.TEMP, {
        //     recursive: true,
        //   })
      }
    })
  } catch (err) {
    console.log(err)
  }
}

export async function installPlugin() {
  const openResult = await dialog.showOpenDialog({
    filters: [
      {
        name: '.zip',
        extensions: ['zip']
      },
      {
        name: 'All Files',
        extensions: ['*'],
      },
    ],
    properties: [
      'openFile',
      'multiSelections']
  })

  if (openResult.canceled === false) {
    console.log(openResult)
    console.log(process.env.TEMP)
  }
}

async function load(pluginFolder: string) {
  const manifestPath = join(pluginFolder, 'manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  const name = manifest.name
  const pluginPath = join(pluginFolder, (name + '.mkshftpb.js'))
  const plugPathUrl = pathToFileURL(pluginPath)

  // console.log(manifest)
  // console.log(pluginPath)
  // console.log(isAbsolute(pluginPath))
  // console.log(plugPathUrl)
  // console.log(lstatSync(pluginPath).isFile())
  plugins[name] = await import(plugPathUrl.href)
  // console.log(plugins)
}
