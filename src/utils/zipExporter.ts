import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Function to bundle project files dynamically or from client code
export async function downloadProjectZip(onProgress?: (msg: string) => void) {
  const zip = new JSZip();

  onProgress?.('Preparing project configuration files...');

  // package.json
  zip.file('package.json', JSON.stringify({
    name: "external-workspace-manager-pro",
    private: true,
    version: "2.4.0",
    type: "module",
    main: "electron/main.cjs",
    scripts: {
      "dev": "vite --port=3000 --host=0.0.0.0",
      "build": "vite build",
      "preview": "vite preview --port=3000",
      "electron:dev": "electron .",
      "dist:win": "vite build && electron-builder --win nsis",
      "dist:portable": "vite build && electron-builder --win portable",
      "lint": "tsc --noEmit"
    },
    dependencies: {
      "clsx": "^2.1.1",
      "lucide-react": "^1.16.0",
      "motion": "^12.38.0",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "tailwind-merge": "^3.5.0",
      "jszip": "^3.10.1",
      "file-saver": "^2.0.5"
    },
    devDependencies: {
      "@tailwindcss/vite": "^4.1.18",
      "@types/node": "^22.14.0",
      "@types/react": "^18.3.18",
      "@types/react-dom": "^18.3.5",
      "@vitejs/plugin-react": "^4.3.4",
      "electron": "^34.0.0",
      "electron-builder": "^25.1.8",
      "tailwindcss": "^4.1.18",
      "typescript": "~5.7.2",
      "vite": "^6.2.0"
    }
  }, null, 2));

  // electron-builder.json
  zip.file('electron-builder.json', JSON.stringify({
    appId: "com.workspace.manager.app",
    productName: "External Workspace Manager PRO",
    directories: { output: "release" },
    files: ["dist/**/*", "electron/**/*", "package.json"],
    win: {
      target: [
        { target: "nsis", arch: ["x64"] },
        { target: "portable", arch: ["x64"] }
      ],
      requestedExecutionLevel: "requireAdministrator"
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      shortcutName: "External Workspace Manager"
    }
  }, null, 2));

  // index.html
  zip.file('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>External Workspace Manager PRO</title>
  </head>
  <body class="bg-[#0F0E2A] text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

  // vite.config.ts
  zip.file('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});`);

  // tsconfig.json
  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true
    },
    include: ["src"]
  }, null, 2));

  // Electron files
  const electronFolder = zip.folder('electron');
  electronFolder?.file('main.cjs', `const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
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
      sandbox: true
    },
    frame: true,
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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
});`);

  electronFolder?.file('preload.cjs', `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  checkJunction: (path) => ipcRenderer.invoke('check-junction', path),
  isDesktopApp: true
});`);

  // Windows Launchers
  zip.file('1-CLICK-INSTALL-AND-RUN.bat', `@echo off
title External Workspace Manager - Windows Setup & Launcher
color 0B
cls
echo ===================================================================
echo     External Workspace Manager PRO - 1-Click Windows Setup
echo ===================================================================
echo.
echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on your laptop!
    echo Please install Node.js (LTS recommended) from https://nodejs.org/
    pause
    exit /b
)
echo [OK] Node.js detected.

echo.
echo [2/3] Installing dependencies (npm install)...
call npm install

echo.
echo [3/3] Launching External Workspace Manager locally...
echo Opening in browser at http://localhost:3000
start "" "http://localhost:3000"
call npm run dev
`);

  zip.file('BUILD-STANDALONE-EXE.bat', `@echo off
title Build Standalone Windows .EXE - External Workspace Manager
color 0A
cls
echo ===================================================================
echo   Building Standalone Windows .EXE (Installer & Portable)
echo ===================================================================
echo.
echo [1/3] Installing packages...
call npm install

echo.
echo [2/3] Compiling React frontend...
call npm run build

echo.
echo [3/3] Packaging into native Windows .EXE...
call npx electron-builder --win nsis portable

echo.
if exist "release" (
    echo ===================================================================
    echo [SUCCESS] .EXE Installer created in the "release" folder!
    echo ===================================================================
    explorer release
)
pause
`);

  onProgress?.('Generating ZIP file...');
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'External-Workspace-Manager-PRO.zip');
  onProgress?.('Done!');
}
