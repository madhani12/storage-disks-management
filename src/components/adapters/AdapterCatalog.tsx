import React, { useState } from 'react';
import {
  Puzzle,
  ShieldCheck,
  Star,
  Layers,
  Terminal,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Settings,
  Sparkles,
  Laptop,
  Plus,
  Check,
  Globe,
  Video,
  Gamepad2,
  Cpu,
  FileSpreadsheet,
  Music,
  Box
} from 'lucide-react';
import { CompatibilityLevel } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';

interface AdapterSpec {
  id: string;
  name: string;
  category: 'Browsers' | 'IDEs & Code' | 'Dev & CLI' | 'Creative & Media' | 'Gaming' | 'Office & Tools' | 'AI Workflows';
  compatibility: CompatibilityLevel;
  version: string;
  description: string;
  redirectionTechniques: string[];
  envVariables: Record<string, string>;
  junctionPaths: string[];
  localRetainedData: string;
  restoreMechanism: string;
  estimatedSizeGB: number;
}

const ADAPTERS_DATABASE: AdapterSpec[] = [
  // Browsers
  {
    id: 'chrome-adapter',
    name: 'Google Chrome Browser',
    category: 'Browsers',
    compatibility: 'platinum',
    version: 'v4.5.0 (Chromium Cache Router)',
    description: 'Relocates ShaderCache, Code Cache, GPUCache, and Service Worker offline storage to external HDD.',
    redirectionTechniques: ['NTFS Junctions', 'Chromium --disk-cache-dir Policy'],
    envVariables: {
      'CHROME_CACHE_DIR': 'D:\\EWM-Workspace\\applications\\google-chrome\\cache'
    },
    junctionPaths: [
      'AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
      'AppData\\Local\\Google\\Chrome\\User Data\\Default\\Code Cache',
      'AppData\\Local\\Google\\Chrome\\User Data\\Default\\GPUCache'
    ],
    localRetainedData: 'Browser bookmarks, passwords & session cookies (few MBs in LocalAppData)',
    restoreMechanism: 'Automatic symlink detachment with zero profile loss',
    estimatedSizeGB: 18.5
  },
  {
    id: 'edge-adapter',
    name: 'Microsoft Edge Browser',
    category: 'Browsers',
    compatibility: 'platinum',
    version: 'v4.2.0 (Edge WebView2 & Browser Cache)',
    description: 'Redirects Edge browser profile cache, collections, and WebView2 runtime cache pools.',
    redirectionTechniques: ['NTFS Junctions', 'Edge Group Policy'],
    envVariables: {
      'EDGE_USER_DATA_DIR': 'D:\\EWM-Workspace\\applications\\microsoft-edge\\data'
    },
    junctionPaths: [
      'AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache',
      'AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Service Worker'
    ],
    localRetainedData: 'Edge sync authentication credentials',
    restoreMechanism: 'Instant junction rollback via EWM runner',
    estimatedSizeGB: 12.0
  },

  // IDEs & Code
  {
    id: 'vscode-adapter',
    name: 'Visual Studio Code & Cursor',
    category: 'IDEs & Code',
    compatibility: 'platinum',
    version: 'v4.2.0 (Extensions & Caches)',
    description: 'Complete redirection of extensions directory, language server indexes, and workspace storage.',
    redirectionTechniques: ['CLI Launch Flags', 'NTFS Junctions', 'User Settings Redirection'],
    envVariables: {
      'VSCODE_EXTENSIONS': 'D:\\EWM-Workspace\\applications\\vscode\\extensions'
    },
    junctionPaths: [
      '.vscode\\extensions',
      'AppData\\Roaming\\Code\\CachedData',
      'AppData\\Roaming\\Code\\User\\workspaceStorage'
    ],
    localRetainedData: 'Telemetry client IDs',
    restoreMechanism: 'Revert CLI shortcut arguments and remove junctions',
    estimatedSizeGB: 24.5
  },
  {
    id: 'intellij-adapter',
    name: 'JetBrains IntelliJ / PyCharm / WebStorm',
    category: 'IDEs & Code',
    compatibility: 'platinum',
    version: 'v3.5.0 (IDEA System Caches Relocation)',
    description: 'Moves multi-gigabyte project symbol indexes, compiler caches, and maven/pip indices.',
    redirectionTechniques: ['idea.properties Override', 'NTFS Junctions'],
    envVariables: {
      'IDEA_SYSTEM_PATH': 'D:\\EWM-Workspace\\applications\\jetbrains\\system'
    },
    junctionPaths: [
      'AppData\\Local\\JetBrains\\IntelliJIdea2025\\caches',
      'AppData\\Local\\JetBrains\\IntelliJIdea2025\\index'
    ],
    localRetainedData: 'UI themes and keyboard shortcut keymaps',
    restoreMechanism: 'Remove idea.properties custom path override',
    estimatedSizeGB: 34.0
  },

  // Dev & CLI
  {
    id: 'node-npm-adapter',
    name: 'Node.js, npm, pnpm & Yarn',
    category: 'Dev & CLI',
    compatibility: 'platinum',
    version: 'v3.1.0 (NPM / PNPM Store Router)',
    description: 'Routes global npm-cache, nvm installations, and pnpm hard-link content-addressable storage.',
    redirectionTechniques: ['npm config set cache', 'PNPM_HOME Environment Variable', 'NTFS Junctions'],
    envVariables: {
      'npm_config_cache': 'D:\\EWM-Workspace\\applications\\npm-node\\cache',
      'PNPM_HOME': 'D:\\EWM-Workspace\\applications\\pnpm\\store'
    },
    junctionPaths: [
      'AppData\\Local\\npm-cache',
      'AppData\\Local\\pnpm\\store'
    ],
    localRetainedData: 'Node global bin PATH pointers',
    restoreMechanism: 'Run npm config delete cache and restore default directories',
    estimatedSizeGB: 32.0
  },
  {
    id: 'docker-adapter',
    name: 'Docker Desktop / Podman Data',
    category: 'Dev & CLI',
    compatibility: 'gold',
    version: 'v3.0.2 (WSL2 / VHDX Relocation)',
    description: 'Transfers heavy Docker WSL2 ext4.vhdx virtual hard disk images to external HDD/SSD.',
    redirectionTechniques: ['wsl --export / --import', 'Virtual Disk Relocation'],
    envVariables: {
      'DOCKER_CONFIG': 'D:\\EWM-Workspace\\environments\\docker'
    },
    junctionPaths: [
      'AppData\\Local\\Docker\\wsl\\data\\ext4.vhdx'
    ],
    localRetainedData: 'Docker desktop UI shell executable',
    restoreMechanism: 'WSL2 instance re-import',
    estimatedSizeGB: 68.0
  },

  // Creative & Media
  {
    id: 'premiere-adapter',
    name: 'Adobe Premiere Pro & After Effects',
    category: 'Creative & Media',
    compatibility: 'platinum',
    version: 'v4.0.0 (Media Cache & Scratch Disk)',
    description: 'Redirects peak audio files, conforming audio streams, and video frame cache to external disk.',
    redirectionTechniques: ['Adobe Preferences Override', 'NTFS Junctions'],
    envVariables: {
      'ADOBE_MEDIA_CACHE': 'D:\\EWM-Workspace\\applications\\adobe-premiere\\cache'
    },
    junctionPaths: [
      'AppData\\Roaming\\Adobe\\Common\\Media Cache Files',
      'AppData\\Roaming\\Adobe\\Common\\Peak Files'
    ],
    localRetainedData: 'License activation and workspace layout XMLs',
    restoreMechanism: 'Revert Adobe Media Cache preferences to default',
    estimatedSizeGB: 65.0
  },
  {
    id: 'blender-adapter',
    name: 'Blender 3D Suite',
    category: 'Creative & Media',
    compatibility: 'platinum',
    version: 'v2.8.0 (Render Output & Physics Cache)',
    description: 'Routes simulation bake files, fluid caches, sculpt temp data, and downloaded asset packs.',
    redirectionTechniques: ['User Preferences File Paths', 'NTFS Junctions'],
    envVariables: {
      'BLENDER_USER_RESOURCES': 'D:\\EWM-Workspace\\applications\\blender\\assets'
    },
    junctionPaths: [
      'AppData\\Roaming\\Blender Foundation\\Blender\\cache',
      'Documents\\Blender\\Render-Outputs'
    ],
    localRetainedData: 'Blender start up blend file and add-on preferences',
    restoreMechanism: 'Reset file paths in Blender User Preferences',
    estimatedSizeGB: 28.0
  },
  {
    id: 'spotify-adapter',
    name: 'Spotify Desktop',
    category: 'Creative & Media',
    compatibility: 'platinum',
    version: 'v2.2.0 (Offline Audio Cache Redirect)',
    description: 'Relocates Spotify offline downloaded music tracks and artwork storage to external drive.',
    redirectionTechniques: ['NTFS Junctions', 'prefs file storage path'],
    envVariables: {
      'SPOTIFY_CACHE_DIR': 'D:\\EWM-Workspace\\applications\\spotify\\cache'
    },
    junctionPaths: [
      'AppData\\Local\\Spotify\\Storage'
    ],
    localRetainedData: 'User login token and audio equalizer settings',
    restoreMechanism: 'Revert offline storage location in Spotify settings',
    estimatedSizeGB: 8.5
  },

  // Gaming
  {
    id: 'steam-adapter',
    name: 'Steam & Game Downloads',
    category: 'Gaming',
    compatibility: 'platinum',
    version: 'v5.0.0 (Steam Library Folder Binding)',
    description: 'Manages secondary Steam Library on external drive for game installations and shader pre-caching.',
    redirectionTechniques: ['Steam Library Folders VDF', 'Shader Cache Junctions'],
    envVariables: {
      'STEAM_LIBRARY_PATH': 'D:\\SteamLibrary'
    },
    junctionPaths: [
      'Program Files (x86)\\Steam\\steamapps\\shadercache',
      'Program Files (x86)\\Steam\\steamapps\\downloading'
    ],
    localRetainedData: 'Steam client bootstrap executable and friends list data',
    restoreMechanism: 'Remove secondary library from Steam Storage Manager',
    estimatedSizeGB: 110.0
  },

  // Office & Tools
  {
    id: 'office-adapter',
    name: 'Microsoft 365 & Office Desktop',
    category: 'Office & Tools',
    compatibility: 'gold',
    version: 'v2.4.0 (Office AutoRecover & Templates)',
    description: 'Redirects Outlook OST email caches, PowerPoint temporary presentation renders, and Office templates.',
    redirectionTechniques: ['Registry Policy', 'NTFS Junctions'],
    envVariables: {
      'OFFICE_AUTORECOVER': 'D:\\EWM-Workspace\\applications\\office\\autorecover'
    },
    junctionPaths: [
      'AppData\\Local\\Microsoft\\Office\\UnsavedFiles',
      'AppData\\Local\\Microsoft\\Outlook'
    ],
    localRetainedData: 'Office activation licenses',
    restoreMechanism: 'Reset AutoRecover path in Word/Excel Options',
    estimatedSizeGB: 16.0
  },

  // AI Workflows
  {
    id: 'chatgpt-adapter',
    name: 'ChatGPT Desktop Application',
    category: 'AI Workflows',
    compatibility: 'platinum',
    version: 'v2.4.1 (Windows ProjFS + Junctions)',
    description: 'Intercepts Electron storage pools, speech audio cache, Canvas code files, and Code Interpreter outputs.',
    redirectionTechniques: ['NTFS Junctions', 'Windows ProjFS Virtualization', 'Config Override'],
    envVariables: {
      'OPENAI_DESKTOP_HOME': 'D:\\EWM-Workspace\\applications\\chatgpt',
      'OPENAI_CACHE_DIR': 'D:\\EWM-Workspace\\caches\\chatgpt'
    },
    junctionPaths: [
      'AppData\\Roaming\\OpenAI\\ChatGPT\\storage',
      'AppData\\Local\\OpenAI\\ChatGPT\\exports'
    ],
    localRetainedData: 'OS-bound DPAPI session encryption keys (Windows Credential Manager)',
    restoreMechanism: 'Automatic symlink detachment with zero file loss',
    estimatedSizeGB: 12.5
  },
  {
    id: 'claude-adapter',
    name: 'Claude Desktop Application',
    category: 'AI Workflows',
    compatibility: 'platinum',
    version: 'v3.1.0 (Dual-Destination Routing)',
    description: 'Split routing for MCP servers, artifact file renders, and hot GPU shader caches.',
    redirectionTechniques: ['NTFS Junctions', 'MCP Config Path Mapping', 'GPUCache Relocation'],
    envVariables: {
      'CLAUDE_MCP_STORAGE': 'D:\\EWM-Workspace\\applications\\claude\\mcp-storage',
      'CLAUDE_ARTIFACTS_DIR': 'D:\\EWM-Workspace\\artifacts\\claude'
    },
    junctionPaths: [
      'AppData\\Roaming\\Claude\\mcp-storage',
      'AppData\\Local\\Claude\\GPUCache'
    ],
    localRetainedData: 'Local client window layout state (few KBs)',
    restoreMechanism: 'Instant junction reversion script',
    estimatedSizeGB: 9.8
  },
  {
    id: 'ollama-adapter',
    name: 'Ollama Local Model Server',
    category: 'AI Workflows',
    compatibility: 'platinum',
    version: 'v2.1.0 (OLLAMA_MODELS Environment)',
    description: 'Routes all downloaded LLMs (Llama, Qwen, DeepSeek, Mistral) entirely to external storage.',
    redirectionTechniques: ['System Environment Variable', 'Service Configuration'],
    envVariables: {
      'OLLAMA_MODELS': 'D:\\EWM-Workspace\\models\\ollama'
    },
    junctionPaths: [
      '.ollama\\models'
    ],
    localRetainedData: 'Ollama system daemon service runner',
    restoreMechanism: 'Delete OLLAMA_MODELS environment variable',
    estimatedSizeGB: 45.0
  }
];

