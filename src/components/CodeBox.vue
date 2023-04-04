<script lang="ts">
export default {
  name: "CodeBox",
  components: { TextButton }
}
</script>

<script setup lang="ts">
import { ref, markRaw, watch, nextTick, reactive, onMounted, inject, Ref, computed } from "vue";
import ace, { edit, type Ace } from 'ace-builds'
import 'ace-builds' // this needs to be called for ace.define to exist

import newCueIcon from '../assets/icon/bootstrap/plus-circle.svg?url'
import saveIcon from '../assets/icon/bootstrap/save.svg?url'
import testCueIcon from '../assets/icon/bootstrap/play-circle.svg?url'
import assignCueIcon from '../assets/icon/bootstrap/box-arrow-in-right.svg?url'
import editPathIcon from '../assets/icon/bootstrap/pencil-square.svg?url'
import savePathIcon from '../assets/icon/bootstrap/check2-square.svg?url'
import breadcrumbIcon from '../assets/icon/bootstrap/chevron-compact-right.svg?url'
import fileUnsavedIcon from '../assets/icon/bootstrap/check-circle-fill.svg?url'
import fileSavedIcon from '../assets/icon/bootstrap/file-earmark-check.svg?url'
import { MakeShiftDeviceEvents, MakeShiftPortFingerprint } from "@eos-makeshift/serial";
import Icon from './Icon.vue'
import IconButton from './IconButton.vue'
import toolbarSpacer from './ToolBarSpacer.vue'
import { watchResize } from "../composables/resizer";
import { Cue, CueMap } from "../../types/electron/main/cues";
import TextButton from "./TextButton.vue";

const nanoid = inject('nanoid') as () => string
const editorContents = inject('current-session') as Ref<string>
const acePath = import.meta.env.BASE_URL + 'ace-pkg/src-min-noconflict'
const cues = inject('cues') as Ref<CueMap>
const currentDevice = inject('current-device') as Ref<MakeShiftPortFingerprint>
const selectedEvent = inject('selected-event') as Ref<string>
const DeviceEvents = inject('makeshift-events') as MakeShiftDeviceEvents
// console.log(acePath)

ace.config.set("basePath", acePath)
ace.config.set("workerPath", acePath)
ace.config.set("loadWorkerFromBlob", false)

ace.config.loadModule("ace/keybinding/emacs")
ace.config.loadModule("ace/keybinding/sublime")
ace.config.loadModule("ace/keybinding/vim")
ace.config.loadModule("ace/keybinding/vscode")

const autoSaveWaitTime = 4000
let editor: Ace.Editor
const codeboxEditorElement = ref<HTMLElement>()


let defaultCueNum = 0;
function getBlankCueName() {
  const now = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
  }).format(new Date())
    .replace(/\ /, '')
  return now + '_' + defaultCueNum
}


function createBlankCue() {
  const qName = getBlankCueName()
  const cue = {
    id: `${qName}.cue.js`,
    file: `${qName}.cue.js`,
    fullPath: '',
    name: qName,
    folder: '',
  }
  return cue
}

const newCue: Cue = createBlankCue()
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
const saveButtonHoverColor = ref('var(--color-bg)')
const cueName = ref(newCue.name)
const _cueFolder = ref(newCue.folder)
const cueFullPath = ref(newCue.fullPath)
const cueFolder = computed({
  get() { return _cueFolder.value },
  set(newFolder) {
    let tempFolder = newFolder.trim().replaceAll('\\', '/')
    if (tempFolder.endsWith('/')) { tempFolder = tempFolder.slice(0, -1) }
    if (tempFolder.startsWith('/')) { tempFolder = tempFolder.slice(1) }
    if (tempFolder === '.') { tempFolder = '' }
    _cueFolder.value = tempFolder
  }
})
const cueFolderList = computed(() => {
  return cueFolder.value.split('/')
})
const editCuePath = ref(false)
const folderNameClone = ref<HTMLDivElement>()
const cueNameClone = ref<HTMLDivElement>()

