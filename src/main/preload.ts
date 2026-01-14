// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'select-files'
  | 'select-destination'
  | 'compress-images';

export interface CompressionOptions {
  quality: number;
  width: number;
  height: number;
  addSuffix: boolean;
}

export interface CompressionPayload {
  files: string[];
  destination: string;
  options: CompressionOptions;
}

export interface CompressionResult {
  file: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: string;
  success: boolean;
  error?: string;
}

const electronHandler = {
  ipcRenderer: {
    invoke<T>(channel: Channels, ...args: unknown[]): Promise<T> {
      return ipcRenderer.invoke(channel, ...args);
    },
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
