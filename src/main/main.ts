/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * PixelShrink - Image Compression App
 * Main process handling file operations and image compression
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

// Sharp is imported dynamically to avoid issues with native modules
let sharp: typeof import('sharp');

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'PixelShrink',
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

// IPC Handlers for PixelShrink

// Select image files
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] },
    ],
  });

  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

// Select destination folder
ipcMain.handle('select-destination', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }
  return '';
});

// Compress images
interface CompressionOptions {
  quality: number;
  width: number;
  height: number;
  addSuffix: boolean;
}

interface CompressionPayload {
  files: string[];
  destination: string;
  options: CompressionOptions;
}

interface CompressionResult {
  file: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: string;
  success: boolean;
  error?: string;
}

ipcMain.handle(
  'compress-images',
  async (_event, payload: CompressionPayload): Promise<CompressionResult[]> => {
    const { files, destination, options } = payload;

    // Lazy load sharp
    if (!sharp) {
      sharp = require('sharp');
    }

    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const results: CompressionResult[] = [];

    for (const file of files) {
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const outputName = options.addSuffix
        ? `${baseName}_compressed${ext}`
        : `${baseName}${ext}`;
      const outputPath = path.join(destination, outputName);

      try {
        let sharpInstance = sharp(file);

        // Apply resize if width or height is specified
        if (options.width > 0 || options.height > 0) {
          sharpInstance = sharpInstance.resize({
            width: options.width > 0 ? options.width : undefined,
            height: options.height > 0 ? options.height : undefined,
            fit: 'inside',
            withoutEnlargement: true,
          });
        }

        // Apply format-specific compression options
        const format = ext.toLowerCase();
        if (format === '.jpg' || format === '.jpeg') {
          sharpInstance = sharpInstance.jpeg({ quality: options.quality });
        } else if (format === '.png') {
          sharpInstance = sharpInstance.png({
            quality: options.quality,
            compressionLevel: 9,
          });
        } else if (format === '.webp') {
          sharpInstance = sharpInstance.webp({ quality: options.quality });
        } else if (format === '.gif') {
          sharpInstance = sharpInstance.gif();
        }

        await sharpInstance.toFile(outputPath);

        // Get file sizes
        const originalSize = fs.statSync(file).size;
        const compressedSize = fs.statSync(outputPath).size;

        results.push({
          file: outputName,
          originalSize,
          compressedSize,
          savingsPercent: (
            ((originalSize - compressedSize) / originalSize) *
            100
          ).toFixed(2),
          success: true,
        });
      } catch (error) {
        results.push({
          file: path.basename(file),
          originalSize: 0,
          compressedSize: 0,
          savingsPercent: '0',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  },
);

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
