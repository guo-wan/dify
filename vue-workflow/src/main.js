import { createApp } from 'vue'
import naive from 'naive-ui'
import { Icon } from '@iconify/vue'
import './main.css'
import App from './App.vue'
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createPinia())
app.use(naive)
app.component('Icon', Icon)
app.mount('#app')
