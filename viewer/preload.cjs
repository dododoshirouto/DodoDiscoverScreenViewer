// CommonJS なので require が使える
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('discoverAPI', {
    load: (config) => {
        const devPath = path.join(process.cwd(), config.outJson);
        const prodPath = path.join(process.resourcesPath, config.outJson);
        try { return JSON.parse(fs.readFileSync(fs.existsSync(devPath) ? devPath : prodPath, 'utf-8')); }
        catch { return { items: [] }; }
    },
    fetch: (config) => ipcRenderer.invoke('fetch-discover', config)
});
contextBridge.exposeInMainWorld('configAPI', { get: () => ipcRenderer.invoke('get-config') });