import { app, BrowserWindow, screen, session, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 1024,
    minHeight: 768,
    title: "SIGE ZEA - Sistema de Gestión",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Requerido para algunas interacciones de sistema
      webSecurity: true,
    },
    autoHideMenuBar: true,
    // icon: path.join(__dirname, 'public/favicon.ico') 
  });

  // Manejo de enlaces externos
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // CSP HEADER MODIFICATION
  // Esto permite que las imágenes en Base64 (los logos subidos) se vean en Electron
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://generativelanguage.googleapis.com ws: wss:;"]
      }
    });
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    // En producción carga el archivo compilado
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});