const cueFile = computed(() => {
  return cueName.value + '.cue.js'
})
const cueId = computed(() => {
  let id = cueFile.value
  if (cueFolder.value !== '.' && cueFolder.value !== '') {
    id = cueFolder.value + '/' + id
  }
  return id
})

const cue = computed(() => {
  return {
    id: cueId.value,
    file: cueFile.value,
    name: cueName.value,
    folder: cueFolder.value,
    fullPath: cueFullPath.value,
  } as Cue
}) as Ref<Cue>
const savedColor = 'var(--color-hl)'
const unsavedColor = 'var(--color-primary1)'


const cueSaved = ref(true)
const hasSaveFile = ref(false)
const saveStateStyles = reactive({
  lastChange: Date.now(),
  borderColor: savedColor,
  iconUrl: fileSavedIcon,
})

window.MakeShiftCtrl.onEv.cue.removed((e, q) => {
  console.log(q)
  if (cueId.value === q.id) {
    hasSaveFile.value = false
    cueFullPath.value = ''
  }
})

let autoSaveInterval = null
onMounted(() => nextTick(async () => {
  const existingCue = await window.MakeShiftCtrl.get.cueById(cueId.value)
  if (typeof existingCue !== 'undefined'
    && typeof existingCue.contents !== 'undefined') {
    hasSaveFile.value = true
    cueFullPath.value = existingCue.fullPath
    cueFolder.value = existingCue.folder
    cueName.value = existingCue.name
    editorContents.value = textDecoder.decode(existingCue.contents)
  }

  editor = ace.edit("codebox-editor") as Ace.Editor
  editor.commands.addCommand({
    name: 'saveFile',
    bindKey: {
      win: 'Ctrl-S',
      mac: 'Command-S',
    },
    exec: function (this) {
      saveCue()
    }
  });
  editor.setTheme('ace/theme/twilight')
  editor.setOption('fontFamily', 'Iosevka MakeShift')
  // editor.setOption('fontSpacing', 'Iosevka MakeShift')
  editor.setFontSize(15);
  editor.setOption('useSoftTabs', true)
  editor.setOption('tabSize', 2)
  editor.setKeyboardHandler('ace/keyboard/vim');
  (editor as any).session.on('changeMode', (e: any, session: any) => {
    if ("ace/mode/javascript" === session.getMode().$id) {
      if (typeof session.$worker !== 'undefined') {
        session.$worker.send("setOptions", [{
          "esversion": 2020,
          "esnext": false,
          "relaxing": {
            "asi": false,
          }
        }]);
      }
    }
  });
  editor.session.setMode('ace/mode/javascript')
  editor.resize()
  editor.session.setValue(editorContents.value)
  editor.on('change', (delta: any) => {
    saveStateStyles.lastChange = Date.now()
    if (cueSaved.value) {
      cueSaved.value = false
      saveStateStyles.borderColor = unsavedColor
      saveStateStyles.iconUrl = fileUnsavedIcon
    }
    editorContents.value = editor.getValue()
  })

  autoSaveInterval = setInterval(checkAutoSave, autoSaveWaitTime);
  watchResize(codeboxEditorElement.value as HTMLElement, fitCodebox)
  window.addEventListener('loadCue', (ev: any) => { loadCue(ev.detail) })
}))

async function createCue() {
  if (hasSaveFile.value) {
    await saveCue()
  }
  hasSaveFile.value = false
  cueSaved.value = true
  const cue = createBlankCue()
  cueName.value = cue.name
  cueFolder.value = '.'
  cueFullPath.value = ''
  editor.setValue('')
}

async function saveCue() {
  const id = cueId.value
  const contents = textEncoder.encode(editor.getValue())
  console.log(`Saving cue ${cue.value}`)
  const fullPath = await window.MakeShiftCtrl.set.cueFile({
    cueId: id,
    contents: contents,
  })
  handlePostSave(fullPath)
}


