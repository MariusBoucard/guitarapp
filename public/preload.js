const { contextBridge, ipcRenderer } = require('electron');

// Receive `process` from the main process
contextBridge.exposeInMainWorld('process', process);

// Expose electron APIs safely
contextBridge.exposeInMainWorld('electronAPI', {
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  selectVideoFile: () => ipcRenderer.invoke('select-video-file'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  scanVideoDirectory: (directoryPath) => ipcRenderer.invoke('scan-video-directory', directoryPath),
  loadVideoFile: (filePath) => ipcRenderer.invoke('load-video-file', filePath),
  saveDirectoryTree: (directoryPath, treeData) => ipcRenderer.invoke('save-directory-tree', directoryPath, treeData),
  loadDirectoryTree: () => ipcRenderer.invoke('load-directory-tree')
});