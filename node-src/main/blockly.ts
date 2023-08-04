import * as chokidar from 'chokidar'

import { Msg, nspct2 } from '@eos-makeshift/msg';

// @ts-ignore
import { javascriptGenerator, Order } from 'blockly/javascript';
import Blockly, { Block, Workspace } from 'blockly';
import '@blockly/field-grid-dropdown'

import * as Crypto from 'crypto'

import { join } from 'path';
import { Maybe, Just, Nothing } from 'purify-ts/Maybe'
import * as Store from 'electron-store'

import { ctrlLogger, loadJsonFile } from './utils';
import { Cue } from './cues';
import { load } from 'blockly/core/serialization/workspaces';
import { getMainWindow } from '.';
import { ctrlIpcApi, storeKeys } from '../ipcApi'
import { block } from 'blockly/core/tooltip';

import { Fileio } from './fileio'



export type BlockGroup = {
  name: string,
  id: string,
  blockTuples: {
    block: any,
    init: Function
    generateCode: Function
  }[],
  toolboxCategory: any,
  flyoutCallback?: Function
}

// Create Loggers
const msgen = new Msg({ host: 'BlocklyBuilder', logLevel: 'info' })
msgen.logger = ctrlLogger
const log = msgen.getLevelLoggers()

export let workspaceWatcher: chokidar.FSWatcher
const workspaceMirror = new Workspace()
export const groups: BlockGroup[] = []
export const blocklist: { [key: string]: MakeShiftBlockTuple } = {}
export const workspaceList: { [key: string]: any } = {}
export const workspaceStore = new Store.default({
  name: 'BlocklyWorkspaces',
  accessPropertiesByDotNotation: false,
})

let toolbox: any = {}
let BlocklyPublicDir = ''
let BlocklyAppDataDir = ''

javascriptGenerator['set_stored_variable'] = function (block, generator) {
  var dropdown_name = block.getFieldValue('NAME');
  var value_name = generator.valueToCode(block, 'NAME', javascriptGenerator.Order.ATOMIC);
  // TODO: Assemble javascript into code variable.
  var code = '...\n';
  return code;
}

export async function mirrorWorkspace(serialWorkspace: Maybe<any>) {
  serialWorkspace.map(serialWorkspace => {
    workspaceMirror.clear()
    Blockly.serialization.workspaces.load(serialWorkspace, workspaceMirror)
  })
}

export async function generateCodeFromWorkspace(serialWorkspace) {
  log.debug(`serialWorkspace ${nspct2(serialWorkspace)}`)
  log.debug(nspct2(serialWorkspace.blocks.blocks[0]))
  await mirrorWorkspace(Maybe.fromNullable(serialWorkspace))
  try {
    const jsCode = javascriptGenerator.workspaceToCode(workspaceMirror)
    log.debug(`jsCode ${nspct2(jsCode)}`)
    return Maybe.of(jsCode)
  } catch (e) {
    log.error(`Error generating code from workspace: ${e}`)
    return Nothing
  }
}

export async function initBlockly() {

  log.info('Initializing Blockly builder...')
  BlocklyPublicDir = join(process.env.PUBLIC, 'blockly')
  BlocklyAppDataDir = process.env.BLOCKLY_CUES
  log.debug(`BlocklyPublicDir ${nspct2(BlocklyPublicDir)}`)
  log.debug(`BlocklyAppDataDir ${nspct2(BlocklyAppDataDir)}`)
  toolbox = (await loadJsonFile(join(BlocklyPublicDir, './base_toolbox.json'))).extract();

  for (const groupName of ['makeshift-ctrl', 'nutjs']) {
    (await loadBlockGroup(
      join(BlocklyPublicDir, './' + groupName + '/')
    )).map(group => {
      groups.push(group)
    })
  }

  for (const workspacePair of workspaceStore) {
    workspaceList[workspacePair[0]] = workspacePair[1]
  }

  // log.debug(`groups ${nspct2(groups)}`)
  syncGroupsWithToolbox()
  sendWorkspaceList()
  // log.debug(`toolbox ${nspct2(toolbox)}`)
}

