import React, { useState } from 'react';
import {
  X,
  Search,
  Check,
  Plus,
  Laptop,
  FolderSync,
  Sparkles,
  Gamepad2,
  Code2,
  Video,
  Globe,
  Music,
  Box,
  FileSpreadsheet,
  Cpu,
  Layers
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ApplicationProfile, AppCategory } from '../../types';
import { formatBytes } from '../../utils/formatters';

interface ScanLaptopAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CatalogAppTemplate {
  name: string;
  category: AppCategory;
  description: string;
  defaultPath: string;
  estimatedSizeGB: number;
  icon: any;
  adapterVersion: string;
}

const LAPTOP_SOFTWARE_CATALOG: CatalogAppTemplate[] = [
  // Browsers
  {
    name: 'Mozilla Firefox',
    category: 'browser',
    description: 'Firefox browser profiles, IndexedDB storage, and offline web caches',
    defaultPath: 'C:\\Users\\User\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles',
    estimatedSizeGB: 14.2,
    icon: Globe,
    adapterVersion: 'v2.1.0 (Firefox Profile Redirection)'
  },
  {
    name: 'Brave Browser',
    category: 'browser',
    description: 'Brave Shields cache, IPFS node data, and Chromium GPU cache',
    defaultPath: 'C:\\Users\\User\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Cache',
    estimatedSizeGB: 11.5,
    icon: Globe,
    adapterVersion: 'v2.0.0 (Brave Cache Router)'
  },

  // Developer & IDE
  {
    name: 'JetBrains IntelliJ IDEA',
    category: 'ide',
    description: 'Project symbol caches, syntax indexing, and Maven/Gradle dependencies',
    defaultPath: 'C:\\Users\\User\\AppData\\Local\\JetBrains\\IntelliJIdea2025\\caches',
    estimatedSizeGB: 28.4,
    icon: Code2,
    adapterVersion: 'v3.5.0 (IDEA System Caches Relocation)'
  },
  {
    name: 'JetBrains PyCharm',
    category: 'ide',
    description: 'Python virtual environment caches, skeleton indexes, and wheels repository',
    defaultPath: 'C:\\Users\\User\\AppData\\Local\\JetBrains\\PyCharm2025\\caches',
    estimatedSizeGB: 22.0,
    icon: Code2,
    adapterVersion: 'v3.5.0 (PyCharm Skeleton Relocation)'
  },
  {
    name: 'Microsoft Visual Studio 2022',
    category: 'ide',
    description: 'C++ NuGet packages, IntelliSense database, and MSBuild intermediate obj files',
    defaultPath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\VisualStudio\\17.0',
    estimatedSizeGB: 45.0,
    icon: Code2,
    adapterVersion: 'v4.0.0 (Visual Studio Caches)'
  },
  {
    name: 'Android Studio & Gradle',
    category: 'dev_tool',
    description: 'Android SDK system images, AVD emulators, and Gradle daemon caches (.gradle)',
    defaultPath: 'C:\\Users\\User\\.gradle\\caches',
    estimatedSizeGB: 38.6,
    icon: Cpu,
    adapterVersion: 'v3.1.0 (GRADLE_USER_HOME Router)'
  },
  {
    name: 'Git & GitHub Desktop',
    category: 'dev_tool',
    description: 'Git packfiles, clone worktrees, and loose object storage',
    defaultPath: 'C:\\Users\\User\\AppData\\Local\\GitHubDesktop',
    estimatedSizeGB: 15.0,
    icon: Code2,
    adapterVersion: 'v2.0.0 (Git Repository Storage)'
  },

  // Creative & Media
  {
    name: 'Adobe Photoshop',
    category: 'creative',
    description: 'Photoshop scratch disk, auto-recover PSD snapshots, and brush preset caches',
    defaultPath: 'C:\\Users\\User\\AppData\\Roaming\\Adobe\\Adobe Photoshop 2025\\AutoRecover',
    estimatedSizeGB: 32.0,
    icon: Box,
    adapterVersion: 'v3.0.0 (Scratch Disk Redirection)'
  },
  {
    name: 'DaVinci Resolve Studio',
    category: 'creative',
    description: 'Optimized media proxies, render cache waveforms, and gallery stills',
    defaultPath: 'C:\\Users\\User\\Videos\\DaVinci Resolve\\CacheClip',
    estimatedSizeGB: 68.0,
    icon: Video,
    adapterVersion: 'v4.2.0 (Proxy Cache Relocation)'
  },
  {
    name: 'OBS Studio',
    category: 'creative',
    description: 'Live streaming replay buffers, temporary recording files, and browser source caches',
    defaultPath: 'C:\\Users\\User\\Videos\\OBS-Recordings',
    estimatedSizeGB: 45.0,
    icon: Video,
    adapterVersion: 'v2.0.0 (Replay Buffer Redirect)'
  },
  {
    name: 'Ableton Live / FL Studio',
    category: 'creative',
    description: 'Audio sample libraries, VST plugin caches, and decoded audio waveforms',
    defaultPath: 'C:\\Users\\User\\Documents\\Ableton\\Live Recordings',
    estimatedSizeGB: 54.0,
    icon: Music,
    adapterVersion: 'v2.5.0 (Audio Sample Library)'
  },

  // Gaming
  {
    name: 'Epic Games Launcher',
    category: 'gaming',
    description: 'Unreal Engine vaults, Epic game installations, and downloaded manifests',
    defaultPath: 'C:\\Program Files\\Epic Games',
    estimatedSizeGB: 85.0,
    icon: Gamepad2,
    adapterVersion: 'v3.0.0 (Epic Vault & Game Router)'
  },
  {
    name: 'Riot Games & Valorant',
    category: 'gaming',
    description: 'Game patches, replay clips, and downloaded texture assets',
    defaultPath: 'C:\\Riot Games',
    estimatedSizeGB: 42.0,
    icon: Gamepad2,
    adapterVersion: 'v2.1.0 (Riot Client Storage)'
  },

  // Productivity
  {
    name: 'Slack Desktop',
    category: 'productivity',
    description: 'Uploaded workspace attachments, audio huddle logs, and Electron cache',
    defaultPath: 'C:\\Users\\User\\AppData\\Roaming\\Slack\\Cache',
    estimatedSizeGB: 7.8,
    icon: FileSpreadsheet,
    adapterVersion: 'v2.0.0 (Slack Cache Router)'
  },
  {
    name: 'Zoom Workplace',
    category: 'productivity',
    description: 'Local meeting video recordings, chat transcripts, and virtual background caches',
    defaultPath: 'C:\\Users\\User\\Documents\\Zoom',
    estimatedSizeGB: 18.5,
    icon: Video,
    adapterVersion: 'v2.2.0 (Zoom Recordings Router)'
  },
  {
    name: 'Notion Desktop',
    category: 'productivity',
    description: 'Offline page caches, image databases, and local search indexes',
    defaultPath: 'C:\\Users\\User\\AppData\\Roaming\\Notion',
    estimatedSizeGB: 6.4,
    icon: FileSpreadsheet,
    adapterVersion: 'v1.8.0 (Notion IndexedDB Redirect)'
  }
];

