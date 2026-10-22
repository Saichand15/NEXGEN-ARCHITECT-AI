import { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ExternalLink,
  Layers3,
  PaintBucket,
  RotateCcw,
  Building2,
  Home,
  Check,
  Maximize2,
  Minimize2,
  Rotate3d,
  RectangleHorizontal,
} from 'lucide-react';
import { BuildingModel3D, type BuildingViewMode, type CameraPreset } from './BuildingModel3D';
import { createSidingThumbnailDataUrl } from '../three/sidingTexture';
import {
  TEXTURE_STYLES,
  STATEMENT_COLLECTION,
  DEFAULT_WALL_MATERIAL,
  buildJamesHardieLink,
  getTextureStyle,
  getSidingColor,
  BRAND,
  type WallFaceMaterial,
} from '../data/sidingCatalog';
import { BUILDING_FACES, BUILDING_PLAN, type BuildingFace } from '../data/buildingPlan';

type FaceScope = BuildingFace | 'all';

function initialMaterials(): Record<BuildingFace, WallFaceMaterial> {
  return {
    front: { ...DEFAULT_WALL_MATERIAL },
    back: { ...DEFAULT_WALL_MATERIAL },
    left: { ...DEFAULT_WALL_MATERIAL },
    right: { ...DEFAULT_WALL_MATERIAL },
  };
}

const VIEW_MODES: { id: BuildingViewMode; label: string; icon: typeof Layers3 }[] = [
  { id: 'exterior', label: 'Exterior', icon: Layers3 },
  { id: 'floor1', label: '1st Floor Rooms', icon: Building2 },
  { id: 'floor2', label: '2nd Floor Rooms', icon: Home },
];

// Square texture preview card (matches the James Hardie texture swatches).
function TextureThumb({ textureId, colorId, selected }: { textureId: string; colorId: string; selected: boolean }) {
  const url = useMemo(
    () => createSidingThumbnailDataUrl(getTextureStyle(textureId), getSidingColor(colorId), 120),
    [textureId, colorId]
  );
  return (
    <span
      className={`block w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
        selected ? 'border-teal-600 shadow-md' : 'border-slate-200 group-hover:border-slate-300'
      }`}
    >
      <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />
    </span>
  );
}

