// electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  setDisplayMode: (mode: "normal" | "compact") => {
    ipcRenderer.send("set-display-mode", mode);
  },
});
