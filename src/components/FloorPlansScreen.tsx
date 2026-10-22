import { useState } from 'react';
import { Building2, Home } from 'lucide-react';
import { GROUND_FLOOR_ROOMS, UPPER_FLOOR_ROOMS, ROOM_TYPE_COLOR, type RoomRect } from '../data/floorPlan';
import { BUILDING_PLAN } from '../data/buildingPlan';

type FloorTab = 1 | 2;

function FloorPlanSVG({ rooms }: { rooms: RoomRect[] }) {
  const W = BUILDING_PLAN.widthFt;
  const D = BUILDING_PLAN.depthFt;
  const pad = 2;
  const vw = W + pad * 2;
  const vh = D + pad * 2;

  return (
    <svg viewBox={`${-pad} ${-pad} ${vw} ${vh}`} className="w-full h-auto" style={{ maxHeight: 520 }}>
      {/* Building outline */}
      <rect x={-W / 2} y={-D / 2} width={W} height={D} fill="#f8fafc" stroke="#334155" strokeWidth={0.5} />
      {rooms.map((r) => {
        const x = r.x0;
        // SVG y is flipped vs plan z (front is +z -> bottom of screen)
        const y = -r.z1;
        const w = r.x1 - r.x0;
        const h = r.z1 - r.z0;
        const cx = x + w / 2;
        const cy = y + h / 2;
        const fontSize = Math.min(w, h) * 0.16;
        return (
          <g key={r.id}>
            <rect x={x} y={y} width={w} height={h} fill={ROOM_TYPE_COLOR[r.type]} stroke="#475569" strokeWidth={0.18} />
            {w > 3 && h > 2.5 && (
              <>
                <text x={cx} y={cy - fontSize * 0.2} textAnchor="middle" fontSize={fontSize} fill="#0f172a" fontWeight={600} fontFamily="Inter, sans-serif">
                  {r.name}
                </text>
                <text x={cx} y={cy + fontSize * 0.9} textAnchor="middle" fontSize={fontSize * 0.8} fill="#64748b" fontFamily="Inter, sans-serif">
                  {Math.round(r.area)} sf
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function FloorPlansScreen() {
  const [floor, setFloor] = useState<FloorTab>(1);
  const rooms = floor === 1 ? GROUND_FLOOR_ROOMS : UPPER_FLOOR_ROOMS;

  const legend = Array.from(new Set(rooms.map((r) => r.type)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Floor Plans</h1>
          <p className="text-slate-500 text-sm mt-1">Room layouts and areas from the architectural schedules</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFloor(1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${floor === 1 ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Building2 className="w-4 h-4" />
            1st Floor — Retail
          </button>
          <button
            onClick={() => setFloor(2)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${floor === 2 ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Home className="w-4 h-4" />
            2nd Floor — Apartments
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '80ms' }}>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <FloorPlanSVG rooms={rooms} />
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            {legend.map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm border border-slate-300" style={{ backgroundColor: ROOM_TYPE_COLOR[t] }} />
                <span className="text-xs text-slate-600 capitalize">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Room Schedule</h3>
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {rooms.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: ROOM_TYPE_COLOR[r.type] }} />
                  <span className="text-slate-700 text-sm truncate">{r.name}</span>
                </div>
                <span className="text-slate-500 text-xs shrink-0 ml-2">{Math.round(r.area)} sf</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-600 text-sm font-medium">Total</span>
            <span className="text-slate-900 text-sm font-semibold">
              {Math.round(rooms.reduce((s, r) => s + r.area, 0)).toLocaleString()} sf
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
