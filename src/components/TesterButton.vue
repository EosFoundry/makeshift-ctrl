<script setup lang="ts">
import { rndrCtrlAPI } from '../renderer';
import { ref, inject } from 'vue';

const makeshiftApi = inject('makeshift') as rndrCtrlAPI
const path = ref('')

async function handleGetThemeFromPath(path: string) {
  makeshiftApi.delete.workspace('asdf.cue.js')
}
</script>

<template>
    <button
      @click="handleGetThemeFromPath(path)"
      class="absolute top-0 left-0 z-50"
    >
    test
    </button>
</template>

<style></style>