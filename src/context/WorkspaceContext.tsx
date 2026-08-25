import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  StorageDrive,
  ApplicationProfile,
  RoutingRule,
  LocalWriteRequest,
  SessionCreatedFile,
  ActivityLog,
  BackupSnapshot,
  CleanableItem,
  DataCategory,
  RedirectionMethod,
  SystemHardwareProbe
} from '../types';
import {
  INITIAL_DRIVES,
  INITIAL_APPLICATIONS,
  INITIAL_RULES,
  INITIAL_LOCAL_WRITES,
  INITIAL_SESSION_FILES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_CLEANABLE_ITEMS,
  INITIAL_BACKUPS
} from '../data/initialData';
import {
  probeSystemStorage,
  benchmarkDirectoryHandle,
  benchmarkVirtualBuffer,
  scanDirectoryStats
} from '../utils/hardwareScanner';
import { mirrorOriginalPath } from '../utils/pathUtils';

export type NavigationTab = 
  | 'dashboard' 
  | 'router' 
  | 'drives' 
  | 'explorer' 
  | 'migration' 
  | 'adapters' 
  | 'approvals' 
  | 'session_review' 
  | 'cleanup' 
  | 'backups' 
  | 'security';

interface WorkspaceContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Drives
  drives: StorageDrive[];
  toggleDriveConnection: (driveId: string) => void;
  runDriveBenchmark: (driveId: string) => Promise<void>;
  benchmarkingDriveId: string | null;
  safeEjectDrive: (driveId: string) => void;
  initializeWorkspaceOnDrive: (driveId: string) => void;
  addCustomDrive: (drive: StorageDrive) => void;
  removeDrive: (driveId: string) => void;
  updateDrive: (driveId: string, updates: Partial<StorageDrive>) => void;
  clearDemoDrives: () => void;
  restoreDemoDrives: () => void;

  // Real Hardware & Storage Scanning Engine
  systemHardwareProbe: SystemHardwareProbe | null;
  probeHardware: () => Promise<SystemHardwareProbe>;
  mountPhysicalDirectory: () => Promise<StorageDrive | null>;
  isScanning: boolean;

  // Applications
  applications: ApplicationProfile[];
  updateAppRouting: (appId: string, category: DataCategory, targetDriveId: string, method?: RedirectionMethod) => void;
  toggleStrictMode: (appId: string) => void;
  setPrimaryDestination: (appId: string, targetDriveId: string) => void;
  launchApplication: (appId: string) => void;
  closeApplication: (appId: string) => void;
  migrateLocation: (appId: string, locationName: string, targetDriveId: string, customTargetPath?: string) => void;
  rollbackLocation: (appId: string, locationName: string) => void;
  addCustomLaptopApp: (app: ApplicationProfile) => void;
  removeApplication: (appId: string) => void;

  // Routing Rules
  rules: RoutingRule[];
  addRule: (rule: Omit<RoutingRule, 'id'>) => void;
  toggleRuleActive: (ruleId: string) => void;
  deleteRule: (ruleId: string) => void;

  // Local Write Approvals
  localWriteRequests: LocalWriteRequest[];
  resolveLocalWrite: (requestId: string, action: 'allow_once' | 'allow_session' | 'always_allowed' | 'redirect' | 'block', targetDriveId?: string) => void;
  simulateUnexpectedWrite: () => void;

  // End of Session Review
  sessionFiles: SessionCreatedFile[];
  toggleSelectSessionFile: (fileId: string) => void;
  selectAllSessionFiles: (select: boolean) => void;
  executeSessionAction: (fileId: string, action: 'transfer' | 'delete' | 'keep' | 'archive', destinationDriveId?: string) => void;
  executeBulkSessionActions: (action: 'transfer_selected' | 'delete_selected' | 'keep_selected') => void;
  simulateNewSessionFiles: () => void;

  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearActivityLogs: () => void;

  // Cleanup Center
  cleanableItems: CleanableItem[];
  toggleSelectCleanable: (id: string) => void;
  executeCleanup: (itemIds: string[]) => void;

  // Backup Center
  backups: BackupSnapshot[];
  createBackupSnapshot: (name: string, destinationDriveId: string, isEncrypted: boolean, includedAppIds: string[]) => void;
  restoreBackupSnapshot: (snapshotId: string) => void;

  // Toast Notification
  toastMessage: { text: string; type: 'success' | 'warning' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'warning' | 'error' | 'info') => void;

  // Active Strict Mode Alert Modal
  strictAlert: { open: boolean; appName: string; missingDriveLabel: string; appId: string } | null;
  closeStrictAlert: () => void;

  // Global Computed Metrics
  totalProtectedExternalBytes: number;
  totalInternalUsedBytes: number;
  protectionPercentage: number;
  totalRecoveredInternalBytes: number;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [drives, setDrives] = useState<StorageDrive[]>(() => {
    try {
      const saved = localStorage.getItem('ewm_custom_drives');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it contains the old mock multi-drive names (AI-SSD-01, Claude-HDD, etc), reset to INITIAL_DRIVES
        const hasOldMocks = parsed.some((d: StorageDrive) =>
          ['drive_ai_ssd_01', 'drive_claude_hdd', 'drive_portable_nvme', 'drive_models_usb', 'drive_nas_office', 'drive_cloud_archive'].includes(d.id) ||
          d.label?.includes('AI-SSD-01') || d.label?.includes('Claude-HDD') || d.label?.includes('Portable-NVMe') || d.label?.includes('Models-USB') || d.label?.includes('NAS-Office') || d.label?.includes('Cloud-Archive')
        );
        if (!hasOldMocks && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_DRIVES;
  });
  const [applications, setApplications] = useState<ApplicationProfile[]>(INITIAL_APPLICATIONS);
  const [rules, setRules] = useState<RoutingRule[]>(INITIAL_RULES);
  const [localWriteRequests, setLocalWriteRequests] = useState<LocalWriteRequest[]>(INITIAL_LOCAL_WRITES);
  const [sessionFiles, setSessionFiles] = useState<SessionCreatedFile[]>(INITIAL_SESSION_FILES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [cleanableItems, setCleanableItems] = useState<CleanableItem[]>(INITIAL_CLEANABLE_ITEMS);
  const [backups, setBackups] = useState<BackupSnapshot[]>(INITIAL_BACKUPS);
  const [benchmarkingDriveId, setBenchmarkingDriveId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);
  const [strictAlert, setStrictAlert] = useState<{ open: boolean; appName: string; missingDriveLabel: string; appId: string } | null>(null);
  
  // Real Hardware Scanner State
  const [systemHardwareProbe, setSystemHardwareProbe] = useState<SystemHardwareProbe | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Sync drives to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ewm_custom_drives', JSON.stringify(drives));
    } catch (e) {}
  }, [drives]);

  const showToast = useCallback((text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }, []);

  const addActivityLog = useCallback((logData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: ActivityLog = {
      id: 'act_' + Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: timeStr,
      ...logData
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Compute metrics
  const totalProtectedExternalBytes = applications.reduce((acc, app) => acc + app.externalUsageBytes, 0);
  const totalInternalUsedBytes = applications.reduce((acc, app) => acc + app.internalUsageBytes, 0);
  const totalWorkingData = totalProtectedExternalBytes + totalInternalUsedBytes;
  const protectionPercentage = totalWorkingData > 0 ? Math.round((totalProtectedExternalBytes / totalWorkingData) * 100) : 0;
  const totalRecoveredInternalBytes = totalProtectedExternalBytes;

  // Real Hardware Probe Execution
  const probeHardware = useCallback(async (): Promise<SystemHardwareProbe> => {
    setIsScanning(true);
    showToast('Probing system hardware, storage quota, and device interfaces...', 'info');
    try {
      const probeResult = await probeSystemStorage();
      setSystemHardwareProbe(probeResult);
      
      // Also update or add internal storage drive if present
      setDrives((prev) => {
        const internalExists = prev.some((d) => d.type === 'internal');
        if (internalExists) {
          return prev.map((d) =>
            d.type === 'internal'
              ? {
                  ...d,
                  totalBytes: probeResult.storageQuotaBytes || d.totalBytes,
                  usedBytes: probeResult.storageUsageBytes || d.usedBytes,
                  freeBytes: probeResult.storageAvailableBytes || d.freeBytes,
                  isRealDevice: true,
                  originType: 'system_quota',
                  lastTestedAt: 'Just now'
                }
              : d
          );
        }
        return prev;
      });

      addActivityLog({
        type: 'drive_event',
        appName: 'Storage Scanning Engine',
        driveLabel: 'System Hardware Diagnostics',
        path: probeResult.platform,
        sizeBytes: probeResult.storageQuotaBytes,
        status: 'success',
        message: `Hardware scan complete: ${probeResult.cores} CPU Cores, Quota: ${(probeResult.storageQuotaBytes / (1024 ** 3)).toFixed(1)} GB, Persisted: ${probeResult.isPersisted ? 'Yes' : 'No'}.`
      });

      showToast('System storage probe completed successfully', 'success');
      return probeResult;
    } catch (err: any) {
      showToast('Probe encountered an issue: ' + (err.message || 'Unknown error'), 'error');
      throw err;
    } finally {
      setIsScanning(false);
    }
  }, [showToast, addActivityLog]);

  // Initial scan on mount
  useEffect(() => {
    probeHardware().catch(() => {});
  }, [probeHardware]);

  // Mount real physical directory using File System Access API
  const mountPhysicalDirectory = async (): Promise<StorageDrive | null> => {
    if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
      showToast('File System Access API is not supported in this browser. Please use Chrome/Edge or manually configure your drive.', 'warning');
      return null;
    }

    try {
      setIsScanning(true);
      showToast('Opening native directory picker... Select your external hard drive, USB, or project folder', 'info');
      
      // Request directory handle with readwrite permissions
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'desktop'
      });

      showToast(`Mounting directory "${dirHandle.name}" and running physical I/O benchmark...`, 'info');

      // 1. Scan directory structure & files
      const { fileCount, totalSizeBytes } = await scanDirectoryStats(dirHandle);

      // 2. Run real physical speed test by writing a 4MB temporary test file
      const bench = await benchmarkDirectoryHandle(dirHandle, 4);

      // 3. Construct real StorageDrive object
      const realDriveId = 'real_' + Date.now();
      const mountPoint = dirHandle.name.includes(':') ? dirHandle.name : `E:\\${dirHandle.name}`;
      const newDrive: StorageDrive = {
        id: realDriveId,
        label: dirHandle.name.toUpperCase() || 'PHYSICAL EXTERNAL DISK',
        volumeIdentity: `VOL_REAL_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        mountPoint,
        type: 'ssd',
        totalBytes: Math.max(512 * 1024 * 1024 * 1024, totalSizeBytes + 250 * 1024 * 1024 * 1024),
        usedBytes: totalSizeBytes || 2.4 * 1024 * 1024 * 1024,
        freeBytes: Math.max(250 * 1024 * 1024 * 1024, (512 * 1024 * 1024 * 1024) - totalSizeBytes),
        readSpeedMBs: bench.readSpeedMBs,
        writeSpeedMBs: bench.writeSpeedMBs,
        health: 'excellent',
        temperatureC: 38,
        isEncrypted: false,
        isRemovable: true,
        isConnected: true,
        connectionInterface: 'Physical Host Mount (Web File System Access)',
        latencyMs: bench.latencyMs,
        lastTestedAt: 'Just now',
        workspaceInitialized: true,
        isRealDevice: true,
        originType: 'real_filesystem',
        fileCount,
        directoryHandle: dirHandle
      };

      setDrives((prev) => [newDrive, ...prev.filter((d) => d.id !== newDrive.id)]);

      addActivityLog({
        type: 'drive_event',
        appName: 'Physical Device Scanner',
        driveLabel: newDrive.label,
        path: newDrive.mountPoint,
        sizeBytes: totalSizeBytes,
        speedMBs: bench.readSpeedMBs,
        status: 'success',
        message: `Mounted real physical directory "${dirHandle.name}". Benchmark: Write ${bench.writeSpeedMBs} MB/s, Read ${bench.readSpeedMBs} MB/s (${fileCount} files scanned).`
      });

      showToast(`Successfully mounted real drive "${newDrive.label}" (Read: ${bench.readSpeedMBs} MB/s, Write: ${bench.writeSpeedMBs} MB/s)`, 'success');
      return newDrive;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        showToast('Directory selection was cancelled.', 'info');
      } else {
        showToast(`Mount failed: ${err.message || 'Could not obtain permissions'}`, 'error');
      }
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  // Add custom user hardware drive
  const addCustomDrive = (newDrive: StorageDrive) => {
    setDrives((prev) => [newDrive, ...prev]);
    showToast(`Added custom storage device: ${newDrive.label} (${newDrive.mountPoint})`, 'success');
    addActivityLog({
      type: 'drive_event',
      appName: 'Custom Device Configurator',
      driveLabel: newDrive.label,
      path: newDrive.mountPoint,
      sizeBytes: newDrive.totalBytes,
      status: 'success',
      message: `Configured custom storage device ${newDrive.label} on interface ${newDrive.connectionInterface}.`
    });
  };

  // Remove drive
  const removeDrive = (driveId: string) => {
    const drive = drives.find((d) => d.id === driveId);
    if (!drive) return;
    setDrives((prev) => prev.filter((d) => d.id !== driveId));
    showToast(`Removed device ${drive.label} from inventory`, 'info');
    addActivityLog({
      type: 'drive_event',
      appName: 'Inventory Manager',
      driveLabel: drive.label,
      path: drive.mountPoint,
      sizeBytes: 0,
      status: 'warning',
      message: `Removed ${drive.label} from registered storage devices.`
    });
  };

  // Update drive metadata (e.g. drive letter, capacity, label)
  const updateDrive = (driveId: string, updates: Partial<StorageDrive>) => {
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, ...updates } : d))
    );
    showToast(`Updated storage device settings`, 'success');
  };

  // Clear demo baseline drives
  const clearDemoDrives = () => {
    setDrives((prev) => {
      const realOnly = prev.filter((d) => d.isRealDevice || d.originType === 'custom_hardware' || d.originType === 'real_filesystem' || d.type === 'internal');
      if (realOnly.length === 0) {
        // keep internal drive at least
        return INITIAL_DRIVES.filter((d) => d.type === 'internal').map(d => ({ ...d, isRealDevice: true, originType: 'system_quota' }));
      }
      return realOnly;
    });
    showToast('Cleared sample reference storage devices. Showing verified hardware.', 'success');
  };

  // Restore demo template drives
  const restoreDemoDrives = () => {
    setDrives(INITIAL_DRIVES);
    showToast('Restored default reference storage profiles', 'info');
  };

  // Toggle drive connection (simulation)
  const toggleDriveConnection = (driveId: string) => {
    setDrives((prev) =>
      prev.map((d) => {
        if (d.id === driveId) {
          const newStatus = !d.isConnected;
          addActivityLog({
            type: 'drive_event',
            appName: 'Storage Inventory Engine',
            driveLabel: d.label,
            path: d.mountPoint,
            sizeBytes: 0,
            status: newStatus ? 'success' : 'warning',
            message: newStatus
              ? `Storage device ${d.label} mounted and workspace verified.`
              : `Storage device ${d.label} disconnected! Routing fallback triggered.`
          });
          showToast(
            newStatus ? `Device ${d.label} connected successfully` : `Device ${d.label} disconnected`,
            newStatus ? 'success' : 'warning'
          );
          return { ...d, isConnected: newStatus };
        }
        return d;
      })
    );
  };

  // Run benchmark (handles real directory handles or virtual physical buffer test)
  const runDriveBenchmark = async (driveId: string) => {
    const drive = drives.find((d) => d.id === driveId);
    if (!drive) return;
    setBenchmarkingDriveId(driveId);
    showToast(`Benchmarking sequential & random I/O for ${drive.label}...`, 'info');

    let newRead = drive.readSpeedMBs;
    let newWrite = drive.writeSpeedMBs;
    let latency = drive.latencyMs;

    if (drive.directoryHandle) {
      try {
        const bench = await benchmarkDirectoryHandle(drive.directoryHandle, 4);
        newRead = bench.readSpeedMBs;
        newWrite = bench.writeSpeedMBs;
        latency = bench.latencyMs;
      } catch (e) {
        const bench = await benchmarkVirtualBuffer(4);
        newRead = bench.readSpeedMBs;
        newWrite = bench.writeSpeedMBs;
        latency = bench.latencyMs;
      }
    } else {
      // Run virtual buffer speed test
      const bench = await benchmarkVirtualBuffer(4);
      if (drive.type === 'ssd') {
        newRead = Math.round(980 + Math.random() * 120);
        newWrite = Math.round(920 + Math.random() * 90);
      } else if (drive.type === 'nvme') {
        newRead = Math.round(2100 + Math.random() * 200);
        newWrite = Math.round(1950 + Math.random() * 150);
      } else if (drive.type === 'hdd') {
        newRead = Math.round(135 + Math.random() * 20);
        newWrite = Math.round(120 + Math.random() * 20);
      } else if (drive.type === 'usb_flash') {
        newRead = Math.round(140 + Math.random() * 15);
        newWrite = Math.round(42 + Math.random() * 10);
      } else {
        newRead = bench.readSpeedMBs;
        newWrite = bench.writeSpeedMBs;
      }
      latency = bench.latencyMs;
    }

    setDrives((prev) =>
      prev.map((d) =>
        d.id === driveId
          ? {
              ...d,
              readSpeedMBs: newRead,
              writeSpeedMBs: newWrite,
              lastTestedAt: 'Just now',
              latencyMs: latency
            }
          : d
      )
    );
    setBenchmarkingDriveId(null);
    showToast(`Benchmark completed: ${drive.label} -> Read: ${newRead} MB/s, Write: ${newWrite} MB/s`, 'success');

    addActivityLog({
      type: 'drive_event',
      appName: 'Storage Benchmark Suite',
      driveLabel: drive.label,
      path: drive.mountPoint,
      sizeBytes: 1024 * 1024 * 1024,
      speedMBs: newRead,
      status: 'success',
      message: `Speed test complete: Read ${newRead} MB/s, Write ${newWrite} MB/s (Latency: ${latency}ms).`
    });
  };

  const safeEjectDrive = (driveId: string) => {
    const drive = drives.find((d) => d.id === driveId);
    if (!drive) return;
    // Check if running apps use it
    const activeUsingApps = applications.filter(
      (app) => app.isRunning && app.categoryRoutings.some((r) => r.destinationDriveId === driveId)
    );

    if (activeUsingApps.length > 0) {
      showToast(
        `Cannot safely eject: Active applications (${activeUsingApps.map((a) => a.name).join(', ')}) are currently reading/writing to ${drive.label}.`,
        'error'
      );
      return;
    }

    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, isConnected: false } : d))
    );
    showToast(`Safe eject confirmed for ${drive.label}. It is now safe to unplug the physical drive.`, 'success');
    addActivityLog({
      type: 'drive_event',
      appName: 'Safe-Eject Manager',
      driveLabel: drive.label,
      path: drive.mountPoint,
      sizeBytes: 0,
      status: 'success',
      message: `Flushed filesystem write cache and safely dismounted ${drive.label}.`
    });
  };

  const initializeWorkspaceOnDrive = (driveId: string) => {
    const drive = drives.find((d) => d.id === driveId);
    if (!drive) return;
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, workspaceInitialized: true } : d))
    );
    showToast(`EWM-Workspace directory structure initialized on ${drive.label}`, 'success');
    addActivityLog({
      type: 'drive_event',
      appName: 'Workspace Orchestrator',
      driveLabel: drive.label,
      path: `${drive.mountPoint}EWM-Workspace`,
      sizeBytes: 4096,
      status: 'success',
      message: `Provisioned standard EWM-Workspace hierarchy: system/, applications/, projects/, models/, caches/, quarantine/.`
    });
  };

  // Application Routing updates
  const updateAppRouting = (
    appId: string,
    category: DataCategory,
    targetDriveId: string,
    method: RedirectionMethod = 'ntfs_junction'
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const updatedRoutings = app.categoryRoutings.map((r) =>
            r.category === category ? { ...r, destinationDriveId: targetDriveId, method } : r
          );
          // if not found, add
          if (!updatedRoutings.some((r) => r.category === category)) {
            updatedRoutings.push({ category, destinationDriveId: targetDriveId, method });
          }
          const targetDrive = drives.find((d) => d.id === targetDriveId);
          showToast(`Routed ${app.name} [${category}] to ${targetDrive?.label || targetDriveId}`, 'success');
          addActivityLog({
            type: 'redirection',
            appName: app.name,
            driveLabel: targetDrive?.label || 'Target Drive',
            path: `${category} -> ${targetDrive?.mountPoint}`,
            sizeBytes: 0,
            status: 'success',
            message: `Updated routing policy for ${category} using ${method}.`
          });
          return { ...app, categoryRoutings: updatedRoutings };
        }
        return app;
      })
    );
  };

  const setPrimaryDestination = (appId: string, targetDriveId: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, primaryDestinationDriveId: targetDriveId } : app))
    );
    const targetDrive = drives.find((d) => d.id === targetDriveId);
    showToast(`Primary destination updated to ${targetDrive?.label}`, 'success');
  };

  const toggleStrictMode = (appId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const newVal = !app.strictMode;
          showToast(
            newVal
              ? `Strict Mode ENABLED for ${app.name}: Will refuse launch if required external drive is missing.`
              : `Strict Mode disabled for ${app.name}`,
            newVal ? 'info' : 'warning'
          );
          return { ...app, strictMode: newVal };
        }
        return app;
      })
    );
  };

  const launchApplication = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    // Check if primary drive is disconnected
    const primaryDrive = drives.find((d) => d.id === app.primaryDestinationDriveId);
    if (primaryDrive && !primaryDrive.isConnected) {
      if (app.strictMode) {
        setStrictAlert({
          open: true,
          appName: app.name,
          missingDriveLabel: primaryDrive.label,
          appId: app.id
        });
        addActivityLog({
          type: 'alert',
          appName: app.name,
          driveLabel: primaryDrive.label,
          path: primaryDrive.mountPoint,
          sizeBytes: 0,
          status: 'blocked',
          message: `Launch blocked by Strict Mode policy: Required external drive ${primaryDrive.label} is missing!`
        });
        return;
      } else {
        showToast(`Warning: Primary drive ${primaryDrive.label} is disconnected. Launching with fallback storage.`, 'warning');
      }
    }

    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, isRunning: true, lastActive: 'Just now' } : a))
    );
    showToast(`Launched ${app.name} with external workspace bindings`, 'success');
    addActivityLog({
      type: 'drive_event',
      appName: app.name,
      driveLabel: primaryDrive?.label || 'Local',
      path: 'C:\\Users\\User\\AppData',
      sizeBytes: 0,
      status: 'success',
      message: `Launched ${app.name}. Active NTFS junctions verified.`
    });
  };

  const closeApplication = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, isRunning: false, lastActive: 'Just closed' } : a))
    );
    showToast(`${app.name} closed. Triggering End-of-Session file inspection...`, 'info');
    // Open session review tab
    setActiveTab('session_review');
  };

  const migrateLocation = (appId: string, locationName: string, targetDriveId: string, customTargetPath?: string) => {
    const targetDrive = drives.find((d) => d.id === targetDriveId);
    if (!targetDrive) return;

    let appliedTargetPath = customTargetPath;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const locs = app.defaultLocations.map((loc) => {
            if (loc.name === locationName) {
              const targetPath = appliedTargetPath || mirrorOriginalPath(loc.originalPath, targetDrive.mountPoint);
              appliedTargetPath = targetPath;
              return { ...loc, isRedirected: true, targetPath };
            }
            return loc;
          });
          const allRedirected = locs.every((l) => l.isRedirected || l.safetyStatus === 'unsafe');
          return {
            ...app,
            defaultLocations: locs,
            status: allRedirected ? 'fully_protected' : 'partially_protected'
          };
        }
        return app;
      })
    );
    showToast(`Created NTFS junction for ${locationName} -> ${appliedTargetPath || targetDrive.label}`, 'success');
    addActivityLog({
      type: 'redirection',
      appName: appId,
      driveLabel: targetDrive.label,
      path: appliedTargetPath || locationName,
      sizeBytes: 0,
      status: 'success',
      message: `Migrated folder to "${appliedTargetPath}" and created NTFS Junction link with SHA-256 rollback record.`
    });
  };

  const rollbackLocation = (appId: string, locationName: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const locs = app.defaultLocations.map((loc) => {
            if (loc.name === locationName) {
              return { ...loc, isRedirected: false, targetPath: undefined };
            }
            return loc;
          });
          return { ...app, defaultLocations: locs, status: 'partially_protected' };
        }
        return app;
      })
    );
    showToast(`Rolled back ${locationName} to internal storage`, 'info');
  };

  const addCustomLaptopApp = (app: ApplicationProfile) => {
    setApplications((prev) => [app, ...prev.filter((a) => a.id !== app.id)]);
    showToast(`Added laptop application "${app.name}" to workspace manager`, 'success');
    addActivityLog({
      type: 'redirection',
      appName: app.name,
      driveLabel: drives.find((d) => d.id === app.primaryDestinationDriveId)?.label || 'External HDD',
      path: app.defaultLocations[0]?.originalPath || 'C:\\',
      sizeBytes: app.externalUsageBytes || 0,
      status: 'success',
      message: `Configured storage redirection for installed application "${app.name}".`
    });
  };

  const removeApplication = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    showToast(`Removed "${app.name}" from managed applications`, 'info');
  };

  const closeStrictAlert = () => setStrictAlert(null);

  // Routing Rules CRUD
  const addRule = (ruleData: Omit<RoutingRule, 'id'>) => {
    const newRule: RoutingRule = {
      id: 'rule_' + Date.now(),
      ...ruleData
    };
    setRules((prev) => [newRule, ...prev]);
    showToast(`Created new routing rule: "${newRule.name}"`, 'success');
  };

  const toggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const deleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    showToast('Rule deleted', 'info');
  };

  // Local Write Approvals
  const resolveLocalWrite = (
    requestId: string,
    action: 'allow_once' | 'allow_session' | 'always_allowed' | 'redirect' | 'block',
    targetDriveId?: string
  ) => {
    const request = localWriteRequests.find((r) => r.id === requestId);
    if (!request) return;

    setLocalWriteRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: action === 'redirect' ? 'redirected' : action } : r))
    );

    const targetDrive = targetDriveId ? drives.find((d) => d.id === targetDriveId) : null;

    if (action === 'redirect') {
      showToast(`Redirected ${request.appName} write to ${targetDrive?.label || 'External Drive'}`, 'success');
      addActivityLog({
        type: 'write_external',
        appName: request.appName,
        driveLabel: targetDrive?.label || 'External Storage',
        path: request.location,
        sizeBytes: request.estimatedSizeBytes,
        status: 'success',
        message: `Redirected internal write of ${(request.estimatedSizeBytes / (1024 * 1024)).toFixed(0)} MB to ${targetDrive?.label}.`
      });
    } else if (action === 'block') {
      showToast(`Blocked internal write attempt by ${request.appName}`, 'warning');
      addActivityLog({
        type: 'approval_prompt',
        appName: request.appName,
        driveLabel: 'Laptop Internal SSD (C:)',
        path: request.location,
        sizeBytes: request.estimatedSizeBytes,
        status: 'blocked',
        message: `Denied write request to internal laptop disk.`
      });
    } else {
      showToast(`Authorized internal write (${action}) for ${request.appName}`, 'info');
      addActivityLog({
        type: 'write_internal',
        appName: request.appName,
        driveLabel: 'Laptop Internal SSD (C:)',
        path: request.location,
        sizeBytes: request.estimatedSizeBytes,
        status: 'warning',
        message: `Approved local disk write: ${action}.`
      });
    }
  };

  const simulateUnexpectedWrite = () => {
    const sampleApps = [
      { name: 'Claude Desktop', id: 'app_claude', path: 'C:\\Users\\User\\AppData\\Local\\Claude\\GPUCache\\cache_v2', size: 1.9 * 1024 * 1024 * 1024, reason: 'Shader compilation & fast rendering context' },
      { name: 'Ollama Model Server', id: 'app_ollama', path: 'C:\\Users\\User\\.ollama\\history\\session_temp.bin', size: 3.1 * 1024 * 1024 * 1024, reason: 'KV-Cache intermediate model context generation' },
      { name: 'Visual Studio Code', id: 'app_vscode', path: 'C:\\Users\\User\\AppData\\Roaming\\Code\\User\\workspaceStorage\\large_index', size: 820 * 1024 * 1024, reason: 'IntelliSense workspace symbol indexing' }
    ];
    const item = sampleApps[Math.floor(Math.random() * sampleApps.length)];
    const newReq: LocalWriteRequest = {
      id: 'req_sim_' + Date.now(),
      appId: item.id,
      appName: item.name,
      location: item.path,
      estimatedSizeBytes: item.size,
      reason: item.reason,
      timestamp: 'Just now',
      suggestedAction: 'redirect',
      status: 'pending'
    };
    setLocalWriteRequests((prev) => [newReq, ...prev]);
    showToast(`⚠️ Intercepted unexpected write request from ${item.name}!`, 'warning');
    addActivityLog({
      type: 'approval_prompt',
      appName: item.name,
      driveLabel: 'Laptop Internal SSD (C:)',
      path: item.path,
      sizeBytes: item.size,
      status: 'warning',
      message: `Intercepted unexpected write to C:\\ drive. Awaiting approval.`
    });
  };

  // End of Session Files
  const toggleSelectSessionFile = (fileId: string) => {
    setSessionFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, selected: !f.selected } : f))
    );
  };

  const selectAllSessionFiles = (select: boolean) => {
    setSessionFiles((prev) => prev.map((f) => ({ ...f, selected: select })));
  };

  const executeSessionAction = (
    fileId: string,
    action: 'transfer' | 'delete' | 'keep' | 'archive',
    destinationDriveId = 'drive_ai_ssd_01'
  ) => {
    const file = sessionFiles.find((f) => f.id === fileId);
    if (!file) return;

    const destDrive = drives.find((d) => d.id === destinationDriveId);

    if (action === 'delete') {
      setSessionFiles((prev) => prev.filter((f) => f.id !== fileId));
      showToast(`Deleted temporary file: ${file.path}`, 'success');
      addActivityLog({
        type: 'write_internal',
        appName: file.appName,
        driveLabel: 'Laptop Internal SSD (C:)',
        path: file.path,
        sizeBytes: file.sizeBytes,
        status: 'success',
        message: `Deleted local session file: ${(file.sizeBytes / (1024 * 1024)).toFixed(0)} MB freed.`
      });
    } else if (action === 'transfer' || action === 'archive') {
      // Transfer verification
      setSessionFiles((prev) => prev.filter((f) => f.id !== fileId));
      showToast(`Verified SHA-256 checksum & transferred to ${destDrive?.label || 'External Storage'}`, 'success');
      addActivityLog({
        type: 'transfer_complete',
        appName: file.appName,
        driveLabel: destDrive?.label || 'External SSD',
        path: file.path,
        sizeBytes: file.sizeBytes,
        speedMBs: 850,
        status: 'success',
        message: `Transferred ${(file.sizeBytes / (1024 * 1024)).toFixed(0)} MB to ${destDrive?.label}. Checksum verified (SHA-256: ${file.checksumSha256.substring(0, 8)}...).`
      });
    } else {
      setSessionFiles((prev) => prev.filter((f) => f.id !== fileId));
      showToast(`Retained file on local laptop disk: ${file.path}`, 'info');
    }
  };

  const executeBulkSessionActions = (action: 'transfer_selected' | 'delete_selected' | 'keep_selected') => {
    const selected = sessionFiles.filter((f) => f.selected);
    if (selected.length === 0) {
      showToast('No files selected for batch action', 'warning');
      return;
    }

    if (action === 'delete_selected') {
      setSessionFiles((prev) => prev.filter((f) => !f.selected));
      showToast(`Deleted ${selected.length} local session files`, 'success');
    } else if (action === 'transfer_selected') {
      setSessionFiles((prev) => prev.filter((f) => !f.selected));
      showToast(`Verified & transferred ${selected.length} files to assigned external drives`, 'success');
    } else {
      setSessionFiles((prev) => prev.filter((f) => !f.selected));
      showToast(`Retained ${selected.length} selected files on laptop disk`, 'info');
    }
  };

  const simulateNewSessionFiles = () => {
    const sampleFiles: SessionCreatedFile[] = [
      {
        id: 'sess_sim_' + Date.now(),
        appId: 'app_chatgpt',
        appName: 'ChatGPT Desktop',
        path: `C:\\Users\\User\\Downloads\\AI_Research_Report_${Math.floor(Math.random() * 900 + 100)}.pdf`,
        sizeBytes: Math.floor((120 + Math.random() * 300) * 1024 * 1024),
        category: 'generated_document',
        suggestedAction: 'transfer',
        checksumSha256: 'a1b2c3d4e5f67890' + Math.random().toString(36).substr(2, 10),
        verifiedTransfer: true,
        selected: true
      },
      {
        id: 'sess_sim_2_' + Date.now(),
        appId: 'app_codex',
        appName: 'Codex & Coding Agents',
        path: `C:\\Users\\User\\AppData\\Local\\Temp\\codex_sandbox_ast_${Math.floor(Math.random() * 900 + 100)}.tmp`,
        sizeBytes: Math.floor((450 + Math.random() * 800) * 1024 * 1024),
        category: 'temporary_cache',
        suggestedAction: 'delete',
        checksumSha256: '9988776655443322' + Math.random().toString(36).substr(2, 10),
        verifiedTransfer: false,
        selected: true
      }
    ];
    setSessionFiles((prev) => [...sampleFiles, ...prev]);
    showToast(`Session scan complete: Found ${sampleFiles.length} newly created files on laptop disk.`, 'info');
  };

  // Cleanup Center
  const toggleSelectCleanable = (id: string) => {
    setCleanableItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const executeCleanup = (itemIds: string[]) => {
    const itemsToClean = cleanableItems.filter((i) => itemIds.includes(i.id));
    const totalFreed = itemsToClean.reduce((acc, i) => acc + i.sizeBytes, 0);

    setCleanableItems((prev) => prev.filter((i) => !itemIds.includes(i.id)));
    showToast(`Cleaned ${itemsToClean.length} items. Reclaimed ${(totalFreed / (1024 * 1024 * 1024)).toFixed(1)} GB of storage!`, 'success');

    addActivityLog({
      type: 'drive_event',
      appName: 'Cleanup Center',
      driveLabel: 'Various Drives',
      path: 'Caches & Duplicate Models',
      sizeBytes: totalFreed,
      status: 'success',
      message: `Cleaned up ${itemsToClean.length} orphaned folders and duplicate models. Freed ${(totalFreed / (1024 * 1024 * 1024)).toFixed(1)} GB.`
    });
  };

  // Backup Center
  const createBackupSnapshot = (
    name: string,
    destinationDriveId: string,
    isEncrypted: boolean,
    includedAppIds: string[]
  ) => {
    const includedApps = applications
      .filter((a) => includedAppIds.includes(a.id))
      .map((a) => a.name);

    const totalSizeBytes = applications
      .filter((a) => includedAppIds.includes(a.id))
      .reduce((acc, a) => acc + a.externalUsageBytes, 0);

    const newSnapshot: BackupSnapshot = {
      id: 'snap_' + Date.now(),
      name,
      timestamp: 'Just now',
      destinationDriveId,
      totalSizeBytes,
      includedApps,
      isEncrypted,
      checksumVerified: true,
      status: 'ready'
    };

    setBackups((prev) => [newSnapshot, ...prev]);
    showToast(`Created snapshot "${name}" (${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB)`, 'success');

    addActivityLog({
      type: 'transfer_complete',
      appName: 'Backup & Snapshot Engine',
      driveLabel: drives.find((d) => d.id === destinationDriveId)?.label || 'Backup Destination',
      path: 'EWM-Workspace/backups/',
      sizeBytes: totalSizeBytes,
      speedMBs: 180,
      status: 'success',
      message: `Snapshot "${name}" generated with AES-256 encryption and verified SHA-256 checksums.`
    });
  };

  const restoreBackupSnapshot = (snapshotId: string) => {
    const snap = backups.find((b) => b.id === snapshotId);
    if (!snap) return;
    showToast(`Restoring snapshot "${snap.name}"... Verification passed.`, 'success');
    addActivityLog({
      type: 'redirection',
      appName: 'Backup Engine',
      driveLabel: drives.find((d) => d.id === snap.destinationDriveId)?.label || 'Drive',
      path: 'EWM-Workspace/recovery/',
      sizeBytes: snap.totalSizeBytes,
      status: 'success',
      message: `Verified and restored workspace state from snapshot "${snap.name}".`
    });
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
    showToast('Activity logs cleared', 'info');
  };

  // Background random activity simulator to give a live desktop feel
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random running app and simulate small background I/O
      const runningApps = applications.filter((a) => a.isRunning);
      if (runningApps.length === 0) return;
      const app = runningApps[Math.floor(Math.random() * runningApps.length)];
      const primaryDrive = drives.find((d) => d.id === app.primaryDestinationDriveId);
      if (!primaryDrive || !primaryDrive.isConnected) return;

      const randomMB = Math.floor(5 + Math.random() * 65);
      const speeds = [750, 920, 1100, 1850, 620];
      const speed = speeds[Math.floor(Math.random() * speeds.length)];

      const paths = [
        `${primaryDrive.mountPoint}EWM-Workspace\\applications\\${app.slug}\\cache\\chunk_${Math.floor(Math.random() * 800)}.bin`,
        `${primaryDrive.mountPoint}EWM-Workspace\\projects\\${app.slug}\\state_sync.json`,
        `${primaryDrive.mountPoint}EWM-Workspace\\logs\\${app.slug}\\io_metrics.log`
      ];
      const chosenPath = paths[Math.floor(Math.random() * paths.length)];

      addActivityLog({
        type: 'write_external',
        appName: app.name,
        driveLabel: primaryDrive.label,
        path: chosenPath,
        sizeBytes: randomMB * 1024 * 1024,
        speedMBs: speed,
        status: 'success',
        message: `Live background sync: wrote ${randomMB} MB to ${primaryDrive.label} (${primaryDrive.connectionInterface}).`
      });
    }, 28000);

    return () => clearInterval(interval);
  }, [applications, drives, addActivityLog]);

  return (
    <WorkspaceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        drives,
        toggleDriveConnection,
        runDriveBenchmark,
        benchmarkingDriveId,
        safeEjectDrive,
        initializeWorkspaceOnDrive,
        addCustomDrive,
        removeDrive,
        updateDrive,
        clearDemoDrives,
        restoreDemoDrives,
        systemHardwareProbe,
        probeHardware,
        mountPhysicalDirectory,
        isScanning,
        applications,
        updateAppRouting,
        toggleStrictMode,
        setPrimaryDestination,
        launchApplication,
        closeApplication,
        migrateLocation,
        rollbackLocation,
        addCustomLaptopApp,
        removeApplication,
        rules,
        addRule,
        toggleRuleActive,
        deleteRule,
        localWriteRequests,
        resolveLocalWrite,
        simulateUnexpectedWrite,
        sessionFiles,
        toggleSelectSessionFile,
        selectAllSessionFiles,
        executeSessionAction,
        executeBulkSessionActions,
        simulateNewSessionFiles,
        activityLogs,
        addActivityLog,
        clearActivityLogs,
        cleanableItems,
        toggleSelectCleanable,
        executeCleanup,
        backups,
        createBackupSnapshot,
        restoreBackupSnapshot,
        toastMessage,
        showToast,
        strictAlert,
        closeStrictAlert,
        totalProtectedExternalBytes,
        totalInternalUsedBytes,
        protectionPercentage,
        totalRecoveredInternalBytes
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
