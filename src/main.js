import { createApp } from 'vue'
import App from './App.vue'
import { pinia } from './stores'
import './assets/styles/colors.css'
// const { contextBridge } = require('electron');

// // Expose `process` to the renderer process

const app = createApp(App, {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('guitar')
    },
    silent: true
  })

// Add Pinia for state management
app.use(pinia)

// Expose Pinia globally so main process can access stores for emergency save
window.$pinia = pinia
window.__VUE_APP__ = app

// const { EventEmitter } = require('events');
// EventEmitter.defaultMaxListeners = 1000000;
// const image = app.nativeImage.createFromPath(
    // contextBridge.exposeInMainWorld('process', process);
//     app.getAppPath() + "/public/favicon.ico"
//   );
//   app.dock.setIcon(image);
app.mount('#app')

console.log('🚀 Vue app mounted with Pinia exposed globally')


