// CommonJS なので require が使える
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'discover_items.json');

contextBridge.exposeInMainWorld('discoverAPI', {
    load: () => {
        try { return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')); }
        catch { return { items: [] }; }
    },
    fetch: (config) => ipcRenderer.invoke('fetch-discover', config)
});
contextBridge.exposeInMainWorld('configAPI', { get: () => ipcRenderer.invoke('get-config') });