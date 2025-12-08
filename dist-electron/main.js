"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
let agentWindow = null;
const isDev = !!process.env.VITE_DEV_SERVER_URL;
function createAgentWindow() {
    const display = electron_1.screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    // NORMAL モードのデフォルトサイズ
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
        frame: true, // ← タイトルバーありに戻す
        transparent: false, // ← 透明も一旦オフ
        backgroundColor: "#020617", // ← 濃い色で中身が分かりやすく
        alwaysOnTop: true, // ← 右下で常に最前面
        webPreferences: {
            preload: node_path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
        agentWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // 必要なら DevTools
        // agentWindow.webContents.openDevTools({ mode: "detach" });
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
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createAgentWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    // macOS でも右下エージェント以外のウィンドウを閉じたら終了でOK
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
