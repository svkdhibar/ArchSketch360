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
  name?: string;
  roomName?: string;
  color?: string;
}

export const renderAnnotationVehicleOffice = ({
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
  name,
  roomName,
  color,
}: SubSymbolProps): React.ReactElement | null => {
  switch (kind) {
    // ---------------- ANNOTATIONS ----------------
    case 'north_arrow': {
      const r = Math.min(w, h) * 0.44;
      return (
        <g id="symbol-north-arrow">
          {/* Compass ring */}
          <circle cx={0} cy={10} r={r * 0.65} fill="none" stroke={stroke} strokeWidth={sw} />
          <circle cx={0} cy={10} r={r * 0.55} fill="none" stroke="#64748b" strokeWidth={0.8} strokeDasharray="2 2" />
          {/* Faceted sharp North pointer: left half black, right half white */}
          <polygon points={`0,${-halfH + 18} ${-r * 0.4},${10} 0,${10}`} fill="#0f172a" stroke={stroke} strokeWidth={1} />
          <polygon points={`0,${-halfH + 18} ${r * 0.4},${10} 0,${10}`} fill="#ffffff" stroke={stroke} strokeWidth={1} />
          {/* South tail */}
          <polygon points={`0,${halfH - 8} ${-r * 0.25},${10} 0,${10}`} fill="#ffffff" stroke={stroke} strokeWidth={1} />
          <polygon points={`0,${halfH - 8} ${r * 0.25},${10} 0,${10}`} fill="#0f172a" stroke={stroke} strokeWidth={1} />
          {/* North "N" letter */}
          <text x={0} y={-halfH + 12} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">N</text>
        </g>
      );
    }

    case 'section_marker': {
      return (
        <g id="symbol-section-marker">
          {/* Section cutting line */}
          <line x1={x1} y1={0} x2={x2 - 28} y2={0} stroke="#0f172a" strokeWidth={2.5} strokeDasharray="14 4 3 4" />
          {/* Direction indicator triangle */}
          <polygon points={`${x2 - 28},${-12} ${x2 - 28},${12} ${x2 - 12},${0}`} fill="#0f172a" />
          {/* Section callout bubble */}
          <circle cx={x2 - 14} cy={0} r={14} fill="#ffffff" stroke="#0f172a" strokeWidth={2} />
          <line x1={x2 - 28} y1={0} x2={x2} y2={0} stroke="#0f172a" strokeWidth={1.5} />
          <text x={x2 - 14} y={-3} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#0f172a">A</text>
          <text x={x2 - 14} y={9} textAnchor="middle" fontSize={8} fill="#64748b">101</text>
        </g>
      );
    }

    case 'elevation_marker': {
      const r = Math.min(w, h) * 0.38;
      return (
        <g id="symbol-elevation-marker">
          <circle cx={0} cy={0} r={r} fill="#ffffff" stroke="#0f172a" strokeWidth={2} />
          {/* Pointed elevation arrow pointing North */}
          <polygon points={`0,${-r - 10} ${-r * 0.5},${-r * 0.5} 0,${-r * 0.5}`} fill="#0f172a" />
          <polygon points={`0,${-r - 10} ${r * 0.5},${-r * 0.5} 0,${-r * 0.5}`} fill="#ffffff" stroke="#0f172a" strokeWidth={1} />
          <text x={0} y={4} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#0f172a">1</text>
        </g>
      );
    }

    case 'custom_name_tag': {
      const labelText = (name || roomName || 'Custom Name').trim() || 'Label';
      const fontSize = Math.max(10, Math.min(15, Math.floor((w - 24) / Math.max(5, labelText.length * 0.65))));
      return (
        <g id="symbol-custom-name-tag">
          {/* Subtle architectural container */}
          <rect
            x={x1}
            y={y1}
            width={w}
            height={h}
            rx={6}
            fill={color || '#ffffff'}
            stroke="#4f46e5"
            strokeWidth={sw * 1.1}
          />
          {/* Architectural Left Accent Tag Marker */}
          <path
            d={`M ${x1 + 6} ${y1 + 5} L ${x1 + 6} ${y2 - 5}`}
            stroke="#6366f1"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Small dot accent */}
          <circle cx={x1 + 14} cy={0} r={2.5} fill="#6366f1" />
          {/* Crisp Custom Name Text */}
          <text
            x={5}
            y={fontSize * 0.35}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="bold"
            fill="#0f172a"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.02em"
          >
            {labelText}
          </text>
        </g>
      );
    }

    case 'room_tag': {
      const roomLabel = (name || roomName || 'ROOM').trim();
      return (
        <g id="symbol-room-tag">
          <rect x={x1} y={y1} width={w} height={h} rx={6} fill={color || '#ffffff'} stroke="#4f46e5" strokeWidth={1.5} />
          <text x={0} y={-3} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#1e293b">{roomLabel.toUpperCase()}</text>
          <text x={0} y={11} textAnchor="middle" fontSize={9} fill="#64748b">Area Tag</text>
        </g>
      );
    }

    case 'scale_bar': {
      const barH = 8;
      const quarter = w / 4;
      return (
        <g id="symbol-scale-bar">
          {/* Segmented black & white scale bar */}
          <rect x={x1} y={-barH / 2} width={quarter} height={barH} fill="#0f172a" stroke="#0f172a" strokeWidth={1} />
          <rect x={x1 + quarter} y={-barH / 2} width={quarter} height={barH} fill="#ffffff" stroke="#0f172a" strokeWidth={1} />
          <rect x={x1 + quarter * 2} y={-barH / 2} width={quarter} height={barH} fill="#0f172a" stroke="#0f172a" strokeWidth={1} />
          <rect x={x1 + quarter * 3} y={-barH / 2} width={quarter} height={barH} fill="#ffffff" stroke="#0f172a" strokeWidth={1} />
          {/* Metric labels */}
          <text x={x1} y={12} textAnchor="middle" fontSize={7} fill="#0f172a">0</text>
          <text x={x1 + quarter} y={12} textAnchor="middle" fontSize={7} fill="#0f172a">1m</text>
          <text x={x1 + quarter * 2} y={12} textAnchor="middle" fontSize={7} fill="#0f172a">2m</text>
          <text x={x2} y={12} textAnchor="middle" fontSize={7} fill="#0f172a">4m</text>
          <text x={0} y={-8} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#0f172a">SCALE 1:100</text>
        </g>
      );
    }

    // ---------------- VEHICLES & GARAGE ----------------
    case 'luxury_supercar': {
      // High-performance exotic mid-engine supercar (e.g. Ferrari / Porsche 911 / McLaren style)
      const carColor = color || '#e11d48';
      const frontNose = halfW * 0.82;
      const midWaist = halfW * 0.74;
      const rearHaunch = halfW * 0.98;
      const hoodLen = h * 0.28;
      const cockpitLen = h * 0.35;

      return (
        <g id="symbol-luxury-supercar">
          {/* Carbon Front Aero Splitter & Canards */}
          <path
            d={`M ${-frontNose - 4} ${y1 + 10} Q 0 ${y1 - 4} ${frontNose + 4} ${y1 + 10} L ${frontNose} ${y1 + 18} Q 0 ${y1 + 8} ${-frontNose} ${y1 + 18} Z`}
            fill="#09090b"
          />

          {/* Aerodynamic Sculpted Body with pinched waist and muscular flared rear haunches */}
          <path
            d={`
              M 0 ${y1 + 2}
              C ${frontNose * 0.6} ${y1 + 2} ${frontNose} ${y1 + 8} ${frontNose} ${y1 + 32}
              C ${frontNose * 0.94} ${y1 + hoodLen * 0.85} ${midWaist} ${y1 + hoodLen} ${midWaist} ${y1 + hoodLen + cockpitLen * 0.5}
              C ${midWaist * 1.05} ${y1 + hoodLen + cockpitLen} ${rearHaunch} ${y1 + hoodLen + cockpitLen + 12} ${rearHaunch} ${y2 - 16}
              C ${rearHaunch} ${y2 - 4} ${rearHaunch * 0.72} ${y2} 0 ${y2}
              C ${-rearHaunch * 0.72} ${y2} ${-rearHaunch} ${y2 - 4} ${-rearHaunch} ${y2 - 16}
              C ${-rearHaunch} ${y1 + hoodLen + cockpitLen + 12} ${-midWaist * 1.05} ${y1 + hoodLen + cockpitLen} ${-midWaist} ${y1 + hoodLen + cockpitLen * 0.5}
              C ${-midWaist} ${y1 + hoodLen} ${-frontNose * 0.94} ${y1 + hoodLen * 0.85} ${-frontNose} ${y1 + 32}
              C ${-frontNose} ${y1 + 8} ${-frontNose * 0.6} ${y1 + 2} 0 ${y1 + 2}
              Z
            `}
            fill={carColor}
            stroke={stroke}
            strokeWidth={sw}
          />

          {/* Dual Aerodynamic Bonnet Air Vents / Heat Extractors */}
          <path
            d={`M ${-halfW * 0.36} ${y1 + 22} L ${-halfW * 0.14} ${y1 + 20} L ${-halfW * 0.1} ${y1 + 42} L ${-halfW * 0.3} ${y1 + 46} Z`}
            fill="#0f172a"
            opacity={0.88}
          />
          <path
            d={`M ${halfW * 0.36} ${y1 + 22} L ${halfW * 0.14} ${y1 + 20} L ${halfW * 0.1} ${y1 + 42} L ${halfW * 0.3} ${y1 + 46} Z`}
            fill="#0f172a"
            opacity={0.88}
          />

          {/* Angled High-Intensity LED Matrix Headlights with cyan DRL blades */}
          <polygon
            points={`${-frontNose + 4},${y1 + 10} ${-frontNose + 20},${y1 + 12} ${-frontNose + 15},${y1 + 28} ${-frontNose + 2},${y1 + 24}`}
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth={0.8}
          />
          <polygon
            points={`${frontNose - 4},${y1 + 10} ${frontNose - 20},${y1 + 12} ${frontNose - 15},${y1 + 28} ${frontNose - 2},${y1 + 24}`}
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth={0.8}
          />

          {/* Aerodynamic Teardrop Cockpit Glass Canopy */}
          <path
            d={`
              M 0 ${y1 + hoodLen - 2}
              C ${halfW * 0.58} ${y1 + hoodLen - 2} ${halfW * 0.64} ${y1 + hoodLen + 14} ${halfW * 0.56} ${y1 + hoodLen + cockpitLen}
              C ${halfW * 0.38} ${y1 + hoodLen + cockpitLen + 8} 0 ${y1 + hoodLen + cockpitLen + 12} 0 ${y1 + hoodLen + cockpitLen + 12}
              C 0 ${y1 + hoodLen + cockpitLen + 12} ${-halfW * 0.38} ${y1 + hoodLen + cockpitLen + 8} ${-halfW * 0.56} ${y1 + hoodLen + cockpitLen}
              C ${-halfW * 0.64} ${y1 + hoodLen + 14} ${-halfW * 0.58} ${y1 + hoodLen - 2} 0 ${y1 + hoodLen - 2}
              Z
            `}
            fill="#090d16"
            stroke="#0284c7"
            strokeWidth={1}
          />

          {/* Carbon Roof Center Air Scoop & Interior Bucket Seat Headrests */}
          <rect
            x={-halfW * 0.26}
            y={y1 + hoodLen + 16}
            width={halfW * 0.52}
            height={cockpitLen * 0.44}
            rx={4}
            fill="#1e293b"
          />
          <circle cx={-halfW * 0.22} cy={y1 + hoodLen + 26} r={5} fill="#475569" />
          <circle cx={halfW * 0.22} cy={y1 + hoodLen + 26} r={5} fill="#475569" />

          {/* Mid-Engine Glass Bay with Intake Plenum & Cooling Louvres */}
          <rect
            x={-halfW * 0.36}
            y={y1 + hoodLen + cockpitLen + 4}
            width={halfW * 0.72}
            height={h - hoodLen - cockpitLen - 26}
            rx={4}
            fill="#0f172a"
            stroke="#334155"
            strokeWidth={1}
          />
          {/* Metallic Silver V10 Engine Manifold & Carbon Strakes */}
          <line x1={-halfW * 0.18} y1={y1 + hoodLen + cockpitLen + 14} x2={-halfW * 0.18} y2={y2 - 32} stroke="#cbd5e1" strokeWidth={3} strokeLinecap="round" />
          <line x1={halfW * 0.18} y1={y1 + hoodLen + cockpitLen + 14} x2={halfW * 0.18} y2={y2 - 32} stroke="#cbd5e1" strokeWidth={3} strokeLinecap="round" />
          <circle cx={0} cy={y1 + hoodLen + cockpitLen + 18} r={4} fill="#e2e8f0" />

          {/* Carbon Fiber Aerodynamic Rear Wing with Endplates */}
          <path
            d={`M ${-rearHaunch + 2} ${y2 - 12} Q 0 ${y2 - 7} ${rearHaunch - 2} ${y2 - 12} L ${rearHaunch - 2} ${y2 - 4} Q 0 ${y2 + 1} ${-rearHaunch + 2} ${y2 - 4} Z`}
            fill="#09090b"
            stroke="#27272a"
            strokeWidth={1}
          />
          <rect x={-rearHaunch - 1} y={y2 - 15} width={5} height={13} rx={1} fill="#18181b" />
          <rect x={rearHaunch - 4} y={y2 - 15} width={5} height={13} rx={1} fill="#18181b" />

          {/* Full-width Neon Crimson Tail Light Strip & Quad Titanium Exhausts */}
          <line x1={-rearHaunch + 10} y1={y2 - 2} x2={rearHaunch - 10} y2={y2 - 2} stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={-halfW * 0.42} cy={y2 + 1} r={3.5} fill="#09090b" stroke="#cbd5e1" strokeWidth={1} />
          <circle cx={-halfW * 0.28} cy={y2 + 1} r={3.5} fill="#09090b" stroke="#cbd5e1" strokeWidth={1} />
          <circle cx={halfW * 0.28} cy={y2 + 1} r={3.5} fill="#09090b" stroke="#cbd5e1" strokeWidth={1} />
          <circle cx={halfW * 0.42} cy={y2 + 1} r={3.5} fill="#09090b" stroke="#cbd5e1" strokeWidth={1} />

          {/* Aerodynamic Rear View Side Mirrors */}
          <path d={`M ${-midWaist} ${y1 + hoodLen + 6} L ${-halfW - 6} ${y1 + hoodLen} L ${-halfW - 4} ${y1 + hoodLen + 15} Z`} fill="#09090b" />
          <path d={`M ${midWaist} ${y1 + hoodLen + 6} L ${halfW + 6} ${y1 + hoodLen} L ${halfW + 4} ${y1 + hoodLen + 15} Z`} fill="#09090b" />
        </g>
      );
    }

    case 'luxury_limousine': {
      // Extended wheelbase flagship executive limousine (e.g. Rolls-Royce Phantom / Maybach style)
      const carColor = color || '#0f172a';
      const hoodLen = h * 0.33;
      const cabinLen = h * 0.46;

      return (
        <g id="symbol-luxury-limousine">
          {/* Main Extended Body Silhouette */}
          <rect
            x={x1}
            y={y1 + 4}
            width={w}
            height={h - 8}
            rx={16}
            fill={carColor}
            stroke={stroke}
            strokeWidth={sw}
          />

          {/* Two-tone Silver/Platinum Bonnet & Trunk Deck Center Inset */}
          <path
            d={`
              M ${-halfW * 0.65} ${y1 + 8}
              L ${halfW * 0.65} ${y1 + 8}
              L ${halfW * 0.6} ${y1 + hoodLen}
              L ${-halfW * 0.6} ${y1 + hoodLen}
              Z
            `}
            fill="#e2e8f0"
            fillOpacity={0.22}
          />

          {/* Iconic Chrome Pantheon Grille Slats */}
          <rect x={-halfW * 0.45} y={y1 + 1} width={w * 0.45} height={9} rx={2} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`grille-${i}`}
              x1={-halfW * 0.4 + i * (w * 0.4 / 8)}
              y1={y1 + 2}
              x2={-halfW * 0.4 + i * (w * 0.4 / 8)}
              y2={y1 + 9}
              stroke="#64748b"
              strokeWidth={1}
            />
          ))}

          {/* Chrome Mascot Hood Ornament Crest */}
          <ellipse cx={0} cy={y1 + 2} rx={3} ry={5} fill="#ffffff" stroke="#94a3b8" strokeWidth={0.8} />

          {/* Front Jewel Matrix LED Headlights with Illuminated Daytime Halos */}
          <rect x={x1 + 6} y={y1 + 6} width={18} height={9} rx={2} fill="#090d16" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={x1 + 12} cy={y1 + 10} r={3} fill="#38bdf8" />
          <circle cx={x1 + 19} cy={y1 + 10} r={2.5} fill="#fef08a" />

          <rect x={x2 - 24} y={y1 + 6} width={18} height={9} rx={2} fill="#090d16" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={x2 - 12} cy={y1 + 10} r={3} fill="#38bdf8" />
          <circle cx={x2 - 19} cy={y1 + 10} r={2.5} fill="#fef08a" />

          {/* Polished Chrome Full-Length Waist Coachline on Both Sides */}
          <line x1={x1 + 3} y1={y1 + 16} x2={x1 + 3} y2={y2 - 16} stroke="#e2e8f0" strokeWidth={1.5} />
          <line x1={x2 - 3} y1={y1 + 16} x2={x2 - 3} y2={y2 - 16} stroke="#e2e8f0" strokeWidth={1.5} />

          {/* Raked Windshield with Polished Chrome Surround */}
          <path
            d={`M ${x1 + 12} ${y1 + hoodLen - 2} L ${x1 + 18} ${y1 + hoodLen + 24} L ${x2 - 18} ${y1 + hoodLen + 24} L ${x2 - 12} ${y1 + hoodLen - 2} Z`}
            fill="#090d16"
            stroke="#e2e8f0"
            strokeWidth={1.2}
          />

          {/* Executive Cabin Roof with Dual Split Panoramic Glass Roofs */}
          <rect
            x={x1 + 16}
            y={y1 + hoodLen + 24}
            width={w - 32}
            height={cabinLen - 28}
            rx={4}
            fill="#1e293b"
          />

          {/* Chauffeur Front Sunroof */}
          <rect
            x={x1 + 22}
            y={y1 + hoodLen + 30}
            width={w - 44}
            height={cabinLen * 0.28}
            rx={2}
            fill="#090d16"
            stroke="#475569"
            strokeWidth={1}
          />

          {/* Rear VIP Starlight Panoramic Skylight with Center Beam */}
          <rect
            x={x1 + 22}
            y={y1 + hoodLen + 36 + cabinLen * 0.28}
            width={w - 44}
            height={cabinLen * 0.46}
            rx={2}
            fill="#090d16"
            stroke="#475569"
            strokeWidth={1}
          />
          {/* Starlight fiber optics pattern in rear roof */}
          <circle cx={-12} cy={y1 + hoodLen + 46 + cabinLen * 0.28} r={1} fill="#e0e7ff" />
          <circle cx={14} cy={y1 + hoodLen + 52 + cabinLen * 0.28} r={1} fill="#e0e7ff" />
          <circle cx={-6} cy={y1 + hoodLen + 60 + cabinLen * 0.28} r={1} fill="#e0e7ff" />
          <circle cx={10} cy={y1 + hoodLen + 66 + cabinLen * 0.28} r={1} fill="#e0e7ff" />

          {/* Rear Executive Lounge Headrests */}
          <rect x={-halfW * 0.38} y={y1 + hoodLen + cabinLen - 12} width={14} height={7} rx={3} fill="#64748b" />
          <rect x={halfW * 0.38 - 14} y={y1 + hoodLen + cabinLen - 12} width={14} height={7} rx={3} fill="#64748b" />

          {/* Extended Tinted Rear Window */}
          <path
            d={`M ${x1 + 18} ${y1 + hoodLen + cabinLen - 4} L ${x1 + 14} ${y1 + hoodLen + cabinLen + 20} L ${x2 - 14} ${y1 + hoodLen + cabinLen + 20} L ${x2 - 18} ${y1 + hoodLen + cabinLen - 4} Z`}
            fill="#090d16"
            stroke="#e2e8f0"
            strokeWidth={1.2}
          />

          {/* Extended Rear Boot Deck with Chrome Plinth */}
          <line x1={-halfW * 0.35} y1={y2 - 12} x2={halfW * 0.35} y2={y2 - 12} stroke="#e2e8f0" strokeWidth={2.5} strokeLinecap="round" />

          {/* Vertical Jewel Taillights with Chrome Surrounds */}
          <rect x={x1 + 8} y={y2 - 18} width={8} height={14} rx={2} fill="#ef4444" stroke="#e2e8f0" strokeWidth={0.8} />
          <rect x={x2 - 16} y={y2 - 18} width={8} height={14} rx={2} fill="#ef4444" stroke="#e2e8f0" strokeWidth={0.8} />

          {/* Heated Power Side Mirrors with Chrome Trim */}
          <rect x={x1 - 7} y={y1 + hoodLen + 6} width={8} height={16} rx={3} fill="#1e293b" stroke="#e2e8f0" strokeWidth={1} />
          <rect x={x2 - 1} y={y1 + hoodLen + 6} width={8} height={16} rx={3} fill="#1e293b" stroke="#e2e8f0" strokeWidth={1} />
        </g>
      );
    }

    case 'luxury_ev_coupe': {
      // Sleek luxury electric gran turismo (e.g. Porsche Taycan / Lucid Air / Tesla Model S style)
      const carColor = color || '#0284c7';
      const canopyW = w - 28;

      return (
        <g id="symbol-luxury-ev-coupe">
          {/* Low-drag Aerodynamic Outer Body */}
          <rect
            x={x1}
            y={y1 + 4}
            width={w}
            height={h - 8}
            rx={24}
            fill={carColor}
            stroke={stroke}
            strokeWidth={sw}
          />

          {/* Seamless Full-Length Continuous Panoramic Glass Canopy Roof */}
          <path
            d={`
              M ${-canopyW * 0.35} ${y1 + 38}
              C ${canopyW * 0.35} ${y1 + 38} ${canopyW * 0.48} ${y1 + 52} ${canopyW * 0.48} ${y2 - 28}
              C ${canopyW * 0.4} ${y2 - 16} 0 ${y2 - 14} 0 ${y2 - 14}
              C 0 ${y2 - 14} ${-canopyW * 0.4} ${y2 - 16} ${-canopyW * 0.48} ${y2 - 28}
              C ${-canopyW * 0.48} ${y1 + 52} ${-canopyW * 0.35} ${y1 + 38} 0 ${y1 + 38}
              Z
            `}
            fill="#090d16"
            stroke="#38bdf8"
            strokeWidth={1}
          />

          {/* Thin Glass Divider & Front/Rear Cockpit Separation */}
          <line x1={-canopyW * 0.45} y1={y1 + 76} x2={canopyW * 0.45} y2={y1 + 76} stroke="#38bdf8" strokeWidth={1.2} opacity={0.6} />
          <line x1={-canopyW * 0.45} y1={y2 - 58} x2={canopyW * 0.45} y2={y2 - 58} stroke="#38bdf8" strokeWidth={1.2} opacity={0.6} />

          {/* Front & Rear Passenger Headrest Silhouettes */}
          <circle cx={-halfW * 0.24} cy={y1 + 88} r={5.5} fill="#334155" />
          <circle cx={halfW * 0.24} cy={y1 + 88} r={5.5} fill="#334155" />
          <circle cx={-halfW * 0.24} cy={y2 - 70} r={5.5} fill="#334155" />
          <circle cx={halfW * 0.24} cy={y2 - 70} r={5.5} fill="#334155" />

          {/* Front Full-Width Animated LED Matrix Light Bar */}
          <path
            d={`M ${x1 + 14} ${y1 + 10} Q 0 ${y1 + 4} ${x2 - 14} ${y1 + 10}`}
            fill="none"
            stroke="#e0f2fe"
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Quad Projector LED Pods on Left & Right */}
          <circle cx={x1 + 16} cy={y1 + 12} r={3} fill="#38bdf8" />
          <circle cx={x1 + 24} cy={y1 + 11} r={2.5} fill="#38bdf8" />
          <circle cx={x2 - 24} cy={y1 + 11} r={2.5} fill="#38bdf8" />
          <circle cx={x2 - 16} cy={y1 + 12} r={3} fill="#38bdf8" />

          {/* Flush Retractable Pop-Out Door Handles (4 Doors) */}
          <rect x={x1 + 3} y={y1 + 92} width={3} height={14} rx={1} fill="#e2e8f0" />
          <rect x={x1 + 3} y={y2 - 76} width={3} height={14} rx={1} fill="#e2e8f0" />
          <rect x={x2 - 6} y={y1 + 92} width={3} height={14} rx={1} fill="#e2e8f0" />
          <rect x={x2 - 6} y={y2 - 76} width={3} height={14} rx={1} fill="#e2e8f0" />

          {/* Front Wing Electric Charge Port Flap */}
          <rect x={x1 + 3} y={y1 + 44} width={4} height={8} rx={1} fill="#38bdf8" opacity={0.8} />

          {/* Rear Aerodynamic Ducktail Spoiler Edge */}
          <path
            d={`M ${-halfW * 0.72} ${y2 - 12} Q 0 ${y2 - 8} ${halfW * 0.72} ${y2 - 12}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth={2}
          />

          {/* Continuous Edge-to-Edge Full-Width Razor LED Light Ribbon */}
          <path
            d={`M ${x1 + 12} ${y2 - 4} Q 0 ${y2} ${x2 - 12} ${y2 - 4}`}
            fill="none"
            stroke="#ef4444"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Aero Side Mirrors with Integrated Amber Indicator */}
          <rect x={x1 - 6} y={y1 + 54} width={7} height={15} rx={3} fill="#090d16" />
          <line x1={x1 - 6} y1={y1 + 61} x2={x1 - 2} y2={y1 + 61} stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={x2 - 1} y={y1 + 54} width={7} height={15} rx={3} fill="#090d16" />
          <line x1={x2 + 2} y1={y1 + 61} x2={x2 + 6} y2={y1 + 61} stroke="#f59e0b" strokeWidth={1.5} />
        </g>
      );
    }

    case 'luxury_suv': {
      // Flagship luxury full-size SUV (e.g. Range Rover Autobiography / Porsche Cayenne style)
      const carColor = color || '#334155';
      const hoodLen = h * 0.28;
      const cabinLen = h * 0.52;

      return (
        <g id="symbol-luxury-suv">
          {/* Muscular Luxury Body Shell with Flared Wheel Arches */}
          <rect
            x={x1}
            y={y1 + 2}
            width={w}
            height={h - 4}
            rx={20}
            fill={carColor}
            stroke={stroke}
            strokeWidth={sw}
          />

          {/* Clamshell Bonnet Precision Strakes */}
          <line x1={-halfW * 0.42} y1={y1 + 6} x2={-halfW * 0.42} y2={y1 + hoodLen - 4} stroke="#64748b" strokeWidth={1.5} />
          <line x1={halfW * 0.42} y1={y1 + 6} x2={halfW * 0.42} y2={y1 + hoodLen - 4} stroke="#64748b" strokeWidth={1.5} />

          {/* Bold Honeycomb Mesh Grille & Chrome Surround */}
          <rect x={-halfW * 0.52} y={y1 + 3} width={w * 0.52} height={8} rx={2} fill="#0f172a" stroke="#cbd5e1" strokeWidth={1} />
          <line x1={-halfW * 0.4} y1={y1 + 7} x2={halfW * 0.4} y2={y1 + 7} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" />

          {/* Quad Jewel Matrix LED Headlamps with Circular Halo DRLs */}
          <rect x={x1 + 6} y={y1 + 6} width={20} height={10} rx={3} fill="#090d16" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={x1 + 13} cy={y1 + 11} r={3.5} fill="none" stroke="#38bdf8" strokeWidth={1.2} />
          <circle cx={x1 + 21} cy={y1 + 11} r={2.5} fill="#fef08a" />

          <rect x={x2 - 26} y={y1 + 6} width={20} height={10} rx={3} fill="#090d16" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={x2 - 13} cy={y1 + 11} r={3.5} fill="none" stroke="#38bdf8" strokeWidth={1.2} />
          <circle cx={x2 - 21} cy={y1 + 11} r={2.5} fill="#fef08a" />

          {/* Raked Windshield with Dual Wipers Outline */}
          <path
            d={`M ${x1 + 10} ${y1 + hoodLen} L ${x1 + 16} ${y1 + hoodLen + 24} L ${x2 - 16} ${y1 + hoodLen + 24} L ${x2 - 10} ${y1 + hoodLen} Z`}
            fill="#090d16"
            stroke="#64748b"
            strokeWidth={1}
          />
          <line x1={-12} y1={y1 + hoodLen + 18} x2={-2} y2={y1 + hoodLen + 8} stroke="#94a3b8" strokeWidth={1.2} />
          <line x1={8} y1={y1 + hoodLen + 18} x2={18} y2={y1 + hoodLen + 8} stroke="#94a3b8" strokeWidth={1.2} />

          {/* Floating Darkened Privacy Glass Roof Structure */}
          <rect
            x={x1 + 12}
            y={y1 + hoodLen + 24}
            width={w - 24}
            height={cabinLen}
            rx={4}
            fill="#1e293b"
          />

          {/* Massive Twin-Pane Sky Lounge Panoramic Glass Moonroof */}
          <rect
            x={x1 + 20}
            y={y1 + hoodLen + 30}
            width={w - 40}
            height={cabinLen * 0.4}
            rx={3}
            fill="#090d16"
            stroke="#475569"
            strokeWidth={1}
          />
          <rect
            x={x1 + 20}
            y={y1 + hoodLen + 34 + cabinLen * 0.4}
            width={w - 40}
            height={cabinLen * 0.44}
            rx={3}
            fill="#090d16"
            stroke="#475569"
            strokeWidth={1}
          />

          {/* Integrated Satin Silver Flush Roof Rails */}
          <line x1={x1 + 16} y1={y1 + hoodLen + 28} x2={x1 + 16} y2={y1 + hoodLen + cabinLen - 6} stroke="#e2e8f0" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={x2 - 16} y1={y1 + hoodLen + 28} x2={x2 - 16} y2={y1 + hoodLen + cabinLen - 6} stroke="#e2e8f0" strokeWidth={2.5} strokeLinecap="round" />

          {/* Front & Rear Passenger Ergonomic Headrests */}
          <rect x={-halfW * 0.28} y={y1 + hoodLen + 40} width={12} height={7} rx={3} fill="#475569" />
          <rect x={halfW * 0.28 - 12} y={y1 + hoodLen + 40} width={12} height={7} rx={3} fill="#475569" />
          <rect x={-halfW * 0.28} y={y1 + hoodLen + cabinLen - 26} width={12} height={7} rx={3} fill="#475569" />
          <rect x={halfW * 0.28 - 12} y={y1 + hoodLen + cabinLen - 26} width={12} height={7} rx={3} fill="#475569" />

          {/* Tinted Rear Tailgate Window */}
          <rect
            x={x1 + 14}
            y={y2 - 28}
            width={w - 28}
            height={16}
            rx={3}
            fill="#090d16"
            stroke="#64748b"
            strokeWidth={1}
          />

          {/* Twin Aerodynamic Roof Spoiler Wing with Center High-Mount Brake Light */}
          <path
            d={`M ${x1 + 12} ${y2 - 32} L ${x2 - 12} ${y2 - 32} L ${x2 - 10} ${y2 - 24} L ${x1 + 10} ${y2 - 24} Z`}
            fill="#0f172a"
          />
          <line x1={-12} y1={y2 - 28} x2={12} y2={y2 - 28} stroke="#ef4444" strokeWidth={2} strokeLinecap="round" />

          {/* Wide Integrated Trapezoidal Chrome Exhaust Finishers & Rear Bumper Step */}
          <rect x={x1 + 10} y={y2 - 5} width={16} height={6} rx={2} fill="#09090b" stroke="#cbd5e1" strokeWidth={1.2} />
          <rect x={x2 - 26} y={y2 - 5} width={16} height={6} rx={2} fill="#09090b" stroke="#cbd5e1" strokeWidth={1.2} />

          {/* Luxury Power-Folding Side Mirrors with Turn Signal Repeaters */}
          <rect x={x1 - 8} y={y1 + hoodLen + 6} width={9} height={18} rx={3} fill="#1e293b" stroke="#64748b" strokeWidth={1} />
          <line x1={x1 - 8} y1={y1 + hoodLen + 15} x2={x1 - 4} y2={y1 + hoodLen + 15} stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={x2 - 1} y={y1 + hoodLen + 6} width={9} height={18} rx={3} fill="#1e293b" stroke="#64748b" strokeWidth={1} />
          <line x1={x2 + 4} y1={y1 + hoodLen + 15} x2={x2 + 8} y2={y1 + hoodLen + 15} stroke="#f59e0b" strokeWidth={1.5} />
        </g>
      );
    }

    case 'luxury_convertible': {
      // Open-top 2+2 luxury grand tourer (e.g. Bentley Continental GT / Aston Martin Volante style)
      const carColor = color || '#065f46';
      const hoodLen = h * 0.32;
      const cockpitLen = h * 0.40;

      return (
        <g id="symbol-luxury-convertible">
          {/* Outer Grand Tourer Silhouette */}
          <rect
            x={x1}
            y={y1 + 4}
            width={w}
            height={h - 8}
            rx={22}
            fill={carColor}
            stroke={stroke}
            strokeWidth={sw}
          />

          {/* Long Sculpted Bonnet with Center Power Bulge & Heat Extraction Vents */}
          <path
            d={`M ${-halfW * 0.28} ${y1 + 14} Q 0 ${y1 + 8} ${halfW * 0.28} ${y1 + 14} L ${halfW * 0.24} ${y1 + hoodLen - 4} L ${-halfW * 0.24} ${y1 + hoodLen - 4} Z`}
            fill="#ffffff"
            fillOpacity={0.12}
          />
          <line x1={-halfW * 0.4} y1={y1 + 24} x2={-halfW * 0.4} y2={y1 + 40} stroke="#1e293b" strokeWidth={2} strokeLinecap="round" />
          <line x1={halfW * 0.4} y1={y1 + 24} x2={halfW * 0.4} y2={y1 + 40} stroke="#1e293b" strokeWidth={2} strokeLinecap="round" />

          {/* Front Mesh Sports Grille & Headlights */}
          <rect x={-halfW * 0.45} y={y1 + 2} width={w * 0.45} height={7} rx={2} fill="#09090b" stroke="#cbd5e1" strokeWidth={1} />
          <ellipse cx={x1 + 14} cy={y1 + 10} rx={6} ry={4} fill="#38bdf8" stroke="#0284c7" strokeWidth={1} />
          <ellipse cx={x2 - 14} cy={y1 + 10} rx={6} ry={4} fill="#38bdf8" stroke="#0284c7" strokeWidth={1} />

          {/* Raked Curved Frameless Windshield with Chrome Header Rail */}
          <path
            d={`M ${x1 + 10} ${y1 + hoodLen} Q 0 ${y1 + hoodLen - 8} ${x2 - 10} ${y1 + hoodLen} L ${x2 - 14} ${y1 + hoodLen + 10} Q 0 ${y1 + hoodLen + 2} ${x1 + 14} ${y1 + hoodLen + 10} Z`}
            fill="#090d16"
            stroke="#e2e8f0"
            strokeWidth={1.5}
          />

          {/* Open-Air Luxury Cockpit Basin */}
          <rect
            x={x1 + 14}
            y={y1 + hoodLen + 10}
            width={w - 28}
            height={cockpitLen}
            rx={8}
            fill="#1c1917"
            stroke="#44403c"
            strokeWidth={1}
          />

          {/* Leather-Stitched Dashboard Binnacle & Touchscreen */}
          <rect x={x1 + 18} y={y1 + hoodLen + 12} width={w - 36} height={10} rx={2} fill="#292524" />
          <circle cx={-halfW * 0.26} cy={y1 + hoodLen + 17} r={3} fill="#0284c7" />
          <rect x={-10} y={y1 + hoodLen + 14} width={20} height={6} rx={1} fill="#38bdf8" />

          {/* 3-Spoke Sports Steering Wheel with Column Stalks */}
          <ellipse cx={-halfW * 0.26} cy={y1 + hoodLen + 25} rx={6} ry={3.5} fill="none" stroke="#e2e8f0" strokeWidth={1.8} />
          <line x1={-halfW * 0.26} y1={y1 + hoodLen + 22} x2={-halfW * 0.26} y2={y1 + hoodLen + 28} stroke="#e2e8f0" strokeWidth={1.2} />

          {/* Polished Center Transmission Console & Gear Selector */}
          <rect x={-5} y={y1 + hoodLen + 20} width={10} height={32} rx={2} fill="#44403c" />
          <circle cx={0} cy={y1 + hoodLen + 28} r={2.5} fill="#e2e8f0" />

          {/* Front Driver & Passenger Fluted Luxury Bucket Seats (Cognac / Saddle Leather) */}
          <g transform={`translate(${-halfW * 0.26}, ${y1 + hoodLen + 40})`}>
            {/* Seat bottom cushion with vertical fluting */}
            <rect x={-11} y={-8} width={22} height={20} rx={4} fill="#d97706" stroke="#92400e" strokeWidth={1} />
            <line x1={-5} y1={-6} x2={-5} y2={10} stroke="#b45309" strokeWidth={1} />
            <line x1={0} y1={-6} x2={0} y2={10} stroke="#b45309" strokeWidth={1} />
            <line x1={5} y1={-6} x2={5} y2={10} stroke="#b45309" strokeWidth={1} />
            {/* Contoured headrest */}
            <rect x={-7} y={10} width={14} height={6} rx={2} fill="#b45309" />
          </g>

          <g transform={`translate(${halfW * 0.26}, ${y1 + hoodLen + 40})`}>
            <rect x={-11} y={-8} width={22} height={20} rx={4} fill="#d97706" stroke="#92400e" strokeWidth={1} />
            <line x1={-5} y1={-6} x2={-5} y2={10} stroke="#b45309" strokeWidth={1} />
            <line x1={0} y1={-6} x2={0} y2={10} stroke="#b45309" strokeWidth={1} />
            <line x1={5} y1={-6} x2={5} y2={10} stroke="#b45309" strokeWidth={1} />
            <rect x={-7} y={10} width={14} height={6} rx={2} fill="#b45309" />
          </g>

          {/* Rear 2+2 Contoured Sculpted Passenger Seats */}
          <rect x={-halfW * 0.32} y={y1 + hoodLen + 60} width={15} height={14} rx={3} fill="#b45309" stroke="#78350f" strokeWidth={0.8} />
          <rect x={halfW * 0.32 - 15} y={y1 + hoodLen + 60} width={15} height={14} rx={3} fill="#b45309" stroke="#78350f" strokeWidth={0.8} />

          {/* Sculpted Double-Bubble Speedster Fairings behind Rear Seats */}
          <ellipse cx={-halfW * 0.26} cy={y1 + hoodLen + cockpitLen + 8} rx={12} ry={9} fill={carColor} stroke={stroke} strokeWidth={1} />
          <ellipse cx={halfW * 0.26} cy={y1 + hoodLen + cockpitLen + 8} rx={12} ry={9} fill={carColor} stroke={stroke} strokeWidth={1} />

          {/* Sculpted Rear Trunk Lid & Wrap-Around Taillights */}
          <path
            d={`M ${-halfW * 0.65} ${y2 - 12} Q 0 ${y2 - 6} ${halfW * 0.65} ${y2 - 12}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={1.5}
          />
          <line x1={x1 + 10} y1={y2 - 3} x2={x2 - 10} y2={y2 - 3} stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" />

          {/* Quad Chrome Exhaust Tips */}
          <circle cx={-halfW * 0.42} cy={y2 + 1} r={3} fill="#09090b" stroke="#cbd5e1" strokeWidth={1} />
          <circle cx={-halfW * 0.28} cy={y2 + 1} r={3} fill="#09090b" stroke="#cbd5e1" strokeWidth={1} />
          <circle cx={halfW * 0.28} cy={y2 + 1} r={3} fill="#09090b" stroke="#cbd5e1" strokeWidth={1} />
          <circle cx={halfW * 0.42} cy={y2 + 1} r={3} fill="#09090b" stroke="#cbd5e1" strokeWidth={1} />

          {/* Sports Side Mirrors */}
          <rect x={x1 - 6} y={y1 + hoodLen + 4} width={7} height={14} rx={3} fill="#09090b" />
          <rect x={x2 - 1} y={y1 + hoodLen + 4} width={7} height={14} rx={3} fill="#09090b" />
        </g>
      );
    }

    case 'car_sedan': {
      const carColor = color || '#3b82f6';
      return (
        <g id="symbol-car-sedan">
          {/* Body contour */}
          <rect x={x1} y={y1} width={w} height={h} rx={22} fill={carColor} stroke={stroke} strokeWidth={sw} />
          {/* Front hood contour */}
          <path d={`M ${x1 + 10} ${y1 + 45} Q ${0} ${y1 + 40} ${x2 - 10} ${y1 + 45}`} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
          {/* Windshield */}
          <path d={`M ${x1 + 12} ${y1 + 48} L ${x1 + 16} ${y1 + 72} L ${x2 - 16} ${y1 + 72} L ${x2 - 12} ${y1 + 48} Z`} fill="#1e293b" stroke="#60a5fa" strokeWidth={1} />
          {/* Roof */}
          <rect x={x1 + 15} y={y1 + 72} width={w - 30} height={h * 0.35} rx={4} fill="#2563eb" opacity={0.85} />
          {/* Rear Window */}
          <path d={`M ${x1 + 16} ${y1 + 72 + h * 0.35} L ${x1 + 12} ${y1 + 92 + h * 0.35} L ${x2 - 12} ${y1 + 92 + h * 0.35} L ${x2 - 16} ${y1 + 72 + h * 0.35} Z`} fill="#1e293b" stroke="#60a5fa" strokeWidth={1} />
          {/* Side mirrors */}
          <rect x={x1 - 6} y={y1 + 52} width={7} height={14} rx={3} fill="#1d4ed8" />
          <rect x={x2 - 1} y={y1 + 52} width={7} height={14} rx={3} fill="#1d4ed8" />
          {/* Headlights & Taillights */}
          <circle cx={x1 + 12} cy={y1 + 8} r={5} fill="#fef08a" />
          <circle cx={x2 - 12} cy={y1 + 8} r={5} fill="#fef08a" />
          <rect x={x1 + 10} y={y2 - 8} width={14} height={5} rx={2} fill="#ef4444" />
          <rect x={x2 - 24} y={y2 - 8} width={14} height={5} rx={2} fill="#ef4444" />
        </g>
      );
    }

    case 'car_suv': {
      const carColor = color || '#475569';
      return (
        <g id="symbol-car-suv">
          <rect x={x1} y={y1} width={w} height={h} rx={24} fill={carColor} stroke={stroke} strokeWidth={sw} />
          {/* Windshield */}
          <path d={`M ${x1 + 12} ${y1 + 50} L ${x1 + 18} ${y1 + 76} L ${x2 - 18} ${y1 + 76} L ${x2 - 12} ${y1 + 50} Z`} fill="#0f172a" stroke="#94a3b8" strokeWidth={1} />
          {/* Roof with longitudinal luggage rails */}
          <rect x={x1 + 16} y={y1 + 76} width={w - 32} height={h * 0.42} rx={5} fill="#334155" />
          <line x1={x1 + 20} y1={y1 + 82} x2={x1 + 20} y2={y1 + 68 + h * 0.42} stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
          <line x1={x2 - 20} y1={y1 + 82} x2={x2 - 20} y2={y1 + 68 + h * 0.42} stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
          {/* Rear tailgate window */}
          <rect x={x1 + 16} y={y2 - 32} width={w - 32} height={16} rx={3} fill="#0f172a" />
          {/* Mirrors */}
          <rect x={x1 - 8} y={y1 + 56} width={9} height={16} rx={3} fill="#1e293b" />
          <rect x={x2 - 1} y={y1 + 56} width={9} height={16} rx={3} fill="#1e293b" />
        </g>
      );
    }

    case 'door_garage': {
      return (
        <g id="symbol-door-garage">
          {/* Wall opening & side tracks */}
          <rect x={x1} y={y1} width={12} height={h} fill="#334155" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - 12} y={y1} width={12} height={h} fill="#334155" stroke={stroke} strokeWidth={sw} />
          {/* Overhead horizontal garage door slats */}
          <rect x={x1 + 12} y={y1 + 4} width={w - 24} height={h - 8} rx={2} fill="#f1f5f9" stroke={stroke} strokeWidth={sw} />
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={i} x1={x1 + 12} y1={y1 + 4 + (i + 1) * ((h - 8) / 6)} x2={x2 - 12} y2={y1 + 4 + (i + 1) * ((h - 8) / 6)} stroke="#64748b" strokeWidth={1.2} />
          ))}
          {/* Center handle / lock */}
          <circle cx={0} cy={0} r={3} fill="#0f172a" />
        </g>
      );
    }

    case 'bicycle': {
      return (
        <g id="symbol-bicycle">
          {/* Front wheel */}
          <ellipse cx={0} cy={y1 + 18} rx={4} ry={16} fill="#0f172a" />
          {/* Rear wheel */}
          <ellipse cx={0} cy={y2 - 18} rx={4} ry={16} fill="#0f172a" />
          {/* Central frame tube */}
          <line x1={0} y1={y1 + 18} x2={0} y2={y2 - 18} stroke="#2563eb" strokeWidth={3.5} strokeLinecap="round" />
          {/* Handlebars */}
          <path d={`M ${-16} ${y1 + 30} Q 0 ${y1 + 22} 16 ${y1 + 30}`} fill="none" stroke="#334155" strokeWidth={3} strokeLinecap="round" />
          {/* Saddle */}
          <path d={`M ${-7} ${0} Q 0 ${-12} 7 ${0} Z`} fill="#0f172a" />
        </g>
      );
    }

    // ---------------- OFFICE & COMMERCIAL ----------------
    case 'conference_table': {
      // Racetrack boardroom table with 10 executive chairs
      const chairW = 16;
      const chairH = 14;
      return (
        <g id="symbol-conference-table">
          {/* Racetrack table */}
          <rect x={x1 + 18} y={y1 + 18} width={w - 36} height={h - 36} rx={26} fill="#eedec9" stroke={stroke} strokeWidth={sw} />
          {/* Center connectivity pop-up box */}
          <rect x={-20} y={-8} width={40} height={16} rx={2} fill="#334155" />
          {/* 4 Chairs on top */}
          {[-w * 0.3, -w * 0.1, w * 0.1, w * 0.3].map((cx, i) => (
            <rect key={`c-top-${i}`} x={cx - chairW / 2} y={y1} width={chairW} height={chairH} rx={3} fill="#334155" stroke={stroke} strokeWidth={1} />
          ))}
          {/* 4 Chairs on bottom */}
          {[-w * 0.3, -w * 0.1, w * 0.1, w * 0.3].map((cx, i) => (
            <rect key={`c-bot-${i}`} x={cx - chairW / 2} y={y2 - chairH} width={chairW} height={chairH} rx={3} fill="#334155" stroke={stroke} strokeWidth={1} />
          ))}
          {/* 1 Head chair left & right */}
          <rect x={x1} y={-chairW / 2} width={chairH} height={chairW} rx={3} fill="#334155" stroke={stroke} strokeWidth={1} />
          <rect x={x2 - chairH} y={-chairW / 2} width={chairH} height={chairW} rx={3} fill="#334155" stroke={stroke} strokeWidth={1} />
        </g>
      );
    }

    case 'reception_desk': {
      return (
        <g id="symbol-reception-desk">
          {/* Curved visitor front counter */}
          <path
            d={`M ${x1} ${y1 + h * 0.3} Q 0 ${y1} ${x2} ${y1 + h * 0.3} L ${x2 - 14} ${y1 + h * 0.65} Q 0 ${y1 + h * 0.4} ${x1 + 14} ${y1 + h * 0.65} Z`}
            fill="#cbd5e1"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Receptionist work surface */}
          <rect x={x1 + 24} y={y1 + h * 0.58} width={w - 48} height={h * 0.28} rx={2} fill="#e2e8f0" stroke={stroke} strokeWidth={1} />
          {/* Computer screen */}
          <rect x={-14} y={y1 + h * 0.54} width={28} height={5} rx={1} fill="#0f172a" />
          {/* Receptionist swivel chair */}
          <circle cx={0} cy={y2 - 12} r={10} fill="#475569" stroke={stroke} strokeWidth={1.2} />
        </g>
      );
    }

    case 'cubicle_workstation': {
      return (
        <g id="symbol-cubicle-workstation">
          {/* Central acoustic privacy partition screen */}
          <rect x={x1} y={-3} width={w} height={6} fill="#4f46e5" stroke="#3730a3" strokeWidth={1} />
          {/* Top workstation desk */}
          <rect x={x1 + 6} y={y1 + 4} width={w - 12} height={halfH - 10} rx={3} fill="#eedec9" stroke={stroke} strokeWidth={sw} />
          {/* Top screen & chair */}
          <rect x={-16} y={-10} width={32} height={5} rx={1} fill="#1e293b" />
          <circle cx={0} cy={y1 + 16} r={10} fill="#64748b" stroke={stroke} strokeWidth={1.2} />
          {/* Bottom workstation desk */}
          <rect x={x1 + 6} y={6} width={w - 12} height={halfH - 10} rx={3} fill="#eedec9" stroke={stroke} strokeWidth={sw} />
          {/* Bottom screen & chair */}
          <rect x={-16} y={6} width={32} height={5} rx={1} fill="#1e293b" />
          <circle cx={0} cy={y2 - 16} r={10} fill="#64748b" stroke={stroke} strokeWidth={1.2} />
        </g>
      );
    }

    case 'drafting_table': {
      // Architectural drafting table with parallel straightedge ruler, lamp & high stool
      return (
        <g id="symbol-drafting-table">
          {/* Tilted drawing board */}
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#fef08a" stroke={stroke} strokeWidth={sw} />
          {/* Blue layout paper pinned to board */}
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={h - 12} fill="#e0f2fe" stroke="#38bdf8" strokeWidth={1} />
          {/* Horizontal parallel drafting straightedge */}
          <line x1={x1 + 2} y1={0} x2={x2 - 2} y2={0} stroke="#475569" strokeWidth={3} />
          <circle cx={x1 + 6} cy={0} r={2} fill="#ca8a04" />
          <circle cx={x2 - 6} cy={0} r={2} fill="#ca8a04" />
          {/* Drafting high stool */}
          <circle cx={0} cy={y2 + 14} r={10} fill="#334155" stroke={stroke} strokeWidth={1} />
          <circle cx={0} cy={y2 + 14} r={4} fill="#64748b" />
        </g>
      );
    }

    case 'filing_cabinet': {
      // 4-Drawer steel commercial lateral filing cabinet
      return (
        <g id="symbol-filing-cabinet">
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#cbd5e1" stroke={stroke} strokeWidth={sw} />
          {/* 4 lateral drawer compartments */}
          {Array.from({ length: 3 }).map((_, i) => {
            const dy = y1 + (i + 1) * (h / 4);
            return <line key={i} x1={x1} y1={dy} x2={x2} y2={dy} stroke={stroke} strokeWidth={1} />;
          })}
          {/* Chrome recessed handles & label slots */}
          {Array.from({ length: 4 }).map((_, i) => {
            const dy = y1 + (i + 0.5) * (h / 4);
            return (
              <g key={i}>
                <rect x={-14} y={dy - 2} width={28} height={4} rx={1} fill="#475569" />
                <rect x={-7} y={dy - 1} width={14} height={2} fill="#ffffff" />
              </g>
            );
          })}
        </g>
      );
    }

    case 'meeting_booth': {
      // Acoustic 4-person privacy meeting pod / huddle booth
      const benchD = h * 0.26;
      return (
        <g id="symbol-meeting-booth">
          {/* Acoustic enclosure wall */}
          <rect x={x1} y={y1} width={w} height={h} rx={6} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          {/* Top upholstered booth banquette */}
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={benchD} rx={3} fill="#4f46e5" stroke="#3730a3" strokeWidth={1} />
          {/* Bottom upholstered booth banquette */}
          <rect x={x1 + 6} y={y2 - benchD - 6} width={w - 12} height={benchD} rx={3} fill="#4f46e5" stroke="#3730a3" strokeWidth={1} />
          {/* Center collaborative table with laptop screen */}
          <rect x={-w * 0.3} y={-h * 0.16} width={w * 0.6} height={h * 0.32} rx={3} fill="#dfd0ba" stroke={stroke} strokeWidth={1.2} />
          <rect x={-10} y={-2} width={20} height={4} rx={1} fill="#0f172a" />
          <text x={0} y={y1 + 18} textAnchor="middle" fontSize={6} fill="#ffffff" fontWeight="bold">HUDDLE BOOTH</text>
        </g>
      );
    }

    case 'presentation_screen': {
      // Mobile 75-inch conference AV interactive display screen on rolling cart
      return (
        <g id="symbol-presentation-screen">
          {/* Heavy wheeled mobile floor base */}
          <line x1={-w * 0.35} y1={y2 - 4} x2={w * 0.35} y2={y2 - 4} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
          <circle cx={-w * 0.35} cy={y2 - 4} r={3} fill="#0f172a" />
          <circle cx={w * 0.35} cy={y2 - 4} r={3} fill="#0f172a" />
          {/* Dual support columns */}
          <line x1={-w * 0.15} y1={y1 + 6} x2={-w * 0.15} y2={y2 - 4} stroke="#64748b" strokeWidth={2} />
          <line x1={w * 0.15} y1={y1 + 6} x2={w * 0.15} y2={y2 - 4} stroke="#64748b" strokeWidth={2} />
          {/* Slim Ultra-HD Display Bezel */}
          <rect x={x1} y={y1} width={w} height={h * 0.28} rx={2} fill="#0f172a" stroke={stroke} strokeWidth={1.5} />
          <line x1={x1 + 4} y1={y1 + h * 0.14} x2={x2 - 4} y2={y1 + h * 0.14} stroke="#38bdf8" strokeWidth={1.5} />
        </g>
      );
    }

    case 'vending_machine': {
      // Breakroom beverage / snack vending machine with glass showcase & coin slot
      return (
        <g id="symbol-vending-machine">
          <rect x={x1} y={y1} width={w} height={h} rx={3} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          {/* Glass display front */}
          <rect x={x1 + 6} y={y1 + 6} width={w * 0.65} height={h - 12} rx={2} fill="#0f172a" stroke="#38bdf8" strokeWidth={1} />
          {/* Shelves with cold beverage cans */}
          {Array.from({ length: 3 }).map((_, i) => (
            <line key={i} x1={x1 + 8} y1={y1 + 10 + (i + 1) * ((h - 20) / 4)} x2={x1 + w * 0.65 - 2} y2={y1 + 10 + (i + 1) * ((h - 20) / 4)} stroke="#475569" strokeWidth={1} />
          ))}
          {/* Right payment panel & dispenser */}
          <rect x={x2 - w * 0.25} y={y1 + 8} width={w * 0.2} height={12} fill="#ef4444" rx={1} />
          <rect x={x2 - w * 0.22} y={y1 + 24} width={4} height={10} fill="#ca8a04" />
          <rect x={x2 - w * 0.25} y={y2 - 20} width={w * 0.2} height={14} fill="#334155" rx={1} />
          <text x={x1 + w * 0.35} y={y2 - 6} textAnchor="middle" fontSize={6} fill="#38bdf8" fontWeight="bold">REFRESH</text>
        </g>
      );
    }

    case 'vehicle_truck': {
      // Full-size crew cab pickup truck with open cargo bed, cab & mirrors
      const truckColor = color || '#475569';
      const hoodLen = h * 0.26;
      const cabLen = h * 0.36;
      return (
        <g id="symbol-vehicle-truck">
          {/* Main Truck Outer Body */}
          <rect x={x1} y={y1 + 2} width={w} height={h - 4} rx={16} fill={truckColor} stroke={stroke} strokeWidth={sw} />
          {/* Front Bumper & Chrome Grille */}
          <rect x={-halfW * 0.6} y={y1 + 1} width={w * 0.6} height={8} rx={2} fill="#0f172a" stroke="#cbd5e1" strokeWidth={1} />
          {/* Front Headlights */}
          <rect x={x1 + 6} y={y1 + 5} width={18} height={10} rx={2} fill="#090d16" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={x1 + 14} cy={y1 + 10} r={3} fill="#fef08a" />
          <rect x={x2 - 24} y={y1 + 5} width={18} height={10} rx={2} fill="#090d16" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={x2 - 14} cy={y1 + 10} r={3} fill="#fef08a" />
          {/* Hood Power Strakes */}
          <line x1={-halfW * 0.35} y1={y1 + 6} x2={-halfW * 0.35} y2={y1 + hoodLen - 2} stroke="#64748b" strokeWidth={1.5} />
          <line x1={halfW * 0.35} y1={y1 + 6} x2={halfW * 0.35} y2={y1 + hoodLen - 2} stroke="#64748b" strokeWidth={1.5} />
          {/* Raked Windshield */}
          <path
            d={`M ${x1 + 12} ${y1 + hoodLen} L ${x1 + 16} ${y1 + hoodLen + 22} L ${x2 - 16} ${y1 + hoodLen + 22} L ${x2 - 12} ${y1 + hoodLen} Z`}
            fill="#0f172a"
            stroke="#64748b"
            strokeWidth={1}
          />
          {/* Crew Cab Roof */}
          <rect x={x1 + 14} y={y1 + hoodLen + 22} width={w - 28} height={cabLen - 20} rx={4} fill="#334155" />
          {/* Rear Cab Window */}
          <rect x={x1 + 18} y={y1 + hoodLen + cabLen + 2} width={w - 36} height={6} rx={2} fill="#0f172a" />
          {/* Open Cargo Truck Bed with Spray-in Bedliner Ribs */}
          <rect x={x1 + 8} y={y1 + hoodLen + cabLen + 12} width={w - 16} height={h - hoodLen - cabLen - 20} rx={3} fill="#1e293b" stroke={stroke} strokeWidth={1.2} />
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`bed-rib-${i}`}
              x1={-halfW * 0.6 + i * (w * 0.6 / 4)}
              y1={y1 + hoodLen + cabLen + 16}
              x2={-halfW * 0.6 + i * (w * 0.6 / 4)}
              y2={y2 - 14}
              stroke="#334155"
              strokeWidth={2}
            />
          ))}
          {/* Heavy Duty Tailgate & Taillights */}
          <rect x={x1 + 6} y={y2 - 12} width={10} height={6} rx={1} fill="#ef4444" />
          <rect x={x2 - 16} y={y2 - 12} width={10} height={6} rx={1} fill="#ef4444" />
          <line x1={-halfW * 0.25} y1={y2 - 8} x2={halfW * 0.25} y2={y2 - 8} stroke="#cbd5e1" strokeWidth={2} strokeLinecap="round" />
          {/* Large Towing Mirrors */}
          <rect x={x1 - 9} y={y1 + hoodLen + 4} width={10} height={18} rx={3} fill="#1e293b" />
          <rect x={x2 - 1} y={y1 + hoodLen + 4} width={10} height={18} rx={3} fill="#1e293b" />
        </g>
      );
    }

    case 'vehicle_motorcycle': {
      // Touring motorcycle with front wheel, handlebars, fuel tank, seat & rear wheel
      return (
        <g id="symbol-vehicle-motorcycle">
          {/* Front Wheel Tire */}
          <ellipse cx={0} cy={y1 + 18} rx={4.5} ry={16} fill="#0f172a" stroke={stroke} strokeWidth={1} />
          {/* Handlebars with Grips & Chrome Mirrors */}
          <line x1={-18} y1={y1 + 32} x2={18} y2={y1 + 32} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
          <circle cx={-18} cy={y1 + 32} r={3} fill="#09090b" />
          <circle cx={18} cy={y1 + 32} r={3} fill="#09090b" />
          <circle cx={-16} cy={y1 + 26} r={2} fill="#38bdf8" />
          <circle cx={16} cy={y1 + 26} r={2} fill="#38bdf8" />
          {/* Teardrop Metallic Fuel Tank */}
          <ellipse cx={0} cy={y1 + 54} rx={11} ry={16} fill={color || '#dc2626'} stroke={stroke} strokeWidth={1.2} />
          <circle cx={0} cy={y1 + 46} r={2.5} fill="#e2e8f0" />
          {/* Contoured Rider Leather Saddle */}
          <ellipse cx={0} cy={y1 + 80} rx={9} ry={14} fill="#78350f" stroke="#451a03" strokeWidth={1} />
          {/* Rear Passenger Seat / Luggage Rack */}
          <rect x={-7} y={y2 - 38} width={14} height={16} rx={3} fill="#451a03" />
          {/* Rear Wheel Tire & Exhaust */}
          <ellipse cx={0} cy={y2 - 16} rx={5} ry={16} fill="#0f172a" stroke={stroke} strokeWidth={1} />
          <line x1={8} y1={y1 + 65} x2={8} y2={y2 - 10} stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
          <circle cx={0} cy={y1 + 8} r={4} fill="#fef08a" />
          <rect x={-6} y={y2 - 6} width={12} height={4} rx={1} fill="#ef4444" />
        </g>
      );
    }

    case 'ev_charger': {
      // Commercial EV fast charging pedestal station with dual holster cables
      return (
        <g id="symbol-ev-charger">
          {/* Concrete barrier base */}
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#334155" stroke={stroke} strokeWidth={sw} />
          {/* Digital screen display */}
          <rect x={-12} y={-h * 0.3} width={24} height={14} rx={1} fill="#0284c7" stroke="#ffffff" strokeWidth={0.8} />
          {/* Glowing Green charging lightning symbol */}
          <path d={`M 0 -2 L -4 4 L 1 4 L -1 10 L 4 3 L 0 3 Z`} fill="#22c55e" />
          {/* Dual side charging cord loops */}
          <path d={`M ${x1 + 4} 0 Q ${x1 - 6} ${halfH * 0.4} ${x1 + 4} ${halfH * 0.7}`} fill="none" stroke="#22c55e" strokeWidth={2} />
          <path d={`M ${x2 - 4} 0 Q ${x2 + 6} ${halfH * 0.4} ${x2 - 4} ${halfH * 0.7}`} fill="none" stroke="#22c55e" strokeWidth={2} />
          <text x={0} y={y2 - 6} textAnchor="middle" fontSize={6} fill="#22c55e" fontWeight="bold">EV CHARGE</text>
        </g>
      );
    }

    case 'golf_cart': {
      // 4-Seater electric resort / golf cart with canopy roof & steering wheel
      return (
        <g id="symbol-golf-cart">
          {/* Body shell */}
          <rect x={x1} y={y1 + 4} width={w} height={h - 8} rx={8} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          {/* Canopy roof posts */}
          <rect x={x1 + 8} y={y1 + 8} width={w - 16} height={h - 16} rx={4} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
          {/* Front bench seat */}
          <rect x={x1 + w * 0.3} y={y1 + 10} width={w * 0.22} height={h - 20} rx={2} fill="#334155" />
          {/* Rear bench seat */}
          <rect x={x1 + w * 0.65} y={y1 + 10} width={w * 0.22} height={h - 20} rx={2} fill="#334155" />
          {/* Steering wheel */}
          <circle cx={x1 + w * 0.22} cy={0} r={5} fill="none" stroke="#0f172a" strokeWidth={1.5} />
          {/* Front bumper */}
          <line x1={x1 + 2} y1={y1 + 12} x2={x1 + 2} y2={y2 - 12} stroke="#0f172a" strokeWidth={3} />
        </g>
      );
    }

    case 'gym_treadmill': {
      // Commercial motor-driven running treadmill with display console & running belt
      return (
        <g id="symbol-gym-treadmill">
          {/* Base side decks */}
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          {/* Center textured running track belt */}
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={h - 12} rx={2} fill="#334155" stroke="#0f172a" strokeWidth={1} />
          {/* Front motor hood & console */}
          <rect x={x1} y={y1} width={w * 0.3} height={h} rx={3} fill="#0f172a" stroke={stroke} strokeWidth={1.2} />
          {/* Display screen */}
          <rect x={x1 + 4} y={-6} width={14} height={12} rx={1} fill="#38bdf8" />
          {/* Handrails */}
          <line x1={x1 + w * 0.28} y1={y1 + 4} x2={x1 + w * 0.75} y2={y1 + 4} stroke="#cbd5e1" strokeWidth={2} />
          <line x1={x1 + w * 0.28} y1={y2 - 4} x2={x1 + w * 0.75} y2={y2 - 4} stroke="#cbd5e1" strokeWidth={2} />
        </g>
      );
    }

    case 'gym_spin_bike': {
      // Studio spin exercise bike with weighted front flywheel, pedals & road saddle
      return (
        <g id="symbol-gym-spin-bike">
          {/* Stabilizer feet */}
          <line x1={x1 + 4} y1={-halfH + 4} x2={x1 + 4} y2={halfH - 4} stroke="#1e293b" strokeWidth={3} />
          <line x1={x2 - 4} y1={-halfH + 8} x2={x2 - 4} y2={halfH - 8} stroke="#1e293b" strokeWidth={3} />
          {/* Central frame tube */}
          <line x1={x1 + 4} y1={0} x2={x2 - 4} y2={0} stroke="#dc2626" strokeWidth={3} />
          {/* Heavy perimeter weighted chrome flywheel */}
          <circle cx={x1 + 16} cy={0} r={12} fill="#cbd5e1" stroke="#475569" strokeWidth={2} />
          <circle cx={x1 + 16} cy={0} r={5} fill="#ef4444" />
          {/* Bullhorn handlebars */}
          <path d={`M ${x1 + 10} -10 L ${x1 + 18} -10 L ${x1 + 18} 10 L ${x1 + 10} 10`} fill="none" stroke="#0f172a" strokeWidth={2} />
          {/* Dual crank pedals */}
          <line x1={0} y1={-14} x2={0} y2={14} stroke="#64748b" strokeWidth={2} />
          <rect x={-4} y={-16} width={8} height={4} fill="#0f172a" />
          <rect x={-4} y={12} width={8} height={4} fill="#0f172a" />
          {/* Racing saddle */}
          <ellipse cx={x2 - 14} cy={0} rx={9} ry={5} fill="#0f172a" />
        </g>
      );
    }

    default:
      return null;
  }
};
