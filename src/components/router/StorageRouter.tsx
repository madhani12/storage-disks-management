import React, { useState } from 'react';
import {
  Route,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Shield,
  Layers,
  HardDrive,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FolderPlus,
  Radio,
  Info
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DataCategory, RedirectionMethod, RoutingRule } from '../../types';
import { getCategoryLabel, getMethodLabel } from '../../utils/formatters';
import { StorageScannerModal } from '../drives/StorageScannerModal';

export const StorageRouter: React.FC = () => {
  const {
    applications,
    drives,
    rules,
    updateAppRouting,
    setPrimaryDestination,
    toggleStrictMode,
    addRule,
    toggleRuleActive,
    deleteRule,
    clearDemoDrives,
    mountPhysicalDirectory,
    isScanning,
    showToast
  } = useWorkspace();

  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  // New Rule form state
  const [newRuleName, setNewRuleName] = useState('');
  const [newConditionType, setNewConditionType] = useState<RoutingRule['conditionType']>('category_matches');
  const [newConditionValue, setNewConditionValue] = useState('models');
  const [newTargetDriveId, setNewTargetDriveId] = useState(drives[1]?.id || drives[0]?.id);
  const [newAction, setNewAction] = useState<RoutingRule['action']>('route_to_target');
  const [newDescription, setNewDescription] = useState('');

  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const hasDemoDrives = drives.some(
    (d) => !d.isRealDevice && d.originType !== 'custom_hardware' && d.originType !== 'real_filesystem' && d.type !== 'internal'
  );

  const realDrives = drives.filter(
    (d) => d.isRealDevice || d.originType === 'custom_hardware' || d.originType === 'real_filesystem' || d.type === 'internal'
  );
  const demoDrives = drives.filter(
    (d) => !d.isRealDevice && d.originType !== 'custom_hardware' && d.originType !== 'real_filesystem' && d.type !== 'internal'
  );

  const categoriesList: DataCategory[] = [
    'projects',
    'attachments',
    'models',
    'caches',
    'environments',
    'packages',
    'logs',
    'backups',
    'temp_files',
    'artifacts'
  ];

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) {
      showToast('Rule name is required', 'warning');
      return;
    }
    addRule({
      name: newRuleName,
      conditionType: newConditionType,
      conditionValue: newConditionValue,
      targetDriveId: newTargetDriveId,
      action: newAction,
      isActive: true,
      priority: rules.length + 1,
      description: newDescription || `Custom policy routing ${newConditionValue} to selected target.`
    });
    setIsRuleModalOpen(false);
    setNewRuleName('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-md">
              <Route className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">Multi-Drive Storage Routing</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Assign application workspaces, caches, models, and artifacts across multiple connected hardware volumes.
          </p>
        </div>
        <button
          onClick={() => setIsRuleModalOpen(true)}
          className="px-4 py-2.5 bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Routing Rule</span>
        </button>
      </div>

      {/* Main Grid: Left side App Multi-Destination Editor, Right side Rules Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Per-Application Granular Category Router (7 cols) */}
        <div className="lg:col-span-7 bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-indigo-900/60">
            <div>
              <h3 className="text-base font-black text-white">Application Destination Matrix</h3>
              <p className="text-xs text-indigo-300 mt-0.5">Select an application to customize its multi-folder routing</p>
            </div>

            {/* App selector pill tab list */}
            <div className="flex gap-1.5 overflow-x-auto max-w-xs p-1 bg-[#13113A] rounded-2xl border border-indigo-800/60">
              {applications.slice(0, 4).map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                    selectedAppId === app.id
                      ? 'bg-[#F43F5E] text-white shadow-md shadow-rose-500/30'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  {app.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Current Selected App Overview Banner */}
          <div className="bg-[#13113A] p-4.5 rounded-2xl border border-indigo-800/60 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#6366F1] flex items-center justify-center font-black text-white text-base shadow-md">
                {selectedApp.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-black text-white">{selectedApp.name}</h4>
                <div className="flex items-center gap-2 text-xs text-indigo-300 mt-0.5 font-medium">
                  <span>Adapter: <strong className="text-white font-bold">{selectedApp.adapterVersion}</strong></span>
                  <span>•</span>
                  <span>External: <strong className="text-[#4ADE80] font-black">{(selectedApp.externalUsageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleStrictMode(selectedApp.id)}
                className={`text-xs px-3.5 py-2 rounded-xl font-black transition ${
                  selectedApp.strictMode
                    ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/30'
                    : 'bg-[#25215A] text-indigo-300 hover:bg-[#2E296E]'
                }`}
              >
                {selectedApp.strictMode ? 'Strict Launch: ACTIVE' : 'Strict Mode: OFF'}
              </button>
            </div>
          </div>

          {/* Sample Storage Notice & Mount Physical Drive Quick Bar */}
          {hasDemoDrives && (
            <div className="bg-[#25215A]/70 border border-[#FACC15]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-black text-[#FACC15]">Sample Storage Profiles Detected: </span>
                  <span className="text-indigo-200">
                    The dropdown below includes sample starter templates (e.g. AI-SSD-01, Portable-NVMe). You can purge them or mount your real drive / folder.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setScannerModalOpen(true)}
                  className="px-3 py-1.5 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1B4B] text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Scan / Mount Real</span>
                </button>
                <button
                  onClick={clearDemoDrives}
                  className="px-3 py-1.5 bg-[#F43F5E]/20 hover:bg-[#F43F5E] text-[#F43F5E] hover:text-white text-xs font-bold rounded-xl transition"
                >
                  Purge Sample Drives
                </button>
              </div>
            </div>
          )}

          {/* Granular Data Categories Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black text-indigo-300 uppercase tracking-widest px-1">
              <span>Data Category Destinations</span>
              <button
                onClick={() => setScannerModalOpen(true)}
                className="text-[#4ADE80] hover:underline flex items-center gap-1 lowercase font-mono font-bold"
              >
                <FolderPlus className="w-3 h-3" />
                <span>+ mount physical external folder</span>
              </button>
            </div>

            <div className="divide-y divide-indigo-900/60 rounded-2xl border border-indigo-800/60 bg-[#13113A] overflow-hidden shadow-inner">
              {categoriesList.map((cat) => {
                const currentRouting = selectedApp.categoryRoutings.find((r) => r.category === cat);
                const assignedDriveId = currentRouting?.destinationDriveId || selectedApp.primaryDestinationDriveId;
                const assignedMethod = currentRouting?.method || 'ntfs_junction';
                const assignedDrive = drives.find((d) => d.id === assignedDriveId);

                return (
                  <div key={cat} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-indigo-900/20 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]"></span>
                      <div>
                        <div className="text-xs font-bold text-white capitalize">{getCategoryLabel(cat)}</div>
                        <div className="text-[10px] text-indigo-300 font-mono">
                          Method: {getMethodLabel(assignedMethod)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Destination Drive Dropdown with Grouping */}
                      <select
                        value={assignedDriveId}
                        onChange={(e) => {
                          if (e.target.value === '__MOUNT_NEW__') {
                            setScannerModalOpen(true);
                            return;
                          }
                          updateAppRouting(selectedApp.id, cat, e.target.value, assignedMethod);
                        }}
                        className="bg-[#1E1B4B] border border-indigo-700/60 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6366F1] font-bold"
                      >
                        {realDrives.length > 0 && (
                          <optgroup label="— Physical Hardware & Real Drives —">
                            {realDrives.map((d) => (
                              <option key={d.id} value={d.id}>
                                🟢 {d.label} ({d.mountPoint}) {d.isRealDevice ? '[REAL DEVICE]' : ''}
                              </option>
                            ))}
                          </optgroup>
                        )}

                        {demoDrives.length > 0 && (
                          <optgroup label="— Sample Starter Profiles —">
                            {demoDrives.map((d) => (
                              <option key={d.id} value={d.id}>
                                📦 {d.label} ({d.mountPoint}) - [Sample]
                              </option>
                            ))}
                          </optgroup>
                        )}

                        <option value="__MOUNT_NEW__">➕ Mount Real Folder / Drive...</option>
                      </select>

                      {/* Redirection Method Dropdown */}
                      <select
                        value={assignedMethod}
                        onChange={(e) => updateAppRouting(selectedApp.id, cat, assignedDriveId, e.target.value as RedirectionMethod)}
                        className="bg-[#1E1B4B] border border-indigo-700/60 text-indigo-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#6366F1]"
                      >
                        <option value="ntfs_junction">NTFS Junction</option>
                        <option value="symlink">Symlink</option>
                        <option value="env_variables">Env Variable</option>
                        <option value="app_adapter">App Adapter</option>
                        <option value="filesystem_virtualization">ProjFS Virtual</option>
                        <option value="sandboxed_execution">Sandboxed</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Routing Rules Engine & Fallback Policies (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Rules List */}
          <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FACC15]" />
                  Active Storage Routing Rules
                </h3>
                <p className="text-xs text-indigo-300">Rules evaluated sequentially by priority</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {rules.map((rule) => {
                const targetDrive = drives.find((d) => d.id === rule.targetDriveId);

                return (
                  <div
                    key={rule.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      rule.isActive
                        ? 'bg-[#13113A] border-indigo-800/60 hover:border-indigo-600'
                        : 'bg-[#13113A]/50 border-indigo-950 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#6366F1] text-white font-black text-[11px] flex items-center justify-center shadow-sm">
                            {rule.priority}
                          </span>
                          <span className="font-black text-xs text-white">{rule.name}</span>
                        </div>
                        <p className="text-xs text-indigo-200 pl-8 font-medium">{rule.description}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleRuleActive(rule.id)}
                          className={`text-[10px] px-2.5 py-1 rounded-full font-black transition shadow-sm ${
                            rule.isActive
                              ? 'bg-[#4ADE80] text-[#1E1B4B]'
                              : 'bg-[#25215A] text-indigo-300'
                          }`}
                        >
                          {rule.isActive ? 'ACTIVE' : 'OFF'}
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="p-1.5 text-indigo-400 hover:text-[#F43F5E] transition"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-indigo-900/60 flex items-center justify-between text-[11px] font-mono text-indigo-300 pl-8">
                      <span>Condition: <strong className="text-white">{rule.conditionType}</strong></span>
                      <span className="text-[#FACC15] font-bold">
                        Target: {targetDrive?.label || rule.targetDriveId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disconnect Fallback Hierarchy Policy */}
          <div className="bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-3.5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4ADE80]" />
              <h3 className="text-base font-black text-white">Hardware Disconnect Fallback Chain</h3>
            </div>
            <p className="text-xs text-indigo-300">
              When an assigned external volume is disconnected, EWM prevents silent fallback to the internal laptop disk.
            </p>

            <div className="bg-[#13113A] p-4 rounded-2xl border border-indigo-800/60 font-mono text-xs space-y-2.5 shadow-inner">
              <div className="flex items-center gap-2 text-indigo-200">
                <span className="text-indigo-400 font-bold">1. Primary:</span>
                <span className="text-white font-semibold">Assigned Dedicated Storage Volume</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="text-indigo-400 font-bold">2. Fallback 1:</span>
                <span className="font-semibold">Secondary Backup Portable SSD (AI-SSD-01)</span>
              </div>
              <div className="flex items-center gap-2 text-purple-300">
                <span className="text-indigo-400 font-bold">3. Fallback 2:</span>
                <span className="font-semibold">Network Office NAS / Cloud Vault</span>
              </div>
              <div className="flex items-center gap-2 text-[#FACC15] font-bold">
                <span className="text-indigo-400 font-bold">4. Final:</span>
                <span>Prompt User & Require Explicit Approval Before C:\ Write</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Routing Rule */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#1E1B4B] border border-indigo-700/60 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6366F1] flex items-center justify-center text-white">
                  <Route className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-black text-white">Add Custom Routing Rule</h3>
              </div>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#25215A] hover:bg-[#2E296E] flex items-center justify-center text-indigo-300 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-indigo-200 font-bold mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Route AI Models > 10GB to Portable-NVMe"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-[#13113A] border border-indigo-700/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#6366F1] font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-indigo-200 font-bold mb-1">Condition Trigger</label>
                  <select
                    value={newConditionType}
                    onChange={(e) => setNewConditionType(e.target.value as RoutingRule['conditionType'])}
                    className="w-full bg-[#13113A] border border-indigo-700/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#6366F1] font-medium"
                  >
                    <option value="category_matches">Data Category Matches</option>
                    <option value="app_matches">Application Matches</option>
                    <option value="size_greater_than">File Size Greater Than</option>
                    <option value="temp_file">Temporary File Write</option>
                  </select>
                </div>

                <div>
                  <label className="block text-indigo-200 font-bold mb-1">Trigger Value</label>
                  <input
                    type="text"
                    placeholder="e.g. models, 10737418240, *.safetensors"
                    value={newConditionValue}
                    onChange={(e) => setNewConditionValue(e.target.value)}
                    className="w-full bg-[#13113A] border border-indigo-700/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#6366F1] font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-indigo-200 font-bold mb-1">Target Destination Drive</label>
                  <select
                    value={newTargetDriveId}
                    onChange={(e) => setNewTargetDriveId(e.target.value)}
                    className="w-full bg-[#13113A] border border-indigo-700/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#6366F1] font-medium"
                  >
                    {drives.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label} ({d.mountPoint})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-indigo-200 font-bold mb-1">Action Policy</label>
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value as RoutingRule['action'])}
                    className="w-full bg-[#13113A] border border-indigo-700/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#6366F1] font-medium"
                  >
                    <option value="route_to_target">Route to Target Drive</option>
                    <option value="ask_permission">Prompt for Approval</option>
                    <option value="strict_block">Strict Block</option>
                    <option value="compress_archive">Compress & Archive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-indigo-200 font-bold mb-1">Description / Rationale</label>
                <textarea
                  placeholder="Explain why this routing rule is applied..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#13113A] border border-indigo-700/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-indigo-800/60">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 bg-[#25215A] hover:bg-[#2E296E] text-indigo-200 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6366F1] hover:bg-indigo-500 text-white font-black rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Save Policy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Storage Scanner Modal */}
      <StorageScannerModal isOpen={scannerModalOpen} onClose={() => setScannerModalOpen(false)} />
    </div>
  );
};
