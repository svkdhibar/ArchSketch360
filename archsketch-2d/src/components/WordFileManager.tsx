import React, { useState, useRef } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Plus,
  Trash2,
  Clock,
  Check,
  X,
  Printer,
  Image as ImageIcon,
  ArrowLeft,
  Layout,
  Layers,
  Sparkles,
  UploadCloud,
  FileCode,
  Building2,
  Home,
  Briefcase,
  Coffee,
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  CloudOff,
  Loader2,
  LogOut,
  Mail,
  User as UserIcon,
  Copy,
} from 'lucide-react';
import { ArchObject, SavedDocument, SaveAsFormat, CloudUser, CloudSyncStatus } from '../types';
import { CloudProjectRecord } from '../firebase';
import { AUTOMATIC_TEMPLATES } from '../data/automaticTemplates';

export type WordFileTab = 'info' | 'new' | 'open' | 'save_as' | 'import_graphic' | 'export' | 'cloud' | 'contact';

interface WordFileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
  objects: ArchObject[];
  onNewFile: (templateId?: string) => void;
  onSaveToStorage: () => void;
  onSaveAsFile: (format?: SaveAsFormat, filename?: string) => void;
  onOpenFile: (file: File) => void;
  onOpenRecentFile: (doc: SavedDocument) => void;
  recentFiles: SavedDocument[];
  onDeleteRecentFile: (id: string) => void;
  onClearAllRecentFiles?: () => void;
  onDeleteSavedFile?: () => void;
  onImportGraphic: (file: File, asUnderlay?: boolean) => void;
  onOpenPrint: () => void;
  onExport: (format: 'PNG' | 'JPEG' | 'SVG' | 'PDF' | 'ARCHCAD' | 'CSV', filename?: string) => void;
  lastSavedTime: string | null;
  initialTab?: WordFileTab;
  hasSavedArchcadFile?: boolean;
  isPcFileDeleted?: boolean;
  pcFileName?: string | null;
  pcStorageMethod?: 'direct_disk' | 'download' | 'none';
  // Cloud Props
  cloudUser?: CloudUser | null;
  cloudSyncStatus?: CloudSyncStatus;
  lastCloudSavedTime?: string | null;
  cloudProjects?: CloudProjectRecord[];
  onSignInGoogle?: () => void;
  onSignOutGoogle?: () => void;
  onSaveToCloud?: (title?: string) => void;
  onOpenCloudProject?: (proj: CloudProjectRecord) => void;
  onDeleteCloudProject?: (id: string) => void;
}

const ARCHCAD_SAVE_INFO = {
  id: 'ARCHCAD' as const,
  extension: '.archcad',
  label: 'ArchCAD Studio Project',
  tag: 'Native Parametric CAD',
  description: 'Complete project file preserving all rooms, circular rotundas, custom symbols, walls, dimensions, leader lines, and 360° rotations.',
  accent: 'border-indigo-500/80 bg-indigo-950/30 text-indigo-400',
  badgeBg: 'bg-indigo-950/90 border-indigo-700/80',
  badgeText: 'text-indigo-300',
};

const IMAGE_EXPORT_OPTIONS: {
  id: 'PNG' | 'JPEG' | 'SVG';
  extension: string;
  label: string;
  tag: string;
  description: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    id: 'PNG',
    extension: '.png',
    label: 'High-Resolution PNG',
    tag: '2x High-DPI Lossless',
    description: 'Clean raster bitmap with high-DPI scaling, solid background, and sharp wall lines.',
    accent: 'border-emerald-500/80 bg-emerald-950/20 text-emerald-400',
    badgeBg: 'bg-emerald-950/80 border-emerald-700/60',
    badgeText: 'text-emerald-300',
  },
  {
    id: 'JPEG',
    extension: '.jpg',
    label: 'JPEG Photo Floor Plan',
    tag: 'Web & Email Ready',
    description: 'Compact file size image optimal for quick emailing, client slide presentations, and documents.',
    accent: 'border-amber-500/80 bg-amber-950/20 text-amber-400',
    badgeBg: 'bg-amber-950/80 border-amber-700/60',
    badgeText: 'text-amber-300',
  },
  {
    id: 'SVG',
    extension: '.svg',
    label: 'Scalable Vector CAD',
    tag: 'Infinite Resolution',
    description: 'Pure SVG vector elements. Compatible with Illustrator, AutoCAD, Inkscape, and web tools.',
    accent: 'border-cyan-500/80 bg-cyan-950/20 text-cyan-400',
    badgeBg: 'bg-cyan-950/80 border-cyan-700/60',
    badgeText: 'text-cyan-300',
  },
];

