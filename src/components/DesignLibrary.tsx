import React, { useMemo, useRef, useState } from 'react';
import { CATEGORIES, CATEGORY_HELP, ITEMS_BY_CATEGORY, CATEGORY_COUNTS } from '../data/libraryItems';
import { CategoryName, LibraryItemDef, LibraryPosition } from '../types';
import { ArchSymbolGraphic } from './ArchSymbols';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronDown,
  ChevronUp,
  PanelBottomOpen,
  PanelLeft,
  PanelBottom,
  PanelRight,
  Search,
  LayoutGrid,
  Rows3,
  Smartphone,
  Hand,
} from 'lucide-react';

interface DesignLibraryProps {
  currentCategory: CategoryName;
  onSelectCategory: (cat: CategoryName) => void;
  onPlaceItem: (item: LibraryItemDef) => void;
  onDragStartItem: (item: LibraryItemDef, e: React.DragEvent) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  position?: LibraryPosition;
  onChangePosition?: (pos: LibraryPosition) => void;
  onImportGraphic?: (file: File) => void;
  onTouchDragStart?: (item: LibraryItemDef, touch: { clientX: number; clientY: number }) => void;
  onTouchDragMove?: (touch: { clientX: number; clientY: number }) => void;
  onTouchDragEnd?: (touch: { clientX: number; clientY: number }) => void;
}

