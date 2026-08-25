import {
  StorageDrive,
  ApplicationProfile,
  RoutingRule,
  LocalWriteRequest,
  SessionCreatedFile,
  ActivityLog,
  BackupSnapshot,
  CleanableItem
} from '../types';

export const INITIAL_DRIVES: StorageDrive[] = [
  {
    id: 'drive_internal_c',
    label: 'Laptop Internal Storage (C:)',
    volumeIdentity: 'VOL_INT_NVME_SYS0',
    mountPoint: 'C:\\',
    type: 'internal',
    totalBytes: 512 * 1024 * 1024 * 1024,
    usedBytes: 198 * 1024 * 1024 * 1024,
    freeBytes: 314 * 1024 * 1024 * 1024,
    readSpeedMBs: 3450,
    writeSpeedMBs: 2980,
    health: 'excellent',
    temperatureC: 41,
    isEncrypted: true,
    encryptionAlgorithm: 'BitLocker XTS-AES-256',
    isRemovable: false,
    isConnected: true,
    connectionInterface: 'PCIe Gen4 x4 NVMe (Internal)',
    latencyMs: 0.12,
    workspaceInitialized: false,
    originType: 'real_filesystem'
  },
  {
    id: 'drive_external_hdd',
    label: 'Connected External HDD (D:)',
    volumeIdentity: 'VOL_EXT_WD_HDD_01',
    mountPoint: 'D:\\',
    type: 'hdd',
    totalBytes: 2000 * 1024 * 1024 * 1024, // 2 TB External HDD
    usedBytes: 420 * 1024 * 1024 * 1024,
    freeBytes: 1580 * 1024 * 1024 * 1024,
    readSpeedMBs: 142,
    writeSpeedMBs: 130,
    health: 'excellent',
    temperatureC: 36,
    isEncrypted: true,
    encryptionAlgorithm: 'BitLocker AES-128 / NTFS',
    isRemovable: true,
    isConnected: true,
    connectionInterface: 'USB 3.0 External HDD (5Gbps)',
    latencyMs: 12.5,
    warningNotice: 'Mechanical HDD: High capacity storage for offloading caches, games, projects, media, and heavy data.',
    workspaceInitialized: true,
    isRealDevice: true,
    originType: 'custom_hardware',
    lastTestedAt: '2026-08-25 11:15'
  }
];

