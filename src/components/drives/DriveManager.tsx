import React, { useState } from 'react';
import {
  HardDrive,
  Gauge,
  Thermometer,
  ShieldCheck,
  Lock,
  RefreshCw,
  Power,
  AlertTriangle,
  FolderPlus,
  Zap,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Cpu,
  Radio,
  SlidersHorizontal,
  Plus,
  Trash2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { StorageDrive } from '../../types';
import { formatBytes, formatSpeed, getDriveTypeLabel } from '../../utils/formatters';
import { StorageScannerModal } from './StorageScannerModal';

export const DriveManager: React.FC = () => {
  const {
    drives,
    toggleDriveConnection,
    runDriveBenchmark,
    benchmarkingDriveId,
    safeEjectDrive,
    initializeWorkspaceOnDrive,
    applications,
    mountPhysicalDirectory,
    isScanning,
    removeDrive
  } = useWorkspace();

  const [selectedDriveId, setSelectedDriveId] = useState<string>(drives[1]?.id || drives[0]?.id);
  const [scannerOpen, setScannerOpen] = useState(false);

  const selectedDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];
  const appsOnDrive = applications.filter((app) =>
    app.categoryRoutings.some((r) => r.destinationDriveId === selectedDrive?.id)
  );

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-md">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">Storage Device Inventory & Benchmarking</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Test read/write throughput, detect physical external disks, monitor drive thermals, and verify workspace suitability.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setScannerOpen(true)}
            className="px-4 py-2.5 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1B4B] font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-yellow-500/20"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Scan & Detect Real Storage</span>
          </button>

          <button
            onClick={() => mountPhysicalDirectory()}
            disabled={isScanning}
            className="px-4 py-2.5 bg-[#25215A] hover:bg-[#2E296E] text-white font-bold text-xs rounded-2xl transition flex items-center gap-2 border border-indigo-700/60"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#4ADE80]" />
            <span>{isScanning ? 'Mounting...' : 'Mount Physical Folder'}</span>
          </button>

          {selectedDrive && (
            <button
              onClick={() => runDriveBenchmark(selectedDrive.id)}
              disabled={!selectedDrive.isConnected || benchmarkingDriveId === selectedDrive.id}
              className="px-4 py-2.5 bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${benchmarkingDriveId === selectedDrive.id ? 'animate-spin' : ''}`} />
              <span>{benchmarkingDriveId === selectedDrive.id ? 'Testing I/O...' : 'Run Benchmark'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left List (5 cols) & Right Diagnostics / Suitability View (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drives Cards List */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between text-[10px] font-black text-indigo-300 uppercase tracking-widest px-1">
            <span>Registered Storage Devices ({drives.length})</span>
            <button
              onClick={() => setScannerOpen(true)}
              className="text-[#FACC15] hover:underline flex items-center gap-1 font-bold"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Manage / Purge</span>
            </button>
          </div>

          <div className="space-y-3">
            {drives.map((drive) => {
              const isSelected = drive.id === selectedDriveId;
              const usedPct = Math.round((drive.usedBytes / drive.totalBytes) * 100);

              return (
                <div
                  key={drive.id}
                  onClick={() => setSelectedDriveId(drive.id)}
                  className={`p-4.5 rounded-3xl border transition-all cursor-pointer shadow-lg ${
                    isSelected
                      ? 'bg-[#1E1B4B] border-[#F43F5E] ring-2 ring-rose-500/40 shadow-rose-950/20'
                      : 'bg-[#1E1B4B] border-indigo-900/60 hover:border-indigo-700'
                  } ${!drive.isConnected ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-md ${
                          drive.type === 'nvme'
                            ? 'bg-[#6366F1] text-white'
                            : drive.type === 'ssd'
                            ? 'bg-[#F43F5E] text-white'
                            : drive.type === 'hdd'
                            ? 'bg-[#FACC15] text-[#1E1B4B]'
                            : drive.type === 'cloud'
                            ? 'bg-[#4ADE80] text-[#1E1B4B]'
                            : 'bg-[#25215A] text-indigo-200'
                        }`}
                      >
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-xs text-white">{drive.label}</span>
                          {drive.isRealDevice && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#4ADE80] text-[#1E1B4B] uppercase tracking-wider">
                              Real
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#13113A] rounded-lg text-indigo-300 font-bold border border-indigo-800/40">
                            {drive.mountPoint}
                          </span>
                        </div>
                        <div className="text-xs text-indigo-300 font-medium">{getDriveTypeLabel(drive.type)}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          !drive.isConnected
                            ? 'bg-[#F43F5E] text-white'
                            : drive.health === 'excellent'
                            ? 'bg-[#4ADE80] text-[#1E1B4B]'
                            : 'bg-[#FACC15] text-[#1E1B4B]'
                        }`}
                      >
                        {!drive.isConnected ? 'Disconnected' : drive.health.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <div className="flex justify-between text-xs text-indigo-200 font-bold mb-1.5">
                      <span>{formatBytes(drive.freeBytes)} free</span>
                      <span className="text-indigo-400">{formatBytes(drive.totalBytes)} total</span>
                    </div>
                    <div className="w-full bg-[#13113A] h-2.5 rounded-full overflow-hidden p-0.5 border border-indigo-800/40">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usedPct > 85
                            ? 'bg-[#F43F5E]'
                            : usedPct > 60
                            ? 'bg-[#FACC15]'
                            : 'bg-[#4ADE80]'
                        }`}
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-indigo-900/60 flex items-center justify-between text-xs text-indigo-300 font-medium">
                    <span className="font-mono text-[#FACC15] font-bold">R: {formatSpeed(drive.readSpeedMBs)}</span>
                    <span className="font-mono text-[#4ADE80] font-bold">W: {formatSpeed(drive.writeSpeedMBs)}</span>
                    {drive.temperatureC && <span className="font-bold text-white">{drive.temperatureC}°C</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Diagnostics & Suitability Assessment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedDrive ? (
            <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-900/60">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-black text-white">{selectedDrive.label} Diagnostics</h3>
                    {selectedDrive.isRealDevice && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#4ADE80] text-[#1E1B4B] uppercase">
                        Physical Hardware
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2.5 py-1 bg-[#13113A] rounded-lg text-[#FACC15] font-bold border border-indigo-800/40">
                      {selectedDrive.volumeIdentity}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 mt-0.5">{selectedDrive.connectionInterface}</p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedDrive.type !== 'internal' && selectedDrive.isConnected && (
                    <button
                      onClick={() => safeEjectDrive(selectedDrive.id)}
                      className="px-3.5 py-2 bg-[#F43F5E] hover:bg-rose-600 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-md shadow-rose-500/20"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Safe Eject</span>
                    </button>
                  )}

                  {selectedDrive.type !== 'internal' && !selectedDrive.isConnected && (
                    <button
                      onClick={() => toggleDriveConnection(selectedDrive.id)}
                      className="px-3.5 py-2 bg-[#4ADE80] hover:bg-green-400 text-[#1E1B4B] text-xs font-black rounded-xl transition shadow-md shadow-green-500/20"
                    >
                      Mount Device
                    </button>
                  )}

                  {selectedDrive.type !== 'internal' && (
                    <button
                      onClick={() => removeDrive(selectedDrive.id)}
                      title="Remove device from manager"
                      className="p-2 rounded-xl bg-[#F43F5E]/20 hover:bg-[#F43F5E] text-[#F43F5E] hover:text-white transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Suitability Warning Banner if any */}
              {selectedDrive.warningNotice && (
                <div className="p-4 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/40 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#FACC15] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-[#FACC15]">Storage Suitability Notice</h4>
                    <p className="text-xs text-amber-200 leading-relaxed font-medium">{selectedDrive.warningNotice}</p>
                  </div>
                </div>
              )}

              {/* Real-time Hardware Diagnostics Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#13113A] border border-indigo-800/60 shadow-inner">
                  <span className="text-[10px] uppercase font-black text-indigo-300 block tracking-wider">Read Speed</span>
                  <span className="text-base font-black text-[#FACC15] font-mono mt-1 block">
                    {formatSpeed(selectedDrive.readSpeedMBs)}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-medium">Sequential</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#13113A] border border-indigo-800/60 shadow-inner">
                  <span className="text-[10px] uppercase font-black text-indigo-300 block tracking-wider">Write Speed</span>
                  <span className="text-base font-black text-[#4ADE80] font-mono mt-1 block">
                    {formatSpeed(selectedDrive.writeSpeedMBs)}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-medium">Sequential</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#13113A] border border-indigo-800/60 shadow-inner">
                  <span className="text-[10px] uppercase font-black text-indigo-300 block tracking-wider">Latency</span>
                  <span className="text-base font-black text-white font-mono mt-1 block">
                    {selectedDrive.latencyMs} ms
                  </span>
                  <span className="text-[10px] text-indigo-400 font-medium">Random 4K</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#13113A] border border-indigo-800/60 shadow-inner">
                  <span className="text-[10px] uppercase font-black text-indigo-300 block tracking-wider">Temperature</span>
                  <span className="text-base font-black text-[#F43F5E] font-mono mt-1 block">
                    {selectedDrive.temperatureC ? `${selectedDrive.temperatureC}°C` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-medium">SMART Sensor</span>
                </div>
              </div>

              {/* Hardware & Encryption metadata */}
              <div className="p-4 rounded-2xl bg-[#13113A] border border-indigo-800/60 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-indigo-300 font-medium">Hardware Interface:</span>
                  <span className="text-white font-bold">{selectedDrive.connectionInterface}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-300 font-medium">Security Encryption:</span>
                  <span className="text-[#4ADE80] font-black flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    {selectedDrive.encryptionAlgorithm || (selectedDrive.isEncrypted ? 'AES-256 Enabled' : 'Unencrypted')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-300 font-medium">Workspace Manifest Status:</span>
                  <span className="text-[#FACC15] font-bold">
                    {selectedDrive.workspaceInitialized ? 'EWM-Workspace Initialized (v2.4)' : 'Not Initialized'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-300 font-medium">Last Speed Benchmark:</span>
                  <span className="text-indigo-200 font-mono font-bold">{selectedDrive.lastTestedAt || 'Never'}</span>
                </div>
              </div>

              {/* Applications Routed to this Drive */}
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-black text-white">
                  Applications Currently Storing on this Device ({appsOnDrive.length})
                </div>
                {appsOnDrive.length === 0 ? (
                  <p className="text-xs text-indigo-400 italic">No applications currently route data to this destination.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {appsOnDrive.map((app) => (
                      <span
                        key={app.id}
                        className="text-xs px-3 py-1.5 rounded-xl bg-[#25215A] text-white font-bold border border-indigo-700/60 flex items-center gap-2 shadow-sm"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#4ADE80]"></span>
                        {app.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Initialize Workspace button */}
              {!selectedDrive.workspaceInitialized && selectedDrive.isConnected && (
                <div className="pt-3 border-t border-indigo-900/60 flex justify-end">
                  <button
                    onClick={() => initializeWorkspaceOnDrive(selectedDrive.id)}
                    className="px-4 py-2.5 bg-[#6366F1] hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Initialize Standard EWM-Workspace Folder Hierarchy</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#1E1B4B] border border-indigo-900/60 text-center space-y-3 text-white">
              <HardDrive className="w-10 h-10 text-indigo-400 mx-auto" />
              <p className="text-xs text-indigo-300 font-medium">No storage device selected. Use the scanner or register a device.</p>
              <button
                onClick={() => setScannerOpen(true)}
                className="px-4 py-2 bg-[#6366F1] text-white text-xs font-bold rounded-xl"
              >
                Open Storage Scanner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Storage Scanner Modal */}
      <StorageScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
};
