<script setup lang="ts">
import { SimplePopup } from '../composables/popup';
import { Ref, inject, onMounted, provide, ref, watch } from 'vue'

const activePopups = inject('popups') as Ref<SimplePopup[]>

const popupBoundary = ref<HTMLElement | null>(null)
const boundaryStyle = [
  'absolute',
  'right-8',
  'w-fit',
  'h-fit',
  'flex',
  'flex-col',
  'gap-y-2',
  'content-center',
  'justify-center',
  'overflow-visible',
  // 'bg-black',
  // 'bg-opacity-30',
]

const boundaryBottomRem = 4
const popupStyle = [
  'm-auto',
  'flex',
  'flex-col',
  'gap-y-2',
  'w-fit',
  'border-solid',
  'rounded-lg',
  'border-2',
  'bg-hl',
  'border-neutral',
  'drop-shadow-xl',
  'p-3',
]

function remove(popupId: string) {
  activePopups.value = activePopups.value.filter((popup) => popup.id !== popupId)
}


onMounted(() => {
})

</script>

<template>
  <div
    ref="popupBoundary"
    v-if="activePopups.length > 0"
    :class="[...boundaryStyle,]"
    :style="{
      transition: 'all 0.4s ease-in-out',
      bottom: `${boundaryBottomRem}rem`,
      zIndex: 999,
    }"
  >
    <div
      v-for="( popup, index ) in activePopups"
      :id="popup.id"
      :class="[...popupStyle,]"
      :style="{
        transition: 'all 0.4s ease-in-out',
        zIndex: 1000,
      }"
    >
      <div :class="['w-fit', 'pl-1']">
        {{ popup.message }}
      </div>
      <div v-if="popup.hasInput"
        :class="['flex', 'flex-col', 'gap-y-2', 'p-1', 'justify-items-end']"
      >
        <div v-for="(label, index) in popup.inputLabels"
          :class="['flex', 'flex-row', 'gap-x-2', 'items-center', ]"
        >
          {{ label }}
          <input
            v-model="popup.inputValues[index]"
            :class="['inline', 'p-1', 'border-solid', 'rounded-md', 'border-2', 'border-neutral']"
          />
        </div>
      </div>
      <div :class="['gap-x-3', 'flex', 'flex-row-reverse']">
        <button
          v-if="popup.hasCancel"
          :class="[
            'btn-subtle',
            'inline',
            // 'bg-neutral',
            // 'border-neutral',
          ]"
          @click="() => { console.log(popup); popup.cancel(); remove(popup.id) }"
        >
          Cancel
        </button>
        <button
          :class="[
            'inline',
          ]"
          @click="() => { console.log(popup); popup.okay(); remove(popup.id) }"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<style></style>