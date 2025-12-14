/**
 * Electron main process for UNBOUND desktop application.
 * Handles window creation, file system access, and native desktop integration.
 * 
 * ESM Notes:
 * - Uses import statements instead of require()
 * - __dirname replaced with fileURLToPath + dirname pattern
 * - import.meta.url provides the current module URL in ESM
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ESM-safe alternative to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1a1a1a',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  /**
   * BLANK SCREEN FIX:
   * - HTML/CSS files are NOT copied to dist/ during TypeScript compilation
   * - __dirname in compiled code = PROJECT_ROOT/dist/desktop/
   * - Path calculation: dist/desktop -> ../.. -> PROJECT_ROOT -> src/desktop/renderer/index.html
   * - Compiled renderer.js lives in dist/desktop/renderer/
   * - HTML references the compiled JS via relative path
   */
  const projectRoot = path.join(__dirname, '../..');
  const rendererPath = path.join(projectRoot, 'src/desktop/renderer/index.html');
  
  console.log('__dirname:', __dirname);
  console.log('Project root:', projectRoot);
  console.log('Loading renderer from:', rendererPath);
  mainWindow.loadFile(rendererPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('load-project-file', async () => {
  if (!mainWindow) return null;
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'UNBOUND Project', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
});
