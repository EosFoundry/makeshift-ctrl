<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import icon from './Icon.vue'

const props = defineProps<{
  iconUrl: string,
  size?: string,
  color?: string,
  hoverColor?: string,
  clickable?: boolean,
  title?: string,
}>()

const _defaultColor = ref('var(--color-bg)')
const _hoverColor = ref('var(--color-text)')
const hover = ref(false)
const iconColor = computed(() => {
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
  <icon 
    @mouseenter="hover = true" 
    @mouseleave="hover = false"
    :icon-url="props.iconUrl" 
    :size="props.size"
    :color="iconColor.value"
    :clickable="props.clickable"
    :tite="props.title"
  />
</template>

<style>
.icon {
  cursor: pointer;
}
</style>