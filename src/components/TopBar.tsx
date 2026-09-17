import React, { useRef, useState, useEffect } from 'react';
import {
  MousePointer,
  MousePointer2,
  Square,
  Minus,
  Eraser,
  Hand,
  Undo2,
  Redo2,
  Trash2,
  Lock,
  Unlock,
  Download,
  Search,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Printer,
  Tag,
  Circle,
  FileText,
  Plus,
  Image as ImageIcon,
  Cloud,
  CloudOff,
  Check,
  Loader2,
  LogOut,
  User as UserIcon,
  RefreshCw,
  FolderOpen,
  Mail,
  Copy,
  X,
} from 'lucide-react';
import { ToolType, MeasurementUnit, CloudUser, CloudSyncStatus } from '../types';

interface TopBarProps {
  tool: ToolType;
  setTool: (t: ToolType) => void;
  measurementUnit?: MeasurementUnit;
  setMeasurementUnit?: (u: MeasurementUnit) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  isAnySelectedLocked: boolean;
  hasSelection: boolean;
  onClear: () => void;
  onExport?: (format: 'PNG' | 'JPEG' | 'SVG') => void;
  onOpenPrint: () => void;
  onToggleFocusCanvas?: () => void;
  isFocusCanvas?: boolean;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onSearchSubmit?: () => void;
  statusText: string;
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean | ((prev: boolean) => boolean)) => void;
  snapToGrid: boolean;
  setSnapToGrid: (val: boolean | ((prev: boolean) => boolean)) => void;
  showLeaderLines?: boolean;
  setShowLeaderLines?: (val: boolean | ((prev: boolean) => boolean)) => void;
  // MS Word Style File & Graphic Management
  onOpenFileMenu: () => void;
  onQuickNewFile: () => void;
  onQuickSave: () => void;
  onImportGraphic: (file: File) => void;
  documentTitle: string;
  hasSavedArchcadFile?: boolean;
  isPcFileDeleted?: boolean;
  pcFileName?: string | null;
  // Cloud & Google Sign-In
  cloudUser?: CloudUser | null;
  cloudSyncStatus?: CloudSyncStatus;
  lastCloudSavedTime?: string | null;
  onSignInGoogle?: () => void;
  onSignOutGoogle?: () => void;
  onManualCloudSave?: () => void;
  onOpenCloudProjects?: () => void;
}

