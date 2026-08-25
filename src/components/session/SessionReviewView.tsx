import React, { useState } from 'react';
import {
  FileCheck2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  FolderSync,
  Archive,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes } from '../../utils/formatters';

export const SessionReviewView: React.FC = () => {
  const {
    sessionFiles,
    toggleSelectSessionFile,
    selectAllSessionFiles,
    executeSessionAction,
    executeBulkSessionActions,
    simulateNewSessionFiles,
    drives
  } = useWorkspace();

  const [targetDriveId, setTargetDriveId] = useState<string>(drives[1]?.id || drives[0]?.id);
  const selectedCount = sessionFiles.filter((f) => f.selected).length;
  const allSelected = sessionFiles.length > 0 && selectedCount === sessionFiles.length;

  const totalSelectedBytes = sessionFiles
    .filter((f) => f.selected)
    .reduce((acc, f) => acc + f.sizeBytes, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-md">
              <FileCheck2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">End-of-Session Local-File Review</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Review files created on the laptop disk (C:\) during recent application sessions and choose to transfer, delete, archive, or keep.
          </p>
        </div>

        <button
          onClick={simulateNewSessionFiles}
          className="px-4 py-2.5 bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rescan Laptop Disk</span>
        </button>
      </div>

      {/* Transfer Verification Protocol Summary (Section 11) */}
      <div className="p-5 rounded-3xl bg-[#1E1B4B] border border-indigo-900/60 space-y-3 shadow-xl shadow-indigo-950/30">
        <div className="flex items-center gap-2 text-[#4ADE80] font-black text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Section 11: Cryptographic Transfer Verification Protocol Active</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-indigo-200 font-medium">
          <div className="p-3.5 rounded-2xl bg-[#13113A] border border-indigo-800/60 flex items-center gap-2.5 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
            <span>Destination Writable & Free Space Verified</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#13113A] border border-indigo-800/60 flex items-center gap-2.5 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
            <span>Byte-for-Byte Size Matching</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#13113A] border border-indigo-800/60 flex items-center gap-2.5 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
            <span>SHA-256 Cryptographic Checksum</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#13113A] border border-indigo-800/60 flex items-center gap-2.5 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
            <span>Process Lock Exclusivity Check</span>
          </div>
        </div>
      </div>

      {/* Files Table Section */}
      <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 text-xs font-black text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => selectAllSessionFiles(e.target.checked)}
                className="rounded-lg border-indigo-700 bg-[#13113A] text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
              />
              <span>Select All ({sessionFiles.length} files)</span>
            </label>
            {selectedCount > 0 && (
              <span className="text-xs text-[#FACC15] font-black">
                ({selectedCount} selected • {formatBytes(totalSelectedBytes)})
              </span>
            )}
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => executeBulkSessionActions('delete_selected')}
              disabled={selectedCount === 0}
              className="px-3.5 py-2 bg-[#F43F5E] hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-md shadow-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            <button
              onClick={() => executeBulkSessionActions('transfer_selected')}
              disabled={selectedCount === 0}
              className="px-3.5 py-2 bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <FolderSync className="w-3.5 h-3.5" />
              <span>Transfer Selected</span>
            </button>

            <button
              onClick={() => executeBulkSessionActions('keep_selected')}
              disabled={selectedCount === 0}
              className="px-3.5 py-2 bg-[#25215A] hover:bg-[#2E296E] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              Keep Selected
            </button>
          </div>
        </div>

        {/* Files List */}
        {sessionFiles.length === 0 ? (
          <div className="py-16 text-center text-indigo-300 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#4ADE80] mx-auto" />
            <h4 className="text-base font-black text-white">All Session Files Cleared</h4>
            <p className="text-xs text-indigo-400 font-medium">
              No unmanaged files currently remain on your internal laptop disk from completed sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessionFiles.map((file) => (
              <div
                key={file.id}
                className={`p-4 rounded-2xl border transition-all ${
                  file.selected
                    ? 'bg-[#13113A] border-[#6366F1] ring-2 ring-indigo-500/40 shadow-md'
                    : 'bg-[#13113A] border-indigo-800/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={file.selected}
                      onChange={() => toggleSelectSessionFile(file.id)}
                      className="rounded-lg border-indigo-700 bg-[#1E1B4B] text-[#6366F1] focus:ring-[#6366F1] w-4 h-4 mt-1"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs text-white">{file.appName}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#25215A] font-bold text-indigo-200">
                          {file.category.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                            file.suggestedAction === 'delete'
                              ? 'bg-[#F43F5E] text-white'
                              : file.suggestedAction === 'transfer'
                              ? 'bg-[#4ADE80] text-[#1E1B4B]'
                              : 'bg-[#25215A] text-indigo-300'
                          }`}
                        >
                          Suggested: {file.suggestedAction}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-indigo-300 break-all">{file.path}</div>
                      <div className="text-[10px] font-mono text-indigo-400">
                        SHA-256: {file.checksumSha256.substring(0, 16)}...
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs font-mono font-black text-[#FACC15]">
                      {formatBytes(file.sizeBytes)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => executeSessionAction(file.id, 'delete')}
                        className="px-3 py-1.5 bg-[#F43F5E] hover:bg-rose-600 text-white text-xs font-black rounded-xl transition shadow-sm"
                        title="Delete file permanently"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => executeSessionAction(file.id, 'transfer', targetDriveId)}
                        className="px-3 py-1.5 bg-[#6366F1] hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition shadow-md shadow-indigo-600/30"
                        title="Verify & transfer to external drive"
                      >
                        Transfer
                      </button>
                      <button
                        onClick={() => executeSessionAction(file.id, 'keep')}
                        className="px-3 py-1.5 bg-[#25215A] hover:bg-[#2E296E] text-white text-xs font-bold rounded-xl transition shadow-sm"
                        title="Keep on laptop disk"
                      >
                        Keep
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
