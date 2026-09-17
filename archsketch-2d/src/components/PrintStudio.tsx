import React, { useState, useMemo, useRef } from 'react';
import {
  Printer,
  X,
  ArrowLeft,
  FileText,
  Sliders,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Download,
  RotateCcw,
  Check,
  Compass,
  Layers,
  Palette,
  Layout,
  Grid,
  Tag,
} from 'lucide-react';
import { ArchObject, ColorMode, MarginOption, PageOrientation, PaperSize, PrintSettings, ScaleMode } from '../types';
import { ArchSymbolGraphic } from './ArchSymbols';
import { LeaderLinesLayer } from './LeaderLinesLayer';
import { computeLeaderAnnotations } from '../utils/leaderLines';
import { jsPDF } from 'jspdf';

interface PrintStudioProps {
  objects: ArchObject[];
  selectedIds: string[];
  onClose: () => void;
}

export const PrintStudio: React.FC<PrintStudioProps> = ({
  objects,
  selectedIds,
  onClose,
}) => {
  // MS Word-style Print Settings State
  const [settings, setSettings] = useState<PrintSettings>({
    copies: 1,
    printer: 'system_default',
    scope: selectedIds.length > 0 ? 'all' : 'all',
    orientation: 'landscape',
    paperSize: 'a4',
    margins: 'normal',
    scaleMode: 'fit',
    customScale: 100,
    colorMode: 'color',
    showTitleBlock: true,
    projectTitle: 'MODERN RESIDENTIAL FLOOR PLAN',
    sheetTitle: 'GROUND LEVEL FURNITURE & MEP LAYOUT',
    architectName: 'ARCHSKETCH CAD STUDIO',
    contactEmail: 'thedhibar@gmail.com',
    sheetNumber: 'A-101',
    scaleText: '1:100 @ A4 / FIT TO PAGE',
    showDate: true,
    showGrid: false,
    showDimensions: true,
    showNorthArrow: true,
    showLeaderLines: true,
    leaderContent: 'name_dimensions',
    leaderPointerStyle: 'dogleg',
  });

  // Preview zoom in Word's backstage preview pane
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [isExporting, setIsExporting] = useState(false);
  const sheetContainerRef = useRef<HTMLDivElement | null>(null);
  const sheetSvgRef = useRef<SVGSVGElement | null>(null);

  // Filter objects based on scope
  const targetObjects = useMemo(() => {
    if (settings.scope === 'selection' && selectedIds.length > 0) {
      return objects.filter((o) => selectedIds.includes(o.id));
    }
    return objects;
  }, [objects, selectedIds, settings.scope]);

  // Compute automatic leader lines pointing to each architectural icon
  const leaderAnnotations = useMemo(() => {
    if (!settings.showLeaderLines) return [];
    return computeLeaderAnnotations(targetObjects, {
      content: settings.leaderContent,
      pointerStyle: settings.leaderPointerStyle,
    });
  }, [settings.showLeaderLines, targetObjects, settings.leaderContent, settings.leaderPointerStyle]);

  // Paper Dimensions & Aspect Ratio
  const paperSpecs = useMemo(() => {
    let widthRatio = 297;
    let heightRatio = 210;
    let name = 'A4';
    let dimensions = '210 × 297 mm';

    switch (settings.paperSize) {
      case 'letter':
        widthRatio = 11;
        heightRatio = 8.5;
        name = 'Letter';
        dimensions = '8.5 × 11 in (216 × 279 mm)';
        break;
      case 'a4':
        widthRatio = 297;
        heightRatio = 210;
        name = 'A4';
        dimensions = '210 × 297 mm';
        break;
      case 'a3':
        widthRatio = 420;
        heightRatio = 297;
        name = 'A3';
        dimensions = '297 × 420 mm';
        break;
      case 'tabloid':
        widthRatio = 17;
        heightRatio = 11;
        name = 'Tabloid / Ledger';
        dimensions = '11 × 17 in (279 × 432 mm)';
        break;
      case 'arch_d':
        widthRatio = 36;
        heightRatio = 24;
        name = 'Architectural D';
        dimensions = '24 × 36 in (610 × 914 mm)';
        break;
    }

    if (settings.orientation === 'portrait') {
      const tmp = widthRatio;
      widthRatio = heightRatio;
      heightRatio = tmp;
    }

    const aspectRatio = widthRatio / heightRatio;

    // Standard base virtual sheet canvas coordinates (1200 x 1200 / aspect)
    const baseWidth = settings.orientation === 'landscape' ? 1200 : Math.round(1200 / aspectRatio);
    const baseHeight = settings.orientation === 'landscape' ? Math.round(1200 / aspectRatio) : 1200;

    return {
      name,
      dimensions,
      widthRatio,
      heightRatio,
      aspectRatio,
      sheetWidth: baseWidth,
      sheetHeight: baseHeight,
    };
  }, [settings.paperSize, settings.orientation]);

  // Margin percentages
  const marginPx = useMemo(() => {
    switch (settings.margins) {
      case 'narrow':
        return { x: paperSpecs.sheetWidth * 0.03, y: paperSpecs.sheetHeight * 0.03 };
      case 'wide':
        return { x: paperSpecs.sheetWidth * 0.09, y: paperSpecs.sheetHeight * 0.09 };
      case 'none':
        return { x: paperSpecs.sheetWidth * 0.015, y: paperSpecs.sheetHeight * 0.015 };
      case 'normal':
      default:
        return { x: paperSpecs.sheetWidth * 0.05, y: paperSpecs.sheetHeight * 0.05 };
    }
  }, [settings.margins, paperSpecs]);

  // Calculate object bounding box including leader lines and callout badges so nothing gets clipped
  const contentBBox = useMemo(() => {
    if (targetObjects.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600, w: 800, h: 600, cx: 400, cy: 300 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    targetObjects.forEach((obj) => {
      const halfW = Math.max(25, obj.w / 2 + 15);
      const halfH = Math.max(25, obj.h / 2 + 15);
      minX = Math.min(minX, obj.x - halfW);
      minY = Math.min(minY, obj.y - halfH);
      maxX = Math.max(maxX, obj.x + halfW);
      maxY = Math.max(maxY, obj.y + halfH);
    });

    // When leader lines are active, expand the bounding box to encapsulate all callout pills, labels & shelves
    if (settings.showLeaderLines && leaderAnnotations && leaderAnnotations.length > 0) {
      leaderAnnotations.forEach((item) => {
        // Collect all extent points of the leader annotation: start, elbow, shelf end, and background box
        const xPoints = [item.startX, item.elbowX, item.endX, item.bgX, item.bgX + item.bgW];
        const yPoints = [item.startY, item.elbowY, item.endY, item.bgY, item.bgY + item.bgH];

        if (item.keynoteX) {
          xPoints.push(item.keynoteX - 12, item.keynoteX + 12);
        }
        if (item.keynoteY) {
          yPoints.push(item.keynoteY - 12, item.keynoteY + 12);
        }

        xPoints.forEach((px) => {
          if (Number.isFinite(px)) {
            minX = Math.min(minX, px - 16);
            maxX = Math.max(maxX, px + 16);
          }
        });

        yPoints.forEach((py) => {
          if (Number.isFinite(py)) {
            minY = Math.min(minY, py - 16);
            maxY = Math.max(maxY, py + 16);
          }
        });
      });
    }

    // Safety fallback if any calculation failed
    if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY) || maxX <= minX || maxY <= minY) {
      minX = 0;
      minY = 0;
      maxX = 800;
      maxY = 600;
    }

    const w = Math.max(120, maxX - minX);
    const h = Math.max(120, maxY - minY);
    const cx = minX + w / 2;
    const cy = minY + h / 2;

    return { minX, minY, maxX, maxY, w, h, cx, cy };
  }, [targetObjects, settings.showLeaderLines, leaderAnnotations]);

  // Printable drawing viewport inside sheet
  const drawingArea = useMemo(() => {
    const titleBlockHeight = settings.showTitleBlock ? 90 : 0;
    const availX = marginPx.x;
    const availY = marginPx.y;
    const availW = paperSpecs.sheetWidth - marginPx.x * 2;
    const availH = paperSpecs.sheetHeight - marginPx.y * 2 - titleBlockHeight;

    let scale = 1;
    if (settings.scaleMode === 'fit') {
      // 0.82 ensures generous margins around the entire composition so names never touch borders
      const scaleX = (availW * 0.82) / Math.max(1, contentBBox.w);
      const scaleY = (availH * 0.82) / Math.max(1, contentBBox.h);
      scale = Math.min(scaleX, scaleY, 2.5);
    } else if (settings.scaleMode === '100') {
      scale = 1;
    } else if (settings.scaleMode === '75') {
      scale = 0.75;
    } else if (settings.scaleMode === '50') {
      scale = 0.5;
    } else if (settings.scaleMode === '150') {
      scale = 1.5;
    } else if (settings.scaleMode === 'custom') {
      scale = (settings.customScale || 100) / 100;
    }

    if (!Number.isFinite(scale) || scale <= 0) {
      scale = 1;
    }

    const targetCenterX = availX + availW / 2;
    const targetCenterY = availY + availH / 2;

    return {
      x: availX,
      y: availY,
      w: availW,
      h: availH,
      scale,
      targetCenterX,
      targetCenterY,
      titleBlockHeight,
    };
  }, [marginPx, paperSpecs, settings.showTitleBlock, settings.scaleMode, settings.customScale, contentBBox]);

  // Styling theme colors based on colorMode
  const themeStyles = useMemo(() => {
    switch (settings.colorMode) {
      case 'blueprint':
        return {
          sheetBg: '#092138',
          borderStroke: '#38bdf8',
          textPrimary: '#f0f9ff',
          textSecondary: '#7dd3fc',
          accent: '#0284c7',
          gridLine: '#0c4a6e',
          svgFilter: 'blueprint-filter',
          lineColor: '#e0f2fe',
          leaderLine: '#38bdf8',
          leaderBadgeBg: '#0b2942',
          leaderBorder: '#0284c7',
        };
      case 'monochrome':
        return {
          sheetBg: '#ffffff',
          borderStroke: '#000000',
          textPrimary: '#000000',
          textSecondary: '#333333',
          accent: '#000000',
          gridLine: '#e2e8f0',
          svgFilter: 'monochrome-filter',
          lineColor: '#000000',
          leaderLine: '#000000',
          leaderBadgeBg: '#ffffff',
          leaderBorder: '#000000',
        };
      case 'grayscale':
        return {
          sheetBg: '#ffffff',
          borderStroke: '#475569',
          textPrimary: '#1e293b',
          textSecondary: '#64748b',
          accent: '#334155',
          gridLine: '#f1f5f9',
          svgFilter: 'grayscale-filter',
          lineColor: '#334155',
          leaderLine: '#475569',
          leaderBadgeBg: '#ffffff',
          leaderBorder: '#cbd5e1',
        };
      case 'color':
      default:
        return {
          sheetBg: '#ffffff',
          borderStroke: '#1e293b',
          textPrimary: '#0f172a',
          textSecondary: '#64748b',
          accent: '#4f46e5',
          gridLine: '#f1f5f9',
          svgFilter: 'none',
          lineColor: '#1e293b',
          leaderLine: '#2563eb',
          leaderBadgeBg: '#ffffff',
          leaderBorder: '#cbd5e1',
        };
    }
  }, [settings.colorMode]);

  // Execute Direct Browser Print
  const handleTriggerPrint = () => {
    if (settings.printer === 'save_as_pdf') {
      handleSaveAsPdf();
      return;
    }
    // Inject paper orientation & print media
    window.print();
  };

  // High-Resolution PDF Document Export
  const handleSaveAsPdf = () => {
    if (!sheetSvgRef.current) return;
    setIsExporting(true);

    try {
      const svgClone = sheetSvgRef.current.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('width', `${paperSpecs.sheetWidth}`);
      svgClone.setAttribute('height', `${paperSpecs.sheetHeight}`);
      svgClone.setAttribute('viewBox', `0 0 ${paperSpecs.sheetWidth} ${paperSpecs.sheetHeight}`);
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgClone.setAttribute('version', '1.1');
      svgClone.style.backgroundColor = themeStyles.sheetBg;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgClone);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        try {
          const dpr = 2; // 300 DPI high resolution
          const targetW = Math.round(paperSpecs.sheetWidth * dpr);
          const targetH = Math.round(paperSpecs.sheetHeight * dpr);

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsExporting(false);
            URL.revokeObjectURL(blobUrl);
            return;
          }

          // Fill sheet background
          ctx.fillStyle = themeStyles.sheetBg;
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);
          URL.revokeObjectURL(blobUrl);

          const imgData = canvas.toDataURL('image/jpeg', 0.95);

          const orientation = settings.orientation === 'portrait' ? 'portrait' : 'landscape';
          let format: string | [number, number] = 'a4';
          if (settings.paperSize === 'letter') format = 'letter';
          else if (settings.paperSize === 'a4') format = 'a4';
          else if (settings.paperSize === 'a3') format = 'a3';
          else if (settings.paperSize === 'tabloid') format = 'tabloid';
          else if (settings.paperSize === 'arch_d') format = [610, 914];

          const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format,
            compress: true,
          });

          const pdfW = pdf.internal.pageSize.getWidth();
          const pdfH = pdf.internal.pageSize.getHeight();

          pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
          const cleanProject = (settings.projectTitle || 'FloorPlan').trim().replace(/\s+/g, '_');
          const cleanSheet = (settings.sheetNumber || 'A-101').trim();
          pdf.save(`${cleanProject}_${cleanSheet}_ArchitecturalSheet.pdf`);
          setIsExporting(false);
        } catch (pdfErr) {
          console.error('PDF generation error', pdfErr);
          setIsExporting(false);
          URL.revokeObjectURL(blobUrl);
        }
      };

      img.onerror = (err) => {
        console.error('Print sheet image load error', err);
        setIsExporting(false);
        URL.revokeObjectURL(blobUrl);
      };

      img.src = blobUrl;
    } catch (err) {
      console.error('Print sheet PDF export error', err);
      setIsExporting(false);
    }
  };

  // High-Resolution Sheet Image Export (Downloadable PNG & Scalable Vector SVG)
  const handleDownloadSheet = (format: 'png' | 'svg' = 'png') => {
    if (!sheetSvgRef.current) return;
    setIsExporting(true);

    try {
      // Clone the SVG DOM element to prepare a clean, standalone exportable vector file
      const svgClone = sheetSvgRef.current.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('width', `${paperSpecs.sheetWidth}`);
      svgClone.setAttribute('height', `${paperSpecs.sheetHeight}`);
      svgClone.setAttribute('viewBox', `0 0 ${paperSpecs.sheetWidth} ${paperSpecs.sheetHeight}`);
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgClone.setAttribute('version', '1.1');
      svgClone.style.backgroundColor = themeStyles.sheetBg;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgClone);

      if (format === 'svg') {
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `${settings.projectTitle.replace(/\s+/g, '_')}_${settings.sheetNumber}_VectorCAD.svg`;
        a.href = blobUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(blobUrl);
        setIsExporting(false);
        return;
      }

      // High-resolution PNG rasterization (300 DPI equivalent)
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        try {
          const dpr = 2; // 300 DPI high resolution
          const targetW = Math.round(paperSpecs.sheetWidth * dpr);
          const targetH = Math.round(paperSpecs.sheetHeight * dpr);

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsExporting(false);
            URL.revokeObjectURL(blobUrl);
            return;
          }

          // Fill sheet background
          ctx.fillStyle = themeStyles.sheetBg;
          ctx.fillRect(0, 0, targetW, targetH);

          // Render the whole SVG sheet image accurately to cover the entire target canvas
          ctx.drawImage(img, 0, 0, targetW, targetH);

          URL.revokeObjectURL(blobUrl);

          // Export full-sheet PNG via blob to prevent any data URL length limits
          canvas.toBlob(
            (pngBlob) => {
              if (pngBlob) {
                const downloadUrl = URL.createObjectURL(pngBlob);
                const a = document.createElement('a');
                const filename = `${settings.projectTitle.replace(/\s+/g, '_')}_${settings.sheetNumber}_PrintSheet.png`;
                a.href = downloadUrl;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(downloadUrl);
              }
              setIsExporting(false);
            },
            'image/png',
            1.0
          );
        } catch (canvasErr) {
          console.error('Canvas export error', canvasErr);
          setIsExporting(false);
          URL.revokeObjectURL(blobUrl);
        }
      };

      img.onerror = (err) => {
        console.error('Print sheet image load error', err);
        setIsExporting(false);
        URL.revokeObjectURL(blobUrl);
      };

      img.src = blobUrl;
    } catch (err) {
      console.error('Print sheet export error', err);
      setIsExporting(false);
    }
  };

  const currentDateStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
  }, []);

  return (
    <div
      id="print-studio-container"
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-zinc-100 select-none overflow-hidden"
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: MS WORD BACKSTAGE NAVIGATION                       */}
      {/* ------------------------------------------------------------- */}
      <header className="no-print h-14 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            id="btn-print-back"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Drawing</span>
          </button>
          <div className="h-5 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Print Setup & Preview</h2>
              <p className="text-[11px] text-zinc-400">Microsoft Word Style Backstage Studio</p>
            </div>
          </div>
        </div>

        {/* Quick Print & Export CTA */}
        <div className="flex items-center gap-2">
          <button
            id="btn-print-save-pdf-top"
            onClick={handleSaveAsPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition active:scale-95 disabled:opacity-50"
            title="Save Architectural Sheet as Adobe PDF Document (.pdf)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating PDF...' : 'Save as PDF'}</span>
          </button>

          <button
            id="btn-quick-download-sheet"
            onClick={() => handleDownloadSheet('png')}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium border border-zinc-700 transition active:scale-95 disabled:opacity-50"
            title="Download full 300-DPI high-resolution print sheet without clipping"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>High-Res PNG</span>
          </button>

          <button
            id="btn-quick-download-svg"
            onClick={() => handleDownloadSheet('svg')}
            disabled={isExporting}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-750 transition active:scale-95 disabled:opacity-50"
            title="Download crisp Scalable Vector SVG CAD Sheet"
          >
            <span>Vector SVG</span>
          </button>

          <button
            id="btn-execute-print-top"
            onClick={handleTriggerPrint}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet (Ctrl+P)</span>
          </button>

          <button
            id="btn-print-close"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN TWO-COLUMN SPLIT: LEFT SETTINGS | RIGHT LIVE PREVIEW      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* =========================================================== */}
        {/* LEFT COLUMN: MS WORD SETTINGS PANEL (SCROLLABLE)            */}
        {/* =========================================================== */}
        <aside
          id="print-settings-sidebar"
          className="no-print w-full md:w-[380px] lg:w-[410px] bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-auto shrink-0 p-4 space-y-4"
        >
          {/* PRIMARY PRINT & PDF ACTION CARD (WORD STYLE) */}
          <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/90 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              {/* Big Word-style Print Button */}
              <button
                id="btn-large-print-trigger"
                onClick={handleTriggerPrint}
                className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 transition active:scale-[0.98]"
              >
                <Printer className="w-6 h-6" />
                <span className="text-base tracking-wide uppercase">Print</span>
              </button>

              {/* Copies Stepper */}
              <div className="flex flex-col items-center bg-zinc-900 border border-zinc-750 px-3 py-1.5 rounded-xl">
                <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Copies</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, copies: Math.max(1, s.copies - 1) }))}
                    className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-sm text-white">
                    {settings.copies}
                  </span>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, copies: s.copies + 1 }))}
                    className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Save as PDF dedicated button */}
            <button
              id="btn-large-save-pdf"
              type="button"
              onClick={handleSaveAsPdf}
              disabled={isExporting}
              className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm tracking-wide">
                {isExporting ? 'Exporting PDF...' : 'Save as PDF Document (.pdf)'}
              </span>
            </button>

            {/* Printer Destination */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Printer / Destination</label>
              <select
                value={settings.printer}
                onChange={(e) => setSettings({ ...settings, printer: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="save_as_pdf">Save as PDF Document (.pdf)</option>
                <option value="system_default">System Default (Print Dialog / Hardware)</option>
                <option value="ms_pdf">Microsoft Print to PDF</option>
                <option value="plotter">Architectural Large Format Plotter</option>
                <option value="laser">Color LaserJet PostScript</option>
              </select>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1 px-1">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Ready
                </span>
                <span className="text-indigo-400">High-DPI Vector Passthrough</span>
              </div>
            </div>
          </div>

          {/* SECTION: PRINT SETTINGS */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Page & Sheet Setup</span>
            </h3>

            {/* Print Scope */}
            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300">Print Scope</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, scope: 'all' })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition ${
                    settings.scope === 'all'
                      ? 'bg-indigo-600/30 text-white border-indigo-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  Entire Plan ({objects.length} items)
                </button>
                <button
                  type="button"
                  disabled={selectedIds.length === 0}
                  onClick={() => setSettings({ ...settings, scope: 'selection' })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition disabled:opacity-40 ${
                    settings.scope === 'selection'
                      ? 'bg-indigo-600/30 text-white border-indigo-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  Selected ({selectedIds.length})
                </button>
              </div>
            </div>

            {/* Page Orientation */}
            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300">Orientation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, orientation: 'landscape' })}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition text-left ${
                    settings.orientation === 'landscape'
                      ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-5 border-2 border-current rounded flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold">L</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Landscape</div>
                    <div className="text-[10px] text-zinc-400">Architectural Plan</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, orientation: 'portrait' })}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition text-left ${
                    settings.orientation === 'portrait'
                      ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="w-5 h-7 border-2 border-current rounded flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold">P</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Portrait</div>
                    <div className="text-[10px] text-zinc-400">Vertical Sheet</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Paper Size */}
            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-300">Paper Size</label>
                <span className="text-[10px] text-indigo-400 font-mono">{paperSpecs.dimensions}</span>
              </div>
              <select
                value={settings.paperSize}
                onChange={(e) => setSettings({ ...settings, paperSize: e.target.value as PaperSize })}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="a4">A4 (210 × 297 mm) - Standard Office</option>
                <option value="a3">A3 (297 × 420 mm) - Medium Architectural</option>
                <option value="letter">US Letter (8.5 × 11 in)</option>
                <option value="tabloid">Tabloid / Ledger (11 × 17 in)</option>
                <option value="arch_d">Architectural D (24 × 36 in) - Plotter</option>
              </select>
            </div>

            {/* Margins */}
            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300">Margins</label>
              <div className="grid grid-cols-4 gap-1 text-center">
                {(['normal', 'narrow', 'wide', 'none'] as MarginOption[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSettings({ ...settings, margins: m })}
                    className={`py-1.5 px-1 rounded-lg text-xs capitalize border font-medium transition ${
                      settings.margins === m
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {m === 'none' ? 'Zero' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Scaling */}
            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-300">Drawing Scale</label>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {settings.scaleMode === 'fit' ? 'Auto-Fitted' : `${settings.customScale}%`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['fit', '100', '75', 'custom'] as ScaleMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSettings({ ...settings, scaleMode: mode })}
                    className={`py-1 px-1 rounded-lg text-xs capitalize border font-medium transition ${
                      settings.scaleMode === mode
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {mode === 'fit' ? 'Fit Page' : mode === 'custom' ? 'Custom' : `${mode}%`}
                  </button>
                ))}
              </div>
              {settings.scaleMode === 'custom' && (
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="range"
                    min="30"
                    max="200"
                    value={settings.customScale}
                    onChange={(e) => setSettings({ ...settings, customScale: Number(e.target.value) })}
                    className="flex-1 accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono text-indigo-400 w-10 text-right">{settings.customScale}%</span>
                </div>
              )}
            </div>

            {/* Drawing Style & Plot Theme */}
            <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Color & Plot Style</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'color', label: 'CAD Full Color', hint: 'Original colors' },
                  { id: 'monochrome', label: 'Monochrome B&W', hint: 'Crisp black lines' },
                  { id: 'blueprint', label: 'Classic Blueprint', hint: 'Cyan on navy' },
                  { id: 'grayscale', label: 'Grayscale', hint: 'Shaded neutral' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, colorMode: item.id as ColorMode })}
                    className={`p-2 rounded-xl text-left border transition ${
                      settings.colorMode === item.id
                        ? 'bg-indigo-600/25 border-indigo-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-zinc-500">{item.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Architectural Title Block Customization */}
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Title Block & Border</span>
                </label>
                <input
                  type="checkbox"
                  checked={settings.showTitleBlock}
                  onChange={(e) => setSettings({ ...settings, showTitleBlock: e.target.checked })}
                  className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {settings.showTitleBlock && (
                <div className="space-y-2 pt-1 border-t border-zinc-800/60 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block">Project Name</label>
                    <input
                      type="text"
                      value={settings.projectTitle}
                      onChange={(e) => setSettings({ ...settings, projectTitle: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-2 py-1 text-xs text-zinc-200 mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block">Sheet Title</label>
                    <input
                      type="text"
                      value={settings.sheetTitle}
                      onChange={(e) => setSettings({ ...settings, sheetTitle: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-2 py-1 text-xs text-zinc-200 mt-0.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-medium block">Architect / Firm</label>
                      <input
                        type="text"
                        value={settings.architectName}
                        onChange={(e) => setSettings({ ...settings, architectName: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-2 py-1 text-xs text-zinc-200 mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-medium block">Sheet No.</label>
                      <input
                        type="text"
                        value={settings.sheetNumber}
                        onChange={(e) => setSettings({ ...settings, sheetNumber: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-2 py-1 text-xs text-zinc-200 mt-0.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail || ''}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      placeholder="thedhibar@gmail.com"
                      className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-2 py-1 text-xs text-zinc-200 mt-0.5 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-300">
                      <input
                        type="checkbox"
                        checked={settings.showNorthArrow}
                        onChange={(e) => setSettings({ ...settings, showNorthArrow: e.target.checked })}
                        className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 w-3.5 h-3.5"
                      />
                      <span>North Arrow & Scale</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-300">
                      <input
                        type="checkbox"
                        checked={settings.showGrid}
                        onChange={(e) => setSettings({ ...settings, showGrid: e.target.checked })}
                        className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 w-3.5 h-3.5"
                      />
                      <span>Print Grid Lines</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Automatic Leader Lines & Icon Identification Callouts */}
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Auto Icon Pointer Lines</span>
                </label>
                <input
                  type="checkbox"
                  id="toggle-print-leader-lines"
                  checked={settings.showLeaderLines}
                  onChange={(e) => setSettings({ ...settings, showLeaderLines: e.target.checked })}
                  className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Automatically draws pointer lines from icons to identify what each icon is with dimensions.
              </p>

              {settings.showLeaderLines && (
                <div className="space-y-2.5 pt-2 border-t border-zinc-800/60 text-xs">
                  {/* Callout Information */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Information Displayed</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'name_dimensions', label: 'Name + Dims', hint: 'Complete' },
                        { id: 'name', label: 'Name Only', hint: 'Compact' },
                        { id: 'keynote_tag', label: 'Keynote Tag', hint: 'Numbered' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSettings({ ...settings, leaderContent: item.id as any })}
                          className={`py-1.5 px-1 rounded-lg text-center border transition ${
                            settings.leaderContent === item.id
                              ? 'bg-indigo-600/30 text-white border-indigo-500 shadow-sm'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                          }`}
                        >
                          <div className="text-[11px] font-semibold">{item.label}</div>
                          <div className="text-[9px] text-zinc-500">{item.hint}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pointer Style */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Pointer Line Style</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'dogleg', label: 'CAD Dogleg', hint: 'Elbow line' },
                        { id: 'arrow', label: 'Arrowhead', hint: 'Direct pointer' },
                        { id: 'dot', label: 'Anchor Dot', hint: 'Smooth curve' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSettings({ ...settings, leaderPointerStyle: item.id as any })}
                          className={`py-1.5 px-1 rounded-lg text-center border transition ${
                            settings.leaderPointerStyle === item.id
                              ? 'bg-indigo-600/30 text-white border-indigo-500 shadow-sm'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                          }`}
                        >
                          <div className="text-[11px] font-semibold">{item.label}</div>
                          <div className="text-[9px] text-zinc-500">{item.hint}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Count Badge */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{leaderAnnotations.length} icon pointer lines generated</span>
                    </span>
                    <span className="font-mono text-indigo-300 font-bold">Auto-aligned</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* =========================================================== */}
        {/* RIGHT COLUMN: MS WORD INTERACTIVE LIVE PRINT PREVIEW SHEET  */}
        {/* =========================================================== */}
        <main
          id="print-preview-viewport"
          className="flex-1 bg-zinc-950 flex flex-col min-h-0 relative overflow-hidden"
        >
          {/* Preview Canvas Stage Area */}
          <div
            ref={sheetContainerRef}
            className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center relative select-none"
            style={{
              backgroundColor: '#18181b',
              backgroundImage: 'radial-gradient(circle at 1px 1px, #27272a 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* The Physical Paper Sheet Preview (Matches chosen paper size & orientation) */}
            <div
              id="printable-sheet-element"
              className="printable-sheet-element transition-transform duration-200 relative shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
              style={{
                width: `${(paperSpecs.sheetWidth * (previewZoom / 100)) * 0.72}px`,
                height: `${(paperSpecs.sheetHeight * (previewZoom / 100)) * 0.72}px`,
                backgroundColor: themeStyles.sheetBg,
                borderRadius: '2px',
              }}
            >
              {/* Full SVG Vector Sheet Engine */}
              <svg
                ref={sheetSvgRef}
                id="printable-sheet-svg"
                width={paperSpecs.sheetWidth}
                height={paperSpecs.sheetHeight}
                viewBox={`0 0 ${paperSpecs.sheetWidth} ${paperSpecs.sheetHeight}`}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                className="w-full h-full block"
                style={{
                  backgroundColor: themeStyles.sheetBg,
                }}
              >
                <defs>
                  {/* Subtle Sheet Grid pattern if enabled */}
                  <pattern id="print-sheet-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke={themeStyles.gridLine} strokeWidth="0.6" />
                  </pattern>

                  {/* Filter for Blueprint Mode */}
                  <filter id="blueprint-filter">
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0.8
                              0 0 0 0 0.95
                              0 0 0 0 1
                              0 0 0 1 0"
                    />
                  </filter>

                  {/* Filter for Monochrome Mode */}
                  <filter id="monochrome-filter">
                    <feColorMatrix
                      type="matrix"
                      values="0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0    0    0    1 0"
                    />
                  </filter>

                  {/* Filter for Grayscale Mode */}
                  <filter id="grayscale-filter">
                    <feColorMatrix type="saturate" values="0" />
                  </filter>
                </defs>

                {/* Optional Grid Background on Sheet */}
                {settings.showGrid && (
                  <rect
                    x={marginPx.x}
                    y={marginPx.y}
                    width={paperSpecs.sheetWidth - marginPx.x * 2}
                    height={paperSpecs.sheetHeight - marginPx.y * 2}
                    fill="url(#print-sheet-grid)"
                  />
                )}

                {/* --------------------------------------------------- */}
                {/* ARCHITECTURAL BORDER & CORNER MARKS                 */}
                {/* --------------------------------------------------- */}
                {settings.showTitleBlock && (
                  <g id="architectural-sheet-borders">
                    {/* Outer Border Line */}
                    <rect
                      x={marginPx.x * 0.7}
                      y={marginPx.y * 0.7}
                      width={paperSpecs.sheetWidth - marginPx.x * 1.4}
                      height={paperSpecs.sheetHeight - marginPx.y * 1.4}
                      fill="none"
                      stroke={themeStyles.borderStroke}
                      strokeWidth="1.2"
                    />
                    {/* Inner CAD Frame Line */}
                    <rect
                      x={marginPx.x}
                      y={marginPx.y}
                      width={paperSpecs.sheetWidth - marginPx.x * 2}
                      height={paperSpecs.sheetHeight - marginPx.y * 2}
                      fill="none"
                      stroke={themeStyles.borderStroke}
                      strokeWidth="2.5"
                    />

                    {/* Corner Registration / Crop Marks */}
                    {/* Top-Left */}
                    <path
                      d={`M ${marginPx.x * 0.3} ${marginPx.y * 0.7} L ${marginPx.x * 0.7} ${marginPx.y * 0.7} L ${marginPx.x * 0.7} ${marginPx.y * 0.3}`}
                      fill="none"
                      stroke={themeStyles.borderStroke}
                      strokeWidth="1"
                    />
                    {/* Top-Right */}
                    <path
                      d={`M ${paperSpecs.sheetWidth - marginPx.x * 0.3} ${marginPx.y * 0.7} L ${paperSpecs.sheetWidth - marginPx.x * 0.7} ${marginPx.y * 0.7} L ${paperSpecs.sheetWidth - marginPx.x * 0.7} ${marginPx.y * 0.3}`}
                      fill="none"
                      stroke={themeStyles.borderStroke}
                      strokeWidth="1"
                    />
                    {/* Bottom-Left */}
                    <path
                      d={`M ${marginPx.x * 0.3} ${paperSpecs.sheetHeight - marginPx.y * 0.7} L ${marginPx.x * 0.7} ${paperSpecs.sheetHeight - marginPx.y * 0.7} L ${marginPx.x * 0.7} ${paperSpecs.sheetHeight - marginPx.y * 0.3}`}
                      fill="none"
                      stroke={themeStyles.borderStroke}
                      strokeWidth="1"
                    />
                    {/* Bottom-Right */}
                    <path
                      d={`M ${paperSpecs.sheetWidth - marginPx.x * 0.3} ${paperSpecs.sheetHeight - marginPx.y * 0.7} L ${paperSpecs.sheetWidth - marginPx.x * 0.7} ${paperSpecs.sheetHeight - marginPx.y * 0.7} L ${paperSpecs.sheetWidth - marginPx.x * 0.7} ${paperSpecs.sheetHeight - marginPx.y * 0.3}`}
                      fill="none"
                      stroke={themeStyles.borderStroke}
                      strokeWidth="1"
                    />
                  </g>
                )}

                {/* --------------------------------------------------- */}
                {/* DRAWING OBJECTS GROUP (SCALED & CENTERED)           */}
                {/* --------------------------------------------------- */}
                <g
                  id="print-drawing-content"
                  transform={`translate(${drawingArea.targetCenterX}, ${drawingArea.targetCenterY}) scale(${drawingArea.scale}) translate(${-contentBBox.cx}, ${-contentBBox.cy})`}
                  style={{
                    filter: settings.colorMode === 'blueprint'
                      ? 'url(#blueprint-filter)'
                      : settings.colorMode === 'monochrome'
                      ? 'url(#monochrome-filter)'
                      : settings.colorMode === 'grayscale'
                      ? 'url(#grayscale-filter)'
                      : 'none',
                  }}
                >
                  {targetObjects.map((obj) => (
                    <g
                      key={`print-obj-${obj.id}`}
                      transform={`translate(${obj.x}, ${obj.y}) rotate(${obj.angle})`}
                    >
                      <g transform={`scale(${obj.flipH ? -1 : 1}, ${obj.flipV ? -1 : 1})`}>
                        <ArchSymbolGraphic
                          kind={obj.kind}
                          w={obj.w}
                          h={obj.h}
                          name={obj.name}
                          color={obj.color}
                          preview={false}
                          doorSwing={obj.doorSwing}
                          doorInswing={obj.doorInswing}
                          doorAngle={obj.doorAngle}
                          doorShowTag={obj.doorShowTag}
                          doorTag={obj.doorTag}
                          wallThickness={obj.wallThickness}
                          roomName={obj.roomName !== undefined ? obj.roomName : (obj.kind === 'room' ? obj.name : undefined)}
                          showRoomLabel={obj.showRoomLabel}
                          roomFloorPattern={obj.roomFloorPattern}
                          windowPanes={obj.windowPanes}
                          windowTag={obj.windowTag}
                          polygonPoints={obj.polygonPoints}
                          imageUrl={obj.imageUrl}
                          imageOpacity={obj.imageOpacity}
                        />
                      </g>
                    </g>
                  ))}

                  {/* Automatic Architectural Leader Lines & Identification Callouts */}
                  {settings.showLeaderLines && (
                    <LeaderLinesLayer
                      annotations={leaderAnnotations}
                      theme={{
                        line: themeStyles.leaderLine,
                        textPrimary: themeStyles.textPrimary,
                        textSecondary: themeStyles.textSecondary,
                        accent: themeStyles.accent,
                        bg: themeStyles.leaderBadgeBg,
                        border: themeStyles.leaderBorder,
                      }}
                      pointerStyle={settings.leaderPointerStyle}
                      content={settings.leaderContent}
                    />
                  )}
                </g>

                {/* --------------------------------------------------- */}
                {/* ARCHITECTURAL TITLE BLOCK STRIP AT BOTTOM           */}
                {/* --------------------------------------------------- */}
                {settings.showTitleBlock && (
                  <g
                    id="architectural-title-block"
                    transform={`translate(${marginPx.x}, ${paperSpecs.sheetHeight - marginPx.y - 80})`}
                  >
                    {/* Divider Line */}
                    <line
                      x1="0"
                      y1="0"
                      x2={paperSpecs.sheetWidth - marginPx.x * 2}
                      y2="0"
                      stroke={themeStyles.borderStroke}
                      strokeWidth="2"
                    />

                    {/* Left Section: Firm & Project Info */}
                    <g transform="translate(18, 16)">
                      <text
                        x="0"
                        y="0"
                        fontSize="9.5"
                        fontWeight="bold"
                        letterSpacing="1.2"
                        fill={themeStyles.textSecondary}
                        fontFamily="sans-serif"
                      >
                        {settings.architectName}
                        {settings.contactEmail ? `  |  CONTACT: ${settings.contactEmail}` : ''}
                      </text>
                      <text
                        x="0"
                        y="20"
                        fontSize="15"
                        fontWeight="bold"
                        fill={themeStyles.textPrimary}
                        fontFamily="sans-serif"
                      >
                        {settings.projectTitle}
                      </text>
                      <text
                        x="0"
                        y="40"
                        fontSize="11"
                        fontWeight="600"
                        fill={themeStyles.accent}
                        fontFamily="sans-serif"
                      >
                        {settings.sheetTitle}
                      </text>
                    </g>

                    {/* Middle Section: North Compass & Graphic Scale */}
                    {settings.showNorthArrow && (
                      <g transform={`translate(${(paperSpecs.sheetWidth - marginPx.x * 2) * 0.58}, 22)`}>
                        {/* Compact North Symbol */}
                        <g transform="translate(20, 16)">
                          <circle cx="0" cy="0" r="14" fill="none" stroke={themeStyles.textPrimary} strokeWidth="1" />
                          <polygon points="0,-13 -4,0 0,0" fill={themeStyles.textPrimary} />
                          <polygon points="0,-13 4,0 0,0" fill="none" stroke={themeStyles.textPrimary} strokeWidth="0.8" />
                          <text x="0" y="-16" textAnchor="middle" fontSize="9" fontWeight="bold" fill={themeStyles.textPrimary}>N</text>
                        </g>

                        {/* Graphic Scale Bar */}
                        <g transform="translate(60, 20)">
                          <text x="0" y="-8" fontSize="8" fontWeight="bold" fill={themeStyles.textPrimary}>GRAPHIC SCALE</text>
                          <rect x="0" y="0" width="30" height="4" fill={themeStyles.textPrimary} />
                          <rect x="30" y="0" width="30" height="4" fill="none" stroke={themeStyles.textPrimary} strokeWidth="1" />
                          <rect x="60" y="0" width="30" height="4" fill={themeStyles.textPrimary} />
                          <rect x="90" y="0" width="30" height="4" fill="none" stroke={themeStyles.textPrimary} strokeWidth="1" />
                          <text x="0" y="12" fontSize="7" fill={themeStyles.textSecondary}>0</text>
                          <text x="60" y="12" fontSize="7" fill={themeStyles.textSecondary}>2m</text>
                          <text x="120" y="12" fontSize="7" fill={themeStyles.textSecondary}>4m</text>
                        </g>
                      </g>
                    )}

                    {/* Right Section: Sheet Number, Date, Scale, Status Stamp */}
                    <g transform={`translate(${paperSpecs.sheetWidth - marginPx.x * 2 - 240}, 0)`}>
                      <line x1="0" y1="0" x2="0" y2="80" stroke={themeStyles.borderStroke} strokeWidth="1.5" />
                      <line x1="0" y1="40" x2="240" y2="40" stroke={themeStyles.borderStroke} strokeWidth="1" />
                      <line x1="120" y1="0" x2="120" y2="80" stroke={themeStyles.borderStroke} strokeWidth="1" />

                      {/* Scale (Left Column) */}
                      <g transform="translate(10, 16)">
                        <text x="0" y="0" fontSize="8" fontWeight="bold" fill={themeStyles.textSecondary}>SCALE</text>
                        <text x="0" y="14" fontSize="9" fontWeight="bold" fill={themeStyles.textPrimary}>
                          {settings.scaleMode === 'fit' ? 'FIT TO PAGE' : settings.scaleText.length > 15 ? settings.scaleText.slice(0, 14) + '…' : settings.scaleText}
                        </text>
                      </g>

                      {/* Date (Right Column) */}
                      <g transform="translate(132, 16)">
                        <text x="0" y="0" fontSize="8" fontWeight="bold" fill={themeStyles.textSecondary}>DATE</text>
                        <text x="0" y="14" fontSize="9" fontWeight="bold" fill={themeStyles.textPrimary}>{currentDateStr}</text>
                      </g>

                      {/* Sheet Number (Left Column Bottom) */}
                      <g transform="translate(10, 56)">
                        <text x="0" y="0" fontSize="8" fontWeight="bold" fill={themeStyles.textSecondary}>SHEET NO.</text>
                        <text x="0" y="16" fontSize="15" fontWeight="bold" fill={themeStyles.accent}>{settings.sheetNumber}</text>
                      </g>

                      {/* Status Stamp (Right Column Bottom) */}
                      <g transform="translate(132, 54)">
                        <rect x="0" y="-3" width="95" height="22" rx="3" fill="none" stroke={themeStyles.accent} strokeWidth="1" />
                        <text x="47.5" y="11" textAnchor="middle" fontSize="8" fontWeight="bold" fill={themeStyles.accent}>FOR REVIEW</text>
                      </g>
                    </g>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* PREVIEW BOTTOM BAR (ZOOM & SHEET STATS)                   */}
          {/* --------------------------------------------------------- */}
          <footer className="no-print h-12 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-between shrink-0 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-zinc-300">Sheet 1 of 1</span>
              <span className="text-zinc-600">•</span>
              <span>{paperSpecs.name} ({settings.orientation})</span>
              <span className="text-zinc-600">•</span>
              <span>{targetObjects.length} object{targetObjects.length === 1 ? '' : 's'} included</span>
            </div>

            {/* Preview Zoom Slider & Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewZoom((z) => Math.max(40, z - 10))}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Zoom Out Preview"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="40"
                max="160"
                value={previewZoom}
                onChange={(e) => setPreviewZoom(Number(e.target.value))}
                className="w-24 accent-indigo-500 h-1 bg-zinc-800 rounded cursor-pointer"
              />
              <span className="font-mono text-zinc-300 text-[11px] w-10 text-right">{previewZoom}%</span>
              <button
                onClick={() => setPreviewZoom((z) => Math.min(160, z + 10))}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Zoom In Preview"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewZoom(100)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-[11px]"
              >
                Reset
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
