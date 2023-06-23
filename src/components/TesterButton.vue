<script setup lang="ts">
import { rndrCtrlAPI } from 'src/renderer';
import { inject } from 'vue';

const makeshiftApi =  inject('makeshift') as rndrCtrlAPI
// makeshiftApi.test()
</script>

<template>
<button
  @click="makeshiftApi.test()"
>Testerino</button>
</template>

<style>
</style>