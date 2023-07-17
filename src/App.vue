<script setup lang="ts">
import './styles/colors.css'
import './styles/fonts.css'

import { ref, computed, onMounted, nextTick, provide, Ref, inject, watch } from 'vue'
import CodeBox from './components/CodeBox.vue'
import Terminal from './components/Terminal.vue'
import BottomBar from './components/BottomBar.vue'
import CuePanel from './components/CuePanel.vue'
import DevicePanel from './components/DevicePanel.vue'
import TestInterface from './components/TestUI.vue'
import SplitPanelVert from './components/SplitPanelVert.vue'
import SplitPanelHorz from './components/SplitPanelHorz.vue'
import { checkFontSize, remToPx, updateFont } from './utilities/cssUnits'
import BlocklyBox from './components/BlocklyBox.vue'
import TesterButton from './components/TesterButton.vue'
import Popup from './components/Popup.vue'
import { useBooleanState } from './composables/booleanState'
import { show } from 'blockly/core/contextmenu'
import { usePopup } from './composables/popup'
import { showPositionedByBlock } from 'blockly/core/dropdowndiv'
import { rndrCtrlAPI } from './renderer'

type Size = {
	width: number
	height: number
}

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'src/styles/test.css'
// document.head.appendChild(link)

const api = inject('makeshift') as rndrCtrlAPI
const FontSizeMonitorDiv = ref<HTMLElement>()
const editorContents = ref(`// Welcome to makesh*t-ctrl alpha!`)
const clientSize = inject('client-size') as Ref<Size>
const colorTheme = inject('color-theme') as Ref<string>

colorTheme.value = 'colorblind-light-theme'

provide<Ref<string>>('current-session', editorContents)

const blocklyBoxSize = computed(() => {
	return {
		width: clientSize.value.width - 16,
		height: clientSize.value.height - remToPx(2.5) - 288 - 16 - 24
	}
})

const topPanelHeightPercent = ref(69)
const topPanelHeight = ref(-1)
const bottomPanelHeight = ref(-1)

function panelVertResizeHandler(event: any) {
	console.log(event)
	topPanelHeight.value = event.topPanelHeight
	bottomPanelHeight.value = event.bottomPanelHeight
	// console.log(bottomPanelHeight.value)
}


const leftPanelWidth = ref(-1)
const leftPanelWidthPercent = ref(80)
const rightPanelWidth = ref(-1)

function panelHorzResizeHandler(event: any) {
	console.log(event)
	leftPanelWidth.value = event.leftPanelWidth
	rightPanelWidth.value = event.rightPanelWidth
}

const bodyHeight = computed(() => {
	return clientSize.value.height + 'px'
}) as Ref<string>

