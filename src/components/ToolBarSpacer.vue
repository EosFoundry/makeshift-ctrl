<script setup lang="ts">
const props = defineProps<{
  width: string,
}>()
</script>

<template>
  <div :style="{
    width: props.width
  }" />
</template>