export const ScanLaptopAppsModal: React.FC<ScanLaptopAppsModalProps> = ({ isOpen, onClose }) => {
  const { applications, drives, addCustomLaptopApp, showToast } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const targetDrive = drives.find((d) => d.type !== 'internal') || drives[0];

  const filteredCatalog = LAPTOP_SOFTWARE_CATALOG.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddTemplate = (template: CatalogAppTemplate) => {
    const slug = template.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const sizeBytes = template.estimatedSizeGB * 1024 * 1024 * 1024;
    const targetPath = `${targetDrive.mountPoint}EWM-Workspace\\applications\\${slug}\\data`;

    const newApp: ApplicationProfile = {
      id: 'app_' + slug + '_' + Date.now(),
      name: template.name,
      slug,
      iconName: 'Laptop',
      category: template.category,
      compatibility: 'platinum',
      status: 'fully_protected',
      internalUsageBytes: 0.1 * 1024 * 1024 * 1024,
      externalUsageBytes: sizeBytes,
      primaryDestinationDriveId: targetDrive.id,
      strictMode: false,
      adapterVersion: template.adapterVersion,
      isRunning: false,
      lastActive: 'Added from catalog',
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
          name: `${template.name} Main Storage & Cache`,
          originalPath: template.defaultPath,
          suggestedCategory: 'caches',
          sizeBytes,
          safetyStatus: 'safe_to_redirect',
          isRedirected: true,
          targetPath
        }
      ]
    };

    addCustomLaptopApp(newApp);
    showToast(`Protected ${template.name} on ${targetDrive.label}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E1B4B] border border-indigo-700/60 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#2A247A] to-[#1E1B4B] border-b border-indigo-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-lg">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Laptop Software Catalog & Auto-Detection</h3>
              <p className="text-xs text-indigo-300">
                Select from popular installed laptop applications to redirect heavy caches and libraries to <span className="text-[#FACC15] font-bold">{targetDrive.label}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 bg-[#13113A] border-b border-indigo-800/60 flex flex-col md:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search installed laptop software (e.g. Photoshop, IntelliJ, Firefox, Zoom)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1B4B] border border-indigo-700/60 text-white rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['all', 'browser', 'ide', 'dev_tool', 'creative', 'gaming', 'productivity'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#6366F1] text-white shadow-md'
                    : 'bg-[#1E1B4B] text-indigo-300 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredCatalog.map((item) => {
            const isAlreadyAdded = applications.some((a) => a.name.toLowerCase() === item.name.toLowerCase());
            const IconComp = item.icon;

            return (
              <div
                key={item.name}
                className="p-4 rounded-2xl bg-[#13113A] border border-indigo-800/60 hover:border-indigo-600 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-900/80 border border-indigo-700 flex items-center justify-center text-[#FACC15] shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white">{item.name}</h4>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#25215A] text-indigo-300 font-bold uppercase">
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-300 mt-0.5 max-w-md">{item.description}</p>
                    <div className="text-[10px] text-indigo-400 font-mono mt-1 truncate max-w-sm">
                      📍 {item.defaultPath}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-black text-[#4ADE80]">~{item.estimatedSizeGB} GB</div>
                    <div className="text-[9px] text-indigo-400">Offloadable</div>
                  </div>

                  {isAlreadyAdded ? (
                    <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-[#4ADE80] font-black text-xs flex items-center gap-1.5 border border-emerald-500/40">
                      <Check className="w-4 h-4" />
                      <span>Protected</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddTemplate(item)}
                      className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-indigo-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add & Route</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredCatalog.length === 0 && (
            <div className="text-center py-12 text-indigo-300">
              <Laptop className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
              <p className="font-bold">No matching software found in catalog</p>
              <p className="text-xs mt-1">Use the "Add Custom Laptop App" button to add any custom software on your C:\ drive.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#13113A] border-t border-indigo-800/60 flex items-center justify-between text-xs shrink-0">
          <span className="text-indigo-300">
            Target Destination: <strong className="text-white">{targetDrive.label} ({targetDrive.mountPoint})</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#25215A] hover:bg-indigo-800 text-white font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
