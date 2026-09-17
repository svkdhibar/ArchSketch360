/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import {
  ArchObject,
  CategoryName,
  LibraryItemDef,
  ToolType,
  LibraryPosition,
  SavedDocument,
  SaveAsFormat,
  MeasurementUnit,
  CloudUser,
  CloudSyncStatus,
  CloudProjectRecord,
  TouchDragTarget,
} from './types';
import { CATEGORIES, LIBRARY_ITEMS } from './data/libraryItems';
import { AUTOMATIC_TEMPLATES } from './data/automaticTemplates';
import { TopBar } from './components/TopBar';
import { DesignLibrary } from './components/DesignLibrary';
import { DrawingCanvas } from './components/DrawingCanvas';
import { ObjectInspector } from './components/ObjectInspector';
import { ArchSymbolGraphic } from './components/ArchSymbols';

const PrintStudio = lazy(() =>
  import('./components/PrintStudio').then((m) => ({ default: m.PrintStudio }))
);
const WordFileManager = lazy(() =>
  import('./components/WordFileManager').then((m) => ({ default: m.WordFileManager }))
);
import { hasSpecializedFeatures } from './utils/specializedFeatures';
import {
  saveAsToPCStorage,
  verifyPCFileExists,
  autoSaveToPCFile,
} from './utils/pcStorage';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuthChanges,
  saveProjectToCloud,
  subscribeToUserProjects,
  deleteProjectFromCloud,
} from './firebase';
import { Minimize2 } from 'lucide-react';

