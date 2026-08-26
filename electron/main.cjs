const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow = null;
let localServer = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function getDistPath() {
  const possiblePaths = [
    path.join(__dirname, '../dist'),
    path.join(app.getAppPath(), 'dist'),
    path.join(process.resourcesPath || '', 'app.asar/dist'),
    path.join(process.resourcesPath || '', 'app/dist'),
    path.join(__dirname, 'dist')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
      return p;
    }
  }
  return path.join(__dirname, '../dist');
}

function startLocalServer() {
  return new Promise((resolve) => {
    const distDir = getDistPath();
    localServer = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0].split('#')[0]);
      if (reqPath === '/' || reqPath === '') {
        reqPath = '/index.html';
      }

      let filePath = path.join(distDir, reqPath);

      // Security check
      if (!filePath.startsWith(distDir)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }

      // Check if file exists, else fallback to index.html for SPA routing
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File Not Found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
      });
    });

    localServer.listen(0, '127.0.0.1', () => {
      const port = localServer.address().port;
      resolve(port);
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0F0E2A',
    title: 'External Workspace Manager PRO',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    frame: true,
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  // In development load Vite dev server, in production load local static server
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    try {
      const port = await startLocalServer();
      mainWindow.loadURL(`http://127.0.0.1:${port}/`);
    } catch (err) {
      console.error('Failed to start local server, falling back to loadFile', err);
      mainWindow.loadFile(path.join(getDistPath(), 'index.html'));
    }
  }

  // Allow F12 / Ctrl+Shift+I to open DevTools if needed
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (localServer) {
      try { localServer.close(); } catch (e) {}
    }
  });
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

// Native IPC handlers for Windows File System
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('check-junction', async (event, pathToCheck) => {
  try {
    const stat = fs.lstatSync(pathToCheck);
    return { isSymbolicLink: stat.isSymbolicLink(), exists: true };
  } catch (err) {
    return { exists: false, error: err.message };
  }
});
