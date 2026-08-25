/**
 * Utility functions for computing clean, user-friendly destination folder paths during application migration.
 * Structure: TargetDrive:\[AppName]\[FolderName]
 * e.g., D:\Google Chrome\Cache
 */

export type FolderNamingStrategy = 'app_folder_default' | 'mirror_original' | 'custom';

/**
 * Sanitizes a string to be a safe Windows folder name
 */
export function sanitizeWindowsFolderName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts the leaf folder or meaningful subfolder from the original Windows path
 */
export function getLeafFolderName(path: string): string {
  if (!path) return 'Data';
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || 'Data';
}

/**
 * Default Strategy: Creates a clean, concise path under the Application Name folder on the target disk.
 * e.g. D:\Google Chrome\Cache
 * e.g. D:\Visual Studio Code\extensions
 */
export function cleanAppFolderPath(
  appName: string,
  originalPath: string,
  locationName: string,
  targetMountPoint: string
): string {
  const cleanMount = targetMountPoint.endsWith('\\') || targetMountPoint.endsWith('/')
    ? targetMountPoint
    : `${targetMountPoint}\\`;

  const safeApp = sanitizeWindowsFolderName(appName);
  const leaf = getLeafFolderName(originalPath);

  // If the leaf is generic like "Default" or "Data", use location name or combine
  let subfolder = leaf;
  if (['Default', 'Local', 'Roaming', 'Temp'].includes(leaf)) {
    const locLeaf = sanitizeWindowsFolderName(locationName);
    subfolder = locLeaf;
  }

  return `${cleanMount}${safeApp}\\${subfolder}`;
}

/**
 * Mirror Strategy: Replaces the drive letter and keeps the entire deep original path
 */
export function mirrorOriginalPath(originalPath: string, targetMountPoint: string): string {
  if (!originalPath) return `${targetMountPoint}Migrated_Folder`;
  
  const cleanMount = targetMountPoint.endsWith('\\') || targetMountPoint.endsWith('/') 
    ? targetMountPoint 
    : `${targetMountPoint}\\`;

  const relativePath = originalPath.replace(/^[a-zA-Z]:[\\/]?/, '');
  return `${cleanMount}${relativePath}`;
}

/**
 * Creates a new folder path inside the Application folder on the target drive
 * e.g. D:\Google Chrome\My_New_Folder
 */
export function createAppSubfolderPath(
  appName: string,
  newSubfolderName: string,
  targetMountPoint: string
): string {
  const cleanMount = targetMountPoint.endsWith('\\') || targetMountPoint.endsWith('/')
    ? targetMountPoint
    : `${targetMountPoint}\\`;

  const safeApp = sanitizeWindowsFolderName(appName);
  const safeSubfolder = sanitizeWindowsFolderName(newSubfolderName) || 'New_Folder';

  return `${cleanMount}${safeApp}\\${safeSubfolder}`;
}

/**
 * Builds a custom arbitrary path given a target drive and custom path input
 */
export function buildCustomPath(
  targetMountPoint: string,
  customPath: string
): string {
  const cleanMount = targetMountPoint.endsWith('\\') || targetMountPoint.endsWith('/')
    ? targetMountPoint
    : `${targetMountPoint}\\`;

  const cleanCustom = customPath.replace(/^[a-zA-Z]:[\\/]?/, '').replace(/^\\+/, '');
  return `${cleanMount}${cleanCustom}`;
}
