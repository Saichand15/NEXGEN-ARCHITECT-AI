// Building massing + real floor-level zoning for
// "126-134 S. Northwest Hwy, Palatine, IL 60074" (Sheets T-1, A-1, A-2, A-3, A-4).
//
// Dimensions below are read directly from the plan's own dimension strings and
// the East/North elevation sheets:
//   - Front (East) storefront dimension string:
//     13'-11 1/4" + 9'-11 1/4" + 13'-1 1/2" + 9'-11 1/4" + 13'-1 1/2" + 9'-11 1/4" + 13'-1 1/2"
//     = 83.125 ft total frontage.
//   - Side (depth) dimension string: 10'-0" x5 + 9'-11" = 59'-11" = 59.917 ft.
//   - The front-left corner (Store C foyer) is chamfered at 45 deg.
//   - Floor heights from East elevation: 1st floor ~13 ft (storefront + sign
//     band), 2nd floor 10'-0", parapet ~4'-0".

export type BuildingFace = 'front' | 'back' | 'left' | 'right';
export type ZoneId = 'storeC' | 'core' | 'storeB' | 'storeA';

export interface BuildingPlanInfo {
  projectName: string;
  address: string;
  architect: string;
  sourceSheets: string[];
  widthFt: number; // East (front) elevation frontage
  depthFt: number; // North/South side elevation depth
  chamferFt: number; // front-left 45 deg corner chamfer leg length
  floors: {
    label: string;
    heightFt: number;
    use: string;
  }[];
  parapetHeightFt: number;
  totalGrossAreaSf: number;
}

export const BUILDING_PLAN: BuildingPlanInfo = {
  projectName: '126-134 S. Northwest Hwy Remodel',
  address: '126-134 S. Northwest Highway, Palatine, IL 60074',
  architect: 'H.C. Fang, Illinois Licensed Architect No. 001-011348',
  sourceSheets: ['T-1', 'A-1', 'A-2', 'A-3', 'A-4'],
  widthFt: 83.125, // 83'-1 1/2" front (East) from dimension string
  depthFt: 59.917, // 59'-11" side (North/South) from dimension string
  chamferFt: 9.94, // front-left 45 deg chamfer leg (13'-11 1/4" diagonal)
  floors: [
    { label: '1st Floor — Retail A / B / C', heightFt: 13, use: 'retail' },
    { label: '2nd Floor — Apartments 1 / 2 / 3', heightFt: 10, use: 'residential' },
  ],
  parapetHeightFt: 4,
  totalGrossAreaSf: 5015.1 + 3251.7,
};

// Building footprint outline (x = width/left-right, z = depth/front-back),
// centered on origin, FRONT at +z. Front-left corner is chamfered 45 deg.
// Ordered counter-clockwise starting at front-right corner.
export function footprintPolygon(): [number, number][] {
  const W = BUILDING_PLAN.widthFt;
  const D = BUILDING_PLAN.depthFt;
  const c = BUILDING_PLAN.chamferFt;
  const xR = W / 2; // right
  const xL = -W / 2; // left
  const zF = D / 2; // front
  const zB = -D / 2; // back
  return [
    [xR, zF],           // front-right
    [xR, zB],           // rear-right
    [xL, zB],           // rear-left
    [xL, zF - c],       // left wall down to chamfer start
    [xL + c, zF],       // 45 deg chamfer to front wall
  ];
}

export const BUILDING_FACES: { id: BuildingFace; label: string; note: string }[] = [
  { id: 'front', label: 'Front (East) — Storefronts', note: 'Main highway-facing facade, 3 retail storefront bays' },
  { id: 'back', label: 'Back (West)', note: 'Rear elevation, garbage area & service doors' },
  { id: 'left', label: 'Left (South)', note: 'Side elevation facing 126' },
  { id: 'right', label: 'Right (North)', note: 'Side elevation facing 134' },
];

// --- Ground floor zones -----------------------------------------------
// Zone widths along the 83.125 ft frontage. The Store C (132, foyer/office,
// single-story, low-parapet) share of the frontage is measured directly
// from the real New East Elevation drawing (the low 2-bay section spans
// ~48% of the overall building width before stepping up to the tall
// 2-story block) rather than from room-schedule area, since the office
// suite's low 1-story massing takes up noticeably more frontage than its
// interior floor area alone would suggest. The remaining width (core +
// Store B + Store A, all under the tall block) is split using each
// store's net room-schedule area from the A-1 Room Finishing Schedule:
//   Store B (130): 1373.3 sf   Store A (126-128): 1451.9 sf
// Stair + fire-sprinkler core (C01 + C02) is given a fixed 10 ft width.
const STORE_C_WIDTH_FRACTION = 0.478;
const NET_AREA = { storeB: 1373.3, storeA: 1451.9 };
const CORE_WIDTH_FT = 10;

function computeGroundZones() {
  const W = BUILDING_PLAN.widthFt;
  const wC = W * STORE_C_WIDTH_FRACTION;
  const remaining = W - wC - CORE_WIDTH_FT;
  const total = NET_AREA.storeB + NET_AREA.storeA;
  const wB = (NET_AREA.storeB / total) * remaining;
  const wA = (NET_AREA.storeA / total) * remaining;

  let cursor = -W / 2;
  const mk = (id: ZoneId, label: string, width: number, glazed: boolean) => {
    const x0 = cursor;
    const x1 = cursor + width;
    cursor = x1;
    return { id, label, x0, x1, glazed };
  };

  return [
    mk('storeC', 'Foyer / Retail C (132)', wC, true),
    mk('core', 'Stair / Sprinkler Core', CORE_WIDTH_FT, false),
    mk('storeB', 'Retail B (130)', wB, true),
    mk('storeA', 'Retail A (126-128)', wA, true),
  ];
}

export interface GroundZone {
  id: ZoneId;
  label: string;
  x0: number;
  x1: number;
  glazed: boolean;
}

export const GROUND_ZONES: GroundZone[] = computeGroundZones();

// --- 2nd-floor apartment-to-zone mapping -------------------------------
// Stair core lands in the same X range on both floors; the 3 apartment units
// (A-2 Apartment Light & Vent Schedule) map onto the 3 storefront footprints:
//   Unit 1 = 1210.9 sf (largest)  -> storeA zone (widest)
//   Unit 3 =  973.3 sf            -> storeC zone
//   Unit 2 =  897.0 sf (smallest) -> storeB zone (narrowest)
// Window counts are the real A-2 Window Schedule totals (W-1..W-4).
export const UPPER_UNIT_BY_ZONE: Record<ZoneId, { unitId: string; label: string; windows: number } | null> = {
  storeA: { unitId: 'unit1', label: 'Unit 1', windows: 7 },
  storeC: { unitId: 'unit3', label: 'Unit 3', windows: 10 },
  storeB: { unitId: 'unit2', label: 'Unit 2', windows: 5 },
  core: null,
};

// Storefront bay rhythm along the front (East) elevation, from the elevation
// dimension string. Alternating wide (13'-1 1/2") and narrow (9'-11 1/4") bays.
export const STOREFRONT_BAYS_FT = [13.9375, 9.9375, 13.125, 9.9375, 13.125, 9.9375, 13.125];