export const WordFileManager: React.FC<WordFileManagerProps> = ({
  isOpen,
  onClose,
  documentTitle,
  setDocumentTitle,
  objects,
  onNewFile,
  onSaveToStorage,
  onSaveAsFile,
  onOpenFile,
  onOpenRecentFile,
  recentFiles,
  onDeleteRecentFile,
  onClearAllRecentFiles,
  onDeleteSavedFile,
  onImportGraphic,
  onOpenPrint,
  onExport,
  lastSavedTime,
  initialTab = 'info',
  hasSavedArchcadFile = false,
  isPcFileDeleted = false,
  pcFileName = null,
  pcStorageMethod = 'none',
  cloudUser = null,
  cloudSyncStatus = 'not_signed_in',
  lastCloudSavedTime = null,
  cloudProjects = [],
  onSignInGoogle,
  onSignOutGoogle,
  onSaveToCloud,
  onOpenCloudProject,
  onDeleteCloudProject,
}) => {
  const [activeTab, setActiveTab] = useState<WordFileTab>(
    (initialTab as string) === 'save' ? 'save_as' : initialTab
  );
  const [saveAsName, setSaveAsName] = useState<string>(documentTitle);
  const [cloudSaveTitle, setCloudSaveTitle] = useState<string>(documentTitle);
  const [templateCategory, setTemplateCategory] = useState<'All' | 'Residential' | 'Commercial' | 'Specialty'>('All');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [importAsUnderlay, setImportAsUnderlay] = useState<boolean>(true);
  const [dragOverImport, setDragOverImport] = useState<boolean>(false);
  const [copiedContactEmail, setCopiedContactEmail] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const graphicInputRef = useRef<HTMLInputElement>(null);

  const handleCopyContactEmail = () => {
    navigator.clipboard.writeText('thedhibar@gmail.com').then(() => {
      setCopiedContactEmail(true);
      setTimeout(() => setCopiedContactEmail(false), 2500);
    }).catch(() => {
      setCopiedContactEmail(true);
      setTimeout(() => setCopiedContactEmail(false), 2500);
    });
  };

  // Keep save titles in sync with documentTitle
  React.useEffect(() => {
    setSaveAsName(documentTitle);
    setCloudSaveTitle(documentTitle);
  }, [documentTitle]);

  // Sync tab when initialTab changes
  React.useEffect(() => {
    setActiveTab((initialTab as string) === 'save' ? 'save_as' : initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  // Verify if saved file exists in storage and is not deleted from PC
  const isFileSavedInStorage = hasSavedArchcadFile && !isPcFileDeleted && recentFiles.some(
    (d) => d.title.toLowerCase() === documentTitle.toLowerCase()
  );

  // Calculate quick document statistics
  const roomCount = objects.filter((o) => o.kind.startsWith('room')).length;
  const doorCount = objects.filter((o) => o.kind.startsWith('door_')).length;
  const windowCount = objects.filter((o) => o.kind.startsWith('win_') || o.kind.startsWith('window_')).length;
  const graphicCount = objects.filter((o) => o.kind === 'imported_graphic' || !!o.imageUrl).length;

  const handleSaveAsSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = saveAsName.trim() || documentTitle;
    setDocumentTitle(finalName);
    onSaveAsFile('ARCHCAD', finalName);
    setSaveSuccessMsg(`Saved "${finalName}.archcad" successfully! Auto-save is now active.`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleOpenDiskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFile(file);
      onClose();
    }
  };

  const handleGraphicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportGraphic(file, importAsUnderlay);
      onClose();
    }
  };

  const handleGraphicDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverImport(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImportGraphic(file, importAsUnderlay);
      onClose();
    }
  };

  return (
    <div
      id="word-file-backstage-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] max-h-[760px] flex flex-col overflow-hidden text-zinc-100">
        {/* Top MS Word Backstage Title Bar */}
        <div className="bg-indigo-950/80 border-b border-indigo-900/60 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              id="btn-close-word-file-back"
              onClick={onClose}
              title="Return to Architectural Canvas"
              className="p-1.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold px-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Canvas</span>
            </button>

            <div className="h-4 w-px bg-indigo-800/80" />

            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase shadow-xs">
                FILE
              </span>
              <input
                id="input-document-title-top"
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Document Title"
                title="Click to rename document"
                className="bg-indigo-900/40 hover:bg-indigo-900/80 focus:bg-zinc-950 border border-indigo-700/50 focus:border-indigo-400 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none transition w-56 md:w-72"
              />
              <span className="text-xs text-indigo-300/70 font-mono hidden sm:inline">.arch</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastSavedTime && (
              <span className="text-[11px] text-indigo-300 font-mono flex items-center gap-1 hidden md:flex">
                <Clock className="w-3 h-3 text-indigo-400" />
                {lastSavedTime}
              </span>
            )}
            <button
              id="btn-close-word-file-x"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Word Sidebar Navigation + Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation Sidebar (Office Backstage Ribbon) */}
          <div className="w-52 bg-zinc-950/80 border-r border-zinc-800 p-3 flex flex-col justify-between shrink-0">
            <div className="space-y-1">
              <button
                id="tab-file-info"
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'info'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-300" />
                <span>Info & Summary</span>
              </button>

              <button
                id="tab-file-new"
                onClick={() => setActiveTab('new')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'new'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>New File</span>
              </button>

              <button
                id="tab-file-open"
                onClick={() => setActiveTab('open')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'open'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <span>Open File</span>
              </button>

              <div className="pt-2 pb-1">
                <div className="h-px bg-zinc-800/80 mx-2" />
              </div>

              <button
                id="tab-file-save-as"
                onClick={() => setActiveTab('save_as')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'save_as'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>Save As...</span>
              </button>

              <button
                id="tab-file-cloud"
                onClick={() => setActiveTab('cloud')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'cloud'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Cloud className="w-4 h-4 text-sky-400" />
                <span>Cloud Storage</span>
                {cloudUser ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ml-auto animate-pulse" />
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono ml-auto">Free</span>
                )}
              </button>

              <div className="pt-2 pb-1">
                <div className="h-px bg-zinc-800/80 mx-2" />
              </div>

              <button
                id="tab-file-import-graphic"
                onClick={() => setActiveTab('import_graphic')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'import_graphic'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span>Import Graphic</span>
              </button>

              <button
                id="tab-file-export"
                onClick={() => setActiveTab('export')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'export'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>Export Image</span>
              </button>

              <button
                id="tab-file-contact"
                onClick={() => setActiveTab('contact')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'contact'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Contact Details</span>
              </button>
            </div>

            {/* Quick Print Studio Action */}
            <div className="pt-3 border-t border-zinc-800/80">
              <button
                id="btn-sidebar-print"
                onClick={() => {
                  onClose();
                  onOpenPrint();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold transition shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Backstage</span>
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 bg-zinc-900 p-6 overflow-y-auto">
            {/* Feedback Alert if any */}
            {saveSuccessMsg && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* TAB: INFO */}
            {activeTab === 'info' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Document Properties & Summary
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage project properties, inspection metrics, and plan metadata.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Objects</span>
                    <p className="text-xl font-bold text-indigo-400 font-mono mt-1">{objects.length}</p>
                  </div>
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Rooms</span>
                    <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{roomCount}</p>
                  </div>
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Doors & Windows</span>
                    <p className="text-xl font-bold text-amber-400 font-mono mt-1">{doorCount + windowCount}</p>
                  </div>
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Graphics</span>
                    <p className="text-xl font-bold text-pink-400 font-mono mt-1">{graphicCount}</p>
                  </div>
                </div>

                <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-200">File Details</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">File Name:</span>
                      <span className="text-zinc-200 font-semibold">{documentTitle}.arch</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400">File Format:</span>
                      <span className="text-zinc-200 font-mono">ArchSketch 360 Project (.arch / JSON)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Status:</span>
                      <span className="text-emerald-400 font-medium">Ready for Editing & CAD Export</span>
                    </div>
                  </div>
                </div>

                {/* Cloud AutoSave Summary Card */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-sky-400" />
                      Google Cloud AutoSave
                    </h3>
                    {cloudUser ? (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online Sync Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                        Not Connected
                      </span>
                    )}
                  </div>

                  {cloudUser ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Connected Account:</span>
                        <span className="text-zinc-200 font-mono font-medium">{cloudUser.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Last Cloud Sync:</span>
                        <span className="text-zinc-300 font-mono">{lastCloudSavedTime || 'Pending initial edit'}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 pt-1 leading-relaxed">
                        Every addition, move, or change in your floor plan is automatically backed up online to your Google account.
                      </p>
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => {
                            onSaveToCloud?.(documentTitle);
                            setSaveSuccessMsg(`Synced "${documentTitle}" to Google Cloud!`);
                            setTimeout(() => setSaveSuccessMsg(null), 3000);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Cloud className="w-3.5 h-3.5" />
                          <span>Sync to Cloud Now</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('cloud')}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-xs font-medium transition"
                        >
                          Manage Cloud Projects
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Sign in with your Gmail/Google account to enable seamless background cloud saving. Your projects will be saved continuously online so you never lose work.
                      </p>
                      <button
                        onClick={onSignInGoogle}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Sign in with Google / Gmail</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact & Support Card in Info Tab */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      Contact & Support Details
                    </h3>
                    <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-mono">
                      Architect Contact
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-750 px-3.5 py-2.5 rounded-xl text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-mono text-indigo-300 font-semibold select-all text-xs truncate">
                        thedhibar@gmail.com
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={handleCopyContactEmail}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition border border-zinc-700/60"
                      >
                        {copiedContactEmail ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <a
                        href="mailto:thedhibar@gmail.com?subject=ArchSketch%20360%20Contact"
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Direct developer & architectural drafting contact for inquiries, custom features, layout assistance, and bug reports.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: NEW FILE (MS Word style blank + automatic templates) */}
            {activeTab === 'new' && (
              <div className="space-y-5 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-400" />
                      Create a New Floor Plan
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Start with a blank drawing or choose an architectural starter template.
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-800 p-1 rounded-xl">
                    {(['All', 'Residential', 'Commercial', 'Specialty'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTemplateCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          templateCategory === cat
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* Blank Floor Plan */}
                  {(templateCategory === 'All' || templateCategory === 'Specialty') && (
                    <div
                      onClick={() => {
                        onNewFile('blank');
                        onClose();
                      }}
                      className="group bg-zinc-950/90 border border-zinc-800 hover:border-indigo-500 rounded-2xl p-4 cursor-pointer transition shadow-sm hover:shadow-indigo-500/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:bg-indigo-950/60 group-hover:border-indigo-500/50 flex items-center justify-center text-indigo-400 transition">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            Pristine CAD
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                          Blank Floor Plan
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          Start completely from scratch with a pristine, empty grid canvas and precision snapping.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-indigo-400 font-semibold">
                        <span>Create Blank Canvas</span>
                        <span>→</span>
                      </div>
                    </div>
                  )}

                  {/* Automatic Templates from AUTOMATIC_TEMPLATES */}
                  {Object.values(AUTOMATIC_TEMPLATES)
                    .filter(
                      (tmpl) => templateCategory === 'All' || tmpl.category === templateCategory
                    )
                    .map((tmpl) => {
                      const isRotunda = tmpl.id === 'rotunda_villa';
                      const isSuburban = tmpl.id === 'suburban_home';
                      const isLoft = tmpl.id === 'modern_loft';
                      const isMedical = tmpl.id === 'medical_clinic';
                      const isCafe = tmpl.id === 'bistro_cafe';

                      const icon = isRotunda ? (
                        <Sparkles className="w-5 h-5" />
                      ) : isSuburban ? (
                        <Home className="w-5 h-5" />
                      ) : isLoft ? (
                        <Building2 className="w-5 h-5" />
                      ) : isMedical ? (
                        <Activity className="w-5 h-5" />
                      ) : isCafe ? (
                        <Coffee className="w-5 h-5" />
                      ) : (
                        <Briefcase className="w-5 h-5" />
                      );

                      const accentColor = isRotunda
                        ? 'border-emerald-500 group-hover:text-emerald-300 text-emerald-400'
                        : isSuburban
                        ? 'border-blue-500 group-hover:text-blue-300 text-blue-400'
                        : isMedical
                        ? 'border-rose-500 group-hover:text-rose-300 text-rose-400'
                        : isCafe
                        ? 'border-amber-500 group-hover:text-amber-300 text-amber-400'
                        : isLoft
                        ? 'border-cyan-500 group-hover:text-cyan-300 text-cyan-400'
                        : 'border-purple-500 group-hover:text-purple-300 text-purple-400';

                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => {
                            onNewFile(tmpl.id);
                            onClose();
                          }}
                          className={`group bg-zinc-950/90 border border-zinc-800 hover:${accentColor.split(' ')[0]} rounded-2xl p-4 cursor-pointer transition shadow-sm flex flex-col justify-between`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className={`w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition ${accentColor.split(' ').slice(2).join(' ')}`}
                              >
                                {icon}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                                  {tmpl.roomCount}
                                </span>
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                                  {tmpl.areaEstimate.split(' ')[0]} m²
                                </span>
                              </div>
                            </div>
                            <h3 className="text-sm font-bold text-white group-hover:text-white transition line-clamp-1">
                              {tmpl.name}
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                              {tmpl.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-300 group-hover:text-white">
                            <span className="text-[11px] text-zinc-400">{tmpl.category}</span>
                            <span className="flex items-center gap-1">
                              <span>Load Template</span>
                              <span>→</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB: OPEN FILE (Computer + Recent Files) */}
            {activeTab === 'open' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-amber-400" />
                    Open Floor Plan Document
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Open an architectural file (.arch or .json) from your computer or pick from recent floor plans.
                  </p>
                </div>

                {/* Open from Computer */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Open from This Computer</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Browse for any saved .arch or .json architectural project.
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".arch,.json,application/json"
                    onChange={handleOpenDiskFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-sm"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Browse Files...</span>
                  </button>
                </div>

                {/* Google Cloud Documents Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5" />
                      Google Cloud Saved Projects ({cloudProjects.length})
                    </h3>
                    {cloudUser && (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {cloudUser.email}
                      </span>
                    )}
                  </div>

                  {cloudUser ? (
                    cloudProjects.length === 0 ? (
                      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-5 text-center text-zinc-400 text-xs">
                        No cloud projects saved under your Google account yet. Use &quot;Save to Cloud&quot; to store your design online.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cloudProjects.map((proj) => (
                          <div
                            key={proj.id}
                            className="bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-sky-500/60 rounded-xl p-3 flex items-center justify-between transition group"
                          >
                            <div
                              onClick={() => {
                                onOpenCloudProject?.(proj);
                                onClose();
                              }}
                              className="flex items-center gap-3 cursor-pointer flex-1"
                            >
                              <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-700/50 flex items-center justify-center text-sky-400">
                                <Cloud className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                                  {proj.title}
                                </h4>
                                <p className="text-[11px] text-zinc-500 flex items-center gap-3 mt-0.5">
                                  <span>{new Date(proj.updatedAt).toLocaleString()}</span>
                                  <span>•</span>
                                  <span>{proj.objectCount} objects</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  onOpenCloudProject?.(proj);
                                  onClose();
                                }}
                                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition"
                              >
                                Open
                              </button>
                              <button
                                onClick={() => onDeleteCloudProject?.(proj.id)}
                                title="Delete Cloud Project"
                                className="p-1 text-zinc-500 hover:text-red-400 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-zinc-200">Sign in with Google to view online cloud projects</p>
                        <p className="text-zinc-500 text-[11px]">Keep your work accessible across multiple devices.</p>
                      </div>
                      <button
                        onClick={onSignInGoogle}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-2 shrink-0 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Documents List (MS Word style) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Recent Architectural Documents ({recentFiles.length})
                    </h3>
                    {recentFiles.length > 0 && onClearAllRecentFiles && (
                      <button
                        onClick={onClearAllRecentFiles}
                        className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1.5 transition px-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 active:scale-95 cursor-pointer"
                        title="Delete all recent document records from list"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {recentFiles.length === 0 ? (
                    <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-xs">
                      No recently saved documents yet. Save your current floor plan to access it here anytime!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentFiles.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 flex items-center justify-between transition group"
                        >
                          <div
                            onClick={() => {
                              onOpenRecentFile(doc);
                              onClose();
                            }}
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                                {doc.title}
                              </h4>
                              <p className="text-[11px] text-zinc-500 flex items-center gap-3 mt-0.5">
                                <span>{doc.updatedAt}</span>
                                <span>•</span>
                                <span>{doc.objectCount} objects</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onOpenRecentFile(doc);
                                onClose();
                              }}
                              className="px-3 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => onDeleteRecentFile(doc.id)}
                              title="Remove from Recent List"
                              className="p-1 text-zinc-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SAVE AS (ONLY ARCHCAD PROJECT FILE) */}
            {activeTab === 'save_as' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-indigo-400" />
                    Save As... (Save to PC Storage)
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Save your floor plan as a native ArchCAD project file (.archcad) onto your computer.
                  </p>
                </div>

                {/* File Name Form */}
                <form onSubmit={handleSaveAsSubmit} className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-5">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Save File Name</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={saveAsName}
                        onChange={(e) => setSaveAsName(e.target.value)}
                        placeholder="Enter file name"
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-l-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                      <span className="bg-indigo-950/80 border border-l-0 border-indigo-700/80 px-3.5 py-2.5 rounded-r-xl text-sm text-indigo-300 font-mono font-semibold">
                        .archcad
                      </span>
                    </div>
                  </div>

                  {/* Single ArchCAD Format Card */}
                  <div className={`rounded-xl p-4 border ${ARCHCAD_SAVE_INFO.accent} ring-1 ring-indigo-500/50 flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-indigo-400" />
                          {ARCHCAD_SAVE_INFO.label}
                        </span>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${ARCHCAD_SAVE_INFO.badgeBg} ${ARCHCAD_SAVE_INFO.badgeText}`}>
                          {ARCHCAD_SAVE_INFO.extension}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {ARCHCAD_SAVE_INFO.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-indigo-900/60 flex items-center justify-between text-xs text-indigo-300">
                      <span>✓ Saves to your PC Storage</span>
                      <span>✓ AutoSave updates this file</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-400 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80 leading-relaxed">
                    💡 <strong>PC Storage AutoSave:</strong> While this file remains on your computer storage, AutoSave keeps your latest work saved. If you delete this file from your computer storage, AutoSave is automatically disabled so no broken saves occur.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      Save to PC Storage as ArchCAD Project (.archcad)
                    </span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB: IMPORT GRAPHIC / IMAGE (PNG, JPG, SVG, etc.) */}
            {activeTab === 'import_graphic' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-pink-400" />
                    Import Graphic or Blueprint Underlay
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Import PNG, JPG, JPEG, SVG, WebP, or CAD blueprint scans to trace, inspect, or display on the canvas.
                  </p>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverImport(true);
                  }}
                  onDragLeave={() => setDragOverImport(false)}
                  onDrop={handleGraphicDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                    dragOverImport
                      ? 'border-pink-500 bg-pink-950/20'
                      : 'border-zinc-700 hover:border-pink-400/80 bg-zinc-950/80'
                  }`}
                  onClick={() => graphicInputRef.current?.click()}
                >
                  <input
                    ref={graphicInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif,image/bmp,.png,.jpg,.jpeg,.svg,.webp,.bmp,.gif"
                    onChange={handleGraphicInputChange}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-pink-950/50 border border-pink-700/50 flex items-center justify-center text-pink-400 mb-3 shadow-inner">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    Click to browse or Drag & Drop Image Here
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Supports PNG, JPG, JPEG, SVG, WebP, GIF, BMP, and Blueprint scans
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-pink-300 font-medium">
                    <span className="px-2 py-0.5 bg-pink-950/80 border border-pink-700/60 rounded-md">
                      Full 360° Rotation
                    </span>
                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400">
                      Print & PDF Compatible
                    </span>
                  </div>
                </div>

                {/* Import Options */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-200">Import Mode</h4>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={importAsUnderlay}
                      onChange={(e) => setImportAsUnderlay(e.target.checked)}
                      className="mt-0.5 rounded accent-indigo-600"
                    />
                    <span>
                      Place as <strong>Background Blueprint Underlay</strong> (translucent 45% opacity placed at the bottom layer for tracing walls and rooms directly over it)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: EXPORT IMAGE (ONLY PNG, JPG, SVG) */}
            {activeTab === 'export' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-cyan-400" />
                    Export Floor Plan Image
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Export high-resolution presentation images in PNG, JPG, or vector SVG formats.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {IMAGE_EXPORT_OPTIONS.map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        onExport(fmt.id, saveAsName);
                        onClose();
                      }}
                      className="bg-zinc-950/90 hover:bg-zinc-850 border border-zinc-800 hover:border-cyan-500/70 rounded-xl p-4 text-left transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                            {fmt.label}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${fmt.badgeBg} ${fmt.badgeText}`}>
                            {fmt.extension}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 mt-1 block leading-snug">
                          {fmt.description}
                        </span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
                        <span>Export {fmt.id}</span>
                        <span>↓</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CLOUD STORAGE & GOOGLE AUTOSAVE */}
            {activeTab === 'cloud' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-sky-400" />
                    Google Cloud Storage &amp; AutoSave
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Sign in with your Gmail/Google account to continuously sync and save your architectural floor plans online.
                  </p>
                </div>

                {cloudUser ? (
                  <>
                    {/* User Profile Card */}
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {cloudUser.photoURL ? (
                          <img
                            src={cloudUser.photoURL}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold text-white uppercase">
                            {cloudUser.email?.[0] || 'G'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{cloudUser.displayName || 'Google Account'}</h3>
                            <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              AutoSave Active
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">{cloudUser.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onSaveToCloud?.(documentTitle);
                            setSaveSuccessMsg(`Saved "${documentTitle}" to Google Cloud!`);
                            setTimeout(() => setSaveSuccessMsg(null), 3000);
                          }}
                          disabled={cloudSyncStatus === 'saving'}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
                        >
                          {cloudSyncStatus === 'saving' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Cloud className="w-3.5 h-3.5" />
                          )}
                          <span>Sync Now</span>
                        </button>
                        <button
                          onClick={onSignOutGoogle}
                          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5 border border-zinc-700"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Save Current Floor Plan Form */}
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                        <Save className="w-3.5 h-3.5 text-indigo-400" />
                        Save Current Floor Plan to Cloud
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={cloudSaveTitle}
                          onChange={(e) => setCloudSaveTitle(e.target.value)}
                          placeholder="Cloud Project Title"
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const title = cloudSaveTitle.trim() || documentTitle;
                            setDocumentTitle(title);
                            onSaveToCloud?.(title);
                            setSaveSuccessMsg(`Successfully saved "${title}" to your Google Cloud!`);
                            setTimeout(() => setSaveSuccessMsg(null), 3000);
                          }}
                          disabled={cloudSyncStatus === 'saving'}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        >
                          {cloudSyncStatus === 'saving' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Cloud className="w-4 h-4" />
                          )}
                          <span>Save to Cloud</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Saving creates a permanent cloud backup in your Firestore database. Future changes will automatically autosave to this cloud project.
                      </p>
                    </div>

                    {/* Cloud Projects Library */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Cloud className="w-3.5 h-3.5 text-sky-400" />
                          Your Online Saved Floor Plans ({cloudProjects.length})
                        </h3>
                        {lastCloudSavedTime && (
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Last synced: {lastCloudSavedTime}
                          </span>
                        )}
                      </div>

                      {cloudProjects.length === 0 ? (
                        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-8 text-center text-zinc-400 text-xs space-y-2">
                          <Cloud className="w-8 h-8 text-zinc-600 mx-auto" />
                          <p className="font-semibold text-zinc-300">No cloud projects saved yet</p>
                          <p className="text-zinc-500 max-w-sm mx-auto">
                            Save your current design above and it will be stored securely online in your Google Cloud account.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5">
                          {cloudProjects.map((proj) => (
                            <div
                              key={proj.id}
                              className="bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-sky-500/60 rounded-xl p-3.5 flex items-center justify-between transition group shadow-sm"
                            >
                              <div
                                onClick={() => {
                                  onOpenCloudProject?.(proj);
                                  onClose();
                                }}
                                className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                              >
                                <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-600/40 flex items-center justify-center text-sky-400 shrink-0">
                                  <Cloud className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition truncate">
                                    {proj.title}
                                  </h4>
                                  <div className="text-[11px] text-zinc-400 flex items-center gap-3 mt-0.5">
                                    <span>{new Date(proj.updatedAt).toLocaleString()}</span>
                                    <span>•</span>
                                    <span className="text-indigo-400 font-semibold">{proj.objectCount} elements</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                <button
                                  onClick={() => {
                                    onOpenCloudProject?.(proj);
                                    onClose();
                                  }}
                                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition"
                                >
                                  Open in Canvas
                                </button>
                                <button
                                  onClick={() => onDeleteCloudProject?.(proj.id)}
                                  title="Delete from Cloud"
                                  className="p-1.5 text-zinc-500 hover:text-red-400 transition hover:bg-zinc-900 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Not Signed In View */
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto my-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
                      <Cloud className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white">Sign in with Google / Gmail</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                        Connect your Gmail or Google account to enable automatic, continuous cloud saving. Your architectural floor plans will stay safely preserved in the cloud at all times.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={onSignInGoogle}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2.5 mx-auto shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Sign in with Google Account</span>
                      </button>
                    </div>
                    <div className="pt-4 border-t border-zinc-800/60 text-[11px] text-zinc-500 flex items-center justify-center gap-4">
                      <span>✓ Continuous AutoSave</span>
                      <span>✓ Multi-device access</span>
                      <span>✓ Free Firebase cloud</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CONTACT DETAILS */}
            {activeTab === 'contact' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    Contact & Support Details
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Get in touch directly for architectural CAD assistance, custom project layouts, or application support.
                  </p>
                </div>

                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                      Primary Contact Email
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900 border border-zinc-750 px-4 py-3 rounded-xl">
                      <span className="font-mono text-sm text-indigo-300 font-bold select-all">
                        thedhibar@gmail.com
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleCopyContactEmail}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition border border-zinc-700/60"
                        >
                          {copiedContactEmail ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Email</span>
                            </>
                          )}
                        </button>
                        <a
                          href="mailto:thedhibar@gmail.com?subject=ArchSketch%20360%20CAD%20Inquiry"
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-indigo-600/30"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Email</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-1">
                      <div className="text-xs font-semibold text-zinc-200">CAD & Design Inquiries</div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Questions about architectural symbols, custom room dimensions, rotunda calculations, and export formats.
                      </p>
                    </div>
                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-1">
                      <div className="text-xs font-semibold text-zinc-200">Technical Support & Feedback</div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Assistance with drafting tools, background graphic underlays, Google Cloud AutoSave, or custom feature requests.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
