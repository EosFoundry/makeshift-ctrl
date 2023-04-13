<script setup lang="ts">import { ref } from 'vue';

const selectorCss = ref(` w-12 h-12
  mx-2 mt-2 mb-2 hover:mt-3 hover:mb-1
  rounded-full
  shadow-md hover:shadow-test
  border-solid border-4 
  device-layout-button
  DIAL
  BUTTON 
  `)
</script>
<template>
  <div :class=selectorCss
  >

  </div>
</template>