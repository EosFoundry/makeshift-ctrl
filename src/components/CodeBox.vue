<script lang="ts">
export default {
  name: 'CodeBox'
}
</script>

<script setup lang="ts">
import { ref, markRaw, watch, nextTick, reactive, onMounted, inject } from "vue";
// import { resolve, dirname, join} from 'pathe'
import { type Ace } from 'ace-builds'
// import 'ace-builds' // this needs to be called for ace.define to exist
// import aceUrl from 'ace-builds/src-noconflict/mode-javascript?url'
// import { executionAsyncResource } from "async_hooks";
// const url = new URL(import.meta.url)
// const acePath = url.origin + join(dirname(aceUrl),'.')
// console.log(url.origin + url.pathname)
// console.log(acePath)
// ace.config.set("basePath", acePath)
// ace.config.set("workerPath", acePath);
// ace.config.set("loadWorkerFromBlob", false);

const ace = inject('ace') as any

const props = defineProps<{
  paneHeightPercent?: number
}>()

// TODO: load ace with interface/main.ts shitty themes through either asset or something else I guess?

const codeBoxState = reactive({
  language: `language-javascript`,
  value: `// Welcome to the makesh*ft-ctrl alpha release!\n`,
  changed: false,
})

watch(
  codeBoxState,
  (value, prevValue) => {
  }
)



onMounted(() => nextTick(() => {
  const editor = markRaw(ace.edit("codebox-editor"))
  editor.setFontSize(16)
  editor.setTheme('ace/theme/monokai')
  editor.session.setMode('ace/mode/javascript')
  editor.resize()
  // editor.session.setMode(aceUrl);
  // editor.setTheme(aceMonokaiUrl);

  watch(
    () => props.paneHeightPercent,
    (newHeight, oldHeight) => { editor.resize() })

}))
</script>

<template>
  <div class="codebox-border">
    <div id="codebox-editor" />
  </div>
</template>


<style>
.codebox-border {
  /* -webkit-box-sizing: border-box;
-moz-box-sizing: border-box;
-ms-box-sizing: border-box; */
  box-sizing: border-box;
  background-color: var(--color-bg);
  color: var(--color-bg);
  border-radius: 10px;
  /* border-width: 14px; */
  padding: 11px 10px;

  width: 100%;
  height: 100%;

}

#codebox-editor {
  /* -webkit-box-sizing: border-box;
-moz-box-sizing: border-box;
-ms-box-sizing: border-box; */
  box-sizing: border-box;
  border-radius: 8px;
  width: 100%;
  height: 100%;
}
</style>
