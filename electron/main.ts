import { app, BrowserWindow, screen } from 'electron';
import path from 'path';

const WINDOW_SIZE = {
  normal: { width: 260, height: 320 },
  compact: { width: 96, height: 96 }
};

const isMac = process.platform === 'darwin';

function getWindowPosition(size: { width: number; height: number }) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const x = Math.max(0, width - size.width - 12);
  const y = Math.max(0, height - size.height - 12);
  return { x, y };
}

function createWindow() {
  const mode: keyof typeof WINDOW_SIZE = 'normal';
  const { width, height } = WINDOW_SIZE[mode];
  const position = getWindowPosition({ width, height });

  const win = new BrowserWindow({
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
      preload: path.join(__dirname, 'preload.ts'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const htmlPath = path.join(__dirname, '../dist/renderer/index.html');
    win.loadFile(htmlPath);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});
