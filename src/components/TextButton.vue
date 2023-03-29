<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import icon from './Icon.vue'

const props = defineProps<{
  iconUrl?: string,
  color?: string,
  hoverColor?: string,
}>()
const _defaultColor = ref('var(--color-bg)')
const _hoverColor = ref('var(--color-text)')
const hover = ref(false)
const buttonColor = computed(() => {
  if (hover.value) {
    return _hoverColor
  } else {
    return _defaultColor
  }
})

if (props.color) {
  _defaultColor.value = props.color
  _hoverColor.value = props.color
}
if (props.hoverColor) {
  _hoverColor.value = props.hoverColor
}

</script>
<template>
  <button @mouseenter="hover = true" @mouseleave="hover = false">
    <icon v-if="iconUrl" :icon-url="props.iconUrl ? props.iconUrl : ''" :color="buttonColor.value" size="18px" :style="{
      marginRight: '6px',
      transitionDuration: '0.2s',
    }" />
    <div class="button-text">
      <slot></slot>
    </div>
  </button>
</template>

<style>
button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.button-text {
  vertical-align: middle;
  padding: 2px 0px;
  padding-bottom: 4px;
}
</style>