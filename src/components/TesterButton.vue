<script setup lang="ts">
import { rndrCtrlAPI } from 'src/renderer';
import { ref, inject } from 'vue';

const makeshiftApi = inject('makeshift') as rndrCtrlAPI
// makeshiftApi.test()
const path = ref('')

async function handleGetThemeFromPath(path: string) {
  makeshiftApi.get.themeFromPath(path)
}
</script>

<template>
  <span>
    <input
      v-model="path"
      class="inline mx-3"
    />
    <button
      @click="handleGetThemeFromPath(path)"
      class="inline mx-3"
    >
      get theme from path
    </button>
    <button
      @click="makeshiftApi.test('asdf')"
      class="inline mx-3"
    >
      call test()
    </button>
  </span>
</template>

<style></style>