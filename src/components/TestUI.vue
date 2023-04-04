
<script lang="ts">
export default {
  name: 'TestInterface '
}
</script>

<script setup lang="ts">
import { ref } from 'vue';


const buttonClass = ref(`w-12 h-12 
  mx-2 mt-2 mb-2 hover:mt-3 hover:mb-1
  rounded-lg 
  shadow-md hover:shadow-test
  border-solid border-4 
  device-layout-button
  `)

const dialClass = ref(`w-12 h-12
  mx-2 mt-2 mb-2 hover:mt-3 hover:mb-1
  rounded-full
  shadow-md hover:shadow-test
  border-solid border-4 
  device-layout-button
  `)

const rowClass = ref(`flex flex-row`)
</script>

<template>
  <div class="
        md:container 
        md:mx-auto ">

    <div :class=rowClass>
      <div v-for="num in [0, 1, 2, 3]" :class=dialClass :key="num" />
    </div>
    <div v-for="num in [0, 1, 2]" :class=rowClass :key="num">
      <div v-for="num in [0, 1, 2, 3]" :class=buttonClass :key="num" />
    </div>

  </div>
</template>

<style>
.device-layout-button {
  background-color: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary2));
  color: rgb(var(--color-text));
}
</style>