const TopBarComponent: React.FC<TopBarProps> = ({
  tool,
  setTool,
  measurementUnit = 'ft_in',
  setMeasurementUnit,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onDelete,
  onToggleLock,
  isAnySelectedLocked,
  hasSelection,
  onClear,
  onExport,
  onOpenPrint,
  onToggleFocusCanvas,
  isFocusCanvas = false,
  statusText,
  zoom,
  setZoom,
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid,
  showLeaderLines = false,
  setShowLeaderLines,
  onOpenFileMenu,
  onQuickNewFile,
  onQuickSave,
  onImportGraphic,
  documentTitle,
  hasSavedArchcadFile = false,
  isPcFileDeleted = false,
  pcFileName = null,
  cloudUser = null,
  cloudSyncStatus = 'not_signed_in',
  lastCloudSavedTime = null,
  onSignInGoogle,
  onSignOutGoogle,
  onManualCloudSave,
  onOpenCloudProjects,
}) => {
  const quickGraphicRef = useRef<HTMLInputElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleCopyContactEmail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText('thedhibar@gmail.com').then(() => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }).catch(() => {
      // fallback
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    });
  };

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleGraphicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportGraphic(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-zinc-900 text-zinc-100 flex flex-col border border-zinc-800 rounded-2xl shadow-xl select-none shrink-0 p-2 sm:p-2.5 gap-2">
      {/* Primary Top Bar */}
      <div className="h-12 px-2 flex items-center justify-between gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {/* Brand & MS Word Style File Menu Button */}
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30 shrink-0">
            <RotateCw className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              ArchSketch <span className="text-indigo-400 font-mono text-[11px] px-1.5 py-0.5 bg-indigo-950/80 rounded-md border border-indigo-800/60">360°</span>
            </h1>
          </div>

          {/* MS Word "File" Button */}
          <div className="flex items-center ml-1">
            <button
              id="btn-word-file-menu"
              onClick={onOpenFileMenu}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="File Menu - New, Open, Save, Templates, Import Graphics"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>File ▾</span>
            </button>
          </div>
        </div>

        {/* Primary Drafting Tools */}
        <div className="flex items-center gap-1.5 shrink-0 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800/90 shadow-inner">
          <button
            id="tool-select"
            onClick={() => setTool('select')}
            title="Select & Move & Rotate (V)"
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs transition cursor-pointer ${
              tool === 'select'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80 font-medium'
            }`}
          >
            <MousePointer2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Select</span>
          </button>

          <button
            id="tool-wall"
            onClick={() => setTool('wall')}
            title="Draw Wall (W)"
            className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs transition cursor-pointer ${
              tool === 'wall'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80 font-medium'
            }`}
          >
            <Minus className="w-3.5 h-3.5 rotate-45 stroke-[2.4]" />
            <span>Wall</span>
          </button>

          <button
            id="tool-room"
            onClick={() => setTool(tool === 'room' || tool === 'room_circle' ? 'select' : 'room')}
            title="Draw Room (R) - Rectangle, Circular Rotunda, or Line-to-Line"
            className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs transition cursor-pointer ${
              tool === 'room' || tool === 'room_circle'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80 font-medium'
            }`}
          >
            <Square className="w-3.5 h-3.5 stroke-[1.9]" />
            <span>Room</span>
          </button>

          <button
            id="tool-erase"
            onClick={() => setTool('erase')}
            title="Erase (E)"
            className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs transition cursor-pointer ${
              tool === 'erase'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80 font-medium'
            }`}
          >
            <Eraser className="w-3.5 h-3.5 stroke-[1.9]" />
            <span>Erase</span>
          </button>

          <button
            id="tool-pan"
            onClick={() => setTool('pan')}
            title="Pan Hand Canvas (H)"
            className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs transition cursor-pointer ${
              tool === 'pan'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80 font-medium'
            }`}
          >
            <Hand className="w-3.5 h-3.5 stroke-[1.9]" />
            <span>Pan</span>
          </button>
        </div>

        {/* Quick Edit Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="btn-undo"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-xl bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-750 disabled:opacity-30 border border-zinc-700/60 transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-redo"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
            className="p-2 rounded-xl bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-750 disabled:opacity-30 border border-zinc-700/60 transition"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-lock"
            disabled={!hasSelection}
            onClick={onToggleLock}
            title="Lock/Unlock (L)"
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-medium border transition ${
              isAnySelectedLocked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-750 border-zinc-700/60 disabled:opacity-30'
            }`}
          >
            {isAnySelectedLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAnySelectedLocked ? 'Locked' : 'Lock'}</span>
          </button>
          <button
            id="btn-top-delete"
            disabled={!hasSelection}
            onClick={onDelete}
            title="Delete (Del / Backspace)"
            className="p-2 rounded-xl bg-zinc-800/80 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 border border-zinc-700/60 disabled:opacity-30 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View & Zoom Controls */}
        <div className="flex items-center gap-1 shrink-0 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80 text-xs">
          <button
            id="btn-toggle-grid"
            onClick={() => setShowGrid((v) => !v)}
            title="Toggle Grid"
            className={`p-1.5 rounded-lg ${showGrid ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-400 hover:text-white'}`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-toggle-snap"
            onClick={() => setSnapToGrid((v) => !v)}
            title="Snap to Grid (20px)"
            className={`px-2 py-1 rounded-lg text-[11px] font-mono ${
              snapToGrid ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Snap
          </button>
          <button
            id="btn-toggle-leader-lines"
            onClick={() => setShowLeaderLines?.((v) => !v)}
            title="Toggle Icon Pointer Lines & Identification Labels"
            className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition ${
              showLeaderLines ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span className="hidden sm:inline">Labels</span>
          </button>
          <div className="h-3 w-px bg-zinc-800 mx-1" />
          <button
            id="btn-zoom-out"
            onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
            title="Zoom Out (-)"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-reset-zoom"
            onClick={() => setZoom(1)}
            title="Reset Zoom to 100%"
            className="px-1.5 font-mono text-[11px] text-zinc-300 hover:text-white"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            id="btn-zoom-in"
            onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
            title="Zoom In (+)"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Import Graphic, Print, Clear & Export Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            ref={quickGraphicRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif,.png,.jpg,.jpeg,.svg,.webp"
            onChange={handleGraphicFileChange}
            className="hidden"
          />

          <button
            id="btn-quick-import-graphic"
            onClick={() => quickGraphicRef.current?.click()}
            title="Import Graphic"
            className="px-2.5 py-1.5 rounded-xl bg-pink-950/80 hover:bg-pink-900 border border-pink-700/60 text-pink-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Import</span>
          </button>

          <button
            id="btn-open-print-dialog"
            onClick={onOpenPrint}
            title="Print & Page Setup - Word Style Backstage (Ctrl+P)"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 border border-emerald-500/60 flex items-center gap-1.5 transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            id="btn-clear-canvas"
            onClick={onClear}
            className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700/60 transition"
          >
            Clear
          </button>

          {/* Contact Details Button */}
          <button
            id="btn-contact-details"
            onClick={() => setIsContactModalOpen(true)}
            title="Contact Details: thedhibar@gmail.com"
            className="px-2.5 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/70 hover:border-indigo-500/60 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Contact</span>
          </button>

          {/* Cloud AutoSave & Google Account Section (shown only when signed in) */}
          {cloudUser && (
            <div className="relative shrink-0 ml-1 pl-2 border-l border-zinc-800" ref={userMenuRef}>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-cloud-sync-user"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/70 hover:border-indigo-500/60 text-xs font-medium transition active:scale-95 shadow-sm cursor-pointer"
                  title={`Google Account: ${cloudUser.email} — Click for Cloud Options`}
                >
                  {/* User Avatar */}
                  {cloudUser.photoURL ? (
                    <img
                      src={cloudUser.photoURL}
                      alt={cloudUser.displayName || 'Google User'}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {cloudUser.email?.[0] || 'G'}
                    </div>
                  )}

                  {/* Cloud Sync Status Indicator */}
                  <div className="flex items-center gap-1">
                    {cloudSyncStatus === 'saving' ? (
                      <span className="flex items-center gap-1 text-sky-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden md:inline text-[11px] font-semibold">Saving...</span>
                      </span>
                    ) : cloudSyncStatus === 'synced' ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Cloud className="w-3.5 h-3.5" />
                        <span className="hidden md:inline text-[11px] font-semibold">Online</span>
                      </span>
                    ) : cloudSyncStatus === 'error' ? (
                      <span className="flex items-center gap-1 text-rose-400">
                        <CloudOff className="w-3.5 h-3.5" />
                        <span className="hidden md:inline text-[11px] font-semibold">Sync Err</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="hidden md:inline text-[11px] font-semibold">Cloud</span>
                      </span>
                    )}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    id="cloud-user-menu-dropdown"
                    className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 flex flex-col gap-3 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* Header: User details */}
                    <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                      {cloudUser.photoURL ? (
                        <img
                          src={cloudUser.photoURL}
                          alt={cloudUser.displayName || 'Google User'}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white uppercase shrink-0">
                          {cloudUser.email?.[0] || 'G'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {cloudUser.displayName || 'Google User'}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate font-mono">
                          {cloudUser.email}
                        </div>
                      </div>
                    </div>

                    {/* AutoSave Status Info Card */}
                    <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Online Cloud AutoSave
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        Your floor plans are automatically backed up to Google cloud storage as you draw.
                      </p>
                      {lastCloudSavedTime && (
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1 pt-1 border-t border-zinc-900">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Last saved to cloud: {lastCloudSavedTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        id="btn-cloud-save-now"
                        onClick={() => {
                          onManualCloudSave?.();
                          setIsUserMenuOpen(false);
                        }}
                        disabled={cloudSyncStatus === 'saving'}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
                      >
                        {cloudSyncStatus === 'saving' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Cloud className="w-3.5 h-3.5" />
                        )}
                        <span>Save to Cloud Now</span>
                      </button>

                      <button
                        id="btn-cloud-browse-projects"
                        onClick={() => {
                          onOpenCloudProjects?.();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white text-xs font-medium flex items-center justify-center gap-2 border border-zinc-700/60 transition active:scale-95 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Browse Cloud Projects</span>
                      </button>

                      <button
                        id="btn-google-signout"
                        onClick={() => {
                          onSignOutGoogle?.();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-zinc-950/60 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 text-xs font-medium flex items-center justify-center gap-2 border border-zinc-800 hover:border-rose-900/50 transition active:scale-95 cursor-pointer mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Focus Mode & Status Banner (Search removed in exchange for Full Focus button) */}
      <div className="pt-2 border-t border-zinc-800/80 px-2 flex items-center justify-between text-xs text-zinc-400 gap-3 flex-wrap sm:flex-nowrap">
        {/* Full Focus Button & Inline Contact Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-full-focus-canvas"
            type="button"
            onClick={onToggleFocusCanvas}
            title="Full Focus Canvas: Hide all bars and menus to focus exclusively on drawing canvas (Esc to exit)"
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-850 hover:bg-zinc-800 active:bg-zinc-900 text-zinc-200 hover:text-white border border-zinc-700/80 hover:border-indigo-500/80 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full Focus</span>
            <span className="text-[10px] text-zinc-400 font-normal hidden md:inline">(Canvas Only)</span>
          </button>

          {/* Direct Contact Details Pill */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800/90 rounded-xl px-2.5 py-1 text-[11px] shadow-xs">
            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-zinc-400 font-medium hidden sm:inline">Contact:</span>
            <a
              id="link-topbar-contact-email"
              href="mailto:thedhibar@gmail.com"
              title="Send email to thedhibar@gmail.com"
              className="text-indigo-300 hover:text-indigo-200 hover:underline font-mono font-medium"
            >
              thedhibar@gmail.com
            </a>
            <button
              id="btn-copy-contact-email-inline"
              onClick={handleCopyContactEmail}
              title="Copy thedhibar@gmail.com to clipboard"
              className="p-1 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition ml-0.5"
            >
              {copiedEmail ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Live Helpful Status Text with Cloud Sync tag */}
        <div className="truncate text-zinc-300 font-normal flex items-center gap-2 ml-auto">
          {cloudUser && (
            <span className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800/80 rounded-lg border border-zinc-700/50 text-[10px] text-zinc-300">
              <Cloud className="w-3 h-3 text-sky-400" />
              <span>Cloud: {cloudUser.email?.split('@')[0]}</span>
            </span>
          )}
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-500/50" />
          <span className="truncate">{statusText}</span>
        </div>
      </div>

      {/* Contact Details Modal Dialog */}
      {isContactModalOpen && (
        <div
          id="modal-contact-details"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md text-zinc-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/25 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Contact Details</h3>
                  <p className="text-[11px] text-zinc-400">ArchSketch 360 Support & Inquiry</p>
                </div>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  Official Contact Email
                </span>
                <div className="flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-750 px-3 py-2.5 rounded-xl">
                  <span className="font-mono text-xs text-indigo-300 font-semibold truncate select-all">
                    thedhibar@gmail.com
                  </span>
                  <button
                    onClick={handleCopyContactEmail}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition shrink-0 border border-zinc-700/60"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-1">
                <div className="text-[11px] font-semibold text-indigo-300">Direct Inquiries & Assistance</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  For feedback, custom architectural drafting requirements, CAD project assistance, or feature requests, contact directly at <strong className="text-zinc-200 font-mono">thedhibar@gmail.com</strong>.
                </p>
              </div>

              <div className="pt-1 flex gap-2">
                <a
                  href="mailto:thedhibar@gmail.com?subject=ArchSketch%20360%20Inquiry"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/25 active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium transition border border-zinc-700/60 active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const TopBar = React.memo(TopBarComponent);
