import { CategoryName, LibraryItemDef } from '../types';

export const CATEGORIES: CategoryName[] = [
  'Doors',
  'Windows',
  'Furniture',
  'Kitchen',
  'Bathroom',
  'Stairs',
  'Structure',
  'Electrical',
  'Landscape',
  'Annotation',
  'Vehicles',
  'Office',
];

export const CATEGORY_HELP: Record<CategoryName, string> = {
  Doors: 'Doors: Single (LH/RH/45°), double, unequal leaf, pocket, bypass slider, multi-slide, bifold, pivot, French, barn, fire exit & revolving doors.',
  Windows: 'Windows: casement, sash, sliding, bay, corner, curtain wall and skylights.',
  Furniture: 'Furniture: sofas, armchairs, beds, nightstands, dining tables, desks and storage.',
  Kitchen: 'Kitchen: counters, islands, sinks, cooktops, ovens, dishwashers and refrigerators.',
  Bathroom: 'Bathroom: toilets, bidets, urinals, vanities, walk-in showers, soaking tubs and jacuzzis.',
  Stairs: 'Stairs & Lifts: straight, L-shaped, switchback, spiral stairs, elevators and escalators.',
  Structure: 'Structure: partition walls, shear walls, concrete columns, steel I-beams and openings.',
  Electrical: 'Electrical & HVAC: pendant lights, chandeliers, downlights, sconces, switches, vents and panels.',
  Landscape: 'Landscape & Site: trees, palms, planters, hedges, pools, loungers, umbrellas and fences.',
  Annotation: 'Annotations: north arrows, section cut markers, elevation tags, room labels and scale bars.',
  Vehicles: 'Vehicles & Garage: luxury sports cars, executive limousines, prestige SUVs, electric GTs, convertibles, garage doors and parking layouts.',
  Office: 'Commercial & Office: boardroom tables, curved reception desks and modular workstations.',
};

