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

export const renderMepOrLandscape = ({
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
    // ---------------- ELECTRICAL & MEP ----------------
    case 'light': {
      const r = Math.min(w, h) * 0.44;
      return (
        <g id="symbol-light">
          <circle cx={0} cy={0} r={r} fill="#fef08a" stroke={stroke} strokeWidth={sw} />
          {/* Radial light rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={Math.cos(rad) * (r * 0.4)}
                y1={Math.sin(rad) * (r * 0.4)}
                x2={Math.cos(rad) * (r * 0.9)}
                y2={Math.sin(rad) * (r * 0.9)}
                stroke="#ca8a04"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}
          <circle cx={0} cy={0} r={r * 0.25} fill="#eab308" />
        </g>
      );
    }

    case 'chandelier': {
      const r = Math.min(w, h) * 0.44;
      return (
        <g id="symbol-chandelier">
          <circle cx={0} cy={0} r={r} fill="none" stroke={stroke} strokeWidth={sw} strokeDasharray="3 3" />
          <circle cx={0} cy={0} r={r * 0.4} fill="#fef08a" stroke={stroke} strokeWidth={sw} />
          {/* 6 Outer crystal/bulb branches */}
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const bx = Math.cos(rad) * (r * 0.85);
            const by = Math.sin(rad) * (r * 0.85);
            return (
              <g key={deg}>
                <line x1={0} y1={0} x2={bx} y2={by} stroke="#ca8a04" strokeWidth={1.5} />
                <circle cx={bx} cy={by} r={4.5} fill="#fde047" stroke="#854d0e" strokeWidth={1} />
              </g>
            );
          })}
        </g>
      );
    }

    case 'downlight': {
      const r = Math.min(w, h) * 0.44;
      return (
        <g id="symbol-downlight">
          <circle cx={0} cy={0} r={r} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          <circle cx={0} cy={0} r={r * 0.55} fill="#fef08a" stroke="#ca8a04" strokeWidth={1} />
          <circle cx={0} cy={0} r={2.5} fill="#ca8a04" />
        </g>
      );
    }

    case 'track_light': {
      return (
        <g id="symbol-track-light">
          {/* Track rail */}
          <line x1={x1} y1={0} x2={x2} y2={0} stroke="#334155" strokeWidth={4} strokeLinecap="round" />
          {/* 3 Track Spotlights */}
          {[-w * 0.3, 0, w * 0.3].map((tx, i) => (
            <g key={i} transform={`translate(${tx}, 0)`}>
              <rect x={-5} y={-8} width={10} height={16} rx={2} fill="#0f172a" stroke="#ffffff" strokeWidth={0.8} />
              <circle cx={0} cy={10} r={3} fill="#fef08a" />
            </g>
          ))}
        </g>
      );
    }

    case 'wall_light': {
      return (
        <g id="symbol-wall-light">
          {/* Wall plate */}
          <rect x={x1 + 4} y={y2 - 6} width={w - 8} height={6} fill="#475569" />
          {/* Sconce fixture & up/down light cones */}
          <polygon points={`0,${-h * 0.4} ${-w * 0.35},${y2 - 6} ${w * 0.35},${y2 - 6}`} fill="#fef08a" opacity={0.6} />
          <circle cx={0} cy={0} r={6} fill="#f59e0b" stroke={stroke} strokeWidth={1} />
        </g>
      );
    }

    case 'switch': {
      return (
        <g id="symbol-switch">
          <rect x={x1} y={y1} width={w} height={h} rx={3} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          <circle cx={0} cy={0} r={halfW * 0.5} fill="#ffffff" stroke={stroke} strokeWidth={1.2} />
          {/* S symbol for standard architectural switch */}
          <text x={0} y={4} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#0f172a">S</text>
        </g>
      );
    }

    case 'socket': {
      return (
        <g id="symbol-socket">
          {/* Wall plate */}
          <circle cx={0} cy={0} r={Math.min(w, h) * 0.44} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          {/* Receptacle twin slots */}
          <rect x={-6} y={-5} width={3} height={10} fill="#1e293b" />
          <rect x={3} y={-5} width={3} height={10} fill="#1e293b" />
          <circle cx={0} cy={7} r={2} fill="#1e293b" />
        </g>
      );
    }

    case 'fan': {
      const r = Math.min(w, h) * 0.46;
      return (
        <g id="symbol-fan">
          <circle cx={0} cy={0} r={r * 0.28} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          <circle cx={0} cy={0} r={r * 0.12} fill="#fef08a" stroke="#ca8a04" strokeWidth={1} />
          {/* 4 Curved aerodynamic fan blades */}
          {[0, 90, 180, 270].map((deg) => (
            <path
              key={deg}
              d={`M 0 ${-r * 0.28} C ${r * 0.12} ${-r * 0.5} ${r * 0.14} ${-r * 0.9} 0 ${-r} C ${-r * 0.14} ${-r * 0.9} ${-r * 0.12} ${-r * 0.5} 0 ${-r * 0.28}`}
              transform={`rotate(${deg})`}
              fill="#cbd5e1"
              stroke={stroke}
              strokeWidth={1}
            />
          ))}
        </g>
      );
    }

    case 'smoke_detector': {
      const r = Math.min(w, h) * 0.44;
      return (
        <g id="symbol-smoke-detector">
          <circle cx={0} cy={0} r={r} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          <circle cx={0} cy={0} r={r * 0.65} fill="#f1f5f9" stroke={stroke} strokeWidth={1} strokeDasharray="2 2" />
          <circle cx={0} cy={0} r={3} fill="#ef4444" />
          <text x={0} y={3.5} textAnchor="middle" fontSize={8} fill="#ef4444" fontWeight="bold">SD</text>
        </g>
      );
    }

    case 'ac_vent': {
      return (
        <g id="symbol-ac-vent">
          <rect x={x1} y={y1} width={w} height={h} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Concentric 4-way diffuser louvers */}
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={h - 12} fill="none" stroke="#64748b" strokeWidth={1} />
          <rect x={x1 + 12} y={y1 + 12} width={w - 24} height={h - 24} fill="none" stroke="#64748b" strokeWidth={1} />
          {/* 4 Airflow directional arrows */}
          <line x1={x1 + 6} y1={y1 + 6} x2={x2 - 6} y2={y2 - 6} stroke="#38bdf8" strokeWidth={1.2} />
          <line x1={x1 + 6} y1={y2 - 6} x2={x2 - 6} y2={y1 + 6} stroke="#38bdf8" strokeWidth={1.2} />
        </g>
      );
    }

    case 'elec_panel': {
      return (
        <g id="symbol-elec-panel">
          <rect x={x1} y={y1} width={w} height={h} fill="#ffffff" stroke={stroke} strokeWidth={sw + 0.5} />
          {/* Half-shaded standard architectural breaker panel symbol */}
          <polygon points={`${x1},${y1} ${0},${y1} ${0},${y2} ${x1},${y2}`} fill="#0f172a" />
          <text x={w * 0.22} y={4} textAnchor="middle" fontSize={9} fill="#0f172a" fontWeight="bold">EP</text>
        </g>
      );
    }

    // ---------------- LANDSCAPE & SITE ----------------
    case 'tree': {
      const r = Math.min(w, h) * 0.46;
      return (
        <g id="symbol-tree">
          {/* Architectural soft canopy with scalloped outline */}
          <circle cx={0} cy={0} r={r} fill="#bbf7d0" stroke="#15803d" strokeWidth={sw} />
          <circle cx={0} cy={0} r={r * 0.8} fill="#86efac" stroke="#16a34a" strokeWidth={1} opacity={0.7} />
          {/* Branch structure radiating out */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={0}
                y1={0}
                x2={Math.cos(rad) * (r * 0.65)}
                y2={Math.sin(rad) * (r * 0.65)}
                stroke="#166534"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}
          {/* Center trunk pin */}
          <circle cx={0} cy={0} r={4.5} fill="#14532d" stroke="#ffffff" strokeWidth={1} />
        </g>
      );
    }

    case 'palm_tree': {
      const r = Math.min(w, h) * 0.48;
      return (
        <g id="symbol-palm-tree">
          {/* Trunk center */}
          <circle cx={0} cy={0} r={6} fill="#78350f" />
          {/* Tropical radial palm fronds */}
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
            <g key={deg} transform={`rotate(${deg})`}>
              <path
                d={`M 0 -6 Q 10 ${-r * 0.5} 0 ${-r} Q -10 ${-r * 0.5} 0 -6`}
                fill="#22c55e"
                stroke="#15803d"
                strokeWidth={1}
              />
              <line x1={0} y1={-6} x2={0} y2={-r} stroke="#14532d" strokeWidth={1.2} />
            </g>
          ))}
        </g>
      );
    }

    case 'plant': {
      const r = Math.min(w, h) * 0.44;
      return (
        <g id="symbol-plant">
          {/* Planter pot rim */}
          <circle cx={0} cy={0} r={r * 0.5} fill="#ea580c" stroke="#9a3412" strokeWidth={sw} />
          {/* Foliage leaves */}
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx={0}
              cy={-r * 0.6}
              rx={r * 0.25}
              ry={r * 0.38}
              transform={`rotate(${deg})`}
              fill="#4ade80"
              stroke="#15803d"
              strokeWidth={1.2}
            />
          ))}
          <circle cx={0} cy={0} r={r * 0.28} fill="#7c2d12" />
        </g>
      );
    }

    case 'hedge': {
      return (
        <g id="symbol-hedge">
          <rect x={x1} y={y1} width={w} height={h} rx={h / 2} fill="#22c55e" stroke="#15803d" strokeWidth={sw} />
          {/* Shrub texture bubbles */}
          {Array.from({ length: Math.floor(w / 18) }).map((_, i) => (
            <circle key={i} cx={x1 + 12 + i * 18} cy={0} r={h * 0.36} fill="#4ade80" opacity={0.6} />
          ))}
        </g>
      );
    }

    case 'pool': {
      return (
        <g id="symbol-pool">
          {/* Coping border edge */}
          <rect x={x1} y={y1} width={w} height={h} rx={8} fill="#e2e8f0" stroke={stroke} strokeWidth={sw} />
          {/* Water basin */}
          <rect x={x1 + 8} y={y1 + 8} width={w - 16} height={h - 16} rx={5} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.5} />
          {/* Shallow end entry steps */}
          <rect x={x1 + 8} y={y1 + 8} width={w * 0.2} height={h * 0.3} fill="#bae6fd" stroke="#0284c7" strokeWidth={1} />
          <line x1={x1 + 8} y1={y1 + 8 + (h * 0.3) / 2} x2={x1 + 8 + w * 0.2} y2={y1 + 8 + (h * 0.3) / 2} stroke="#0284c7" strokeWidth={1} />
          {/* Stainless steel ladder opposite side */}
          <rect x={x2 - 24} y={y2 - 20} width={12} height={10} fill="#ffffff" stroke="#475569" strokeWidth={1} />
          <line x1={x2 - 24} y1={y2 - 15} x2={x2 - 12} y2={y2 - 15} stroke="#475569" strokeWidth={1.5} />
        </g>
      );
    }

    case 'sun_lounger': {
      return (
        <g id="symbol-sun-lounger">
          {/* Lounger body */}
          <rect x={x1} y={y1} width={w * 0.65} height={h} rx={4} fill="#f1ece4" stroke={stroke} strokeWidth={sw} />
          {/* Headrest cushion */}
          <rect x={x1 + 4} y={y1 + 4} width={w * 0.65 - 8} height={20} rx={2} fill="#38bdf8" />
          {/* Slat divisions */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1={x1} y1={y1 + 35 + i * 16} x2={x1 + w * 0.65} y2={y1 + 35 + i * 16} stroke="#cbd5e1" strokeWidth={1} />
          ))}
          {/* Side drinks table */}
          <circle cx={x2 - w * 0.16} cy={0} r={w * 0.14} fill="#e2d9cc" stroke={stroke} strokeWidth={1.2} />
          <circle cx={x2 - w * 0.16} cy={0} r={4} fill="#f59e0b" />
        </g>
      );
    }

    case 'patio_umbrella': {
      const r = Math.min(w, h) * 0.46;
      return (
        <g id="symbol-patio-umbrella">
          {/* 8-panel octagonal parasol */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <path
              key={deg}
              d={`M 0 0 L ${Math.cos((deg * Math.PI) / 180) * r} ${Math.sin((deg * Math.PI) / 180) * r} A ${r} ${r} 0 0 1 ${Math.cos(((deg + 45) * Math.PI) / 180) * r} ${Math.sin(((deg + 45) * Math.PI) / 180) * r} Z`}
              fill={i % 2 === 0 ? '#38bdf8' : '#ffffff'}
              stroke={stroke}
              strokeWidth={1}
            />
          ))}
          {/* Center pole finial */}
          <circle cx={0} cy={0} r={6} fill="#475569" stroke="#ffffff" strokeWidth={1.5} />
        </g>
      );
    }

    case 'bench': {
      return (
        <g id="symbol-bench">
          <rect x={x1} y={y1} width={w} height={h} rx={3} fill="#b45309" stroke={stroke} strokeWidth={sw} />
          <line x1={x1} y1={y1 + h * 0.35} x2={x2} y2={y1 + h * 0.35} stroke="#78350f" strokeWidth={1.5} />
          <line x1={x1} y1={y1 + h * 0.65} x2={x2} y2={y1 + h * 0.65} stroke="#78350f" strokeWidth={1.5} />
          <rect x={x1} y={y1} width={8} height={h} fill="#1e293b" />
          <rect x={x2 - 8} y={y1} width={8} height={h} fill="#1e293b" />
        </g>
      );
    }

    case 'bbq_grill': {
      return (
        <g id="symbol-bbq-grill">
          {/* Grill body */}
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#334155" stroke={stroke} strokeWidth={sw} />
          {/* Center cooking grates */}
          <rect x={-w * 0.25} y={-h * 0.35} width={w * 0.5} height={h * 0.7} rx={2} fill="#0f172a" stroke="#cbd5e1" strokeWidth={1} />
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={i} x1={-w * 0.25} y1={-h * 0.25 + i * (h * 0.5 / 4)} x2={w * 0.25} y2={-h * 0.25 + i * (h * 0.5 / 4)} stroke="#ef4444" strokeWidth={1.2} />
          ))}
          {/* Side prep tables */}
          <line x1={-w * 0.28} y1={y1} x2={-w * 0.28} y2={y2} stroke="#cbd5e1" strokeWidth={1} />
          <line x1={w * 0.28} y1={y1} x2={w * 0.28} y2={y2} stroke="#cbd5e1" strokeWidth={1} />
        </g>
      );
    }

    case 'fence': {
      return (
        <g id="symbol-fence">
          {/* Post and rail line */}
          <line x1={x1} y1={0} x2={x2} y2={0} stroke="#78350f" strokeWidth={3} />
          {/* Picket posts */}
          {Array.from({ length: Math.floor(w / 20) + 1 }).map((_, i) => (
            <rect key={i} x={x1 + i * 20 - 4} y={-halfH} width={8} height={h} rx={2} fill="#b45309" stroke={stroke} strokeWidth={1} />
          ))}
        </g>
      );
    }

    case 'fire_pit': {
      // Circular stone fire pit with glowing center embers & flagstone border
      const r = Math.min(w, h) * 0.44;
      return (
        <g id="symbol-fire-pit">
          {/* Outer flagstone coped ring */}
          <circle cx={0} cy={0} r={r} fill="#78716c" stroke={stroke} strokeWidth={sw} />
          {/* Radial stone joints */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={Math.cos(rad) * (r * 0.65)}
                y1={Math.sin(rad) * (r * 0.65)}
                x2={Math.cos(rad) * r}
                y2={Math.sin(rad) * r}
                stroke="#44403c"
                strokeWidth={1}
              />
            );
          })}
          {/* Fire bowl interior */}
          <circle cx={0} cy={0} r={r * 0.65} fill="#1c1917" stroke="#44403c" strokeWidth={1.5} />
          {/* Glowing charcoal & fire flames */}
          <circle cx={0} cy={0} r={r * 0.35} fill="#dc2626" opacity={0.8} />
          <circle cx={0} cy={0} r={r * 0.2} fill="#f97316" />
          <circle cx={0} cy={0} r={r * 0.08} fill="#fef08a" />
        </g>
      );
    }

    case 'hot_tub': {
      // Outdoor cedar round spa hot tub with bench rim & timber entry steps
      const r = Math.min(w, h) * 0.42;
      return (
        <g id="symbol-hot-tub">
          {/* Timber barrel rim */}
          <circle cx={0} cy={0} r={r} fill="#b45309" stroke={stroke} strokeWidth={sw} />
          {/* Water basin */}
          <circle cx={0} cy={0} r={r - 6} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.2} />
          {/* Hydrotherapy jets */}
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return <circle key={deg} cx={Math.cos(rad) * (r * 0.65)} cy={Math.sin(rad) * (r * 0.65)} r={3} fill="#ffffff" />;
          })}
          {/* Center aerator drain */}
          <circle cx={0} cy={0} r={5} fill="#0284c7" />
          {/* Timber steps on side */}
          <rect x={x2 - 14} y={-halfH * 0.4} width={12} height={h * 0.4} rx={2} fill="#78350f" stroke={stroke} strokeWidth={1} />
          <line x1={x2 - 8} y1={-halfH * 0.4} x2={x2 - 8} y2={0} stroke="#ffffff" strokeWidth={1} />
        </g>
      );
    }

    case 'pergola': {
      // Timber garden shade pergola with 4 structural corner columns & cross-rafters
      return (
        <g id="symbol-pergola">
          {/* 4 Corner columns */}
          <rect x={x1} y={y1} width={10} height={10} fill="#78350f" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - 10} y={y1} width={10} height={10} fill="#78350f" stroke={stroke} strokeWidth={sw} />
          <rect x={x1} y={y2 - 10} width={10} height={10} fill="#78350f" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - 10} y={y2 - 10} width={10} height={10} fill="#78350f" stroke={stroke} strokeWidth={sw} />
          {/* Boundary beam line */}
          <rect x={x1 + 4} y={y1 + 4} width={w - 8} height={h - 8} fill="none" stroke="#78350f" strokeWidth={2} />
          {/* Overhead shade rafters */}
          {Array.from({ length: 6 }).map((_, i) => {
            const rx = x1 + 8 + (i + 1) * ((w - 16) / 7);
            return <line key={i} x1={rx} y1={y1 - 4} x2={rx} y2={y2 + 4} stroke="#9a3412" strokeWidth={2} strokeLinecap="round" />;
          })}
          <text x={0} y={3} textAnchor="middle" fontSize={7} fill="#78350f" fontWeight="bold">PERGOLA</text>
        </g>
      );
    }

    case 'fountain': {
      // Tiered garden ornamental water fountain with concentric rippling basins
      const r = Math.min(w, h) * 0.44;
      return (
        <g id="symbol-fountain">
          {/* Outer large pond basin */}
          <circle cx={0} cy={0} r={r} fill="#bae6fd" stroke={stroke} strokeWidth={sw} />
          {/* Mid-tier bowl */}
          <circle cx={0} cy={0} r={r * 0.65} fill="#7dd3fc" stroke="#0284c7" strokeWidth={1.5} />
          {/* Top pinnacle bowl */}
          <circle cx={0} cy={0} r={r * 0.32} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.5} />
          {/* Center water spray nozzle */}
          <circle cx={0} cy={0} r={4} fill="#ffffff" />
          {/* 4 Radiating water splash ripples */}
          <line x1={-r * 0.8} y1={0} x2={-r * 0.4} y2={0} stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={r * 0.4} y1={0} x2={r * 0.8} y2={0} stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={0} y1={-r * 0.8} x2={0} y2={-r * 0.4} stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={0} y1={r * 0.4} x2={0} y2={r * 0.8} stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" />
        </g>
      );
    }

    case 'stepping_stones': {
      // Organic natural slate garden stepping stones walkway
      return (
        <g id="symbol-stepping-stones">
          <ellipse cx={x1 + w * 0.18} cy={-halfH * 0.3} rx={w * 0.14} ry={h * 0.28} fill="#94a3b8" stroke={stroke} strokeWidth={1.2} />
          <ellipse cx={x1 + w * 0.45} cy={halfH * 0.25} rx={w * 0.15} ry={h * 0.3} fill="#64748b" stroke={stroke} strokeWidth={1.2} />
          <ellipse cx={x1 + w * 0.78} cy={-halfH * 0.2} rx={w * 0.16} ry={h * 0.26} fill="#94a3b8" stroke={stroke} strokeWidth={1.2} />
        </g>
      );
    }

    case 'smart_thermostat': {
      // Smart digital wall thermostat with color display ring & temperature
      const r = Math.min(w, h) * 0.44;
      return (
        <g id="symbol-smart-thermostat">
          <circle cx={0} cy={0} r={r} fill="#0f172a" stroke={stroke} strokeWidth={sw} />
          {/* Heating arc ring */}
          <circle cx={0} cy={0} r={r - 4} fill="none" stroke="#f97316" strokeWidth={2.5} strokeDasharray="30 10" />
          {/* Temperature display */}
          <text x={0} y={3} textAnchor="middle" fontSize={10} fill="#ffffff" fontWeight="bold">72°</text>
          <text x={0} y={r * 0.55} textAnchor="middle" fontSize={5} fill="#38bdf8">AUTO</text>
        </g>
      );
    }

    case 'security_camera': {
      // 360-degree dome CCTV architectural surveillance camera with optical FOV cone
      const r = Math.min(w, h) * 0.38;
      return (
        <g id="symbol-security-camera">
          {/* Vision field of view cone (dashed) */}
          <polygon
            points={`0,0 ${-halfW},${halfH} ${halfW},${halfH}`}
            fill="#38bdf8"
            opacity={0.15}
            stroke="#0284c7"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {/* Base plate */}
          <circle cx={0} cy={0} r={r} fill="#f1f5f9" stroke={stroke} strokeWidth={sw} />
          {/* Inner dark bubble dome */}
          <circle cx={0} cy={0} r={r * 0.65} fill="#0f172a" stroke="#475569" strokeWidth={1} />
          {/* Camera lens & red indicator LED */}
          <circle cx={0} cy={r * 0.25} r={3} fill="#0284c7" />
          <circle cx={r * 0.35} cy={-r * 0.25} r={1.5} fill="#ef4444" />
        </g>
      );
    }

    case 'av_projector': {
      // Ceiling mounted 4K home theater laser projector with lens throw cone
      return (
        <g id="symbol-av-projector">
          {/* Light throw beam */}
          <polygon
            points={`0,${-halfH} ${-halfW},${-halfH - 20} ${halfW},${-halfH - 20}`}
            fill="#fef08a"
            opacity={0.25}
          />
          {/* Chassis body */}
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          {/* Center projector optical lens */}
          <circle cx={0} cy={y1 + 4} r={6} fill="#0284c7" stroke="#ffffff" strokeWidth={1} />
          {/* Cooling vents */}
          <line x1={x1 + 6} y1={0} x2={-8} y2={0} stroke="#475569" strokeWidth={1.5} />
          <line x1={8} y1={0} x2={x2 - 6} y2={0} stroke="#475569" strokeWidth={1.5} />
          <text x={0} y={y2 - 5} textAnchor="middle" fontSize={6} fill="#94a3b8" fontWeight="bold">PROJECTOR</text>
        </g>
      );
    }

    case 'floor_outlet': {
      // Brass flush-mount architectural floor power & data outlet box
      return (
        <g id="symbol-floor-outlet">
          {/* Brass outer flange plate */}
          <rect x={x1} y={y1} width={w} height={h} rx={2} fill="#ca8a04" stroke={stroke} strokeWidth={sw} />
          {/* Dual flip-up receptacle covers */}
          <rect x={x1 + 4} y={y1 + 4} width={halfW - 6} height={h - 8} rx={1} fill="#eab308" stroke="#854d0e" strokeWidth={1} />
          <rect x={2} y={y1 + 4} width={halfW - 6} height={h - 8} rx={1} fill="#eab308" stroke="#854d0e" strokeWidth={1} />
          {/* Power prongs & RJ45 data port */}
          <circle cx={-halfW * 0.5} cy={0} r={2} fill="#0f172a" />
          <rect x={halfW * 0.4} y={-2} width={5} height={4} fill="#0f172a" />
        </g>
      );
    }

    default:
      return null;
  }
};
