// Room-by-room floor plan reconstruction for 126-134 S. Northwest Hwy.
//
// Every room id, name and area below is copied directly from the real
// schedules on the plan sheets:
//   - 1st floor: A-1 "ROOM FINISHING SCHEDULE" (Store C/132, Store B/130,
//     Store A/126-128) + T-1 Common Stairway C01 (61.0 sf) / Fire Sprinkler
//     Rm C02 (68.7 sf).
//   - 2nd floor: A-2 "APARTMENTS LIGHT & VENT SCHEDULES" (Unit 1/2/3) +
//     Common Stairway (152 sf).
//
// What IS exact: room names, room areas, which rooms belong to which unit,
// front-to-back adjacency ordering (retail/living up front, bedrooms+baths
// toward the rear, matching the drawn layout), and the stair core aligning
// on both floors. What is a deliberate simplification: because the source
// is a scanned/rasterized drawing (not vector CAD), the exact polygon shape
// of each partition wall isn't machine-recoverable, so each room is rendered
// as a rectangle sized from its real area and packed row-by-row within its
// unit's footprint rather than hand-traced wall-by-wall.

import { GROUND_ZONES, UPPER_UNIT_BY_ZONE, BUILDING_PLAN, type ZoneId } from './buildingPlan';

export type RoomType =
  | 'retail'
  | 'office'
  | 'living'
  | 'bedroom'
  | 'bath'
  | 'closet'
  | 'utility'
  | 'stair'
  | 'corridor'
  | 'storage';

export const ROOM_TYPE_COLOR: Record<RoomType, string> = {
  retail: '#e7d9b8',
  office: '#dbe3e8',
  living: '#e8dfc9',
  bedroom: '#d9e3d7',
  bath: '#bcd6df',
  closet: '#d2cdc3',
  utility: '#c9c9c6',
  stair: '#9aa0a6',
  corridor: '#e0d9ca',
  storage: '#c6bca9',
};

export interface RoomSpec {
  id: string;
  name: string;
  area: number;
  type: RoomType;
}