export async function loadBlockGroup(directoryPath: string): Promise<Maybe<BlockGroup>> {
  log.debug(`Loading block group from ${directoryPath + 'manifest.json'}`)
  const maybeManifest = await loadJsonFile(directoryPath + 'manifest.json')
  log.debug(`maybeManifest ${nspct2(maybeManifest.extract())}`)

  if (maybeManifest.isNothing()) {
    return Nothing
  }

  const manifest = maybeManifest.extract()

  let newGroup: BlockGroup = {
    name: manifest.name,
    id: manifest.id,
    blockTuples: [],
    toolboxCategory: {},
  }

  manifest.blocks.map(async (blockDescriptor: any) => {
    const blockPath = join(directoryPath, '/blocks/', blockDescriptor.type + '.json')
    const maybeBlock = await loadBlockFromPath(blockPath)
    if (maybeBlock.isNothing()) { return Nothing }
    const newBlock = maybeBlock.extract()
    const blockTuple = {
      block: newBlock,
      init: () => { },
      generateCode: () => { }
    }
    if (blockDescriptor.customInit === true) {
      try {
        blockTuple.init = require(blockPath).init
      } catch (e) {
        log.error(`Could not find init fuction for ${blockDescriptor.type}\n\t${e}`)
      }
    }
    newGroup.blockTuples.push(blockTuple)
  })

  newGroup.toolboxCategory = manifest.toolboxCategory

  return Maybe.of(newGroup)
}

export function getToolbox() {
  return toolbox
}

let someobject = {
  somefield: 'somevalue',
  dosomething: function () {
    this.somefield
  }
}

function addBlockTupleToBlockly(blockTuple: MakeShiftBlockTuple) {
  if (typeof blockTuple.init === 'undefined') {
    Blockly.Blocks[blockTuple.block.type] = {
      init: function () {
        this.jsonInit(blockTuple.block)
      }
    }
  } else {
    Blockly.Blocks[blockTuple.block.type] = {
      init: function () {
        // rebinding this to access blockly block functions
        blockTuple.init.bind(this)(blockTuple.block)
      }
    }
  }

  log.debug(`block ${nspct2(Blockly.Blocks[blockTuple.block.type])}`)
  javascriptGenerator.forBlock[blockTuple.block.type] = function (block: Block) {
    return blocklist[block.type].generateCode(block, javascriptGenerator, Order)
  }
  return blockTuple
}

function hashBlock(block: MakeShiftBlockJSON): MakeShiftBlockJSON {
  const hash = Crypto.createHash('sha256');
  if (Object.keys(block).includes('hash')) {
    delete block.hash
  }
  hash.update(JSON.stringify(block));
  block.hash = hash.digest('hex');
  return block
}

export async function loadBlockFromPath(blockPath: string) {
  log.debug(`Loading block from ${blockPath}`)
  const codeGeneratorPath = blockPath.replace('.json', '.js')

  let generateCode = () => { }
  let init

  log.debug(`Importing block javascript ${codeGeneratorPath}`)
  const maybeBlockJs = Maybe.fromNullable(require(codeGeneratorPath))
  if (maybeBlockJs.isNothing()) {
    log.error(`Error: Could not find loadable code in ${codeGeneratorPath}`)
    return Nothing
  }

  const blockJs = maybeBlockJs.extract() as any

  log.debug(`blockJs ${nspct2(blockJs)}`)
  if (typeof blockJs.generateCode !== 'undefined') {
    generateCode = blockJs.generateCode
  } else {
    log.error(`Error: Could not find generateCode function in ${codeGeneratorPath}`)
    return Nothing
  }

  if (typeof blockJs.init !== 'undefined') {
    init = blockJs.init
  } else {
    log.warn(`Warning: Could not find init function in ${codeGeneratorPath}`)
  }

  log.debug(`Imported block javascript ${nspct2(blockJs)}`)

  log.debug(`Loading block JSON ${blockPath}...`)
  let maybeBlock = await Fileio.readJson(blockPath)
  if (maybeBlock.isNothing()) {
    log.error(`Error loading block ${blockPath}: Could not find a block file`)
    return Nothing
  }

  log.debug(`Loaded block ${blockPath}`)
  const block = maybeBlock.extract()

  log.debug(`Hashing block ${blockPath}...`)
  const hashedBlock = hashBlock(block)
  log.debug(`Confirmed block ${blockPath} as ${nspct2(maybeBlock.extract())}`)

  //TODO validate block schema
  if (block.hash !== hashedBlock.hash) {
    log.warn(`Block ${blockPath} has been modified since last load. Writing new hash to path...`)
    const success = Fileio.writeJson(blockPath + '.new', hashedBlock)
    if (success) {
      log.info(`Block ${blockPath} updated with new hash.`)
    }
  }

  const tuple = {
    block: hashedBlock as MakeShiftBlockJSON,
    init: init,
    generateCode: generateCode
  }
  blocklist[hashedBlock.type] = tuple

  addBlockTupleToBlockly(tuple)
  return maybeBlock as Maybe<MakeShiftBlockJSON>
}