export const INITIAL_APPLICATIONS: ApplicationProfile[] = [
  // --- BROWSERS & WEB ---
  {
    id: 'app_chrome',
    name: 'Google Chrome',
    slug: 'chrome',
    iconName: 'Chrome',
    category: 'browser',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.25 * 1024 * 1024 * 1024,
    externalUsageBytes: 18.5 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: false,
    adapterVersion: 'v4.1.0 (Profile & Cache Redirection)',
    isRunning: true,
    lastActive: 'Active',
    categoryRoutings: [
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'attachments', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'temp_files', destinationDriveId: 'drive_external_hdd', method: 'symlink' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Chrome User Profile Cache & ShaderCache',
        originalPath: 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
        suggestedCategory: 'caches',
        sizeBytes: 12.4 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Google Chrome\\Cache'
      },
      {
        name: 'Browser Downloads & Staged Web Media',
        originalPath: 'C:\\Users\\User\\Downloads',
        suggestedCategory: 'attachments',
        sizeBytes: 6.1 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Google Chrome\\Downloads'
      }
    ]
  },
  {
    id: 'app_edge',
    name: 'Microsoft Edge',
    slug: 'edge',
    iconName: 'Globe',
    category: 'browser',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.15 * 1024 * 1024 * 1024,
    externalUsageBytes: 8.2 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: false,
    adapterVersion: 'v3.2.0 (Edge WebView2 & EBWebView Cache)',
    isRunning: false,
    lastActive: '2h ago',
    categoryRoutings: [
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Edge EBWebView & GPU Cache',
        originalPath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache',
        suggestedCategory: 'caches',
        sizeBytes: 8.2 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Microsoft Edge\\Cache'
      }
    ]
  },

  // --- DEVELOPER TOOLS & IDES ---
  {
    id: 'app_vscode',
    name: 'Visual Studio Code',
    slug: 'vscode',
    iconName: 'FileCode',
    category: 'ide',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.35 * 1024 * 1024 * 1024,
    externalUsageBytes: 34.8 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: false,
    adapterVersion: 'v4.2.0 (Extensions & Caches)',
    isRunning: true,
    lastActive: 'Active',
    categoryRoutings: [
      { category: 'packages', destinationDriveId: 'drive_external_hdd', method: 'env_variables' },
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'projects', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Extensions Directory (.vscode/extensions)',
        originalPath: 'C:\\Users\\User\\.vscode\\extensions',
        suggestedCategory: 'packages',
        sizeBytes: 22.4 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Visual Studio Code\\extensions'
      },
      {
        name: 'TypeScript & Language Server Cache',
        originalPath: 'C:\\Users\\User\\AppData\\Roaming\\Code\\CachedData',
        suggestedCategory: 'caches',
        sizeBytes: 12.4 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Visual Studio Code\\CachedData'
      }
    ]
  },
  {
    id: 'app_node_npm',
    name: 'Node.js & npm / yarn / pnpm',
    slug: 'node-npm',
    iconName: 'Terminal',
    category: 'dev_tool',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.1 * 1024 * 1024 * 1024,
    externalUsageBytes: 28.6 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: false,
    adapterVersion: 'v2.8.0 (NPM_CONFIG_CACHE Relocation)',
    isRunning: false,
    lastActive: '1h ago',
    categoryRoutings: [
      { category: 'packages', destinationDriveId: 'drive_external_hdd', method: 'env_variables' },
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'npm Global Cache (_cacache)',
        originalPath: 'C:\\Users\\User\\AppData\\Local\\npm-cache',
        suggestedCategory: 'caches',
        sizeBytes: 18.2 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Node.js & npm\\npm-cache'
      },
      {
        name: 'Global Node Modules Directory',
        originalPath: 'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules',
        suggestedCategory: 'packages',
        sizeBytes: 10.4 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Node.js & npm\\node_modules'
      }
    ]
  },
  {
    id: 'app_docker',
    name: 'Docker Desktop / WSL2',
    slug: 'docker',
    iconName: 'Container',
    category: 'dev_tool',
    compatibility: 'gold',
    status: 'fully_protected',
    internalUsageBytes: 1.4 * 1024 * 1024 * 1024,
    externalUsageBytes: 64.0 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: true,
    adapterVersion: 'v3.0.2 (WSL2 / VHDX Relocation)',
    isRunning: true,
    lastActive: 'Active',
    categoryRoutings: [
      { category: 'environments', destinationDriveId: 'drive_external_hdd', method: 'filesystem_virtualization' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Docker WSL2 ext4.vhdx Virtual Disk',
        originalPath: 'C:\\Users\\User\\AppData\\Local\\Docker\\wsl\\data\\ext4.vhdx',
        suggestedCategory: 'environments',
        sizeBytes: 64.0 * 1024 * 1024 * 1024,
        safetyStatus: 'requires_admin',
        isRedirected: true,
        targetPath: 'D:\\Docker Desktop\\ext4.vhdx'
      }
    ]
  },

  // --- GAMING & LAUNCHERS ---
  {
    id: 'app_steam',
    name: 'Steam & Game Downloads',
    slug: 'steam',
    iconName: 'Gamepad2',
    category: 'gaming',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.8 * 1024 * 1024 * 1024,
    externalUsageBytes: 145.0 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: true,
    adapterVersion: 'v5.0.1 (Steam Library Folder + ShaderCache)',
    isRunning: false,
    lastActive: 'Yesterday',
    categoryRoutings: [
      { category: 'packages', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Steam Library & Downloaded Games (steamapps)',
        originalPath: 'C:\\Program Files (x86)\\Steam\\steamapps\\common',
        suggestedCategory: 'packages',
        sizeBytes: 125.0 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Steam\\steamapps'
      },
      {
        name: 'Vulkan / DirectX Shader Pre-cache',
        originalPath: 'C:\\Program Files (x86)\\Steam\\steamapps\\shadercache',
        suggestedCategory: 'caches',
        sizeBytes: 20.0 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Steam\\shadercache'
      }
    ]
  },

  // --- CREATIVE & MEDIA ---
  {
    id: 'app_adobe_premiere',
    name: 'Adobe Premiere Pro',
    slug: 'premiere',
    iconName: 'Video',
    category: 'creative',
    compatibility: 'gold',
    status: 'fully_protected',
    internalUsageBytes: 0.6 * 1024 * 1024 * 1024,
    externalUsageBytes: 48.5 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: true,
    adapterVersion: 'v3.4.0 (Scratch Disk & Peak Files Routing)',
    isRunning: false,
    lastActive: '3d ago',
    categoryRoutings: [
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'temp_files', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Media Cache Database & Peak Audio Files',
        originalPath: 'C:\\Users\\User\\AppData\\Roaming\\Adobe\\Common\\Media Cache Files',
        suggestedCategory: 'caches',
        sizeBytes: 36.5 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Adobe Premiere Pro\\Media Cache Files'
      },
      {
        name: 'Premiere Pro Auto-Save & Scratch Previews',
        originalPath: 'C:\\Users\\User\\Documents\\Adobe\\Premiere Pro\\Auto-Save',
        suggestedCategory: 'temp_files',
        sizeBytes: 12.0 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Adobe Premiere Pro\\Auto-Save'
      }
    ]
  },
  {
    id: 'app_blender',
    name: 'Blender 3D',
    slug: 'blender',
    iconName: 'Box',
    category: 'creative',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.2 * 1024 * 1024 * 1024,
    externalUsageBytes: 22.4 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: false,
    adapterVersion: 'v2.1.0 (Voxel & Render Cache)',
    isRunning: false,
    lastActive: '5d ago',
    categoryRoutings: [
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'projects', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Blender Temp Renders & Simulation Cache',
        originalPath: 'C:\\Users\\User\\AppData\\Local\\Temp\\blender_cache',
        suggestedCategory: 'caches',
        sizeBytes: 22.4 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Blender 3D\\blender_cache'
      }
    ]
  },
  {
    id: 'app_spotify',
    name: 'Spotify Desktop',
    slug: 'spotify',
    iconName: 'Music',
    category: 'creative',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.08 * 1024 * 1024 * 1024,
    externalUsageBytes: 14.2 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: false,
    adapterVersion: 'v2.0.0 (Offline Storage Relocation)',
    isRunning: true,
    lastActive: 'Active',
    categoryRoutings: [
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Offline Music Downloads & Streaming Cache',
        originalPath: 'C:\\Users\\User\\AppData\\Local\\Spotify\\Storage',
        suggestedCategory: 'caches',
        sizeBytes: 14.2 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Spotify Desktop\\Storage'
      }
    ]
  },

  // --- COMMUNICATION & PRODUCTIVITY ---
  {
    id: 'app_discord',
    name: 'Discord Desktop',
    slug: 'discord',
    iconName: 'MessageSquare',
    category: 'communication',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.12 * 1024 * 1024 * 1024,
    externalUsageBytes: 9.8 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: false,
    adapterVersion: 'v3.0.1 (Media Cache & Codec Redirection)',
    isRunning: true,
    lastActive: 'Active',
    categoryRoutings: [
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Discord Image, Video & Voice Cache',
        originalPath: 'C:\\Users\\User\\AppData\\Roaming\\discord\\Cache',
        suggestedCategory: 'caches',
        sizeBytes: 9.8 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Discord Desktop\\Cache'
      }
    ]
  },
  {
    id: 'app_office_365',
    name: 'Microsoft 365 / Office',
    slug: 'office-365',
    iconName: 'FileSpreadsheet',
    category: 'productivity',
    compatibility: 'gold',
    status: 'fully_protected',
    internalUsageBytes: 0.4 * 1024 * 1024 * 1024,
    externalUsageBytes: 6.4 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: false,
    adapterVersion: 'v2.2.0 (Office Document Cache & AutoRecover)',
    isRunning: false,
    lastActive: '4h ago',
    categoryRoutings: [
      { category: 'backups', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Office Document Cache (ODC) & AutoRecover',
        originalPath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Office\\UnsavedFiles',
        suggestedCategory: 'backups',
        sizeBytes: 6.4 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Microsoft 365\\UnsavedFiles'
      }
    ]
  },

  // --- AI & MACHINE LEARNING TOOLS ---
  {
    id: 'app_chatgpt',
    name: 'ChatGPT Desktop',
    slug: 'chatgpt',
    iconName: 'Bot',
    category: 'ai_assistant',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.42 * 1024 * 1024 * 1024,
    externalUsageBytes: 42.6 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: true,
    adapterVersion: 'v2.4.1 (Windows ProjFS + Junctions)',
    isRunning: true,
    lastActive: 'Just now',
    categoryRoutings: [
      { category: 'projects', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'attachments', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'logs', destinationDriveId: 'drive_external_hdd', method: 'symlink' },
      { category: 'temp_files', destinationDriveId: 'drive_internal_c', method: 'sandboxed_execution', approvalRequired: true }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Conversations & Voice Audio Cache',
        originalPath: 'C:\\Users\\User\\AppData\\Roaming\\OpenAI\\ChatGPT\\storage',
        suggestedCategory: 'caches',
        sizeBytes: 18.4 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\ChatGPT Desktop\\storage'
      },
      {
        name: 'Canvas & Code Interpreter Exports',
        originalPath: 'C:\\Users\\User\\AppData\\Local\\OpenAI\\ChatGPT\\exports',
        suggestedCategory: 'projects',
        sizeBytes: 24.2 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\ChatGPT Desktop\\exports'
      }
    ]
  },
  {
    id: 'app_claude',
    name: 'Claude Desktop',
    slug: 'claude',
    iconName: 'Sparkles',
    category: 'ai_assistant',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.18 * 1024 * 1024 * 1024,
    externalUsageBytes: 18.2 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: true,
    adapterVersion: 'v3.1.0 (MCP & Cache Router)',
    isRunning: true,
    lastActive: '5m ago',
    categoryRoutings: [
      { category: 'projects', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'attachments', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Claude Artifacts & MCP Files',
        originalPath: 'C:\\Users\\User\\AppData\\Roaming\\Claude\\mcp-storage',
        suggestedCategory: 'projects',
        sizeBytes: 11.5 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Claude Desktop\\mcp-storage'
      },
      {
        name: 'Fast Render Cache',
        originalPath: 'C:\\Users\\User\\AppData\\Local\\Claude\\GPUCache',
        suggestedCategory: 'caches',
        sizeBytes: 6.7 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Claude Desktop\\GPUCache'
      }
    ]
  },
  {
    id: 'app_ollama',
    name: 'Ollama Model Server',
    slug: 'ollama',
    iconName: 'Cpu',
    category: 'local_model',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.12 * 1024 * 1024 * 1024,
    externalUsageBytes: 52.0 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: true,
    adapterVersion: 'v2.1.0 (OLLAMA_MODELS Environment)',
    isRunning: false,
    lastActive: '3h ago',
    categoryRoutings: [
      { category: 'models', destinationDriveId: 'drive_external_hdd', method: 'env_variables' },
      { category: 'logs', destinationDriveId: 'drive_external_hdd', method: 'symlink' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Ollama Models Repository (Llama 3.3, Qwen 2.5)',
        originalPath: 'C:\\Users\\User\\.ollama\\models',
        suggestedCategory: 'models',
        sizeBytes: 52.0 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Ollama Model Server\\models'
      }
    ]
  },
  {
    id: 'app_cursor',
    name: 'Cursor AI IDE',
    slug: 'cursor',
    iconName: 'Code',
    category: 'coding_agent',
    compatibility: 'platinum',
    status: 'fully_protected',
    internalUsageBytes: 0.45 * 1024 * 1024 * 1024,
    externalUsageBytes: 26.4 * 1024 * 1024 * 1024,
    primaryDestinationDriveId: 'drive_external_hdd',
    strictMode: true,
    adapterVersion: 'v2.0.4 (Index & Extension Router)',
    isRunning: true,
    lastActive: 'Active',
    categoryRoutings: [
      { category: 'projects', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' },
      { category: 'caches', destinationDriveId: 'drive_external_hdd', method: 'ntfs_junction' }
    ],
    fallbackDriveIds: ['drive_internal_c'],
    defaultLocations: [
      {
        name: 'Codebase Vector Index & Embeddings',
        originalPath: 'C:\\Users\\User\\AppData\\Roaming\\Cursor\\User\\workspaceStorage',
        suggestedCategory: 'caches',
        sizeBytes: 16.2 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Cursor AI IDE\\workspaceStorage'
      },
      {
        name: 'Cursor Extensions',
        originalPath: 'C:\\Users\\User\\.cursor\\extensions',
        suggestedCategory: 'packages',
        sizeBytes: 10.2 * 1024 * 1024 * 1024,
        safetyStatus: 'safe_to_redirect',
        isRedirected: true,
        targetPath: 'D:\\Cursor AI IDE\\extensions'
      }
    ]
  }
];

