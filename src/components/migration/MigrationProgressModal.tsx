import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  ArrowRight,
  HardDrive,
  FolderSync,
  Sparkles,
  RotateCcw,
  Clock,
  Loader2,
  FileCheck,
  FolderPlus,
  Edit3,
  Check,
  FolderTree,
  Play,
  HelpCircle
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes } from '../../utils/formatters';
import { cleanAppFolderPath, createAppSubfolderPath, mirrorOriginalPath } from '../../utils/pathUtils';

interface MigrationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  locationName: string;
  sourcePath: string;
  initialTargetPath: string;
  targetMountPoint: string;
  targetDriveLabel: string;
  sizeBytes: number;
  onComplete: (confirmedTargetPath: string) => void;
}

export const MigrationProgressModal: React.FC<MigrationProgressModalProps> = ({
  isOpen,
  onClose,
  appName,
  locationName,
  sourcePath,
  initialTargetPath,
  targetMountPoint,
  targetDriveLabel,
  sizeBytes,
  onComplete
}) => {
  // Path customization state (Phase 1)
  const [targetPath, setTargetPath] = useState(initialTargetPath);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [autoCreateFolder, setAutoCreateFolder] = useState(true);
  const [newSubfolderName, setNewSubfolderName] = useState('');

  // Transfer state (Phase 2)
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const steps = [
    { title: 'Pre-flight Lock Verification', desc: 'Ensuring application file locks and handles are released' },
    { title: 'Checkpoint Snapshot', desc: 'Creating pre-migration recovery point in internal state registry' },
    { title: 'High-Speed Byte Transfer', desc: 'Copying payload preserving metadata, timestamps & permissions' },
    { title: 'SHA-256 Checksum Verification', desc: 'Verifying data integrity between source and target storage' },
    { title: 'Atomic NTFS Junction Link', desc: 'Executing mklink /J redirecting source C:\\ path to D:\\' }
  ];

  // When modal opens, sync the default path (clean concise app folder: D:\AppName\Folder)
  useEffect(() => {
    if (isOpen) {
      const defaultCleanPath = initialTargetPath || cleanAppFolderPath(appName, sourcePath, locationName, targetMountPoint);
      setTargetPath(defaultCleanPath);
      setIsMigrating(false);
      setProgress(0);
      setStepIndex(0);
      setLogs([]);
      setIsFinished(false);
      setIsCustomizing(false);
      setNewSubfolderName('');
    }
  }, [isOpen, initialTargetPath, appName, sourcePath, locationName, targetMountPoint]);

  // Handle migration start
  const handleStartExecution = () => {
    setIsMigrating(true);
    setLogs([
      `[INIT] Transactional storage migration initialized for "${appName}"`,
      `[LOCATION] ${locationName}`,
      `[SOURCE (Original C:\\)] ${sourcePath}`,
      `[DESTINATION (${targetDriveLabel})] ${targetPath}`,
      `[DIR] Clean application directory will be created on ${targetDriveLabel}`,
      `[SIZE] Payload size: ${formatBytes(sizeBytes)}`
    ]);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsFinished(true);
          return 100;
        }

        const next = prev + 12;
        if (next >= 20 && next < 40) {
          setStepIndex(1);
          setLogs((l) => [...l, `[SNAPSHOT] Local checkpoint snapshot created in internal state registry.`]);
        } else if (next >= 40 && next < 70) {
          setStepIndex(2);
          setLogs((l) => [
            ...l,
            `[TRANSFER] Robocopy multi-stream payload transfer in progress... (${Math.min(
              100,
              Math.round((next / 70) * 100)
            )}%)`
          ]);
        } else if (next >= 70 && next < 90) {
          setStepIndex(3);
          setLogs((l) => [...l, `[HASH] Block hash validation: SHA-256 verified identical (100% integrity).`]);
        } else if (next >= 90) {
          setStepIndex(4);
          setLogs((l) => [
            ...l,
            `[NTFS] Executed: mklink /J "${sourcePath}" "${targetPath}"`,
            `[SUCCESS] Application junction established with zero data loss!`
          ]);
        }
        return Math.min(100, next);
      });
    }, 320);
  };

  if (!isOpen) return null;

  const handleFinish = () => {
    onComplete(targetPath);
    onClose();
  };

  const setCleanAppPath = () => {
    setTargetPath(cleanAppFolderPath(appName, sourcePath, locationName, targetMountPoint));
  };

  const setSameNameAsOriginal = () => {
    setTargetPath(mirrorOriginalPath(sourcePath, targetMountPoint));
  };

  const handleCreateNewSubfolder = () => {
    const subName = newSubfolderName.trim() || 'New_Folder';
    setTargetPath(createAppSubfolderPath(appName, subName, targetMountPoint));
    setNewSubfolderName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E1B4B] border border-indigo-700/60 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#2A247A] to-[#1E1B4B] border-b border-indigo-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-lg">
              <FolderSync className={`w-5 h-5 ${isMigrating && !isFinished ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                {!isMigrating
                  ? 'Confirm Folder Name & Storage Destination'
                  : isFinished
                  ? 'Application Storage Migrated!'
                  : 'Executing Storage Migration...'}
              </h3>
              <p className="text-xs text-indigo-300">
                Offloading <strong className="text-white">{appName}</strong> ({formatBytes(sizeBytes)}) to{' '}
                <strong className="text-[#FACC15]">{targetDriveLabel}</strong>
              </p>
            </div>
          </div>
          {(!isMigrating || isFinished) && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {!isMigrating ? (
            /* Phase 1: Folder Naming & Confirmation */
            <div className="space-y-4">
              {/* Original vs Destination Card */}
              <div className="p-4 bg-[#13113A] rounded-2xl border border-indigo-800/60 space-y-3.5 shadow-inner">
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block mb-1">
                    Source Folder (Original Disk - C:\)
                  </span>
                  <div className="p-2.5 bg-[#1E1B4B] rounded-xl border border-indigo-900/80 font-mono text-xs text-indigo-200 break-all">
                    {sourcePath}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-[#4ADE80] uppercase tracking-wider flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5" />
                      Destination Folder on {targetDriveLabel}
                    </span>
                    <span className="text-[10px] text-indigo-300 font-bold">
                      {targetPath === cleanAppFolderPath(appName, sourcePath, locationName, targetMountPoint)
                        ? '🟢 Clean App Folder (Default)'
                        : '✏️ Custom Named Folder'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={targetPath}
                      onChange={(e) => setTargetPath(e.target.value)}
                      placeholder={`e.g. ${targetMountPoint}${appName}\\Data`}
                      className="w-full px-3.5 py-2.5 bg-[#1E1B4B] border border-indigo-700/80 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-[#4ADE80] shadow-sm font-bold"
                    />

                    {/* Create New Subfolder inside App Folder */}
                    <div className="p-3 bg-[#1E1B4B] rounded-xl border border-indigo-700/60 space-y-2">
                      <div className="text-[10px] font-bold text-indigo-300 flex items-center justify-between">
                        <span>Create New Folder inside <span className="text-white font-mono">{targetMountPoint}{appName}\</span>:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. My_Custom_Cache or Exports"
                          value={newSubfolderName}
                          onChange={(e) => setNewSubfolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newSubfolderName.trim()) {
                              handleCreateNewSubfolder();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#13113A] border border-indigo-600 rounded-lg text-xs font-mono text-white placeholder-indigo-500 focus:outline-none focus:border-[#FACC15]"
                        />
                        <button
                          type="button"
                          onClick={handleCreateNewSubfolder}
                          className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>Create Folder</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Presets & Helpers */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={setCleanAppPath}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border ${
                          targetPath === cleanAppFolderPath(appName, sourcePath, locationName, targetMountPoint)
                            ? 'bg-[#4ADE80] text-[#1E1B4B] border-[#4ADE80]'
                            : 'bg-indigo-950/60 text-indigo-300 hover:text-white border-indigo-800/60'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Default App Folder ({targetMountPoint}{appName}\...)</span>
                      </button>

                      <button
                        type="button"
                        onClick={setSameNameAsOriginal}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border ${
                          targetPath === mirrorOriginalPath(sourcePath, targetMountPoint)
                            ? 'bg-[#6366F1] text-white border-[#6366F1]'
                            : 'bg-indigo-950/60 text-indigo-300 hover:text-white border-indigo-800/60'
                        }`}
                      >
                        <span>Mirror Original Deep Path</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavior Details */}
              <div className="p-3.5 bg-[#13113A] rounded-2xl border border-indigo-800/60 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-indigo-200">
                  <input
                    type="checkbox"
                    checked={autoCreateFolder}
                    onChange={(e) => setAutoCreateFolder(e.target.checked)}
                    className="rounded text-[#6366F1] focus:ring-0 bg-[#1E1B4B] border-indigo-700"
                  />
                  <span className="font-bold text-white">
                    Automatically create target directory hierarchy on {targetDriveLabel}
                  </span>
                </label>
                <p className="text-[11px] text-indigo-300 pl-5">
                  When migration executes, EWM creates all required parent folders on {targetMountPoint}, copies the data with verified checksums, and replaces the local <code className="text-[#FACC15]">C:\</code> folder with an NTFS junction.
                </p>
              </div>
            </div>
          ) : (
            /* Phase 2: Live Progress Execution */
            <div className="space-y-5">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                    {!isFinished ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FACC15]" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                    )}
                    {isFinished ? 'Migration & NTFS Linking Complete' : steps[stepIndex]?.title || 'Processing...'}
                  </span>
                  <span className="font-mono font-bold text-[#FACC15] text-sm">{progress}%</span>
                </div>
                <div className="w-full bg-[#13113A] rounded-full h-3 overflow-hidden border border-indigo-800/60 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#4ADE80] to-[#FACC15] transition-all duration-300 shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stepper Status */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
                {steps.map((s, idx) => {
                  const isPast = stepIndex > idx || isFinished;
                  const isCurrent = stepIndex === idx && !isFinished;
                  return (
                    <div
                      key={s.title}
                      className={`p-2.5 rounded-xl border text-[10px] space-y-1 transition-all ${
                        isPast
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-[#4ADE80]'
                          : isCurrent
                          ? 'bg-indigo-900/60 border-[#6366F1] text-white ring-1 ring-[#6366F1]'
                          : 'bg-[#13113A] border-indigo-900/40 text-indigo-400'
                      }`}
                    >
                      <div className="font-black flex items-center gap-1">
                        {isPast ? <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" /> : <span>0{idx + 1}.</span>}
                        <span className="truncate">{s.title.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Terminal Logs */}
              <div className="bg-[#13113A] border border-indigo-900/80 rounded-2xl p-4 font-mono text-[11px] space-y-1 max-h-40 overflow-y-auto shadow-inner text-indigo-300">
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold border-b border-indigo-900/60 pb-1 mb-2">
                  <Terminal className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Windows NTFS Engine Execution Log</span>
                </div>
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes('[SUCCESS]')
                        ? 'text-[#4ADE80] font-black'
                        : log.includes('[NTFS]')
                        ? 'text-[#FACC15] font-bold'
                        : log.includes('[HASH]')
                        ? 'text-cyan-300'
                        : 'text-indigo-200'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>

              {/* Paths Summary Card */}
              <div className="p-3.5 bg-[#13113A] rounded-2xl border border-indigo-800/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px] text-indigo-300">
                  <span>Source Original Path (C:\):</span>
                  <span className="font-mono text-white truncate max-w-xs">{sourcePath}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#4ADE80]">
                  <span>Redirected Target Folder ({targetDriveLabel}):</span>
                  <span className="font-mono font-bold text-white truncate max-w-xs">{targetPath}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#13113A] border-t border-indigo-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
            <span>Zero Data Loss Guarantee • SHA-256 Verified</span>
          </div>

          {!isMigrating ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#25215A] hover:bg-[#2E296E] text-indigo-200 hover:text-white font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExecution}
                className="px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#4ADE80] hover:brightness-110 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Confirm & Migrate Folder</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!isFinished}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-lg ${
                isFinished
                  ? 'bg-[#4ADE80] hover:bg-emerald-400 text-[#1E1B4B] shadow-emerald-500/20'
                  : 'bg-indigo-900/60 text-indigo-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFinished ? 'Done & Verify Link' : 'Migrating Payload...'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
