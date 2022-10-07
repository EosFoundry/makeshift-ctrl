import './styles/colors.css'

import { createApp } from 'vue'
import App from './App.vue'


window.electronAPI.onMPM((ev: any, message: Toaster) => {
  console.log('asdfasdfasdf')
  console.log(message)
})

const app = createApp(App)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