const DesignLibraryComponent: React.FC<DesignLibraryProps> = ({
  currentCategory,
  onSelectCategory,
  onPlaceItem,
  onDragStartItem,
  isMinimized = false,
  onToggleMinimize,
  position = 'left',
  onChangePosition,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [mobileGridMode, setMobileGridMode] = useState<boolean>(false);

  // Mobile Touch Drag Engine: Tracks touch movements and converts into canvas drag-and-drop
  const touchStateRef = useRef<{
    item: LibraryItemDef;
    startX: number;
    startY: number;
    startTime: number;
    isDragging: boolean;
  } | null>(null);

  const handleCardTouchStart = (item: LibraryItemDef, e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStateRef.current = {
      item,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isDragging: false,
    };
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    const state = touchStateRef.current;
    if (!state || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - state.startX;
    const dy = touch.clientY - state.startY;
    const dist = Math.hypot(dx, dy);

    if (!state.isDragging) {
      // In bottom dock, upward movement (dy < -10) or strong vertical drag initiates drag onto canvas!
      // This preserves normal horizontal carousel scrolling if dy is small.
      const isUpwardCanvasDrag = position === 'bottom' && dy < -10;
      const isSideCanvasDrag =
        position === 'right' ? dx < -10 : position === 'left' ? dx > 10 : false;
      const isGeneralDrag = dist > 22 && Math.abs(dy) > Math.abs(dx) * 0.7;

      if (isUpwardCanvasDrag || isSideCanvasDrag || isGeneralDrag) {
        state.isDragging = true;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(25);
          } catch (_) {}
        }
        onTouchDragStart?.(state.item, { clientX: touch.clientX, clientY: touch.clientY });
      }
    } else {
      if (e.cancelable) e.preventDefault();
      onTouchDragMove?.({ clientX: touch.clientX, clientY: touch.clientY });
    }
  };

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    const state = touchStateRef.current;
    if (!state) return;
    if (state.isDragging) {
      const lastTouch = e.changedTouches[0] || e.touches[0];
      if (lastTouch) {
        onTouchDragEnd?.({ clientX: lastTouch.clientX, clientY: lastTouch.clientY });
      } else {
        onTouchDragEnd?.({ clientX: -9999, clientY: -9999 });
      }
    } else {
      // Simple tap => Place directly onto canvas
      onPlaceItem(state.item);
    }
    touchStateRef.current = null;
  };

  const handleCardTouchCancel = () => {
    if (touchStateRef.current?.isDragging) {
      onTouchDragEnd?.({ clientX: -9999, clientY: -9999 });
    }
    touchStateRef.current = null;
  };

  const rawItems = useMemo(
    () => ITEMS_BY_CATEGORY[currentCategory] || [],
    [currentCategory]
  );

  const items = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) return rawItems;
    return rawItems.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query)
    );
  }, [rawItems, filterQuery]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Reusable Dock Position Selector Button Group
  const renderDockPositionControls = (compact = false) => (
    <div
      id="dock-position-selector"
      className="flex items-center bg-zinc-950/90 border border-zinc-800 rounded-xl p-0.5 shrink-0 shadow-inner"
      title="Dock Library Position (Left Bar / Bottom Bar / Right Bar)"
    >
      {!compact && (
        <span className="text-[10px] text-zinc-400 font-semibold px-1.5 hidden sm:inline">
          Dock:
        </span>
      )}
      <button
        id="btn-dock-left"
        type="button"
        onClick={() => onChangePosition?.('left')}
        title="Dock Library to Left Bar"
        className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
          position === 'left'
            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
        }`}
      >
        <PanelLeft className="w-3.5 h-3.5" />
        <span className={compact ? 'hidden md:inline text-[10px]' : 'text-[11px]'}>Left</span>
      </button>

      <button
        id="btn-dock-bottom"
        type="button"
        onClick={() => onChangePosition?.('bottom')}
        title="Dock Library to Bottom Bar"
        className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
          position === 'bottom'
            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
        }`}
      >
        <PanelBottom className="w-3.5 h-3.5" />
        <span className={compact ? 'hidden md:inline text-[10px]' : 'text-[11px]'}>Bottom</span>
      </button>

      <button
        id="btn-dock-right"
        type="button"
        onClick={() => onChangePosition?.('right')}
        title="Dock Library to Right Bar"
        className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
          position === 'right'
            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
        }`}
      >
        <PanelRight className="w-3.5 h-3.5" />
        <span className={compact ? 'hidden md:inline text-[10px]' : 'text-[11px]'}>Right</span>
      </button>
    </div>
  );

  // =========================================================================
  // VERTICAL SIDEBAR LAYOUT (Left or Right)
  // =========================================================================
  if (position === 'left' || position === 'right') {
    // Minimized Vertical Strip
    if (isMinimized) {
      return (
        <aside
          id={`design-library-${position}-minimized`}
          aria-label={`Architectural design library (${position} bar minimized)`}
          className="w-12 h-full bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl md:rounded-3xl py-3 flex flex-col items-center justify-between shrink-0 select-none z-20 shadow-2xl transition-all duration-200"
        >
          {/* Top: Expand button */}
          <button
            id="btn-expand-library-sidebar"
            onClick={onToggleMinimize}
            title="Expand Design Library (B)"
            className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 border border-amber-300 text-zinc-950 flex items-center justify-center transition shadow-md shadow-amber-500/30 cursor-pointer"
          >
            {position === 'left' ? <ChevronRight className="w-4 h-4 stroke-[2.5]" /> : <ChevronLeft className="w-4 h-4 stroke-[2.5]" />}
          </button>

          {/* Middle: Vertical Title & Category Badge */}
          <div
            onClick={onToggleMinimize}
            className="flex flex-col items-center gap-3 cursor-pointer py-4 group"
            title="Click to expand Design Library"
          >
            <div
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase group-hover:text-white transition whitespace-nowrap"
            >
              DESIGN LIBRARY
            </div>
            <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-950/80 px-1.5 py-1 rounded-md border border-indigo-700/40 text-center leading-tight">
              {currentCategory.slice(0, 4)}
            </span>
          </div>

          {/* Bottom: Dock Position switcher icons */}
          <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-zinc-800/80">
            <button
              onClick={() => onChangePosition?.('bottom')}
              title="Switch to Bottom Bar Dock"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <PanelBottom className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangePosition?.(position === 'left' ? 'right' : 'left')}
              title={position === 'left' ? 'Switch to Right Bar' : 'Switch to Left Bar'}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              {position === 'left' ? <PanelRight className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
            </button>
          </div>
        </aside>
      );
    }

    // Expanded Vertical Sidebar
    return (
      <aside
        id={`design-library-${position}-bar`}
        aria-label={`Architectural design library (${position} bar)`}
        className="w-72 sm:w-80 h-full bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl p-3 flex flex-col shrink-0 select-none z-20 shadow-2xl gap-2.5 transition-all duration-200 overflow-hidden"
      >
        {/* Header: Title + Dock Position Switcher + Minimize */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold tracking-wider text-zinc-200 uppercase truncate">
              Design Library
            </span>
            <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-700/40 shrink-0">
              {items.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Left / Bottom / Right Dock Buttons */}
            {renderDockPositionControls(true)}

            {/* Minimize Button */}
            {onToggleMinimize && (
              <button
                id="btn-minimize-library-sidebar"
                onClick={onToggleMinimize}
                title="Minimize Library Sidebar (B)"
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold border border-amber-300 shadow-md shadow-amber-500/25 transition-all duration-150 active:scale-95 cursor-pointer"
              >
                {position === 'left' ? (
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>Hide</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Selector Dropdown & Filter */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Category:</span>
            <span className="text-[10px] text-zinc-400 truncate max-w-[170px]">{CATEGORY_HELP[currentCategory]}</span>
          </div>
          <select
            id="select-library-category"
            value={currentCategory}
            onChange={(e) => onSelectCategory(e.target.value as CategoryName)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-inner"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({CATEGORY_COUNTS[cat] ?? 0})
              </option>
            ))}
          </select>
        </div>

        {/* Category Quick Pills Horizontal Scroll */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition shrink-0 ${
                cat === currentCategory
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 bg-zinc-950/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Filter Input inside category */}
        <div className="relative flex items-center">
          <Search className="w-3 h-3 absolute left-2.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder={`Filter ${currentCategory}...`}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 bg-zinc-950/90 border border-zinc-800/90 rounded-lg text-zinc-200 placeholder-zinc-500 text-[11px] focus:outline-none focus:border-indigo-500"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2 text-zinc-400 hover:text-white text-[10px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* 2-Column Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2 scrollbar-thin scrollbar-thumb-zinc-700">
          {items.map((item) => (
            <div
              key={`${item.category}_${item.kind}_${item.name}`}
              id={`lib-item-${item.kind}-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              draggable
              onDragStart={(e) => onDragStartItem(item, e)}
              onClick={() => onPlaceItem(item)}
              onTouchStart={(e) => handleCardTouchStart(item, e)}
              onTouchMove={handleCardTouchMove}
              onTouchEnd={handleCardTouchEnd}
              onTouchCancel={handleCardTouchCancel}
              title={`Click to place or drag onto canvas: ${item.name} (${item.description})`}
              className="group relative flex flex-col items-center justify-between p-2 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 hover:border-indigo-500/80 shadow-md cursor-grab active:cursor-grabbing transition duration-150 touch-manipulation select-none"
            >
              {/* Mobile Drag Badge */}
              <div className="absolute top-1.5 right-1.5 sm:hidden pointer-events-none">
                <span className="text-[8px] font-bold bg-indigo-950/90 text-indigo-300 px-1 py-0.5 rounded border border-indigo-700/60">
                  Drag
                </span>
              </div>

              {/* Preview Box */}
              <div className="w-full h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-inner relative border border-zinc-300/40">
                <svg
                  viewBox={`-${item.defaultWidth / 2 + 10} -${item.defaultHeight / 2 + 10} ${
                    item.defaultWidth + 20
                  } ${item.defaultHeight + 20}`}
                  className="w-full h-full max-h-14"
                >
                  <ArchSymbolGraphic kind={item.kind} w={item.defaultWidth} h={item.defaultHeight} preview name={item.name} />
                </svg>
                <div className="absolute inset-0 bg-indigo-600/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-indigo-600 text-white rounded-full p-1 shadow-md shadow-indigo-600/40">
                    <Plus className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Card Label */}
              <div className="text-center w-full mt-1.5">
                <div className="text-xs font-semibold text-zinc-200 truncate group-hover:text-indigo-400 transition-colors">
                  {item.name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {item.defaultWidth} × {item.defaultHeight}px
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-2 py-8 text-center text-xs text-zinc-500">
              No items matching "{filterQuery}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-500 text-center">
          Click or drag item to place on floor plan
        </div>
      </aside>
    );
  }

  // =========================================================================
  // HORIZONTAL BOTTOM DOCK LAYOUT
  // =========================================================================

  // Minimized Sleek Bottom Bar
  if (isMinimized) {
    return (
      <footer
        id="design-library-dock-minimized"
        aria-label="Architectural design library (minimized)"
        className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl px-3 sm:px-4 py-1.5 flex items-center justify-between shrink-0 select-none z-20 shadow-xl gap-3 transition-all duration-200"
      >
        {/* Left: Quick Label & Status */}
        <div
          onClick={onToggleMinimize}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Click to expand Design Library (B)"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
            <PanelBottomOpen className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-zinc-300 uppercase group-hover:text-white transition">
            Design Library
          </span>
          <span className="text-zinc-600 text-xs">•</span>
          <span className="text-xs text-indigo-300 font-semibold bg-indigo-950/70 px-2 py-0.5 rounded-lg border border-indigo-700/40">
            {currentCategory} ({items.length} items)
          </span>
        </div>

        {/* Center: Dock Position Switcher */}
        <div className="flex items-center">
          {renderDockPositionControls(false)}
        </div>

        {/* Right: Quick category jump pills & Expand Button */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto max-w-sm">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  onToggleMinimize?.();
                }}
                title={`Switch to ${cat} and expand`}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                  cat === currentCategory
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            id="btn-expand-library-dock"
            onClick={onToggleMinimize}
            title="Expand Design Library (B)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/30 border border-amber-300 transition active:scale-95 cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Expand Library</span>
          </button>
        </div>
      </footer>
    );
  }

  // Expanded Horizontal Bottom Dock
  return (
    <footer
      id="design-library-dock"
      aria-label="Architectural design library"
      className="bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl p-2 sm:p-2.5 md:p-3 flex flex-col shrink-0 select-none z-20 shadow-2xl gap-1.5 sm:gap-2 transition-all duration-200"
    >
      {/* Mobile Top Drag Indicator Bar */}
      <div className="w-10 h-1 rounded-full bg-zinc-700/80 mx-auto -mt-0.5 mb-0.5 sm:hidden" />

      {/* Mobile Quick Controls: Drag Tip & Grid Toggle */}
      <div className="flex sm:hidden items-center justify-between px-1 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
          <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Drag up to canvas or tap to insert</span>
        </span>
        <button
          type="button"
          onClick={() => setMobileGridMode((v) => !v)}
          title={mobileGridMode ? 'Switch to horizontal row view' : 'Switch to expanded grid view'}
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 text-[10px] font-semibold active:scale-95 transition"
        >
          {mobileGridMode ? <Rows3 className="w-3 h-3 text-indigo-400" /> : <LayoutGrid className="w-3 h-3 text-indigo-400" />}
          <span>{mobileGridMode ? 'Row View' : 'Grid View'}</span>
        </button>
      </div>

      {/* Category Tabs & Title Header */}
      <div className="px-1 sm:px-2 py-1 flex flex-wrap items-center justify-between border-b border-zinc-800/80 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
            Design Library
          </span>
          <span className="hidden sm:inline text-xs text-zinc-600">•</span>
          <span className="hidden sm:inline text-xs text-zinc-400 font-medium">
            {CATEGORY_HELP[currentCategory]}
          </span>
        </div>

        {/* Center: Left / Bottom / Right Dock Position buttons */}
        <div className="flex items-center">
          {renderDockPositionControls(false)}
        </div>

        {/* Category Radio/Tabs + Minimize Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = cat === currentCategory;
            return (
              <button
                key={cat}
                id={`cat-tab-${cat.toLowerCase()}`}
                onClick={() => onSelectCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition whitespace-nowrap touch-manipulation ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <div className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block" />

          {/* Color Minimize Button for Easy Visibility */}
          {onToggleMinimize && (
            <button
              id="btn-minimize-library-dock"
              onClick={onToggleMinimize}
              title="Minimize Design Library for maximum canvas view (B)"
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 border border-amber-300 shadow-md shadow-amber-500/25 transition-all duration-150 active:scale-95 shrink-0 ml-auto sm:ml-0 cursor-pointer touch-manipulation"
            >
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              <span>Minimize</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards Scroll Area */}
      <div className="relative flex items-center px-1">
        {/* Scroll Left Button (hidden in grid mode) */}
        {!mobileGridMode && (
          <button
            onClick={() => scroll('left')}
            title="Scroll library left"
            className="absolute left-0 z-10 w-7 h-16 bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl hidden sm:flex items-center justify-center text-zinc-300 hover:text-white shadow-xl transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Horizontal Items Carousel or Mobile Grid */}
        <div
          ref={scrollRef}
          className={
            mobileGridMode
              ? 'grid grid-cols-2 xs:grid-cols-3 sm:flex max-h-64 sm:max-h-none overflow-y-auto sm:overflow-x-auto gap-2.5 px-1 sm:px-9 py-1 scrollbar-thin scrollbar-thumb-zinc-700 w-full'
              : 'flex items-center gap-3 overflow-x-auto px-1 sm:px-9 py-1 scrollbar-thin scrollbar-thumb-zinc-700 w-full'
          }
        >
          {items.map((item) => (
            <div
              key={`${item.category}_${item.kind}_${item.name}`}
              id={`lib-item-${item.kind}-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              draggable
              onDragStart={(e) => onDragStartItem(item, e)}
              onClick={() => onPlaceItem(item)}
              onTouchStart={(e) => handleCardTouchStart(item, e)}
              onTouchMove={handleCardTouchMove}
              onTouchEnd={handleCardTouchEnd}
              onTouchCancel={handleCardTouchCancel}
              title={`Click to place or drag onto canvas: ${item.name} (${item.description})`}
              className={`group relative flex flex-col items-center justify-between p-2 rounded-2xl bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 hover:border-indigo-500/80 shadow-md cursor-grab active:cursor-grabbing transition duration-150 shrink-0 touch-manipulation select-none ${
                mobileGridMode ? 'w-full h-28' : 'w-36 h-28'
              }`}
            >
              {/* Mobile Drag Badge */}
              <div className="absolute top-1.5 right-1.5 sm:hidden pointer-events-none">
                <span className="text-[8px] font-bold bg-indigo-950/90 text-indigo-300 px-1 py-0.5 rounded border border-indigo-700/60">
                  Drag
                </span>
              </div>

              {/* Preview Canvas Box */}
              <div className="w-full h-14 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-inner relative border border-zinc-300/40">
                <svg
                  viewBox={`-${item.defaultWidth / 2 + 10} -${item.defaultHeight / 2 + 10} ${
                    item.defaultWidth + 20
                  } ${item.defaultHeight + 20}`}
                  className="w-full h-full max-h-12"
                >
                  <ArchSymbolGraphic kind={item.kind} w={item.defaultWidth} h={item.defaultHeight} preview name={item.name} />
                </svg>
                {/* Hover insert indicator */}
                <div className="absolute inset-0 bg-indigo-600/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-indigo-600 text-white rounded-full p-1 shadow-md shadow-indigo-600/40">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Card Label & Description */}
              <div className="text-center w-full mt-1">
                <div className="text-xs font-semibold text-zinc-200 truncate group-hover:text-indigo-400 transition-colors">
                  {item.name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Right Button (hidden in grid mode) */}
        {!mobileGridMode && (
          <button
            onClick={() => scroll('right')}
            title="Scroll library right"
            className="absolute right-0 z-10 w-7 h-16 bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl hidden sm:flex items-center justify-center text-zinc-300 hover:text-white shadow-xl transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </footer>
  );
};

export const DesignLibrary = React.memo(DesignLibraryComponent);
