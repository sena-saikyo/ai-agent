import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('agentAPI', {
  ping: () => 'ready'
});
