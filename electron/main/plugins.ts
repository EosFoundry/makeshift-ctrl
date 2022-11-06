// import * as chokidar from 'chokidar'
import { readdir } from 'node:fs/promises'
import { join } from 'pathe'

let pluginPath: string = 'plugins/'
export const plugins = {}

export async function loadPlugins(root) {
  pluginPath = join(root, pluginPath)

  try {
    const files = await readdir(pluginPath);
    for (const file of files)
      console.log(file);
  } catch (err) {
    console.error(err);
  }
}