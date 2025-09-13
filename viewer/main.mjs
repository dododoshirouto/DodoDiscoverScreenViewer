// viewer/main.mjs

import pkg_el from 'electron';
const { app, BrowserWindow, ipcMain, screen } = pkg_el;
console.log(await import('electron'));

import path from 'path';
import { fileURLToPath } from 'url';

import { discovers_to_json, get_config } from '../get_discovers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;

function create() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        width, height,
        // fullscreen: true,
        // frame: false,
        backgroundColor: '#000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });
    win.loadFile(path.join(__dirname, 'index.html'));

    // win.webContents.openDevTools();

    // 何か入力がきたら終了（スクリーンセーバー風）
    win.webContents.on('before-input-event', (_e, input) => {
        if (['Escape', 'Space', 'Enter'].includes(input.key) || input.type === 'mouseDown') app.quit();
    });

    // Renderer からの外部リンクオープン
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());

ipcMain.handle('fetch-discover', async (_e, config) => {
    return await discovers_to_json(config);
});
ipcMain.handle('get-config', (_e) => {
    return get_config();
});