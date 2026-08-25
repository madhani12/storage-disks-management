export type DriveType = 'nvme' | 'ssd' | 'hdd' | 'usb_flash' | 'sd_card' | 'nas' | 'cloud' | 'internal';

export type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical';

export interface StorageDrive {
  id: string;
  label: string; // e.g. "AI-SSD-01"
  volumeIdentity: string; // e.g. "VOL_EXT_8F4A2"
  mountPoint: string; // e.g. "E:\" or "/Volumes/AI-SSD-01"
  type: DriveType;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  readSpeedMBs: number;
  writeSpeedMBs: number;
  health: HealthStatus;
  temperatureC?: number;
  isEncrypted: boolean;
  encryptionAlgorithm?: string;
  isRemovable: boolean;
  isConnected: boolean;
  connectionInterface: string; // e.g. "USB 3.2 Gen 2 (10Gbps)", "Thunderbolt 4 / PCIe Gen4", "SATA III", "10GbE NAS", "Cloud HTTPS"
  latencyMs: number;
  warningNotice?: string;
  lastTestedAt?: string;
  workspaceInitialized: boolean;
  isRealDevice?: boolean;
  originType?: 'real_filesystem' | 'system_quota' | 'custom_hardware' | 'demo_template';
  fileCount?: number;
  directoryHandle?: any;
}

export interface SystemHardwareProbe {
  platform: string;
  cores: number;
  memoryGB?: number;
  storageQuotaBytes: number;
  storageUsageBytes: number;
  storageAvailableBytes: number;
  isPersisted: boolean;
  fileSystemApiSupported: boolean;
  webUsbSupported: boolean;
  networkDownlinkMbps?: number;
  networkType?: string;
  timestamp: string;
}

export interface PhysicalBenchmarkResult {
  readSpeedMBs: number;
  writeSpeedMBs: number;
  latencyMs: number;
  testFileSizeBytes: number;
  durationMs: number;
  verifiedParity: boolean;
}

export type CompatibilityLevel = 'platinum' | 'gold' | 'silver' | 'bronze' | 'unsupported';

export type RedirectionMethod = 
  | 'ntfs_junction' 
  | 'symlink' 
  | 'env_variables' 
  | 'app_adapter' 
  | 'filesystem_virtualization' 
  | 'sandboxed_execution';

export type DataCategory = 
  | 'projects'
  | 'attachments'
  | 'models'
  | 'datasets'
  | 'caches'
  | 'environments'
  | 'packages'
  | 'logs'
  | 'backups'
  | 'temp_files'
  | 'artifacts'
  | 'system_settings';

export type AppCategory = 
  | 'browser'
  | 'dev_tool'
  | 'ide'
  | 'creative'
  | 'gaming'
  | 'productivity'
  | 'communication'
  | 'ai_assistant'
  | 'coding_agent'
  | 'local_model'
  | 'utility'
  | 'other';

export interface CategoryRouting {
  category: DataCategory;
  destinationDriveId: string;
  method: RedirectionMethod;
  customPath?: string;
  approvalRequired?: boolean;
}

export interface ApplicationProfile {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  category: AppCategory;
  compatibility: CompatibilityLevel;
  status: 'fully_protected' | 'partially_protected' | 'unprotected' | 'migrating';
  internalUsageBytes: number;
  externalUsageBytes: number;
  primaryDestinationDriveId: string;
  categoryRoutings: CategoryRouting[];
  fallbackDriveIds: string[];
  strictMode: boolean; // do not launch if drive missing
  defaultLocations: {
    name: string;
    originalPath: string;
    suggestedCategory: DataCategory;
    sizeBytes: number;
    safetyStatus: 'safe_to_move' | 'safe_to_redirect' | 'requires_restart' | 'requires_admin' | 'unsafe';
    isRedirected: boolean;
    targetPath?: string;
  }[];
  adapterVersion: string;
  lastActive?: string;
  isRunning?: boolean;
  isCustomLaptopApp?: boolean;
}

export interface RoutingRule {
  id: string;
  name: string;
  conditionType: 'app_matches' | 'category_matches' | 'size_greater_than' | 'file_type_matches' | 'temp_file';
  conditionValue: string; // e.g. "models", "10737418240" (10GB), "*.safetensors"
  targetDriveId: string;
  action: 'route_to_target' | 'ask_permission' | 'strict_block' | 'compress_archive';
  isActive: boolean;
  priority: number;
  description: string;
}

export interface LocalWriteRequest {
  id: string;
  appId: string;
  appName: string;
  location: string;
  estimatedSizeBytes: number;
  reason: string;
  timestamp: string;
  suggestedAction: 'redirect' | 'allow_once' | 'block';
  status: 'pending' | 'allowed_once' | 'allowed_session' | 'always_allowed' | 'redirected' | 'blocked';
}

export interface SessionCreatedFile {
  id: string;
  appId: string;
  appName: string;
  path: string;
  sizeBytes: number;
  category: 'temporary_cache' | 'generated_document' | 'crash_log' | 'application_settings' | 'model_weights' | 'artifact';
  suggestedAction: 'transfer' | 'delete' | 'keep' | 'archive';
  checksumSha256: string;
  verifiedTransfer: boolean;
  selected: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'write_external' | 'write_internal' | 'redirection' | 'approval_prompt' | 'transfer_complete' | 'drive_event' | 'alert';
  appName: string;
  driveLabel: string;
  path: string;
  sizeBytes: number;
  speedMBs?: number;
  status: 'success' | 'warning' | 'blocked' | 'in_progress';
  message: string;
}

export interface BackupSnapshot {
  id: string;
  name: string;
  timestamp: string;
  destinationDriveId: string;
  totalSizeBytes: number;
  includedApps: string[];
  isEncrypted: boolean;
  checksumVerified: boolean;
  status: 'ready' | 'in_progress' | 'restoring';
}

export interface CleanableItem {
  id: string;
  title: string;
  category: 'orphaned_cache' | 'duplicate_model' | 'abandoned_project' | 'temp_export' | 'crash_dump' | 'unused_package';
  sourceDriveId: string;
  path: string;
  sizeBytes: number;
  lastAccessed: string;
  riskLevel: 'safe' | 'caution' | 'review_needed';
  description: string;
  selected: boolean;
}
