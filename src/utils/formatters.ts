export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSpeed(mbPerSec: number): string {
  if (mbPerSec >= 1000) {
    return `${(mbPerSec / 1000).toFixed(2)} GB/s`;
  }
  return `${Math.round(mbPerSec)} MB/s`;
}

export function getDriveTypeLabel(type: string): string {
  switch (type) {
    case 'nvme': return 'Portable NVMe';
    case 'ssd': return 'External SSD';
    case 'hdd': return 'External HDD';
    case 'usb_flash': return 'USB Flash Drive';
    case 'sd_card': return 'SD Card';
    case 'nas': return 'Network NAS';
    case 'cloud': return 'Cloud Storage';
    case 'internal': return 'Internal NVMe (Laptop)';
    default: return 'Storage Device';
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'projects': return 'Projects & Code';
    case 'attachments': return 'Attachments & Media';
    case 'models': return 'AI Models & Weights';
    case 'caches': return 'Active Cache & Indices';
    case 'environments': return 'Dev Environments / VHDX';
    case 'packages': return 'Packages & Extensions';
    case 'logs': return 'Logs & Diagnostics';
    case 'backups': return 'Backups & Snapshots';
    case 'temp_files': return 'Temporary / Scratch';
    case 'artifacts': return 'Artifacts & Exports';
    case 'system_settings': return 'System Settings';
    default: return category;
  }
}

export function getMethodLabel(method: string): string {
  switch (method) {
    case 'ntfs_junction': return 'NTFS Junction Link';
    case 'symlink': return 'Symbolic Link';
    case 'env_variables': return 'Environment Variables';
    case 'app_adapter': return 'App Adapter Profile';
    case 'filesystem_virtualization': return 'Windows ProjFS Virtualization';
    case 'sandboxed_execution': return 'Sandboxed Isolation';
    default: return method;
  }
}