export default function App() {
  // Primary Architectural Elements State (Empty canvas by default)
  const [objects, setObjects] = useState<ArchObject[]>(() => []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [tool, setTool] = useState<ToolType>('select');
  const [currentCategory, setCurrentCategory] = useState<CategoryName>('Doors');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFocusCanvas, setIsFocusCanvas] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>(
    'Select a tool or drag elements from the library to start designing'
  );

  // Canvas Viewport State (Snap off by default)
  const [zoom, setZoom] = useState<number>(1);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 80, y: 40 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [showLeaderLines, setShowLeaderLines] = useState<boolean>(false);
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('ft_in');
  const [touchDragTarget, setTouchDragTarget] = useState<TouchDragTarget | null>(null);
  const [isLibraryMinimized, setIsLibraryMinimized] = useState<boolean>(false);
  const [libraryPosition, setLibraryPosition] = useState<LibraryPosition>(() => {
    try {
      const userSet = localStorage.getItem('arch_cad_library_position_user_pref');
      if (userSet === 'left' || userSet === 'right' || userSet === 'bottom') return userSet;
    } catch {
      // ignore
    }
    return 'left';
  });
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState<boolean>(false);
  const [fileManagerTab, setFileManagerTab] = useState<'info' | 'new' | 'open' | 'save' | 'save_as' | 'import_graphic' | 'export' | 'cloud' | 'contact'>('info');
  const [hasSavedArchcadFile, setHasSavedArchcadFile] = useState<boolean>(false);
  const [currentSavedDocId, setCurrentSavedDocId] = useState<string | null>(null);
  const [pcFileHandle, setPcFileHandle] = useState<any | null>(null);
  const [pcFileName, setPcFileName] = useState<string | null>(null);
  const [isPcFileDeleted, setIsPcFileDeleted] = useState<boolean>(false);
  const [pcStorageMethod, setPcStorageMethod] = useState<'direct_disk' | 'download' | 'none'>('none');
  const [documentTitle, setDocumentTitle] = useState<string>('Untitled_Plan');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Google Cloud AutoSave & User State
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('not_signed_in');
  const [cloudProjects, setCloudProjects] = useState<CloudProjectRecord[]>([]);
  const [lastCloudSavedTime, setLastCloudSavedTime] = useState<string | null>(null);
  const [currentCloudDocId, setCurrentCloudDocId] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<SavedDocument[]>(() => {
    try {
      const saved = localStorage.getItem('arch_cad_recent_files');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Permanently strip out any existing starter/sample files: Rotunda_Villa_Design, Master_Bedroom_Suite, FloorPlan_Document1
          const cleaned = parsed.filter(
            (d) =>
              d &&
              d.id !== 'sample_rotunda' &&
              d.id !== 'sample_master' &&
              d.title !== 'Rotunda_Villa_Design' &&
              d.title !== 'Master_Bedroom_Suite' &&
              d.title !== 'FloorPlan_Document1'
          );
          localStorage.setItem('arch_cad_recent_files', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const handleSetLibraryPosition = useCallback((pos: LibraryPosition) => {
    setLibraryPosition(pos);
    try {
      localStorage.setItem('arch_cad_library_position', pos);
      localStorage.setItem('arch_cad_library_position_user_pref', pos);
    } catch {
      // ignore
    }
    setStatusText(`Design Library docked to ${pos.toUpperCase()} bar`);
  }, []);

  // Auto-clean any stacked identical duplicate objects
  useEffect(() => {
    setObjects((prev) => {
      let hasDuplicates = false;
      const seen = new Set<string>();
      const filtered: ArchObject[] = [];
      for (const obj of prev) {
        const key = `${obj.kind}_${Math.round(obj.x)}_${Math.round(obj.y)}_${Math.round(obj.w)}_${Math.round(obj.h)}`;
        if (seen.has(key)) {
          hasDuplicates = true;
        } else {
          seen.add(key);
          filtered.push(obj);
        }
      }
      return hasDuplicates ? filtered : prev;
    });
  }, []);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<ArchObject[][]>([]);
  const [redoStack, setRedoStack] = useState<ArchObject[][]>([]);
  const [clipboard, setClipboard] = useState<ArchObject[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  // Save Undo History Snapshot
  const pushUndo = useCallback(() => {
    setUndoStack((prev) => {
      const next = [...prev, JSON.parse(JSON.stringify(objects))];
      if (next.length > 50) next.shift();
      return next;
    });
    setRedoStack([]);
  }, [objects]);

  // Undo Action
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(objects))]);
    setUndoStack((prev) => prev.slice(0, -1));
    setObjects(previous);
    setStatusText('Undo executed');
  }, [undoStack, objects]);

  // Redo Action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(objects))]);
    setRedoStack((prev) => prev.slice(0, -1));
    setObjects(nextState);
    setStatusText('Redo executed');
  }, [redoStack, objects]);

  // Update a single object
  const handleUpdateObject = useCallback(
    (id: string, updates: Partial<ArchObject>, saveHistory = true) => {
      if (saveHistory) pushUndo();
      setObjects((prev) =>
        prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj))
      );
    },
    [pushUndo]
  );

  // Update currently selected object(s)
  const handleUpdateSelected = useCallback(
    (updates: Partial<ArchObject>) => {
      if (selectedIds.length === 0) return;
      pushUndo();
      setObjects((prev) =>
        prev.map((obj) =>
          selectedIds.includes(obj.id) && !obj.locked ? { ...obj, ...updates } : obj
        )
      );
      if (updates.angle !== undefined) {
        setStatusText(`Rotated to ${Math.round(updates.angle)}°`);
      }
    },
    [selectedIds, pushUndo]
  );

  // Batch update
  const handleBatchUpdateObjects = useCallback(
    (batch: { id: string; updates: Partial<ArchObject> }[], saveHistory = true) => {
      if (saveHistory) pushUndo();
      setObjects((prev) => {
        const map = new Map(batch.map((b) => [b.id, b.updates]));
        return prev.map((obj) => {
          const u = map.get(obj.id);
          return u ? { ...obj, ...u } : obj;
        });
      });
    },
    [pushUndo]
  );

  // Delete object
  const handleDeleteObject = useCallback(
    (id: string) => {
      pushUndo();
      setObjects((prev) => prev.filter((o) => o.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      setIsInspectorOpen(false);
      setStatusText('Object deleted');
    },
    [pushUndo]
  );

  // Delete all selected
  const handleDeleteSelected = useCallback(() => {
    const unLocked = objects.filter((o) => selectedIds.includes(o.id) && !o.locked);
    if (unLocked.length === 0) {
      if (selectedIds.length > 0) setStatusText('Selected object(s) are locked');
      return;
    }
    pushUndo();
    const idsToDelete = new Set(unLocked.map((o) => o.id));
    setObjects((prev) => prev.filter((o) => !idsToDelete.has(o.id)));
    setSelectedIds([]);
    setIsInspectorOpen(false);
    setStatusText(`Deleted ${unLocked.length} object(s)`);
  }, [objects, selectedIds, pushUndo]);

  // Create new object
  const handleCreateObject = useCallback(
    (newObj: ArchObject) => {
      pushUndo();
      setObjects((prev) => {
        // Prevent accidental rapid duplicate placement (same kind, position, and dimensions)
        const isDuplicate = prev.some(
          (o) =>
            o.kind === newObj.kind &&
            Math.abs(o.x - newObj.x) < 4 &&
            Math.abs(o.y - newObj.y) < 4 &&
            Math.abs(o.w - newObj.w) < 4 &&
            Math.abs(o.h - newObj.h) < 4
        );
        if (isDuplicate) {
          return prev;
        }
        return [...prev, newObj];
      });
      setSelectedIds([newObj.id]);
      setTool('select');
      setStatusText(`Placed ${newObj.name}. Drag the top handle to rotate 360°.`);
    },
    [pushUndo]
  );

  // Select Objects
  const handleSelectObjects = useCallback((ids: string[], isAdditive = false) => {
    if (ids.length === 0) {
      setIsInspectorOpen(false);
    }
    if (isAdditive) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => (next.has(id) ? next.delete(id) : next.add(id)));
        return Array.from(next);
      });
    } else {
      setSelectedIds(ids);
    }
  }, []);

  // Right-click selecting an icon: open contextual features tailored for that specific icon
  const handleContextMenuObject = useCallback(
    (obj: ArchObject, e: React.MouseEvent) => {
      e.preventDefault();
      setSelectedIds([obj.id]);
      setIsInspectorOpen(true);
      setStatusText(`Opened controls for "${obj.name}".`);
    },
    []
  );

  // 360° Relative Rotation (e.g. +90°, -90°, +45°)
  const handleRotateRelative = useCallback(
    (delta: number) => {
      if (selectedIds.length === 0) return;
      pushUndo();
      setObjects((prev) =>
        prev.map((obj) => {
          if (selectedIds.includes(obj.id) && !obj.locked) {
            const nextAngle = (((obj.angle + delta) % 360) + 360) % 360;
            return { ...obj, angle: Math.round(nextAngle) };
          }
          return obj;
        })
      );
      setStatusText(`Rotated ${delta > 0 ? `+${delta}` : delta}°`);
    },
    [selectedIds, pushUndo]
  );

  // Flip Horizontal
  const handleFlipHorizontal = useCallback(() => {
    if (selectedIds.length === 0) return;
    pushUndo();
    setObjects((prev) =>
      prev.map((obj) => {
        if (selectedIds.includes(obj.id) && !obj.locked) {
          const nextFlipH = !obj.flipH;
          const nextSwing = obj.doorSwing
            ? obj.doorSwing === 'left' ? 'right' : 'left'
            : obj.kind === 'door_single_rh' ? 'left' : 'right';
          return {
            ...obj,
            flipH: nextFlipH,
            doorSwing: nextSwing as 'left' | 'right',
          };
        }
        return obj;
      })
    );
    setStatusText('Flipped horizontally (Mirrored)');
  }, [selectedIds, pushUndo]);

  // Flip Vertical
  const handleFlipVertical = useCallback(() => {
    if (selectedIds.length === 0) return;
    pushUndo();
    setObjects((prev) =>
      prev.map((obj) => {
        if (selectedIds.includes(obj.id) && !obj.locked) {
          const nextFlipV = !obj.flipV;
          return {
            ...obj,
            flipV: nextFlipV,
            doorInswing: !obj.doorInswing,
          };
        }
        return obj;
      })
    );
    setStatusText('Flipped vertically (Mirrored)');
  }, [selectedIds, pushUndo]);

  // Toggle Lock
  const handleToggleLock = useCallback(() => {
    if (selectedIds.length === 0) return;
    pushUndo();
    const hasUnlocked = objects.some((o) => selectedIds.includes(o.id) && !o.locked);
    const newLockState = hasUnlocked; // If any is unlocked, lock all; else unlock all
    setObjects((prev) =>
      prev.map((obj) => (selectedIds.includes(obj.id) ? { ...obj, locked: newLockState } : obj))
    );
    setStatusText(newLockState ? 'Locked selected object(s)' : 'Unlocked selected object(s)');
  }, [selectedIds, objects, pushUndo]);

  // Copy
  const handleCopy = useCallback(() => {
    const selected = objects.filter((o) => selectedIds.includes(o.id));
    if (selected.length === 0) return;
    setClipboard(JSON.parse(JSON.stringify(selected)));
    setStatusText(`Copied ${selected.length} object(s)`);
  }, [objects, selectedIds]);

  // Paste
  const handlePaste = useCallback(() => {
    if (clipboard.length === 0) return;
    pushUndo();
    const newItems: ArchObject[] = clipboard.map((item, idx) => ({
      ...item,
      id: `${item.kind}_${Date.now()}_${idx}`,
      x: item.x + 30,
      y: item.y + 30,
      locked: false,
    }));
    setObjects((prev) => [...prev, ...newItems]);
    setSelectedIds(newItems.map((i) => i.id));
    setClipboard(newItems);
    setStatusText(`Pasted ${newItems.length} object(s)`);
  }, [clipboard, pushUndo]);

  // Duplicate
  const handleDuplicate = useCallback(() => {
    const selected = objects.filter((o) => selectedIds.includes(o.id));
    if (selected.length === 0) return;
    pushUndo();
    const cloned: ArchObject[] = selected.map((item, idx) => ({
      ...item,
      id: `${item.kind}_${Date.now()}_${idx}`,
      x: item.x + 25,
      y: item.y + 25,
      locked: false,
    }));
    setObjects((prev) => [...prev, ...cloned]);
    setSelectedIds(cloned.map((c) => c.id));
    setStatusText(`Duplicated ${cloned.length} object(s)`);
  }, [objects, selectedIds, pushUndo]);

  // Layer Ordering: Bring to Front
  const handleBringToFront = useCallback(() => {
    if (selectedIds.length === 0) return;
    pushUndo();
    setObjects((prev) => {
      const selected = prev.filter((o) => selectedIds.includes(o.id));
      const rest = prev.filter((o) => !selectedIds.includes(o.id));
      return [...rest, ...selected];
    });
    setStatusText('Brought to front');
  }, [selectedIds, pushUndo]);

  // Layer Ordering: Send to Back
  const handleSendToBack = useCallback(() => {
    if (selectedIds.length === 0) return;
    pushUndo();
    setObjects((prev) => {
      const selected = prev.filter((o) => selectedIds.includes(o.id));
      const rest = prev.filter((o) => !selectedIds.includes(o.id));
      return [...selected, ...rest];
    });
    setStatusText('Sent to back');
  }, [selectedIds, pushUndo]);

  // Clear Canvas
  const handleClear = useCallback(() => {
    if (objects.length === 0) return;
    pushUndo();
    setObjects([]);
    setSelectedIds([]);
    setStatusText('Canvas cleared');
  }, [objects.length, pushUndo]);

  // Save current design to LocalStorage Library (Word-style Save)
  const handleSaveToStorage = useCallback((titleToSave?: string) => {
    try {
      const docId = currentSavedDocId || `doc_${Date.now()}`;
      const now = new Date();
      const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const fullTime = `${dateFormatted} at ${timeFormatted}`;
      const finalTitle = (titleToSave || documentTitle || 'FloorPlan_Document').trim();

      const newDoc: SavedDocument = {
        id: docId,
        title: finalTitle,
        updatedAt: fullTime,
        objectCount: objects.length,
        objects: JSON.parse(JSON.stringify(objects)),
      };

      setCurrentSavedDocId(docId);
      setRecentFiles((prev) => {
        const filtered = prev.filter((d) => d.id !== docId && d.title.toLowerCase() !== finalTitle.toLowerCase());
        const updated = [newDoc, ...filtered].slice(0, 20);
        try {
          localStorage.setItem('arch_cad_recent_files', JSON.stringify(updated));
        } catch (err) {
          console.warn('LocalStorage save failed', err);
        }
        return updated;
      });

      setLastSavedTime(fullTime);
      setStatusText(`Saved "${newDoc.title}" to library at ${timeFormatted}`);

      // If user is signed in to Google, also sync with Google Cloud
      if (cloudUser) {
        saveProjectToCloud(cloudUser.uid, {
          id: currentCloudDocId || `proj_${Date.now()}`,
          title: finalTitle,
          objects,
          objectCount: objects.length,
        })
          .then((rec) => {
            setCurrentCloudDocId(rec.id);
            setCloudSyncStatus('synced');
            setLastCloudSavedTime(timeFormatted);
          })
          .catch((err) => {
            console.warn('Cloud sync error during storage save:', err);
          });
      }
    } catch (e) {
      console.error(e);
      setStatusText('Error saving document');
    }
  }, [documentTitle, objects, currentSavedDocId, cloudUser, currentCloudDocId]);

  // Google Auth State Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCloudUser(user);
      if (user) {
        setCloudSyncStatus('synced');
        setStatusText(`Signed in with Google as ${user.displayName || user.email} — Cloud AutoSave active`);
      } else {
        setCloudSyncStatus('not_signed_in');
        setCloudProjects([]);
        setCurrentCloudDocId(null);
        setLastCloudSavedTime(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user's saved cloud projects in Firestore
  useEffect(() => {
    if (!cloudUser) {
      setCloudProjects([]);
      return;
    }
    const unsubscribe = subscribeToUserProjects(cloudUser.uid, (projects) => {
      setCloudProjects(projects);
    });
    return () => unsubscribe();
  }, [cloudUser]);

  // Sign In with Google
  const handleSignInGoogle = useCallback(async () => {
    try {
      setCloudSyncStatus('saving');
      setStatusText('Opening Google Sign-In...');
      const user = await signInWithGoogle();
      setCloudUser(user);
      setCloudSyncStatus('synced');
      setStatusText(`Signed in as ${user.displayName || user.email}! Google Cloud AutoSave active.`);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setCloudSyncStatus(cloudUser ? 'synced' : 'not_signed_in');
      setStatusText(err.message?.includes('closed') ? 'Sign-in cancelled' : 'Google sign-in was interrupted. Please try again.');
    }
  }, [cloudUser]);

  // Sign Out from Google
  const handleSignOutGoogle = useCallback(async () => {
    try {
      await signOutUser();
      setCloudUser(null);
      setCloudSyncStatus('not_signed_in');
      setCloudProjects([]);
      setCurrentCloudDocId(null);
      setLastCloudSavedTime(null);
      setStatusText('Signed out from Google account. Your local work is preserved.');
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  }, []);

  // Save current project explicitly to Google Cloud
  const handleSaveToCloud = useCallback(
    async (customTitle?: string) => {
      if (!cloudUser) {
        setFileManagerTab('cloud');
        setIsFileManagerOpen(true);
        setStatusText('Please sign in with Google to enable cloud saving.');
        return;
      }

      try {
        setCloudSyncStatus('saving');
        const finalTitle = (customTitle || documentTitle || 'FloorPlan_Document').trim();
        const docId = currentCloudDocId || `proj_${Date.now()}`;
        const record = await saveProjectToCloud(cloudUser.uid, {
          id: docId,
          title: finalTitle,
          objects,
          objectCount: objects.length,
        });

        setCurrentCloudDocId(record.id);
        setCloudSyncStatus('synced');
        const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastCloudSavedTime(timeFormatted);
        setStatusText(`Saved "${finalTitle}" to Google Cloud at ${timeFormatted}`);
      } catch (err: any) {
        console.error('Cloud save failed:', err);
        setCloudSyncStatus('error');
        setStatusText(`Cloud save error: ${err.message || 'Failed to sync with cloud'}`);
      }
    },
    [cloudUser, documentTitle, currentCloudDocId, objects]
  );

  // Open a project loaded from Google Cloud
  const handleOpenCloudProject = useCallback(
    (proj: CloudProjectRecord) => {
      if (!proj || !Array.isArray(proj.objects)) return;
      pushUndo();
      setObjects(proj.objects);
      setSelectedIds([]);
      setDocumentTitle(proj.title);
      setCurrentCloudDocId(proj.id);
      const timeFormatted = new Date(proj.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastCloudSavedTime(timeFormatted);
      setIsFileManagerOpen(false);
      setStatusText(`Loaded "${proj.title}" from Google Cloud (${proj.objects.length} elements) — AutoSave active`);
    },
    [pushUndo]
  );

  // Delete a project from Google Cloud
  const handleDeleteCloudProject = useCallback(
    async (projectId: string) => {
      if (!cloudUser) return;
      try {
        await deleteProjectFromCloud(cloudUser.uid, projectId);
        if (currentCloudDocId === projectId) {
          setCurrentCloudDocId(null);
          setLastCloudSavedTime(null);
        }
        setStatusText('Deleted project from Google Cloud');
      } catch (err: any) {
        console.error('Delete cloud project error:', err);
        setStatusText('Failed to delete cloud project');
      }
    },
    [cloudUser, currentCloudDocId]
  );

  // Automatic Cloud AutoSave:
  // Whenever the user is signed in with Google, any modifications to the drawing
  // are automatically saved to Firestore online after 3.5 seconds of idle editing.
  const lastCloudSavedContentRef = useRef<string>('');
  useEffect(() => {
    if (!cloudUser || objects.length === 0) return;

    // Serialize current state
    const currentJson = JSON.stringify({
      title: documentTitle,
      objects,
    });

    if (currentJson === lastCloudSavedContentRef.current) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        setCloudSyncStatus('saving');
        const docId = currentCloudDocId || `proj_${Date.now()}`;
        const record = await saveProjectToCloud(cloudUser.uid, {
          id: docId,
          title: documentTitle || 'FloorPlan_Document',
          objects,
          objectCount: objects.length,
        });
        setCurrentCloudDocId(record.id);
        lastCloudSavedContentRef.current = currentJson;
        setCloudSyncStatus('synced');
        const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastCloudSavedTime(timeFormatted);
      } catch (e: any) {
        console.warn('Cloud auto-save warning:', e);
        setCloudSyncStatus('error');
      }
    }, 3500);

    return () => clearTimeout(autoSaveTimer);
  }, [objects, documentTitle, cloudUser, currentCloudDocId]);

  // Fully automated PC Storage liveness check:
  // Automatically detects if the saved file was deleted from the PC disk.
  // When deleted, AutoSave is immediately disabled with zero user action required.
  const checkPCFileExistence = useCallback(async (): Promise<boolean> => {
    if (!hasSavedArchcadFile || isPcFileDeleted) return false;

    if (pcFileHandle) {
      const stillExists = await verifyPCFileExists(pcFileHandle);
      if (!stillExists) {
        setIsPcFileDeleted(true);
        setHasSavedArchcadFile(false);
        setPcFileHandle(null);
        setLastSavedTime(null);
        setStatusText(`Auto-detected: "${pcFileName || documentTitle + '.archcad'}" was deleted from your PC storage. AutoSave is stopped.`);
        return false;
      }
      return true;
    } else {
      // If not using direct disk handle, verify against local document storage
      const exists = recentFiles.some(
        (d) => (currentSavedDocId && d.id === currentSavedDocId) || d.title.toLowerCase() === documentTitle.toLowerCase()
      );
      if (!exists) {
        setIsPcFileDeleted(true);
        setHasSavedArchcadFile(false);
        setCurrentSavedDocId(null);
        setLastSavedTime(null);
        setStatusText(`Auto-detected: Saved file "${documentTitle}" was deleted from storage. AutoSave is stopped.`);
        return false;
      }
      return true;
    }
  }, [hasSavedArchcadFile, isPcFileDeleted, pcFileHandle, pcFileName, documentTitle, recentFiles, currentSavedDocId]);

  // Word-style Save / AutoSave Handler
  // Behaves just like Microsoft Word: if not saved as a supported ArchCAD project file yet,
  // or if the saved file was deleted from PC storage, clicking Save directs to Save As.
  // If signed in to Google, also triggers cloud save!
  const handleSave = useCallback(async () => {
    // 1. If signed in with Google, trigger cloud save
    if (cloudUser) {
      handleSaveToCloud();
    }

    // 2. If marked as deleted from PC storage or never saved to PC:
    if (isPcFileDeleted || !hasSavedArchcadFile) {
      if (cloudUser) {
        handleSaveToStorage();
        return;
      }
      setHasSavedArchcadFile(false);
      setFileManagerTab('save_as');
      setIsFileManagerOpen(true);
      setStatusText(
        isPcFileDeleted
          ? 'AutoSave is not possible: The file was deleted from your PC storage. Please use "Save As" first.'
          : 'Please save your project to PC storage (.archcad) first using "Save As" or sign in with Google.'
      );
      return;
    }

    // 3. Automatically verify file existence before writing
    const stillExists = await checkPCFileExistence();
    if (!stillExists) {
      setFileManagerTab('save_as');
      setIsFileManagerOpen(true);
      return;
    }

    if (pcFileHandle) {
      const payload = JSON.stringify(
        {
          app: 'ArchCAD Studio Pro',
          version: '2.0',
          title: documentTitle,
          savedAt: new Date().toISOString(),
          objectCount: objects.length,
          objects,
        },
        null,
        2
      );

      const writeResult = await autoSaveToPCFile(pcFileHandle, payload);
      if (writeResult.deleted) {
        setIsPcFileDeleted(true);
        setHasSavedArchcadFile(false);
        setPcFileHandle(null);
        setFileManagerTab('save_as');
        setIsFileManagerOpen(true);
        setStatusText('AutoSave is not possible: The file was deleted from your PC storage. Please use "Save As".');
        return;
      }
    }

    // Auto-save behavior for existing .archcad project
    handleSaveToStorage();
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStatusText(`Saved "${pcFileName || documentTitle + '.archcad'}" to PC storage at ${timeFormatted}`);
  }, [
    cloudUser,
    handleSaveToCloud,
    isPcFileDeleted,
    hasSavedArchcadFile,
    checkPCFileExistence,
    pcFileHandle,
    pcFileName,
    documentTitle,
    objects,
    handleSaveToStorage,
  ]);

  // Delete the currently active saved file and turn off AutoSave
  const handleDeleteSavedFile = useCallback(() => {
    setRecentFiles((prev) => {
      const next = prev.filter(
        (d) => !(currentSavedDocId && d.id === currentSavedDocId) && d.title.toLowerCase() !== documentTitle.toLowerCase()
      );
      try {
        localStorage.setItem('arch_cad_recent_files', JSON.stringify(next));
      } catch {}
      return next;
    });
    setIsPcFileDeleted(true);
    setHasSavedArchcadFile(false);
    setPcFileHandle(null);
    setPcFileName(null);
    setCurrentSavedDocId(null);
    setLastSavedTime(null);
    setStatusText(`Saved file for "${documentTitle}" was deleted. AutoSave is turned off — use "Save As" when ready to save.`);
  }, [documentTitle, currentSavedDocId]);

  // Export and Save As downloadable file in multiple formats (ARCHCAD, PNG, JPEG, SVG, PDF, CSV)
  const handleSaveAsFile = useCallback(
    (format: SaveAsFormat = 'ARCHCAD', customFilename?: string) => {
      const cleanName = (customFilename || documentTitle || 'FloorPlan_Document')
        .replace(/\.[^/.]+$/, '')
        .trim();
      setDocumentTitle(cleanName);

      // ARCHCAD Native JSON CAD project file
      if (format === 'ARCHCAD') {
        const docId = currentSavedDocId || `doc_${Date.now()}`;
        setCurrentSavedDocId(docId);
        const projectPayload = {
          app: 'ArchCAD Studio Pro',
          version: '2.0',
          title: cleanName,
          savedAt: new Date().toISOString(),
          objectCount: objects.length,
          objects,
        };
        const jsonStr = JSON.stringify(projectPayload, null, 2);

        // Save directly to PC storage via File System Access API or browser download
        saveAsToPCStorage(cleanName, jsonStr).then((res) => {
          if (res.cancelled) {
            setStatusText('Save cancelled');
            return;
          }

          if (res.success) {
            setPcFileHandle(res.handle || null);
            setPcFileName(res.fileName);
            setPcStorageMethod(res.method);
            setIsPcFileDeleted(false);
            setHasSavedArchcadFile(true);
            handleSaveToStorage(cleanName);
            setStatusText(
              res.method === 'direct_disk'
                ? `Saved to PC storage as "${res.fileName}" — Live AutoSave active`
                : `Saved "${res.fileName}" to PC storage — AutoSave enabled`
            );
          } else {
            setStatusText('Failed to save to PC storage: ' + (res.error || 'Unknown error'));
          }
        });
        return;
      }

      // Schedule & Bill of Materials CSV Spreadsheet
      if (format === 'CSV') {
        const rows: string[] = [
          'Item ID,Element Name,Category,Kind,X (px),Y (px),Width (px),Height (px),Angle (deg),Area (sq ft),Area (sq m),Tag / Notes,Locked',
        ];
        objects.forEach((obj) => {
          const isCircle = obj.kind === 'room_circle';
          const radius = obj.w / 2;
          const areaSqFt = isCircle
            ? Math.round((Math.PI * radius * radius) / 100)
            : Math.round((obj.w * obj.h) / 100);
          const areaSqM = (areaSqFt * 0.092903).toFixed(1);
          const tag = obj.doorTag || obj.windowTag || obj.roomName || '';
          rows.push(
            `"${obj.id}","${(obj.name || '').replace(/"/g, '""')}","${obj.category}","${obj.kind}",${obj.x},${obj.y},${obj.w},${obj.h},${obj.angle},${areaSqFt},${areaSqM},"${tag.replace(/"/g, '""')}",${obj.locked ? 'Yes' : 'No'}`
          );
        });
        const csvBlob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(csvBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cleanName}_schedule.csv`;
        link.click();
        URL.revokeObjectURL(url);
        setStatusText(`Exported schedule spreadsheet "${cleanName}_schedule.csv"`);
        return;
      }

      // Visual graphics export (SVG, PNG, JPEG, PDF)
      if (!svgRef.current) {
        setStatusText('Canvas is not ready for visual export');
        return;
      }

      // Accurately compute the bounding box of all objects including rotated corners and tags
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      if (objects.length === 0) {
        minX = 100;
        minY = 100;
        maxX = 700;
        maxY = 500;
      } else {
        objects.forEach((obj) => {
          const rad = ((obj.angle || 0) * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          if (obj.polygonPoints && obj.polygonPoints.length > 0) {
            obj.polygonPoints.forEach((p) => {
              const rx = obj.x + (p.x * cos - p.y * sin);
              const ry = obj.y + (p.x * sin + p.y * cos);
              minX = Math.min(minX, rx);
              maxX = Math.max(maxX, rx);
              minY = Math.min(minY, ry);
              maxY = Math.max(maxY, ry);
            });
          } else {
            const hw = (obj.w || 60) / 2;
            const hh = (obj.h || 60) / 2;
            const corners = [
              { x: -hw, y: -hh },
              { x: hw, y: -hh },
              { x: hw, y: hh },
              { x: -hw, y: hh },
            ];
            corners.forEach((c) => {
              const rx = obj.x + (c.x * cos - c.y * sin);
              const ry = obj.y + (c.x * sin + c.y * cos);
              minX = Math.min(minX, rx);
              maxX = Math.max(maxX, rx);
              minY = Math.min(minY, ry);
              maxY = Math.max(maxY, ry);
            });
          }

          // Generous margin for labels, tags, custom measurements, and door swing arcs
          const tagPad = obj.roomName || obj.doorTag || obj.windowTag || obj.customMeasurement ? 45 : 20;
          minX = Math.min(minX, obj.x - (obj.w / 2) - tagPad);
          maxX = Math.max(maxX, obj.x + (obj.w / 2) + tagPad);
          minY = Math.min(minY, obj.y - (obj.h / 2) - tagPad);
          maxY = Math.max(maxY, obj.y + (obj.h / 2) + tagPad);
        });
      }

      // Generous padding around the entire floor plan to guarantee no elements are cut off
      const padding = 70;
      const exportX = Math.floor(minX - padding);
      const exportY = Math.floor(minY - padding);
      const exportW = Math.max(400, Math.ceil(maxX - minX + padding * 2));
      const exportH = Math.max(300, Math.ceil(maxY - minY + padding * 2));

      // Clone SVG without selection overlays or UI handles
      const clone = svgRef.current.cloneNode(true) as SVGSVGElement;

      // CRITICAL FIX: The interactive canvas wraps elements in a <g transform="translate(offset.x, offset.y) scale(zoom)">.
      // During export, reset this transform to translate(0, 0) scale(1) so that objects are positioned in absolute world coordinates!
      const panZoomGroup = clone.querySelector('g[transform*="translate"]');
      if (panZoomGroup) {
        panZoomGroup.setAttribute('transform', 'translate(0, 0) scale(1)');
      }

      // Remove the infinite grid background rect and center crosshairs from export
      clone.querySelectorAll('rect[width="40000"], rect[fill*="grid-pattern"], line[stroke-dasharray="4 4"]').forEach((el) => el.remove());

      // Remove interactive selection handles, eraser indicators, and rotate handles
      clone.querySelectorAll('.pointer-events-auto, [id^="selection-"], [id^="handle-"], [id^="rotate-"], [id^="live-rotate-"], [id^="eraser-"]').forEach((el) => el.remove());

      clone.setAttribute('viewBox', `${exportX} ${exportY} ${exportW} ${exportH}`);
      clone.setAttribute('width', `${exportW}`);
      clone.setAttribute('height', `${exportH}`);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clone);

      if (format === 'SVG') {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cleanName}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        setStatusText(`Vector SVG "${cleanName}.svg" exported successfully`);
        return;
      }

      // Raster canvas rendering for PNG, JPEG, and PDF
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // 2x crisp high-DPI resolution
        canvas.width = Math.round(exportW * scale);
        canvas.height = Math.round(exportH * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(blobUrl);

        if (format === 'PDF') {
          const { jsPDF } = await import('jspdf');
          const isLandscape = exportW >= exportH;
          const pdf = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'pt',
            format: 'a4',
          });

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 36;
          const availW = pageWidth - margin * 2;
          const availH = pageHeight - margin * 2 - 50;
          const ratio = Math.min(availW / exportW, availH / exportH);
          const printW = exportW * ratio;
          const printH = exportH * ratio;
          const printX = (pageWidth - printW) / 2;
          const printY = margin + 32;

          // Header Title
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.setTextColor(30, 41, 59);
          pdf.text(cleanName, margin, margin);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8.5);
          pdf.setTextColor(100, 116, 139);
          pdf.text(
            `Architectural Floor Plan  |  Date: ${new Date().toLocaleDateString()}  |  Elements: ${objects.length}`,
            margin,
            margin + 14
          );

          // Floor plan image
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(imgData, 'JPEG', printX, printY, printW, printH);

          // Footer Title Block
          pdf.setDrawColor(203, 213, 225);
          pdf.line(margin, pageHeight - margin - 4, pageWidth - margin, pageHeight - margin - 4);
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          pdf.text('ArchSketch 360 CAD  •  Precision Architectural Plan', margin, pageHeight - margin + 8);
          pdf.text(`Scale: 1:50 Equivalent`, pageWidth - margin - 110, pageHeight - margin + 8);

          pdf.save(`${cleanName}.pdf`);
          setStatusText(`Architectural PDF document "${cleanName}.pdf" exported successfully`);
          return;
        }

        const mime = format === 'PNG' ? 'image/png' : 'image/jpeg';
        const ext = format === 'PNG' ? 'png' : 'jpg';
        const dataUrl = canvas.toDataURL(mime, 0.95);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${cleanName}.${ext}`;
        a.click();
        setStatusText(`${format} image "${cleanName}.${ext}" exported successfully`);
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        setStatusText('Failed to render export image');
      };

      img.src = blobUrl;
    },
    [documentTitle, objects, handleSaveToStorage]
  );

  // Open existing project from File (JSON / .archcad)
  const handleOpenFile = useCallback(
    (file: File) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          const loadedObjects: ArchObject[] = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed.objects)
            ? parsed.objects
            : [];

          pushUndo();
          setObjects(loadedObjects);
          setSelectedIds([]);
          const cleanName = parsed.title || file.name.replace(/\.[^/.]+$/, '');
          const docId = `doc_${Date.now()}`;
          setCurrentSavedDocId(docId);
          setDocumentTitle(cleanName);
          setIsPcFileDeleted(false);
          setPcFileName(file.name);
          setPcFileHandle(null);
          setHasSavedArchcadFile(true);
          const now = new Date();
          const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
          const fullTime = `${dateFormatted} at ${timeFormatted}`;
          setLastSavedTime(fullTime);

          const openedDoc: SavedDocument = {
            id: docId,
            title: cleanName,
            updatedAt: fullTime,
            objectCount: loadedObjects.length,
            objects: loadedObjects,
          };
          setRecentFiles((prev) => {
            const filtered = prev.filter((d) => d.title.toLowerCase() !== cleanName.toLowerCase());
            const updated = [openedDoc, ...filtered].slice(0, 20);
            try {
              localStorage.setItem('arch_cad_recent_files', JSON.stringify(updated));
            } catch {}
            return updated;
          });

          setIsFileManagerOpen(false);
          setStatusText(`Loaded "${file.name}" (${loadedObjects.length} objects) — AutoSave is active`);
        } catch (err) {
          console.error(err);
          setStatusText('Failed to open project file: invalid format');
        }
      };
      reader.readAsText(file);
    },
    [pushUndo]
  );

  // Open project from Recent files list
  const handleOpenRecentFile = useCallback(
    (doc: SavedDocument) => {
      if (!doc || !Array.isArray(doc.objects)) return;
      pushUndo();
      setObjects(doc.objects);
      setSelectedIds([]);
      setDocumentTitle(doc.title);
      setCurrentSavedDocId(doc.id);
      setIsPcFileDeleted(false);
      setPcFileName(`${doc.title}.archcad`);
      setPcFileHandle(null);
      setHasSavedArchcadFile(true);
      setLastSavedTime(doc.updatedAt);
      setIsFileManagerOpen(false);
      setStatusText(`Opened recent document "${doc.title}" — AutoSave is active`);
    },
    [pushUndo]
  );

  // Delete project from Recent files list
  const handleDeleteRecentFile = useCallback((id: string) => {
    setRecentFiles((prev) => {
      const deletedDoc = prev.find((d) => d.id === id);
      const next = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem('arch_cad_recent_files', JSON.stringify(next));
      } catch {}

      // If the deleted file was the currently active saved document:
      const wasActive = deletedDoc && (
        (currentSavedDocId && deletedDoc.id === currentSavedDocId) ||
        deletedDoc.title.toLowerCase() === documentTitle.toLowerCase()
      );

      if (wasActive) {
        setIsPcFileDeleted(true);
        setHasSavedArchcadFile(false);
        setPcFileHandle(null);
        setPcFileName(null);
        setCurrentSavedDocId(null);
        setLastSavedTime(null);
        setStatusText(`Deleted saved file "${deletedDoc.title}". AutoSave disabled — use "Save As" when ready to save.`);
      } else {
        setStatusText(`Document "${deletedDoc?.title || 'file'}" removed from saved list`);
      }

      return next;
    });
  }, [documentTitle, currentSavedDocId]);

  // Clear all recent files from storage
  const handleClearAllRecentFiles = useCallback(() => {
    setRecentFiles([]);
    try {
      localStorage.removeItem('arch_cad_recent_files');
    } catch {}
    setStatusText('All recent document records cleared');
  }, []);

  // Create New File with Automatic Templates
  const handleNewFile = useCallback(
    (templateId: string = 'blank') => {
      pushUndo();
      setIsPcFileDeleted(false);
      setPcFileHandle(null);
      setPcFileName(null);
      setHasSavedArchcadFile(false);
      setCurrentSavedDocId(null);
      setLastSavedTime(null);
      if (templateId === 'blank' || !templateId) {
        setObjects([]);
        setSelectedIds([]);
        setDocumentTitle('Untitled_Plan');
        setStatusText('Created new blank floor plan document');
      } else if (AUTOMATIC_TEMPLATES[templateId]) {
        const tmpl = AUTOMATIC_TEMPLATES[templateId];
        const clonedObjects: ArchObject[] = JSON.parse(JSON.stringify(tmpl.objects));
        setObjects(clonedObjects);
        setSelectedIds(clonedObjects.length > 0 ? [clonedObjects[0].id] : []);
        setDocumentTitle(tmpl.name.replace(/[^a-zA-Z0-9_-]/g, '_'));
        setStatusText(`Loaded "${tmpl.name}" automatic architectural template`);
      }
      setIsFileManagerOpen(false);
    },
    [pushUndo]
  );

  // Import Graphic / PNG / Blueprint Underlay Image
  const handleImportGraphic = useCallback(
    (file: File, asUnderlay = false) => {
      if (!file) return;
      const reader = new FileReader();

      reader.onerror = () => {
        setStatusText(`Error reading file "${file.name}"`);
      };

      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return;

        const createGraphicObj = (naturalW: number, naturalH: number) => {
          pushUndo();
          // Scale to reasonable default dimension
          let w = naturalW || 360;
          let h = naturalH || 280;
          const maxDim = asUnderlay ? 640 : 400;
          if (w > maxDim || h > maxDim) {
            if (w >= h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const centerX = Math.round((-canvasOffset.x + 450) / zoom / 20) * 20 || 380;
          const centerY = Math.round((-canvasOffset.y + 300) / zoom / 20) * 20 || 280;

          const newGraphic: ArchObject = {
            id: `graphic_${Date.now()}`,
            kind: 'imported_graphic',
            name: file.name.replace(/\.[^/.]+$/, ''),
            category: 'Graphic',
            x: centerX,
            y: centerY,
            w: Math.max(80, w),
            h: Math.max(80, h),
            angle: 0,
            locked: false,
            imageUrl: result,
            imageOpacity: asUnderlay ? 0.45 : 0.95,
            imageAspect: naturalW && naturalH ? naturalW / naturalH : 1,
          };

          setObjects((prev) => {
            if (asUnderlay) {
              // place underlay at very bottom layer
              return [newGraphic, ...prev];
            }
            return [...prev, newGraphic];
          });
          setSelectedIds([newGraphic.id]);
          setIsInspectorOpen(true);
          setIsFileManagerOpen(false);
          setStatusText(
            asUnderlay
              ? `Imported blueprint underlay "${file.name}" at bottom layer`
              : `Imported photo / graphic "${file.name}" onto canvas`
          );
        };

        const img = new Image();
        img.onload = () => createGraphicObj(img.naturalWidth, img.naturalHeight);
        img.onerror = () => createGraphicObj(360, 280);
        img.src = result;
      };

      reader.readAsDataURL(file);
    },
    [canvasOffset, zoom, pushUndo]
  );

  // Place Item from Library
  const handlePlaceLibraryItem = useCallback(
    (item: LibraryItemDef) => {
      // Place near current canvas viewport center
      const centerX = Math.round((-canvasOffset.x + 450) / zoom / 20) * 20;
      const centerY = Math.round((-canvasOffset.y + 300) / zoom / 20) * 20;

      const newObj: ArchObject = {
        id: `${item.kind}_${Date.now()}`,
        kind: item.kind,
        name: item.name,
        category: item.category,
        x: centerX || 350,
        y: centerY || 250,
        w: item.defaultWidth,
        h: item.defaultHeight,
        angle: 0,
        locked: false,
      };
      handleCreateObject(newObj);
    },
    [canvasOffset, zoom, handleCreateObject]
  );

  // Drag Start from Library
  const handleDragStartItem = useCallback((item: LibraryItemDef, e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  }, []);

  // Drop on Canvas
  const handleDropOnCanvas = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      // If the drop occurred on the canvas element, DrawingCanvas already handled it
      if (e.target && svgRef.current && (svgRef.current === e.target || svgRef.current.contains(e.target as Node))) {
        return;
      }

      // Check if dropped item was files (images/photos)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/') || /\.(png|jpe?g|svg|webp|gif|bmp)$/i.test(file.name)) {
          handleImportGraphic(file);
          return;
        }
      }

      try {
        const raw = e.dataTransfer.getData('application/json');
        if (!raw) return;
        const item = JSON.parse(raw) as LibraryItemDef;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const dropX = (e.clientX - rect.left - canvasOffset.x) / zoom;
        const dropY = (e.clientY - rect.top - canvasOffset.y) / zoom;
        const finalX = snapToGrid ? Math.round(dropX / 20) * 20 : dropX;
        const finalY = snapToGrid ? Math.round(dropY / 20) * 20 : dropY;

        const newObj: ArchObject = {
          id: `${item.kind}_${Date.now()}`,
          kind: item.kind,
          name: item.name,
          category: item.category,
          x: finalX,
          y: finalY,
          w: item.defaultWidth,
          h: item.defaultHeight,
          angle: 0,
          locked: false,
        };
        handleCreateObject(newObj);
      } catch (err) {
        console.error('Failed to parse dropped library item', err);
      }
    },
    [canvasOffset, zoom, snapToGrid, handleCreateObject, handleImportGraphic]
  );

  // Touch Drag-and-Drop Handlers for Mobile & Tablet Devices
  const handleTouchDragStart = useCallback(
    (item: LibraryItemDef, touch: { clientX: number; clientY: number }) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dropX = (touch.clientX - rect.left - canvasOffset.x) / zoom;
      const dropY = (touch.clientY - rect.top - canvasOffset.y) / zoom;
      const finalX = snapToGrid ? Math.round(dropX / 20) * 20 : dropX;
      const finalY = snapToGrid ? Math.round(dropY / 20) * 20 : dropY;

      setTouchDragTarget({
        item,
        x: finalX,
        y: finalY,
        screenX: touch.clientX,
        screenY: touch.clientY,
      });
      setStatusText(`Dragging "${item.name}" onto canvas. Release finger to place.`);
    },
    [canvasOffset, zoom, snapToGrid]
  );

  const handleTouchDragMove = useCallback(
    (touch: { clientX: number; clientY: number }) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dropX = (touch.clientX - rect.left - canvasOffset.x) / zoom;
      const dropY = (touch.clientY - rect.top - canvasOffset.y) / zoom;
      const finalX = snapToGrid ? Math.round(dropX / 20) * 20 : dropX;
      const finalY = snapToGrid ? Math.round(dropY / 20) * 20 : dropY;

      setTouchDragTarget((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          x: finalX,
          y: finalY,
          screenX: touch.clientX,
          screenY: touch.clientY,
        };
      });
    },
    [canvasOffset, zoom, snapToGrid]
  );

  const handleTouchDragEnd = useCallback(
    (touch: { clientX: number; clientY: number }) => {
      setTouchDragTarget((current) => {
        if (!current) return null;

        const rect = svgRef.current?.getBoundingClientRect();
        let finalX = current.x;
        let finalY = current.y;

        if (rect && touch.clientX > -500 && touch.clientY > -500) {
          const dropX = (touch.clientX - rect.left - canvasOffset.x) / zoom;
          const dropY = (touch.clientY - rect.top - canvasOffset.y) / zoom;
          finalX = snapToGrid ? Math.round(dropX / 20) * 20 : dropX;
          finalY = snapToGrid ? Math.round(dropY / 20) * 20 : dropY;
        }

        const newObj: ArchObject = {
          id: `${current.item.kind}_${Date.now()}`,
          kind: current.item.kind,
          name: current.item.name,
          category: current.item.category,
          x: finalX,
          y: finalY,
          w: current.item.defaultWidth,
          h: current.item.defaultHeight,
          angle: 0,
          locked: false,
        };

        handleCreateObject(newObj);
        setStatusText(`Placed "${newObj.name}" on canvas`);
        return null;
      });
    },
    [canvasOffset, zoom, snapToGrid, handleCreateObject]
  );

  // Search Design Submission
  const handleSearchSubmit = useCallback(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const found = LIBRARY_ITEMS.find(
      (item) => item.name.toLowerCase().includes(q) || item.kind.toLowerCase().includes(q)
    );

    if (found) {
      setCurrentCategory(found.category);
      setStatusText(`Found: ${found.name} in ${found.category}. Click to insert or drag onto canvas.`);
    } else {
      setStatusText(`No design found for "${searchQuery}". Try: sofa, door, table, window...`);
    }
  }, [searchQuery]);

  // Export in any requested format (delegates to multi-format handleSaveAsFile)
  const handleExport = useCallback(
    (format: 'PNG' | 'JPEG' | 'SVG' | 'PDF' | 'ARCHCAD' | 'CSV', customFilename?: string) => {
      handleSaveAsFile(format, customFilename);
    },
    [handleSaveAsFile]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in text inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicate();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setFileManagerTab('open');
        setIsFileManagerOpen(true);
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewFile('blank');
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPrintOpen(true);
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedIds(objects.map((o) => o.id));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      } else if (e.key.toLowerCase() === 'r') {
        // Quick 90° rotation shortcut!
        e.preventDefault();
        handleRotateRelative(e.shiftKey ? -90 : 90);
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleToggleLock();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isFocusCanvas) {
          setIsFocusCanvas(false);
          setStatusText('Exited Full Focus mode');
        } else {
          setIsInspectorOpen(false);
          setSelectedIds([]);
          setTool('select');
        }
      } else if (e.key.toLowerCase() === 'f' && !isCtrlOrMeta) {
        // Full Focus Canvas toggle shortcut
        e.preventDefault();
        setIsFocusCanvas((prev) => !prev);
        setStatusText((prev) => (!isFocusCanvas ? 'Entered Full Focus mode (Press Esc to exit)' : 'Exited Full Focus mode'));
      } else if (e.key.toLowerCase() === 'v' && !isCtrlOrMeta) {
        setTool('select');
      } else if (e.key.toLowerCase() === 'w' && !isCtrlOrMeta) {
        setTool('wall');
      } else if (e.key.toLowerCase() === 'e' && !isCtrlOrMeta) {
        setTool('erase');
      } else if (e.key.toLowerCase() === 'h' && !isCtrlOrMeta) {
        setTool('pan');
      } else if (e.key.toLowerCase() === 'b' && !isCtrlOrMeta) {
        // Toggle Design Library dock minimize / expand
        e.preventDefault();
        setIsLibraryMinimized((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    handleDuplicate,
    handleDeleteSelected,
    handleRotateRelative,
    handleToggleLock,
    handleSave,
    handleNewFile,
    objects,
    isFocusCanvas,
  ]);

  // Ensure AutoSave status stays strictly synchronized with saved file existence in storage.
  // If the user deleted the saved file, AutoSave is immediately deactivated ("nothing to save").
  useEffect(() => {
    if (hasSavedArchcadFile && !isPcFileDeleted) {
      if (!pcFileHandle) {
        const exists = recentFiles.some(
          (d) => (currentSavedDocId && d.id === currentSavedDocId) || d.title.toLowerCase() === documentTitle.toLowerCase()
        );
        if (!exists) {
          setIsPcFileDeleted(true);
          setHasSavedArchcadFile(false);
          setCurrentSavedDocId(null);
          setLastSavedTime(null);
        }
      }
    }
  }, [recentFiles, hasSavedArchcadFile, isPcFileDeleted, pcFileHandle, documentTitle, currentSavedDocId]);

  // Fully Automated PC Storage liveness check:
  // 1. Checks every 2.5 seconds in the background
  // 2. Checks immediately whenever the user switches back into the window (e.g. from File Explorer / desktop)
  useEffect(() => {
    if (!hasSavedArchcadFile || isPcFileDeleted) return;

    // Check immediately on window focus or visibility restore
    const handleWindowFocus = () => {
      checkPCFileExistence();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPCFileExistence();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Fast 2.5 second periodic heartbeat
    const checkTimer = setInterval(() => {
      checkPCFileExistence();
    }, 2500);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkTimer);
    };
  }, [hasSavedArchcadFile, isPcFileDeleted, checkPCFileExistence]);

  // Periodic background Auto-Save: ONLY runs if the project was saved AND the file still exists in storage!
  useEffect(() => {
    if (!hasSavedArchcadFile || isPcFileDeleted) return;

    const timer = setInterval(async () => {
      if (isPcFileDeleted) return;

      // 1. Automatically check if file still exists before saving
      const stillExists = await checkPCFileExistence();
      if (!stillExists) {
        return;
      }

      if (pcFileHandle) {
        const payload = JSON.stringify(
          {
            app: 'ArchCAD Studio Pro',
            version: '2.0',
            title: documentTitle,
            savedAt: new Date().toISOString(),
            objectCount: objects.length,
            objects,
          },
          null,
          2
        );

        const writeResult = await autoSaveToPCFile(pcFileHandle, payload);
        if (writeResult.deleted) {
          setIsPcFileDeleted(true);
          setHasSavedArchcadFile(false);
          setPcFileHandle(null);
          setStatusText('AutoSave is not possible: File was deleted from your PC storage.');
          return;
        }
      }

      handleSaveToStorage();

      // Periodic Google Cloud AutoSave if signed in with Google
      if (cloudUser && objects.length > 0) {
        saveProjectToCloud(cloudUser.uid, {
          id: currentCloudDocId || `proj_${Date.now()}`,
          title: documentTitle || 'FloorPlan_Document',
          objects,
          objectCount: objects.length,
        })
          .then((rec) => {
            setCurrentCloudDocId(rec.id);
            setCloudSyncStatus('synced');
            setLastCloudSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          })
          .catch((err) => {
            console.warn('Periodic cloud save warning:', err);
          });
      }
    }, 45000);

    return () => clearInterval(timer);
  }, [
    hasSavedArchcadFile,
    isPcFileDeleted,
    checkPCFileExistence,
    pcFileHandle,
    documentTitle,
    objects,
    handleSaveToStorage,
    cloudUser,
    currentCloudDocId,
  ]);

  const selectedObjects = objects.filter((o) => selectedIds.includes(o.id));
  const isAnySelectedLocked = selectedObjects.some((o) => o.locked);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans select-none ${isFocusCanvas ? 'p-0 gap-0' : 'p-2 sm:p-3 md:p-3.5 gap-2.5 sm:gap-3'}`}>
      {/* Top Header & Toolbar Bento Card (Hidden during Full Canvas Focus mode) */}
      {!isFocusCanvas && (
        <TopBar
          tool={tool}
          setTool={setTool}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onDelete={handleDeleteSelected}
          onToggleLock={handleToggleLock}
          isAnySelectedLocked={isAnySelectedLocked}
          hasSelection={selectedIds.length > 0}
          onClear={handleClear}
          onExport={handleExport}
          onOpenPrint={() => setIsPrintOpen(true)}
          onOpenFileMenu={() => {
            checkPCFileExistence();
            setFileManagerTab('info');
            setIsFileManagerOpen(true);
          }}
          onQuickNewFile={() => handleNewFile('blank')}
          onQuickSave={handleSave}
          hasSavedArchcadFile={hasSavedArchcadFile}
          isPcFileDeleted={isPcFileDeleted}
          pcFileName={pcFileName}
          onImportGraphic={handleImportGraphic}
          documentTitle={documentTitle}
          onToggleFocusCanvas={() => {
            setIsFocusCanvas(true);
            setStatusText('Full Focus Canvas mode enabled: All toolbars hidden (Press Esc or Exit Focus to restore)');
          }}
          isFocusCanvas={isFocusCanvas}
          statusText={statusText}
          zoom={zoom}
          setZoom={setZoom}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          snapToGrid={snapToGrid}
          setSnapToGrid={setSnapToGrid}
          measurementUnit={measurementUnit}
          setMeasurementUnit={setMeasurementUnit}
          showLeaderLines={showLeaderLines}
          setShowLeaderLines={setShowLeaderLines}
          cloudUser={cloudUser}
          cloudSyncStatus={cloudSyncStatus}
          lastCloudSavedTime={lastCloudSavedTime}
          onSignInGoogle={handleSignInGoogle}
          onSignOutGoogle={handleSignOutGoogle}
          onManualCloudSave={() => handleSaveToCloud()}
          onOpenCloudManager={() => {
            setFileManagerTab('cloud');
            setIsFileManagerOpen(true);
          }}
        />
      )}

      {/* Main Workspace Area with Dynamic Left/Right Docking */}
      <div className="flex-1 w-full min-h-0 relative flex flex-row gap-2.5 sm:gap-3 overflow-hidden">
        {/* Left Bar Design Library Dock (Hidden during Full Focus) */}
        {!isFocusCanvas && libraryPosition === 'left' && (
          <DesignLibrary
            currentCategory={currentCategory}
            onSelectCategory={setCurrentCategory}
            onPlaceItem={handlePlaceLibraryItem}
            onDragStartItem={handleDragStartItem}
            isMinimized={isLibraryMinimized}
            onToggleMinimize={() => setIsLibraryMinimized((v) => !v)}
            position="left"
            onChangePosition={handleSetLibraryPosition}
            onImportGraphic={handleImportGraphic}
            onTouchDragStart={handleTouchDragStart}
            onTouchDragMove={handleTouchDragMove}
            onTouchDragEnd={handleTouchDragEnd}
          />
        )}

        {/* Main Drawing Area Viewport Bento Card */}
        <main
          ref={mainRef}
          className={`relative flex-1 w-full h-full min-h-0 min-w-0 overflow-hidden bg-zinc-900/50 shadow-2xl flex flex-col ${
            isFocusCanvas ? 'rounded-none border-0' : 'rounded-2xl md:rounded-3xl border border-zinc-800'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnCanvas}
        >
          {/* Floating Exit Focus Button when in Canvas Only Mode */}
          {isFocusCanvas && (
            <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
              <button
                id="btn-exit-canvas-focus"
                onClick={() => {
                  setIsFocusCanvas(false);
                  setStatusText('Exited Full Focus mode: All toolbars restored');
                }}
                title="Exit Full Focus (Esc) - Restore top toolbar and design library"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/95 hover:bg-zinc-800 active:bg-zinc-950 text-zinc-200 hover:text-white border border-zinc-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold transition active:scale-95 cursor-pointer ring-1 ring-white/10"
              >
                <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Exit Focus</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[10px] font-mono text-zinc-300">Esc</kbd>
              </button>
            </div>
          )}
          <DrawingCanvas
            tool={tool}
            setTool={setTool}
            measurementUnit={measurementUnit}
            objects={objects}
            selectedIds={selectedIds}
            onSelectObjects={handleSelectObjects}
            onContextMenuObject={handleContextMenuObject}
            onUpdateObject={handleUpdateObject}
            onBatchUpdateObjects={handleBatchUpdateObjects}
            onDeleteObject={handleDeleteObject}
            onCreateObject={handleCreateObject}
            onSaveHistorySnapshot={pushUndo}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            zoom={zoom}
            setZoom={setZoom}
            svgRef={svgRef}
            canvasOffset={canvasOffset}
            setCanvasOffset={setCanvasOffset}
            showLeaderLines={showLeaderLines}
            onImportGraphic={handleImportGraphic}
            touchDragTarget={touchDragTarget}
          />

          {/* Floating 360° Rotation & Object Inspector Controls - Rendered on right-click, displaying only features available for that icon */}
          {isInspectorOpen && selectedObjects.length > 0 && (
            <ObjectInspector
              selectedObjects={selectedObjects}
              zoom={zoom}
              canvasOffset={canvasOffset}
              containerRef={mainRef}
              onClose={() => setIsInspectorOpen(false)}
              onUpdateObject={handleUpdateSelected}
              onRotateRelative={handleRotateRelative}
              onFlipHorizontal={handleFlipHorizontal}
              onFlipVertical={handleFlipVertical}
              onToggleLock={handleToggleLock}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteSelected}
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
            />
          )}

          {/* Quick Hint Overlay on Bottom Right */}
          <div className="absolute bottom-3 right-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-[11px] text-zinc-300 px-3 py-1.5 rounded-xl pointer-events-none shadow-xl hidden sm:flex items-center gap-3">
            {isFocusCanvas ? (
              <span>
                <kbd className="px-1.5 py-0.5 bg-indigo-900/60 rounded border border-indigo-700 text-indigo-200 font-mono text-[10px]">Esc / F</kbd> Exit Full Focus (Canvas Only)
              </span>
            ) : (
              <>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-indigo-900/60 rounded border border-indigo-700 text-indigo-200 font-mono text-[10px]">Right-Click</kbd> Specialized Features
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono text-[10px]">F</kbd> Full Focus
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono text-[10px]">B</kbd> {isLibraryMinimized ? 'Expand' : 'Minimize'} Library
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono text-[10px]">R</kbd> Rotate 90°
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono text-[10px]">Ctrl+Z</kbd> Undo
                </span>
              </>
            )}
          </div>
        </main>

        {/* Right Bar Design Library Dock (Hidden during Full Focus) */}
        {!isFocusCanvas && libraryPosition === 'right' && (
          <DesignLibrary
            currentCategory={currentCategory}
            onSelectCategory={setCurrentCategory}
            onPlaceItem={handlePlaceLibraryItem}
            onDragStartItem={handleDragStartItem}
            isMinimized={isLibraryMinimized}
            onToggleMinimize={() => setIsLibraryMinimized((v) => !v)}
            position="right"
            onChangePosition={handleSetLibraryPosition}
            onImportGraphic={handleImportGraphic}
            onTouchDragStart={handleTouchDragStart}
            onTouchDragMove={handleTouchDragMove}
            onTouchDragEnd={handleTouchDragEnd}
          />
        )}
      </div>

      {/* Bottom Architectural Design Library Dock Bento Card (Hidden during Full Focus) */}
      {!isFocusCanvas && libraryPosition === 'bottom' && (
        <DesignLibrary
          currentCategory={currentCategory}
          onSelectCategory={setCurrentCategory}
          onPlaceItem={handlePlaceLibraryItem}
          onDragStartItem={handleDragStartItem}
          isMinimized={isLibraryMinimized}
          onToggleMinimize={() => setIsLibraryMinimized((v) => !v)}
          position="bottom"
          onChangePosition={handleSetLibraryPosition}
          onImportGraphic={handleImportGraphic}
          onTouchDragStart={handleTouchDragStart}
          onTouchDragMove={handleTouchDragMove}
          onTouchDragEnd={handleTouchDragEnd}
        />
      )}

      {/* Mobile Live Tactile Drag Badge floating under user finger */}
      {touchDragTarget && (
        <div
          style={{
            position: 'fixed',
            left: `${touchDragTarget.screenX}px`,
            top: `${touchDragTarget.screenY - 55}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="flex items-center gap-2 bg-indigo-950/95 text-white border border-indigo-500 shadow-2xl px-3 py-1.5 rounded-full select-none"
        >
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center p-0.5 shadow-inner">
            <svg
              viewBox={`-${touchDragTarget.item.defaultWidth / 2 + 5} -${touchDragTarget.item.defaultHeight / 2 + 5} ${
                touchDragTarget.item.defaultWidth + 10
              } ${touchDragTarget.item.defaultHeight + 10}`}
              className="w-full h-full"
            >
              <ArchSymbolGraphic
                kind={touchDragTarget.item.kind}
                w={touchDragTarget.item.defaultWidth}
                h={touchDragTarget.item.defaultHeight}
                preview
                name={touchDragTarget.item.name}
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-indigo-100 leading-tight">
              {touchDragTarget.item.name}
            </span>
            <span className="text-[9px] text-indigo-300 font-mono">
              Release to place
            </span>
          </div>
        </div>
      )}

      {/* Microsoft Word Style Print Backstage Studio */}
      {isPrintOpen && (
        <Suspense fallback={null}>
          <PrintStudio
            objects={objects}
            selectedIds={selectedIds}
            onClose={() => setIsPrintOpen(false)}
          />
        </Suspense>
      )}

      {/* Microsoft Word Style File Manager Backstage Modal */}
      {isFileManagerOpen && (
        <Suspense fallback={null}>
          <WordFileManager
            isOpen={isFileManagerOpen}
            onClose={() => setIsFileManagerOpen(false)}
            documentTitle={documentTitle}
            setDocumentTitle={setDocumentTitle}
            objects={objects}
            onNewFile={handleNewFile}
            onSaveToStorage={handleSave}
            onSaveAsFile={handleSaveAsFile}
            onOpenFile={handleOpenFile}
            onOpenRecentFile={handleOpenRecentFile}
            recentFiles={recentFiles}
            onDeleteRecentFile={handleDeleteRecentFile}
            onClearAllRecentFiles={handleClearAllRecentFiles}
            onDeleteSavedFile={handleDeleteSavedFile}
            onImportGraphic={handleImportGraphic}
            onOpenPrint={() => {
              setIsFileManagerOpen(false);
              setIsPrintOpen(true);
            }}
            onExport={(fmt) => {
              setIsFileManagerOpen(false);
              handleExport(fmt);
            }}
            lastSavedTime={lastSavedTime}
            initialTab={fileManagerTab}
            hasSavedArchcadFile={hasSavedArchcadFile}
            isPcFileDeleted={isPcFileDeleted}
            pcFileName={pcFileName}
            pcStorageMethod={pcStorageMethod}
            cloudUser={cloudUser}
            cloudSyncStatus={cloudSyncStatus}
            lastCloudSavedTime={lastCloudSavedTime}
            cloudProjects={cloudProjects}
            onSignInGoogle={handleSignInGoogle}
            onSignOutGoogle={handleSignOutGoogle}
            onSaveToCloud={handleSaveToCloud}
            onOpenCloudProject={handleOpenCloudProject}
            onDeleteCloudProject={handleDeleteCloudProject}
          />
        </Suspense>
      )}
    </div>
  );
}
