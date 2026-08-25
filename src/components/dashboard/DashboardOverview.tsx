import React, { useState } from 'react';
import {
  HardDrive,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Square,
  Lock,
  Thermometer,
  Gauge,
  FolderSync,
  Sparkles,
  ChevronRight,
  Activity,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Plus,
  Laptop,
  Search,
  ArrowRightLeft
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBytes, formatSpeed } from '../../utils/formatters';
import { AddLaptopAppModal } from '../apps/AddLaptopAppModal';
import { ScanLaptopAppsModal } from '../apps/ScanLaptopAppsModal';

export const DashboardOverview: React.FC = () => {
  const {
    drives,
    applications,
    activityLogs,
    localWriteRequests,
    protectionPercentage,
    totalProtectedExternalBytes,
    totalInternalUsedBytes,
    totalRecoveredInternalBytes,
    launchApplication,
    closeApplication,
    runDriveBenchmark,
    benchmarkingDriveId,
    setActiveTab,
    toggleStrictMode
  } = useWorkspace();

  const [selectedAppMap, setSelectedAppMap] = useState<string>(applications[1]?.id || applications[0]?.id);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [appFilterCategory, setAppFilterCategory] = useState<string>('all');
  const pendingApprovalsCount = localWriteRequests.filter((r) => r.status === 'pending').length;

  const currentMapApp = applications.find((a) => a.id === selectedAppMap) || applications[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if local write pending or drive warning */}
      {pendingApprovalsCount > 0 && (
        <div className="bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white p-5 rounded-3xl flex items-center justify-between shadow-xl shadow-rose-500/20 border-2 border-white/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight">
                {pendingApprovalsCount} Unexpected Local Storage Request{pendingApprovalsCount > 1 ? 's' : ''} Intercepted
              </h4>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                Applications are requesting to write to your laptop disk (C:\). Review and choose whether to redirect, allow, or block.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('approvals')}
            className="px-4 py-2 bg-[#FACC15] hover:bg-yellow-300 text-[#1E1B4B] font-black text-xs rounded-2xl transition shadow-lg flex items-center gap-1.5 shrink-0"
          >
            <span>Review Requests</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Metrics Cards in Vibrant Theme (High-Contrast White, Yellow, Green, and Midnight Indigo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Protection percentage (Crisp White Card with Hot Rose Accents) */}
        <div className="bg-white text-[#1E1B4B] rounded-3xl p-5 relative overflow-hidden shadow-xl shadow-indigo-950/20 border border-indigo-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-indigo-900/60 uppercase tracking-widest">Internal Disk Protected</span>
            <span className="p-2 rounded-2xl bg-rose-50 text-[#F43F5E] font-black">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-[#1E1B4B]">{protectionPercentage}%</span>
            <span className="text-xs font-black text-[#F43F5E] flex items-center bg-rose-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Optimal
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#F43F5E] to-[#FB7185] h-full rounded-full transition-all duration-500"
              style={{ width: `${protectionPercentage}%` }}
            />
          </div>
          <p className="mt-2.5 text-xs text-indigo-950/70 font-semibold">
            {formatBytes(totalProtectedExternalBytes)} external / {formatBytes(totalInternalUsedBytes)} internal
          </p>
        </div>

        {/* Metric 2: Recovered internal storage (Vibrant Sunshine Yellow Card) */}
        <div className="bg-[#FACC15] text-[#1E1B4B] rounded-3xl p-5 shadow-xl shadow-yellow-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#1E1B4B]/70 uppercase tracking-widest">Storage Recovered</span>
            <span className="p-2 rounded-2xl bg-[#1E1B4B]/10 text-[#1E1B4B]">
              <HardDrive className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-[#1E1B4B]">{formatBytes(totalRecoveredInternalBytes)}</span>
            <span className="text-xs font-black bg-[#1E1B4B] text-[#FACC15] px-2 py-0.5 rounded-full">
              offloaded
            </span>
          </div>
          <p className="mt-3 text-xs text-[#1E1B4B]/80 font-bold">
            Saved from laptop SSD wear & capacity limits
          </p>
        </div>

        {/* Metric 3: Connected external destinations (Vibrant Fresh Green Card) */}
        <div className="bg-[#4ADE80] text-[#1E1B4B] rounded-3xl p-5 shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#1E1B4B]/70 uppercase tracking-widest">Active Destinations</span>
            <span className="p-2 rounded-2xl bg-[#1E1B4B]/10 text-[#1E1B4B]">
              <FolderSync className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-[#1E1B4B]">
              {drives.filter((d) => d.isConnected && d.type !== 'internal').length}
            </span>
            <span className="text-xs font-bold text-[#1E1B4B]/70">/ {drives.length - 1} external drives</span>
          </div>
          <p className="mt-3 text-xs text-[#1E1B4B] font-black flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1E1B4B]"></span>
            All primary routes healthy
          </p>
        </div>

        {/* Metric 4: Protected Applications (Deep Midnight Indigo Card) */}
        <div className="bg-[#1E1B4B] text-white rounded-3xl p-5 border border-indigo-800/60 shadow-xl shadow-indigo-950/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Managed Applications</span>
            <span className="p-2 rounded-2xl bg-[#6366F1]/20 text-[#6366F1]">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-white">{applications.length}</span>
            <span className="text-xs text-[#4ADE80] font-bold">
              ({applications.filter((a) => a.isRunning).length} running)
            </span>
          </div>
          <p className="mt-3 text-xs text-indigo-200 font-medium">
            <strong className="text-white font-bold">{applications.filter((a) => a.status === 'fully_protected').length}</strong> Protected,{' '}
            <strong className="text-white font-bold">{applications.filter((a) => a.status === 'partially_protected').length}</strong> Partial
          </p>
        </div>
      </div>

      {/* Connected Storage Devices section */}
      <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#F43F5E]" />
              Connected Storage Devices
            </h3>
            <p className="text-xs text-indigo-300 mt-0.5">Hardware identity, live transfer speeds, health diagnostics, and encryption status</p>
          </div>
          <button
            onClick={() => setActiveTab('drives')}
            className="text-xs text-[#FACC15] hover:text-yellow-300 font-bold flex items-center gap-1 transition"
          >
            <span>Full Drive Manager & Benchmarks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drives.map((drive) => {
            const usedPct = Math.round((drive.usedBytes / drive.totalBytes) * 100);
            const isBenchmarking = benchmarkingDriveId === drive.id;

            return (
              <div
                key={drive.id}
                className={`p-4.5 rounded-2xl border transition-all ${
                  drive.isConnected
                    ? 'bg-[#13113A] border-indigo-800/60 hover:border-indigo-600 hover:shadow-lg'
                    : 'bg-[#13113A]/50 border-indigo-950 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-md ${
                        drive.type === 'nvme'
                          ? 'bg-[#F43F5E] text-white shadow-rose-500/20'
                          : drive.type === 'ssd'
                          ? 'bg-[#6366F1] text-white shadow-indigo-500/20'
                          : drive.type === 'hdd'
                          ? 'bg-[#FACC15] text-[#1E1B4B] shadow-yellow-500/20'
                          : drive.type === 'cloud'
                          ? 'bg-sky-400 text-[#1E1B4B]'
                          : 'bg-indigo-900 text-white'
                      }`}
                    >
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-white">{drive.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#25215A] rounded-md text-indigo-200 font-bold">
                          {drive.mountPoint}
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-300 font-medium block truncate max-w-[140px] mt-0.5">
                        {drive.volumeIdentity}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      !drive.isConnected
                        ? 'bg-rose-500/20 text-rose-300'
                        : drive.health === 'excellent'
                        ? 'bg-[#4ADE80] text-[#1E1B4B]'
                        : drive.health === 'good'
                        ? 'bg-[#6366F1] text-white'
                        : 'bg-[#FACC15] text-[#1E1B4B]'
                    }`}
                  >
                    {!drive.isConnected ? 'Disconnected' : drive.health}
                  </span>
                </div>

                {/* Capacity Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-indigo-200 font-medium mb-1.5">
                    <span>{formatBytes(drive.freeBytes)} free</span>
                    <span className="font-bold text-white">{usedPct}% used</span>
                  </div>
                  <div className="w-full bg-[#25215A] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        usedPct > 85 ? 'bg-[#F43F5E]' : 'bg-[#6366F1]'
                      }`}
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                </div>

                {/* Speed & Diagnostics */}
                <div className="mt-3.5 pt-3 border-t border-indigo-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-indigo-200">
                    <div className="flex items-center gap-1 font-bold text-white" title="Read Speed">
                      <Gauge className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>{formatSpeed(drive.readSpeedMBs)}</span>
                    </div>
                    {drive.temperatureC && (
                      <div className="flex items-center gap-1 text-indigo-300" title="Temperature">
                        <Thermometer className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{drive.temperatureC}°C</span>
                      </div>
                    )}
                    {drive.isEncrypted && (
                      <div className="flex items-center gap-1 text-[#4ADE80]" title="AES-256 Encrypted">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {drive.isConnected && (
                    <button
                      onClick={() => runDriveBenchmark(drive.id)}
                      disabled={isBenchmarking}
                      className="text-[10px] px-2.5 py-1 rounded-xl bg-[#25215A] hover:bg-[#2E296E] text-white font-bold transition flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 text-[#FACC15] ${isBenchmarking ? 'animate-spin' : ''}`} />
                      <span>{isBenchmarking ? 'Testing...' : 'Benchmark'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Active Applications & Interactive Storage Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Managed Applications Table */}
        <div className="lg:col-span-2 bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#FACC15]" />
                Laptop Applications & Storage Protection
              </h3>
              <p className="text-xs text-indigo-300 mt-0.5">Installed software, browsers, dev tools, and creative apps with C:\ to D:\ redirection</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScanModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 hover:text-white font-bold text-xs transition flex items-center gap-1.5 border border-indigo-700/60"
              >
                <Search className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Scan Laptop Apps</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Laptop App</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-indigo-900/60">
            {[
              { id: 'all', label: 'All Apps' },
              { id: 'browser', label: 'Browsers' },
              { id: 'ide', label: 'IDEs & Code' },
              { id: 'dev_tool', label: 'Dev Tools' },
              { id: 'creative', label: 'Creative & Video' },
              { id: 'gaming', label: 'Gaming' },
              { id: 'productivity', label: 'Office & Productivity' },
              { id: 'ai_assistant', label: 'AI Apps' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAppFilterCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition shrink-0 ${
                  appFilterCategory === cat.id
                    ? 'bg-[#6366F1] text-white shadow-sm'
                    : 'bg-[#13113A] text-indigo-300 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-black text-indigo-300 uppercase tracking-widest border-b border-indigo-800/60 bg-[#13113A]/80">
                <tr>
                  <th className="py-3 px-3.5 rounded-l-xl">Application</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">External Storage</th>
                  <th className="py-3 px-3.5">Primary Destination</th>
                  <th className="py-3 px-3.5">Strict Mode</th>
                  <th className="py-3 px-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-900/40">
                {applications
                  .filter((app) => {
                    if (appFilterCategory === 'all') return true;
                    return app.category === appFilterCategory;
                  })
                  .map((app) => {
                  const primaryDrive = drives.find((d) => d.id === app.primaryDestinationDriveId);
                  const isSelected = selectedAppMap === app.id;

                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedAppMap(app.id)}
                      className={`hover:bg-indigo-900/30 transition cursor-pointer ${
                        isSelected ? 'bg-indigo-900/40 border-l-4 border-[#F43F5E]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white font-black text-xs shadow-md">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-white flex items-center gap-2">
                              <span>{app.name}</span>
                              {app.isRunning && (
                                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" title="Running" />
                              )}
                            </div>
                            <span className="text-[10px] text-indigo-300 font-mono truncate max-w-[160px] block">{app.adapterVersion}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#25215A] text-indigo-200 font-bold uppercase">
                          {app.category ? app.category.replace('_', ' ') : 'App'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 font-bold text-white">
                        {formatBytes(app.externalUsageBytes)}
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              primaryDrive?.isConnected ? 'bg-[#4ADE80]' : 'bg-[#F43F5E]'
                            }`}
                          />
                          <span className="font-bold text-indigo-100">{primaryDrive?.label || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleStrictMode(app.id)}
                          className={`text-[10px] px-2.5 py-1 rounded-xl font-black transition ${
                            app.strictMode
                              ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/30'
                              : 'bg-[#25215A] text-indigo-300'
                          }`}
                          title="Block launch if required external storage is disconnected"
                        >
                          {app.strictMode ? 'STRICT: ON' : 'STRICT: OFF'}
                        </button>
                      </td>
                      <td className="py-3.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedAppMap(app.id);
                              setActiveTab('migration');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#25215A] hover:bg-[#312B77] text-[#FACC15] text-xs font-bold transition inline-flex items-center gap-1 border border-indigo-700/40"
                            title="Open Migration Wizard for this application"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Migrate</span>
                          </button>

                          {app.isRunning ? (
                            <button
                              onClick={() => closeApplication(app.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#F43F5E] hover:bg-rose-600 text-white text-xs font-black transition inline-flex items-center gap-1 shadow-md shadow-rose-500/20"
                            >
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => launchApplication(app.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#6366F1] hover:bg-indigo-500 text-white text-xs font-black transition inline-flex items-center gap-1 shadow-md shadow-indigo-600/30"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Launch</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Interactive Storage Map of Selected App */}
        <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <FolderSync className="w-4 h-4 text-[#4ADE80]" />
                Live Storage Map
              </h3>
              <span className="text-[10px] font-mono bg-[#25215A] px-2.5 py-1 rounded-lg text-[#FACC15] font-bold">
                {currentMapApp.name}
              </span>
            </div>
            <p className="text-xs text-indigo-300 mb-4">
              Exact physical routing breakdown per data category for {currentMapApp.name}:
            </p>

            <div className="bg-[#13113A] rounded-2xl p-4 border border-indigo-800/60 font-mono text-xs space-y-2.5 shadow-inner">
              <div className="text-[#FACC15] font-black flex items-center gap-2">
                <span>📁 {currentMapApp.name}</span>
                <span className="text-[10px] font-normal text-indigo-300">({currentMapApp.adapterVersion})</span>
              </div>
              <div className="pl-3 border-l-2 border-indigo-800/80 space-y-2.5 text-xs">
                {currentMapApp.categoryRoutings.map((routing, idx) => {
                  const targetDrive = drives.find((d) => d.id === routing.destinationDriveId);
                  const isLast = idx === currentMapApp.categoryRoutings.length - 1;
                  return (
                    <div key={routing.category} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <span className="text-indigo-500">{isLast ? '└──' : '├──'}</span>
                        <span className="capitalize font-bold">{routing.category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold ${
                            targetDrive?.type === 'internal'
                              ? 'bg-[#FACC15] text-[#1E1B4B]'
                              : 'bg-[#6366F1] text-white'
                          }`}
                        >
                          {targetDrive?.label || 'Unassigned'}
                        </span>
                        {routing.approvalRequired && (
                          <span className="text-[9px] text-[#F43F5E] font-sans font-black" title="Approval Required">
                            [PROMPT]
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-indigo-900/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('migration')}
              className="py-2.5 bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Migrate Folders</span>
            </button>
            <button
              onClick={() => setActiveTab('router')}
              className="py-2.5 bg-[#25215A] hover:bg-[#2F2A6E] text-indigo-200 hover:text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 border border-indigo-800/40"
            >
              <span>Routing Matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#FACC15]" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Activity Monitor & Ticker */}
      <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[#6366F1]/20 text-[#6366F1]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Live Storage Activity Monitor</h3>
              <p className="text-xs text-indigo-300">Real-time I/O stream, unexpected write interceptions, and checksum transfers</p>
            </div>
          </div>
          <span className="text-xs text-indigo-200 font-bold flex items-center gap-2 bg-[#13113A] px-3 py-1.5 rounded-full border border-indigo-800/40">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] animate-ping"></span>
            Streaming Live I/O
          </span>
        </div>

        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {activityLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#13113A] border border-indigo-800/50 text-xs transition hover:border-indigo-600"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-[11px] font-mono text-indigo-400 font-bold">{log.timestamp}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    log.status === 'success'
                      ? 'bg-[#4ADE80]'
                      : log.status === 'warning'
                      ? 'bg-[#FACC15]'
                      : 'bg-[#F43F5E]'
                  }`}
                />
                <span className="font-black text-white">{log.appName}</span>
                <span className="text-indigo-200 truncate max-w-md hidden md:inline font-medium">{log.message}</span>
              </div>
              <div className="flex items-center gap-3 text-right shrink-0">
                {log.speedMBs && (
                  <span className="text-xs font-mono text-[#FACC15] font-black">{log.speedMBs} MB/s</span>
                )}
                <span className="text-[10px] font-mono bg-[#25215A] px-2.5 py-1 rounded-lg text-indigo-200 font-bold">
                  {log.driveLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals for Laptop App Adding and Scanning */}
      <AddLaptopAppModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <ScanLaptopAppsModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} />
    </div>
  );
};
