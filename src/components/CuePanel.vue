<script setup lang="ts">
import { Folder } from 'src/main';
import { fileURLToPath } from 'url';
import { inject, onBeforeMount, ref, Ref } from 'vue';
import { Cue, CueMap } from '../../types/electron/main/cues'

import folderIcon from '../assets/icon/bootstrap/folder2-open.svg?url'

import FolderList from './FolderList.vue'
import TextButton from "./TextButton.vue";
import IconButton from "./IconButton.vue";
import ToolBarSpacer from './ToolBarSpacer.vue';


const cueDirectory = inject('cue-directory') as Ref<Folder>


onBeforeMount(async () => {
  // console.log(cueDirectory.value)
})

async function openCueFolder() {
  window.MakeShiftCtrl.call.openCueFolder()
}

function sendLoadEvent(cue: Cue) {
  console.log(cue)
  window.dispatchEvent(new CustomEvent('loadCue', { detail: cue.id }))
}

</script>


<template>
  <div class="pane-border">
    <!-- <div class="toolbar">
      <div class="toolbar-cluster left">
      </div>
      <text-button :icon-url="folderIcon" @click="openCueFolder">
        open cue folder
      </text-button>
      <div class="toolbar-cluster right">
      </div>
    </div> -->
    <div class="pane-rounded-inner cue-panel">
      <div class="pane-title toolbar">
        <div class="toolbar-cluster">
          CUE FOLDER
        </div>
        <div class="toolbar-cluster">
          <icon-button :icon-url="folderIcon" @click="openCueFolder"
          color="var(--color-neutral)"
          hover-color="var(--color-text)"
           />
          <ToolBarSpacer width="8px"/>
        </div>
      </div>
      <FolderList top-level :folder="cueDirectory" :collapse-state="false" />
      <!-- <ul class="file-list top-level">
        <FolderList v-for="(subFolder) in cueDirectory.subFolders" 
          :folder="subFolder" 
          :collapse-state="true" 
        />
        <li class="list-entry" @click="sendLoadEvent(file)" v-for="(file) in cueDirectory.cueFiles">
          <div class="entry-name">
            {{ file.file }}
          </div>
        </li>
      </ul> -->
    </div>
  </div>
</template>

<style lang="scss">
.cue-panel {
  background-color: var(--color-dark);
}

.pane-title {
  text-align: left;
  padding-top: 4px;
  padding-bottom: 6px;
  padding-left: 1em;
  font-size: 10pt;
  background-color: var(--color-bg);
  color: var(--color-hl1);
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
    background-color: var(--color-primary2);
  }
}

.entry-name {
  margin-left: 6px;
}

.file-list {
  text-align: left;
  list-style-type: none;
  padding: 0px;
  border-left: 1px solid var(--color-neutral);
  margin-left: 14px;

  &.top-level {
    border-left: none;
    margin: 0;
    margin-top: 8px;

  }
}
</style>