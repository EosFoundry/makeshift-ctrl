<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref, computed, onMounted, nextTick, provide, Ref } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import CodeBox from './components/CodeBox.vue'
import Terminal from './components/Terminal.vue'
import Toolbar from './components/Toolbar.vue'
import StatusBar from './components/StatusBar.vue'
import { emit } from 'process'
import LayoutPanel from './components/LayoutPanel.vue'
import helloString from './assets/examples/cues/hello.cue.mjs?raw'

const editorContents = ref(`// Welcom to makesh*t-ctrl alpha!`)
provide<Ref<string>>('current-session', editorContents)
const topPanelHeight = ref(65)
const bottomPanelHeight = computed(() => {
	return 100 - topPanelHeight.value
})

function terminalResize(event: any) {
	topPanelHeight.value = event[0].size
}

onMounted(() => {
	nextTick(() => {
		// this is a very cursed hack to get xterm to resize correctly
		window.resizeBy(-1, -1)
		window.resizeBy(1, 1)
	})
})
</script>

<template>
	<!-- <h1></h1> -->
	<Toolbar></Toolbar>
	<splitpanes id="main-container" horizontal @resize="terminalResize">
		<pane :size="topPanelHeight" min-size="45">
			<splitpanes>
				<pane min-size="30">
					<layout-panel />
				</pane>
				<pane size='80' min-size="30">
					<code-box :pane-height-percent="topPanelHeight" />
				</pane>
			</splitpanes>
		</pane>
		<pane min-size="20">
			<terminal :pane-height-percent="bottomPanelHeight" />
		</pane>
	</splitpanes>
	<StatusBar>

	</StatusBar>
</template>

<style lang="scss">

#app {
	font-family: Encode Sans, Helvetica, Arial, sans-serif;

	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

	font-size: 12pt;
	text-align: center;
	background-color: var(--color-bg);
	color: var(--color-text);
	display: flex;
	flex-direction: column;
	user-select: none;

	transition-duration: 0.2s;
	height: 100%;
}

html,
body {
	margin: 0;
	padding: 0;
	height: 100%;
}

// code {
// 	font-family: 'JetBrains Mono', 'iosevka-makeshift Web', monospace, monospace;	
// }

input {
	font-size: 12pt;
	color: var(--color-text);
	background-color: var(--color-bg);
	border-color: var(--color-hl);
	caret-color: var(--color-neutral);
}


button {
	cursor: pointer;
	box-sizing: border-box;
	background-color: var(--color-primary);
	color: var(--color-bg);

	font-size: 11pt;
	// margin: auto;
	vertical-align: baseline;

	border: solid;
	border-width: 4px;
	border-radius: 6px;
	border-color: var(--color-primary);

	padding: 1px 8px;

	height: fit-content;
	font-weight: bold;
	font-family: 'Encode Sans';

	transition-duration: 0.2s;

	&:hover {
		background-color: var(--color-primary2);
		border-color: var(--color-primary);
		color: var(--color-text)
	}
}


:focus {
	outline: 1px solid var(--color-primary);
}

.icon {
	-webkit-mask-size: contain;
	mask-size: contain;
	-webkit-mask-position: center;
	mask-position: center;
	-webkit-mask-repeat: no-repeat;
	mask-repeat: no-repeat;
}


#main-container {
	box-sizing: border-box;
	padding: 0px 4px;
	width: 100%;
}

.pane-border {
	// background-color: var(--color-bg);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	padding: 3px;
	// padding-top: 5px;
	// padding-bottom: 5px;
	// margin: 4px;

	width: 100%;
	height: 100%;
}

.pane-rounded-inner {
	box-sizing: border-box;
	border: solid;
	border-color: var(--color-hl);
	border-width: 2px;
	border-radius: 8px;
	width: 100%;
	height: 100%;
	margin: auto;
	overflow: hidden;
	// overflow: scroll;
}


.splitpanes {
	background-color: var(--color-bg);

	// &__pane {}

	&--vertical>&__splitter {
		background-color: var(--color-neutral);
		min-width: 4px;
		border-radius: 2px;
		height: 70px;
		margin: auto;
	}

	&--horizontal>&__splitter {
		background-color: var(--color-neutral);
		min-height: 4px;
		border-radius: 2px;
		margin: auto;
		width: 70px;
	}
}

// crapton of font loading
</style>
