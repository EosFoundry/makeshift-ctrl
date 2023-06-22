<script lang="ts">
export const panelEvents = ['start-resize', 'resizing', 'end-resize']
export type PanelEvents = typeof panelEvents[number]
export type PanelEventData = {
  leftPanelHeight: number,
  bottomPanelHeight: number,
  leftPanelHeightPercent: number,
  dividerHeight: number,
}
</script>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { pxToRem } from '../utilities/cssUnits';

const props = defineProps<{
  height?: number,
  width: number
  minSize?: {
    width?: number,
    height?: number
  },
  maxSize?: {
    width?: number,
    height?: number
  },
  leftPanelWidthPercent?: number,
  dividerWidth?: number,
  margin?: number,
}>()

const emit = defineEmits(panelEvents)

const state = ref(
  {
    height: typeof props.height !== 'undefined' ? props.width : -1,
    margin: typeof props.margin !== 'undefined' ? props.margin : 0,
    width: props.width - (typeof props.margin !== 'undefined' ? props.margin : 0),
  }
)

const widthString = computed(() => {
  return props.width + 'px'
})

const heightString = computed(() => {
  if (props.height) {
    return props.height + 'px'
  } else {
    return 'auto'
  }
})

const defaultDividerWidth = 10
const initialDividerWidth = props.dividerWidth ? props.dividerWidth : defaultDividerWidth
const initialLeftPanelWidthPercent = props.leftPanelWidthPercent ? props.leftPanelWidthPercent : 50
const initlalLeftPanelWidth = Math.round(
  (initialLeftPanelWidthPercent / 100)
  * (state.value.height - initialDividerWidth - (state.value.margin * 2))
)

const dividerWidth = ref(initialDividerWidth)
const leftPanelWidth = ref(initlalLeftPanelWidth)
const leftPanelWidthPercent = ref(initialLeftPanelWidthPercent)
const rightPanelWidth = computed(() => {
  const rpw = state.value.width
    - leftPanelWidth.value
    - dividerWidth.value
    - (state.value.margin * 2)
  return rpw
})
const leftPanelWidthRem = computed(() => {
  return pxToRem(leftPanelWidth.value)
})
const rightPaneWidthRem = computed(() => {
  return pxToRem(rightPanelWidth.value)
})

const SplitPanelHorizParent = ref(null) as any


onMounted(() => {
  if (typeof props.height === 'undefined') {
    state.value.height = SplitPanelHorizParent.value.offsetHeight
  }
  // console.log(props)
  // console.log(state.value)
  // console.log(leftPanelWidth.value)
  // console.log(dividerWidth.value)
  // console.log(rightPanelWidth.value)
  // console.log(state.value.margin)
  // console.log(leftPanelWidth.value + dividerWidth.value + rightPanelWidth.value)
  // console.log(SplitPanelVertParent.value.offsetHeight)
})

watch(
  () => props.width,
  (width) => {
    state.value.width = width
    leftPanelWidth.value = Math.round(
      (leftPanelWidthPercent.value / 100)
      * (width - dividerWidth.value - state.value.margin)
    )
    console.log(width)
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
  resizeLastPos.value = ev.clientX
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
  const delta = ev.clientX - resizeLastPos.value
  resizeLastPos.value = ev.clientX
  console.log(`${ev.clientX} | ${pxToRem(ev.clientX)} | ${delta} | ${pxToRem(delta)}`)
  if (leftPanelWidth.value + delta >= 0
    && rightPanelWidth.value - delta >= 0
  ) {
    leftPanelWidth.value += delta
    leftPanelWidthPercent.value = (leftPanelWidth.value / (state.value.height - dividerWidth.value)) * 100
  }
  emitPanelEvent('resizing')
}

window.addEventListener('mouseup', endResize)

window.addEventListener('resize', (ev) => {
  // leftPanelWidth.value = (state.value.width - dividerWidth.value - state.value.margin) * (leftPanelWidthPercent.value / 100)  

  console.log(`resizeListener: ${leftPanelWidth.value} | ${pxToRem(leftPanelWidth.value)} | ${state.value.width} | ${pxToRem(state.value.width)}`)

  emitPanelEvent('resizing')
})

function emitPanelEvent(ev: PanelEvents) {
  emit(ev, {
    leftPanelWidthPercent: leftPanelWidthPercent.value,
    leftPanelWidth: leftPanelWidth.value,
    rightPanelWidth: rightPanelWidth.value,
    dividerWidth: dividerWidth.value,
  })
}

</script>

<template>
  <div
   :class="['flex', 'flex-row']"
   :style="{
     height: heightString,
     width: widthString,
   }"
   ref="SplitPanelHorizParent"
  >
    <div
     :style="{
       width: leftPanelWidth + 'px',
       height: heightString,
       marginLeft: state.margin + 'px',
       marginTop: state.margin + 'px',
       marginBottom: state.margin + 'px',
     }"
     :class="['box-border',]"
    >
      <slot
       name="left"
       :panelHeight="leftPanelWidth"
      ></slot>
    </div>
    <div
     :class="['splitpanel-horz-divider', 'm-auto', 'flex', 'flex-col', 'justify-center', 'items-center']"
     :style="{
       height: heightString,
       width: dividerWidth + 'px',
       padding: '3px'
     }"
     @mousedown="startResize"
     @mouseup="endResize"
    >
      <div :class="['bg-text', 'rounded-full', 'h-14', 'w-full', 'm-0']" />
    </div>
    <div
     :style="{
       width: rightPanelWidth + 'px',
       height: heightString,
       marginRight: state.margin + 'px',
       marginTop: state.margin + 'px',
       marginBottom: state.margin + 'px',
     }"
     :class="['box-border']"
    >
      <slot
       name="right"
       :panelWidth="rightPanelWidth"
      ></slot>
    </div>
  </div>
</template>

<style lang="scss">
.splitpanel-horz-divider {
  cursor: ew-resize;
}
</style>