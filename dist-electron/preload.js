"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("process", process);
contextBridge.exposeInMainWorld("electronAPI", {
  selectAudioFile: () => ipcRenderer.invoke("select-audio-file"),
  selectVideoFile: () => ipcRenderer.invoke("select-video-file")
});
