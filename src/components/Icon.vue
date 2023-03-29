<script setup lang="ts">
const props = defineProps<{
  iconUrl: string,
  size?: string,
  // height?: string,
  color?: string,
  hoverColor?: string,
  clickable?: boolean,
  title?: string,
}>()
</script>
<template>
  <div class="icon" :style="{
    height: props.size ? props.size : '20px',
    width: props.size ? props.size : '20px',
    maskImage: `url(${props.iconUrl})`,
    backgroundColor: props.color ? `rgb(${props.color}` : 'rgb(var(--color-secondary2))',
    cursor: props.clickable ? 'pointer' : 'default',
  }" :title="props.title" />
</template>
<style>
.icon {
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  display: inline flex;
  transition-duration: 0.2s;
}
</style>