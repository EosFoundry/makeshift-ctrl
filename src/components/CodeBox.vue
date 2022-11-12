<script lang="ts">
export default {
  name: 'CodeBox'
}
</script>

<script setup lang="ts">
import { ref, markRaw, watch, nextTick, reactive, onMounted, inject, Ref } from "vue";
import { resolve, dirname, join } from 'pathe'
import ace, { edit, type Ace } from 'ace-builds'
import 'ace-builds' // this needs to be called for ace.define to exist

import unsavedIcon from '../assets/icon/bootstrap/file-diff.svg?url'
import savedIcon from '../assets/icon/bootstrap/file-check.svg?url'
import { MakeShiftPortFingerprint } from "@eos-makeshift/serial";

const nanoid = inject('nanoid') as () => string
const editorContents = inject('current-session') as Ref<string>
const Doc = ace.require('ace/document').Document
const acePath = join(import.meta.env.BASE_URL + 'ace-pkg/src-min-noconflict')
const currentDevice = inject('current-device') as Ref<MakeShiftPortFingerprint>

ace.config.set("basePath", acePath)
ace.config.set("workerPath", acePath)
ace.config.set("loadWorkerFromBlob", false)
ace.config.loadModule("ace/keybinding/emacs")
ace.config.loadModule("ace/keybinding/sublime")
ace.config.loadModule("ace/keybinding/vim")
ace.config.loadModule("ace/keybinding/vscode")

const autoSaveWaitTime = 4000

const props = defineProps<{
  paneHeightPercent?: number
}>()

const now = new Intl.DateTimeFormat('en', {
  month: 'short',
  day:'2-digit',
}).format(new Date()).replace(/\ /, '')

const newCue = {
  id: nanoid(),
  name: `cue_${now}`,
  folder: 'sketchPad',
  tags: []
}

const cue = ref(newCue)
const savedColor = 'var(--color-hl)'
const unsavedColor = 'var(--color-primary1)'


const saveState = reactive({
  lastChange: Date.now(),
  saved: true,
  borderColor: savedColor,
  iconUrl: savedIcon,
})

let autoSaveInterval = null

function checkAutoSaveTime() {
  const delta = Date.now() - saveState.lastChange
  if (delta > autoSaveWaitTime && saveState.saved === false) {
    console.log('saved!')
    saveState.saved = true
    saveState.borderColor = savedColor
    saveState.iconUrl = savedIcon
  }
}



onMounted(() => nextTick(() => {
  const editor = ace.edit("codebox-editor") as any
  editor.setTheme('ace/theme/twilight')
  editor.setOption('useSoftTabs', true)
  editor.setOption('tabSize', 2)
  editor.setKeyboardHandler('ace/keyboard/vim');
  editor.setFontSize(16)
  editor.session.on('changeMode', (e: any, session: any) => {
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
    saveState.lastChange = Date.now()
    saveState.saved = false
    saveState.borderColor = unsavedColor
    saveState.iconUrl = unsavedIcon
  })

  autoSaveInterval = setInterval(checkAutoSaveTime, autoSaveWaitTime);

  watch(
    () => props.paneHeightPercent,
    (newHeight, oldHeight) => {
      editor.resize()
    })

}))
</script>

<template>
  <div class="pane-border codebox-border">
    <div id="codebox-toolbar">
      <input id="cue-name" v-model="cue.name" type="text" />
      <div id="save-icon" class="icon" :style="{
        maskImage: `url(${saveState.iconUrl})`,
      }" />
      <code>
      device::{{ currentDevice.portId === '' ? 'd/c' : currentDevice.portId }}

      </code>
    </div>

    <div id="codebox-inner-border" class="pane-rounded-inner" :style="{
      borderColor: saveState.borderColor
    }">
      <div id="codebox-editor" />
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
  // justify-content: center;

  margin-bottom: 4px;
  box-sizing: border-box;
  height: 3em;
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

#cue-name {
  // box-sizing: border-box;
  border: 2px solid rgba($color: #000000, $alpha: 0);
  outline: 2px solid rgba($color: #000000, $alpha: 0);
  border-radius: 6px;
  background-color: var(--color-bg);
  // height: fit-content;
  margin: 4px;
  padding: 4px;

  &:focus {
    background-color: var(--color-hl);
    border-bottom-color: var(--color-primary1);
  }
}

#codebox-editor {
  // box-sizing: border-box;
  position: relative;
  padding: 1px;
  height: 100%;
}

</style>
