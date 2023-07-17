import { readdir, readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { join, dirname, parse } from 'path'
import { readdirSync, readFileSync } from 'fs'
import { BlockGroup, MakeShiftBlockJSON } from '../electron/main/blockly'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

const blockPath = join(__dirname, '../public/blockly/nutjs')

const manifest: BlockGroup[] = []

function generateToolboxCategory(blockGroup: { name: any; id: any; blocks: any; toolboxCategory?: {} }) {
  const newToolboxCategory = {
    kind: 'category',
    name: blockGroup.name,
    toolboxitemid: blockGroup.id,
    contents: [] as any[]
  }

  blockGroup.blocks.forEach((block: { type: any }) => {
    newToolboxCategory.contents.push({
      kind: 'block',
      type: block.type,
    })
  })

  return newToolboxCategory
}

export async function buildBlockGroup(directoryPath: string) {
  const blockGroupId = parse(directoryPath).base
  const blockGroupName = blockGroupId.charAt(0).toUpperCase() + blockGroupId.slice(1)
  let blockGroup = {
    name: blockGroupName,
    id: blockGroupId,
    blocks: [] as any[],
    toolboxCategory: {}
  }
  const blocksPath = join(directoryPath, 'blocks')
  try {
    const files = readdirSync(blocksPath, { withFileTypes: true })
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.json')) {
        const filePath = join(blocksPath, file.name)
        const data = readFileSync(filePath, 'utf8')
        const blockJson = JSON.parse(data)
        console.log(filePath)
        blockGroup.blocks.push({
          type: blockJson.type,
          customInit: false
        })
      }
    }
    blockGroup.toolboxCategory = generateToolboxCategory(blockGroup)
  } catch (err) {
  }
  return blockGroup
}

buildBlockGroup(blockPath).then((bg) => {
  console.dir(bg, { depth: 6 })
  return writeFile(
    join(blockPath, 'manifest.json'),
    JSON.stringify(bg, null, 2))
}).then(() => {
  console.log('Done.')
}).catch((err) => {
  console.error(err)
})

// export async function generateBlockManifest(directoryPath: PathLike) {
//   console.log(`Reading files from ${directoryPath}...`)
//   try {
//     const files = await readdir(directoryPath, { withFileTypes: true })

//     for (const file of files) {
//       if (file.isDirectory()) {
//         const blockGroup = await buildBlockGroup(join(directoryPath, file.name))
//         manifest.push(blockGroup)
//       }
//     }
//   } catch (err) {
//     console.error('Error reading directory:', err)
//     return err
//   }

//   console.log('Built manifest:')
//   console.dir(manifest, { depth: 6 })
//   console.log(`Writing manifest file to ${directoryPath}...`)
//   try {
//     await writeFile(join(directoryPath, '..', 'blocks_manifest.json'), JSON.stringify(manifest, null, 2))
//     console.log('Done.')
//   } catch (err) {
//     console.log(err)
//     console.log(`Error writing manifest file`)
//     return err
//   }

//   return manifest
// }
