import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App,{ silent: true })
// const { EventEmitter } = require('events');
// EventEmitter.defaultMaxListeners = 1000000;
// const image = app.nativeImage.createFromPath(
//     app.getAppPath() + "/public/favicon.ico"
//   );
//   app.dock.setIcon(image);
app.mount('#app')
