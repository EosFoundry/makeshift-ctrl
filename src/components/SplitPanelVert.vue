<script lang="ts">
export const panelEvents = ['start-resize', 'resizing', 'end-resize']
export type PanelEvents = typeof panelEvents[number]
export type PanelEventData = {
  topPanelHeight: number,
  bottomPanelHeight: number,
  topPanelHeightPercent: number,
  dividerHeight: number,
}
</script>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { pxToRem } from '../utilities/cssUnits';

const props = defineProps<{
  height: number,
  width?: number
  minSize?: {
    width?: number,
    height?: number
  },
  maxSize?: {
    width?: number,
    height?: number
  },
  topPanelHeightPercent?: number,
  dividerHeight?: number,
  margin?: number,
}>()

const emit = defineEmits(panelEvents)

const state = ref(
  {
    width: typeof props.width !== 'undefined' ? props.width : -1,
    margin: typeof props.margin !== 'undefined' ? props.margin : 0,
    height: props.height - (typeof props.margin !== 'undefined' ? props.margin : 0),
  }
)

const heightString = computed(() => {
  return props.height + 'px'
})

const widthString = computed(() => {
  if (props.width) {
    return props.width + 'px'
  } else {
    return 'auto'
  }
})

const defaultDividerHeight = 10
const initialDividerHeight = props.dividerHeight ? props.dividerHeight : defaultDividerHeight
const initialTopPanelHeightPercent = props.topPanelHeightPercent ? props.topPanelHeightPercent : 50
const initlalTopPanelHeight = Math.round(
  (initialTopPanelHeightPercent / 100)
  * (state.value.height - initialDividerHeight - (state.value.margin * 2))
)

const dividerHeight = ref(initialDividerHeight)
const topPanelHeight = ref(initlalTopPanelHeight)
const topPanelHeightPercent = ref(initialTopPanelHeightPercent)
const bottomPaneHeight = computed(() => {
  const bph = state.value.height
    - topPanelHeight.value
    - dividerHeight.value
    - (state.value.margin * 2)
  return bph
})
const topPanelHeightRem = computed(() => {
  return pxToRem(topPanelHeight.value)
})
const bottomPaneHeightRem = computed(() => {
  return pxToRem(bottomPaneHeight.value)
})

const SplitPanelVertDiv = ref(null) as any


onMounted(() => {
  if (typeof props.height === 'undefined') {
    state.value.height = SplitPanelVertDiv.value.offsetHeight
  }
  // console.log(props)
  // console.log(state.value)
  // console.log(topPanelHeight.value)
  // console.log(dividerHeight.value)
  // console.log(bottomPaneHeight.value)
  // console.log(state.value.margin)
  // console.log(topPanelHeight.value + dividerHeight.value + bottomPaneHeight.value)
  // console.log(SplitPanelVertParent.value.offsetHeight)
})

watch(
  () => props.height,
  (height) => {
    state.value.height = height
    topPanelHeight.value = Math.round(
      (topPanelHeightPercent.value / 100)
      * (height - dividerHeight.value - state.value.margin)
    )
    console.log(height)
  },
  { immediate: true }
)

const resizeLastPos = ref(0)
const resizing = ref(false)
function startResize(ev: MouseEvent) {
  if (resizing.value) {
    return
  }
  console.log(ev)
  resizeLastPos.value = ev.clientY
  console.log(resizeLastPos.value)
  window.addEventListener('mousemove', onMouseMoveResize)
  resizing.value = true
  emitPanelEvent('start-resize')
}

function endResize(ev: MouseEvent) {
  resizing.value = false
  window.removeEventListener('mousemove', onMouseMoveResize)
  emitPanelEvent('end-resize')
}

function onMouseMoveResize(ev: MouseEvent) {
  const delta = ev.clientY - resizeLastPos.value
  resizeLastPos.value = ev.clientY
  console.log(`${ev.clientY} | ${pxToRem(ev.clientY)} | ${delta} | ${pxToRem(delta)}`)
  topPanelHeight.value += delta
  topPanelHeightPercent.value = (topPanelHeight.value / (state.value.height - dividerHeight.value)) * 100
  emitPanelEvent('resizing')
}

window.addEventListener('mouseup', endResize)

window.addEventListener('resize', (ev) => {
  topPanelHeight.value = (state.value.height - dividerHeight.value - state.value.margin) * (topPanelHeightPercent.value / 100)  
  
  console.log(`${topPanelHeight.value} | ${pxToRem(topPanelHeight.value)} | ${state.value.height} | ${pxToRem(state.value.height)}`)

  emitPanelEvent('resizing')
})

function emitPanelEvent(ev: PanelEvents) {
  emit(ev, {
    topPanelHeightPercent: topPanelHeightPercent.value,
    topPanelHeight: topPanelHeight.value,
    bottomPanelHeight: bottomPaneHeight.value,
    dividerHeight: dividerHeight.value,
  })
}

</script>

<template>
  <div
   :style="{
     height: heightString,
     width: widthString,
   }"
   ref="SplitPanelVertDiv"
  >
    <div
     :style="{
       height: topPanelHeight + 'px',
       width: widthString,
       marginTop: state.margin + 'px',
       marginLeft: state.margin + 'px',
       marginRight: state.margin + 'px',
     }"
     :class="['box-border']"
    >
      <slot
       name="top"
       :panelHeight="topPanelHeight"
      ></slot>
    </div>
    <div
     :class="['splitpanel-vert-divider', 'm-auto']"
     :style="{
       height: dividerHeight + 'px',
       width: widthString,
       padding: '3px'
     }"
     @mousedown="startResize"
    >
      <div class="splitpanel-vert-divider-handle rounded-full h-full w-14 m-auto" />
    </div>

    <div
     :style="{
       height: bottomPaneHeight + 'px',
       width: widthString,
       marginBottom: state.margin + 'px',
       marginLeft: state.margin + 'px',
       marginRight: state.margin + 'px',
     }"
     :class="['box-border']"
    >
      <slot
       name="bottom"
       :panelHeight="bottomPaneHeight"
      ></slot>
    </div>
  </div>
</template>

<style lang="scss">
.splitpanel-vert-divider {
  cursor: ns-resize;

  &-handle {
    background: rgb(var(--color-text));
  }
}
</style>