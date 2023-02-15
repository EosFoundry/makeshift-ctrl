<script setup lang="ts">
import './styles/colors.css'
import './styles/fonts.css'
import 'splitpanes/dist/splitpanes.css'

import { ref, computed, onMounted, nextTick, provide, Ref } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import CodeBox from './components/CodeBox.vue'
import Terminal from './components/Terminal.vue'
import DeviceToolbar from './components/BottomBar.vue'
import CuePanel from './components/CuePanel.vue'
import DevicePanel from './components/DevicePanel.vue'

const editorContents = ref(`// Welcome to makesh*t-ctrl alpha!`)
provide<Ref<string>>('current-session', editorContents)
const topPanelHeight = ref(69)
const bottomPanelHeight = computed(() => {
	return 100 - topPanelHeight.value
})

function terminalResize(event: any) {
	topPanelHeight.value = event[0].size
}

// this is a very cursed hack to get xterm to resize correctly
nextTick(() => {
	window.resizeBy(-1, -1)
	window.resizeBy(1, 1)
	topPanelHeight.value = 70
})

</script>

<template>
	<!-- <h1></h1> -->
	<splitpanes id="main-container" horizontal>
		<pane :size="topPanelHeight">
			<splitpanes vertical>
				<pane size="69">
					<code-box />
				</pane>
				<pane>
					<splitpanes horizontal>
						<pane>
							<device-panel />
						</pane>
						<pane size="69">
							<cue-panel />
						</pane>
					</splitpanes>
				</pane>
			</splitpanes>
		</pane>
		<pane @resize="terminalResize">
			<terminal :pane-height-percent="bottomPanelHeight" />
		</pane>
	</splitpanes>
	<device-toolbar />
	<!-- <status-bar /> -->
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

code {
	font-family: 'Iosevka Makeshift', monospace, monospace;
}

input {
	font-size: 12pt;
	color: var(--color-text);
	background-color: var(--color-dark);
	border-color: var(--color-hl);
	caret-color: var(--color-neutral);
	transition-duration: 0.2s;
	width:fit-content;
}


button {
	cursor: pointer;
	box-sizing: border-box;
	background-color: var(--color-primary);
	color: var(--color-bg);
	display: flex;

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

select {
	background-color: var(--color-dark);
	border-radius: .25rem;
	border-width: 1px;
	margin-left: .25rem;
	margin-right: .25rem;
	border-color: var(--color-neutral);
	padding: .25rem;
}

:focus {
	outline: 1px solid var(--color-primary);
}


.flex-col {
	display: flex;
	flex-direction: col;
}

#main-container {
	box-sizing: border-box;
	padding: 4px;
	width: 100%;
	height: 100%;
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
	width: 100%;
	&.thin{
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
