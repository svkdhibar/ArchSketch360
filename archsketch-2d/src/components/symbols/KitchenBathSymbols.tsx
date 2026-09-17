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

export const renderKitchenOrBath = ({
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
    // ---------------- KITCHEN ----------------
    case 'kitchen_counter': {
      return (
        <g id="symbol-kitchen-counter">
          <rect x={x1} y={y1} width={w} height={h} fill="#cbd5e1" stroke={stroke} strokeWidth={sw} />
          {/* Double bowl sink left */}
          <rect x={x1 + w * 0.08} y={y1 + h * 0.15} width={w * 0.32} height={h * 0.7} rx={4} fill="#ffffff" stroke={stroke} strokeWidth={1.2} />
          <line x1={x1 + w * 0.24} y1={y1 + h * 0.15} x2={x1 + w * 0.24} y2={y2 - h * 0.15} stroke={stroke} strokeWidth={1} />
          <circle cx={x1 + w * 0.16} cy={0} r={3} fill="#94a3b8" />
          <circle cx={x1 + w * 0.32} cy={0} r={3} fill="#94a3b8" />
          {/* Faucet */}
          <circle cx={x1 + w * 0.24} cy={y1 + h * 0.2} r={3.5} fill="#475569" />
          {/* 4-burner cooktop right */}
          <rect x={x2 - w * 0.38} y={y1 + h * 0.15} width={w * 0.32} height={h * 0.7} rx={3} fill="#1e293b" stroke={stroke} strokeWidth={1.2} />
          <circle cx={x2 - w * 0.3} cy={y1 + h * 0.35} r={h * 0.12} fill="#334155" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={x2 - w * 0.14} cy={y1 + h * 0.35} r={h * 0.12} fill="#334155" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={x2 - w * 0.3} cy={y2 - h * 0.35} r={h * 0.12} fill="#334155" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={x2 - w * 0.14} cy={y2 - h * 0.35} r={h * 0.12} fill="#334155" stroke="#94a3b8" strokeWidth={1} />
        </g>
      );
    }

    case 'kitchen_l': {
      return (
        <g id="symbol-kitchen-l">
          <path
            d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y1 + h * 0.45} L ${x1 + w * 0.45} ${y1 + h * 0.45} L ${x1 + w * 0.45} ${y2} L ${x1} ${y2} Z`}
            fill="#cbd5e1"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Burners on top counter */}
          <circle cx={w * 0.12} cy={y1 + h * 0.22} r={10} fill="#1e293b" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={w * 0.32} cy={y1 + h * 0.22} r={10} fill="#1e293b" stroke="#94a3b8" strokeWidth={1} />
          {/* Sink on bottom leg */}
          <rect x={x1 + 8} y={y1 + h * 0.58} width={w * 0.3} height={h * 0.32} rx={3} fill="#ffffff" stroke={stroke} strokeWidth={1} />
          <circle cx={x1 + w * 0.23} cy={y1 + h * 0.74} r={3} fill="#475569" />
        </g>
      );
    }

    case 'kitchen_u': {
      return (
        <g id="symbol-kitchen-u">
          <path
            d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x2 - w * 0.34} ${y2} L ${x2 - w * 0.34} ${y1 + h * 0.45} L ${x1 + w * 0.34} ${y1 + h * 0.45} L ${x1 + w * 0.34} ${y2} L ${x1} ${y2} Z`}
            fill="#cbd5e1"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Cooktop center */}
          <circle cx={0} cy={y1 + h * 0.22} r={11} fill="#1e293b" stroke="#94a3b8" strokeWidth={1} />
          {/* Sink left */}
          <rect x={x1 + 6} y={0} width={w * 0.22} height={h * 0.34} rx={3} fill="#ffffff" stroke={stroke} strokeWidth={1} />
          {/* Prep right */}
          <rect x={x2 - w * 0.28} y={0} width={w * 0.22} height={h * 0.34} rx={2} fill="#94a3b8" />
        </g>
      );
    }

    case 'island': {
      return (
        <g id="symbol-island">
          {/* Stone countertop with overhang */}
          <rect x={x1} y={y1} width={w} height={h} rx={5} fill="#e2d9cc" stroke={stroke} strokeWidth={sw} />
          {/* Central cooktop / prep sink */}
          <rect x={-w * 0.2} y={-h * 0.25} width={w * 0.4} height={h * 0.5} rx={3} fill="#334155" stroke={stroke} strokeWidth={1} />
          <circle cx={-w * 0.08} cy={0} r={8} fill="#1e293b" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={w * 0.08} cy={0} r={8} fill="#1e293b" stroke="#94a3b8" strokeWidth={1} />
          {/* 3 Barstools with circular seats & backrests */}
          {[-w * 0.3, 0, w * 0.3].map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy={y2 - 2} r={11} fill="#ffffff" stroke={stroke} strokeWidth={1.2} />
              <path d={`M ${cx - 9} ${y2 + 2} Q ${cx} ${y2 + 8} ${cx + 9} ${y2 + 2}`} fill="none" stroke={stroke} strokeWidth={1.5} />
            </g>
          ))}
        </g>
      );
    }

    case 'sink': {
      return (
        <g id="symbol-sink">
          <rect x={x1} y={y1} width={w} height={h} rx={6} fill="#e2e8f0" stroke={stroke} strokeWidth={sw} />
          {/* Twin stainless steel basins */}
          <rect x={x1 + 6} y={y1 + 6} width={halfW - 9} height={h - 12} rx={4} fill="#ffffff" stroke={stroke} strokeWidth={1.2} />
          <rect x={3} y={y1 + 6} width={halfW - 9} height={h - 12} rx={4} fill="#ffffff" stroke={stroke} strokeWidth={1.2} />
          <circle cx={-halfW / 2} cy={0} r={3.5} fill="#94a3b8" />
          <circle cx={halfW / 2} cy={0} r={3.5} fill="#94a3b8" />
          {/* Gooseneck mixer faucet */}
          <circle cx={0} cy={y1 + 8} r={3.5} fill="#475569" />
          <line x1={0} y1={y1 + 8} x2={0} y2={y1 + 18} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    }

    case 'stove': {
      return (
        <g id="symbol-stove">
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          {/* 4 Induction/Gas burners with grates */}
          <circle cx={-halfW * 0.5} cy={-halfH * 0.5} r={Math.min(w, h) * 0.16} fill="#0f172a" stroke="#94a3b8" strokeWidth={1.5} />
          <circle cx={halfW * 0.5} cy={-halfH * 0.5} r={Math.min(w, h) * 0.16} fill="#0f172a" stroke="#94a3b8" strokeWidth={1.5} />
          <circle cx={-halfW * 0.5} cy={halfH * 0.5} r={Math.min(w, h) * 0.16} fill="#0f172a" stroke="#94a3b8" strokeWidth={1.5} />
          <circle cx={halfW * 0.5} cy={halfH * 0.5} r={Math.min(w, h) * 0.16} fill="#0f172a" stroke="#94a3b8" strokeWidth={1.5} />
          {/* Front control panel & dials */}
          <rect x={x1} y={y2 - 8} width={w} height={8} fill="#334155" />
          <circle cx={-12} cy={y2 - 4} r={2} fill="#ef4444" />
          <circle cx={-4} cy={y2 - 4} r={2} fill="#cbd5e1" />
          <circle cx={4} cy={y2 - 4} r={2} fill="#cbd5e1" />
          <circle cx={12} cy={y2 - 4} r={2} fill="#cbd5e1" />
        </g>
      );
    }

    case 'oven_tower': {
      // Tall built-in wall oven & microwave tower
      return (
        <g id="symbol-oven-tower">
          <rect x={x1} y={y1} width={w} height={h} rx={3} fill="#334155" stroke={stroke} strokeWidth={sw} />
          {/* Glass window for oven */}
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={h * 0.45} rx={2} fill="#0f172a" stroke="#94a3b8" strokeWidth={1} />
          <line x1={x1 + 10} y1={y1 + h * 0.25} x2={x2 - 10} y2={y1 + h * 0.25} stroke="#d97706" strokeWidth={1.5} />
          {/* Microwave / warming drawer lower */}
          <rect x={x1 + 6} y={y1 + h * 0.55} width={w - 12} height={h * 0.35} rx={2} fill="#475569" stroke="#94a3b8" strokeWidth={1} />
          {/* Oven handle bar */}
          <line x1={x1 + 14} y1={y1 + 10} x2={x2 - 14} y2={y1 + 10} stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    }

    case 'dishwasher': {
      return (
        <g id="symbol-dishwasher">
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#e2e8f0" stroke={stroke} strokeWidth={sw} />
          <rect x={x1 + 4} y={y1 + 4} width={w - 8} height={10} fill="#334155" />
          <circle cx={x2 - 12} cy={y1 + 9} r={2} fill="#22c55e" />
          {/* Rotating spray arm graphic */}
          <circle cx={0} cy={6} r={3} fill="#64748b" />
          <line x1={-w * 0.25} y1={6} x2={w * 0.25} y2={6} stroke="#0284c7" strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    }

    case 'fridge': {
      return (
        <g id="symbol-fridge">
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#e2e8f0" stroke={stroke} strokeWidth={sw} />
          <line x1={0} y1={y1} x2={0} y2={y2} stroke={stroke} strokeWidth={sw} />
          {/* Ice / water dispenser on left door */}
          <rect x={-w * 0.35} y={-h * 0.15} width={w * 0.2} height={h * 0.3} rx={2} fill="#94a3b8" />
          {/* Long architectural handles */}
          <line x1={-5} y1={-h * 0.28} x2={-5} y2={h * 0.28} stroke="#334155" strokeWidth={3} strokeLinecap="round" />
          <line x1={5} y1={-h * 0.28} x2={5} y2={h * 0.28} stroke="#334155" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    }

    // ---------------- BATHROOM ----------------
    case 'toilet': {
      return (
        <g id="symbol-toilet">
          {/* Water cistern / tank against wall */}
          <rect x={x1 + w * 0.12} y={y1} width={w * 0.76} height={h * 0.26} rx={3} fill="#f1f5f9" stroke={stroke} strokeWidth={sw} />
          {/* Dual flush push buttons */}
          <circle cx={-4} cy={y1 + h * 0.13} r={3} fill="#94a3b8" />
          <circle cx={4} cy={y1 + h * 0.13} r={3} fill="#cbd5e1" />
          {/* Elongated toilet bowl */}
          <ellipse cx={0} cy={y1 + h * 0.62} rx={w * 0.36} ry={h * 0.36} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          {/* Inner seat rim & water level */}
          <ellipse cx={0} cy={y1 + h * 0.65} rx={w * 0.24} ry={h * 0.24} fill="#bae6fd" stroke={stroke} strokeWidth={1} />
        </g>
      );
    }

    case 'bidet': {
      return (
        <g id="symbol-bidet">
          <ellipse cx={0} cy={0} rx={w * 0.38} ry={h * 0.44} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={0} cy={0} rx={w * 0.24} ry={h * 0.3} fill="#bae6fd" stroke={stroke} strokeWidth={1} />
          <circle cx={0} cy={-h * 0.25} r={3.5} fill="#475569" />
          <circle cx={0} cy={h * 0.15} r={3} fill="#0284c7" />
        </g>
      );
    }

    case 'urinal': {
      return (
        <g id="symbol-urinal">
          <rect x={x1 + 4} y={y1} width={w - 8} height={8} fill="#64748b" stroke={stroke} strokeWidth={1} />
          <path d={`M ${x1 + 6} ${y1 + 8} Q ${x1 + 6} ${y2} 0 ${y2} Q ${x2 - 6} ${y2} ${x2 - 6} ${y1 + 8} Z`} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          <circle cx={0} cy={0} r={4} fill="#94a3b8" />
        </g>
      );
    }

    case 'basin': {
      return (
        <g id="symbol-basin">
          <rect x={x1} y={y1} width={w} height={h} rx={5} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={0} cy={0} rx={w * 0.38} ry={h * 0.32} fill="#bae6fd" stroke={stroke} strokeWidth={1.2} />
          <circle cx={0} cy={-h * 0.24} r={3.5} fill="#475569" />
          <line x1={0} y1={-h * 0.24} x2={0} y2={-h * 0.1} stroke="#475569" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={0} cy={0} r={2.5} fill="#0284c7" />
        </g>
      );
    }

    case 'double_basin': {
      return (
        <g id="symbol-double-basin">
          <rect x={x1} y={y1} width={w} height={h} rx={5} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Left basin */}
          <ellipse cx={-w * 0.25} cy={0} rx={w * 0.18} ry={h * 0.32} fill="#bae6fd" stroke={stroke} strokeWidth={1.2} />
          <circle cx={-w * 0.25} cy={-h * 0.24} r={3} fill="#475569" />
          {/* Right basin */}
          <ellipse cx={w * 0.25} cy={0} rx={w * 0.18} ry={h * 0.32} fill="#bae6fd" stroke={stroke} strokeWidth={1.2} />
          <circle cx={w * 0.25} cy={-h * 0.24} r={3} fill="#475569" />
        </g>
      );
    }

    case 'shower': {
      return (
        <g id="symbol-shower">
          {/* Enclosure */}
          <rect x={x1} y={y1} width={w} height={h} fill="#f0fdf4" stroke={stroke} strokeWidth={sw} />
          {/* Stainless steel linear trench drain */}
          <rect x={x1 + 8} y={y2 - 12} width={w - 16} height={6} rx={1} fill="#94a3b8" stroke={stroke} strokeWidth={0.8} />
          {/* Ceiling rain showerhead */}
          <circle cx={0} cy={-h * 0.1} r={10} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.5} />
          <circle cx={0} cy={-h * 0.1} r={3} fill="#ffffff" />
          {/* Diagonal entry marker or glass door swing */}
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth={0.8} strokeDasharray="3 3" />
        </g>
      );
    }

    case 'bathtub': {
      return (
        <g id="symbol-bathtub">
          {/* Outer contour */}
          <rect x={x1} y={y1} width={w} height={h} rx={20} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Inner soaking tub bowl */}
          <ellipse cx={0} cy={0} rx={halfW - 8} ry={halfH - 8} fill="#bae6fd" stroke={stroke} strokeWidth={1.2} />
          {/* Floor mounted mixer & drain */}
          <circle cx={-halfW + 16} cy={0} r={4} fill="#475569" />
          <circle cx={halfW - 20} cy={0} r={3} fill="#0284c7" />
        </g>
      );
    }

    case 'jacuzzi': {
      return (
        <g id="symbol-jacuzzi">
          {/* Corner tub shell */}
          <rect x={x1} y={y1} width={w} height={h} rx={12} fill="#e0f2fe" stroke={stroke} strokeWidth={sw} />
          <circle cx={0} cy={0} r={Math.min(w, h) * 0.42} fill="#bae6fd" stroke="#0284c7" strokeWidth={1.5} />
          {/* 6 Hydromassage jets */}
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const jx = Math.cos(rad) * (Math.min(w, h) * 0.36);
            const jy = Math.sin(rad) * (Math.min(w, h) * 0.36);
            return <circle key={deg} cx={jx} cy={jy} r={3} fill="#0284c7" />;
          })}
          <circle cx={0} cy={0} r={5} fill="#475569" />
        </g>
      );
    }

    case 'mirror': {
      return (
        <g id="symbol-mirror">
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#bae6fd" stroke={stroke} strokeWidth={sw} />
          <line x1={-w * 0.25} y1={-h * 0.3} x2={-w * 0.15} y2={h * 0.3} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
          <line x1={w * 0.15} y1={-h * 0.3} x2={w * 0.25} y2={h * 0.3} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    }

    case 'bar_counter': {
      // Breakfast / cocktail bar counter with 4 circular barstools
      const numStools = 4;
      return (
        <g id="symbol-bar-counter">
          {/* Main solid surface bar top */}
          <rect x={x1} y={y1} width={w} height={h * 0.55} rx={3} fill="#dfd0ba" stroke={stroke} strokeWidth={sw} />
          {/* Edge overhang line */}
          <line x1={x1} y1={y1 + h * 0.45} x2={x2} y2={y1 + h * 0.45} stroke={stroke} strokeWidth={1} />
          {/* 4 Barstools lined along patron side */}
          {Array.from({ length: numStools }).map((_, i) => {
            const sx = x1 + (i + 0.5) * (w / numStools);
            const sy = y2 - h * 0.25;
            return (
              <g key={i}>
                <circle cx={sx} cy={sy} r={h * 0.22} fill="#334155" stroke={stroke} strokeWidth={1.2} />
                <circle cx={sx} cy={sy} r={h * 0.12} fill="#64748b" />
              </g>
            );
          })}
        </g>
      );
    }

    case 'butler_pantry': {
      // Butler's pantry shelving unit with deep wire racks & storage canisters
      return (
        <g id="symbol-butler-pantry">
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#f1f5f9" stroke={stroke} strokeWidth={sw} />
          {/* 3 Shelf levels */}
          <line x1={x1} y1={-h * 0.15} x2={x2} y2={-h * 0.15} stroke={stroke} strokeWidth={1.2} />
          <line x1={x1} y1={h * 0.15} x2={x2} y2={h * 0.15} stroke={stroke} strokeWidth={1.2} />
          {/* Pantry containers & bins */}
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={x1 + 6 + i * ((w - 12) / 6)} y={y1 + 4} width={(w - 12) / 6 - 4} height={h * 0.25} rx={2} fill="#e2e8f0" stroke="#64748b" strokeWidth={0.8} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <circle key={i} cx={x1 + 12 + i * ((w - 24) / 4)} cy={0} r={6} fill="#cbd5e1" stroke="#64748b" strokeWidth={0.8} />
          ))}
          <text x={0} y={y2 - 5} textAnchor="middle" fontSize={7} fill="#64748b" fontWeight="bold">PANTRY</text>
        </g>
      );
    }

    case 'sink_farmhouse': {
      // Farmhouse apron front sink with deep single bowl & luxury gooseneck tap
      return (
        <g id="symbol-sink-farmhouse">
          {/* Apron front rim */}
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          {/* Inner basin */}
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={h - 16} rx={3} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.5} />
          {/* Center drain with cross basket */}
          <circle cx={0} cy={-2} r={5} fill="#94a3b8" stroke="#475569" strokeWidth={1} />
          <line x1={-4} y1={-2} x2={4} y2={-2} stroke="#ffffff" strokeWidth={1} />
          <line x1={0} y1={-6} x2={0} y2={2} stroke="#ffffff" strokeWidth={1} />
          {/* Faucet body and spout */}
          <circle cx={0} cy={-halfH + 8} r={4} fill="#334155" />
          <line x1={0} y1={-halfH + 8} x2={0} y2={-halfH + 16} stroke="#334155" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    }

    case 'coffee_station': {
      // Gourmet espresso coffee station with bean grinder & cup rack
      return (
        <g id="symbol-coffee-station">
          <rect x={x1} y={y1} width={w} height={h} rx={3} fill="#334155" stroke={stroke} strokeWidth={sw} />
          {/* Espresso Machine body */}
          <rect x={x1 + 6} y={y1 + 6} width={w * 0.55} height={h - 12} rx={2} fill="#0f172a" stroke="#cbd5e1" strokeWidth={1} />
          {/* Dual portafilter heads */}
          <circle cx={x1 + w * 0.22} cy={y1 + h * 0.65} r={4} fill="#ca8a04" />
          <circle cx={x1 + w * 0.42} cy={y1 + h * 0.65} r={4} fill="#ca8a04" />
          {/* Coffee cups on side tray */}
          <circle cx={x2 - 14} cy={y1 + 14} r={6} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1} />
          <circle cx={x2 - 14} cy={y2 - 14} r={6} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1} />
          <text x={x1 + w * 0.33} y={y1 + 14} textAnchor="middle" fontSize={6} fill="#facc15" fontWeight="bold">COFFEE</text>
        </g>
      );
    }

    case 'wine_cooler': {
      // Under-counter glass door wine refrigerator with horizontal bottle racks
      return (
        <g id="symbol-wine-cooler">
          <rect x={x1} y={y1} width={w} height={h} rx={3} fill="#0f172a" stroke={stroke} strokeWidth={sw} />
          {/* Glass door reveal */}
          <rect x={x1 + 4} y={y1 + 4} width={w - 8} height={h - 8} rx={2} fill="#1e293b" stroke="#38bdf8" strokeWidth={1} />
          {/* Bottle shelves */}
          {Array.from({ length: 4 }).map((_, i) => (
            <line key={i} x1={x1 + 6} y1={y1 + 8 + (i + 1) * ((h - 16) / 5)} x2={x2 - 6} y2={y1 + 8 + (i + 1) * ((h - 16) / 5)} stroke="#b45309" strokeWidth={1.5} />
          ))}
          {/* Wine bottle necks */}
          {[-12, 0, 12].map((bx, i) => (
            <circle key={i} cx={bx} cy={0} r={4} fill="#15803d" />
          ))}
          <text x={0} y={y2 - 6} textAnchor="middle" fontSize={7} fill="#38bdf8" fontWeight="bold">WINE</text>
        </g>
      );
    }

    case 'corner_cabinet': {
      // Kitchen lazy susan corner base cabinet with revolving carousel shelves
      return (
        <g id="symbol-corner-cabinet">
          {/* L-shaped corner carcass */}
          <path
            d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1 + w * 0.4} ${y2} L ${x1 + w * 0.4} ${y1 + h * 0.4} L ${x1} ${y1 + h * 0.4} Z`}
            fill="#cbd5e1"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Rotating carousel disc */}
          <circle cx={x1 + w * 0.65} cy={y1 + h * 0.65} r={Math.min(w, h) * 0.28} fill="none" stroke="#475569" strokeWidth={1.2} strokeDasharray="3 3" />
          <circle cx={x1 + w * 0.65} cy={y1 + h * 0.65} r={4} fill="#ca8a04" />
        </g>
      );
    }

    case 'shower_corner': {
      // Neo-angle curved glass corner shower enclosure with curved sliding doors & floor drain
      return (
        <g id="symbol-shower-corner">
          {/* Outer corner tray with curved glass front */}
          <path
            d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y1 + h * 0.4} Q ${x2 - 8} ${y2} ${x1 + w * 0.4} ${y2} L ${x1} ${y2} Z`}
            fill="#f8fafc"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Curved glass door track */}
          <path
            d={`M ${x2} ${y1 + h * 0.4} Q ${x2 - 8} ${y2} ${x1 + w * 0.4} ${y2}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth={2.5}
          />
          {/* Corner drain */}
          <circle cx={x1 + 18} cy={y1 + 18} r={5} fill="#94a3b8" stroke="#475569" strokeWidth={1} />
          {/* Overhead rainfall shower head */}
          <circle cx={x1 + 28} cy={y1 + 28} r={9} fill="#38bdf8" stroke="#0284c7" strokeWidth={1} />
        </g>
      );
    }

    case 'bathtub_clawfoot': {
      // Vintage freestanding clawfoot soaking tub with rolled rim and chrome tap
      return (
        <g id="symbol-bathtub-clawfoot">
          {/* 4 Vintage claw feet protruding */}
          <circle cx={x1 + 14} cy={y1 + 8} r={5} fill="#ca8a04" stroke={stroke} strokeWidth={1} />
          <circle cx={x2 - 14} cy={y1 + 8} r={5} fill="#ca8a04" stroke={stroke} strokeWidth={1} />
          <circle cx={x1 + 14} cy={y2 - 8} r={5} fill="#ca8a04" stroke={stroke} strokeWidth={1} />
          <circle cx={x2 - 14} cy={y2 - 8} r={5} fill="#ca8a04" stroke={stroke} strokeWidth={1} />
          {/* Rolled outer rim */}
          <rect x={x1 + 4} y={y1 + 2} width={w - 8} height={h - 4} rx={18} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          {/* Tub interior basin */}
          <rect x={x1 + 12} y={y1 + 8} width={w - 24} height={h - 16} rx={14} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.2} />
          {/* Chrome faucet & drain */}
          <circle cx={x1 + 18} cy={0} r={4} fill="#475569" />
          <line x1={x1 + 18} y1={-5} x2={x1 + 18} y2={5} stroke="#cbd5e1" strokeWidth={1.5} />
          <circle cx={x2 - 22} cy={0} r={3} fill="#0284c7" />
        </g>
      );
    }

    case 'sauna': {
      // Finnish cedar sauna room with 2-tier slatted benches, sauna rock heater & thermal door
      return (
        <g id="symbol-sauna">
          {/* Insulated cedar wood perimeter */}
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#d97706" stroke={stroke} strokeWidth={sw} />
          {/* Top tier bench slats */}
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={h * 0.32} fill="#b45309" stroke={stroke} strokeWidth={1} />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={x1 + 6 + i * ((w - 12) / 8)} y1={y1 + 6} x2={x1 + 6 + i * ((w - 12) / 8)} y2={y1 + 6 + h * 0.32} stroke="#78350f" strokeWidth={1} />
          ))}
          {/* Lower tier bench slats */}
          <rect x={x1 + 6} y={y1 + 6 + h * 0.32} width={w - 12} height={h * 0.22} fill="#ca8a04" stroke={stroke} strokeWidth={1} />
          {/* Electric rock stove heater */}
          <rect x={x2 - 32} y={y2 - 32} width={24} height={24} rx={2} fill="#1e293b" stroke="#ef4444" strokeWidth={1.2} />
          <circle cx={x2 - 20} cy={y2 - 20} r={6} fill="#78350f" />
          <text x={0} y={y2 - 10} textAnchor="middle" fontSize={8} fill="#ffffff" fontWeight="bold">SAUNA</text>
        </g>
      );
    }

    case 'ada_shower': {
      // Barrier-free ADA accessible roll-in shower with safety grab bars & fold-down seat
      return (
        <g id="symbol-ada-shower">
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Flush trench threshold (barrier-free) */}
          <line x1={x1} y1={y2} x2={x2} y2={y2} stroke="#0284c7" strokeWidth={3} strokeDasharray="6 3" />
          {/* Wall-mounted L-shaped stainless grab bar */}
          <path d={`M ${x1 + 6} ${y2 - 12} L ${x1 + 6} ${y1 + 6} L ${x2 - 12} ${y1 + 6}`} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />
          {/* Fold-down shower bench seat */}
          <rect x={x1 + 10} y={y1 + 10} width={28} height={20} rx={2} fill="#dfd0ba" stroke={stroke} strokeWidth={1} />
          {/* ADA Wheelchair symbol */}
          <circle cx={0} cy={6} r={4} fill="#2563eb" />
          <path d={`M 0 10 L 0 20 L 8 20 M -3 15 L 6 15`} stroke="#2563eb" strokeWidth={1.5} fill="none" />
        </g>
      );
    }

    case 'makeup_vanity': {
      // Dressing table makeup vanity with lighted Hollywood mirror & cushioned ottoman
      return (
        <g id="symbol-makeup-vanity">
          {/* Vanity console surface */}
          <rect x={x1} y={y1} width={w} height={h * 0.55} rx={3} fill="#dfd0ba" stroke={stroke} strokeWidth={sw} />
          {/* Dual drawers */}
          <line x1={0} y1={y1} x2={0} y2={y1 + h * 0.55} stroke={stroke} strokeWidth={1} />
          <circle cx={-w * 0.25} cy={y1 + h * 0.27} r={2.5} fill="#ca8a04" />
          <circle cx={w * 0.25} cy={y1 + h * 0.27} r={2.5} fill="#ca8a04" />
          {/* Backlit mirror strip */}
          <rect x={-w * 0.35} y={y1 - 4} width={w * 0.7} height={6} rx={2} fill="#bae6fd" stroke="#38bdf8" strokeWidth={1} />
          {/* Round vanity stool / ottoman */}
          <circle cx={0} cy={y2 - h * 0.22} r={h * 0.22} fill="#f472b6" stroke={stroke} strokeWidth={1.2} />
          <circle cx={0} cy={y2 - h * 0.22} r={h * 0.1} fill="#fbcfe8" />
        </g>
      );
    }

    default:
      return null;
  }
};
