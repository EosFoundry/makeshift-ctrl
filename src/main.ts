import './styles/colors.css'

import { createApp } from 'vue'
import App from './App.vue'
import { v4 as uuidv4 } from 'uuid'

import { resolve, dirname, join } from 'pathe'
import ace, { type Ace } from 'ace-builds'
import 'ace-builds' // this needs to be called for ace.define to exist
// import acePath from '/ace-pkg/src-min-noconflict/ace.js?url'
const acePath = join(import.meta.env.BASE_URL + 'ace-pkg/src-min-noconflict')
ace.config.set("basePath", acePath)
ace.config.set("workerPath", acePath);
ace.config.set("loadWorkerFromBlob", false);

console.log('acepath: ' + acePath)



window.buttAPI.onCounterr((ev: any, message: Toaster) => {
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
