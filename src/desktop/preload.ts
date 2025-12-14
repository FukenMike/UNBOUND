/**
 * Electron preload script - bridges main and renderer processes securely.
 * 
 * IMPORTANT: Preload scripts MUST use CommonJS, even when main process uses ESM.
 * This is an Electron requirement as of v28. Preload runs in a sandboxed context
 * that doesn't support ESM imports yet.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadProjectFile: () => ipcRenderer.invoke('load-project-file')
});
