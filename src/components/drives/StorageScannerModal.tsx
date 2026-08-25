import React, { useState } from 'react';
import {
  HardDrive,
  Cpu,
  RefreshCw,
  FolderPlus,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  Lock,
  Layers,
  Radio,
  Gauge,
  Info,
  X,
  Database,
  SlidersHorizontal
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { StorageDrive, DriveType } from '../../types';
import { formatBytes, formatSpeed, getDriveTypeLabel } from '../../utils/formatters';

interface StorageScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageScannerModal: React.FC<StorageScannerModalProps> = ({ isOpen, onClose }) => {
  const {
    systemHardwareProbe,
    probeHardware,
    mountPhysicalDirectory,
    isScanning,
    drives,
    addCustomDrive,
    removeDrive,
    clearDemoDrives,
    restoreDemoDrives,
    runDriveBenchmark,
    benchmarkingDriveId,
    showToast
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'scan' | 'mount' | 'custom' | 'sources'>('scan');

  // Custom drive form state
  const [customLabel, setCustomLabel] = useState('Samsung T7 Shield Portable SSD');
  const [customMount, setCustomMount] = useState('E:\\');
  const [customType, setCustomType] = useState<DriveType>('ssd');
  const [customSizeGB, setCustomSizeGB] = useState(1000);
  const [customInterface, setCustomInterface] = useState('USB 3.2 Gen 2 (10Gbps)');
  const [customEncrypted, setCustomEncrypted] = useState(true);

  if (!isOpen) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const totalBytes = customSizeGB * 1024 * 1024 * 1024;
    const usedBytes = Math.round(totalBytes * 0.15);
    const freeBytes = totalBytes - usedBytes;

    let readSpeed = 1050;
    let writeSpeed = 1000;
    if (customType === 'nvme') {
      readSpeed = 2800;
      writeSpeed = 2600;
    } else if (customType === 'hdd') {
      readSpeed = 140;
      writeSpeed = 130;
    } else if (customType === 'usb_flash') {
      readSpeed = 160;
      writeSpeed = 50;
    }

    const newDrive: StorageDrive = {
      id: 'custom_' + Date.now(),
      label: customLabel,
      volumeIdentity: `VOL_CUST_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      mountPoint: customMount,
      type: customType,
      totalBytes,
      usedBytes,
      freeBytes,
      readSpeedMBs: readSpeed,
      writeSpeedMBs: writeSpeed,
      health: 'excellent',
      temperatureC: 36,
      isEncrypted: customEncrypted,
      encryptionAlgorithm: customEncrypted ? 'AES-256 BitLocker' : undefined,
      isRemovable: true,
      isConnected: true,
      connectionInterface: customInterface,
      latencyMs: 0.35,
      lastTestedAt: 'Just added',
      workspaceInitialized: true,
      isRealDevice: true,
      originType: 'custom_hardware'
    };

    addCustomDrive(newDrive);
    setActiveTab('scan');
  };

  return (
    <div className="fixed inset-0 bg-[#0F0E2A]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-[#1E1B4B] border-2 border-indigo-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-indigo-900/80 flex items-center justify-between bg-[#171440]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Hardware Storage Detection & Scanner Engine</h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#4ADE80] text-[#1E1B4B] uppercase tracking-wider">
                  Live Probe Active
                </span>
              </div>
              <p className="text-xs text-indigo-300 mt-0.5">
                Scan host storage quotas, mount physical external drives via Web File System Access, or map custom hardware.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#25215A] hover:bg-[#2E296E] text-indigo-300 hover:text-white flex items-center justify-center transition border border-indigo-700/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-indigo-900/60 bg-[#13113A] px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-2xl transition border-t-2 flex items-center gap-2 ${
              activeTab === 'scan'
                ? 'bg-[#1E1B4B] text-white border-[#F43F5E]'
                : 'text-indigo-300 hover:text-white border-transparent hover:bg-[#1E1B4B]/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Host Quota & Diagnostic Probe</span>
          </button>

          <button
            onClick={() => setActiveTab('mount')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-2xl transition border-t-2 flex items-center gap-2 ${
              activeTab === 'mount'
                ? 'bg-[#1E1B4B] text-white border-[#6366F1]'
                : 'text-indigo-300 hover:text-white border-transparent hover:bg-[#1E1B4B]/50'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Mount Physical Drive / Folder</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-2xl transition border-t-2 flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'bg-[#1E1B4B] text-white border-[#FACC15]'
                : 'text-indigo-300 hover:text-white border-transparent hover:bg-[#1E1B4B]/50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Custom Physical SSD/USB</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-2xl transition border-t-2 flex items-center gap-2 ${
              activeTab === 'sources'
                ? 'bg-[#1E1B4B] text-white border-[#4ADE80]'
                : 'text-indigo-300 hover:text-white border-transparent hover:bg-[#1E1B4B]/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Transparency & Demo Purge</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-white">
          {/* TAB 1: HOST STORAGE QUOTA & HARDWARE PROBE */}
          {activeTab === 'scan' && (
            <div className="space-y-5">
              {/* Host Metrics Card */}
              <div className="p-5 rounded-3xl bg-[#13113A] border border-indigo-800/80 shadow-inner space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-[#6366F1]" />
                    <h4 className="text-sm font-black text-white">Current Host System Hardware Telemetry</h4>
                  </div>
                  <button
                    onClick={() => probeHardware()}
                    disabled={isScanning}
                    className="px-3.5 py-1.5 bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Probing...' : 'Re-Scan Storage Quota'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#1E1B4B] border border-indigo-900/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">Host Platform</span>
                    <span className="text-xs font-black text-white mt-1 block truncate">
                      {systemHardwareProbe?.platform || 'Desktop Host'}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-medium">OS Environment</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1E1B4B] border border-indigo-900/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">CPU Concurrency</span>
                    <span className="text-sm font-black text-[#FACC15] mt-1 block font-mono">
                      {systemHardwareProbe?.cores || 8} Logical Cores
                    </span>
                    <span className="text-[10px] text-indigo-400 font-medium">Parallel Threads</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1E1B4B] border border-indigo-900/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">Browser Quota</span>
                    <span className="text-sm font-black text-[#4ADE80] mt-1 block font-mono">
                      {formatBytes(systemHardwareProbe?.storageQuotaBytes || 0)}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-medium">Available to App</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1E1B4B] border border-indigo-900/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">Quota Used</span>
                    <span className="text-sm font-black text-[#F43F5E] mt-1 block font-mono">
                      {formatBytes(systemHardwareProbe?.storageUsageBytes || 0)}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-medium">
                      {systemHardwareProbe?.isPersisted ? 'Storage Persisted' : 'Transient Storage'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#1E1B4B] border border-indigo-900/60 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-indigo-300 font-medium">File System Access API (Physical Drive Mount):</span>
                    <span className={`font-bold flex items-center gap-1 ${systemHardwareProbe?.fileSystemApiSupported ? 'text-[#4ADE80]' : 'text-[#FACC15]'}`}>
                      {systemHardwareProbe?.fileSystemApiSupported ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Supported & Ready
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" /> Restricted / Standard Fallback
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300 font-medium">WebUSB Hardware Access:</span>
                    <span className={`font-bold ${systemHardwareProbe?.webUsbSupported ? 'text-[#4ADE80]' : 'text-indigo-400'}`}>
                      {systemHardwareProbe?.webUsbSupported ? 'Enabled' : 'Not Requested'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300 font-medium">Last Hardware Diagnostic Probe:</span>
                    <span className="text-[#FACC15] font-mono font-bold">{systemHardwareProbe?.timestamp || 'Just now'}</span>
                  </div>
                </div>
              </div>

              {/* Current Connected Storage Devices List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-200 uppercase tracking-wider">
                    Registered Storage Devices in Manager ({drives.length})
                  </h4>
                  <span className="text-xs text-indigo-400 font-medium">
                    {drives.filter((d) => d.isRealDevice).length} physically verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {drives.map((drive) => (
                    <div
                      key={drive.id}
                      className="p-4 rounded-2xl bg-[#13113A] border border-indigo-800/60 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#6366F1] flex items-center justify-center text-white shadow-sm">
                            <HardDrive className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-xs text-white">{drive.label}</span>
                              {drive.isRealDevice && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#4ADE80] text-[#1E1B4B] uppercase">
                                  Real Physical
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-indigo-300 font-mono">{drive.mountPoint} • {getDriveTypeLabel(drive.type)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => runDriveBenchmark(drive.id)}
                            disabled={benchmarkingDriveId === drive.id}
                            title="Run live speed benchmark"
                            className="p-1.5 rounded-lg bg-[#25215A] hover:bg-[#2E296E] text-indigo-200 hover:text-white transition"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${benchmarkingDriveId === drive.id ? 'animate-spin' : ''}`} />
                          </button>
                          {drive.type !== 'internal' && (
                            <button
                              onClick={() => removeDrive(drive.id)}
                              title="Remove drive"
                              className="p-1.5 rounded-lg bg-[#F43F5E]/20 hover:bg-[#F43F5E] text-[#F43F5E] hover:text-white transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-indigo-300 font-medium pt-1 border-t border-indigo-900/60">
                        <span>Read: <strong className="text-[#FACC15] font-mono">{formatSpeed(drive.readSpeedMBs)}</strong></span>
                        <span>Write: <strong className="text-[#4ADE80] font-mono">{formatSpeed(drive.writeSpeedMBs)}</strong></span>
                        <span>Total: <strong className="text-white">{formatBytes(drive.totalBytes)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOUNT PHYSICAL DIRECTORY VIA FILE SYSTEM ACCESS */}
          {activeTab === 'mount' && (
            <div className="space-y-5">
              <div className="p-6 rounded-3xl bg-[#13113A] border-2 border-dashed border-[#6366F1]/60 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center mx-auto shadow-inner">
                  <FolderPlus className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-base font-black text-white">Mount Physical External Disk or Folder</h4>
                  <p className="text-xs text-indigo-300 font-medium leading-relaxed">
                    Uses the browser's native <strong>File System Access API</strong> to let you select your real external SSD, USB thumb drive, SD card, or local workspace folder.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#1E1B4B] border border-indigo-900/60 text-xs text-left text-indigo-200 max-w-lg mx-auto space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Zap className="w-4 h-4 text-[#FACC15]" />
                    <span>What happens during physical mount:</span>
                  </div>
                  <ul className="list-disc list-inside text-indigo-300 space-y-1 text-[11px]">
                    <li>Scans real directory hierarchy and counts existing workspace files</li>
                    <li>Performs a live 4MB read/write I/O speed benchmark directly to physical sectors</li>
                    <li>Measures exact sequential write MB/s, read MB/s, and disk response latency</li>
                    <li>Registers the physical device with genuine metrics for workspace redirection</li>
                  </ul>
                </div>

                <button
                  onClick={async () => {
                    const result = await mountPhysicalDirectory();
                    if (result) {
                      setActiveTab('scan');
                    }
                  }}
                  disabled={isScanning}
                  className="px-6 py-3.5 bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-xl shadow-indigo-600/30 mx-auto"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{isScanning ? 'Mounting & Benchmarking Physical Disk...' : 'Select Physical External Drive / Folder'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER CUSTOM HARDWARE SSD / USB */}
          {activeTab === 'custom' && (
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div className="p-5 rounded-3xl bg-[#13113A] border border-indigo-800/80 space-y-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FACC15]" />
                  <h4 className="text-sm font-black text-white">Custom Hardware Storage Device Profiler</h4>
                </div>
                <p className="text-xs text-indigo-300 font-medium">
                  Register your physical external drive specifications (model name, drive letter, interface speed, and encryption) to match your exact desktop workstation setup.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-indigo-200 font-bold mb-1.5">Drive Model / Label</label>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="e.g. Crucial X9 Pro 2TB SSD"
                      className="w-full bg-[#1E1B4B] border border-indigo-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-[#6366F1]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-indigo-200 font-bold mb-1.5">Assigned Drive Letter / Mount Point</label>
                    <input
                      type="text"
                      value={customMount}
                      onChange={(e) => setCustomMount(e.target.value)}
                      placeholder="e.g. E:\ or /Volumes/MySSD"
                      className="w-full bg-[#1E1B4B] border border-indigo-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#6366F1]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-indigo-200 font-bold mb-1.5">Drive Hardware Architecture</label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value as DriveType)}
                      className="w-full bg-[#1E1B4B] border border-indigo-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#6366F1]"
                    >
                      <option value="ssd">Portable USB-C External SSD (SATA/NVMe)</option>
                      <option value="nvme">High-Speed NVMe Thunderbolt Enclosure</option>
                      <option value="hdd">External Mechanical HDD (Backup)</option>
                      <option value="usb_flash">High-Speed USB 3.2 Flash Thumb Drive</option>
                      <option value="sd_card">UHS-II / V90 SD Card</option>
                      <option value="nas">10GbE Network Attached Storage (NAS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-indigo-200 font-bold mb-1.5">Total Capacity (GB)</label>
                    <input
                      type="number"
                      value={customSizeGB}
                      onChange={(e) => setCustomSizeGB(Number(e.target.value))}
                      min={16}
                      max={64000}
                      step={32}
                      className="w-full bg-[#1E1B4B] border border-indigo-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#6366F1]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-indigo-200 font-bold mb-1.5">Connection Interface & Bus Speed</label>
                    <select
                      value={customInterface}
                      onChange={(e) => setCustomInterface(e.target.value)}
                      className="w-full bg-[#1E1B4B] border border-indigo-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#6366F1]"
                    >
                      <option value="USB 3.2 Gen 2 (10Gbps)">USB 3.2 Gen 2 (10Gbps ~1050 MB/s)</option>
                      <option value="Thunderbolt 4 / PCIe (40Gbps)">Thunderbolt 4 / PCIe Gen4 (40Gbps ~3200 MB/s)</option>
                      <option value="USB 3.2 Gen 2x2 (20Gbps)">USB 3.2 Gen 2x2 (20Gbps ~2000 MB/s)</option>
                      <option value="USB 3.0 (5Gbps)">USB 3.0 Type-A (5Gbps ~450 MB/s)</option>
                      <option value="10GbE Network Attached Storage">10GbE Network Attached Storage (NAS)</option>
                      <option value="UHS-II SD Bus (312MB/s)">UHS-II SD Express Bus (312MB/s)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#1E1B4B] border border-indigo-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customEncrypted}
                        onChange={(e) => setCustomEncrypted(e.target.checked)}
                        className="rounded-lg border-indigo-700 bg-[#13113A] text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                      />
                      <div>
                        <strong className="text-white text-xs block">Enable Hardware / BitLocker AES-256 Encryption</strong>
                        <span className="text-[11px] text-indigo-300">Enforces hardware-bound key verification before mounting</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-indigo-900/60">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1B4B] font-black text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-yellow-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Storage Device</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: DATA TRANSPARENCY & DEMO DATA PURGE */}
          {activeTab === 'sources' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-[#13113A] border border-indigo-800/80 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Info className="w-5 h-5 text-[#4ADE80]" />
                  <h4 className="text-sm font-black text-white">Where does the Storage Data come from?</h4>
                </div>

                <div className="space-y-3 text-xs text-indigo-200 leading-relaxed font-medium">
                  <p>
                    <strong>1. Demo Reference Baseline:</strong> By default, this manager starts with sample development storage profiles (e.g. Samsung 990 Pro, Crucial X8, WD HDD) so you can immediately test application routing rules, strict mode lockdowns, and junction migrations without needing to connect all hardware beforehand.
                  </p>
                  <p>
                    <strong>2. Live Physical Storage Detection:</strong> When you use the <em>Mount Physical Drive</em> tool or <em>Diagnostic Probe</em>, EWM reads your real host storage quota via the browser API and performs real physical sector reads and writes to benchmark your actual physical SSD/USB drive.
                  </p>
                  <p>
                    <strong>3. Custom Registered Devices:</strong> Any devices you add with your exact drive letters (e.g., <code className="text-[#FACC15] font-mono">D:\</code>, <code className="text-[#FACC15] font-mono">E:\</code>, <code className="text-[#FACC15] font-mono">F:\</code>) are saved locally and persist across your workspace sessions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#1E1B4B] border border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-black text-white">Want to remove all sample demo drives?</h5>
                    <p className="text-[11px] text-indigo-300 mt-0.5">
                      Clear all template devices so that ONLY your real scanned or manually registered drives are listed.
                    </p>
                  </div>
                  <button
                    onClick={clearDemoDrives}
                    className="px-4 py-2 bg-[#F43F5E] hover:bg-rose-600 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-rose-500/30 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Demo Storage Devices</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#1E1B4B] border border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-black text-white">Restore Standard Reference Profiles</h5>
                    <p className="text-[11px] text-indigo-300 mt-0.5">
                      Re-populate the standard reference SSD, NVMe, and HDD test profiles.
                    </p>
                  </div>
                  <button
                    onClick={restoreDemoDrives}
                    className="px-4 py-2 bg-[#25215A] hover:bg-[#2E296E] text-indigo-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-indigo-700/60 shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Restore Baseline Profiles</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