export async function syncGroupsWithToolbox() {
  if (toolbox.contents === undefined) { return }
  let newToolbox = {
    kind: 'categoryToolbox',
    contents: [...toolbox.contents]
  }

  groups.map(group => {
    // log.debug(`group ${nspct2(group)}`)
    newToolbox.contents = newToolbox.contents.filter((toolboxEntry) => {
      return toolboxEntry.name !== group.toolboxCategory.name
    })
    newToolbox.contents.push(group.toolboxCategory)
  })

  toolbox = newToolbox
  getMainWindow()
    .ifJust((mw) => {
      mw.webContents.send(ctrlIpcApi.onEv.blockly.toolboxUpdate, toolbox)
      log.info(`Toolbox sent to renderer.`)
      log.debug(`${nspct2(toolbox)}`)
    })

}

export async function sendBlocks() {
  getMainWindow().ifJust((mw) => {
    const blocklist = groups.reduce((acc, group) => {
      log.debug(`Accumulated blocklist: ${nspct2(acc)}`)
      acc.push(...group.blockTuples.map(blockTuple => {
        return blockTuple.block
      }))
      return acc
    }, [] as any)

    log.debug(`Sending blocklist ${nspct2(blocklist)}`)
    mw.webContents.send(ctrlIpcApi.onEv.blockly.blocksUpdate, blocklist)
  })
}

async function generateDefaultWorkspace() {
  const workspace = new Workspace()

  log.debug(`blocklist ${nspct2(blocklist)}`)
  Blockly.serialization.blocks.append(blocklist['default_cue'].block, workspace)
  const workspaceSerial = await Blockly.serialization.workspaces.save(workspace)
  log.debug(`workspaceSerial ${nspct2(workspaceSerial)}`)
  return workspaceSerial
}

export async function sendDefaultWorkspace() {
  getMainWindow().ifJust(async (mw) => {
    const defaultWorkspace = await generateDefaultWorkspace()
    log.debug(`defaultWorkspace ${nspct2(defaultWorkspace)}`)
    mw.webContents.send(ctrlIpcApi.onEv.blockly.workspaceUpdate, defaultWorkspace)
  })
}

export async function sendSerialWorkspace(serialWorkspace) {
  getMainWindow().ifJust((mw) => {
    mw.webContents.send(ctrlIpcApi.onEv.blockly.workspaceUpdate, serialWorkspace)
  })
}

export async function loadSerialWorkspaceFromFile(cue: Cue) {
  const blocklyFile = cue.id + '.blockly.json'
  return await Fileio.readJson(blocklyFile)
}

export async function saveSerialWorkspace(cue: Cue, serialWorkspace) {
  log.info(`Saving workspace with cue: ${cue.id}`)
  log.debug(`serialWorkspare ${nspct2(serialWorkspace)}`)
  workspaceList[cue.id] = serialWorkspace
  getMainWindow().ifJust((mw) => {
    mw.webContents.send(ctrlIpcApi.onEv.blockly.workspaceListUpdate, Object.keys(workspaceList))
  })
  workspaceStore.set(cue.id, serialWorkspace)
  return workspaceList[cue.id]

  // const blocklyFilePath = join(BlocklyAppDataDir, cue.name + '.blockly.json')
  // log.info(`Saving workspace to blocklyFilePath ${nspct2(blocklyFilePath)}`)
  // const success = await Fileio.writeJson(blocklyFilePath, serialWorkspace)
  // if (success) {
  //   log.info(`Saved workspace to blocklyFilePath ${nspct2(blocklyFilePath)}`)
  // }
  // return success
}

export async function deleteSerialWorkspace(serialWorkspaceName: string) {
  await workspaceStore.delete(serialWorkspaceName)
  delete workspaceList[serialWorkspaceName]
  sendWorkspaceList()
}

export async function sendWorkspaceList() {
  getMainWindow().ifJust((mw) => {
    mw.webContents.send(ctrlIpcApi.onEv.blockly.workspaceListUpdate, Object.keys(workspaceList))
  })
}


export type BlocklyTypes = 'Number' | 'Boolean' | 'String' | 'Array' | 'Colour'

export type MakeShiftBlockFieldJSON = {
  type: string,
  name: string,
  text?: string,
  align?: "LEFT" | "CENTRE" | "RIGHT",
  check?: BlocklyTypes[],
  [key: string]: any;
}

export type MakeShiftBlockJSON = {
  type: string,
  [key: `message${number}`]: string,
  [key: `args${number}`]: MakeShiftBlockFieldJSON[],
  inputsInline: boolean,
  previousStatement?: null | "Action",
  nextStatement?: null | "Action",
  colour?: number,
  tooltip: string,
  helpUrl: string
  hash: string | undefined,
}

export type MakeShiftBlockTuple = {
  block: MakeShiftBlockJSON,
  init: Function | undefined,
  generateCode: Function
}