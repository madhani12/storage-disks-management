import React, { useState } from 'react';
import {
  LayoutDashboard,
  Route,
  HardDrive,
  FolderTree,
  ArrowRightLeft,
  Puzzle,
  ShieldAlert,
  FileCheck2,
  Trash2,
  DatabaseBackup,
  Lock,
  ChevronRight,
  Laptop,
  Download
} from 'lucide-react';
import { useWorkspace, NavigationTab } from '../../context/WorkspaceContext';
import { DesktopInstallerModal } from '../desktop/DesktopInstallerModal';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  category?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, localWriteRequests, sessionFiles, cleanableItems } = useWorkspace();
  const [installerModalOpen, setInstallerModalOpen] = useState(false);

  const pendingApprovalsCount = localWriteRequests.filter((r) => r.status === 'pending').length;
  const sessionReviewCount = sessionFiles.length;
  const cleanupItemsCount = cleanableItems.length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
    { id: 'router', label: 'Storage Router', icon: Route, category: 'Storage Management' },
    { id: 'drives', label: 'Drives & Benchmarks', icon: HardDrive, category: 'Storage Management' },
    { id: 'explorer', label: 'Workspace Explorer', icon: FolderTree, category: 'Storage Management' },
    { id: 'migration', label: 'Apps & Migration', icon: ArrowRightLeft, category: 'Application Control' },
    { id: 'adapters', label: 'Adapters & Matrix', icon: Puzzle, category: 'Application Control' },
    {
      id: 'approvals',
      label: 'Local Approvals',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-[#F43F5E] text-white font-black shadow-sm',
      category: 'Governance & Session'
    },
    {
      id: 'session_review',
      label: 'Session Review',
      icon: FileCheck2,
      badge: sessionReviewCount > 0 ? sessionReviewCount : undefined,
      badgeColor: 'bg-[#FACC15] text-[#1E1B4B] font-black shadow-sm',
      category: 'Governance & Session'
    },
    {
      id: 'cleanup',
      label: 'Cleanup Center',
      icon: Trash2,
      badge: cleanupItemsCount > 0 ? cleanupItemsCount : undefined,
      badgeColor: 'bg-[#4ADE80] text-[#1E1B4B] font-black shadow-sm',
      category: 'Maintenance'
    },
    { id: 'backups', label: 'Backup & Snapshots', icon: DatabaseBackup, category: 'Maintenance' },
    { id: 'security', label: 'Security & Strict Mode', icon: Lock, category: 'Maintenance' }
  ];

  // Group by category
  const categories = Array.from(new Set(navItems.map((item) => item.category)));

  return (
    <aside className="w-64 bg-[#13113A] border-r border-indigo-950/80 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="p-3.5 space-y-5">
        {categories.map((catName) => (
          <div key={catName} className="space-y-1">
            <div className="px-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              {catName}
            </div>
            <div className="space-y-1 pt-1">
              {navItems
                .filter((item) => item.category === catName)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
                        isActive
                          ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-600/30 font-black'
                          : 'text-indigo-200 hover:text-white hover:bg-[#1E1B4B]/80 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-[#1E1B4B] text-indigo-200'}`}>
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight className="w-3.5 h-3.5 text-white opacity-80" />
                      ) : null}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Install on Laptop Desktop CTA Card */}
      <div className="p-3">
        <div className="p-3 bg-gradient-to-br from-indigo-950/90 to-[#1E1B4B] rounded-2xl border border-indigo-700/60 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#4ADE80] flex items-center justify-center text-[#1E1B4B]">
              <Laptop className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-white">Laptop Desktop App</span>
          </div>
          <p className="text-[11px] text-indigo-300">
            Package as native <strong className="text-white">.EXE</strong> or 1-click Windows launcher.
          </p>
          <button
            onClick={() => setInstallerModalOpen(true)}
            className="w-full py-1.5 px-3 bg-[#4ADE80] hover:bg-emerald-400 text-[#1E1B4B] font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-3 h-3" />
            <span>Install .EXE / App</span>
          </button>
        </div>
      </div>

      {/* Footer system status indicator */}
      <div className="p-3.5 border-t border-indigo-950/80 bg-[#1E1B4B]/70">
        <div className="flex items-center justify-between text-[11px] text-indigo-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] shadow-sm shadow-[#4ADE80]/50"></span>
            <span className="font-bold text-white">NTFS Interceptor</span>
          </div>
          <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950/60 px-2 py-0.5 rounded-full">Win11 ProjFS</span>
        </div>
      </div>

      <DesktopInstallerModal isOpen={installerModalOpen} onClose={() => setInstallerModalOpen(false)} />
    </aside>
  );
};
