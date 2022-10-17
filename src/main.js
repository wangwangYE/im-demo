import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'

import { tim} from './utils/tim.js'


const app=createApp(App)
app.config.globalProperties.$tim = tim;

app.mount('#app')
