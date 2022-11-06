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

const editorContents = inject('current-session') as Ref<string>
const Doc = ace.require('ace/document').Document
const acePath = join(import.meta.env.BASE_URL + 'ace-pkg/src-min-noconflict')

ace.config.set("basePath", acePath)
ace.config.set("workerPath", acePath);
ace.config.set("loadWorkerFromBlob", false);

const autoSaveWaitTime = 4000

const props = defineProps<{
  paneHeightPercent?: number
}>()


const state = reactive({
  lastChange: Date.now(),
  savedColor: 'var(--color-dark)',
})
let autoSaveInterval

function checkAutoSaveTime() {
  const delta = Date.now() - state.lastChange
  if (delta > autoSaveWaitTime) {
    // console.log('saved!')
    state.savedColor = 'var(--color-dark)'
  }
}



onMounted(() => nextTick(() => {
  const editor = ace.edit("codebox-editor") as any
  editor.setTheme('ace/theme/twilight')
  editor.setFontSize(16)
  editor.session.on('changeMode', (e:any, session:any) => {
    if ("ace/mode/javascript" === session.getMode().$id) {
      if (typeof session.$worker !== 'undefined') {
        session.$worker.send("setOptions", [{
          "esversion": 2020,
          "esnext": false,
        }]);
      }
    }
  });
  editor.session.setMode('ace/mode/javascript')
  editor.resize()
  editor.session.setValue(editorContents.value)
  editor.on('change', (delta:any) => {
    state.lastChange = Date.now()
    state.savedColor = 'var(--color-hl)'
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
  <div class="codebox-border">
    <div id="codebox-editor" :style="{
      borderColor: state.savedColor
    }">
    </div>
  </div>
</template>


<style lang="scss">
.codebox-border {
  /* -webkit-box-sizing: border-box;
-moz-box-sizing: border-box;
-ms-box-sizing: border-box; */
  box-sizing: border-box;
  background-color: var(--color-bg);
  border-radius: 10px;
  /* border-width: 14px; */
  margin: auto;
  padding: 10px;
  /* border:solid; */
  /* border-color: aliceblue; */
  border-width: 2px;

  width: 100%;
  height: 100%;

}

#codebox-editor {
  /* -webkit-box-sizing: border-box;
-moz-box-sizing: border-box;
-ms-box-sizing: border-box; */
  box-sizing: border-box;
  margin: auto;
  border-radius: 8px;
  border: solid;
  border-width: 3px;
  width: 100%;
  height: 100%;
}
</style>
