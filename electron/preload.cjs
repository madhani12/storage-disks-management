const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  checkJunction: (path) => ipcRenderer.invoke('check-junction', path),
  isDesktopApp: true
});
