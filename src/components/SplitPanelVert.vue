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
  minHeightPercent?: number,
  maxHeightPercent?: number,
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

const minHeightPercent = props.minHeightPercent ? props.minHeightPercent : 0
const maxHeightPercent = props.maxHeightPercent ? props.maxHeightPercent : 100

const defaultDividerHeight = 10
const initialDividerHeight = props.dividerHeight ? props.dividerHeight : defaultDividerHeight
const initialTopPanelHeightPercent = props.topPanelHeightPercent ? props.topPanelHeightPercent : 50
const initlalTopPanelHeight = (
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
  // console.log(`bph: ${bph} | tph: ${topPanelHeight.value} | dh: ${dividerHeight.value} | m: ${state.value.margin} | h: ${state.value.height}`)
  return bph
})
const topPanelHeightRem = computed(() => {
  return pxToRem(topPanelHeight.value)
})
const bottomPaneHeightRem = computed(() => {
  return pxToRem(bottomPaneHeight.value)
})

const isLocked = computed(() => {
  return topPanelHeightPercent.value <= minHeightPercent
    || topPanelHeightPercent.value >= maxHeightPercent
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
    topPanelHeight.value = (
      (topPanelHeightPercent.value / 100)
      * (height - dividerHeight.value - state.value.margin * 2)
    )
    // console.log(`height changed to ${height}`)
  },
  { immediate: true }
)

watch(
  () => props.topPanelHeightPercent,
  (propsHeightPercent) => {
    if (typeof propsHeightPercent !== 'undefined') {
      topPanelHeightPercent.value = propsHeightPercent
      topPanelHeight.value = (
        (topPanelHeightPercent.value / 100)
        * (state.value.height - dividerHeight.value - state.value.margin * 2)
      )
      // console.log(`tPHPercent ${propsHeightPercent} | topHeight: ${topPanelHeight.value} | botHeight: ${bottomPaneHeight.value}`)
      emitPanelEvent('resizing')
    }
  },
  { immediate: true }
)

const resizeLastPos = ref(0)
const resizing = ref(false)
function startResize(ev: MouseEvent) {
  if (isLocked.value) { return }
  if (resizing.value) { return }
  // console.log(ev)
  resizeLastPos.value = ev.clientY
  // console.log(resizeLastPos.value)
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
  let delta = ev.clientY - resizeLastPos.value
  const newTopPanelHeight = topPanelHeight.value + delta
  resizeLastPos.value = ev.clientY
  // console.log(`${ev.clientY} | ${pxToRem(ev.clientY)} | ${delta} | ${pxToRem(delta)}`)
  if (topPanelHeight.value + delta >= 0
    && bottomPaneHeight.value - delta >= 0
  ) {
    const newTopPanelHeightPercent = (newTopPanelHeight / (state.value.height - dividerHeight.value)) * 100
    if (newTopPanelHeightPercent >= minHeightPercent
      && newTopPanelHeightPercent <= maxHeightPercent
    ) {
      topPanelHeight.value = newTopPanelHeight
      topPanelHeightPercent.value = newTopPanelHeightPercent
    }
  }
  emitPanelEvent('resizing')
}

window.addEventListener('mouseup', endResize)

window.addEventListener('resize', (ev) => {
  topPanelHeight.value = (state.value.height - dividerHeight.value - state.value.margin) * (topPanelHeightPercent.value / 100)

  // console.log(`${topPanelHeight.value} | ${pxToRem(topPanelHeight.value)} | ${state.value.height} | ${pxToRem(state.value.height)}`)

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
    :class="[
      'splitpanel-vert',
    ]"
    :style="{
      height: heightString,
      width: widthString,
      padding: state.margin + 'px',
    }"
    ref="SplitPanelVertDiv"
  >
    <div
      :style="{
        height: topPanelHeight + 'px',
        width: widthString,
        // marginTop: state.margin + 'px',
        // marginLeft: state.margin + 'px',
        // marginRight: state.margin + 'px',
      }"
      :class="[
        'box-border']"
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
        padding: '3px',
        cursor: ((topPanelHeightPercent > minHeightPercent && topPanelHeightPercent < maxHeightPercent) ? 'ns-resize' : 'default'),
      }"
      @mousedown="startResize"
    >
      <div :class="[`${isLocked ? '' : 'bg-hl'}`, 'rounded-full', 'h-full', 'w-14', 'm-auto']" />
    </div>

    <div
      :style="{
        height: bottomPaneHeight + 'px',
        width: widthString,
        // marginBottom: state.margin + 'px',
        // marginLeft: state.margin + 'px',
        // marginRight: state.margin + 'px',
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

<style lang="scss"></style>