async function assignCueToEvent() {
  console.log(`uploading cue ${cue.value}`)
  const deviceId = currentDevice.value.portId
  const id = cueId.value
  const contents = textEncoder.encode(editor.getValue())
  const fullPath = await window.MakeShiftCtrl.set.cueForEvent({
    event: selectedEvent.value,
    cueId: cueId.value,
    contents: contents,
  })
  console.log(`Cue assigned`)
  handlePostSave(fullPath)
}

async function handlePostSave(fullPath: string) {
  if (cueName.value === getBlankCueName()) {
    defaultCueNum++;
  }
  if (hasSaveFile.value === false) {
    hasSaveFile.value = true
  }
  cueFullPath.value = fullPath
  cueSaved.value = true
  console.log(`Cue saved to ${fullPath}`)
}

async function testCue() {
  await saveCue()
  window.MakeShiftCtrl.call.runCue(cueId.value)
}

async function loadCue(cueId: string) {
  saveCue()
  const newCue = await window.MakeShiftCtrl.get.cueById(cueId)
  console.log(`Loading ${cueId}`)
  console.log(newCue)
  if (typeof newCue !== 'undefined') {
    editor.setValue(textDecoder.decode(newCue.contents))
    cueName.value = newCue.name
    cueFolder.value = newCue.folder
    cueFullPath.value = newCue.fullPath
  }
}


function checkAutoSave() {
  const delta = Date.now() - saveStateStyles.lastChange
  if (hasSaveFile.value && delta > autoSaveWaitTime && cueSaved.value === false) {
    saveCue()
  }
}

function fitCodebox() {
  editor.resize(true)
}

watch(
  () => cueSaved.value,
  (cueSaved) => {
    if (cueSaved) {
      saveStateStyles.borderColor = savedColor
      saveStateStyles.iconUrl = fileSavedIcon
      saveStateStyles.lastChange = Date.now()
    } else {
      saveStateStyles.borderColor = unsavedColor
      saveStateStyles.iconUrl = fileUnsavedIcon
    }

  }
)

// watch(
//   () => cueFullPath.value,
//   (fullPath) => {
//     if (fullPath === '') {
//       hasSaveFile.value = false
//     } else {
//       hasSaveFile.value = true
//     }
//   }
// )

</script>