export const INITIAL_RULES: RoutingRule[] = [
  {
    id: 'rule_1',
    name: 'Store ChatGPT & Claude data on Connected External HDD',
    conditionType: 'app_matches',
    conditionValue: 'chatgpt',
    targetDriveId: 'drive_external_hdd',
    action: 'route_to_target',
    isActive: true,
    priority: 1,
    description: 'Directs all ChatGPT workspaces, conversation audio, and canvas exports to External HDD.'
  },
  {
    id: 'rule_2',
    name: 'Route Large Games & Steam Libraries to External HDD',
    conditionType: 'app_matches',
    conditionValue: 'steam',
    targetDriveId: 'drive_external_hdd',
    action: 'route_to_target',
    isActive: true,
    priority: 2,
    description: 'Offloads massive steamapps game downloads and shader caches to external storage.'
  },
  {
    id: 'rule_3',
    name: 'Heavy Files & Datasets > 10 GB on External HDD',
    conditionType: 'size_greater_than',
    conditionValue: '10737418240',
    targetDriveId: 'drive_external_hdd',
    action: 'route_to_target',
    isActive: true,
    priority: 3,
    description: 'Forces large caches, game packages, and virtual disks onto External HDD.'
  },
  {
    id: 'rule_4',
    name: 'Never write temporary files to Laptop C: without approval',
    conditionType: 'temp_file',
    conditionValue: 'temp_files',
    targetDriveId: 'drive_internal_c',
    action: 'ask_permission',
    isActive: true,
    priority: 4,
    description: 'Intercepts unexpected C:\\ write attempts and displays an interactive permission prompt.'
  },
  {
    id: 'rule_5',
    name: 'Strict Mode: Block app launch if External HDD is disconnected',
    conditionType: 'app_matches',
    conditionValue: '*',
    targetDriveId: 'none',
    action: 'strict_block',
    isActive: true,
    priority: 5,
    description: 'Prevents silent fallback to internal laptop SSD when External HDD is unplugged.'
  }
];

