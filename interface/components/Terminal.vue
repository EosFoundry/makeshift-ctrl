<script lang="ts">
export default {
  name: 'Terminal'
}
</script>

<script setup lang="ts">
import { propsToAttrMap } from '@vue/shared';
import { ref, onMounted, nextTick, watch } from 'vue';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

const props = defineProps<{
  paneHeightPercent?: number
}>()

const xtermConfig = {
  fontFamily: 'iosevka-makeshift Web, courier-new, courier, monospace',
  fontStyle: 'normal',
  fontSize: 14,
  letterSpacing: 0,
  cursorBlink: true,
  scrollback: 0,
}
const terminal = new Terminal(xtermConfig);
const fitAddon = new FitAddon()
const xtermContainer = ref<HTMLElement>()
const terminalCommand = ref("")
terminal.loadAddon(fitAddon);
onMounted(() => {
  nextTick(() => {
    terminal.open((xtermContainer.value as HTMLElement));
    terminal.write('Qello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    fitAddon.fit();
  })
})

watch(
  () => props.paneHeightPercent,
  (newHeight, oldHeight) => {
    fitAddon.fit()
  })

function sendCommand(event: Event) {
  console.log(terminalCommand.value);
}
</script>

<template>
  <div class="xterm-border">
    <div class="xterm-commandline">
      <input v-model="terminalCommand" @keyup.enter="sendCommand" />
      <button @click="sendCommand">send</button>
    </div>
    <div ref="xtermContainer" class="xterm-container" />
  </div>
</template>

<style>
.xterm-border {
  box-sizing: border-box;
  background-color: var(--color-green);
  border-color: green;
  border-radius: 10px;
  /* border-width: 14px; */
  padding: 11px 10px;

  width: 100%;
  height: 100%;
}

.xterm-commandline {
  box-sizing: border-box;
  width: 100%;
}


.xterm-container {
  box-sizing: border-box;
  position: relative;
  background-color: var(--color-bg);
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}

/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * https://github.com/chjj/term.js
 * @license MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 *   The original design remains. The terminal itself
 *   has been extended to include xterm CSI codes, among
 *   other features.
 */

/**
 *  Default styles for xterm.js
 */

.xterm {
  cursor: text;
  position: relative;
  user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
}

.xterm.focus,
.xterm:focus {
  outline: none;
}

.xterm .xterm-helpers {
  position: absolute;
  top: 0;
  /**
     * The z-index of the helpers must be higher than the canvases in order for
     * IMEs to appear on top.
     */
  z-index: 5;
}

.xterm .xterm-helper-textarea {
  padding: 0;
  border: 0;
  margin: 0;
  /* Move textarea out of the screen to the far left, so that the cursor is not visible */
  position: absolute;
  opacity: 0;
  left: -9999em;
  top: 0;
  width: 0;
  height: 0;
  z-index: -5;
  /** Prevent wrapping so the IME appears against the textarea at the correct position */
  white-space: nowrap;
  overflow: hidden;
  resize: none;
}

.xterm .composition-view {
  /* TODO: Composition position got messed up somewhere */
  background: var(--color-bg);
  color: #FFF;
  display: none;
  position: absolute;
  white-space: nowrap;
  z-index: 1;
}

.xterm .composition-view.active {
  display: block;
}

/* Works on Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 1px;
}

.xterm .xterm-viewport {
  /* On OS X this is required in order for the scroll bar to appear fully opaque */
  background-color: #000;
  overflow-y: scroll;
  scrollbar-width: thin;
  cursor: default;
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
}

.xterm .xterm-screen {
  position: relative;
}

.xterm .xterm-screen canvas {
  position: absolute;
  left: 0;
  top: 0;
}

.xterm .xterm-scroll-area {
  visibility: hidden;
}

.xterm-char-measure-element {
  display: inline-block;
  visibility: hidden;
  position: absolute;
  top: 0;
  left: -9999em;
  line-height: normal;
}

.xterm.enable-mouse-events {
  /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
  cursor: default;
}

.xterm.xterm-cursor-pointer,
.xterm .xterm-cursor-pointer {
  cursor: pointer;
}

.xterm.column-select.focus {
  /* Column selection mode */
  cursor: crosshair;
}

.xterm .xterm-accessibility,
.xterm .xterm-message {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
  color: transparent;
}

.xterm .live-region {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.xterm-dim {
  opacity: 0.5;
}

.xterm-underline-1 {
  text-decoration: underline;
}

.xterm-underline-2 {
  text-decoration: double underline;
}

.xterm-underline-3 {
  text-decoration: wavy underline;
}

.xterm-underline-4 {
  text-decoration: dotted underline;
}

.xterm-underline-5 {
  text-decoration: dashed underline;
}

.xterm-strikethrough {
  text-decoration: line-through;
}

.xterm-screen .xterm-decoration-container .xterm-decoration {
  z-index: 6;
  position: absolute;
}

.xterm-decoration-overview-ruler {
  z-index: 7;
  position: absolute;
  top: 0;
  right: 0;
  pointer-events: none;
}

.xterm-decoration-top {
  z-index: 2;
  position: relative;
}
</style>