export const AdapterCatalog: React.FC = () => {
  const { applications, drives, addCustomLaptopApp, showToast } = useWorkspace();
  const [selectedAdapterId, setSelectedAdapterId] = useState<string>(ADAPTERS_DATABASE[0].id);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const selectedAdapter = ADAPTERS_DATABASE.find((a) => a.id === selectedAdapterId) || ADAPTERS_DATABASE[0];
  const targetDrive = drives.find((d) => d.type !== 'internal') || drives[0];

  const filteredAdapters = ADAPTERS_DATABASE.filter((a) => {
    if (filterCategory === 'all') return true;
    return a.category === filterCategory;
  });

  const isAlreadyAdded = (name: string) => {
    return applications.some((app) => app.name.toLowerCase().includes(name.toLowerCase().split(' ')[0]));
  };

  const handleApplyAdapter = (adapter: AdapterSpec) => {
    const slug = adapter.id.replace('-adapter', '');
    const sizeBytes = adapter.estimatedSizeGB * 1024 * 1024 * 1024;
    const targetPath = `${targetDrive.mountPoint}EWM-Workspace\\applications\\${slug}\\data`;

    addCustomLaptopApp({
      id: 'app_' + slug + '_' + Date.now(),
      name: adapter.name,
      slug,
      iconName: 'Laptop',
      category: 'other',
      compatibility: adapter.compatibility,
      status: 'fully_protected',
      internalUsageBytes: 0.1 * 1024 * 1024 * 1024,
      externalUsageBytes: sizeBytes,
      primaryDestinationDriveId: targetDrive.id,
      strictMode: false,
      adapterVersion: adapter.version,
      isRunning: false,
      lastActive: 'Configured from catalog',
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
          name: `${adapter.name} Primary Storage`,
          originalPath: `C:\\Users\\User\\${adapter.junctionPaths[0] || 'AppData\\Local\\' + slug}`,
          suggestedCategory: 'caches',
          sizeBytes,
          safetyStatus: 'safe_to_redirect',
          isRedirected: true,
          targetPath
        }
      ]
    });
  };

  const getCompatibilityBadge = (level: CompatibilityLevel) => {
    switch (level) {
      case 'platinum':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#4ADE80] text-[#1E1B4B] flex items-center gap-1 uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-[#1E1B4B]" />
            PLATINUM (99% External)
          </span>
        );
      case 'gold':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#FACC15] text-[#1E1B4B] flex items-center gap-1 uppercase tracking-wider shadow-sm">
            <Star className="w-3 h-3 text-[#1E1B4B] fill-[#1E1B4B]" />
            GOLD (90% External)
          </span>
        );
      case 'silver':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#6366F1] text-white uppercase tracking-wider">
            SILVER (75% External)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#F43F5E] text-white uppercase tracking-wider">
            BRONZE (Selective)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-md">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">Laptop Application Catalog & Adapters</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Pre-tested adapters for standard laptop software (Browsers, IDEs, Video Editors, Steam, Dev tools, Office) to route C:\ to D:\ safely.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#13113A] p-1.5 rounded-2xl border border-indigo-800/60 overflow-x-auto shrink-0 shadow-inner">
          {['all', 'Browsers', 'IDEs & Code', 'Dev & CLI', 'Creative & Media', 'Gaming', 'Office & Tools', 'AI Workflows'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition whitespace-nowrap ${
                filterCategory === cat ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-600/30' : 'text-indigo-300 hover:text-white'
              }`}
            >
              {cat === 'all' ? `All (${ADAPTERS_DATABASE.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Adapter List (5 cols) & Right Spec Inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Adapters List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredAdapters.map((adapter) => {
            const isSelected = adapter.id === selectedAdapterId;
            const added = isAlreadyAdded(adapter.name);

            return (
              <div
                key={adapter.id}
                onClick={() => setSelectedAdapterId(adapter.id)}
                className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2A247A] border-[#F43F5E] shadow-lg shadow-indigo-950/40 translate-x-1'
                    : 'bg-[#1E1B4B] border-indigo-900/60 hover:border-indigo-700 hover:bg-[#231F60]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md ${
                        isSelected ? 'bg-[#F43F5E] text-white' : 'bg-[#13113A] text-indigo-300'
                      }`}
                    >
                      <Puzzle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs text-white">{adapter.name}</h3>
                      <span className="text-[10px] text-indigo-300 font-mono mt-0.5 block">{adapter.version}</span>
                    </div>
                  </div>
                  {getCompatibilityBadge(adapter.compatibility)}
                </div>

                <p className="text-xs text-indigo-200 mt-2.5 line-clamp-2">{adapter.description}</p>

                <div className="mt-3 pt-2.5 border-t border-indigo-900/40 flex items-center justify-between text-[11px]">
                  <span className="text-indigo-300 font-bold">Category: <strong className="text-white">{adapter.category}</strong></span>
                  <span className="text-[#4ADE80] font-black">~{adapter.estimatedSizeGB} GB offloadable</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Adapter Detail */}
        <div className="lg:col-span-7 bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-indigo-900/60">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{selectedAdapter.name}</h3>
                {getCompatibilityBadge(selectedAdapter.compatibility)}
              </div>
              <p className="text-xs text-indigo-300 font-mono mt-1">{selectedAdapter.version}</p>
            </div>
            
            <button
              onClick={() => handleApplyAdapter(selectedAdapter)}
              disabled={isAlreadyAdded(selectedAdapter.name)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md ${
                isAlreadyAdded(selectedAdapter.name)
                  ? 'bg-emerald-500/20 text-[#4ADE80] border border-emerald-500/40'
                  : 'bg-[#6366F1] hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isAlreadyAdded(selectedAdapter.name) ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Already Configured</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Protect in My Laptop</span>
                </>
              )}
            </button>
          </div>

          <div>
            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-1.5">Overview</h4>
            <p className="text-xs text-indigo-100 leading-relaxed">{selectedAdapter.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">
              Redirection Techniques Applied
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedAdapter.redirectionTechniques.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-[#13113A] border border-indigo-800/60 rounded-xl text-xs font-bold text-[#FACC15] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">
              Target Windows NTFS Junction Paths
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {selectedAdapter.junctionPaths.map((jPath) => (
                <div
                  key={jPath}
                  className="p-2.5 bg-[#13113A] rounded-xl border border-indigo-800/60 text-indigo-200 flex items-center gap-2"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#F43F5E] shrink-0" />
                  <span className="truncate">C:\Users\User\{jPath}</span>
                  <span className="text-[#4ADE80] font-black shrink-0">➔ {targetDrive.mountPoint}EWM-Workspace\...</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">
              Environment Variables Set on App Launch
            </h4>
            <div className="bg-[#13113A] rounded-2xl p-3.5 border border-indigo-800/60 font-mono text-xs space-y-1.5">
              {Object.entries(selectedAdapter.envVariables).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="text-[#FACC15] font-bold">{k}=</span>
                  <span className="text-indigo-200 truncate">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 bg-[#13113A] rounded-2xl border border-indigo-800/60">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-1">
                Data Retained Locally on Internal SSD
              </span>
              <p className="text-xs text-white font-medium">{selectedAdapter.localRetainedData}</p>
            </div>

            <div className="p-3.5 bg-[#13113A] rounded-2xl border border-indigo-800/60">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-1">
                Instant Rollback Strategy
              </span>
              <p className="text-xs text-[#4ADE80] font-medium">{selectedAdapter.restoreMechanism}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
