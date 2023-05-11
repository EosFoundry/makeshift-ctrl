<script setup lang="ts">
import Icon from './Icon.vue'

import expandedIconUrl from '../assets/icon/bootstrap/chevron-down.svg?url'
import collapsedIconUrl from '../assets/icon/bootstrap/chevron-right.svg?url'
import { ref, watch } from 'vue';
import { stat } from 'fs';
import { Folder } from '../main';
import { Cue } from '../../types/electron/main/cues';

const props = defineProps<{
  folder: Folder,
  collapseState: boolean,
  topLevel?: boolean
}>()

const state = ref({
  icon: collapsedIconUrl,
  collapsed: props.collapseState,
  display: props.collapseState ? 'none' : 'inherit',
  classes: ['file-list']
})

if (props.topLevel) {
  state.value.classes.push('top-level')
}

function toggleHide() {
  if (state.value.collapsed) {
    state.value.collapsed = false
  } else {
    state.value.collapsed = true
  }
}
function sendLoadEvent(cue: Cue) {
  console.log(cue)
  window.dispatchEvent(new CustomEvent('loadCue', { detail: cue.id }))
}

watch(() => state.value.collapsed, (collapsed) => {
  if (collapsed) {
    state.value.display = 'inherit'
    state.value.icon = expandedIconUrl
  } else {
    state.value.display = 'none'
    state.value.icon = collapsedIconUrl
  }
})
// console.log(props.folder)
</script>

<template>
  <!-- {{ state }} -->
  <li class="list-entry" @click="toggleHide" :style="{
    display: topLevel ? 'none' : 'inline flex'
  }">
    <icon :icon-url="state.icon" size="12px" :style="{ cursor: 'pointer' }" />
    <div v-if="(topLevel !== true)" class="entry-name">
      {{ folder.name }}
    </div>
  </li>
  <ul :class="state.classes" :style="{
    display: state.display
  }">
    <FolderList v-for="(subFolder) in props.folder.subFolders" :folder="subFolder" :collapse-state="true" />
    <li class="list-entry" @click="sendLoadEvent(file)" v-for="(file) in props.folder.cueFiles">
      <div class="entry-name">
        {{ file.file }}
      </div>
    </li>
  </ul>
</template>

<style lang="scss">

</style>