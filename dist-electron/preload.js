"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("process", process);
contextBridge.exposeInMainWorld("electronAPI", {
  selectAudioFile: () => ipcRenderer.invoke("select-audio-file"),
  selectVideoFile: () => ipcRenderer.invoke("select-video-file"),
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  selectVst3Plugin: () => ipcRenderer.invoke("select-vst3-plugin"),
  showVst3PluginUI: (pluginData) => ipcRenderer.invoke("show-vst3-plugin-ui", pluginData),
  closeVst3PluginUI: (pluginPath) => ipcRenderer.invoke("close-vst3-plugin-ui", pluginPath),
  scanVideoDirectory: (directoryPath) => ipcRenderer.invoke("scan-video-directory", directoryPath),
  loadVideoFile: (filePath) => ipcRenderer.invoke("load-video-file", filePath),
  saveDirectoryTree: (directoryPath, treeData) => ipcRenderer.invoke("save-directory-tree", directoryPath, treeData),
  loadDirectoryTree: () => ipcRenderer.invoke("load-directory-tree"),
  // Native VST3 Host APIs
  vst3Native: {
    checkAvailability: () => ipcRenderer.invoke("vst3-native-check-availability"),
    loadPlugin: (pluginPath) => ipcRenderer.invoke("vst3-native-load-plugin", pluginPath),
    unloadPlugin: (pluginId) => ipcRenderer.invoke("vst3-native-unload-plugin", pluginId),
    getPlugins: () => ipcRenderer.invoke("vst3-native-get-plugins"),
    showUI: (pluginId, parentWindowId) => ipcRenderer.invoke("vst3-native-show-ui", pluginId, parentWindowId),
    hideUI: (pluginId) => ipcRenderer.invoke("vst3-native-hide-ui", pluginId),
    startProcessing: () => ipcRenderer.invoke("vst3-native-start-processing"),
    stopProcessing: () => ipcRenderer.invoke("vst3-native-stop-processing"),
    getAudioDevices: () => ipcRenderer.invoke("vst3-native-get-audio-devices"),
    initializeAudio: (audioConfig) => ipcRenderer.invoke("vst3-initialize-audio", audioConfig)
  }
});
