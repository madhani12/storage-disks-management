import React, { useState } from 'react';
import {
  X,
  Plus,
  Laptop,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  HardDrive
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ApplicationProfile, AppCategory, DataCategory } from '../../types';

interface AddLaptopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { value: AppCategory; label: string }[] = [
  { value: 'browser', label: 'Web Browser (Chrome, Edge, Firefox, etc.)' },
  { value: 'ide', label: 'IDE & Code Editor (VS Code, IntelliJ, Visual Studio)' },
  { value: 'dev_tool', label: 'Developer Tool / CLI (Node.js, Docker, Python, Git)' },
  { value: 'gaming', label: 'Game / Launcher (Steam, Epic Games, Riot)' },
  { value: 'creative', label: 'Creative & Video (Adobe, Blender, DaVinci, Spotify)' },
  { value: 'productivity', label: 'Office & Productivity (Office 365, Notion, Slack)' },
  { value: 'ai_assistant', label: 'AI Desktop App (ChatGPT, Claude, Copilot)' },
  { value: 'local_model', label: 'Local ML Model Server (Ollama, LM Studio)' },
  { value: 'utility', label: 'System Utility / Tool' },
  { value: 'other', label: 'Other Installed Application' }
];

export const AddLaptopAppModal: React.FC<AddLaptopAppModalProps> = ({ isOpen, onClose }) => {
  const { drives, addCustomLaptopApp, showToast } = useWorkspace();

  const [appName, setAppName] = useState('');
  const [category, setCategory] = useState<AppCategory>('productivity');
  const [localPath, setLocalPath] = useState('C:\\Users\\User\\AppData\\Local\\MyApp');
  const [folderName, setFolderName] = useState('AppData Cache & Storage');
  const [targetDriveId, setTargetDriveId] = useState(drives.find((d) => d.type !== 'internal')?.id || drives[0]?.id);
  const [estimatedSizeGB, setEstimatedSizeGB] = useState('12.5');

  if (!isOpen) return null;

  const targetDrive = drives.find((d) => d.id === targetDriveId) || drives[0];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) {
      showToast('Please enter an application name', 'warning');
      return;
    }
    if (!localPath.trim()) {
      showToast('Please enter the local folder path on C:\\', 'warning');
      return;
    }

    const slug = appName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const sizeBytes = (parseFloat(estimatedSizeGB) || 5) * 1024 * 1024 * 1024;
    const targetPath = `${targetDrive.mountPoint}EWM-Workspace\\applications\\${slug}\\data`;

    const newApp: ApplicationProfile = {
      id: 'app_custom_' + Date.now(),
      name: appName.trim(),
      slug,
      iconName: 'Laptop',
      category,
      compatibility: 'platinum',
      status: 'fully_protected',
      internalUsageBytes: 0.1 * 1024 * 1024 * 1024,
      externalUsageBytes: sizeBytes,
      primaryDestinationDriveId: targetDrive.id,
      strictMode: false,
      adapterVersion: 'v1.0.0 (Custom Laptop App NTFS Junction)',
      isRunning: false,
      lastActive: 'Just added',
      isCustomLaptopApp: true,
      categoryRoutings: [
        {
          category: 'caches',
          destinationDriveId: targetDrive.id,
          method: 'ntfs_junction'
        },
        {
          category: 'projects',
          destinationDriveId: targetDrive.id,
          method: 'ntfs_junction'
        }
      ],
      fallbackDriveIds: ['drive_internal_c'],
      defaultLocations: [
        {
          name: folderName || `${appName} Main Storage`,
          originalPath: localPath.trim(),
          suggestedCategory: 'caches',
          sizeBytes,
          safetyStatus: 'safe_to_redirect',
          isRedirected: true,
          targetPath
        }
      ]
    };

    addCustomLaptopApp(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E1B4B] border border-indigo-700/60 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#2A247A] to-[#1E1B4B] border-b border-indigo-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-lg">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Add Installed Laptop Application</h3>
              <p className="text-xs text-indigo-300">Route any software, game, or tool from C:\ to your External HDD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAdd} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">
              Application Name
            </label>
            <input
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. AutoCAD, PyCharm, DaVinci Resolve, Unreal Engine, Ableton Live"
              className="w-full bg-[#13113A] border border-indigo-700/60 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366F1] font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AppCategory)}
                className="w-full bg-[#13113A] border border-indigo-700/60 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366F1] font-bold"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">
                Estimated Size to Offload (GB)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={estimatedSizeGB}
                onChange={(e) => setEstimatedSizeGB(e.target.value)}
                className="w-full bg-[#13113A] border border-indigo-700/60 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366F1] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">
              Local Folder on Internal Storage (C:\) to Redirect
            </label>
            <input
              type="text"
              required
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              placeholder="e.g. C:\Users\User\AppData\Local\MySoftware\Cache"
              className="w-full bg-[#13113A] border border-indigo-700/60 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366F1] font-mono"
            />
            <span className="text-[10px] text-indigo-400 mt-1 block">
              Typical paths: <code className="text-indigo-200">C:\Users\...\AppData\Local\...</code> or <code className="text-indigo-200">C:\ProgramData\...</code>
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">
              Destination External Hard Disk
            </label>
            <select
              value={targetDriveId}
              onChange={(e) => setTargetDriveId(e.target.value)}
              className="w-full bg-[#13113A] border border-indigo-700/60 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6366F1] font-bold"
            >
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} ({d.mountPoint}) {d.type === 'internal' ? '[Laptop Internal]' : '🟢 [External Destination]'}
                </option>
              ))}
            </select>
          </div>

          {/* Redirection Preview Box */}
          <div className="p-3.5 bg-[#13113A] rounded-2xl border border-indigo-800/60 space-y-1.5 font-mono text-[11px]">
            <div className="text-[#4ADE80] font-black flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>NTFS Junction Link will be created:</span>
            </div>
            <div className="text-indigo-300 truncate">
              {localPath} <span className="text-white font-black">➔</span> {targetDrive.mountPoint}EWM-Workspace\applications\{appName ? appName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'app'}\data
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-indigo-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-indigo-500 text-white font-black transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add & Protect App</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