export interface RoomRect extends RoomSpec {
  unitId: string;
  unitLabel: string;
  floor: 1 | 2;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

interface RowSpec {
  depthRatio: number;
  rooms: RoomSpec[];
}

function layoutUnitRows(
  unitId: string,
  unitLabel: string,
  floor: 1 | 2,
  x0: number,
  x1: number,
  frontZ: number,
  totalDepth: number,
  rows: RowSpec[]
): RoomRect[] {
  const width = x1 - x0;
  let zCursor = frontZ;
  const rects: RoomRect[] = [];
  for (const row of rows) {
    const rowDepth = totalDepth * row.depthRatio;
    const zFront = zCursor;
    const zRear = zCursor - rowDepth;
    const totalArea = row.rooms.reduce((s, r) => s + r.area, 0);
    let xCursor = x0;
    for (const r of row.rooms) {
      const w = width * (r.area / totalArea);
      rects.push({
        ...r,
        unitId,
        unitLabel,
        floor,
        x0: xCursor,
        x1: xCursor + w,
        z0: zRear,
        z1: zFront,
      });
      xCursor += w;
    }
    zCursor = zRear;
  }
  return rects;
}

// ----------------------------------------------------------------------
// 1st Floor — Store C (132, Foyer/Office use)
// ----------------------------------------------------------------------
const STORE_C_ROWS: RowSpec[] = [
  {
    depthRatio: 0.42,
    rooms: [
      { id: 'c-foyer', name: 'Foyer', area: 144.0, type: 'office' },
      { id: 'c-reception', name: 'Waiting / Reception', area: 235.7, type: 'office' },
      { id: 'c-office', name: 'Office', area: 179.8, type: 'office' },
    ],
  },
  {
    depthRatio: 0.33,
    rooms: [
      { id: 'c-genoffice', name: 'Gen. Office', area: 363.5, type: 'office' },
      { id: 'c-closet', name: 'Closet', area: 53.4, type: 'closet' },
    ],
  },
  {
    depthRatio: 0.25,
    rooms: [
      { id: 'c-backstor', name: 'Back Stor.', area: 347.5, type: 'storage' },
      { id: 'c-utility', name: 'Utility', area: 30.3, type: 'utility' },
      { id: 'c-allgender', name: 'All Gender', area: 49.5, type: 'bath' },
    ],
  },
];

// 1st Floor — Store B (130)
const STORE_B_ROWS: RowSpec[] = [
  { depthRatio: 0.78, rooms: [{ id: 'b-retail', name: 'Retail B', area: 1297.0, type: 'retail' }] },
  {
    depthRatio: 0.22,
    rooms: [
      { id: 'b-utility', name: 'Utility', area: 29.0, type: 'utility' },
      { id: 'b-allgender', name: 'All Gender', area: 47.3, type: 'bath' },
    ],
  },
];

// 1st Floor — Store A (126-128)
const STORE_A_ROWS: RowSpec[] = [
  { depthRatio: 0.78, rooms: [{ id: 'a-retail', name: 'Retail A', area: 1351.4, type: 'retail' }] },
  {
    depthRatio: 0.22,
    rooms: [
      { id: 'a-furnace', name: 'Furnace', area: 14.5, type: 'utility' },
      { id: 'a-allgender', name: 'All Gender', area: 61.4, type: 'bath' },
      { id: 'a-utility', name: 'Utility', area: 24.6, type: 'utility' },
    ],
  },
];

// Common core — Stairway C01 + Fire Sprinkler Rm C02
const CORE_FLOOR1_ROWS: RowSpec[] = [
  { depthRatio: 0.52, rooms: [{ id: 'core-stair-1', name: 'Stairway C01', area: 61.0, type: 'stair' }] },
  { depthRatio: 0.48, rooms: [{ id: 'core-sprinkler', name: 'Fire Sprinkler Rm C02', area: 68.7, type: 'utility' }] },
];

// ----------------------------------------------------------------------
// 2nd Floor — Unit 1 (1210.9 sf, mapped onto the storeA zone)
// ----------------------------------------------------------------------
const UNIT1_ROWS: RowSpec[] = [
  {
    depthRatio: 0.42,
    rooms: [
      { id: 'u1-foyer', name: 'Foyer', area: 54.4, type: 'corridor' },
      { id: 'u1-living', name: 'Living', area: 200.6, type: 'living' },
      { id: 'u1-dk', name: 'Dining / Kitchen', area: 208.4, type: 'living' },
    ],
  },
  {
    depthRatio: 0.33,
    rooms: [
      { id: 'u1-br1', name: 'BR. 1', area: 162.5, type: 'bedroom' },
      { id: 'u1-cl1', name: 'Cl. 1', area: 13.6, type: 'closet' },
      { id: 'u1-laundry', name: 'Laundry', area: 10, type: 'utility' },
      { id: 'u1-br2', name: 'BR. 2', area: 172.4, type: 'bedroom' },
      { id: 'u1-cl2', name: 'Cl. 2', area: 48.4, type: 'closet' },
    ],
  },
  {
    depthRatio: 0.25,
    rooms: [
      { id: 'u1-cl3', name: 'Cl. 3', area: 8.9, type: 'closet' },
      { id: 'u1-utility', name: 'Utility', area: 13.3, type: 'utility' },
      { id: 'u1-bath1', name: 'Bath 1', area: 53.7, type: 'bath' },
      { id: 'u1-bath2', name: 'Bath 2', area: 62.7, type: 'bath' },
    ],
  },
];

// 2nd Floor — Unit 2 (897.0 sf, mapped onto the storeB zone)
const UNIT2_ROWS: RowSpec[] = [
  {
    depthRatio: 0.45,
    rooms: [
      { id: 'u2-foyer', name: 'Foyer', area: 73.2, type: 'corridor' },
      { id: 'u2-ldk', name: 'Living, Dining, Kitchen', area: 276.7, type: 'living' },
    ],
  },
  {
    depthRatio: 0.3,
    rooms: [
      { id: 'u2-br1', name: 'BR. 1', area: 108.5, type: 'bedroom' },
      { id: 'u2-cl1', name: 'Cl. 1', area: 13.3, type: 'closet' },
      { id: 'u2-br2', name: 'BR. 2', area: 119.3, type: 'bedroom' },
      { id: 'u2-cl2', name: 'Cl. 2', area: 14.2, type: 'closet' },
    ],
  },
  {
    depthRatio: 0.25,
    rooms: [
      { id: 'u2-cl3', name: 'Cl. 3', area: 10.9, type: 'closet' },
      { id: 'u2-utility', name: 'Utility', area: 32.5, type: 'utility' },
      { id: 'u2-bath1', name: 'Bath 1', area: 39.6, type: 'bath' },
      { id: 'u2-bath2', name: 'Bath 2', area: 39.6, type: 'bath' },
    ],
  },
];

// 2nd Floor — Unit 3 (973.3 sf, mapped onto the storeC zone)
const UNIT3_ROWS: RowSpec[] = [
  {
    depthRatio: 0.4,
    rooms: [
      { id: 'u3-foyer', name: 'Foyer', area: 35.5, type: 'corridor' },
      { id: 'u3-dk', name: 'Dining / Kitchen', area: 172.5, type: 'living' },
      { id: 'u3-living', name: 'Living', area: 138.6, type: 'living' },
    ],
  },
  {
    depthRatio: 0.35,
    rooms: [
      { id: 'u3-br1', name: 'BR. 1', area: 125.3, type: 'bedroom' },
      { id: 'u3-cl1', name: 'Cl. 1', area: 12.1, type: 'closet' },
      { id: 'u3-br2', name: 'BR. 2', area: 137.0, type: 'bedroom' },
      { id: 'u3-cl2', name: 'Cl. 2', area: 12.1, type: 'closet' },
      { id: 'u3-hall', name: 'Hall', area: 55.6, type: 'corridor' },
    ],
  },
  {
    depthRatio: 0.25,
    rooms: [
      { id: 'u3-cl3', name: 'Cl. 3', area: 14.6, type: 'closet' },
      { id: 'u3-utility', name: 'Utility', area: 20.2, type: 'utility' },
      { id: 'u3-bath1', name: 'Bath 1', area: 41.2, type: 'bath' },
      { id: 'u3-bath2', name: 'Bath 2', area: 44.7, type: 'bath' },
    ],
  },
];

const CORE_FLOOR2_ROWS: RowSpec[] = [
  { depthRatio: 1.0, rooms: [{ id: 'core-stair-2', name: 'Stairway (Common)', area: 152, type: 'stair' }] },
];

const UNIT_ROWS_BY_ZONE: Record<ZoneId, RowSpec[]> = {
  storeA: UNIT1_ROWS,
  storeC: UNIT3_ROWS,
  storeB: UNIT2_ROWS,
  core: CORE_FLOOR2_ROWS,
};

const GROUND_ROWS_BY_ZONE: Record<ZoneId, RowSpec[]> = {
  storeC: STORE_C_ROWS,
  storeB: STORE_B_ROWS,
  storeA: STORE_A_ROWS,
  core: CORE_FLOOR1_ROWS,
};

function buildFloor(floor: 1 | 2): RoomRect[] {
  const frontZ = BUILDING_PLAN.depthFt / 2;
  const rects: RoomRect[] = [];
  for (const zone of GROUND_ZONES) {
    const rows = floor === 1 ? GROUND_ROWS_BY_ZONE[zone.id] : UNIT_ROWS_BY_ZONE[zone.id];
    const unitMeta =
      floor === 1
        ? { unitId: zone.id, unitLabel: zone.label }
        : zone.id === 'core'
        ? { unitId: 'core', unitLabel: 'Common Stairway' }
        : { unitId: UPPER_UNIT_BY_ZONE[zone.id]!.unitId, unitLabel: UPPER_UNIT_BY_ZONE[zone.id]!.label };
    rects.push(
      ...layoutUnitRows(unitMeta.unitId, unitMeta.unitLabel, floor, zone.x0, zone.x1, frontZ, BUILDING_PLAN.depthFt, rows)
    );
  }
  return rects;
}

export const GROUND_FLOOR_ROOMS: RoomRect[] = buildFloor(1);
export const UPPER_FLOOR_ROOMS: RoomRect[] = buildFloor(2);

export function getStairRect(floor: 1 | 2): RoomRect {
  const rooms = floor === 1 ? GROUND_FLOOR_ROOMS : UPPER_FLOOR_ROOMS;
  const stair = rooms.find((r) => r.type === 'stair');
  if (!stair) throw new Error('Stair room not found');
  return stair;
}

export function getCoreZone() {
  return GROUND_ZONES.find((z) => z.id === 'core')!;
}
