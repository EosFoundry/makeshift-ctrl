import { createApp } from 'vue'
import App from './App.vue'
import styles from './styles/colors.scss'
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import hljsVuePlugin from "@highlightjs/vue-plugin";


hljs.registerLanguage('javascript', javascript);


window.electronAPI.onMPM((ev:any, message:Toaster) => {
  console.log('asdfasdfasdf')
  console.log(message)
})
const app = createApp(App)
  .use(hljsVuePlugin)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
