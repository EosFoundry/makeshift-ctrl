<script setup lang="ts">
import { fileURLToPath } from 'url';
import { inject, onBeforeMount, onMounted, ref, Ref } from 'vue';
import { Folder } from '../main';
import { Cue, CueMap } from '../../types/electron/main/cues'

import folderIcon from '../assets/icon/bootstrap/folder2-open.svg?url'

import FolderList from './FolderList.vue'
import TextButton from "./TextButton.vue";
import IconButton from "./IconButton.vue";
import ToolBarSpacer from './ToolBarSpacer.vue';


const workspaceList = ref([]) as Ref<string[]>


onMounted(() => {
window.MakeShiftCtrl.onEv.blockly.workspaceListUpdate(() => {
  window.MakeShiftCtrl.get.allBlocklySerialWorkspaceNames()
    .then((workspaces: string[]) => {
      console.log(workspaces)
      workspaceList.value = workspaces
    })
    .catch((err) => {
      console.log(err)
    })
})
  window.MakeShiftCtrl.get.allBlocklySerialWorkspaceNames()
    .then((workspaces: string[]) => {
      console.log(workspaces)
      workspaceList.value = workspaces
    })
    .catch((err) => {
      console.log(err)
    })
})


function sendLoadEvent(workspaceId: string) {
  console.log(workspaceId)
  window.dispatchEvent(new CustomEvent('loadWorkspace', { detail: workspaceId}))
}

</script>


<template>
  <div class="pane-border w-full h-full">
    <div :class="[
      'box-border',
      'border-solid',
      'border-2',
      'rounded-lg',
      'border-hl',
      'overflow-hidden',
      'bg-dark',
      'flex-row',
      'flex-nowrap',
      'w-full',
      'h-full']">
      <div class="pane-title toolbar shrink">
        <div class="toolbar-cluster">
          SAVED WORKSPACES
        </div>
        <div class="toolbar-cluster">
          <!-- <icon-button
           :icon-url="folderIcon"
           @click="openCueFolder"
           color="var(--color-neutral)"
           hover-color="var(--color-text)"
          /> -->
          <ToolBarSpacer width="8px" />
        </div>
      </div>
      <div class="overflow-scroll m-0 pb-6 h-full">
        <li
          class="list-entry"
          @click="sendLoadEvent(workspaceId)"
          v-for="(workspaceId) in workspaceList"
        >
          <div class="entry-name">
            {{ workspaceId }}
          </div>
        </li>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.pane-title {
  text-align: left;
  padding-top: 4px;
  padding-bottom: 6px;
  padding-left: 1em;
  font-size: 10pt;
  background-color: rgb(var(--color-bg));
  // color: rgb(var(--color-hl1));
}

.list-entry {
  display: flex;
  flex-direction: row;
  padding-top: 1px;
  padding-left: 8px;
  padding-bottom: 1px;
  margin: 2px 0px;
  cursor: pointer;

  align-items: center;

  &:hover {
    background-color: rgb(var(--color-primary2));
  }
}

.entry-name {
  margin-left: 6px;
}

.file-list {
  text-align: left;
  list-style-type: none;
  padding: 0px;
  border-left: 1px solid rgb(var(--color-neutral));
  margin-left: 14px;

  &.top-level {
    border-left: none;
    margin: 0;
  }
}
</style>