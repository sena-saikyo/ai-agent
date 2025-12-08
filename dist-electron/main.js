"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// electron/main.ts
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
let agentWindow = null;
const isDev = !!process.env.VITE_DEV_SERVER_URL;
function createAgentWindow() {
    const display = electron_1.screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    const winWidth = 260;
    const winHeight = 210;
    const margin = 16;
    const x = Math.round(screenWidth - winWidth - margin);
    const y = Math.round(screenHeight - winHeight - margin);
    agentWindow = new electron_1.BrowserWindow({
        x,
        y,
        width: winWidth,
        height: winHeight,
        resizable: false,
        frame: false, // ✅ タイトルバーを消す
        transparent: true, // ✅ ウィンドウの背景を透明にする
        backgroundColor: "#00000000", // 念のため完全透明
        alwaysOnTop: true,
        hasShadow: false, // OSの影はいらない（CSSでつける）
        webPreferences: {
            preload: node_path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
        agentWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else {
        agentWindow.loadFile(node_path_1.default.join(__dirname, "../renderer/index.html"));
    }
    agentWindow.on("closed", () => {
        agentWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    createAgentWindow();
    // ★ NORMAL / COMPACT に応じてサイズ変更
    electron_1.ipcMain.on("set-display-mode", (_event, mode) => {
        if (!agentWindow)
            return;
        const display = electron_1.screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = display.workAreaSize;
        const margin = 16;
        let winWidth;
        let winHeight;
        if (mode === "normal") {
            winWidth = 260;
            winHeight = 210;
        }
        else {
            winWidth = 96;
            winHeight = 96;
        }
        const x = Math.round(screenWidth - winWidth - margin);
        const y = Math.round(screenHeight - winHeight - margin);
        agentWindow.setBounds({ x, y, width: winWidth, height: winHeight });
    });
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createAgentWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
