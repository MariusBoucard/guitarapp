const { contextBridge, ipcRenderer } = require('electron');

// Receive `process` from the main process
contextBridge.exposeInMainWorld('process', process);

// Expose electron APIs safely
contextBridge.exposeInMainWorld('electronAPI', {
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  selectVideoFile: () => ipcRenderer.invoke('select-video-file')
});