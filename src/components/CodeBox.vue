<script lang="ts">
export default {
  name: 'CodeBox'
}
</script>

<script setup lang="ts">
import { ref, markRaw, watch, nextTick, reactive, onMounted } from "vue";
import ace, { type Ace } from 'ace-builds'
import 'ace-builds/src-min-noconflict/mode-javascript'
import { executionAsyncResource } from "async_hooks";

const props = defineProps<{
  paneHeightPercent?: number
}>()

function transformAceUrl(url: string) {
  const regexpLastWord = /\/[^/]*$/;
  const regexpToaster = /[\b\w\b]+/g
  // urlString.

}

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
  console.log(import.meta.url)
  // console.log(aceUrl)
  const editor = markRaw(ace.edit("codebox-editor"))
  editor.resize()
  window.addEventListener('resize', () => {
    console.log('ace editor resizing')
  });

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
