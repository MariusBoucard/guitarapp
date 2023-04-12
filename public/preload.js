const { contextBridge } = require('electron');

// Receive `process` from the main process
contextBridge.exposeInMainWorld('process', process);