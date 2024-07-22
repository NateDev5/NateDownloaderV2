const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    download: (url) => ipcRenderer.send("download", url),
    init_bar: (callback) => ipcRenderer.on("init_bar", (event, value) => callback(value)),
    increment_bar: (callback) => ipcRenderer.on("increment_bar", (event, raw_progress, raw_max, max, progress) => callback(raw_progress, raw_max, max, progress)),
    done: (callback) => ipcRenderer.on("done", (event) => callback())
})