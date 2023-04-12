import { createApp } from 'vue'
import App from './App.vue'
// const { contextBridge } = require('electron');

// // Expose `process` to the renderer process

const app = createApp(App,{ silent: true })
// const { EventEmitter } = require('events');
// EventEmitter.defaultMaxListeners = 1000000;
// const image = app.nativeImage.createFromPath(
    // contextBridge.exposeInMainWorld('process', process);
//     app.getAppPath() + "/public/favicon.ico"
//   );
//   app.dock.setIcon(image);
app.mount('#app')


