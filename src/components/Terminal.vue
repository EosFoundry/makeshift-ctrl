<script lang="ts">
export default {
  name: 'Terminal'
}
</script>

<script setup lang="ts">
// node module imports
import { ref, onMounted, nextTick, watch, onUpdated, inject, Ref, onUnmounted, StyleValue } from 'vue'
import { ITerminalOptions, Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { LigaturesAddon } from 'xterm-addon-ligatures'
import { WebglAddon } from 'xterm-addon-webgl'

import { MakeShiftDeviceEvents, LogMessage } from '@eos-makeshift/serial'
import { LogLevel } from '@eos-makeshift/msg'

// local file imports
import { colors as makeShiftTheme } from '../styles/makeshift.theme.json'
import chevronUpUrl from '../assets/icon/bootstrap/chevron-up.svg?url'
import chevronDownUrl from '../assets/icon/bootstrap/chevron-down.svg?url'
import TextButton from './TextButton.vue'
import { rndrCtrlAPI } from 'src/renderer'
import { watchResize } from '../composables/resizer'

// reactive elements
const makeshift = inject('makeshift') as rndrCtrlAPI
const logLevel = inject('logLevel') as Ref<LogLevel>
const logRank = inject('makeshift-logRank') as any

const chevronUrl = ref(chevronUpUrl)
const cliInputDisplay = ref('none')
const xtermContainerElement = ref<HTMLElement>()
const xtermWrapperElement = ref<HTMLElement>()
const terminalCommand = ref('')
const paneHeight = ref()

const props = defineProps<{
  paneHeightPercent?: number
}>()

const xtermConfig: ITerminalOptions = {
  convertEol: true,
  cursorBlink: true,
  cursorStyle: 'underline',
  fontFamily: 'Iosevka Makeshift, Fira Code, JetBrains Mono, Consolas, monospace',
  // fontWeight: 400,
  // fontWeightBold: 800,
  lineHeight: 1.15,
  letterSpacing: 1,
  // logLevel: 'debug',
  theme: makeShiftTheme,
  scrollback: 4000,
  allowProposedApi: true,
}

let terminal: Terminal
const fitAddon = new FitAddon()
const ligaturesAddon = new LigaturesAddon()
const webGlAddon = new WebglAddon()

let lastFit = Date.now()
const fitDebounceTime = 90


function fitTerm() {
  fitAddon.fit()
}

function hideCli(event: Event) {
  let display = 'none'
  if (cliInputDisplay.value === 'none') {
    chevronUrl.value = chevronDownUrl
    display = 'flex';
  } else {
    display = 'none'
    chevronUrl.value = chevronUpUrl
  }
  cliInputDisplay.value = display
}

function sendCommand(event: Event) {
  console.log(terminalCommand.value);
  writePrompt();
  terminal.writeln(terminalCommand.value)
}

function writePrompt() {
  terminal.write(`makeshift <== `)
}

function LogEventHandler(event: any, logMessage: LogMessage) {
  if (logRank[logMessage.level] >= logRank[logLevel.value]) {
    terminal.writeln(logMessage.message)
  }
}


onUnmounted(() => {
  removeEventListener('resize', fitTerm)
})

onMounted(() => {
  terminal = new Terminal(xtermConfig)
  terminal.open(xtermContainerElement.value as HTMLElement);
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(ligaturesAddon);
  // terminal.loadAddon(webGlAddon);

  terminal.clear();
  terminal.writeln('\rmakeshift-ctrl ==> Welcome ')

  watchResize(xtermContainerElement.value as HTMLElement, fitTerm)
  makeshift.onEv.terminal.data(LogEventHandler)
})

// fit every last one of them
watch(
  () => paneHeight.value,
  (newHeight, oldHeight) => {
    console.log(newHeight)
    fitTerm()
  })

</script>

<template>
  <div class="xterm-border pane-border" ref="xtermWrapperElement">
    <div class="pane-rounded-inner xterm-inner" :style="{ backgroundColor: makeShiftTheme.background }">
      <div ref="xtermContainerElement" class="xterm-container" />
    </div>
    <div class="xterm-commandline" :style="{
      display: cliInputDisplay,
    }">
      <input class="xterm-cli-input" :style="{
        color: makeShiftTheme.foreground,
        backgroundColor: makeShiftTheme.cursorBackground,
        borderColor: 'var(--color-hl)',
        caretColor: makeShiftTheme.cursor
      }" v-model="terminalCommand" @keyup.enter="sendCommand" />
      <text-button @click="sendCommand">send</text-button>
    </div>
    <div class="hideCli" @click="hideCli" :style="{
      width: '100%',
      cursor: 'pointer',
    }">
      <div class="icon" :style="{
        height: '15px',
        width: '15px',
        margin: 'auto',
        marginBottom: '-4px',
        backgroundColor: 'aliceblue',
        maskImage: `url(${chevronUrl})`,
      }" />
    </div>
  </div>
</template>

<style>
.xterm-border {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}


.xterm-commandline {
  float: right;

  flex-direction: row;
  align-items: center;
  justify-content: center;

  margin-bottom: 4px;
  box-sizing: border-box;
  height: fit-content;
  padding-top: 4px;
  padding-bottom: 2px;
  width: 100%;
}

.xterm-cli-input {
  box-sizing: border-box;
  padding: 4px 10px;
  margin: auto;
  margin-right: 10px;
  font-size: 12pt;
  font-family: 'Iosevka Makeshift';
  border: solid;
  border-width: 2px;
  border-radius: 8px;
  width: 100%;
  height: fit-content;
}

.xterm-inner {
  /* border-color:green; */
  padding-left: 12px;
  margin-bottom: 4px;
}



.xterm-container {
  box-sizing: border-box;
  font-family: 'Iosevka Makeshift';
  position: sticky;
  text-align: left;
  bottom: -10px;
  left: 0px;
  /* width: 100%; */
  height: 100%;
  /* padding: 4px; */
  overflow: hidden;
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
  width: 0px;
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