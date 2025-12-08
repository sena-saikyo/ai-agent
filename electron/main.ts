// electron/main.ts
import { app, BrowserWindow, screen, ipcMain } from "electron";
import path from "node:path";

type DisplayMode = "normal" | "compact";

let agentWindow: BrowserWindow | null = null;

const isDev = !!process.env.VITE_DEV_SERVER_URL;

function createAgentWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;

  const winWidth = 260;
  const winHeight = 210;
  const margin = 16;

  const x = Math.round(screenWidth - winWidth - margin);
  const y = Math.round(screenHeight - winHeight - margin);

  agentWindow = new BrowserWindow({
    x,
    y,
    width: winWidth,
    height: winHeight,
    resizable: false,
    frame: false,                 // ✅ タイトルバーを消す
    transparent: true,            // ✅ ウィンドウの背景を透明にする
    backgroundColor: "#00000000", // 念のため完全透明
    alwaysOnTop: true,
    hasShadow: false,             // OSの影はいらない（CSSでつける）
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });


  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    agentWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    agentWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  agentWindow.on("closed", () => {
    agentWindow = null;
  });
}

app.whenReady().then(() => {
  createAgentWindow();

  // ★ NORMAL / COMPACT に応じてサイズ変更
  ipcMain.on("set-display-mode", (_event, mode: DisplayMode) => {
    if (!agentWindow) return;

    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    const margin = 16;

    let winWidth: number;
    let winHeight: number;

    if (mode === "normal") {
      winWidth = 260;
      winHeight = 210;
    } else {
      winWidth = 96;
      winHeight = 96;
    }

    const x = Math.round(screenWidth - winWidth - margin);
    const y = Math.round(screenHeight - winHeight - margin);

    agentWindow.setBounds({ x, y, width: winWidth, height: winHeight });
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createAgentWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
