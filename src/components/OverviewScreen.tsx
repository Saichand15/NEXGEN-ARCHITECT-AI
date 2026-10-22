import {
  Building2,
  Layers3,
  Ruler,
  Home,
  Store,
  ArrowRight,
  Sparkles,
  Maximize2,
  MoveHorizontal,
  MoveVertical,
  Palette,
  Radar,
} from 'lucide-react';
import { PROJECT, BUILDING_STATS, RETAIL_UNITS, APARTMENT_UNITS } from '../data/projectInfo';
import { BRAND, STATEMENT_COLLECTION } from '../data/sidingCatalog';

interface OverviewScreenProps {
  onOpenDesigner: () => void;
}

const STAT_ICONS = [Maximize2, MoveHorizontal, MoveVertical, Layers3, Store, Home];

export function OverviewScreen({ onOpenDesigner }: OverviewScreenProps) {
  const maxUnitArea = Math.max(...RETAIL_UNITS.map((u) => u.areaSf), ...APARTMENT_UNITS.map((u) => u.areaSf));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white p-8 md:p-12 ring-1 ring-white/10 shadow-2xl shadow-slate-900/40">
        {/* Blueprint grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #14b8a6 0, transparent 40%), radial-gradient(circle at 80% 70%, #f59e0b 0, transparent 40%)',
          }}
        />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl animate-float-slow" />
        <div
          className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl animate-float-slow"
          style={{ animationDelay: '1.5s' }}
        />
        <div className="relative animate-fade-up">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 text-teal-300 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" />
              Mixed-Use Building Visualization
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Live Parametric Model
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-4 max-w-3xl">{PROJECT.name}</h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mb-6 leading-relaxed">{PROJECT.description}</p>

          {/* Quick facts row */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            {[
              { icon: Maximize2, label: `${Math.round(PROJECT.totalGrossAreaSf).toLocaleString()} sf gross` },
              { icon: MoveHorizontal, label: `${PROJECT.widthFt.toFixed(1)} ft frontage` },
              { icon: Layers3, label: `${PROJECT.floors} stories` },
              { icon: Radar, label: 'AI-rendered exterior' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur text-sm text-slate-200"
                >
                  <Icon className="w-3.5 h-3.5 text-teal-300" />
                  {f.label}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenDesigner}
              className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 rounded-xl font-semibold shadow-lg shadow-teal-900/40 transition-all hover:shadow-xl hover:shadow-teal-500/20 hover:-translate-y-0.5"
            >
              <Layers3 className="w-5 h-5" />
              Open 3D Exterior Designer
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {BUILDING_STATS.map((s, i) => {
          const Icon = STAT_ICONS[i] ?? Building2;
          return (
            <div
              key={s.label}
              style={{ animationDelay: `${i * 60}ms` }}
              className="group animate-fade-up relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition-all hover:shadow-lg hover:shadow-teal-900/5 hover:-translate-y-1"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center mb-3 transition-colors">
                <Icon className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-slate-500 text-xs font-medium mb-1">{s.label}</p>
              <p className="text-slate-900 text-2xl font-bold tracking-tight">{s.value}</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-teal-500 to-amber-400 group-hover:w-full transition-all duration-500" />
            </div>
          );
        })}
      </div>

      {/* Units */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Retail */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Ground Floor — Retail</h2>
              <p className="text-slate-500 text-xs">Three ground-floor storefront units</p>
            </div>
          </div>
          <div className="space-y-3">
            {RETAIL_UNITS.map((u, i) => (
              <div
                key={u.id}
                className="group relative pl-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 hover:border-slate-200 overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-500" />
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-slate-900 font-semibold text-sm truncate">{u.label}</p>
                  </div>
                  <span className="text-teal-700 text-sm font-bold shrink-0">{u.areaSf.toLocaleString()} sf</span>
                </div>
                <p className="text-slate-500 text-xs mb-2">
                  {u.use} · {u.roomCount} rooms
                </p>
                <div className="h-1 rounded-full bg-slate-200 overflow-hidden mb-2.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                    style={{ width: `${Math.round((u.areaSf / maxUnitArea) * 100)}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {u.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[10px] font-medium px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apartments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
              <Home className="w-5 h-5 text-teal-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Second Floor — Apartments</h2>
              <p className="text-slate-500 text-xs">Three residential units above the retail</p>
            </div>
          </div>
          <div className="space-y-3">
            {APARTMENT_UNITS.map((u, i) => (
              <div
                key={u.id}
                className="group relative pl-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 hover:border-slate-200 overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-teal-600" />
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-slate-900 font-semibold text-sm truncate">{u.label}</p>
                  </div>
                  <span className="text-teal-700 text-sm font-bold shrink-0">{u.areaSf.toLocaleString()} sf</span>
                </div>
                <p className="text-slate-500 text-xs mb-2">
                  {u.use} · {u.roomCount} rooms{u.windows ? ` · ${u.windows} windows` : ''}
                </p>
                <div className="h-1 rounded-full bg-slate-200 overflow-hidden mb-2.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-700"
                    style={{ width: `${Math.round((u.areaSf / maxUnitArea) * 100)}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {u.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[10px] font-medium px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exterior material callout */}
      <div
        className="animate-fade-up relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl"
        style={{ animationDelay: '160ms' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 85% 20%, #14b8a6 0, transparent 50%)' }}
        />
        <div className="relative flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 backdrop-blur flex items-center justify-center shrink-0">
            <Ruler className="w-5 h-5 text-teal-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Exterior Material Visualizer
              <Palette className="w-4 h-4 text-amber-300" />
            </h3>
            <p className="text-slate-300 text-sm mb-2">
              Preview {BRAND.name} {BRAND.productLine} textures &amp; Statement Collection® colors on the real building model.
            </p>
            <div className="flex items-center -space-x-1.5">
              {STATEMENT_COLLECTION.slice(0, 8).map((c) => (
                <span
                  key={c.id}
                  title={c.name}
                  className="w-5 h-5 rounded-full ring-2 ring-slate-900"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <span className="ml-3 text-[11px] text-slate-400">+{STATEMENT_COLLECTION.length - 8} more colors</span>
            </div>
          </div>
        </div>
        <button
          onClick={onOpenDesigner}
          className="relative group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/20 transition-all text-sm font-semibold hover:-translate-y-0.5 shrink-0"
        >
          <Building2 className="w-4 h-4" />
          Try Materials
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