// Circular color swatch (matches jameshardie.com).
function ColorSwatch({
  colorId,
  selected,
  onClick,
}: {
  colorId: string;
  selected: boolean;
  onClick: () => void;
}) {
  const c = getSidingColor(colorId);
  return (
    <button onClick={onClick} title={c.name} className="relative flex flex-col items-center gap-1 group">
      <span
        className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${
          selected ? 'ring-2 ring-teal-600 ring-offset-2 scale-110' : 'group-hover:scale-110'
        }`}
        style={{ backgroundColor: c.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.15)' }}
      >
        {selected && <Check className="w-4 h-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />}
      </span>
      {c.badge && <span className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full border border-white" />}
      <span className={`text-[10px] leading-tight text-center max-w-[52px] ${selected ? 'text-teal-700 font-medium' : 'text-slate-500'}`}>
        {c.name}
      </span>
    </button>
  );
}

export function ExteriorDesigner() {
  const [wallMaterials, setWallMaterials] = useState<Record<BuildingFace, WallFaceMaterial>>(initialMaterials());
  const [scope, setScope] = useState<FaceScope>('all');
  const [viewMode, setViewMode] = useState<BuildingViewMode>('exterior');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('orbit');
  const [collection, setCollection] = useState<'statement' | 'primed'>('statement');
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const referenceFace: BuildingFace = scope === 'all' ? 'front' : scope;
  const current = wallMaterials[referenceFace];
  const currentTexture = getTextureStyle(current.textureId);
  const currentColor = getSidingColor(current.colorId);
  const officialLink = useMemo(
    () => buildJamesHardieLink(currentTexture.slug, currentColor.slug),
    [currentTexture, currentColor]
  );

  function applyChange(partial: Partial<WallFaceMaterial>) {
    setWallMaterials((prev) => {
      const next = { ...prev };
      const faces: BuildingFace[] = scope === 'all' ? ['front', 'back', 'left', 'right'] : [scope];
      for (const f of faces) {
        next[f] = { ...next[f], ...partial };
      }
      return next;
    });
  }

  function handleReset() {
    setWallMaterials(initialMaterials());
    setScope('all');
    setCameraPreset('orbit');
  }

  function enterPresentation() {
    setFullscreen(true);
    setControlsVisible(true);
    setMaterialsOpen(false);
    const el = stageRef.current;
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        /* ignore — fall back to in-page overlay only */
      });
    }
  }

  function exitPresentation() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setFullscreen(false);
    setMaterialsOpen(false);
  }

  // Esc exits fullscreen; keep in sync with native fullscreenchange (e.g. Esc,
  // browser's own exit control) so state never gets stuck.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitPresentation();
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
        setMaterialsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [fullscreen]);

  // Auto-hide the control chrome like a slideshow — only the 3D view stays on
  // screen until the mouse moves, then controls fade back in briefly.
  useEffect(() => {
    if (!fullscreen) return;
    let timer: ReturnType<typeof setTimeout>;
    const show = () => {
      setControlsVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setControlsVisible(false), 2800);
    };
    show();
    const el = stageRef.current;
    el?.addEventListener('mousemove', show);
    el?.addEventListener('mouseenter', show);
    return () => {
      clearTimeout(timer);
      el?.removeEventListener('mousemove', show);
      el?.removeEventListener('mouseenter', show);
    };
  }, [fullscreen]);

  // --- Reusable selection bar (texture row + color row) ----------------
  const selectionBar = (
    <div className="space-y-4">
      {/* Texture row */}
      <div>
        <p className="text-slate-500 text-xs mb-2 font-medium">Texture — {BRAND.productLine}</p>
        <div className="flex items-start gap-3 overflow-x-auto pb-1">
          {TEXTURE_STYLES.map((t) => (
            <button key={t.id} onClick={() => applyChange({ textureId: t.id })} className="group flex flex-col items-center shrink-0" title={t.description}>
              <TextureThumb textureId={t.id} colorId={current.colorId} selected={current.textureId === t.id} />
              <span className={`mt-1.5 text-[11px] leading-tight text-center whitespace-nowrap ${current.textureId === t.id ? 'text-teal-700 font-medium' : 'text-slate-600'}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color collection tabs + color row */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
            <PaintBucket className="w-3.5 h-3.5 text-teal-600" />
            Color
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCollection('statement')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${collection === 'statement' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Statement Collection®
            </button>
            <button
              onClick={() => setCollection('primed')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${collection === 'primed' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Primed for Paint
            </button>
          </div>
        </div>

        {collection === 'statement' ? (
          <div className="flex items-start gap-3 overflow-x-auto pb-1">
            {STATEMENT_COLLECTION.map((c) => (
              <div key={c.id} className="shrink-0">
                <ColorSwatch colorId={c.id} selected={current.colorId === c.id} onClick={() => applyChange({ colorId: c.id })} />
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={() => applyChange({ colorId: 'arctic-white' })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
          >
            <span className="w-8 h-8 rounded-full" style={{ backgroundColor: '#d8d5cd', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }} />
            <span className="text-left">
              <span className="block text-slate-900 text-sm font-medium">Primed (field paint)</span>
              <span className="block text-slate-500 text-xs">Factory-primed, paint any color on site</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );

  // --- Current selection summary + official link -----------------------
  const selectionSummary = (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <span
          className="w-10 h-10 rounded-full shrink-0"
          style={{ backgroundColor: currentColor.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.2)' }}
        />
        <div>
          <p className="text-slate-900 text-sm font-medium">
            {currentColor.name}
            {currentColor.badge && <span className="ml-2 text-amber-600 text-xs font-normal">{currentColor.badge}</span>}
          </p>
          <p className="text-slate-500 text-xs">
            {currentTexture.name} · {BRAND.name} {BRAND.productLine}
          </p>
        </div>
      </div>
      <a
        href={officialLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-sm"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View official color & order free sample
      </a>
    </div>
  );

  // --- Apply-to scope control ------------------------------------------
  const scopeControl = (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-slate-500 text-xs font-medium mr-1">Apply to:</span>
      <button
        onClick={() => setScope('all')}
        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${scope === 'all' ? 'bg-gradient-to-r from-slate-600 to-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
      >
        All Walls
      </button>
      {BUILDING_FACES.map((f) => (
        <button
          key={f.id}
          onClick={() => setScope(f.id)}
          title={f.note}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all ${scope === f.id ? 'bg-gradient-to-r from-slate-600 to-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {f.label.split(' ')[0]}
        </button>
      ))}
    </div>
  );

  // --- View mode toggle -------------------------------------------------
  const viewModeToggle = (
    <div className="flex items-center gap-2">
      {VIEW_MODES.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => setViewMode(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              viewMode === m.id ? 'bg-gradient-to-r from-slate-600 to-teal-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        );
      })}
    </div>
  );

  // --- Camera preset toggle (3D orbit vs flat front elevation) ----------
  const cameraToggle = viewMode === 'exterior' && (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
      <button
        onClick={() => setCameraPreset('orbit')}
        title="Free 3D orbit view"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all ${
          cameraPreset === 'orbit' ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Rotate3d className="w-3.5 h-3.5" />
        3D View
      </button>
      <button
        onClick={() => setCameraPreset('front')}
        title="Flat, straight-on East Elevation view"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all ${
          cameraPreset === 'front' ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <RectangleHorizontal className="w-3.5 h-3.5" />
        Front Elevation
      </button>
    </div>
  );

  // ===================== PRESENTATION / FULLSCREEN ======================
  // Default state shows ONLY the 3D view, edge-to-edge, like a slideshow —
  // no header, no selection bar. Controls fade in on mouse movement and
  // fade back out after a few seconds of inactivity.
  if (fullscreen) {
    return createPortal(
      <div ref={stageRef} className="fixed inset-0 z-[1000] bg-slate-950">
        {/* Full-bleed 3D view */}
        <BuildingModel3D
          wallMaterials={wallMaterials}
          viewMode={viewMode}
          cameraPreset={cameraPreset}
          className="absolute inset-0 w-full h-full"
        />

        {/* Top bar — view mode (center) + exit (right), auto-hiding */}
        <div
          className={`absolute top-0 inset-x-0 flex items-start justify-between p-4 pointer-events-none transition-opacity duration-500 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-2 bg-slate-900/70 backdrop-blur rounded-xl px-3 py-2 pointer-events-auto shadow-lg">
            <Layers3 className="w-4 h-4 text-teal-400" />
            <p className="text-white text-xs font-semibold whitespace-nowrap">{BUILDING_PLAN.projectName}</p>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-slate-900/70 backdrop-blur rounded-xl p-1.5 flex gap-1 shadow-lg">
              {VIEW_MODES.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setViewMode(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      viewMode === m.id ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>
            {viewMode === 'exterior' && (
              <div className="bg-slate-900/70 backdrop-blur rounded-xl p-1.5 flex gap-1 shadow-lg">
                <button
                  onClick={() => setCameraPreset('orbit')}
                  title="Free 3D orbit view"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    cameraPreset === 'orbit' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Rotate3d className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCameraPreset('front')}
                  title="Flat, straight-on front elevation"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    cameraPreset === 'front' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <RectangleHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              onClick={() => setMaterialsOpen((v) => !v)}
              title="Materials"
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs shadow-lg backdrop-blur transition-all ${
                materialsOpen ? 'bg-teal-600 text-white' : 'bg-slate-900/70 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <PaintBucket className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={exitPresentation}
              title="Exit presentation (Esc)"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900/70 backdrop-blur hover:bg-slate-700 text-white rounded-xl text-xs shadow-lg transition-all"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom-left current selection chip, auto-hiding */}
        <div
          className={`absolute bottom-4 left-4 bg-slate-900/70 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg transition-opacity duration-500 ${
            controlsVisible && !materialsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <span
            className="w-5 h-5 rounded-full shrink-0"
            style={{ backgroundColor: currentColor.hex, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)' }}
          />
          <span className="text-slate-200 text-xs whitespace-nowrap">
            {currentColor.name} · {currentTexture.name}
          </span>
        </div>

        {/* Toggleable materials drawer — hidden by default so presentation
            mode shows only the pure 3D view, like a slideshow. */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-slate-900/90 backdrop-blur border-t border-slate-700 px-5 py-4 transition-transform duration-300 ${
            materialsOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
          }`}
        >
          <div className="max-w-6xl mx-auto space-y-4">
            {selectionBar}
            <div className="pt-3 border-t border-slate-700 flex items-center justify-between gap-4 flex-wrap">
              {scopeControl}
              <a
                href={officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Official color page
              </a>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ============================ NORMAL LAYOUT ==========================
  return (
    <div className="space-y-6">
      {/* 3D Viewport — full width */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers3 className="w-4 h-4 text-teal-600" />
            <span className="text-slate-900 text-sm font-semibold">3D Exterior Designer</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all text-sm text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={enterPresentation}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-600 to-teal-600 text-white rounded-lg hover:shadow-md transition-all text-sm"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Present
            </button>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          {viewModeToggle}
          {cameraToggle}
        </div>

        <div className="bg-slate-50" style={{ height: '520px' }}>
          <BuildingModel3D wallMaterials={wallMaterials} viewMode={viewMode} cameraPreset={cameraPreset} className="w-full h-full" />
        </div>
      </div>

      {/* Selection bar BELOW the view — texture row + color row */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        {selectionBar}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
          {scopeControl}
          {selectionSummary}
        </div>
        <p className="text-slate-400 text-[11px] mt-3">
          Swatches are approximate on-screen previews. Confirm exact color/finish on jameshardie.com or with a physical sample before specifying material.
        </p>
      </div>
    </div>
  );
}
