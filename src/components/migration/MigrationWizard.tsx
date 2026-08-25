import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  HardDrive,
  FolderSync,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  FolderPlus,
  Play,
  Check,
  Zap,
  Info,
  Edit3,
  FolderTree,
  Sliders
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes } from '../../utils/formatters';
import { StorageScannerModal } from '../drives/StorageScannerModal';
import { MigrationProgressModal } from './MigrationProgressModal';
import { cleanAppFolderPath, createAppSubfolderPath, mirrorOriginalPath, FolderNamingStrategy } from '../../utils/pathUtils';

export const MigrationWizard: React.FC = () => {
  const { applications, drives, migrateLocation, rollbackLocation, showToast } = useWorkspace();
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id);
  const [selectedTargetDriveId, setSelectedTargetDriveId] = useState<string>(
    drives.find((d) => d.type !== 'internal')?.id || drives[0]?.id
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  // Global folder naming strategy for migrations (Default: app_folder_default -> D:\AppName\Folder)
  const [namingStrategy, setNamingStrategy] = useState<FolderNamingStrategy>('app_folder_default');

  // Per-location custom path overrides state
  const [customPathOverrides, setCustomPathOverrides] = useState<Record<string, string>>({});
  const [editingLocationName, setEditingLocationName] = useState<string | null>(null);
  const [newSubfolderInput, setNewSubfolderInput] = useState<Record<string, string>>({});

  // Active migration modal state
  const [activeMigration, setActiveMigration] = useState<{
    appName: string;
    locationName: string;
    sourcePath: string;
    initialTargetPath: string;
    targetMountPoint: string;
    targetDriveLabel: string;
    sizeBytes: number;
    targetDriveId: string;
  } | null>(null);

  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];
  const targetDrive = drives.find((d) => d.id === selectedTargetDriveId) || drives[0];

  const realDrives = drives.filter(
    (d) => d.type !== 'internal' && (d.isRealDevice || d.originType === 'custom_hardware' || d.originType === 'real_filesystem')
  );
  const demoDrives = drives.filter(
    (d) => d.type !== 'internal' && !d.isRealDevice && d.originType !== 'custom_hardware' && d.originType !== 'real_filesystem'
  );

  // Helper to compute target path for a given location based on settings/overrides
  const getComputedTargetPath = (loc: { name: string; originalPath: string; targetPath?: string }) => {
    if (customPathOverrides[loc.name]) {
      return customPathOverrides[loc.name];
    }
    if (loc.targetPath && loc.targetPath.startsWith(targetDrive.mountPoint)) {
      return loc.targetPath;
    }
    if (namingStrategy === 'mirror_original') {
      return mirrorOriginalPath(loc.originalPath, targetDrive.mountPoint);
    }
    // Default: Clean concise path: D:\[AppName]\[FolderName]
    return cleanAppFolderPath(selectedApp.name, loc.originalPath, loc.name, targetDrive.mountPoint);
  };

  const handleScan = () => {
    setIsScanning(true);
    showToast(`Scanning storage footprints and registry anchors for ${selectedApp.name}...`, 'info');
    setTimeout(() => {
      setIsScanning(false);
      showToast(`Scan complete: Discovered ${selectedApp.defaultLocations.length} storage folders.`, 'success');
    }, 1200);
  };

  const handleStartMigration = (loc: any) => {
    const computedTarget = getComputedTargetPath(loc);

    setActiveMigration({
      appName: selectedApp.name,
      locationName: loc.name,
      sourcePath: loc.originalPath,
      initialTargetPath: computedTarget,
      targetMountPoint: targetDrive.mountPoint,
      targetDriveLabel: targetDrive.label,
      sizeBytes: loc.sizeBytes,
      targetDriveId: selectedTargetDriveId
    });
  };

  const handleMigrateAll = () => {
    const totalBytes = selectedApp.defaultLocations.reduce((sum, l) => sum + l.sizeBytes, 0);

    setActiveMigration({
      appName: selectedApp.name,
      locationName: `All Folders (${selectedApp.defaultLocations.length} Locations)`,
      sourcePath: `C:\\...\\${selectedApp.name}\\*`,
      initialTargetPath: `${targetDrive.mountPoint}Users\\User\\AppData\\...`,
      targetMountPoint: targetDrive.mountPoint,
      targetDriveLabel: targetDrive.label,
      sizeBytes: totalBytes,
      targetDriveId: selectedTargetDriveId
    });
  };

  const handleMigrationComplete = (finalConfirmedPath: string) => {
    if (activeMigration) {
      if (activeMigration.locationName.startsWith('All Folders')) {
        selectedApp.defaultLocations.forEach((loc) => {
          const path = getComputedTargetPath(loc);
          migrateLocation(selectedApp.id, loc.name, activeMigration.targetDriveId, path);
        });
        showToast(`Migrated all folders for ${selectedApp.name} to ${activeMigration.targetDriveLabel}`, 'success');
      } else {
        migrateLocation(selectedApp.id, activeMigration.locationName, activeMigration.targetDriveId, finalConfirmedPath);
        showToast(`Migrated ${activeMigration.locationName} to ${finalConfirmedPath}`, 'success');
      }
    }
  };

  const getSafetyBadge = (status: string) => {
    switch (status) {
      case 'safe_to_redirect':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#4ADE80] text-[#1E1B4B] uppercase tracking-wider">
            1. Safe to Redirect
          </span>
        );
      case 'safe_to_move':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#6366F1] text-white uppercase tracking-wider">
            2. Safe to Move
          </span>
        );
      case 'requires_restart':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FACC15] text-[#1E1B4B] uppercase tracking-wider">
            3. Requires Restart
          </span>
        );
      case 'requires_admin':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#F43F5E] text-white uppercase tracking-wider">
            4. Requires Admin
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-900 text-white uppercase tracking-wider">
            5. Unsafe / Fixed
          </span>
        );
    }
  };

  const allRedirected = selectedApp.defaultLocations.every((l) => l.isRedirected);
  const totalSizeBytes = selectedApp.defaultLocations.reduce((acc, l) => acc + l.sizeBytes, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-md">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">Application Onboarding & Migration Wizard</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Safely relocate heavy application data to external drives. By default, folders are created concisely as <span className="font-mono text-[#4ADE80] font-bold">D:\[App Name]\[Folder]</span> with options to create custom subfolders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-4 py-2.5 bg-indigo-900/80 hover:bg-indigo-800 disabled:opacity-50 text-indigo-200 hover:text-white font-bold text-xs rounded-2xl transition flex items-center gap-2 border border-indigo-700/60"
          >
            <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning AppData...' : 'Deep Scan Application'}</span>
          </button>

          <button
            onClick={handleMigrateAll}
            className="px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#4ADE80] hover:brightness-110 text-white font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Zap className="w-4 h-4 text-[#FACC15] fill-[#FACC15]" />
            <span>{allRedirected ? 'Re-Migrate All Folders' : `Migrate All to ${targetDrive.mountPoint} (${formatBytes(totalSizeBytes)})`}</span>
          </button>
        </div>
      </div>

      {/* Global Folder Naming Strategy Configuration Bar */}
      <div className="p-4.5 bg-[#1E1B4B] rounded-3xl border border-indigo-900/60 shadow-lg shadow-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-900/90 flex items-center justify-center text-[#4ADE80] shrink-0 border border-indigo-700/60">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-2">
              <span>Target Folder Naming Policy:</span>
              <span className="text-[#4ADE80] font-mono font-bold">
                {namingStrategy === 'app_folder_default'
                  ? `${targetDrive.mountPoint}[AppName]\\[Folder] (Default Clean App Folder)`
                  : namingStrategy === 'custom'
                  ? 'Custom Folder Names'
                  : 'Mirror Full Path'}
              </span>
            </div>
            <p className="text-[11px] text-indigo-300">
              By default uses short app folder names (e.g. <span className="font-mono text-white">{targetDrive.mountPoint}{selectedApp.name}\Cache</span>), or create custom subfolders.
            </p>
          </div>
        </div>

        {/* Strategy Selector Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setNamingStrategy('app_folder_default')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              namingStrategy === 'app_folder_default'
                ? 'bg-[#4ADE80] text-[#1E1B4B] font-black border-[#4ADE80] shadow-md shadow-emerald-600/20'
                : 'bg-[#13113A] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>App Folder: {targetDrive.mountPoint}[App]\[Folder] (Default)</span>
          </button>

          <button
            onClick={() => setNamingStrategy('custom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              namingStrategy === 'custom'
                ? 'bg-[#FACC15] text-[#1E1B4B] font-black border-[#FACC15] shadow-md'
                : 'bg-[#13113A] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Custom Names / New Subfolder</span>
          </button>

          <button
            onClick={() => setNamingStrategy('mirror_original')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              namingStrategy === 'mirror_original'
                ? 'bg-[#6366F1] text-white font-black border-[#6366F1] shadow-md shadow-indigo-600/30'
                : 'bg-[#13113A] text-indigo-300 hover:text-white border-indigo-800/60'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Mirror Full Path</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: App Selector & Target Destination Setup (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* App Selector Card */}
          <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-5 shadow-xl shadow-indigo-950/30 space-y-3.5">
            <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Select Application to Onboard</h3>
            <div className="space-y-2">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setEditingLocationName(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs transition ${
                    selectedAppId === app.id
                      ? 'bg-[#6366F1] text-white font-black shadow-lg shadow-indigo-600/30'
                      : 'bg-[#13113A] text-indigo-200 hover:bg-[#25215A] border border-indigo-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-bold">{app.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                      selectedAppId === app.id ? 'bg-white text-[#1E1B4B]' : 'bg-[#25215A] text-indigo-300'
                    }`}
                  >
                    {app.compatibility.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Migration Target Volume Selector */}
          <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-5 shadow-xl shadow-indigo-950/30 space-y-3.5">
            <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Destination External Drive</h3>
            <select
              value={selectedTargetDriveId}
              onChange={(e) => {
                if (e.target.value === '__MOUNT_NEW__') {
                  setScannerModalOpen(true);
                  return;
                }
                setSelectedTargetDriveId(e.target.value);
              }}
              className="w-full bg-[#13113A] border border-indigo-700/60 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366F1] font-bold"
            >
              {realDrives.length > 0 && (
                <optgroup label="— Physical Hardware & Real Drives —">
                  {realDrives.map((d) => (
                    <option key={d.id} value={d.id}>
                      🟢 {d.label} ({d.mountPoint}) {d.isRealDevice ? '[REAL]' : ''} - {formatBytes(d.freeBytes)} Free
                    </option>
                  ))}
                </optgroup>
              )}

              {demoDrives.length > 0 && (
                <optgroup label="— Sample Starter Profiles —">
                  {demoDrives.map((d) => (
                    <option key={d.id} value={d.id}>
                      📦 {d.label} ({d.mountPoint}) - [Sample]
                    </option>
                  ))}
                </optgroup>
              )}

              <option value="__MOUNT_NEW__">➕ Mount Real Folder / Drive...</option>
            </select>
            <div className="p-3.5 bg-[#13113A] rounded-2xl border border-indigo-800/60 text-xs text-indigo-200 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-[#4ADE80] font-black">
                <ShieldCheck className="w-4 h-4" />
                <span>Transactional Safety Assured</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                EWM creates a pre-migration rollback checkpoint and performs SHA-256 hash checks before removing any internal file.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Discovered Storage Locations & Junction Controls (8 cols) */}
        <div className="lg:col-span-8 bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-indigo-900/60">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FolderSync className="w-4 h-4 text-[#FACC15]" />
                Discovered Storage Locations for {selectedApp.name}
              </h3>
              <p className="text-xs text-indigo-300 mt-0.5">Review folder locations, customize target names, and create junctions</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleMigrateAll}
                className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Migrate All ({selectedApp.defaultLocations.length})</span>
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            {selectedApp.defaultLocations.map((loc) => {
              const currentTargetPath = getComputedTargetPath(loc);
              const isEditing = editingLocationName === loc.name;

              return (
                <div
                  key={loc.name}
                  className={`p-4.5 rounded-2xl border transition-all ${
                    loc.isRedirected
                      ? 'bg-[#13113A] border-[#4ADE80]/50 shadow-md shadow-emerald-950/20'
                      : 'bg-[#13113A] border-indigo-800/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-black text-xs text-white">{loc.name}</span>
                        {getSafetyBadge(loc.safetyStatus)}
                        {loc.isRedirected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-[#4ADE80] border border-emerald-500/40 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Active on {targetDrive.label}</span>
                          </span>
                        )}
                      </div>

                      {/* Source Path */}
                      <div className="text-[11px] font-mono text-indigo-300 break-all">
                        <span className="text-indigo-400 font-bold">Source (C:\): </span>
                        {loc.originalPath}
                      </div>

                      {/* Target Path Display */}
                      <div className="text-[11px] font-mono text-[#4ADE80] break-all flex items-center gap-1.5 font-bold">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[#FACC15]" />
                        <span>Target ({targetDrive.mountPoint}): </span>
                        <span className="text-white">{currentTargetPath}</span>
                        <button
                          type="button"
                          onClick={() => setEditingLocationName(isEditing ? null : loc.name)}
                          className="ml-2 px-2 py-0.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-[#FACC15] hover:text-yellow-300 text-[10px] font-sans font-bold flex items-center gap-1 transition"
                          title="Rename or create new folder"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{isEditing ? 'Close' : 'Rename / New Folder'}</span>
                        </button>
                      </div>

                      {/* Inline Custom Folder Editor */}
                      {isEditing && (
                        <div className="mt-2.5 p-3.5 bg-[#1E1B4B] rounded-xl border border-indigo-700/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                              Target Folder on {targetDrive.label}:
                            </label>
                            <span className="text-[10px] text-[#4ADE80] font-bold">
                              ✓ Automatic directory creation
                            </span>
                          </div>
                          
                          <input
                            type="text"
                            value={customPathOverrides[loc.name] || currentTargetPath}
                            onChange={(e) =>
                              setCustomPathOverrides((prev) => ({
                                ...prev,
                                [loc.name]: e.target.value
                              }))
                            }
                            className="w-full px-3 py-2 bg-[#13113A] border border-indigo-600 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#4ADE80]"
                          />

                          {/* Quick subfolder creation inside App folder */}
                          <div className="p-2.5 bg-[#13113A] rounded-lg border border-indigo-800/80 space-y-2">
                            <div className="text-[10px] font-bold text-indigo-300 flex items-center justify-between">
                              <span>Create New Subfolder inside <span className="text-white font-mono">{targetDrive.mountPoint}{selectedApp.name}\</span>:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="e.g. Custom_Data or Work_Cache"
                                value={newSubfolderInput[loc.name] || ''}
                                onChange={(e) =>
                                  setNewSubfolderInput((prev) => ({
                                    ...prev,
                                    [loc.name]: e.target.value
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newSubfolderInput[loc.name]?.trim()) {
                                    const customP = createAppSubfolderPath(selectedApp.name, newSubfolderInput[loc.name].trim(), targetDrive.mountPoint);
                                    setCustomPathOverrides((prev) => ({ ...prev, [loc.name]: customP }));
                                    setNewSubfolderInput((prev) => ({ ...prev, [loc.name]: '' }));
                                  }
                                }}
                                className="flex-1 px-2.5 py-1.5 bg-[#1E1B4B] border border-indigo-700 rounded-md text-xs font-mono text-white placeholder-indigo-500 focus:outline-none focus:border-[#FACC15]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const name = newSubfolderInput[loc.name]?.trim() || 'New_Folder';
                                  const customP = createAppSubfolderPath(selectedApp.name, name, targetDrive.mountPoint);
                                  setCustomPathOverrides((prev) => ({ ...prev, [loc.name]: customP }));
                                  setNewSubfolderInput((prev) => ({ ...prev, [loc.name]: '' }));
                                }}
                                className="px-3 py-1.5 rounded-md bg-[#6366F1] hover:bg-indigo-500 text-white text-[11px] font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                              >
                                <FolderPlus className="w-3.5 h-3.5" />
                                <span>Create Subfolder</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const clean = cleanAppFolderPath(selectedApp.name, loc.originalPath, loc.name, targetDrive.mountPoint);
                                setCustomPathOverrides((prev) => ({ ...prev, [loc.name]: clean }));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-950 text-[#4ADE80] hover:bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Reset to Default App Folder ({targetDrive.mountPoint}{selectedApp.name}\...)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const same = mirrorOriginalPath(loc.originalPath, targetDrive.mountPoint);
                                setCustomPathOverrides((prev) => ({ ...prev, [loc.name]: same }));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-700/60 text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <span>Mirror Original Path</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#FACC15] font-mono block">
                        {formatBytes(loc.sizeBytes)}
                      </span>
                      <span className="text-[10px] text-indigo-400 uppercase font-bold">{loc.suggestedCategory}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
                      <span className={`w-2.5 h-2.5 rounded-full ${loc.isRedirected ? 'bg-[#4ADE80] animate-pulse' : 'bg-indigo-600'}`} />
                      <span>{loc.isRedirected ? 'NTFS Junction Link Active (C:\\ ➔ D:\\)' : 'Located on Laptop Internal SSD (C:\\)'}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {loc.isRedirected ? (
                        <>
                          <button
                            onClick={() => handleStartMigration(loc)}
                            className="px-3.5 py-1.5 bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                            title="Re-run migration or update destination drive/folder"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Re-Migrate to {targetDrive.mountPoint}</span>
                          </button>
                          <button
                            onClick={() => rollbackLocation(selectedApp.id, loc.name)}
                            className="px-3.5 py-1.5 bg-[#25215A] hover:bg-[#2E296E] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#FACC15]" />
                            <span>Rollback to C:\</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartMigration(loc)}
                          disabled={loc.safetyStatus === 'unsafe'}
                          className="px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#4ADE80] hover:brightness-110 disabled:opacity-50 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Migrate & Create Junction</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Storage Scanner Modal */}
      <StorageScannerModal isOpen={scannerModalOpen} onClose={() => setScannerModalOpen(false)} />

      {/* Live Migration Progress Modal */}
      {activeMigration && (
        <MigrationProgressModal
          isOpen={!!activeMigration}
          onClose={() => setActiveMigration(null)}
          appName={activeMigration.appName}
          locationName={activeMigration.locationName}
          sourcePath={activeMigration.sourcePath}
          initialTargetPath={activeMigration.initialTargetPath}
          targetMountPoint={activeMigration.targetMountPoint}
          targetDriveLabel={activeMigration.targetDriveLabel}
          sizeBytes={activeMigration.sizeBytes}
          onComplete={handleMigrationComplete}
        />
      )}
    </div>
  );
};
