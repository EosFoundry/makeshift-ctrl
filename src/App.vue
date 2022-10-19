<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref, computed, onMounted } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import CodeBox from './components/CodeBox.vue'
import Terminal from './components/Terminal.vue'

const editorContents = ref("// Welcome to makesh*ft-ctrl alpha!\n")
const terminalContents = ref("// Welcome to makesh*t-ctrl alpha!\n")
const topPanelHeight = ref(69)
const bottomPanelHeight = computed(() => {
	return 100 - topPanelHeight.value
})

function terminalResize(event: any) {
	topPanelHeight.value = event[0].size
}

</script>

<template>
	<!-- <h1></h1> -->
	<!-- <p>{{ topPanelHeight }}</p> -->
	<splitpanes horizontal @resize="terminalResize">
		<pane min-size="15">
			<code-box :pane-height-percent="bottomPanelHeight" />
		</pane>
		<pane size="size">
			<terminal :pane-height-percent="bottomPanelHeight" />
		</pane>
	</splitpanes>
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
}

.splitpanes {
	color: var(--color-bg);
	background-color: var(--color-bg);

	&__pane {
		color: var(--color-bg);
		background-color: var(--color-bg);
	}

	&--vertical>&__splitter {
		background-color: var(--color-bg);
		color: var(--color-bg);
		min-width: 7px;
	}

	&--horizontal>&__splitter {
		background-color: var(--color-bg);
		color: var(--color-bg);
		min-height: 7px;
	}
}

// crapton of font loading
@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 300;
	font-stretch: normal;
	font-style: normal;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-light.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 300;
	font-stretch: expanded;
	font-style: normal;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedlight.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 300;
	font-stretch: normal;
	font-style: oblique;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-lightoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web Oblique';
	font-weight: 300;
	font-stretch: normal;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-lightoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 300;
	font-stretch: expanded;
	font-style: oblique;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedlightoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web Oblique';
	font-weight: 300;
	font-stretch: expanded;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedlightoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 300;
	font-stretch: normal;
	font-style: italic;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-lightitalic.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 300;
	font-stretch: expanded;
	font-style: italic;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedlightitalic.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 400;
	font-stretch: normal;
	font-style: normal;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-regular.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 400;
	font-stretch: expanded;
	font-style: normal;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extended.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 400;
	font-stretch: normal;
	font-style: oblique;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-oblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web Oblique';
	font-weight: 400;
	font-stretch: normal;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-oblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 400;
	font-stretch: expanded;
	font-style: oblique;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web Oblique';
	font-weight: 400;
	font-stretch: expanded;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 400;
	font-stretch: normal;
	font-style: italic;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-italic.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 400;
	font-stretch: expanded;
	font-style: italic;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendeditalic.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 800;
	font-stretch: normal;
	font-style: normal;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extrabold.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 800;
	font-stretch: expanded;
	font-style: normal;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedextrabold.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 800;
	font-stretch: normal;
	font-style: oblique;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extraboldoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web Oblique';
	font-weight: 800;
	font-stretch: normal;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extraboldoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 800;
	font-stretch: expanded;
	font-style: oblique;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedextraboldoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web Oblique';
	font-weight: 800;
	font-stretch: expanded;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedextraboldoblique.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 800;
	font-stretch: normal;
	font-style: italic;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extrabolditalic.woff2') format('woff2');
}

@font-face {
	font-family: 'iosevka-makeshift Web';
	font-weight: 800;
	font-stretch: expanded;
	font-style: italic;
	src: url('/iosevka-makeshift/woff2/iosevka-makeshift-extendedextrabolditalic.woff2') format('woff2');
}
</style>
