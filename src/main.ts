import './styles/colors.css'

import { createApp } from 'vue'
import App from './App.vue'
import { v4 as uuidv4 } from 'uuid'

import { resolve, dirname, join} from 'pathe'
import ace, { type Ace } from 'ace-builds'
import 'ace-builds' // this needs to be called for ace.define to exist
import aceUrl from 'ace-builds/src-noconflict/mode-javascript?url'
const url = new URL(import.meta.url)
const acePath = url.origin + join(dirname(aceUrl), '.')
ace.config.set("basePath", acePath)
ace.config.set("workerPath", acePath);
ace.config.set("loadWorkerFromBlob", false);

console.log('url origin: ' + url.origin)
console.log('url pathname: ' + url.pathname)
console.log('aceurl: ' + aceUrl)
console.log(dirname(aceUrl))
console.log(acePath)



window.buttAPI.onMPM((ev: any, message: Toaster) => {
  console.log('asdfasdfasdf')
  console.log(message)
  console.log(uuidv4())
})

const app = createApp(App)
  .provide('ace', ace)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
