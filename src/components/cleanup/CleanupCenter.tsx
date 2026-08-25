import React from 'react';
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Copy,
  Sparkles,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes } from '../../utils/formatters';

export const CleanupCenter: React.FC = () => {
  const { cleanableItems, toggleSelectCleanable, executeCleanup, drives } = useWorkspace();

  const selectedItems = cleanableItems.filter((i) => i.selected);
  const totalReclaimableBytes = selectedItems.reduce((acc, i) => acc + i.sizeBytes, 0);
  const allCleanableBytes = cleanableItems.reduce((acc, i) => acc + i.sizeBytes, 0);

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'safe':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#4ADE80] text-[#1E1B4B] uppercase tracking-wider">Safe to Delete</span>;
      case 'caution':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FACC15] text-[#1E1B4B] uppercase tracking-wider">Caution</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#6366F1] text-white uppercase tracking-wider">Review Needed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F43F5E] flex items-center justify-center text-white shadow-md">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">Workspace Cleanup & Deduplication Center</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Detect and purge duplicate AI models, orphaned CUDA caches, abandoned environments, and crash dumps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => executeCleanup(selectedItems.map((i) => i.id))}
            disabled={selectedItems.length === 0}
            className="px-4 py-2.5 bg-[#F43F5E] hover:bg-rose-600 disabled:opacity-40 text-white font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-rose-500/30 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reclaim {formatBytes(totalReclaimableBytes)} Storage</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#1E1B4B] border border-indigo-900/60 shadow-xl shadow-indigo-950/30">
          <span className="text-[10px] text-indigo-300 font-black uppercase tracking-wider">Total Reclaimable</span>
          <div className="text-2xl font-black text-white mt-1.5">{formatBytes(allCleanableBytes)}</div>
          <p className="text-xs text-indigo-400 mt-1 font-medium">Across all connected external drives</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#1E1B4B] border border-indigo-900/60 shadow-xl shadow-indigo-950/30">
          <span className="text-[10px] text-indigo-300 font-black uppercase tracking-wider">Duplicate AI Models</span>
          <div className="text-2xl font-black text-[#FACC15] mt-1.5">4.6 GB</div>
          <p className="text-xs text-indigo-400 mt-1 font-medium">Exact match tensor deduplication</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#1E1B4B] border border-indigo-900/60 shadow-xl shadow-indigo-950/30">
          <span className="text-[10px] text-indigo-300 font-black uppercase tracking-wider">Orphaned CUDA & AST Caches</span>
          <div className="text-2xl font-black text-[#6366F1] mt-1.5">14.8 GB</div>
          <p className="text-xs text-indigo-400 mt-1 font-medium">Can be safely re-compiled if required</p>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-indigo-900/60">
          <h3 className="text-base font-black text-white">Review Identified Items for Purging</h3>
          <span className="text-xs text-[#FACC15] font-bold">{cleanableItems.length} items found</span>
        </div>

        {cleanableItems.length === 0 ? (
          <div className="py-16 text-center text-indigo-300 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#4ADE80] mx-auto" />
            <h4 className="text-base font-black text-white">Your Workspaces are Clean & Deduplicated</h4>
            <p className="text-xs text-indigo-400 font-medium">No orphaned model weights, stale caches, or abandoned sandboxes found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cleanableItems.map((item) => {
              const drive = drives.find((d) => d.id === item.sourceDriveId);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelectCleanable(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    item.selected
                      ? 'bg-[#13113A] border-[#F43F5E] ring-2 ring-rose-500/30 shadow-md'
                      : 'bg-[#13113A] border-indigo-800/60 hover:border-indigo-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => {}}
                        className="rounded-lg border-indigo-700 bg-[#1E1B4B] text-[#F43F5E] focus:ring-[#F43F5E] w-4 h-4 mt-1 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-xs text-white">{item.title}</h4>
                          {getRiskBadge(item.riskLevel)}
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#25215A] text-indigo-200">
                            {drive?.label || 'External'}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-200 font-medium">{item.description}</p>
                        <div className="text-xs font-mono text-indigo-400 break-all">{item.path}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-[#FACC15] block">
                        {formatBytes(item.sizeBytes)}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-medium">Last used: {item.lastAccessed}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
