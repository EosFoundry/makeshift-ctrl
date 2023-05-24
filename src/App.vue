<script setup lang="ts">
import './styles/colors.css'
import './styles/fonts.css'
import 'splitpanes/dist/splitpanes.css'

import { ref, computed, onMounted, nextTick, provide, Ref, inject, watch } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import CodeBox from './components/CodeBox.vue'
import Terminal from './components/Terminal.vue'
import BottomBar from './components/BottomBar.vue'
import CuePanel from './components/CuePanel.vue'
import DevicePanel from './components/DevicePanel.vue'
import TestInterface from './components/TestUI.vue'
import SplitPanelVert from './components/SplitPanelVert.vue'
import { checkFontSize, remToPx, updateFont } from './utilities/cssUnits'
type Size = {
	width: number
	height: number
}
const FontSizeMonitorDiv = ref<HTMLElement>()
const editorContents = ref(`// Welcome to makesh*t-ctrl alpha!`)
const clientSize = inject('client-size') as Ref<Size>
provide<Ref<string>>('current-session', editorContents)
const topPanelHeightPercent = ref(69)
const bottomPanelHeight = ref(-1)
function panelResizeHandler(event: any) {
	// console.log(event)
	bottomPanelHeight.value = event.bottomPanelHeight
	// console.log(bottomPanelHeight.value)
}

const bodyHeight = computed(() => {
	return clientSize.value.height + 'px'
}) as Ref<string>

const fontChecker = new ResizeObserver((entries) => {
	if (entries.length > 0) {
		const fontDiv = entries[0].target as HTMLElement
		const fontSize = window.getComputedStyle(fontDiv).fontSize
		updateFont(fontSize)
		console.log(fontSize)
	}
})

onMounted(() => {
	window.addEventListener('resize', () => {
		clientSize.value = {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		}
	})
	if (typeof FontSizeMonitorDiv.value !== 'undefined') {
		fontChecker.observe(FontSizeMonitorDiv.value)
		checkFontSize(FontSizeMonitorDiv.value)
	}
})

// this is a very cursed hack to get xterm to resize correctly
nextTick(() => {
	window.resizeBy(-1, -1)
	window.resizeBy(1, 1)
	// topPaneHeight.value = 70
})

</script>

<template >
	<div id='font-size-monitor-div' ref="FontSizeMonitorDiv" :class="['absolute', 'invisible']">
		font-size-monitor-text
	</div>
	<!-- <test-interface /> -->
	<SplitPanelVert 
	:height="clientSize.height - remToPx(2.5)" 
	:topPanelHeightPercent="70"
	:margin="8"
	@resizing="panelResizeHandler">
		<template #top>
			<CodeBox />
		</template>
		<template #bottom>
			<Terminal :panelHeight="bottomPanelHeight" />
		</template>
	</SplitPanelVert>
	<BottomBar />
</template>

<style lang="scss">
#app {
	font-family: Encode Sans, Helvetica, Arial, sans-serif;

	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

	// font-size: 12pt;
	text-align: center;
	background-color: rgb(var(--color-bg));
	color: rgb(var(--color-text));
	display: flex;
	flex-direction: column;
	user-select: none;
	overflow: hidden;

	// transition-duration: 0.2s;
	height: 100%;
}

html {
	height: 100%;
	background-color: rgb(var(--color-bg));
}

body {
	margin: 0;
	padding: 0;
	height: 100%;
	background-color: rgb(var(--color-bg));
}

code {
	font-family: 'Iosevka Makeshift', monospace, monospace;
}

input {
	// font-size: 14px;
	color: rgb(var(--color-text));
	background-color: rgb(var(--color-dark));
	border-color: rgb(var(--color-hl));
	caret-color: rgb(var(--color-neutral));
	transition-duration: 0.2s;
	width: fit-content;
}

button {
	cursor: pointer;
	box-sizing: border-box;
	background-color: rgb(var(--color-primary));
	color: rgb(var(--color-bg));
	display: flex;

	font-size: 1rem;
	// margin: auto;
	vertical-align: baseline;

	border: solid;
	border-width: 4px;
	border-radius: 6px;
	border-color: rgb(var(--color-primary));

	padding: 1px 8px;

	height: fit-content;
	font-weight: bold;
	font-family: 'Encode Sans';

	transition-duration: 0.2s;

	&:hover {
		background-color: rgb(var(--color-primary2));
		border-color: rgb(var(--color-primary));
		color: rgb(var(--color-text));
	}
}

select {
	background-color: rgb(var(--color-dark));
	border-radius: .25rem;
	border-width: 1px;
	margin-left: .25rem;
	margin-right: .25rem;
	border-color: rgb(var(--color-neutral));
	padding: .25rem;
}

:focus {
	outline: 1px solid rgb(var(--color-primary));
}


// .flex-col {
// 	display: flex;
// 	flex-direction: col;
// }

#main-container {
	box-sizing: border-box;
	// padding: 4px;
	// width: 100%;
}

.pane-border {
	// background-color: rgb(var(--color-bg));
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	// padding: 3px;
	// padding-top: 5px;
	// padding-bottom: 5px;
	// margin: 4px;
	overflow: hidden;
	// width: 100%;
	// height: 100%;
}

.pane-rounded-inner {
	box-sizing: border-box;
	border: solid;
	border-color: rgb(var(--color-hl));
	border-width: 2px;
	border-radius: 8px;
	// width: 100%;
	// height: 100%;
	// margin: auto;
	overflow: hidden;
	// overflow: scroll;
}


.splitpanes {
	background-color: rgb(var(--color-bg));

	// &__pane {}

	&--vertical>&__splitter {
		background-color: rgb(var(--color-neutral));
		min-width: 4px;
		border-radius: 2px;
		height: 70px;
		margin: auto;
	}

	&--horizontal>&__splitter {
		background-color: rgb(var(--color-neutral));
		min-height: 4px;
		border-radius: 2px;
		margin: auto;
		width: 70px;
	}
}

.hidden {
	position: absolute;
	left: -200px;
	top: -200px;
	// visibility: hidden;
}

.toolbar {
	display: flex;
	flex-direction: row;
	align-items: center;

	justify-content: space-between;

	// margin-bottom: 4px;
	box-sizing: border-box;
	// height: 3.5em;
	padding-top: 8px;
	padding-bottom: 8px;
	width: auto;

	&.thin {
		height: 2.5em;
	}
}

.toolbar-cluster {
	display: flex;
	align-items: center;
	justify-content: center;
	width: auto;
}
</style>