export const LIBRARY_ITEMS: LibraryItemDef[] = [
  // ---------------- DOORS ----------------
  { kind: 'door_single', name: 'Single Swing Door (LH)', category: 'Doors', description: '90° left-hand swing with rebated jambs, lever & strike', defaultWidth: 90, defaultHeight: 85 },
  { kind: 'door_single_rh', name: 'Single Swing Door (RH)', category: 'Doors', description: '90° right-hand swing with rebated jambs, lever & strike', defaultWidth: 90, defaultHeight: 85 },
  { kind: 'door_single_45', name: 'Single Door 45° (Semi-Open)', category: 'Doors', description: '45° open presentation leaf with matching arc & jambs', defaultWidth: 90, defaultHeight: 70 },
  { kind: 'door_double', name: 'Double Swing Door (Equal)', category: 'Doors', description: 'Twin 90° swing leaves with meeting stiles & dual arcs', defaultWidth: 140, defaultHeight: 85 },
  { kind: 'door_unequal_double', name: 'Unequal Double Leaf Door', category: 'Doors', description: 'Active 70% primary leaf + inactive 30% leaf with flush bolts', defaultWidth: 130, defaultHeight: 85 },
  { kind: 'door_sliding', name: '2-Panel Sliding Glass Door', category: 'Doors', description: 'Bypass patio slider with extruded frame & directional track', defaultWidth: 140, defaultHeight: 36 },
  { kind: 'door_multi_slide', name: '3-Panel Stacking Glass Slider', category: 'Doors', description: 'Panoramic 3-leaf cascading glass slider with triple tracks', defaultWidth: 180, defaultHeight: 40 },
  { kind: 'door_pocket', name: 'Single Cavity Pocket Door', category: 'Doors', description: 'In-wall hollow stud pocket frame with flush cup pull', defaultWidth: 110, defaultHeight: 36 },
  { kind: 'door_pocket_double', name: 'Double Cavity Pocket Door', category: 'Doors', description: 'Dual converging in-wall pocket sliding doors', defaultWidth: 160, defaultHeight: 36 },
  { kind: 'door_bifold', name: 'Single Bifold Door (2-Leaf)', category: 'Doors', description: '2-panel folding closet door with pivot pin & overhead track', defaultWidth: 90, defaultHeight: 50 },
  { kind: 'door_bifold_double', name: 'Double Bifold Accordion (4-Leaf)', category: 'Doors', description: '4-panel bi-parting accordion closet/patio door', defaultWidth: 140, defaultHeight: 50 },
  { kind: 'door_pivot', name: 'Modern Architectural Pivot Door', category: 'Doors', description: 'Oversized entry door with 25% offset pivot & vertical pull bar', defaultWidth: 110, defaultHeight: 90 },
  { kind: 'door_french', name: 'Glazed French Doors (Multi-Lite)', category: 'Doors', description: 'Divided lite 6-pane glazed twin leaves with brass levers', defaultWidth: 130, defaultHeight: 80 },
  { kind: 'door_barn', name: 'Sliding Barn Door (Exposed Rail)', category: 'Doors', description: 'Surface-mounted timber barn door with exposed steel trolley rail', defaultWidth: 110, defaultHeight: 40 },
  { kind: 'door_fire_exit', name: 'Commercial Fire Exit Door', category: 'Doors', description: 'Steel egress door with full panic crash bar & exit indicator', defaultWidth: 100, defaultHeight: 90 },
  { kind: 'door_main', name: 'Grand Entry with Sidelights', category: 'Doors', description: 'Luxury entry portal with twin vertical glass sidelight panels', defaultWidth: 160, defaultHeight: 85 },
  { kind: 'door_revolving', name: 'Commercial Revolving Door', category: 'Doors', description: 'Commercial 4-wing revolving glass drum portal with spindle', defaultWidth: 130, defaultHeight: 130 },
  { kind: 'door_tambour', name: 'Security Roll-Up Shutter', category: 'Doors', description: 'Commercial overhead coil shutter with heavy vertical guide rails', defaultWidth: 140, defaultHeight: 45 },

  // ---------------- WINDOWS ----------------
  { kind: 'window_single', name: 'Single Casement Window', category: 'Windows', description: 'Glazed window with exterior masonry sill', defaultWidth: 90, defaultHeight: 35 },
  { kind: 'window_double', name: 'Double Sash Window', category: 'Windows', description: 'Two-lite sash window with central mullion', defaultWidth: 120, defaultHeight: 35 },
  { kind: 'window_sliding', name: 'Sliding Window', category: 'Windows', description: 'Bypass glass slider with direction arrow', defaultWidth: 120, defaultHeight: 35 },
  { kind: 'window_corner', name: 'Corner 90° Window', category: 'Windows', description: 'Modern 90-degree corner mitred glass unit', defaultWidth: 100, defaultHeight: 100 },
  { kind: 'window_bay', name: 'Bay Window', category: 'Windows', description: 'Cantilevered 3-sided projecting bay window', defaultWidth: 140, defaultHeight: 65 },
  { kind: 'window_large', name: 'Curtain Wall / Large Glass', category: 'Windows', description: 'Floor-to-ceiling panoramic glass facade', defaultWidth: 180, defaultHeight: 35 },
  { kind: 'window_skylight', name: 'Roof Skylight', category: 'Windows', description: 'Roof glazing with diagonal opening frame', defaultWidth: 80, defaultHeight: 80 },
  { kind: 'window_arched', name: 'Arched Roman Window', category: 'Windows', description: 'Classical semicircular fanlight window with radiating mullions', defaultWidth: 100, defaultHeight: 70 },
  { kind: 'window_louvre', name: 'Louvre / Jalousie Window', category: 'Windows', description: 'Ventilating glass louvre slats with mechanical crank pivot', defaultWidth: 90, defaultHeight: 40 },
  { kind: 'window_clerestory', name: 'Continuous Clerestory Ribbon', category: 'Windows', description: 'High-level horizontal ribbon glazing band with structural divisions', defaultWidth: 180, defaultHeight: 30 },
  { kind: 'window_garden', name: 'Greenhouse Garden Window', category: 'Windows', description: 'Projecting 3-sided glass plant showcase shelf with potted herbs', defaultWidth: 120, defaultHeight: 55 },

  // ---------------- FURNITURE ----------------
  { kind: 'sofa', name: '3-Seater Sofa', category: 'Furniture', description: 'Upholstered sofa with ergonomic cushions', defaultWidth: 150, defaultHeight: 75 },
  { kind: 'armchair', name: 'Lounge Armchair', category: 'Furniture', description: 'Single accent club chair with arm pads', defaultWidth: 75, defaultHeight: 75 },
  { kind: 'lsofa', name: 'L-Sectional Sofa', category: 'Furniture', description: 'Corner sectional lounge with throw pillows', defaultWidth: 160, defaultHeight: 140 },
  { kind: 'sofa_u', name: 'U-Shaped Modular Sectional', category: 'Furniture', description: 'Luxury U-couch with center cocktail ottoman table', defaultWidth: 180, defaultHeight: 160 },
  { kind: 'chaise_lounge', name: 'Modern Chaise Lounge', category: 'Furniture', description: 'Contoured single chaise with bolster pillow and tufting', defaultWidth: 140, defaultHeight: 65 },
  { kind: 'coffee_table', name: 'Coffee Table & Rug', category: 'Furniture', description: 'Living area table on woven area rug', defaultWidth: 110, defaultHeight: 70 },
  { kind: 'bed', name: 'King Bed & Nightstands', category: 'Furniture', description: 'Master bed with dual pillows & side lamps', defaultWidth: 170, defaultHeight: 160 },
  { kind: 'bed_single', name: 'Single Twin Bed', category: 'Furniture', description: 'Single bed with headboard & side table', defaultWidth: 100, defaultHeight: 150 },
  { kind: 'bed_bunk', name: 'Twin Bunk Bed with Ladder', category: 'Furniture', description: 'Stacked twin bed with structural corner posts and side ladder', defaultWidth: 110, defaultHeight: 160 },
  { kind: 'bed_crib', name: 'Nursery Baby Crib', category: 'Furniture', description: 'Slatted timber infant crib with mattress and bedding', defaultWidth: 80, defaultHeight: 110 },
  { kind: 'dining', name: 'Round Dining Table', category: 'Furniture', description: 'Circular table with 6 upholstered chairs', defaultWidth: 120, defaultHeight: 120 },
  { kind: 'dining_rect', name: 'Banquet Dining Table', category: 'Furniture', description: 'Rectangular 8-seater dining arrangement', defaultWidth: 160, defaultHeight: 90 },
  { kind: 'sideboard', name: 'Dining Credenza / Sideboard', category: 'Furniture', description: 'Storage cabinet with multiple drawers and brass hardware', defaultWidth: 150, defaultHeight: 45 },
  { kind: 'desk', name: 'Executive Desk', category: 'Furniture', description: 'Workstation with task chair & laptop', defaultWidth: 130, defaultHeight: 80 },
  { kind: 'wardrobe', name: 'Built-in Wardrobe', category: 'Furniture', description: 'Closet system with hangers & sliding doors', defaultWidth: 140, defaultHeight: 60 },
  { kind: 'bookshelf', name: 'Bookshelf / Display', category: 'Furniture', description: 'Architectural joinery shelving cabinet', defaultWidth: 120, defaultHeight: 40 },
  { kind: 'tv', name: 'Media Credenza & TV', category: 'Furniture', description: 'Entertainment unit with wall-mounted TV', defaultWidth: 140, defaultHeight: 45 },
  { kind: 'fireplace', name: 'Modern Hearth Fireplace', category: 'Furniture', description: 'Architectural fireplace with logs, glass guard and flame bed', defaultWidth: 130, defaultHeight: 50 },
  { kind: 'area_rug', name: 'Geometric Area Rug', category: 'Furniture', description: 'Woven floor accent rug with patterned border and fringe edges', defaultWidth: 160, defaultHeight: 110 },
  { kind: 'piano_grand', name: 'Concert Grand Piano', category: 'Furniture', description: 'Curved acoustic baby/grand piano with keyboard and bench', defaultWidth: 140, defaultHeight: 130 },
  { kind: 'recreation_pool_table', name: 'Billiard / Pool Table', category: 'Furniture', description: 'Regulation 8-ball felt pool table with 6 pockets and racked balls', defaultWidth: 160, defaultHeight: 90 },
  { kind: 'gaming_table', name: 'Ping Pong / Table Tennis', category: 'Furniture', description: 'Tournament table tennis with center net, bats on both sides, and ball', defaultWidth: 170, defaultHeight: 100 },

  // ---------------- KITCHEN ----------------
  { kind: 'kitchen_counter', name: 'Kitchen Countertop', category: 'Kitchen', description: 'Counters with double sink & 4-burner hob', defaultWidth: 180, defaultHeight: 65 },
  { kind: 'kitchen_l', name: 'L-Shaped Kitchen', category: 'Kitchen', description: 'Corner kitchen layout with sink & stove', defaultWidth: 160, defaultHeight: 140 },
  { kind: 'kitchen_u', name: 'U-Shaped Kitchen', category: 'Kitchen', description: 'Three-sided chef workspace layout', defaultWidth: 170, defaultHeight: 150 },
  { kind: 'island', name: 'Kitchen Prep Island', category: 'Kitchen', description: 'Central island counter with 3 barstools', defaultWidth: 150, defaultHeight: 75 },
  { kind: 'bar_counter', name: 'Breakfast Bar & 4 Stools', category: 'Kitchen', description: 'Extended eating countertop with 4 circular barstools', defaultWidth: 160, defaultHeight: 80 },
  { kind: 'corner_cabinet', name: 'Lazy Susan Corner Base', category: 'Kitchen', description: 'L-corner kitchen cabinet with revolving carousel organizer', defaultWidth: 100, defaultHeight: 100 },
  { kind: 'butler_pantry', name: "Butler's Pantry Storage", category: 'Kitchen', description: 'Deep floor-to-ceiling dry goods shelving and container bins', defaultWidth: 130, defaultHeight: 50 },
  { kind: 'sink', name: 'Double Bowl Sink', category: 'Kitchen', description: 'Under-mount sink with drainer grooves', defaultWidth: 90, defaultHeight: 55 },
  { kind: 'sink_farmhouse', name: 'Farmhouse Apron Sink', category: 'Kitchen', description: 'Deep ceramic apron-front basin with luxury bridge faucet', defaultWidth: 85, defaultHeight: 60 },
  { kind: 'stove', name: 'Cooktop Range', category: 'Kitchen', description: '4-zone induction/gas cooktop with knobs', defaultWidth: 70, defaultHeight: 65 },
  { kind: 'oven_tower', name: 'Built-in Oven Tower', category: 'Kitchen', description: 'Tall cabinet with oven, microwave & pantry', defaultWidth: 65, defaultHeight: 65 },
  { kind: 'dishwasher', name: 'Dishwasher Unit', category: 'Kitchen', description: 'Under-counter integrated 600mm dishwasher', defaultWidth: 60, defaultHeight: 60 },
  { kind: 'fridge', name: 'French Door Fridge', category: 'Kitchen', description: 'Double refrigerator with ice dispenser', defaultWidth: 80, defaultHeight: 75 },
  { kind: 'wine_cooler', name: 'Under-counter Wine Chiller', category: 'Kitchen', description: 'Glass door dual-zone wine storage refrigerator with bottle racks', defaultWidth: 65, defaultHeight: 65 },
  { kind: 'coffee_station', name: 'Espresso & Coffee Bar', category: 'Kitchen', description: 'Barista countertop unit with dual portafilters and cup rack', defaultWidth: 90, defaultHeight: 50 },

  // ---------------- BATHROOM ----------------
  { kind: 'toilet', name: 'Elongated Toilet (WC)', category: 'Bathroom', description: 'Water closet with dual-flush cistern', defaultWidth: 55, defaultHeight: 75 },
  { kind: 'bidet', name: 'Ceramic Bidet', category: 'Bathroom', description: 'Matching ceramic bidet fixture & tap', defaultWidth: 50, defaultHeight: 65 },
  { kind: 'urinal', name: 'Wall-Hung Urinal', category: 'Bathroom', description: 'Commercial/residential urinal with flush valve', defaultWidth: 45, defaultHeight: 45 },
  { kind: 'basin', name: 'Single Vanity Sink', category: 'Bathroom', description: 'Vanity basin with single-lever mixer tap', defaultWidth: 70, defaultHeight: 55 },
  { kind: 'double_basin', name: 'Double Master Vanity', category: 'Bathroom', description: 'Dual vessel vanity with mirror base', defaultWidth: 140, defaultHeight: 60 },
  { kind: 'makeup_vanity', name: 'Dressing Makeup Vanity', category: 'Bathroom', description: 'Vanity console with Hollywood illuminated mirror and cushioned stool', defaultWidth: 100, defaultHeight: 65 },
  { kind: 'shower', name: 'Walk-in Glass Shower', category: 'Bathroom', description: 'Frameless glass enclosure with trench drain', defaultWidth: 95, defaultHeight: 95 },
  { kind: 'shower_corner', name: 'Curved Corner Glass Shower', category: 'Bathroom', description: 'Neo-angle quadrant shower enclosure with curved glass slider', defaultWidth: 105, defaultHeight: 105 },
  { kind: 'ada_shower', name: 'ADA Roll-In Accessible Shower', category: 'Bathroom', description: 'Zero-barrier threshold shower with wall grab bars and fold seat', defaultWidth: 110, defaultHeight: 110 },
  { kind: 'bathtub', name: 'Freestanding Bathtub', category: 'Bathroom', description: 'Luxury oval soaking tub with floor mixer', defaultWidth: 150, defaultHeight: 75 },
  { kind: 'bathtub_clawfoot', name: 'Vintage Clawfoot Tub', category: 'Bathroom', description: 'Cast-iron freestanding soaking bathtub with brass feet & floor mixer', defaultWidth: 150, defaultHeight: 75 },
  { kind: 'jacuzzi', name: 'Corner Jacuzzi Spa', category: 'Bathroom', description: 'Whirlpool hydrotherapy tub with jets', defaultWidth: 130, defaultHeight: 130 },
  { kind: 'sauna', name: 'Finnish Cedar Sauna Room', category: 'Bathroom', description: 'Thermal timber sauna with 2-tier benches and electric rock heater', defaultWidth: 150, defaultHeight: 130 },
  { kind: 'mirror', name: 'Backlit Vanity Mirror', category: 'Bathroom', description: 'Wall mirror with ambient sconces', defaultWidth: 80, defaultHeight: 25 },

  // ---------------- STAIRS & LIFTS ----------------
  { kind: 'stairs_straight', name: 'Straight Flight Stairs', category: 'Stairs', description: 'Direct treads with handrail & UP arrow', defaultWidth: 85, defaultHeight: 180 },
  { kind: 'stairs_l', name: 'L-Shaped Quarter Turn', category: 'Stairs', description: '90-degree corner landing stairs with arrow', defaultWidth: 140, defaultHeight: 140 },
  { kind: 'stairs_u', name: 'U-Shaped Switchback', category: 'Stairs', description: '180-degree turn switchback with landing', defaultWidth: 140, defaultHeight: 160 },
  { kind: 'stairs_spiral', name: 'Spiral Helical Stairs', category: 'Stairs', description: 'Circular staircase with central column', defaultWidth: 130, defaultHeight: 130 },
  { kind: 'ramp_ada', name: 'ADA Wheelchair Access Ramp', category: 'Stairs', description: '1:12 slope barrier-free ramp with twin continuous handrails', defaultWidth: 180, defaultHeight: 80 },
  { kind: 'elevator', name: 'Passenger Elevator', category: 'Stairs', description: 'Elevator car, shaft wall, doors & counterweight', defaultWidth: 120, defaultHeight: 120 },
  { kind: 'escalator', name: 'Escalator Flight', category: 'Stairs', description: 'Commercial moving staircase with handrails', defaultWidth: 85, defaultHeight: 180 },

  // ---------------- STRUCTURE ----------------
  { kind: 'wall', name: 'Partition Wall', category: 'Structure', description: 'Wall segment with architectural hatching', defaultWidth: 180, defaultHeight: 24 },
  { kind: 'shear_wall', name: 'RC Shear Core Wall', category: 'Structure', description: 'Heavy reinforced concrete structural wall', defaultWidth: 180, defaultHeight: 30 },
  { kind: 'opening_door', name: 'Cased Door Opening', category: 'Structure', description: 'Wall opening portal without door leaf', defaultWidth: 90, defaultHeight: 26 },
  { kind: 'opening_window', name: 'Rough Window Opening', category: 'Structure', description: 'Unobstructed wall window opening', defaultWidth: 100, defaultHeight: 26 },
  { kind: 'column_square', name: 'Square Column', category: 'Structure', description: 'Concrete pillar with center cross', defaultWidth: 45, defaultHeight: 45 },
  { kind: 'column_round', name: 'Round Column', category: 'Structure', description: 'Cylindrical structural concrete column', defaultWidth: 45, defaultHeight: 45 },
  { kind: 'column_i_beam', name: 'Steel I-Beam Column', category: 'Structure', description: 'Structural wide-flange W/H steel column', defaultWidth: 45, defaultHeight: 45 },
  { kind: 'beam', name: 'Overhead Beam', category: 'Structure', description: 'Structural girder line (dashed overhead)', defaultWidth: 180, defaultHeight: 22 },
  { kind: 'roof_skylight_vault', name: 'Barrel Vaulted Skylight', category: 'Structure', description: 'Longitudinal architectural ridge lantern roof glazing with hips', defaultWidth: 170, defaultHeight: 70 },
  { kind: 'fireplace_chimney', name: 'Masonry Chimney Flue', category: 'Structure', description: 'Solid brick chimney core with dual terracotta flue liners', defaultWidth: 120, defaultHeight: 65 },

  // ---------------- ELECTRICAL & HVAC ----------------
  { kind: 'light', name: 'Ceiling Pendant Light', category: 'Electrical', description: 'Pendant light with radial illumination', defaultWidth: 50, defaultHeight: 50 },
  { kind: 'chandelier', name: 'Modern Chandelier', category: 'Electrical', description: 'Multi-branch designer dining chandelier', defaultWidth: 70, defaultHeight: 70 },
  { kind: 'downlight', name: 'Recessed Downlight', category: 'Electrical', description: 'Ceiling recessed spot fixture', defaultWidth: 40, defaultHeight: 40 },
  { kind: 'track_light', name: 'Track Lighting Rail', category: 'Electrical', description: 'Ceiling track with 3 adjustable spots', defaultWidth: 110, defaultHeight: 35 },
  { kind: 'wall_light', name: 'Wall Sconce Light', category: 'Electrical', description: 'Up/down architectural wall luminaire', defaultWidth: 40, defaultHeight: 30 },
  { kind: 'switch', name: 'Wall Light Switch', category: 'Electrical', description: 'Wall toggle switch plate', defaultWidth: 35, defaultHeight: 35 },
  { kind: 'socket', name: 'Duplex Power Receptacle', category: 'Electrical', description: 'Wall 120/240V dual socket receptacle', defaultWidth: 40, defaultHeight: 35 },
  { kind: 'floor_outlet', name: 'In-Floor Brass Outlet Box', category: 'Electrical', description: 'Flush architectural floor receptacle for power and data ports', defaultWidth: 45, defaultHeight: 35 },
  { kind: 'smart_thermostat', name: 'Smart Touchscreen Thermostat', category: 'Electrical', description: 'Wall mounted digital climate control with active temp halo', defaultWidth: 40, defaultHeight: 40 },
  { kind: 'security_camera', name: 'Dome CCTV Security Camera', category: 'Electrical', description: 'Ceiling mounted 360° surveillance camera with field-of-view cone', defaultWidth: 50, defaultHeight: 50 },
  { kind: 'av_projector', name: 'Ceiling Laser 4K Projector', category: 'Electrical', description: 'Home cinema overhead projector with optical lens throw cone', defaultWidth: 70, defaultHeight: 55 },
  { kind: 'fan', name: 'Ceiling Fan & Light', category: 'Electrical', description: '4-blade aero ceiling fan with light kit', defaultWidth: 95, defaultHeight: 95 },
  { kind: 'smoke_detector', name: 'Smoke Detector', category: 'Electrical', description: 'Life-safety fire alarm sensor', defaultWidth: 40, defaultHeight: 40 },
  { kind: 'ac_vent', name: 'HVAC Air Diffuser', category: 'Electrical', description: '4-way ceiling supply air register', defaultWidth: 45, defaultHeight: 45 },
  { kind: 'elec_panel', name: 'Electrical Panel', category: 'Electrical', description: 'Main circuit breaker distribution board', defaultWidth: 60, defaultHeight: 25 },

  // ---------------- LANDSCAPE & SITE ----------------
  { kind: 'tree', name: 'Canopy Shade Tree', category: 'Landscape', description: 'Detailed architectural foliage & branches', defaultWidth: 120, defaultHeight: 120 },
  { kind: 'palm_tree', name: 'Fan Palm Tree', category: 'Landscape', description: 'Tropical radial palm fronds & trunk', defaultWidth: 120, defaultHeight: 120 },
  { kind: 'plant', name: 'Indoor Potted Plant', category: 'Landscape', description: 'Terracotta planter with lush monstera leaves', defaultWidth: 60, defaultHeight: 60 },
  { kind: 'hedge', name: 'Garden Privacy Hedge', category: 'Landscape', description: 'Clipped evergreen shrub boundary', defaultWidth: 160, defaultHeight: 35 },
  { kind: 'pool', name: 'Swimming Pool & Steps', category: 'Landscape', description: 'In-ground swimming pool with corner steps', defaultWidth: 220, defaultHeight: 130 },
  { kind: 'hot_tub', name: 'Cedar Spa Hot Tub', category: 'Landscape', description: 'Outdoor round timber hydrotherapy spa tub with access steps', defaultWidth: 140, defaultHeight: 140 },
  { kind: 'sun_lounger', name: 'Poolside Sun Lounger', category: 'Landscape', description: 'Adjustable chaise lounge with drinks table', defaultWidth: 70, defaultHeight: 140 },
  { kind: 'patio_umbrella', name: 'Patio Umbrella & Table', category: 'Landscape', description: 'Octagonal shade parasol with bistro table', defaultWidth: 120, defaultHeight: 120 },
  { kind: 'pergola', name: 'Timber Garden Pergola', category: 'Landscape', description: 'Four-column shade structure with overhead timber rafters', defaultWidth: 160, defaultHeight: 160 },
  { kind: 'fountain', name: 'Tiered Water Fountain', category: 'Landscape', description: 'Ornamental tiered water fountain with concentric splash basins', defaultWidth: 130, defaultHeight: 130 },
  { kind: 'fire_pit', name: 'Stone Outdoor Fire Pit', category: 'Landscape', description: 'Circular stone hearth with radiating flagstone ring and embers', defaultWidth: 120, defaultHeight: 120 },
  { kind: 'stepping_stones', name: 'Slate Stepping Stones Path', category: 'Landscape', description: 'Natural flagstone meandering pathway across lawn or gravel', defaultWidth: 150, defaultHeight: 45 },
  { kind: 'bench', name: 'Park Bench', category: 'Landscape', description: 'Outdoor slatted wood & metal bench', defaultWidth: 100, defaultHeight: 40 },
  { kind: 'bbq_grill', name: 'Outdoor BBQ Station', category: 'Landscape', description: 'Patio barbecue grill with prep shelves', defaultWidth: 110, defaultHeight: 60 },
  { kind: 'fence', name: 'Boundary Fence', category: 'Landscape', description: 'Boundary post & rail barrier fence', defaultWidth: 180, defaultHeight: 25 },

  // ---------------- ANNOTATION ----------------
  { kind: 'custom_name_tag', name: 'Name / Text Label', category: 'Annotation', description: 'Architectural custom text & name badge — click or drag to canvas and name it whatever you want', defaultWidth: 130, defaultHeight: 44 },
  { kind: 'north_arrow', name: 'North Compass Arrow', category: 'Annotation', description: 'Standard architectural north orientation', defaultWidth: 80, defaultHeight: 100 },
  { kind: 'section_marker', name: 'Section Cut Marker', category: 'Annotation', description: 'Cutting plane callout with arrow & sheet bubble', defaultWidth: 140, defaultHeight: 50 },
  { kind: 'elevation_marker', name: 'Elevation Callout', category: 'Annotation', description: 'Exterior/interior elevation pointer symbol', defaultWidth: 60, defaultHeight: 60 },
  { kind: 'room_tag', name: 'Room Tag & Area', category: 'Annotation', description: 'Architectural space label with room area', defaultWidth: 120, defaultHeight: 50 },
  { kind: 'scale_bar', name: 'Graphic Scale Bar', category: 'Annotation', description: 'Calibrated metric architectural scale ruler', defaultWidth: 160, defaultHeight: 30 },

  // ---------------- VEHICLES & GARAGE ----------------
  { kind: 'luxury_supercar', name: 'Luxury Sports Supercar', category: 'Vehicles', description: 'Aerodynamic exotic supercar with wide rear haunches, carbon wing & mid-engine bay', defaultWidth: 104, defaultHeight: 195 },
  { kind: 'luxury_limousine', name: 'Ultra-Luxury Limousine', category: 'Vehicles', description: 'Flagship extended wheelbase executive saloon with chrome pantheon grille & dual starlight panoramic roof', defaultWidth: 110, defaultHeight: 225 },
  { kind: 'luxury_ev_coupe', name: 'Luxury Electric Gran Turismo', category: 'Vehicles', description: 'High-performance aerodynamic EV with full-glass canopy roof, flush handles & matrix light signature', defaultWidth: 106, defaultHeight: 200 },
  { kind: 'luxury_suv', name: 'Luxury Flagship SUV', category: 'Vehicles', description: 'Prestige full-size luxury SUV with dual panoramic moonroof, clamshell hood & twin roof spoiler', defaultWidth: 116, defaultHeight: 212 },
  { kind: 'luxury_convertible', name: 'Luxury Grand Tourer Convertible', category: 'Vehicles', description: 'Open-top grand tourer with stitched leather 2+2 cockpit, dashboard console & speedster deck fairings', defaultWidth: 104, defaultHeight: 195 },
  { kind: 'car_sedan', name: 'Executive Sedan Car', category: 'Vehicles', description: 'Top-down automobile for driveway & garage', defaultWidth: 100, defaultHeight: 190 },
  { kind: 'car_suv', name: 'Full-Size SUV', category: 'Vehicles', description: 'Top-down 4x4 SUV with roof rails', defaultWidth: 110, defaultHeight: 200 },
  { kind: 'vehicle_truck', name: 'Crew Cab Pickup Truck', category: 'Vehicles', description: 'Full-size crew cab pickup truck with open cargo bed and mirrors', defaultWidth: 110, defaultHeight: 220 },
  { kind: 'vehicle_motorcycle', name: 'Touring Motorcycle', category: 'Vehicles', description: 'Two-wheel motorcycle with handlebars, fuel tank and leather saddle', defaultWidth: 45, defaultHeight: 120 },
  { kind: 'ev_charger', name: 'EV Fast Charging Station', category: 'Vehicles', description: 'Electric vehicle charging pedestal with dual holstered cables', defaultWidth: 60, defaultHeight: 60 },
  { kind: 'golf_cart', name: 'Electric Golf / Resort Cart', category: 'Vehicles', description: 'Four-passenger electric buggy with canopy roof and steering wheel', defaultWidth: 85, defaultHeight: 150 },
  { kind: 'door_garage', name: 'Garage Roll-up Door', category: 'Vehicles', description: 'Sectional overhead garage door & wall tracks', defaultWidth: 180, defaultHeight: 60 },
  { kind: 'bicycle', name: 'Commuter Bicycle', category: 'Vehicles', description: 'City bicycle with handlebars, frame & wheels', defaultWidth: 40, defaultHeight: 110 },

  // ---------------- OFFICE & COMMERCIAL ----------------
  { kind: 'conference_table', name: 'Boardroom Table (10p)', category: 'Office', description: 'Executive racetrack table with 10 chairs', defaultWidth: 200, defaultHeight: 100 },
  { kind: 'reception_desk', name: 'Curved Reception Desk', category: 'Office', description: 'Welcoming counter with monitor & chair', defaultWidth: 160, defaultHeight: 100 },
  { kind: 'cubicle_workstation', name: 'Dual Workstation Pod', category: 'Office', description: 'Two-person desk with acoustic screen & monitors', defaultWidth: 160, defaultHeight: 120 },
  { kind: 'meeting_booth', name: 'Acoustic 4-Person Huddle Pod', category: 'Office', description: 'Soundproof privacy meeting booth with dual banquettes and table', defaultWidth: 150, defaultHeight: 120 },
  { kind: 'drafting_table', name: 'Architect Drafting Table', category: 'Office', description: 'Tilt drafting board with straightedge, desk lamp and high stool', defaultWidth: 120, defaultHeight: 95 },
  { kind: 'filing_cabinet', name: '4-Drawer Lateral File Cabinet', category: 'Office', description: 'Heavy gauge steel office filing cabinet with hardware pulls', defaultWidth: 100, defaultHeight: 50 },
  { kind: 'presentation_screen', name: 'Mobile 75" AV Screen Cart', category: 'Office', description: 'Ultra-HD interactive display whiteboard on heavy rolling stand', defaultWidth: 130, defaultHeight: 45 },
  { kind: 'vending_machine', name: 'Beverage Vending Machine', category: 'Office', description: 'Breakroom automated drink and snack dispenser with glass front', defaultWidth: 85, defaultHeight: 70 },
  { kind: 'gym_treadmill', name: 'Commercial Running Treadmill', category: 'Office', description: 'Fitness cardio treadmill with textured belt and digital console', defaultWidth: 70, defaultHeight: 140 },
  { kind: 'gym_spin_bike', name: 'Studio Spin Exercise Bike', category: 'Office', description: 'Stationary cycle with weighted flywheel, bullhorns and racing seat', defaultWidth: 50, defaultHeight: 100 },
];

export const ITEMS_BY_CATEGORY: Record<CategoryName, LibraryItemDef[]> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = LIBRARY_ITEMS.filter((item) => item.category === cat);
    return acc;
  },
  {} as Record<CategoryName, LibraryItemDef[]>
);

export const CATEGORY_COUNTS: Record<CategoryName, number> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = ITEMS_BY_CATEGORY[cat]?.length || 0;
    return acc;
  },
  {} as Record<CategoryName, number>
);
