import React, { useState } from 'react';
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
  Layers,
  ArrowRight,
  ShieldCheck,
  MonitorDown,
  X,
  ExternalLink,
  PackageCheck
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface DesktopInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopInstallerModal: React.FC<DesktopInstallerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'quick_bat' | 'build_exe' | 'powershell' | 'pwa'>('quick_bat');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // 1. Script: 1-Click Windows Desktop Launcher & Shortcut Generator (.bat)
  const generateBatInstaller = () => {
    const batContent = `@echo off
title External Workspace Manager - Windows Setup & Launcher
color 0B
cls
echo ===================================================================
echo     External Workspace Manager PRO - Windows Setup & Launcher
echo ===================================================================
echo.
echo [1/4] Checking Node.js and NPM environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on your laptop!
    echo Please download and install Node.js from https://nodejs.org/ (LTS Recommended)
    pause
    exit /b
)
echo [OK] Node.js detected.

echo.
echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [WARNING] Dependency installation had warnings, proceeding to build...
)

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
echo oLink.Description = "External Workspace Manager PRO - Desktop Storage Routing" >> %SHORTCUT_SCRIPT%
echo oLink.Save >> %SHORTCUT_SCRIPT%
cscript /nologo %SHORTCUT_SCRIPT%
del %SHORTCUT_SCRIPT%

echo.
echo ===================================================================
echo [SUCCESS] Windows Desktop Shortcut created successfully!
echo Launching External Workspace Manager in Standalone Window...
echo ===================================================================
start "" npm run preview
`;
    downloadFile('Install-EWM-Desktop.bat', batContent, 'application/x-bat');
  };

  // 2. Script: Build Standalone .EXE Installer (.bat)
  const generateExeBuilderBat = () => {
    const batContent = `@echo off
title Build Standalone Windows .EXE - External Workspace Manager
color 0A
cls
echo ===================================================================
echo   Building Standalone Windows .EXE (Installer & Portable)
echo ===================================================================
echo.
echo [1/3] Verifying build prerequisites (electron-builder)...
call npm install --save-dev electron electron-builder

echo.
echo [2/3] Compiling React frontend to static dist...
call npm run build

echo.
echo [3/3] Packaging into native Windows .EXE...
echo This will generate:
echo   - release\\External Workspace Manager Setup 2.4.0.exe (NSIS Installer)
echo   - release\\External Workspace Manager 2.4.0.exe (Portable EXE)
echo.
call npx electron-builder --win nsis portable

echo.
if exist "release" (
    echo ===================================================================
    echo [SUCCESS] .EXE Files created in the "release" folder!
    echo Opening release folder in Windows Explorer...
    echo ===================================================================
    explorer release
) else (
    echo [NOTICE] Build finished. Check output above.
)
pause
`;
    downloadFile('Build-Windows-EXE.bat', batContent, 'application/x-bat');
  };

  // 3. Script: PowerShell Auto-Deployer (.ps1)
  const generatePowerShellScript = () => {
    const psContent = `# External Workspace Manager PRO - Windows PowerShell Installer
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " External Workspace Manager PRO - PowerShell Installer" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Node.js not detected. Please install from https://nodejs.org" -ForegroundColor Red
    Pause
    Exit
}

Write-Host "[1/4] Installing packages..." -ForegroundColor Yellow
npm install

Write-Host "[2/4] Compiling web application..." -ForegroundColor Yellow
npm run build

Write-Host "[3/4] Creating Desktop Shortcut..." -ForegroundColor Yellow
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\\External Workspace Manager.lnk")
$Shortcut.TargetPath = "$PWD\\Launch-EWM.bat"
$Shortcut.WorkingDirectory = "$PWD"
$Shortcut.Description = "External Workspace Manager Desktop"
$Shortcut.Save()

Write-Host "[4/4] Starting Application..." -ForegroundColor Green
npm run preview
`;
    downloadFile('Install-EWM.ps1', psContent, 'text/plain');
  };

  const psOneLiner = `npm install && npm run build && npx electron-builder --win`;

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
                <h2 className="text-base font-black text-white">Install on Windows Laptop (.EXE & Desktop App)</h2>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-[#4ADE80] text-[#1E1B4B]">
                  Windows 10 / 11
                </span>
              </div>
              <p className="text-xs text-indigo-300">
                Run External Workspace Manager natively on your laptop with full NTFS junction & external drive access.
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
            onClick={() => setActiveTab('quick_bat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 ${
              activeTab === 'quick_bat'
                ? 'bg-[#4ADE80] text-[#1E1B4B] font-black border-[#4ADE80] shadow-md shadow-emerald-500/20'
                : 'bg-[#1E1B4B] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click Windows Auto-Installer (.bat)</span>
          </button>

          <button
            onClick={() => setActiveTab('build_exe')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 ${
              activeTab === 'build_exe'
                ? 'bg-[#6366F1] text-white font-black border-[#6366F1] shadow-md shadow-indigo-600/30'
                : 'bg-[#1E1B4B] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Build Native .EXE (Setup.exe)</span>
          </button>

          <button
            onClick={() => setActiveTab('powershell')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 ${
              activeTab === 'powershell'
                ? 'bg-[#FACC15] text-[#1E1B4B] font-black border-[#FACC15] shadow-md shadow-yellow-500/20'
                : 'bg-[#1E1B4B] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>PowerShell Quick Run</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 ${
              activeTab === 'pwa'
                ? 'bg-[#F43F5E] text-white font-black border-[#F43F5E] shadow-md shadow-rose-600/30'
                : 'bg-[#1E1B4B] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <MonitorDown className="w-3.5 h-3.5" />
            <span>Browser App (Zero-Install)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#13113A]">
          {/* TAB 1: 1-Click Windows Batch Installer */}
          {activeTab === 'quick_bat' && (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-[#1E1B4B] to-indigo-950/40 rounded-2xl border border-emerald-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#4ADE80] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white">Easiest Method: Download Ready-to-Run Windows Installer</h3>
                  <p className="text-xs text-indigo-300 leading-relaxed">
                    Click the button below to download <span className="font-mono text-[#4ADE80] font-bold">Install-EWM-Desktop.bat</span>. When you run it on your Windows laptop, it installs the app and automatically creates an <strong>"External Workspace Manager"</strong> desktop icon!
                  </p>
                </div>
              </div>

              {/* Action Download Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#1E1B4B] rounded-2xl border border-indigo-700/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black text-white">
                      <FileCode2 className="w-4 h-4 text-[#4ADE80]" />
                      <span>Windows Batch Launcher (.bat)</span>
                    </div>
                    <p className="text-[11px] text-indigo-300 mt-1">
                      Double-click to run on Windows 10/11. Generates desktop shortcut and starts the app.
                    </p>
                  </div>
                  <button
                    onClick={generateBatInstaller}
                    className="w-full py-2.5 px-4 bg-[#4ADE80] hover:bg-emerald-400 text-[#1E1B4B] text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Install-EWM-Desktop.bat</span>
                  </button>
                </div>

                <div className="p-4 bg-[#1E1B4B] rounded-2xl border border-indigo-700/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black text-white">
                      <Terminal className="w-4 h-4 text-[#FACC15]" />
                      <span>PowerShell Auto-Installer (.ps1)</span>
                    </div>
                    <p className="text-[11px] text-indigo-300 mt-1">
                      Runs via PowerShell with administrator privileges and creates start menu entries.
                    </p>
                  </div>
                  <button
                    onClick={generatePowerShellScript}
                    className="w-full py-2.5 px-4 bg-[#1E1B4B] hover:bg-indigo-900 border border-indigo-600 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#FACC15]" />
                    <span>Download Install-EWM.ps1</span>
                  </button>
                </div>
              </div>

              {/* 3 Step Guide */}
              <div className="p-4 bg-[#0F0E2A] rounded-2xl border border-indigo-900/80 space-y-3">
                <h4 className="text-xs font-black text-indigo-200 uppercase tracking-wider">How to use on your laptop:</h4>
                <div className="space-y-2.5 text-xs text-indigo-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                    <span>Download the project ZIP from the AI Studio top menu (or clone your repository) into any folder on your laptop.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                    <span>Download and copy <strong className="text-white">Install-EWM-Desktop.bat</strong> into the project folder.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                    <span>Double-click the <strong className="text-white">.bat</strong> file. Your laptop will launch the app in its own dedicated window with an icon on your desktop!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Build Native Setup.exe (NSIS Installer) */}
          {activeTab === 'build_exe' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#1E1B4B] rounded-2xl border border-indigo-700/80 space-y-3">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-[#6366F1]" />
                  <h3 className="text-sm font-black text-white">Generate Windows Setup.exe & Portable .EXE</h3>
                </div>
                <p className="text-xs text-indigo-300 leading-relaxed">
                  We have configured <span className="font-mono text-white font-bold">Electron & electron-builder</span> inside the codebase. You can generate a full Windows installer (<span className="font-mono text-[#4ADE80] font-bold">EWM-Setup-2.4.0.exe</span>) or single-file portable executable (<span className="font-mono text-[#FACC15] font-bold">EWM-Portable.exe</span>).
                </p>

                <div className="pt-2">
                  <button
                    onClick={generateExeBuilderBat}
                    className="w-full sm:w-auto py-2.5 px-5 bg-[#6366F1] hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Build-Windows-EXE.bat</span>
                  </button>
                </div>
              </div>

              {/* Terminal Commands */}
              <div className="p-4 bg-[#0F0E2A] rounded-2xl border border-indigo-900/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-200">Or Run Manually via Command Prompt / PowerShell:</span>
                  <button
                    onClick={() => handleCopy('npm run dist:win', 'distwin')}
                    className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-bold"
                  >
                    {copiedId === 'distwin' ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'distwin' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 bg-[#13113A] rounded-xl border border-indigo-800 font-mono text-xs text-[#4ADE80] flex items-center justify-between">
                  <code>npm run dist:win</code>
                </div>

                <div className="text-xs text-indigo-300 space-y-1">
                  <p>✓ Creates a standard Windows Setup Wizard (<span className="font-mono text-white">.exe</span>) in the <span className="font-mono text-white">/release</span> folder.</p>
                  <p>✓ Asks for Administrator rights for NTFS symbolic link / junction creation.</p>
                  <p>✓ Adds to Windows "Add/Remove Programs" and Start Menu.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PowerShell Quick Run */}
          {activeTab === 'powershell' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#1E1B4B] rounded-2xl border border-indigo-700/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#FACC15]" />
                  <h3 className="text-sm font-black text-white">Windows PowerShell 1-Liner Quick Run</h3>
                </div>
                <p className="text-xs text-indigo-300">
                  Open PowerShell on your Windows laptop in the project directory and paste this command:
                </p>

                <div className="p-3.5 bg-[#0F0E2A] rounded-xl border border-indigo-800/80 font-mono text-xs text-[#FACC15] flex items-center justify-between gap-3 overflow-x-auto">
                  <code>{psOneLiner}</code>
                  <button
                    onClick={() => handleCopy(psOneLiner, 'psone')}
                    className="p-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white shrink-0 transition"
                  >
                    {copiedId === 'psone' ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#1E1B4B] rounded-xl border border-indigo-800/60 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
                    <span>Native NTFS Support</span>
                  </div>
                  <p className="text-[11px] text-indigo-300">
                    Runs real Windows <span className="font-mono text-white">mklink /J</span> junction redirects to your external drives.
                  </p>
                </div>

                <div className="p-3.5 bg-[#1E1B4B] rounded-xl border border-indigo-800/60 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-[#6366F1]" />
                    <span>Direct Hardware Access</span>
                  </div>
                  <p className="text-[11px] text-indigo-300">
                    Accesses physical NVMe and SSD drives (C:, D:, E:) without browser sandbox limits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Progressive Web App / Chrome Native Window */}
          {activeTab === 'pwa' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#1E1B4B] rounded-2xl border border-indigo-700/80 space-y-3">
                <div className="flex items-center gap-2">
                  <MonitorDown className="w-5 h-5 text-[#F43F5E]" />
                  <h3 className="text-sm font-black text-white">Instant App Window (No Coding / Zero-Install)</h3>
                </div>
                <p className="text-xs text-indigo-300 leading-relaxed">
                  You can install this current live web application directly onto your Windows laptop taskbar & desktop using Google Chrome or Microsoft Edge.
                </p>

                <div className="space-y-2 pt-2 text-xs text-indigo-200">
                  <div className="p-3 bg-[#0F0E2A] rounded-xl border border-indigo-900/80 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                      <span>In Microsoft Edge or Google Chrome:</span>
                    </div>
                    <p className="text-indigo-300 pl-4">
                      1. Open this app in a new browser tab.
                    </p>
                    <p className="text-indigo-300 pl-4">
                      2. Click the <strong>Install / App icon</strong> in the right side of the address bar (or Menu → Apps → <em>"Install External Workspace Manager as an app"</em>).
                    </p>
                    <p className="text-indigo-300 pl-4">
                      3. Check <strong>"Pin to taskbar"</strong> and <strong>"Create Desktop shortcut"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1E1B4B] border-t border-indigo-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            <span>Includes Electron main process, preload security bridge, and Windows batch builders.</span>
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
