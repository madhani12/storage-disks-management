import React, { useState } from 'react';
import {
  ShieldAlert,
  HardDrive,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Zap,
  HelpCircle,
  AlertTriangle,
  FolderSync,
  Shield
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes } from '../../utils/formatters';

export const LocalApprovalView: React.FC = () => {
  const { localWriteRequests, resolveLocalWrite, drives, simulateUnexpectedWrite } = useWorkspace();
  const [selectedDestDrives, setSelectedDestDrives] = useState<Record<string, string>>({});

  const pendingRequests = localWriteRequests.filter((r) => r.status === 'pending');
  const historyRequests = localWriteRequests.filter((r) => r.status !== 'pending');

  const handleDriveSelect = (reqId: string, driveId: string) => {
    setSelectedDestDrives((prev) => ({ ...prev, [reqId]: driveId }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FACC15] flex items-center justify-center text-[#1E1B4B] shadow-md">
              <ShieldAlert className="w-5 h-5 text-[#1E1B4B]" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">Local Storage Approval Interceptor</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Intercepts unexpected disk write requests to internal storage (C:\) and enforces your explicit storage policy.
          </p>
        </div>

        <button
          onClick={simulateUnexpectedWrite}
          className="px-4 py-2.5 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1B4B] font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-yellow-500/20 shrink-0"
        >
          <Zap className="w-4 h-4 fill-current text-[#1E1B4B]" />
          <span>Simulate Unexpected C:\ Write</span>
        </button>
      </div>

      {/* Pending Requests Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-indigo-200 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FACC15]" />
            Pending Authorization Queue ({pendingRequests.length})
          </h3>
          <span className="text-xs text-indigo-400 font-medium">Decision required before data is committed to disk</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-12 text-center space-y-3 shadow-xl shadow-indigo-950/30">
            <div className="w-14 h-14 rounded-2xl bg-[#4ADE80]/20 text-[#4ADE80] flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <h4 className="text-base font-black text-white">No Pending Write Interceptions</h4>
            <p className="text-xs text-indigo-300 max-w-md mx-auto leading-relaxed font-medium">
              All active applications are currently writing cleanly to their assigned external volumes. Click "Simulate Unexpected C:\ Write" to test the approval prompt.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => {
              const defaultDestId = selectedDestDrives[req.id] || drives.find((d) => d.type !== 'internal')?.id || drives[0].id;
              const selectedTargetDrive = drives.find((d) => d.id === defaultDestId);

              return (
                <div
                  key={req.id}
                  className="bg-[#1E1B4B] border-2 border-[#FACC15] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in"
                >
                  {/* Header of prompt */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-indigo-900/60">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#FACC15] text-[#1E1B4B] flex items-center justify-center font-black shadow-md">
                        <HardDrive className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-base font-black text-white">Local Storage Request</h4>
                          <span className="text-[10px] font-mono px-2.5 py-0.5 bg-[#FACC15] text-[#1E1B4B] font-black rounded-full uppercase tracking-wider">
                            INTERCEPTED
                          </span>
                        </div>
                        <p className="text-xs text-indigo-200 font-medium mt-1">
                          <strong className="text-white font-bold">{req.appName}</strong> wants to create files on the laptop internal disk.
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-[#FACC15] block">
                        Est. Size: {formatBytes(req.estimatedSizeBytes)}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-bold">{req.timestamp}</span>
                    </div>
                  </div>

                  {/* Details box */}
                  <div className="bg-[#13113A] p-4 rounded-2xl border border-indigo-800/60 text-xs space-y-2 font-mono shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-indigo-200">
                      <span className="text-indigo-400 font-sans font-bold">Target Location:</span>
                      <span className="text-[#FACC15] font-black break-all">{req.location}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-indigo-200">
                      <span className="text-indigo-400 font-sans font-bold">Stated Reason:</span>
                      <span className="text-white font-sans font-medium">{req.reason}</span>
                    </div>
                  </div>

                  {/* 5 Distinct Actions as specified in Section 9 */}
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                      Select Authorization Decision:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                      {/* 1. Allow once */}
                      <button
                        onClick={() => resolveLocalWrite(req.id, 'allow_once')}
                        className="p-3 rounded-2xl bg-[#25215A] hover:bg-[#2E296E] text-white border border-indigo-700/60 text-xs font-bold transition text-center shadow-sm"
                      >
                        <span className="block font-black">Allow Once</span>
                        <span className="text-[10px] text-indigo-300 block mt-0.5 font-medium">Current single write</span>
                      </button>

                      {/* 2. Allow until app closes */}
                      <button
                        onClick={() => resolveLocalWrite(req.id, 'allow_session')}
                        className="p-3 rounded-2xl bg-[#25215A] hover:bg-[#2E296E] text-white border border-indigo-700/60 text-xs font-bold transition text-center shadow-sm"
                      >
                        <span className="block font-black">Allow for Session</span>
                        <span className="text-[10px] text-indigo-300 block mt-0.5 font-medium">Until app closes</span>
                      </button>

                      {/* 3. Always allow */}
                      <button
                        onClick={() => resolveLocalWrite(req.id, 'always_allowed')}
                        className="p-3 rounded-2xl bg-[#25215A] hover:bg-[#2E296E] text-white border border-indigo-700/60 text-xs font-bold transition text-center shadow-sm"
                      >
                        <span className="block font-black">Always Allow</span>
                        <span className="text-[10px] text-indigo-300 block mt-0.5 font-medium">Add to permanent list</span>
                      </button>

                      {/* 4. Redirect to External Drive */}
                      <div className="p-2.5 rounded-2xl bg-[#6366F1]/20 border border-[#6366F1] flex flex-col justify-between shadow-sm">
                        <select
                          value={defaultDestId}
                          onChange={(e) => handleDriveSelect(req.id, e.target.value)}
                          className="bg-[#13113A] border border-indigo-700 text-white text-[10px] font-bold rounded-lg px-2 py-1.5 mb-1.5 focus:outline-none"
                        >
                          {drives.filter((d) => d.type !== 'internal').map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.label} ({d.mountPoint})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => resolveLocalWrite(req.id, 'redirect', defaultDestId)}
                          className="w-full py-2 bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition shadow-md shadow-indigo-600/30"
                        >
                          Redirect to Drive
                        </button>
                      </div>

                      {/* 5. Block write */}
                      <button
                        onClick={() => resolveLocalWrite(req.id, 'block')}
                        className="p-3 rounded-2xl bg-[#F43F5E] hover:bg-rose-600 text-white text-xs font-black transition text-center shadow-lg shadow-rose-500/20"
                      >
                        <span className="block">Block Write</span>
                        <span className="text-[10px] text-rose-100 block mt-0.5 font-medium">Refuse disk access</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decision History Table */}
      {historyRequests.length > 0 && (
        <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Recent Interception Decisions
          </h3>

          <div className="divide-y divide-indigo-900/60 rounded-2xl border border-indigo-800/60 bg-[#13113A] overflow-hidden text-xs shadow-inner">
            {historyRequests.map((req) => (
              <div key={req.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      req.status === 'blocked' ? 'bg-[#F43F5E]' : 'bg-[#4ADE80]'
                    }`}
                  />
                  <span className="font-bold text-white">{req.appName}</span>
                  <span className="text-indigo-300 truncate max-w-md font-medium">{req.location}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                  <span className="text-indigo-200 font-bold">{formatBytes(req.estimatedSizeBytes)}</span>
                  <span
                    className={`px-2.5 py-1 rounded-full font-sans uppercase font-black text-[10px] tracking-wider ${
                      req.status === 'blocked'
                        ? 'bg-[#F43F5E] text-white'
                        : req.status === 'redirected'
                        ? 'bg-[#6366F1] text-white'
                        : 'bg-[#4ADE80] text-[#1E1B4B]'
                    }`}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
