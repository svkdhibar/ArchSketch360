import React from 'react';

interface SubSymbolProps {
  kind: string;
  w: number;
  h: number;
  stroke: string;
  sw: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  halfW: number;
  halfH: number;
}

export const renderFurniture = ({
  kind,
  w,
  h,
  stroke,
  sw,
  x1,
  y1,
  x2,
  y2,
  halfW,
  halfH,
}: SubSymbolProps): React.ReactElement | null => {
  switch (kind) {
    case 'sofa': {
      const armW = w * 0.12;
      return (
        <g id="symbol-sofa">
          {/* Main seating base */}
          <rect x={x1} y={y1 + h * 0.22} width={w} height={h * 0.78} rx={6} fill="#e5dfd5" stroke={stroke} strokeWidth={sw} />
          {/* Backrest bolster */}
          <rect x={x1 + 4} y={y1} width={w - 8} height={h * 0.3} rx={4} fill="#d4cac0" stroke={stroke} strokeWidth={sw} />
          {/* Armrests */}
          <rect x={x1} y={y1} width={armW} height={h} rx={4} fill="#c8bcaf" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - armW} y={y1} width={armW} height={h} rx={4} fill="#c8bcaf" stroke={stroke} strokeWidth={sw} />
          {/* 3 Seating Cushions */}
          <rect x={x1 + armW + 3} y={y1 + h * 0.28} width={(w - armW * 2 - 12) / 3} height={h * 0.65} rx={3} fill="#f5f0eb" stroke={stroke} strokeWidth={1} />
          <rect x={x1 + armW + 6 + (w - armW * 2 - 12) / 3} y={y1 + h * 0.28} width={(w - armW * 2 - 12) / 3} height={h * 0.65} rx={3} fill="#f5f0eb" stroke={stroke} strokeWidth={1} />
          <rect x={x2 - armW - 3 - (w - armW * 2 - 12) / 3} y={y1 + h * 0.28} width={(w - armW * 2 - 12) / 3} height={h * 0.65} rx={3} fill="#f5f0eb" stroke={stroke} strokeWidth={1} />
          {/* Throw pillows on sides */}
          <rect x={x1 + armW + 4} y={y1 + h * 0.1} width={14} height={14} rx={2} transform={`rotate(15 ${x1 + armW + 11} ${y1 + h * 0.1 + 7})`} fill="#cbd5e1" stroke={stroke} strokeWidth={0.8} />
          <rect x={x2 - armW - 18} y={y1 + h * 0.1} width={14} height={14} rx={2} transform={`rotate(-15 ${x2 - armW - 11} ${y1 + h * 0.1 + 7})`} fill="#cbd5e1" stroke={stroke} strokeWidth={0.8} />
        </g>
      );
    }

    case 'armchair': {
      const armW = w * 0.18;
      return (
        <g id="symbol-armchair">
          <rect x={x1} y={y1 + h * 0.18} width={w} height={h * 0.82} rx={8} fill="#e5dfd5" stroke={stroke} strokeWidth={sw} />
          <rect x={x1 + 4} y={y1} width={w - 8} height={h * 0.28} rx={6} fill="#d4cac0" stroke={stroke} strokeWidth={sw} />
          <rect x={x1} y={y1} width={armW} height={h} rx={5} fill="#c8bcaf" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - armW} y={y1} width={armW} height={h} rx={5} fill="#c8bcaf" stroke={stroke} strokeWidth={sw} />
          <rect x={x1 + armW + 3} y={y1 + h * 0.25} width={w - armW * 2 - 6} height={h * 0.68} rx={5} fill="#f5f0eb" stroke={stroke} strokeWidth={1} />
        </g>
      );
    }

    case 'lsofa': {
      return (
        <g id="symbol-lsofa">
          <path
            d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y1 + h * 0.52} L ${x1 + w * 0.44} ${y1 + h * 0.52} L ${x1 + w * 0.44} ${y2} L ${x1} ${y2} Z`}
            fill="#e5dfd5"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Backrest along top and left perimeter */}
          <path
            d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y1 + 18} L ${x1 + 18} ${y1 + 18} L ${x1 + 18} ${y2} L ${x1} ${y2} Z`}
            fill="#c8bcaf"
            stroke={stroke}
            strokeWidth={1.2}
          />
          {/* Cushion divisions */}
          <line x1={0} y1={y1 + 18} x2={0} y2={y1 + h * 0.52} stroke={stroke} strokeWidth={1} strokeDasharray="3 2" />
          <line x1={x1 + 18} y1={0} x2={x1 + w * 0.44} y2={0} stroke={stroke} strokeWidth={1} strokeDasharray="3 2" />
          {/* Corner throw pillows */}
          <rect x={x1 + 22} y={y1 + 22} width={14} height={14} rx={2} fill="#cbd5e1" stroke={stroke} strokeWidth={0.8} />
          <rect x={x2 - 26} y={y1 + 20} width={14} height={14} rx={2} fill="#cbd5e1" stroke={stroke} strokeWidth={0.8} />
        </g>
      );
    }

    case 'coffee_table': {
      return (
        <g id="symbol-coffee-table">
          {/* Floor area rug */}
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#f1ece4" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
          {/* Central coffee table top */}
          <rect x={x1 + 14} y={y1 + 10} width={w - 28} height={h - 20} rx={5} fill="#e2d9cc" stroke={stroke} strokeWidth={sw} />
          {/* Decorative tray & book */}
          <rect x={-14} y={-8} width={28} height={16} rx={2} fill="#ffffff" stroke="#64748b" strokeWidth={0.8} />
          <circle cx={-5} cy={0} r={3} fill="#0284c7" />
        </g>
      );
    }

    case 'bed': {
      // King bed with nightstands on left & right with lamps
      const nsW = 20;
      const bedW = w - nsW * 2 - 8;
      const bedX1 = x1 + nsW + 4;
      return (
        <g id="symbol-bed">
          {/* Left Nightstand */}
          <rect x={x1} y={y1} width={nsW} height={26} rx={3} fill="#dfd0ba" stroke={stroke} strokeWidth={sw} />
          <circle cx={x1 + nsW / 2} cy={y1 + 13} r={6} fill="#fef08a" stroke="#ca8a04" strokeWidth={1} />
          {/* Right Nightstand */}
          <rect x={x2 - nsW} y={y1} width={nsW} height={26} rx={3} fill="#dfd0ba" stroke={stroke} strokeWidth={sw} />
          <circle cx={x2 - nsW / 2} cy={y1 + 13} r={6} fill="#fef08a" stroke="#ca8a04" strokeWidth={1} />
          {/* Bed frame */}
          <rect x={bedX1} y={y1} width={bedW} height={h} rx={6} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Headboard */}
          <rect x={bedX1} y={y1} width={bedW} height={16} rx={3} fill="#475569" stroke={stroke} strokeWidth={sw} />
          {/* Pillows */}
          <rect x={bedX1 + 6} y={y1 + 20} width={bedW * 0.44} height={22} rx={4} fill="#ffffff" stroke={stroke} strokeWidth={1} />
          <rect x={bedX1 + bedW - 6 - bedW * 0.44} y={y1 + 20} width={bedW * 0.44} height={22} rx={4} fill="#ffffff" stroke={stroke} strokeWidth={1} />
          {/* Bolster */}
          <rect x={bedX1 + 14} y={y1 + 46} width={bedW - 28} height={10} rx={3} fill="#e2e8f0" stroke={stroke} strokeWidth={0.8} />
          {/* Quilt / Duvet */}
          <rect x={bedX1 + 4} y={y1 + 62} width={bedW - 8} height={h - 66} rx={4} fill="#cbd5e1" stroke={stroke} strokeWidth={1} />
          {/* Folded bed runner at bottom */}
          <rect x={bedX1 + 4} y={y2 - 26} width={bedW - 8} height={22} rx={3} fill="#94a3b8" stroke={stroke} strokeWidth={1} />
        </g>
      );
    }

    case 'bed_single': {
      const nsW = 18;
      const bedW = w - nsW - 4;
      return (
        <g id="symbol-bed-single">
          {/* Nightstand right */}
          <rect x={x2 - nsW} y={y1} width={nsW} height={24} rx={2} fill="#dfd0ba" stroke={stroke} strokeWidth={sw} />
          <circle cx={x2 - nsW / 2} cy={y1 + 12} r={5} fill="#fef08a" stroke="#ca8a04" strokeWidth={1} />
          {/* Bed */}
          <rect x={x1} y={y1} width={bedW} height={h} rx={5} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          <rect x={x1} y={y1} width={bedW} height={14} rx={2} fill="#475569" stroke={stroke} strokeWidth={sw} />
          <rect x={x1 + 8} y={y1 + 18} width={bedW - 16} height={20} rx={3} fill="#ffffff" stroke={stroke} strokeWidth={1} />
          <rect x={x1 + 4} y={y1 + 44} width={bedW - 8} height={h - 48} rx={3} fill="#cbd5e1" stroke={stroke} strokeWidth={1} />
        </g>
      );
    }

    case 'dining': {
      const tableRadius = Math.min(w, h) * 0.32;
      const chairRadius = Math.min(w, h) * 0.12;
      const dist = Math.min(w, h) * 0.42;
      return (
        <g id="symbol-dining">
          {/* Table top with wood rim */}
          <circle cx={0} cy={0} r={tableRadius} fill="#e5d5be" stroke={stroke} strokeWidth={sw + 0.5} />
          <circle cx={0} cy={0} r={tableRadius - 5} fill="none" stroke="#ca8a04" strokeWidth={1} opacity={0.6} />
          {/* Center centerpiece / floral */}
          <circle cx={0} cy={0} r={7} fill="#16a34a" />
          {/* 6 Chairs */}
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cx = Math.cos(rad) * dist;
            const cy = Math.sin(rad) * dist;
            return (
              <g key={deg} transform={`rotate(${deg + 90} ${cx} ${cy})`}>
                <rect x={cx - chairRadius} y={cy - chairRadius} width={chairRadius * 2} height={chairRadius * 1.8} rx={4} fill="#f8fafc" stroke={stroke} strokeWidth={1.2} />
                <path d={`M ${cx - chairRadius + 2} ${cy + chairRadius * 0.4} Q ${cx} ${cy + chairRadius * 0.8} ${cx + chairRadius - 2} ${cy + chairRadius * 0.4}`} fill="none" stroke={stroke} strokeWidth={1.5} />
              </g>
            );
          })}
        </g>
      );
    }

    case 'dining_rect': {
      // 8-person banquet table
      const chairW = 16;
      const chairH = 14;
      return (
        <g id="symbol-dining-rect">
          {/* Table */}
          <rect x={x1 + 16} y={y1 + 16} width={w - 32} height={h - 32} rx={6} fill="#e5d5be" stroke={stroke} strokeWidth={sw} />
          {/* Center table runner */}
          <rect x={x1 + 22} y={y1 + 24} width={w - 44} height={h - 48} fill="#f8fafc" stroke="#d4cac0" strokeWidth={0.8} />
          {/* Top 3 chairs */}
          {[-w * 0.25, 0, w * 0.25].map((cx, i) => (
            <rect key={`top-${i}`} x={cx - chairW / 2} y={y1} width={chairW} height={chairH} rx={3} fill="#f8fafc" stroke={stroke} strokeWidth={1} />
          ))}
          {/* Bottom 3 chairs */}
          {[-w * 0.25, 0, w * 0.25].map((cx, i) => (
            <rect key={`bot-${i}`} x={cx - chairW / 2} y={y2 - chairH} width={chairW} height={chairH} rx={3} fill="#f8fafc" stroke={stroke} strokeWidth={1} />
          ))}
          {/* Left chair */}
          <rect x={x1} y={-chairW / 2} width={chairH} height={chairW} rx={3} fill="#f8fafc" stroke={stroke} strokeWidth={1} />
          {/* Right chair */}
          <rect x={x2 - chairH} y={-chairW / 2} width={chairH} height={chairW} rx={3} fill="#f8fafc" stroke={stroke} strokeWidth={1} />
        </g>
      );
    }

    case 'desk': {
      return (
        <g id="symbol-desk">
          {/* Desk desktop */}
          <rect x={x1} y={y1} width={w} height={h * 0.65} rx={4} fill="#eedec9" stroke={stroke} strokeWidth={sw} />
          {/* Cable grommet */}
          <circle cx={x2 - 16} cy={y1 + 12} r={3} fill="#94a3b8" />
          {/* Desk mat & laptop */}
          <rect x={-w * 0.22} y={y1 + 6} width={w * 0.44} height={h * 0.4} rx={2} fill="#334155" stroke="#0f172a" strokeWidth={1} />
          <rect x={-w * 0.14} y={y1 + 12} width={w * 0.28} height={14} rx={1} fill="#e2e8f0" />
          {/* Swivel executive chair */}
          <circle cx={0} cy={y2 - h * 0.18} r={h * 0.18} fill="#94a3b8" stroke={stroke} strokeWidth={sw} />
          <path d={`M ${-w * 0.14} ${y2 - 4} A ${w * 0.14} ${w * 0.14} 0 0 1 ${w * 0.14} ${y2 - 4}`} fill="none" stroke={stroke} strokeWidth={2} />
        </g>
      );
    }

    case 'wardrobe': {
      return (
        <g id="symbol-wardrobe">
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#dfd0ba" stroke={stroke} strokeWidth={sw} />
          {/* Outer frame & sliding door guides */}
          <line x1={0} y1={y1} x2={0} y2={y2} stroke={stroke} strokeWidth={sw} />
          {/* Hanging rail inside */}
          <line x1={x1 + 6} y1={0} x2={x2 - 6} y2={0} stroke="#94a3b8" strokeWidth={1.5} />
          {/* Hangers icons */}
          {[-w * 0.35, -w * 0.15, w * 0.15, w * 0.35].map((hx, i) => (
            <path key={i} d={`M ${hx - 8} 4 L ${hx} -4 L ${hx + 8} 4 Z`} fill="none" stroke="#475569" strokeWidth={1} />
          ))}
          <circle cx={-8} cy={-h * 0.3} r={2} fill="#ca8a04" />
          <circle cx={8} cy={-h * 0.3} r={2} fill="#ca8a04" />
        </g>
      );
    }

    case 'bookshelf': {
      // Architectural bookshelf / joinery display unit
      return (
        <g id="symbol-bookshelf">
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#dfd0ba" stroke={stroke} strokeWidth={sw} />
          {/* Shelf divider lines */}
          <line x1={-w * 0.2} y1={y1} x2={-w * 0.2} y2={y2} stroke={stroke} strokeWidth={1} />
          <line x1={w * 0.2} y1={y1} x2={w * 0.2} y2={y2} stroke={stroke} strokeWidth={1} />
          {/* Book spine groupings */}
          <rect x={x1 + 6} y={y1 + 3} width={w * 0.2} height={h - 6} fill="#94a3b8" stroke="#475569" strokeWidth={0.8} />
          <rect x={-w * 0.15} y={y1 + 3} width={w * 0.3} height={h - 6} fill="#cbd5e1" stroke="#475569" strokeWidth={0.8} />
          <rect x={w * 0.25} y={y1 + 3} width={w * 0.18} height={h - 6} fill="#94a3b8" stroke="#475569" strokeWidth={0.8} />
        </g>
      );
    }

    case 'tv': {
      return (
        <g id="symbol-tv">
          {/* Console base */}
          <rect x={x1} y={y1 + h * 0.25} width={w} height={h * 0.75} rx={3} fill="#e2e8f0" stroke={stroke} strokeWidth={sw} />
          {/* Thin soundbar */}
          <rect x={-w * 0.2} y={y1 + h * 0.35} width={w * 0.4} height={6} rx={1} fill="#475569" />
          {/* TV panel */}
          <rect x={x1 + 6} y={y1} width={w - 12} height={h * 0.26} rx={2} fill="#0f172a" stroke={stroke} strokeWidth={1.5} />
          <line x1={x1 + 14} y1={y1 + h * 0.13} x2={x2 - 14} y2={y1 + h * 0.13} stroke="#38bdf8" strokeWidth={1} />
        </g>
      );
    }

    case 'sofa_u': {
      // U-shaped modular sectional sofa with center ottoman
      const arm = w * 0.22;
      return (
        <g id="symbol-sofa-u">
          {/* U-Shape backrest */}
          <path
            d={`M ${x1} ${y2} L ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x2 - arm} ${y2} L ${x2 - arm} ${y1 + h * 0.32} L ${x1 + arm} ${y1 + h * 0.32} L ${x1 + arm} ${y2} Z`}
            fill="#e5dfd5"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Cushions */}
          <rect x={x1 + arm + 4} y={y1 + 4} width={w - arm * 2 - 8} height={h * 0.28} rx={3} fill="#f5f0eb" stroke={stroke} strokeWidth={1} />
          <rect x={x1 + 4} y={y1 + h * 0.32 + 4} width={arm - 8} height={h * 0.6} rx={3} fill="#f5f0eb" stroke={stroke} strokeWidth={1} />
          <rect x={x2 - arm + 4} y={y1 + h * 0.32 + 4} width={arm - 8} height={h * 0.6} rx={3} fill="#f5f0eb" stroke={stroke} strokeWidth={1} />
          {/* Coffee Table / Ottoman in center well */}
          <rect x={-w * 0.16} y={y1 + h * 0.44} width={w * 0.32} height={h * 0.36} rx={4} fill="#dfd0ba" stroke={stroke} strokeWidth={sw} />
        </g>
      );
    }

    case 'chaise_lounge': {
      // Designer chaise lounge with sloped back and cushion
      return (
        <g id="symbol-chaise-lounge">
          <rect x={x1} y={y1} width={w} height={h} rx={6} fill="#e5dfd5" stroke={stroke} strokeWidth={sw} />
          {/* Headrest bolster cushion */}
          <rect x={x1 + 4} y={y1 + 4} width={w * 0.25} height={h - 8} rx={4} fill="#c8bcaf" stroke={stroke} strokeWidth={sw} />
          {/* Tufted seams */}
          <line x1={x1 + w * 0.45} y1={y1 + 6} x2={x1 + w * 0.45} y2={y2 - 6} stroke={stroke} strokeWidth={1} strokeDasharray="3 3" />
          <line x1={x1 + w * 0.7} y1={y1 + 6} x2={x1 + w * 0.7} y2={y2 - 6} stroke={stroke} strokeWidth={1} strokeDasharray="3 3" />
        </g>
      );
    }

    case 'bed_bunk': {
      // Twin bunk bed with structural posts & ladder
      return (
        <g id="symbol-bed-bunk">
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#f1f5f9" stroke={stroke} strokeWidth={sw} />
          {/* Corner structural timber posts */}
          <rect x={x1} y={y1} width={8} height={8} fill="#475569" stroke={stroke} strokeWidth={1} />
          <rect x={x2 - 8} y={y1} width={8} height={8} fill="#475569" stroke={stroke} strokeWidth={1} />
          <rect x={x1} y={y2 - 8} width={8} height={8} fill="#475569" stroke={stroke} strokeWidth={1} />
          <rect x={x2 - 8} y={y2 - 8} width={8} height={8} fill="#475569" stroke={stroke} strokeWidth={1} />
          {/* Pillows */}
          <rect x={x1 + 12} y={y1 + 10} width={w - 24} height={h * 0.22} rx={3} fill="#ffffff" stroke={stroke} strokeWidth={1} />
          {/* Blanket duvet fold */}
          <line x1={x1 + 6} y1={y1 + h * 0.4} x2={x2 - 6} y2={y1 + h * 0.4} stroke={stroke} strokeWidth={1.5} />
          {/* Side ladder rungs */}
          <rect x={x2 - 12} y={y1 + h * 0.45} width={10} height={h * 0.45} fill="#e2e8f0" stroke={stroke} strokeWidth={1} />
          {Array.from({ length: 4 }).map((_, i) => (
            <line key={i} x1={x2 - 12} y1={y1 + h * 0.45 + (i + 1) * (h * 0.09)} x2={x2 - 2} y2={y1 + h * 0.45 + (i + 1) * (h * 0.09)} stroke={stroke} strokeWidth={1.2} />
          ))}
          <text x={0} y={y2 - 12} textAnchor="middle" fontSize={8} fill="#64748b" fontWeight="bold">BUNK BED</text>
        </g>
      );
    }

    case 'bed_crib': {
      // Nursery crib with slatted perimeter rails and mobile
      return (
        <g id="symbol-bed-crib">
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#fdf4ff" stroke={stroke} strokeWidth={sw} />
          {/* Mattress */}
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={h - 12} rx={3} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1} />
          {/* Slats */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={x1 + 12 + i * ((w - 24) / 6)} y1={y1} x2={x1 + 12 + i * ((w - 24) / 6)} y2={y1 + 6} stroke={stroke} strokeWidth={1} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={x1 + 12 + i * ((w - 24) / 6)} y1={y2 - 6} x2={x1 + 12 + i * ((w - 24) / 6)} y2={y2} stroke={stroke} strokeWidth={1} />
          ))}
          {/* Soft baby pillow */}
          <rect x={x1 + 10} y={y1 + 10} width={w - 20} height={h * 0.24} rx={3} fill="#fbcfe8" stroke="#f472b6" strokeWidth={1} />
          <circle cx={0} cy={y1 + h * 0.6} r={8} fill="#e9d5ff" stroke="#c084fc" strokeWidth={1} />
        </g>
      );
    }

    case 'piano_grand': {
      // Grand Piano with elegant curved soundboard casing, keyboard & bench
      return (
        <g id="symbol-piano-grand">
          {/* Grand piano wing contour */}
          <path
            d={`M ${x1} ${y1 + h * 0.25} L ${x1} ${y2 - 8} Q ${x1 + w * 0.4} ${y2} ${x1 + w * 0.7} ${y2 - 12} Q ${x2} ${y2 - 24} ${x2} ${y1 + h * 0.5} Q ${x2} ${y1 + h * 0.2} ${x1 + w * 0.5} ${y1 + h * 0.2} L ${x1 + w * 0.1} ${y1 + h * 0.2} L ${x1 + w * 0.1} ${y1 + h * 0.25} Z`}
            fill="#0f172a"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Soundboard strings gold */}
          <path
            d={`M ${x1 + 10} ${y1 + h * 0.28} L ${x1 + 10} ${y2 - 18} Q ${x1 + w * 0.4} ${y2 - 10} ${x1 + w * 0.65} ${y2 - 20} Q ${x2 - 10} ${y2 - 30} ${x2 - 10} ${y1 + h * 0.5} Z`}
            fill="#ca8a04"
            opacity={0.3}
          />
          {/* Piano Keys Keyboard */}
          <rect x={x1} y={y1} width={w * 0.6} height={h * 0.22} fill="#ffffff" stroke={stroke} strokeWidth={1.5} />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={x1 + (i + 1) * ((w * 0.6) / 10)} y1={y1} x2={x1 + (i + 1) * ((w * 0.6) / 10)} y2={y1 + h * 0.22} stroke={stroke} strokeWidth={0.8} />
          ))}
          {/* Black keys */}
          {[1, 2, 4, 5, 6, 8].map((k) => (
            <rect key={k} x={x1 + k * ((w * 0.6) / 10) - 2} y={y1} width={4} height={h * 0.13} fill="#0f172a" />
          ))}
          {/* Piano Bench */}
          <rect x={x1 + w * 0.1} y={y1 - 18} width={w * 0.4} height={12} rx={2} fill="#334155" stroke={stroke} strokeWidth={1} />
        </g>
      );
    }

    case 'fireplace': {
      // Modern architectural hearth fireplace with masonry surround & flame logs
      return (
        <g id="symbol-fireplace">
          {/* Outer hearth mantle */}
          <rect x={x1} y={y1} width={w} height={h} rx={3} fill="#334155" stroke={stroke} strokeWidth={sw} />
          {/* Firebox interior */}
          <rect x={x1 + 12} y={y1 + 8} width={w - 24} height={h - 14} rx={2} fill="#0f172a" stroke="#475569" strokeWidth={1} />
          {/* Glass guard line */}
          <line x1={x1 + 16} y1={y2 - 4} x2={x2 - 16} y2={y2 - 4} stroke="#38bdf8" strokeWidth={2} />
          {/* Firewood logs */}
          <rect x={-w * 0.2} y={-4} width={w * 0.4} height={8} rx={3} fill="#78350f" stroke="#451a03" strokeWidth={1} />
          <rect x={-w * 0.15} y={-8} width={w * 0.3} height={7} rx={3} fill="#9a3412" stroke="#451a03" strokeWidth={1} />
          {/* Flames icon */}
          <path d={`M 0 -10 Q 5 -18 0 -22 Q -5 -18 0 -10 Z`} fill="#f97316" />
          <path d={`M 0 -11 Q 3 -16 0 -19 Q -3 -16 0 -11 Z`} fill="#fde047" />
        </g>
      );
    }

    case 'area_rug': {
      // Decorative geometric area rug with border fringe
      return (
        <g id="symbol-area-rug">
          {/* Fringe ends */}
          <line x1={x1} y1={y1} x2={x1} y2={y2} stroke="#94a3b8" strokeWidth={2} strokeDasharray="2 2" />
          <line x1={x2} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={2} strokeDasharray="2 2" />
          {/* Rug canvas */}
          <rect x={x1 + 3} y={y1} width={w - 6} height={h} rx={2} fill="#f1f5f9" stroke={stroke} strokeWidth={1.2} />
          {/* Inner border band */}
          <rect x={x1 + 12} y={y1 + 10} width={w - 24} height={h - 20} fill="none" stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" />
          {/* Center medallion diamond */}
          <polygon
            points={`0,${-halfH + 20} ${halfW - 25},0 0,${halfH - 20} ${-halfW + 25},0`}
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth={1}
          />
        </g>
      );
    }

    case 'sideboard': {
      // Long dining credenza / sideboard with drawers & brass handles
      return (
        <g id="symbol-sideboard">
          <rect x={x1} y={y1} width={w} height={h} rx={3} fill="#dfd0ba" stroke={stroke} strokeWidth={sw} />
          {/* 3 Drawer / Cabinet fronts */}
          <line x1={-w * 0.16} y1={y1} x2={-w * 0.16} y2={y2} stroke={stroke} strokeWidth={1} />
          <line x1={w * 0.16} y1={y1} x2={w * 0.16} y2={y2} stroke={stroke} strokeWidth={1} />
          {/* Brass drawer pulls */}
          <rect x={-w * 0.32} y={y2 - 6} width={w * 0.12} height={3} rx={1} fill="#ca8a04" />
          <rect x={-w * 0.06} y={y2 - 6} width={w * 0.12} height={3} rx={1} fill="#ca8a04" />
          <rect x={w * 0.2} y={y2 - 6} width={w * 0.12} height={3} rx={1} fill="#ca8a04" />
        </g>
      );
    }

    case 'recreation_pool_table': {
      // 8-Ball regulation pool / billiard table with corner pockets & cues
      return (
        <g id="symbol-pool-table">
          {/* Hardwood rail frame */}
          <rect x={x1} y={y1} width={w} height={h} rx={6} fill="#78350f" stroke={stroke} strokeWidth={sw} />
          {/* Green baize cloth playing surface */}
          <rect x={x1 + 10} y={y1 + 10} width={w - 20} height={h - 20} rx={3} fill="#15803d" stroke="#14532d" strokeWidth={1.5} />
          {/* 6 Pockets */}
          <circle cx={x1 + 11} cy={y1 + 11} r={6} fill="#0f172a" />
          <circle cx={x2 - 11} cy={y1 + 11} r={6} fill="#0f172a" />
          <circle cx={x1 + 11} cy={y2 - 11} r={6} fill="#0f172a" />
          <circle cx={x2 - 11} cy={y2 - 11} r={6} fill="#0f172a" />
          <circle cx={0} cy={y1 + 9} r={5} fill="#0f172a" />
          <circle cx={0} cy={y2 - 9} r={5} fill="#0f172a" />
          {/* White cue ball & racked balls */}
          <circle cx={-w * 0.25} cy={0} r={3} fill="#ffffff" stroke="#cbd5e1" strokeWidth={0.5} />
          <polygon points={`${w * 0.18},-8 ${w * 0.32},0 ${w * 0.18},8`} fill="none" stroke="#facc15" strokeWidth={1} />
          <circle cx={w * 0.22} cy={0} r={3} fill="#ef4444" />
          <circle cx={w * 0.28} cy={-3} r={3} fill="#3b82f6" />
          <circle cx={w * 0.28} cy={3} r={3} fill="#0f172a" />
        </g>
      );
    }

    case 'gaming_table': {
      // Table Tennis / Ping Pong table with center net, boundary lines, bats on both sides, and ball on the right
      const renderBat = (bx: number, by: number, angle: number, rubberColor: string, id: string) => (
        <g key={id} id={id} transform={`translate(${bx}, ${by}) rotate(${angle})`}>
          {/* Handle drop shadow */}
          <rect x={-1.5} y={5} width={4} height={9} rx={1} fill="#0f172a" opacity={0.3} />
          {/* Wood grip handle */}
          <rect x={-2} y={4.5} width={4} height={9.5} rx={1} fill="#d97706" stroke="#92400e" strokeWidth={0.6} />
          <line x1={0} y1={5.5} x2={0} y2={13} stroke="#b45309" strokeWidth={0.8} />
          {/* Neck collar band */}
          <rect x={-2.2} y={3.8} width={4.4} height={1.4} rx={0.5} fill="#334155" />
          {/* Blade head shadow */}
          <ellipse cx={0.8} cy={-3.2} rx={6.7} ry={7.7} fill="#0f172a" opacity={0.3} />
          {/* Paddle rubber surface */}
          <ellipse cx={0} cy={-4} rx={6.5} ry={7.5} fill={rubberColor} stroke="#ffffff" strokeWidth={0.6} />
          <ellipse cx={0} cy={-4} rx={6.5} ry={7.5} fill="none" stroke={rubberColor === '#dc2626' ? '#991b1b' : '#0f172a'} strokeWidth={0.5} />
        </g>
      );

      return (
        <g id="symbol-gaming-table">
          {/* Blue top surface */}
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#1d4ed8" stroke={stroke} strokeWidth={sw} />
          {/* White boundary border */}
          <rect x={x1 + 3} y={y1 + 3} width={w - 6} height={h - 6} fill="none" stroke="#ffffff" strokeWidth={1.5} />
          {/* Center line */}
          <line x1={x1 + 3} y1={0} x2={x2 - 3} y2={0} stroke="#ffffff" strokeWidth={1.2} />

          {/* Left Side: Two Table Tennis Bats (Top court red, bottom court black) */}
          {renderBat(w * -0.27, h * -0.23, -25, '#dc2626', 'bat-left-top')}
          {renderBat(w * -0.25, h * 0.23, 30, '#1e293b', 'bat-left-bottom')}

          {/* Right Side: Two Table Tennis Bats (Top court red, bottom court black) */}
          {renderBat(w * 0.22, h * -0.24, 25, '#dc2626', 'bat-right-top')}
          {renderBat(w * 0.24, h * 0.24, -30, '#1e293b', 'bat-right-bottom')}

          {/* Right Side: Single Table Tennis Ball in the right court */}
          <g id="table-tennis-ball" transform={`translate(${w * 0.36}, ${h * 0.1})`}>
            <ellipse cx={0.6} cy={1} rx={3} ry={1.8} fill="#0f172a" opacity={0.35} />
            <circle cx={0} cy={0} r={3} fill="#ffffff" stroke="#cbd5e1" strokeWidth={0.6} />
            <circle cx={-0.8} cy={-0.8} r={1} fill="#ffffff" />
          </g>

          {/* Center net with overhang */}
          <rect x={-2} y={y1 - 4} width={4} height={h + 8} fill="#ffffff" stroke="#475569" strokeWidth={1} />
          <line x1={0} y1={y1 - 4} x2={0} y2={y2 + 4} stroke="#0f172a" strokeWidth={1} strokeDasharray="2 2" />
        </g>
      );
    }

    default:
      return null;
  }
};
