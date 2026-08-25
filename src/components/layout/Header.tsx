import React, { useState } from 'react';
import {
  HardDrive,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  RefreshCw,
  Sliders,
  Radio,
  Laptop,
  Download
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes } from '../../utils/formatters';
import { StorageScannerModal } from '../drives/StorageScannerModal';
import { DesktopInstallerModal } from '../desktop/DesktopInstallerModal';

export const Header: React.FC = () => {
  const {
    drives,
    protectionPercentage,
    totalRecoveredInternalBytes,
    localWriteRequests,
    sessionFiles,
    simulateUnexpectedWrite,
    simulateNewSessionFiles,
    toggleDriveConnection,
    setActiveTab
  } = useWorkspace();

  const [driveMenuOpen, setDriveMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [installerOpen, setInstallerOpen] = useState(false);
  const connectedCount = drives.filter((d) => d.isConnected).length;
  const pendingApprovalsCount = localWriteRequests.filter((r) => r.status === 'pending').length;

  return (
    <header className="h-16 bg-[#1E1B4B] border-b border-indigo-950/80 px-5 flex items-center justify-between text-white shrink-0 sticky top-0 z-30 shadow-xl shadow-indigo-950/50">
      {/* Brand & App Title */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F43F5E] to-[#E11D48] flex items-center justify-center shadow-lg shadow-rose-500/30 ring-2 ring-white/20">
          <HardDrive className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-base tracking-tight text-white">External Workspace Manager</h1>
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-[#FACC15] text-[#1E1B4B] shadow-sm">
              PRO v2.4
            </span>
          </div>
          <p className="text-xs text-indigo-200 font-medium">Desktop Storage Routing & Workspace Isolation</p>
        </div>
      </div>

      {/* Global Protection & Live Status */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Real Storage Scanner button */}
        <button
          onClick={() => setScannerOpen(true)}
          className="flex items-center gap-2 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1B4B] text-xs px-3.5 py-2 rounded-2xl font-black shadow-md shadow-yellow-500/20 transition"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#1E1B4B]" />
          <span>Storage Scanner</span>
        </button>

        {/* Protection percentage gauge */}
        <div className="flex items-center gap-3 bg-[#13113A]/90 px-4 py-1.5 rounded-2xl border border-indigo-800/40 shadow-inner">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-indigo-950"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#4ADE80]"
                strokeDasharray={`${protectionPercentage}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-[#4ADE80]">{protectionPercentage}%</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-100 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Internal Disk Protected</span>
            </div>
            <div className="text-[11px] text-indigo-300">
              <span className="font-bold text-white">{formatBytes(totalRecoveredInternalBytes)}</span> saved externally
            </div>
          </div>
        </div>

        {/* Connected Drives status trigger */}
        <div className="relative">
          <button
            onClick={() => setDriveMenuOpen(!driveMenuOpen)}
            className="flex items-center gap-2 bg-[#25215A] hover:bg-[#2E296E] text-xs px-3.5 py-2 rounded-2xl border border-indigo-700/50 shadow-sm transition font-medium text-white"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4ADE80]"></span>
            </span>
            <span>
              <strong className="text-[#FACC15] font-extrabold">{connectedCount}</strong> / {drives.length} Drives Connected
            </span>
            <Sliders className="w-3.5 h-3.5 text-indigo-300 ml-0.5" />
          </button>

          {/* Quick Mount/Unmount dropdown menu */}
          {driveMenuOpen && (
            <div className="absolute right-0 mt-2 w-76 bg-[#1E1B4B] border border-indigo-700/60 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md">
              <div className="text-xs font-black text-indigo-200 px-2 py-1.5 border-b border-indigo-800/60 flex justify-between items-center uppercase tracking-wider">
                <span>Hardware Disconnect Simulator</span>
                <span className="text-[10px] text-indigo-300 font-normal lowercase">Test Fallback</span>
              </div>
              <div className="space-y-1 py-1.5 max-h-64 overflow-y-auto">
                {drives.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-indigo-900/50 text-xs transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          d.isConnected ? 'bg-[#4ADE80]' : 'bg-[#F43F5E]'
                        }`}
                      />
                      <span className="text-white font-bold truncate">{d.label}</span>
                      <span className="text-[10px] text-indigo-300">({d.mountPoint})</span>
                    </div>
                    {d.type !== 'internal' && (
                      <button
                        onClick={() => toggleDriveConnection(d.id)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition shadow-sm ${
                          d.isConnected
                            ? 'bg-[#F43F5E]/20 text-rose-300 hover:bg-[#F43F5E] hover:text-white'
                            : 'bg-[#4ADE80]/20 text-emerald-300 hover:bg-[#4ADE80] hover:text-[#1E1B4B]'
                        }`}
                      >
                        {d.isConnected ? 'Unplug' : 'Plug In'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-indigo-800/60 text-[10px] text-indigo-300 text-center font-medium">
                Unplugging tests Strict Mode & Fallback Routing
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Actions & Alert Badges */}
      <div className="flex items-center gap-2.5">
        {/* Pending approvals quick button */}
        {pendingApprovalsCount > 0 && (
          <button
            onClick={() => setActiveTab('approvals')}
            className="flex items-center gap-1.5 bg-[#F43F5E] hover:bg-rose-600 text-white px-3 py-1.5 rounded-2xl text-xs font-black transition shadow-lg shadow-rose-500/30 animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>{pendingApprovalsCount} Write Request{pendingApprovalsCount > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* Trigger Unexpected Local Write Simulation */}
        <button
          onClick={simulateUnexpectedWrite}
          title="Simulate an application attempting to write unexpected files to C:\ disk"
          className="flex items-center gap-1.5 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1B4B] font-black px-3 py-1.5 rounded-2xl text-xs transition shadow-md shadow-yellow-500/20"
        >
          <Zap className="w-3.5 h-3.5 text-[#1E1B4B] fill-[#1E1B4B]" />
          <span className="hidden sm:inline">Simulate C:\ Write</span>
        </button>

        {/* Trigger Session End Review Simulation */}
        <button
          onClick={() => {
            simulateNewSessionFiles();
            setActiveTab('session_review');
          }}
          title="Simulate application exit and scan for newly generated local files"
          className="flex items-center gap-1.5 bg-[#6366F1] hover:bg-indigo-500 text-white font-extrabold px-3 py-1.5 rounded-2xl text-xs transition shadow-md shadow-indigo-600/30"
        >
          <RefreshCw className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline">End Session Scan</span>
        </button>

        {/* Install on Laptop (.EXE) Button */}
        <button
          onClick={() => setInstallerOpen(true)}
          title="Install on your Windows laptop as a standalone .EXE desktop app"
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#4ADE80] to-[#10B981] hover:from-emerald-400 hover:to-emerald-500 text-[#1E1B4B] font-black px-3.5 py-1.5 rounded-2xl text-xs transition shadow-lg shadow-emerald-500/25 ring-1 ring-white/30"
        >
          <Laptop className="w-3.5 h-3.5 text-[#1E1B4B]" />
          <span>Install .EXE</span>
        </button>
      </div>

      {/* Desktop Installer & EXE Packaging Center */}
      <DesktopInstallerModal isOpen={installerOpen} onClose={() => setInstallerOpen(false)} />

      {/* Scanner Modal */}
      <StorageScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </header>
  );
};
