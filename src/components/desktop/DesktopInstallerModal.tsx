import React, { useState, useEffect } from 'react';
import {
  Download,
  Terminal,
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  HardDrive,
  FileCode2,
  Sparkles,
  ShieldCheck,
  MonitorDown,
  X,
  ExternalLink,
  PackageCheck,
  Zap,
  Play,
  Archive
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { downloadProjectZip } from '../../utils/zipExporter';

interface DesktopInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopInstallerModal: React.FC<DesktopInstallerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'direct_install' | 'quick_bat' | 'build_exe' | 'powershell'>('direct_install');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Command copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to generate and download file blobs
  const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename} to your laptop!`, 'success');
  };

  // Direct PWA Install prompt trigger
  const handleTriggerPwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('External Workspace Manager installed successfully!', 'success');
        setDeferredPrompt(null);
      }
    } else {
      // Fallback instruction
      showToast('Click the install icon in your browser address bar or use the 1-Click Desktop Launcher.', 'info');
    }
  };

  // 1. Download Windows Desktop Shortcut Launcher (.bat)
  const downloadDesktopLauncher = () => {
    const batContent = `@echo off
title External Workspace Manager - Local Launcher (No Login Required)
cls
echo ===================================================================
echo   Starting External Workspace Manager PRO (Local & Offline Mode)
echo ===================================================================
echo.
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required to run the local server.
    echo Please install Node.js (LTS) from https://nodejs.org/
    pause
    exit /b
)

echo [1/2] Checking local dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo [2/2] Starting local desktop server (Zero Login)...
echo.
echo Launching application on http://localhost:3000 ...
start "" "http://localhost:3000"
call npm run dev
`;
    downloadFile('Launch-EWM-Local.bat', batContent, 'application/x-bat');
  };

  // 2. Download Windows Desktop Internet Shortcut (.url)
  const downloadDesktopUrlShortcut = () => {
    const currentUrl = window.location.href;
    const urlContent = `[InternetShortcut]
URL=${currentUrl}
IconIndex=0
HotKey=0
IDList=
IconFile=https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/hard-drive.svg
`;
    downloadFile('External Workspace Manager.url', urlContent, 'application/internet-shortcut');
  };

  // 3. Script: 1-Click Windows Full Project Setup (.bat)
  const generateBatInstaller = () => {
    const batContent = `@echo off
title External Workspace Manager - Windows Setup & Launcher
color 0B
cls
echo ===================================================================
echo     External Workspace Manager PRO - Windows Setup & Launcher
echo ===================================================================
echo.
echo [1/4] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on your laptop!
    echo Please install Node.js from https://nodejs.org/ (LTS Recommended)
    pause
    exit /b
)
echo [OK] Node.js detected.

echo.
echo [2/4] Installing dependencies...
call npm install

echo.
echo [3/4] Building production desktop client...
call npm run build

echo.
echo [4/4] Creating Windows Desktop Shortcut...
set SHORTCUT_SCRIPT="%TEMP%\\CreateEWMShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SHORTCUT_SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\\External Workspace Manager.lnk" >> %SHORTCUT_SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SHORTCUT_SCRIPT%
echo oLink.TargetPath = "%~dp0Launch-EWM.bat" >> %SHORTCUT_SCRIPT%
echo oLink.WorkingDirectory = "%~dp0" >> %SHORTCUT_SCRIPT%
echo oLink.Description = "External Workspace Manager PRO" >> %SHORTCUT_SCRIPT%
echo oLink.Save >> %SHORTCUT_SCRIPT%
cscript /nologo %SHORTCUT_SCRIPT%
del %SHORTCUT_SCRIPT%

echo.
echo ===================================================================
echo [SUCCESS] Windows Desktop Shortcut created successfully!
echo Launching External Workspace Manager...
echo ===================================================================
start "" npm run preview
`;
    downloadFile('Install-EWM-Desktop.bat', batContent, 'application/x-bat');
  };

  // 4. Script: Build Standalone .EXE Installer (.bat)
  const generateExeBuilderBat = () => {
    const batContent = `@echo off
