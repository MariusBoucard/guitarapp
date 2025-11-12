"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("process", process);
contextBridge.exposeInMainWorld("electronAPI", {
  selectAudioFile: () => ipcRenderer.invoke("select-audio-file"),
  selectVideoFile: () => ipcRenderer.invoke("select-video-file"),
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  scanVideoDirectory: (directoryPath) => ipcRenderer.invoke("scan-video-directory", directoryPath),
  loadVideoFile: (filePath) => ipcRenderer.invoke("load-video-file", filePath),
  saveDirectoryTree: (directoryPath, treeData) => ipcRenderer.invoke("save-directory-tree", directoryPath, treeData),
  loadDirectoryTree: () => ipcRenderer.invoke("load-directory-tree"),
  // App lifecycle methods
  onBeforeQuit: (callback) => ipcRenderer.on("app-before-quit", callback),
  removeBeforeQuitListener: (callback) => ipcRenderer.removeListener("app-before-quit", callback),
  saveComplete: () => ipcRenderer.invoke("app-save-complete")
  // VST3 and EditorHost APIs removed - feature disabled
});