<template>
  <div class="name-entry hidden clone" ref="folderNameClone">
    {{ cueFolder }}
  </div>
  <div class="name-entry hidden clone" ref="cueNameClone">
    {{ cueName }}
  </div>
  <div class="pane-border codebox-border">
    <div class="toolbar">
      <div class="toolbar-cluster left">
        <toolbar-spacer width="2px" />
        <text-button :icon-url="newCueIcon" @click="createCue">
          new cue
        </text-button>
        <toolbar-spacer width="8px" />
        <text-button :icon-url="saveIcon" @click="saveCue">
          save
        </text-button>
      </div>
      <div class="toolbar-cluster right">
        <text-button :icon-url="testCueIcon" @click="testCue">
          test
        </text-button>
        <toolbar-spacer width="8px" />
        <text-button :icon-url="assignCueIcon" @click="assignCueToEvent">
          assign to event
        </text-button>
      </div>
    </div>
    <div class="toolbar thin">
      <div class="toolbar-cluster left">
        <div v-if="editCuePath === false" class="toolbar-cluster" style="transition-duration: 0.2s;">
          <toolbar-spacer width="4px" title="Edit save path" />
          <icon-button :icon-url="editPathIcon" clickable size="18px" color="var(--color-neutral)"
            hoverColor="var(--color-text)" @click="editCuePath = true" />
          <toolbar-spacer width="8px" />
          cues
          <toolbar-spacer width="4px" />
          <div class="toolbar-cluster" v-if="cueFolder !== '.' && cueFolder !== ''">
            <div v-for="folder in cueFolderList" class="toolbar-cluster">
              <div v-if="folder" class="toolbar-cluster">
                <icon :icon-url="breadcrumbIcon" size="14px" />
                <toolbar-spacer width="3px" />
                <div style="align-self: center;">
                  {{ folder }}
                </div>
                <toolbar-spacer width="3px" />
              </div>
            </div>
          </div>
          <icon :icon-url="breadcrumbIcon" size="14px" />
          <toolbar-spacer width="3px" />
          <div class="toolbar-cluster" :style="{
            fontStyle: hasSaveFile ? 'normal' : 'italic',
            alignSelf: 'center',
          }">
            {{ cueName }}.cue.js
          </div>

          <toolbar-spacer width="10px" />
          <div v-if="hasSaveFile && cueSaved === false" class="save-icon" />
        </div>
        <div v-else class="toolbar-cluster" style="transition-duration: 0.2s;">
          <toolbar-spacer width="3px" />
          <icon-button :icon-url="savePathIcon" clickable size="19px" color="var(--color-neutral)"
            hoverColor="var(--color-text)" @click="editCuePath = false" />
          <toolbar-spacer width="8px" />
          cues
          <toolbar-spacer width="4px" />
          <icon :icon-url="breadcrumbIcon" size="14px" />
          <toolbar-spacer width="4px" />
          <label for="folder-name">
            Folder:
          </label>
          <input id="folder-name" class="name-entry" v-model="cueFolder" type="text"/>
          <icon :icon-url="breadcrumbIcon" size="14px" :style="{
            margin: `0px 4px`,
          }" />
          <toolbar-spacer width="8px" />
          <label for="cue-name">
            Cue Name:
          </label>
          <toolbar-spacer width="4px" />
          <input id="cue-name" class="name-entry" v-model="cueName" type="text" 
           />
          <div class="toolbar-cluster" style="align-self: center;">
            .cue.js
          </div>
        </div>
      </div>
      <div class="toolbar-cluster right">
      </div>
    </div>

    <div id="codebox-inner-border" class="pane-rounded-inner" :style="{
      borderColor: `rgb(${saveStateStyles.borderColor})`,
    }">
      <div id="codebox-editor" ref="codeboxEditorElement" />
    </div>
  </div>
</template>

          <!-- :style="{ width: `${folderNameClone?.getBoundingClientRect().width as number + 10}px` }" -->

<style lang="scss">
.codebox-border {
  /* -webkit-box-sizing: border-box;
-moz-box-sizing: border-box;
-ms-box-sizing: border-box; */
  flex-direction: column;
  display: flex;

  width: 100%;
  height: 100%;
}


#codebox-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;

  justify-content: space-between;

  margin-bottom: 4px;
  box-sizing: border-box;
  height: 3.5em;
  padding-top: 4px;
  padding-bottom: 2px;
  width: 100%;
}

.save-icon {
  height: 5px;
  width: 5px;
  // paddingTop: '5px',
  margin: auto 0px;
  background-color: rgb(var(--color-neutral));
  border-radius: 50%;
}

.name-entry {
  box-sizing: border-box;
  border-color: rgb(var(--color-hl));
  border-width: 1px;
  border-style: solid;
  // outline: 2px solid rgba($color: var(--color-neutral), $alpha: 1.0);
  border-radius: 5px;
  // background-color: var(--color-bg);
  // height: fit-content;
  margin: 0px 4px;
  margin-top: 2px;
  padding: 4px;
  padding-left: 5px;
  padding-bottom: 2px;
  min-width: 60px;
  transition-duration: 0s;

  &.clone {
    position: absolute;
    min-width: auto;
  }

  &:focus {
    background-color: rgb(var(--color-hl));
    // border-bottom-color: var(--color-primary1);
  }
}



#codebox-editor {
  // box-sizing: border-box;
  position: relative;
  padding: 1px;
  height: 100%;
}
</style>
