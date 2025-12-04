"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const WINDOW_SIZE = {
    normal: { width: 260, height: 320 },
    compact: { width: 96, height: 96 }
};
const isMac = process.platform === 'darwin';
function getWindowPosition(size) {
    const primaryDisplay = electron_1.screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const x = Math.max(0, width - size.width - 12);
    const y = Math.max(0, height - size.height - 12);
    return { x, y };
}
function createWindow() {
    const mode = 'normal';
    const { width, height } = WINDOW_SIZE[mode];
    const position = getWindowPosition({ width, height });
    const win = new electron_1.BrowserWindow({
        width,
        height,
        x: position.x,
        y: position.y,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: true,
        show: true,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.ts'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl) {
        win.loadURL(devServerUrl);
        win.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        const htmlPath = path_1.default.join(__dirname, '../dist/renderer/index.html');
        win.loadFile(htmlPath);
    }
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (!isMac) {
        electron_1.app.quit();
    }
});