export const INITIAL_LOCAL_WRITES: LocalWriteRequest[] = [
  {
    id: 'req_local_01',
    appId: 'app_chrome',
    appName: 'Google Chrome',
    location: 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache\\data_0',
    estimatedSizeBytes: 1.8 * 1024 * 1024 * 1024,
    reason: 'Web video & asset streaming cache buffer',
    timestamp: '2026-08-25 11:18:12',
    suggestedAction: 'redirect',
    status: 'pending'
  },
  {
    id: 'req_local_02',
    appId: 'app_claude',
    appName: 'Claude Desktop',
    location: 'C:\\Users\\User\\AppData\\Local\\Claude\\GPUCache\\data_0',
    estimatedSizeBytes: 2.4 * 1024 * 1024 * 1024,
    reason: 'Temporary rendering shader cache and fast scratchpad database',
    timestamp: '2026-08-25 11:15:05',
    suggestedAction: 'redirect',
    status: 'pending'
  }
];

export const INITIAL_SESSION_FILES: SessionCreatedFile[] = [
  {
    id: 'sess_file_1',
    appId: 'app_chrome',
    appName: 'Google Chrome',
    path: 'C:\\Users\\User\\Downloads\\setup_installer_temp.tmp',
    sizeBytes: 1.2 * 1024 * 1024 * 1024,
    category: 'temporary_cache',
    suggestedAction: 'delete',
    checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    verifiedTransfer: false,
    selected: true
  },
  {
    id: 'sess_file_2',
    appId: 'app_vscode',
    appName: 'Visual Studio Code',
    path: 'C:\\Users\\User\\Documents\\Project_Analysis_Export.pdf',
    sizeBytes: 180 * 1024 * 1024,
    category: 'generated_document',
    suggestedAction: 'transfer',
    checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    verifiedTransfer: true,
    selected: true
  },
  {
    id: 'sess_file_3',
    appId: 'app_chatgpt',
    appName: 'ChatGPT Desktop',
    path: 'C:\\Users\\User\\Documents\\Financial_Analysis_Q3.xlsx',
    sizeBytes: 240 * 1024 * 1024,
    category: 'generated_document',
    suggestedAction: 'transfer',
    checksumSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    verifiedTransfer: true,
    selected: true
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act_1',
    timestamp: '11:20:40',
    type: 'write_external',
    appName: 'Google Chrome',
    driveLabel: 'Connected External HDD (D:)',
    path: 'D:\\EWM-Workspace\\caches\\chrome-cache\\f_00021b',
    sizeBytes: 85 * 1024 * 1024,
    speedMBs: 138,
    status: 'success',
    message: 'Saved browser media cache stream directly to External HDD (NTFS Junction).'
  },
  {
    id: 'act_2',
    timestamp: '11:18:12',
    type: 'approval_prompt',
    appName: 'Google Chrome',
    driveLabel: 'Laptop Internal Storage (C:)',
    path: 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
    sizeBytes: 1.8 * 1024 * 1024 * 1024,
    status: 'warning',
    message: 'Intercepted local write request on C:\\. Waiting for user authorization.'
  },
  {
    id: 'act_3',
    timestamp: '11:15:05',
    type: 'write_external',
    appName: 'Visual Studio Code',
    driveLabel: 'Connected External HDD (D:)',
    path: 'D:\\EWM-Workspace\\packages\\vscode-extensions\\ms-tools.node\\package.json',
    sizeBytes: 42 * 1024 * 1024,
    speedMBs: 135,
    status: 'success',
    message: 'Extension payload written directly to External HDD.'
  },
  {
    id: 'act_4',
    timestamp: '11:10:00',
    type: 'drive_event',
    appName: 'Storage Engine',
    driveLabel: 'Connected External HDD (D:)',
    path: 'D:\\',
    sizeBytes: 0,
    status: 'success',
    message: 'External HDD diagnostic passed: Health Excellent (100%), Temp 36°C, Interface USB 3.0.'
  }
];

