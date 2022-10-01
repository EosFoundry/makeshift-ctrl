<template>
<div id="xterm-border">
    <div ref="xterm-element"></div>
</div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from "vue";
import type { Ref } from 'vue'
import { IEvent, Terminal } from "xterm";
import { WebglAddon } from "xterm-addon-webgl";
import { FitAddon } from "xterm-addon-fit";
import { LigaturesAddon } from "xterm-addon-ligatures";
let term: any;
let rows = 40;
let cols = 100;

const xtermElement: any = ref<HTMLDivElement>();
const webglAddon = new WebglAddon();
const fitAddon = new FitAddon();
const ligaturesAddon = new LigaturesAddon();
const xtermjsTheme = {
  foreground: "#F8F8F8",
  background: "#2D2E2C",
  selectionBackground: "#5DA5D533",
  black: "#1E1E1D",
  brightBlack: "#262625",
  red: "#CE5C5C",
  brightRed: "#FF7272",
  green: "#5BCC5B",
  brightGreen: "#72FF72",
  yellow: "#CCCC5B",
  brightYellow: "#FFFF72",
  blue: "#5D5DD3",
  brightBlue: "#7279FF",
  magenta: "#BC5ED1",
  brightMagenta: "#E572FF",
  cyan: "#5DA5D5",
  brightCyan: "#72F0FF",
  white: "#F8F8F8",
  brightWhite: "#FFFFFF",
};

onMounted(() => {
   // set rows
  rows = Math.floor(xtermElement.value.clientHeight / 16);
  cols = Math.floor(xtermElement.value.clientWidth / 16);

  console.log(rows);
  term = new Terminal({
    rows: rows, // 行数
    cols: cols, // 不指定行数，自动回车后光标从下一行开始
    convertEol: true, // 启用时，光标将设置为下一行的开头
    scrollback: 5000, // 终端中的回滚量
    cursorStyle: "block", // 光标样式
    cursorBlink: true, // 光标闪烁
    allowProposedApi: true,
    fontFamily:
        '"Iosevka","Fira Code", courier-new, courier, monospace, "Powerline Extra Symbols"',
    theme: xtermjsTheme,
  });
  // An addon for xterm.js that enables attaching to a web socket. This addon requires xterm.js v4+.
  // const attachAddon = new AttachAddon(ws)
  // const searchAddon = new SearchAddon()
  // term.loadAddon(attachAddon)
  // Load WebLinksAddon on terminal, this is all that's needed to get web links
  // working in the terminal.
  // term.loadAddon(new WebLinksAddon())
  // term.loadAddon(searchAddon)
  // 挂载到dom
  term.open(document.getElementById("xterm-element"));
  term.loadAddon(webglAddon);
  term.loadAddon(fitAddon);
  term.loadAddon(ligaturesAddon);
  term.writeln("oops, all lines!?");
  function sendPrompt() {
      term.write("SEND ==> ");
  }
  sendPrompt();
  // term.onData(function(e) {
  //   console.log('onData', e)
  //   // const order = {
  //   //   Data: e,
  //   //   Op: 'stdin'
  //   // }
  //   // _this.onSend(order)
  // })
  term.onKey((e: any) => {
    console.dir(e);

    const printable =
      !e.domEvent.altKey &&
      !e.domEvent.altGraphKey &&
      !e.domEvent.ctrlKey &&
      !e.domEvent.metaKey;
    if (e.domEvent.key === "Backspace") {
      term.write("\b \b");
    } else if (e.key === "\r") {
      term.write("\n");
      sendPrompt();
    } else if (printable) {
      term.write(e.key);
    } else {
    }
  });
});
</script>

<style>
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
    background: #122340;
    color: #d6c6a6;
    display: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;
}

.xterm .composition-view.active {
    display: block;
}

.xterm .xterm-viewport {
    /* On OS X this is required in order for the scroll bar to appear fully opaque */
    background-color: #123345;
    overflow-y: scroll;
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
