import './styles/colors.css'

import { createApp } from 'vue'
import App from './App.vue'
import { v4 as uuidv4 } from 'uuid'


window.electronAPI.onMPM((ev: any, message: Toaster) => {
  console.log('asdfasdfasdf')
  console.log(message)
  console.log(uuidv4())
})

const app = createApp(App)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