title Build Standalone Windows .EXE - External Workspace Manager
color 0A
cls
echo ===================================================================
echo   Building Standalone Windows .EXE (Installer & Portable)
echo ===================================================================
echo.
echo [1/3] Installing build tools...
call npm install --save-dev electron electron-builder

echo.
echo [2/3] Compiling React frontend...
call npm run build

echo.
echo [3/3] Packaging into native Windows .EXE...
call npx electron-builder --win nsis portable

echo.
if exist "release" (
    echo ===================================================================
    echo [SUCCESS] .EXE created in the "release" folder!
    echo Opening release folder in Windows Explorer...
    echo ===================================================================
    explorer release
)
pause
`;
    downloadFile('Build-Windows-EXE.bat', batContent, 'application/x-bat');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#13113A] border border-indigo-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-indigo-950/80 overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 bg-[#1E1B4B] border-b border-indigo-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4ADE80] to-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-600/30 ring-2 ring-white/20">
              <Laptop className="w-5 h-5 text-[#1E1B4B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Install on Windows Laptop</h2>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-[#4ADE80] text-[#1E1B4B]">
                  Easy & Direct
                </span>
              </div>
              <p className="text-xs text-indigo-300">
                Choose the direct 1-click install or build a standalone Windows .EXE installer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-3 bg-[#0F0E2A] border-b border-indigo-900/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('direct_install')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 ${
              activeTab === 'direct_install'
                ? 'bg-[#4ADE80] text-[#1E1B4B] font-black border-[#4ADE80] shadow-md shadow-emerald-500/20'
                : 'bg-[#1E1B4B] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Easiest & Most Direct (1-Click)</span>
          </button>

          <button
            onClick={() => setActiveTab('quick_bat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 ${
              activeTab === 'quick_bat'
                ? 'bg-[#6366F1] text-white font-black border-[#6366F1] shadow-md shadow-indigo-600/30'
                : 'bg-[#1E1B4B] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click Windows Batch Launcher (.bat)</span>
          </button>

          <button
            onClick={() => setActiveTab('build_exe')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 ${
              activeTab === 'build_exe'
                ? 'bg-[#FACC15] text-[#1E1B4B] font-black border-[#FACC15] shadow-md shadow-yellow-500/20'
                : 'bg-[#1E1B4B] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Build Offline Setup.EXE (Method B)</span>
          </button>

          <button
            onClick={() => setActiveTab('powershell')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 ${
              activeTab === 'powershell'
                ? 'bg-[#F43F5E] text-white font-black border-[#F43F5E] shadow-md shadow-rose-600/30'
                : 'bg-[#1E1B4B] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>PowerShell Command</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#13113A]">
          {/* TAB 1: EASIEST DIRECT 1-CLICK INSTALL */}
          {activeTab === 'direct_install' && (
            <div className="space-y-5">
              {/* Primary Direct Action */}
              <div className="p-5 bg-gradient-to-br from-[#1E1B4B] to-emerald-950/40 rounded-2xl border-2 border-[#4ADE80]/60 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#4ADE80] text-[#1E1B4B]">
                      <Zap className="w-5 h-5 font-bold" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white">Direct Installation on Your Laptop</h3>
                      <p className="text-xs text-indigo-200">No coding or compiling required — launches directly in a clean app window</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline text-[11px] font-black text-[#4ADE80] bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                    Recommended
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Native Install Button */}
                  <button
                    onClick={handleTriggerPwaInstall}
                    className="p-3.5 rounded-xl bg-[#4ADE80] hover:bg-emerald-400 text-[#1E1B4B] font-black text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 group"
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <MonitorDown className="w-4 h-4" />
                      <span>Install Direct Desktop App</span>
                    </div>
                    <span className="text-[10px] font-normal text-emerald-950">
                      Creates icon on Start Menu & Taskbar
                    </span>
                  </button>

                  {/* Windows .BAT Shortcut Launcher */}
                  <button
                    onClick={downloadDesktopLauncher}
                    className="p-3.5 rounded-xl bg-[#1E1B4B] hover:bg-indigo-900 border-2 border-indigo-500 text-white font-black text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-indigo-900/40 group"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-[#4ADE80]">
                      <Download className="w-4 h-4" />
                      <span>Windows Local Launcher</span>
                    </div>
                    <span className="text-[10px] font-normal text-indigo-300">
                      Launch-EWM-Local.bat (Zero Login)
                    </span>
                  </button>

                  {/* Project ZIP Downloader */}
                  <button
                    onClick={() => downloadProjectZip((msg) => showToast(msg, 'info'))}
                    className="p-3.5 rounded-xl bg-[#1E1B4B] hover:bg-indigo-900 border-2 border-[#FACC15]/80 text-white font-black text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-yellow-950/40 group"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-[#FACC15]">
                      <Archive className="w-4 h-4" />
                      <span>Download Project .ZIP</span>
                    </div>
                    <span className="text-[10px] font-normal text-indigo-300">
                      Complete source & .EXE scripts
                    </span>
                  </button>
                </div>
              </div>

              {/* Password Explanation Callout */}
              <div className="p-3.5 bg-indigo-950/60 rounded-xl border border-indigo-700/60 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white">Why did the previous shortcut ask for email/password?</p>
                  <p className="text-indigo-300 leading-relaxed text-[11px]">
                    The cloud preview URL is private to your Google account (<strong className="text-white">aam25qmu@gmail.com</strong>).
                    To run <strong className="text-[#4ADE80]">100% locally with ZERO logins and NO passwords</strong>, use the browser's native <strong className="text-white">"Install Direct Desktop App"</strong> button above, or run the local project via <strong className="text-white">Method B (.EXE)</strong>.
                  </p>
                </div>
              </div>

              {/* 2-Step Browser Install Guide */}
              <div className="p-4 bg-[#0F0E2A] rounded-2xl border border-indigo-900/80 space-y-3">
                <h4 className="text-xs font-black text-indigo-200 uppercase tracking-wider flex items-center gap-2">
                  <MonitorDown className="w-4 h-4 text-[#4ADE80]" />
                  <span>How to install in 5 seconds in Chrome or Edge:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-indigo-300">
                  <div className="p-3 bg-[#13113A] rounded-xl border border-indigo-800/60 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-[10px] font-black">1</span>
                      <span>Look at Address Bar</span>
                    </div>
                    <p className="text-[11px] text-indigo-400">
                      Look at the top right of your browser's address bar.
                    </p>
                  </div>

                  <div className="p-3 bg-[#13113A] rounded-xl border border-indigo-800/60 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-[10px] font-black">2</span>
                      <span>Click "Install App"</span>
                    </div>
                    <p className="text-[11px] text-indigo-400">
                      Click the small Computer / Download icon icon in the address bar.
                    </p>
                  </div>

                  <div className="p-3 bg-[#13113A] rounded-xl border border-indigo-800/60 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-[10px] font-black">3</span>
                      <span>Pin to Laptop</span>
                    </div>
                    <p className="text-[11px] text-indigo-400">
                      Check "Pin to Taskbar" and "Create Desktop Shortcut". Done!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1-Click Windows Batch Installer */}
          {activeTab === 'quick_bat' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#1E1B4B] rounded-2xl border border-indigo-700/80 space-y-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-[#4ADE80]" />
                  <h3 className="text-sm font-black text-white">1-Click Auto Setup & Desktop Shortcut</h3>
                </div>
                <p className="text-xs text-indigo-300 leading-relaxed">
                  Download <span className="font-mono text-[#4ADE80] font-bold">Install-EWM-Desktop.bat</span> and place it in your extracted project folder on your laptop. Double-clicking it will build and generate a desktop icon.
                </p>

                <div className="pt-2">
                  <button
                    onClick={generateBatInstaller}
                    className="w-full sm:w-auto py-2.5 px-5 bg-[#4ADE80] hover:bg-emerald-400 text-[#1E1B4B] text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Install-EWM-Desktop.bat</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Build Native Setup.exe (Method B) */}
          {activeTab === 'build_exe' && (
            <div className="space-y-5">
              {/* Direct Project ZIP Downloader */}
              <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-[#1E1B4B] to-emerald-950/40 rounded-2xl border-2 border-[#4ADE80]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Archive className="w-5 h-5 text-[#4ADE80]" />
                    <h3 className="text-sm font-black text-white">Step 1: Download Complete Project ZIP</h3>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-[#4ADE80] text-[#1E1B4B]">
                    Instant .ZIP
                  </span>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Click the button below to download the entire project as a single <strong className="text-white">.zip</strong> archive directly to your laptop's Downloads folder:
                </p>

                <button
                  onClick={() => downloadProjectZip((msg) => showToast(msg, 'info'))}
                  className="w-full sm:w-auto py-3 px-6 bg-[#4ADE80] hover:bg-emerald-400 text-[#1E1B4B] text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  <Download className="w-4 h-4" />
                  <span>Download External-Workspace-Manager-PRO.zip</span>
                </button>
              </div>

              <div className="p-4 bg-[#1E1B4B] rounded-2xl border border-indigo-700/80 space-y-3">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-[#FACC15]" />
                  <h3 className="text-sm font-black text-white">Step 2: Generate Windows Setup.exe & Portable .EXE</h3>
                </div>
                <p className="text-xs text-indigo-300 leading-relaxed">
                  Extract the downloaded ZIP on your laptop, then build the native <span className="font-mono text-[#4ADE80] font-bold">External Workspace Manager Setup 2.4.0.exe</span>:
                </p>

                <div className="pt-2">
                  <button
                    onClick={generateExeBuilderBat}
                    className="w-full sm:w-auto py-2.5 px-5 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1B4B] text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Build-Windows-EXE.bat</span>
                  </button>
                </div>
              </div>

              {/* Terminal Commands */}
              <div className="p-4 bg-[#0F0E2A] rounded-2xl border border-indigo-900/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-200">Or Run in PowerShell in the extracted folder:</span>
                  <button
                    onClick={() => handleCopy('npm install && npm run dist:win', 'distwin')}
                    className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-bold"
                  >
                    {copiedId === 'distwin' ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'distwin' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 bg-[#13113A] rounded-xl border border-indigo-800 font-mono text-xs text-[#4ADE80] flex items-center justify-between">
                  <code>npm install && npm run dist:win</code>
                </div>

                <div className="text-xs text-indigo-300 space-y-1">
                  <p>✓ Creates <span className="font-mono text-white">release\External Workspace Manager Setup.exe</span></p>
                  <p>✓ Standard Windows NSIS installer with desktop & start menu shortcuts.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PowerShell Quick Run */}
          {activeTab === 'powershell' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#1E1B4B] rounded-2xl border border-indigo-700/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#F43F5E]" />
                  <h3 className="text-sm font-black text-white">Windows PowerShell 1-Liner Quick Run</h3>
                </div>
                <p className="text-xs text-indigo-300">
                  Paste this command in PowerShell in your project folder:
                </p>

                <div className="p-3.5 bg-[#0F0E2A] rounded-xl border border-indigo-800/80 font-mono text-xs text-[#FACC15] flex items-center justify-between gap-3 overflow-x-auto">
                  <code>npm install && npm run build && npm run preview</code>
                  <button
                    onClick={() => handleCopy('npm install && npm run build && npm run preview', 'psone')}
                    className="p-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white shrink-0 transition"
                  >
                    {copiedId === 'psone' ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1E1B4B] border-t border-indigo-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            <span>Ready for Windows 10 & 11 laptops</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#6366F1] hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition shadow-md shadow-indigo-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