export const INITIAL_CLEANABLE_ITEMS: CleanableItem[] = [
  {
    id: 'clean_1',
    title: 'Old Chrome & Browser Shader Cache',
    category: 'orphaned_cache',
    sourceDriveId: 'drive_internal_c',
    path: 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\GPUCache',
    sizeBytes: 4.8 * 1024 * 1024 * 1024,
    lastAccessed: '30 days ago',
    riskLevel: 'safe',
    description: 'Outdated GPU compilation binaries from past browser sessions. Safe to wipe and recover C:\\ space.',
    selected: true
  },
  {
    id: 'clean_2',
    title: 'Unused npm & yarn packages cache',
    category: 'unused_package',
    sourceDriveId: 'drive_internal_c',
    path: 'C:\\Users\\User\\AppData\\Local\\npm-cache\\_cacache\\content-v2',
    sizeBytes: 6.2 * 1024 * 1024 * 1024,
    lastAccessed: '45 days ago',
    riskLevel: 'safe',
    description: 'Old npm tarball archives from outdated package versions.',
    selected: true
  },
  {
    id: 'clean_3',
    title: 'Temporary Windows Crash Dumps (.dmp)',
    category: 'crash_dump',
    sourceDriveId: 'drive_internal_c',
    path: 'C:\\Users\\User\\AppData\\Local\\CrashDumps',
    sizeBytes: 1.8 * 1024 * 1024 * 1024,
    lastAccessed: '15 days ago',
    riskLevel: 'safe',
    description: 'Stale application crash logs and dump files.',
    selected: true
  }
];

export const INITIAL_BACKUPS: BackupSnapshot[] = [
  {
    id: 'snap_01',
    name: 'Full Laptop Applications & Workspaces Backup',
    timestamp: '2026-08-25 09:00',
    destinationDriveId: 'drive_external_hdd',
    totalSizeBytes: 86.4 * 1024 * 1024 * 1024,
    includedApps: ['Google Chrome', 'Visual Studio Code', 'Steam & Game Downloads', 'Docker Desktop'],
    isEncrypted: true,
    checksumVerified: true,
    status: 'ready'
  }
];
