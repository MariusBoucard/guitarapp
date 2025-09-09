const { contextBridge, ipcRenderer } = require('electron');

// Receive `process` from the main process
contextBridge.exposeInMainWorld('process', process);

// Expose electron APIs safely
contextBridge.exposeInMainWorld('electronAPI', {
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  selectVideoFile: () => ipcRenderer.invoke('select-video-file'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectVst3Plugin: () => ipcRenderer.invoke('select-vst3-plugin'),
  showVst3PluginUI: (pluginData) => ipcRenderer.invoke('show-vst3-plugin-ui', pluginData),
  closeVst3PluginUI: (pluginPath) => ipcRenderer.invoke('close-vst3-plugin-ui', pluginPath),
  scanVideoDirectory: (directoryPath) => ipcRenderer.invoke('scan-video-directory', directoryPath),
  loadVideoFile: (filePath) => ipcRenderer.invoke('load-video-file', filePath),
  saveDirectoryTree: (directoryPath, treeData) => ipcRenderer.invoke('save-directory-tree', directoryPath, treeData),
  loadDirectoryTree: () => ipcRenderer.invoke('load-directory-tree')
});