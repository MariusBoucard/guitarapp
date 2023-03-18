import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App,{ silent: true })
// const { EventEmitter } = require('events');
// EventEmitter.defaultMaxListeners = 1000000;
app.mount('#app')
