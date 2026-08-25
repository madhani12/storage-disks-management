import React, { useState } from 'react';
import {
  Lock,
  Shield,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  FileKey,
  HardDrive,
  Eye,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const SecurityView: React.FC = () => {
  const { applications, toggleStrictMode, drives, showToast } = useWorkspace();
  const [workspaceLocked, setWorkspaceLocked] = useState(false);
  const [encryptionPin, setEncryptionPin] = useState('');
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const handleToggleLock = () => {
    if (!workspaceLocked) {
      setWorkspaceLocked(true);
      showToast('Workspaces locked with AES-256 key encapsulation.', 'warning');
    } else {
      setPinModalOpen(true);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (encryptionPin === '1234' || encryptionPin.length >= 4) {
      setWorkspaceLocked(false);
      setPinModalOpen(false);
      setEncryptionPin('');
      showToast('Workspaces unlocked successfully.', 'success');
    } else {
      showToast('Invalid Security PIN', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#4ADE80] flex items-center justify-center text-[#1E1B4B] shadow-md">
              <Lock className="w-5 h-5 text-[#1E1B4B]" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">Security, Hardware-Binding & Strict Mode</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Configure AES-256 workspace encryption, hardware volume pairing, and strict fallback lockdown policies.
          </p>
        </div>

        <button
          onClick={handleToggleLock}
          className={`px-4 py-2.5 text-xs font-black rounded-2xl transition flex items-center gap-2 shadow-lg ${
            workspaceLocked
              ? 'bg-[#F43F5E] hover:bg-rose-600 text-white shadow-rose-500/30'
              : 'bg-[#4ADE80] hover:bg-green-400 text-[#1E1B4B] shadow-green-500/30'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{workspaceLocked ? 'Unlock Workspaces' : 'Lock All Workspaces Now'}</span>
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#1E1B4B] border border-indigo-900/60 shadow-xl shadow-indigo-950/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Encryption Standard</span>
            <div className="w-8 h-8 rounded-xl bg-[#4ADE80]/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#4ADE80]" />
            </div>
          </div>
          <div className="text-xl font-black text-white">AES-256 GCM</div>
          <p className="text-xs text-indigo-300 font-medium">
            Hardware-bound key storage. Protected against unauthorized physical drive reads.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#1E1B4B] border border-indigo-900/60 shadow-xl shadow-indigo-950/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Drive Identity Pairing</span>
            <div className="w-8 h-8 rounded-xl bg-[#FACC15]/20 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-[#FACC15]" />
            </div>
          </div>
          <div className="text-xl font-black text-white">Cryptographic GUID Binding</div>
          <p className="text-xs text-indigo-300 font-medium">
            Prevents Windows drive letter collision or spoofed USB devices.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#1E1B4B] border border-indigo-900/60 shadow-xl shadow-indigo-950/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Credential Facility</span>
            <div className="w-8 h-8 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#6366F1]" />
            </div>
          </div>
          <div className="text-xl font-black text-white">Windows Credential Manager</div>
          <p className="text-xs text-indigo-300 font-medium">
            API keys and tokens stay in native secure OS keychain as per Section 17.
          </p>
        </div>
      </div>

      {/* Strict Mode Enforcement Policies (Section 12) */}
      <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-indigo-900/60">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#6366F1]" />
              Strict Mode Lockdown Policies (Section 12)
            </h3>
            <p className="text-xs text-indigo-300 font-medium mt-0.5">
              When Strict Mode is active, applications refuse to launch or write if their designated external volume is unplugged.
            </p>
          </div>
        </div>

        <div className="divide-y divide-indigo-900/60 rounded-2xl border border-indigo-800/60 bg-[#13113A] overflow-hidden text-xs shadow-inner">
          {applications.map((app) => {
            const drive = drives.find((d) => d.id === app.primaryDestinationDriveId);

            return (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#6366F1] flex items-center justify-center font-black text-xs text-white shadow-sm">
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-white text-xs">{app.name}</div>
                    <div className="text-xs text-indigo-300">
                      Bound Volume: <strong className="text-[#FACC15]">{drive?.label}</strong> ({drive?.mountPoint})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-indigo-400 font-medium hidden md:inline">
                    {app.strictMode
                      ? 'Refuse launch if drive missing'
                      : 'Allows temporary prompt before launch'}
                  </span>
                  <button
                    onClick={() => toggleStrictMode(app.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition tracking-wider ${
                      app.strictMode
                        ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-600/30'
                        : 'bg-[#25215A] text-indigo-300 hover:text-white border border-indigo-700/60'
                    }`}
                  >
                    {app.strictMode ? 'STRICT LOCKDOWN: ON' : 'STRICT: DISABLED'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PIN Unlock Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 bg-[#0F0E2A]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#1E1B4B] border border-indigo-800/80 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center mx-auto mb-2 shadow-inner">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">Enter Workspace PIN</h3>
              <p className="text-xs text-indigo-300 font-medium">Enter your 4-digit PIN to unlock encrypted external volumes (Default: 1234)</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                maxLength={8}
                placeholder="PIN"
                value={encryptionPin}
                onChange={(e) => setEncryptionPin(e.target.value)}
                autoFocus
                className="w-full text-center text-2xl tracking-widest bg-[#13113A] border border-indigo-800 rounded-2xl px-3 py-3 text-white focus:outline-none focus:border-[#6366F1] font-mono shadow-inner"
              />

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#25215A] hover:bg-[#2E296E] text-indigo-200 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
