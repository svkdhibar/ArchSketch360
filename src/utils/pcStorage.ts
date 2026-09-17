/**
 * PC Storage & File System Access Utilities
 * Connects directly to the user's PC storage (hard drive) using the File System Access API
 * and provides graceful fallback for standard downloads.
 * Detects when a file has been deleted from PC storage so AutoSave can be safely stopped.
 */

export interface PCFileSaveResult {
  success: boolean;
  cancelled?: boolean;
  handle?: any | null; // FileSystemFileHandle
  fileName: string;
  method: 'direct_disk' | 'download';
  error?: string;
}

export interface PCAutoSaveResult {
  success: boolean;
  deleted: boolean;
  error?: string;
}

/**
 * Check if the browser supports File System Access API for direct PC disk saving
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).showSaveFilePicker === 'function';
}

/**
 * Save As to PC storage:
 * 1. Attempts to use File System Access API so the app gets a direct handle to the file on the user's PC.
 * 2. If blocked or unsupported (e.g. iframe sandbox policy), falls back to standard browser download.
 */
export async function saveAsToPCStorage(
  suggestedName: string,
  dataString: string
): Promise<PCFileSaveResult> {
  const cleanName = suggestedName.replace(/\.[^/.]+$/, '').trim() || 'FloorPlan_Document';
  const fullFileName = `${cleanName}.archcad`;

  // Try direct PC File System Access API first
  if (isFileSystemAccessSupported()) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fullFileName,
        types: [
          {
            description: 'ArchCAD Studio Project File (*.archcad)',
            accept: {
              'application/json': ['.archcad'],
            },
          },
        ],
      });

      // Write data to the selected file on PC storage
      const writable = await handle.createWritable();
      await writable.write(dataString);
      await writable.close();

      return {
        success: true,
        handle,
        fileName: handle.name || fullFileName,
        method: 'direct_disk',
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled the file picker dialog
        return {
          success: false,
          cancelled: true,
          fileName: fullFileName,
          method: 'direct_disk',
        };
      }
      // If SecurityError (e.g., inside restricted iframe) or NotAllowedError, fall back to download
      console.warn('File System Access API failed or restricted, falling back to download:', err);
    }
  }

  // Fallback: standard browser download to PC storage
  try {
    const blob = new Blob([dataString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fullFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      handle: null,
      fileName: fullFileName,
      method: 'download',
    };
  } catch (err: any) {
    return {
      success: false,
      fileName: fullFileName,
      method: 'download',
      error: err?.message || 'Download failed',
    };
  }
}

/**
 * Check if the file on the user's PC storage still exists.
 * When a file on PC storage is deleted, FileSystemFileHandle.getFile() throws a NotFoundError.
 */
export async function verifyPCFileExists(handle: any): Promise<boolean> {
  if (!handle) return false;
  try {
    await handle.getFile();
    return true;
  } catch (err: any) {
    // If deleted from PC storage
    if (
      err.name === 'NotFoundError' ||
      err.name === 'NotAllowedError' ||
      err.message?.toLowerCase().includes('not found') ||
      err.message?.toLowerCase().includes('deleted')
    ) {
      return false;
    }
    return false;
  }
}

/**
 * AutoSave directly to the linked PC file.
 * Returns deleted: true if the file was removed from PC storage.
 */
export async function autoSaveToPCFile(handle: any, dataString: string): Promise<PCAutoSaveResult> {
  if (!handle) {
    return { success: false, deleted: true, error: 'No PC file handle available' };
  }

  try {
    // Verifies whether file still exists on PC storage
    await handle.getFile();

    const writable = await handle.createWritable();
    await writable.write(dataString);
    await writable.close();

    return { success: true, deleted: false };
  } catch (err: any) {
    const isDeleted =
      err.name === 'NotFoundError' ||
      err.message?.toLowerCase().includes('not found') ||
      err.message?.toLowerCase().includes('could not be found') ||
      err.message?.toLowerCase().includes('deleted');

    return {
      success: false,
      deleted: isDeleted,
      error: err?.message || 'Failed to write to PC storage',
    };
  }
}
