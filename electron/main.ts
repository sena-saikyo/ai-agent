import { app, BrowserWindow, screen } from "electron";
import path from "node:path";

let agentWindow: BrowserWindow | null = null;

const isDev = !!process.env.VITE_DEV_SERVER_URL;

function createAgentWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;

  // NORMAL モードのデフォルトサイズ
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
    frame: true,            // ← タイトルバーありに戻す
    transparent: false,     // ← 透明も一旦オフ
    backgroundColor: "#020617", // ← 濃い色で中身が分かりやすく
    alwaysOnTop: true,      // ← 右下で常に最前面
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    agentWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 必要なら DevTools
    // agentWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    agentWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  agentWindow.on("closed", () => {
    agentWindow = null;
  });
}



app.whenReady().then(() => {
  createAgentWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createAgentWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // macOS でも右下エージェント以外のウィンドウを閉じたら終了でOK
  if (process.platform !== "darwin") {
    app.quit();
  }
});
