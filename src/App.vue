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

const editorContents = ref("// Welcome to makesh*t-ctrl alpha!\n")
provide<Ref<string>>('current-session', editorContents)
const topPanelHeight = ref(60)
const bottomPanelHeight = computed(() => {
	return 100 - topPanelHeight.value
})

function terminalResize(event: any) {
	console.log(event)
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
	<p>{{ editorContents }}</p>
	<Toolbar></Toolbar>
	<splitpanes horizontal @resize="terminalResize">
		<pane min-size="15">
			<code-box :pane-height-percent="bottomPanelHeight" />
		</pane>
		<pane size="size" min-size="25">
			<terminal :pane-height-percent="bottomPanelHeight" />
		</pane>
	</splitpanes>
	<StatusBar>

	</StatusBar>
</template>

<style lang="scss">
@font-face {
	font-family: "Encode Sans";
	src: url('/encode-sans/EncodeSans-VariableFont_wdth,wght.ttf');
}

html,
body {
	margin: 0;
	padding: 0;
	height: 100%;
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

#app {
	font-family: Encode Sans, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	background-color: var(--color-bg);
	color: var(--color-text);
	height: 100%;
	display: flex;
	flex-direction: column;
	user-select: none;

  transition-duration: 0.2s;
}

.splitpanes {
	background-color: var(--color-bg);

	&__pane {
		background-color: var(--color-bg);
	}

	&--vertical>&__splitter {
		background-color: var(--color-bg);
		min-width: 3px;
	}

	&--horizontal>&__splitter {
		background-color: var(--color-bg);
		min-height: 3px;
	}
}

// crapton of font loading


</style>
