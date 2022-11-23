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

import saveIcon from '../assets/icon/bootstrap/save.svg?url'
import editPathIcon from '../assets/icon/bootstrap/pencil-square.svg?url'
import savePathIcon from '../assets/icon/bootstrap/clipboard-check.svg?url'
import breadcrumbIcon from '../assets/icon/bootstrap/chevron-compact-right.svg?url'
import fileUnsavedIcon from '../assets/icon/bootstrap/file-diff.svg?url'
import fileSavedIcon from '../assets/icon/bootstrap/file-check.svg?url'
import { MakeShiftPortFingerprint } from "@eos-makeshift/serial";
import { executionAsyncResource } from "async_hooks";
import icon from './icon.vue'
import toolbarSpacer from './ToolBarSpacer.vue'
import { watchResize } from "../composables/resizer";
import { Cue, CueMap } from "types/electron/main";
import TextButton from "./TextButton.vue";

const nanoid = inject('nanoid') as () => string
const editorContents = inject('current-session') as Ref<string>
const acePath = import.meta.env.BASE_URL + 'ace-pkg/src-min-noconflict'
const cues = inject('cues') as Ref<CueMap>
const currentDevice = inject('current-device') as Ref<MakeShiftPortFingerprint>
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


const now = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: '2-digit',
}).format(new Date())
  .replace(/\ /, '')

const newCue: Cue = {
  id: `cue_${now}.cue.js`,
  file: `cue_${now}.cue.js`,
  fullPath: '',
  name: `cue_${now}`,
  folder: '',
}
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


let autoSaveInterval = null
onMounted(() => nextTick(async () => {
  const existingCue = await window.MakeShiftCtrl.get.cueById(cueId.value)
  if (typeof existingCue !== 'undefined') {
    cueFullPath.value = existingCue.fullPath
    cueFolder.value = existingCue.folder
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
  editor.setOption('useSoftTabs', true)
  editor.setOption('tabSize', 2)
  editor.setKeyboardHandler('ace/keyboard/vim');
  editor.setFontSize(16);
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

  autoSaveInterval = setInterval(checkAutoSaveTime, autoSaveWaitTime);
  watchResize(codeboxEditorElement.value as HTMLElement, fitCodebox)
  window.addEventListener('loadCue', (ev: any) => { loadCue(ev.detail) })
}))

async function saveCue() {
  const id = cueId.value
  const contents = textEncoder.encode(editor.getValue())
  window.MakeShiftCtrl.set.cueFile({
    cueId: id,
    contents: contents,
  }).then((fullPath) => {
    cueFullPath.value = fullPath
    console.log(cueFullPath.value)
    cueSaved.value = true
  })
}

function loadCue(cueId: string) {
  // saveCue()
  const newCue = cues.value.get(cueId)
  console.log(`asdf ${cueId}`)
  if (newCue?.contents) {
    editor.setValue(textDecoder.decode(newCue.contents))
    cueName.value = newCue.name
    cueFolder.value = newCue.folder
    cueFullPath.value = newCue.fullPath
  }
}

function checkAutoSaveTime() {
  const delta = Date.now() - saveStateStyles.lastChange
  if (hasSaveFile.value && delta > autoSaveWaitTime && cueSaved.value === false) {
    saveCue()
    console.log('saved!')
    cueSaved.value = true
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

watch(
  () => cueFullPath.value,
  (fullPath) => {
    if (fullPath === '') {
      hasSaveFile.value = false
    } else {
      hasSaveFile.value = true
    }
  }
)

</script>

<template>
  <div class="name-entry hidden clone" ref="folderNameClone">
    {{ cueFolder }}
  </div>
  <div class="name-entry hidden clone" ref="cueNameClone">
    {{ cueName }}
  </div>
  <div class="pane-border codebox-border">
    <div id="codebox-toolbar">
      <div class="toolbar-cluster left">
        <div v-if="editCuePath === false" class="toolbar-cluster" style="transition-duration: 0.2s;">
          <toolbar-spacer width="4px" title="Edit save path" />
          <icon :icon-url="editPathIcon" size="18px" :click="true" color="var(--color-neutral)"
            @click="editCuePath = true" />
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
          <icon v-if="hasSaveFile" :icon-url="saveStateStyles.iconUrl" :color="
            hasSaveFile ? 'var(--color-neutral)' : 'var(--color-secondary)'
          " />
        </div>
        <div v-else class="toolbar-cluster" style="transition-duration: 0.2s;">
          <toolbar-spacer width="4px" />
          <icon :icon-url="savePathIcon" size="18px" :click="true" color="var(--color-green)"
            @click="editCuePath = false" />
          <toolbar-spacer width="8px" />
          cues
          <toolbar-spacer width="4px" />
          <icon :icon-url="breadcrumbIcon" size="14px" />
          <toolbar-spacer width="8px" />
          <label for="folder-name">
            Folder:
          </label>
          <input id="folder-name" class="name-entry" v-model="cueFolder" type="text" :style="{
            width: `${folderNameClone?.getBoundingClientRect().width as number + 10}px`
          }" />
          <icon :icon-url="breadcrumbIcon" size="14px" :style="{
            margin: `0px 4px`,
          }" />
          <toolbar-spacer width="8px" />
          <label for="cue-name">
            Cue:
          </label>
          <toolbar-spacer width="4px" />
          <input id="cue-name" class="name-entry" v-model="cueName" type="text" :style="{
            width: `${cueNameClone?.getBoundingClientRect().width as number + 10}px`
          }" />
          <div class="toolbar-cluster" style="align-self: center;">
            .cue.js
          </div>
        </div>
      </div>
      <div class="toolbar-cluster right">
        <text-button :icon-url="saveIcon" @click="saveCue">
          save
        </text-button>


      </div>
    </div>

    <div id="codebox-inner-border" class="pane-rounded-inner" :style="{
      borderColor: saveStateStyles.borderColor
    }">
      <div id="codebox-editor" ref="codeboxEditorElement" />
    </div>
  </div>
</template>


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

#save-icon {
  height: 20px;
  width: 20px;
  // paddingTop: '5px',
  margin: auto 0px;
  background-color: var(--color-neutral);
}

.name-entry {
  box-sizing: border-box;
  border-color: var(--color-hl);
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
    background-color: var(--color-hl);
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
