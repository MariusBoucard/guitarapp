import { createApp } from 'vue'
import App from './App.vue'
import { pinia } from './stores'
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

// const { EventEmitter } = require('events');
// EventEmitter.defaultMaxListeners = 1000000;
// const image = app.nativeImage.createFromPath(
    // contextBridge.exposeInMainWorld('process', process);
//     app.getAppPath() + "/public/favicon.ico"
//   );
//   app.dock.setIcon(image);
app.mount('#app')


