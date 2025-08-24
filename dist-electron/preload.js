"use strict";
const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("process", process);