const fontChecker = new ResizeObserver((entries) => {
	if (entries.length > 0) {
		const fontDiv = entries[0].target as HTMLElement
		const fontSize = window.getComputedStyle(fontDiv).fontSize
		updateFont(fontSize)
		// console.log(fontSize)
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

const { state: popupShown, toggle: togglePopup } = useBooleanState()
const { showPrompt, } = usePopup()


function toast() {
	console.log(api)
	api.get.blocklyToolbox().then((toolbox) => {
		console.log(toolbox)
		console.log(typeof toolbox)
	})
}
</script>

<template>
	<div :class="[colorTheme, 'bg-bg', 'color-text', 'h-full']">
		<div
			id='font-size-monitor-div'
			ref="FontSizeMonitorDiv"
			:class="['absolute', 'invisible']"
		>
			font-size-monitor-text
		</div>
		<Popup/>
		<!-- <select
			name="color-theme-selector"
			v-model="colorTheme"
		>
			<option value="light-theme">Light</option>
			<option value="dark-theme">Dark</option>
		</select>
		<button @click="toast">toast</button>
		<div :class="['width-full']">
			<TesterButton />
		</div> -->
		<TestInterface />
		<BlocklyBox :panel-height="blocklyBoxSize.height" />
		<!-- <SplitPanelVert
		 :height="clientSize.height - remToPx(2.5)"
		 :topPanelHeightPercent="70"
		 :margin="8"
		 @resizing="panelVertResizeHandler"
		>
			<template #top>
				<SplitPanelHorz
				 :height="topPanelHeight"
				 :width="clientSize.width - 16"
				 :leftPanelWidthPercent="70"
				 :margin="0"
				 @resizing="panelHorzResizeHandler"
				>
					<template #left>
						<CodeBox :panelHeight="topPanelHeight" />
					</template>
					<template #right>
						<SplitPanelVert
						 :height="topPanelHeight"
						 :width="rightPanelWidth"
						 :topPanelHeightPercent="25"
						 :margin="0"
						>
							<template #top>
								<DevicePanel />
							</template>
							<template #bottom>
								<CuePanel />
							</template>
						</SplitPanelVert>
					</template>
				</SplitPanelHorz>
			</template>
			<template #bottom>
				<Terminal :panelHeight="bottomPanelHeight" />
			</template>
		</SplitPanelVert> -->
		<BottomBar />
	</div>
</template>

<style lang="scss">
#app {
	font-family: Encode Sans, Helvetica, Arial, sans-serif;

	// -webkit-font-smoothing: antialiased;
	// -moz-osx-font-smoothing: grayscale;
	font-weight: 500;

	// font-size: 12pt;
	text-align: center;
	background-color: rgb(var(--color-bg));
	// color: rgb(var(--color-text));
	display: flex;
	flex-direction: column;
	user-select: none;
	overflow: hidden;

	transition-duration: 0.2s;
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
	border-color: rgb(var(--color-neutral));
	border-radius: 0.375rem;
	border-style: solid;
	border-width: 2px;
	caret-color: rgb(var(--color-neutral));
	transition-duration: 0.2s;
	width: fit-content;
}

button {
	cursor: pointer;
	box-sizing: border-box;
	background-color: rgb(var(--color-primary));
	color: rgb(var(--color-text-primary-contrast));
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

	&.btn-subtle {
		background-color: rgb(var(--color-bg));
		border-color: rgb(var(--color-bg));
		color: rgb(var(--color-text));

		&:hover {
			background-color: rgb(var(--color-bg2));
			border-color: rgb(var(--color-neutral));
			color: rgb(var(--color-text));
		}
	}

	&.btn-red {
		background-color: rgb(var(--color-red));
		border-color: rgb(var(--color-red));
		color: rgb(var(--color-text-primary-contrast));

		&:hover {
			background-color: rgb(var(--color-red2));
			border-color: rgb(var(--color-red));
			color: rgb(var(--color-text));
		}
	}

	&.btn-green {
		background-color: rgb(var(--color-green));
		border-color: rgb(var(--color-green));
		color: rgb(var(--color-text-primary-contrast));

		&:hover {
			background-color: rgb(var(--color-green2));
			border-color: rgb(var(--color-green));
			color: rgb(var(--color-text));
		}
	}

	&.btn-blue {
		background-color: rgb(var(--color-blue));
		border-color: rgb(var(--color-blue));
		color: rgb(var(--color-text-primary-contrast));

		&:hover {
			background-color: rgb(var(--color-blue2));
			border-color: rgb(var(--color-blue));
			color: rgb(var(--color-text));
		}
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
	outline: 2px solid rgb(var(--color-primary));
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

/**
 * Colors
 */

.color {
	&-bg {
		color: rgb(var(--color-bg));
	}

	&-dark {
		color: rgb(var(--color-dark));
	}

	&-neutral {
		color: rgb(var(--color-neutral));
	}

	&-text {
		color: rgb(var(--color-text));
	}

	&-hl {
		color: rgb(var(--color-hl));
	}

	&-hl1 {
		color: rgb(var(--color-hl1));
	}

	&-primary {
		color: rgb(var(--color-primary));
	}

	&-primary1 {
		color: rgb(var(--color-primary1));
	}

	&-primary2 {
		color: rgb(var(--color-primary2));
	}

	&-secondary {
		color: rgb(var(--color-secondary));
	}

	&-secondary1 {
		color: rgb(var(--color-secondary1));
	}

	&-secondary2 {
		color: rgb(var(--color-secondary2));
	}

	&-red {
		color: rgb(var(--color-red));
	}

	&-green {
		color: rgb(var(--color-green));
	}

	&-blue {
		color: rgb(var(--color-blue));
	}
}

.bg {
	&-bg {
		background-color: rgb(var(--color-bg));
	}

	&-dark {
		background-color: rgb(var(--color-dark));
	}

	&-neutral {
		background-color: rgb(var(--color-neutral));
	}

	&-text {
		background-color: rgb(var(--color-text));
	}

	&-hl {
		background-color: rgb(var(--color-hl));
	}

	&-hl1 {
		background-color: rgb(var(--color-hl1));
	}

	&-primary {
		background-color: rgb(var(--color-primary));
	}

	&-primary1 {
		background-color: rgb(var(--color-primary1));
	}

	&-primary2 {
		background-color: rgb(var(--color-primary2));
	}

	&-secondary {
		background-color: rgb(var(--color-secondary));
	}

	&-secondary1 {
		background-color: rgb(var(--color-secondary1));
	}

	&-secondary2 {
		background-color: rgb(var(--color-secondary2));
	}

	&-red {
		background-color: rgb(var(--color-red));
	}

	&-green {
		background-color: rgb(var(--color-green));
	}

	&-blue {
		background-color: rgb(var(--color-blue));
	}
}

.border {
	&-bg {
		border-color: rgb(var(--color-bg));
	}

	&-dark {
		border-color: rgb(var(--color-dark));
	}

	&-neutral {
		border-color: rgb(var(--color-neutral));
	}

	&-text {
		border-color: rgb(var(--color-text));
	}

	&-hl {
		border-color: rgb(var(--color-hl));
	}

	&-hl1 {
		border-color: rgb(var(--color-hl1));
	}

	&-primary {
		border-color: rgb(var(--color-primary));
	}

	&-primary1 {
		border-color: rgb(var(--color-primary1));
	}

	&-primary2 {
		border-color: rgb(var(--color-primary2));
	}

	&-secondary {
		border-color: rgb(var(--color-secondary));
	}

	&-secondary1 {
		border-color: rgb(var(--color-secondary1));
	}

	&-secondary2 {
		border-color: rgb(var(--color-secondary2));
	}

	&-red {
		border-color: rgb(var(--color-red));
	}

	&-green {
		border-color: rgb(var(--color-green));
	}

	&-blue {
		border-color: rgb(var(--color-blue));
	}
}
</style>
