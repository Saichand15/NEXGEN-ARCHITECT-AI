import { BUILDING_PLAN, GROUND_ZONES, UPPER_UNIT_BY_ZONE } from './buildingPlan';
import { GROUND_FLOOR_ROOMS, UPPER_FLOOR_ROOMS } from './floorPlan';

// Aggregated, presentation-ready project info for the client-facing site.
// All values come from the real plan schedules (sheets T-1, A-1, A-2, A-3, A-4).

export interface UnitInfo {
  id: string;
  label: string;
  use: string;
  areaSf: number;
  roomCount: number;
  windows?: number;
  highlights: string[];
}

function sumArea(ids: string[]) {
  return ids.reduce((s, id) => {
    const r = [...GROUND_FLOOR_ROOMS, ...UPPER_FLOOR_ROOMS].find((x) => x.id === id);
    return s + (r?.area ?? 0);
  }, 0);
}

export const PROJECT = {
  name: BUILDING_PLAN.projectName,
  address: BUILDING_PLAN.address,
  architect: BUILDING_PLAN.architect,
  sheets: BUILDING_PLAN.sourceSheets,
  widthFt: BUILDING_PLAN.widthFt,
  depthFt: BUILDING_PLAN.depthFt,
  floors: BUILDING_PLAN.floors.length,
  totalGrossAreaSf: BUILDING_PLAN.totalGrossAreaSf,
  description:
    'A two-story mixed-use remodel combining three ground-floor retail storefronts with three residential apartments above, fronting Northwest Highway in Palatine, Illinois.',
};

// Ground-floor retail units
export const RETAIL_UNITS: UnitInfo[] = GROUND_ZONES.filter((z) => z.id !== 'core').map((z) => {
  const rooms = GROUND_FLOOR_ROOMS.filter((r) => r.unitId === z.id);
  const area = rooms.reduce((s, r) => s + r.area, 0);
  const useMap: Record<string, string> = {
    storeA: 'Retail',
    storeB: 'Retail',
    storeC: 'Office / Foyer',
  };
  const hl: Record<string, string[]> = {
    storeA: ['Storefront entry', 'All-gender restroom', 'Furnace + utility rooms'],
    storeB: ['Open retail floor', 'All-gender restroom', 'Utility room'],
    storeC: ['Foyer + waiting/reception', 'Private + general offices', 'Back storage', 'All-gender restroom'],
  };
  return {
    id: z.id,
    label: z.label,
    use: useMap[z.id] ?? 'Retail',
    areaSf: Math.round(area),
    roomCount: rooms.length,
    highlights: hl[z.id] ?? [],
  };
});

// Second-floor apartment units
export const APARTMENT_UNITS: UnitInfo[] = (Object.keys(UPPER_UNIT_BY_ZONE) as (keyof typeof UPPER_UNIT_BY_ZONE)[])
  .filter((zid) => UPPER_UNIT_BY_ZONE[zid] !== null)
  .map((zid) => {
    const meta = UPPER_UNIT_BY_ZONE[zid]!;
    const rooms = UPPER_FLOOR_ROOMS.filter((r) => r.unitId === meta.unitId);
    const area = rooms.reduce((s, r) => s + r.area, 0);
    const bedrooms = rooms.filter((r) => r.type === 'bedroom').length;
    const baths = rooms.filter((r) => r.type === 'bath').length;
    return {
      id: meta.unitId,
      label: meta.label,
      use: `${bedrooms} Bed / ${baths} Bath Apartment`,
      areaSf: Math.round(area),
      roomCount: rooms.length,
      windows: meta.windows,
      highlights: ['Open living / dining / kitchen', `${bedrooms} bedrooms`, `${baths} full baths`, 'In-unit laundry'],
    };
  });

// Building stats for the overview strip
export const BUILDING_STATS = [
  { label: 'Total Gross Area', value: `${Math.round(PROJECT.totalGrossAreaSf).toLocaleString()} sf` },
  { label: 'Frontage (East)', value: `${PROJECT.widthFt.toFixed(1)} ft` },
  { label: 'Depth', value: `${PROJECT.depthFt.toFixed(1)} ft` },
  { label: 'Stories', value: '2' },
  { label: 'Retail Units', value: '3' },
  { label: 'Apartments', value: '3' },
];

export { sumArea };
