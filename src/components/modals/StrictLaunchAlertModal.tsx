import React from 'react';
import { AlertTriangle, HardDrive, ShieldAlert, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const StrictLaunchAlertModal: React.FC = () => {
  const { strictAlert, closeStrictAlert, toggleDriveConnection, launchApplication } = useWorkspace();

  if (!strictAlert || !strictAlert.open) return null;

  return (
    <div className="fixed inset-0 bg-[#0F0E2A]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-[#1E1B4B] border-2 border-[#F43F5E] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between pb-3.5 border-b border-indigo-900/60">
          <div className="flex items-center gap-2.5 text-[#F43F5E] font-black">
            <div className="w-8 h-8 rounded-xl bg-[#F43F5E]/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#F43F5E]" />
            </div>
            <h3 className="text-base text-white font-black">Strict Mode Launch Blocked</h3>
          </div>
          <button onClick={closeStrictAlert} className="text-indigo-400 hover:text-white font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/40 space-y-2 text-xs">
          <p className="text-rose-100 font-bold leading-relaxed">
            <strong>{strictAlert.appName}</strong> cannot be launched because its assigned primary external storage device (<span className="text-[#FACC15]">{strictAlert.missingDriveLabel}</span>) is currently disconnected.
          </p>
          <p className="text-rose-200/90 font-medium">
            Strict Mode policy prevents silent fallback to the internal laptop disk to prevent disk wear and untracked file generation.
          </p>
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          <div className="text-indigo-300 font-black uppercase tracking-widest text-[10px]">
            Recovery Options:
          </div>

          <button
            onClick={closeStrictAlert}
            className="w-full py-3 bg-[#25215A] hover:bg-[#2E296E] text-white font-bold rounded-2xl transition text-left px-4 flex items-center justify-between border border-indigo-700/60 shadow-sm"
          >
            <span>1. Wait for physical device to be re-connected</span>
            <HardDrive className="w-4 h-4 text-[#FACC15]" />
          </button>

          <button
            onClick={closeStrictAlert}
            className="w-full py-3 bg-[#25215A] hover:bg-[#2E296E] text-indigo-200 font-bold rounded-2xl transition text-left px-4 border border-indigo-700/60"
          >
            2. Request explicit temporary fallback authorization
          </button>

          <button
            onClick={closeStrictAlert}
            className="w-full py-3 bg-[#F43F5E] hover:bg-rose-600 text-white font-black rounded-2xl transition shadow-lg shadow-rose-500/30 text-center"
          >
            Cancel Launch
          </button>
        </div>
      </div>
    </div>
  );
};

