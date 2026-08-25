import React, { useState } from 'react';
import {
  DatabaseBackup,
  Plus,
  ShieldCheck,
  RotateCcw,
  Lock,
  CheckCircle2,
  HardDrive,
  Calendar,
  Cloud,
  FileCheck
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes } from '../../utils/formatters';

export const BackupCenter: React.FC = () => {
  const { backups, createBackupSnapshot, restoreBackupSnapshot, drives, applications } = useWorkspace();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [targetDriveId, setTargetDriveId] = useState(drives.find((d) => d.type === 'nas')?.id || drives[1]?.id || drives[0]?.id);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>(applications.map((a) => a.id));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;
    createBackupSnapshot(snapshotName, targetDriveId, isEncrypted, selectedAppIds);
    setIsCreateModalOpen(false);
    setSnapshotName('');
  };

  const toggleAppSelection = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-md">
              <DatabaseBackup className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">Workspace Backup & Snapshot Center</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Create scheduled encrypted differential snapshots, replicate to secondary SSD/NAS/Cloud, and perform rollback.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Workspace Snapshot</span>
        </button>
      </div>

      {/* Snapshots Timeline Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-indigo-200 uppercase tracking-wider flex items-center gap-2 px-1">
          <Calendar className="w-4 h-4 text-indigo-400" />
          Snapshot History & Recovery Points ({backups.length})
        </h3>

        <div className="space-y-3">
          {backups.map((snap) => {
            const destDrive = drives.find((d) => d.id === snap.destinationDriveId);

            return (
              <div
                key={snap.id}
                className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b border-indigo-900/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base font-black text-white">{snap.name}</h4>
                      {snap.isEncrypted && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#4ADE80] text-[#1E1B4B] flex items-center gap-1 uppercase tracking-wider">
                          <Lock className="w-3 h-3 text-[#1E1B4B]" />
                          AES-256 Encrypted
                        </span>
                      )}
                      {snap.checksumVerified && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#FACC15] text-[#1E1B4B] flex items-center gap-1 uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-[#1E1B4B]" />
                          SHA-256 Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-indigo-300 font-medium">
                      Destination: <strong className="text-white font-bold">{destDrive?.label || 'External Drive'}</strong> ({destDrive?.mountPoint})
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-mono font-black text-[#FACC15] block">
                      {formatBytes(snap.totalSizeBytes)}
                    </span>
                    <span className="text-xs text-indigo-400 font-mono font-semibold">{snap.timestamp}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-indigo-300 font-medium flex-wrap">
                    <span className="text-indigo-400 font-bold">Included Applications:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {snap.includedApps.map((appName) => (
                        <span key={appName} className="px-2.5 py-1 rounded-xl bg-[#13113A] text-indigo-200 border border-indigo-800/40 text-xs font-bold">
                          {appName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => restoreBackupSnapshot(snap.id)}
                    className="px-4 py-2 bg-[#25215A] hover:bg-[#2E296E] text-white font-black text-xs rounded-xl transition flex items-center gap-2 shrink-0 border border-indigo-700/60 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Restore from Snapshot</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Create Backup Snapshot */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#0F0E2A]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#1E1B4B] border border-indigo-800/80 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6366F1] flex items-center justify-center text-white">
                  <DatabaseBackup className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-black text-white">Create New Workspace Snapshot</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-indigo-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-indigo-200 font-bold mb-1.5">Snapshot Label</label>
                <input
                  type="text"
                  placeholder="e.g. Pre-Upgrade Full AI Workspaces Snapshot"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  className="w-full bg-[#13113A] border border-indigo-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#6366F1]"
                  required
                />
              </div>

              <div>
                <label className="block text-indigo-200 font-bold mb-1.5">Backup Destination Volume</label>
                <select
                  value={targetDriveId}
                  onChange={(e) => setTargetDriveId(e.target.value)}
                  className="w-full bg-[#13113A] border border-indigo-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#6366F1] font-bold"
                >
                  {drives.filter((d) => d.type !== 'internal').map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label} ({d.mountPoint}) - {formatBytes(d.freeBytes)} Free
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-indigo-200 font-bold mb-1.5">Included Applications</label>
                <div className="grid grid-cols-2 gap-2 bg-[#13113A] p-3.5 rounded-2xl border border-indigo-800/60 shadow-inner">
                  {applications.map((app) => (
                    <label key={app.id} className="flex items-center gap-2 text-indigo-200 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={selectedAppIds.includes(app.id)}
                        onChange={() => toggleAppSelection(app.id)}
                        className="rounded-lg border-indigo-700 bg-[#1E1B4B] text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                      />
                      <span className="truncate">{app.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#13113A] border border-indigo-800/60 shadow-inner">
                <input
                  type="checkbox"
                  id="enc"
                  checked={isEncrypted}
                  onChange={(e) => setIsEncrypted(e.target.checked)}
                  className="rounded-lg border-indigo-700 bg-[#1E1B4B] text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
                />
                <label htmlFor="enc" className="text-indigo-200 cursor-pointer">
                  <strong className="text-white block">Enable AES-256 Hardware-Bound Encryption</strong>
                  <span className="block text-xs text-indigo-400 font-medium">Protects conversational datasets and private code</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-indigo-900/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 bg-[#25215A] hover:bg-[#2E296E] text-indigo-200 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#6366F1] hover:bg-indigo-500 text-white font-black rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Create Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
