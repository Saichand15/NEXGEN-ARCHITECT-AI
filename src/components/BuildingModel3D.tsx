import { useMemo, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, ContactShadows } from '@react-three/drei';
import {
  getTextureStyle,
  getSidingColor,
  type WallFaceMaterial,
} from '../data/sidingCatalog';
import {
  BUILDING_PLAN,
  GROUND_ZONES,
  footprintPolygon,
  type BuildingFace,
} from '../data/buildingPlan';
import { GROUND_FLOOR_ROOMS, UPPER_FLOOR_ROOMS } from '../data/floorPlan';
import { createSidingCanvasTexture } from '../three/sidingTexture';
import { InteriorFloorPlan3D } from './InteriorFloorPlan3D';

export type BuildingViewMode = 'exterior' | 'floor1' | 'floor2';
export type CameraPreset = 'orbit' | 'front';

export interface BuildingModel3DProps {
  wallMaterials: Record<BuildingFace, WallFaceMaterial>;
  viewMode?: BuildingViewMode;
  cameraPreset?: CameraPreset;
  className?: string;
}

const GLASS_COLOR = '#1a3a52';
const TRIM_COLOR = '#f5f5f0';
const BRICK_WAINSCOT_COLOR = '#6e3b31';
const DOOR_COLOR = '#2c2f33';
const STONE_COLOR = '#cdbd9e';
const STONE_CAP_COLOR = '#b6a37e';
const WALL_T = 0.7; // exterior wall thickness (ft)

// --- Base siding textures per face -------------------------------------
function useFaceTextures(wallMaterials: Record<BuildingFace, WallFaceMaterial>) {
  const texturesRef = useRef<THREE.CanvasTexture[]>([]);
  const textures = useMemo(() => {
    texturesRef.current.forEach((t) => t.dispose());
    texturesRef.current = [];
    const make = (face: BuildingFace) => {
      const sel = wallMaterials[face];
      const tex = createSidingCanvasTexture(getTextureStyle(sel.textureId), getSidingColor(sel.colorId), {
        repeatX: 6,
        repeatY: 2,
      });
      texturesRef.current.push(tex);
      return tex;
    };
    return { front: make('front'), back: make('back'), left: make('left'), right: make('right') };
  }, [wallMaterials]);
  useEffect(() => () => texturesRef.current.forEach((t) => t.dispose()), []);
  return textures;
}

// --- A single vertical exterior wall panel along a footprint edge ------
function Wall({
  p1,
  p2,
  yBase,
  height,
  baseTexture,
}: {
  p1: [number, number];
  p2: [number, number];
  yBase: number;
  height: number;
  baseTexture: THREE.CanvasTexture;
}) {
  const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  const tex = useMemo(() => {
    const t = baseTexture.clone();
    t.repeat.set(Math.max(1, Math.round(len / 6)), 2);
    t.needsUpdate = true;
    return t;
  }, [baseTexture, len]);
  useEffect(() => () => tex.dispose(), [tex]);
  const cx = (p1[0] + p2[0]) / 2;
  const cz = (p1[1] + p2[1]) / 2;
  return (
    <mesh position={[cx, yBase + height / 2, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[len, height, WALL_T]} />
      <meshStandardMaterial map={tex} roughness={0.85} metalness={0} />
    </mesh>
  );
}

// --- Helpers for placing glass/doors along a (possibly angled) edge ----
function edgePoint(p1: [number, number], p2: [number, number], t: number): [number, number] {
  return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
}
function edgeAngle(p1: [number, number], p2: [number, number]) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}
function outwardNormal(p1: [number, number], p2: [number, number]): [number, number] {
  const dx = p2[0] - p1[0];
  const dz = p2[1] - p1[1];
  let nx = dz;
  let nz = -dx;
  const mx = (p1[0] + p2[0]) / 2;
  const mz = (p1[1] + p2[1]) / 2;
  if (nx * mx + nz * mz < 0) {
    nx = -nx;
    nz = -nz;
  }
  const l = Math.hypot(nx, nz);
  return [nx / l, nz / l];
}

// --- Storefront glass + entry door placed along a front edge -----------
function Storefront({
  p1,
  p2,
  yBase,
  height,
}: {
  p1: [number, number];
  p2: [number, number];
  yBase: number;
  height: number;
}) {
  const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  const angle = edgeAngle(p1, p2);
  const [nx, nz] = outwardNormal(p1, p2);
  const glassH = height * 0.62;
  const sillH = 2.33; // 2'-4" brick knee wall from elevation
  const off = WALL_T / 2 + 0.05;
  const cx = (p1[0] + p2[0]) / 2 + nx * off;
  const cz = (p1[1] + p2[1]) / 2 + nz * off;

  const doorW = 3.5;
  const doorH = 7;
  const doorPos = edgePoint(p1, p2, 0.5);
  const doorOff = WALL_T / 2 + 0.08;
  const mullionCount = Math.max(2, Math.round(len / 6.5));

  return (
    <group>
      {/* Brick knee wall / wainscot */}
      <mesh position={[cx, yBase + sillH / 2, cz]} rotation={[0, -angle, 0]} receiveShadow>
        <boxGeometry args={[len, sillH, 0.15]} />
        <meshStandardMaterial color={BRICK_WAINSCOT_COLOR} roughness={0.9} metalness={0} />
      </mesh>
      {/* Storefront glass above knee wall */}
      <mesh position={[cx, yBase + sillH + glassH / 2, cz]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[len - 0.3, glassH, 0.08]} />
        <meshPhysicalMaterial color={GLASS_COLOR} roughness={0.08} metalness={0.1} transmission={0.4} reflectivity={0.6} />
      </mesh>
      {/* Aluminum mullions */}
      {Array.from({ length: mullionCount + 1 }).map((_, i) => {
        const t = i / mullionCount;
        const [px, pz] = edgePoint(p1, p2, t);
        return (
          <mesh key={i} position={[px + nx * off, yBase + sillH + glassH / 2, pz + nz * off]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.14, glassH, 0.1]} />
            <meshStandardMaterial color="#cfd3d6" metalness={0.5} roughness={0.4} />
          </mesh>
        );
      })}
      {/* Entry door */}
      <mesh position={[doorPos[0] + nx * doorOff, yBase + doorH / 2, doorPos[1] + nz * doorOff]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[doorW, doorH, 0.1]} />
        <meshPhysicalMaterial color={DOOR_COLOR} roughness={0.3} metalness={0.3} transmission={0.2} />
      </mesh>
      <mesh position={[doorPos[0] + nx * doorOff, yBase + doorH / 2, doorPos[1] + nz * doorOff]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[0.12, doorH, 0.12]} />
        <meshStandardMaterial color="#cfd3d6" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

// --- A double-hung window with trim, placed on a wall edge -------------
function Window({
  center,
  angle,
  normal,
  yBase,
  width = 2.6,
  height = 4.5,
}: {
  center: [number, number];
  angle: number;
  normal: [number, number];
  yBase: number;
  width?: number;
  height?: number;
}) {
  const off = WALL_T / 2 + 0.05;
  const cx = center[0] + normal[0] * off;
  const cz = center[1] + normal[1] * off;
  return (
    <group position={[cx, yBase, cz]} rotation={[0, -angle, 0]}>
      <mesh>
        <boxGeometry args={[width + 0.3, height + 0.3, 0.06]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[width, height, 0.05]} />
        <meshPhysicalMaterial color={GLASS_COLOR} roughness={0.1} transmission={0.3} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[width, 0.1, 0.04]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.7} metalness={0} />
      </mesh>
    </group>
  );
}

// --- A grouped pair of double-hung sashes under one shared trim lintel —
// matches the paired 2nd-floor window groups on the real East Elevation --
function WindowPair({
  center,
  angle,
  normal,
  yBase,
  paneWidth = 2.1,
  height = 4.5,
}: {
  center: [number, number];
  angle: number;
  normal: [number, number];
  yBase: number;
  paneWidth?: number;
  height?: number;
}) {
  const off = WALL_T / 2 + 0.05;
  const cx = center[0] + normal[0] * off;
  const cz = center[1] + normal[1] * off;
  const gap = 0.25;
  const groupWidth = paneWidth * 2 + gap;
  return (
    <group position={[cx, yBase, cz]} rotation={[0, -angle, 0]}>
      {/* Shared trim lintel/sill around both sashes */}
      <mesh>
        <boxGeometry args={[groupWidth + 0.35, height + 0.35, 0.06]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.7} metalness={0} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[(side * (paneWidth + gap)) / 2, 0, 0]}>
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[paneWidth, height, 0.05]} />
            <meshPhysicalMaterial color={GLASS_COLOR} roughness={0.1} transmission={0.3} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0, 0.065]}>
            <boxGeometry args={[paneWidth, 0.1, 0.04]} />
            <meshStandardMaterial color={TRIM_COLOR} roughness={0.7} metalness={0} />
          </mesh>
        </group>
      ))}
      {/* Center mullion between the two sashes */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.16, height, 0.07]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.7} metalness={0} />
      </mesh>
    </group>
  );
}

// --- A simple flush service door with frame, for the rear (West)
// elevation's row of unit/service entries ------------------------------
function RearDoor({
  center,
  angle,
  normal,
  yBase,
  width = 3,
  height = 6.8,
  glazed = false,
}: {
  center: [number, number];
  angle: number;
  normal: [number, number];
  yBase: number;
  width?: number;
  height?: number;
  glazed?: boolean;
}) {
  const off = WALL_T / 2 + 0.04;
  const cx = center[0] + normal[0] * off;
  const cz = center[1] + normal[1] * off;
  return (
    <group position={[cx, yBase + height / 2, cz]} rotation={[0, -angle, 0]}>
      <mesh>
        <boxGeometry args={[width + 0.22, height + 0.22, 0.05]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[width, height, 0.08]} />
        {glazed ? (
          <meshPhysicalMaterial color={GLASS_COLOR} roughness={0.15} transmission={0.3} metalness={0.1} />
        ) : (
          <meshStandardMaterial color={DOOR_COLOR} roughness={0.5} metalness={0.2} />
        )}
      </mesh>
    </group>
  );
}

// --- Decorative crown molding / cornice band at a parapet top (matches
// the EIFS trim called out on the real elevations) ----------------------
function Cornice({ p1, p2, y }: { p1: [number, number]; p2: [number, number]; y: number }) {
  const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  const angle = edgeAngle(p1, p2);
  const cx = (p1[0] + p2[0]) / 2;
  const cz = (p1[1] + p2[1]) / 2;
  return (
    <mesh position={[cx, y, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[len + 0.8, 0.45, WALL_T + 0.5]} />
      <meshStandardMaterial color={TRIM_COLOR} roughness={0.6} metalness={0} />
    </mesh>
  );
}

// --- Faux-stone pier / pilaster at a bay division (Genstone accent on
// the real elevations) — fixed material, not swappable like the siding --
function Pier({ x, z, height }: { x: number; z: number; height: number }) {
  const w = 1.7;
  return (
    <group>
      <mesh position={[x, height / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[w, height, WALL_T + 0.5]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[x, height - 0.35, z]} castShadow>
        <boxGeometry args={[w + 0.4, 0.7, WALL_T + 0.8]} />
        <meshStandardMaterial color={STONE_CAP_COLOR} roughness={0.85} metalness={0} />
      </mesh>
      <mesh position={[x, 1.1, z]}>
        <boxGeometry args={[w + 0.3, 2.2, WALL_T + 0.65]} />
        <meshStandardMaterial color={STONE_CAP_COLOR} roughness={0.85} metalness={0} />
      </mesh>
    </group>
  );
}

// --- The building -------------------------------------------------------
function Building({
  wallMaterials,
  viewMode,
}: {
  wallMaterials: Record<BuildingFace, WallFaceMaterial>;
  viewMode: BuildingViewMode;
}) {
  const textures = useFaceTextures(wallMaterials);
  const poly = footprintPolygon();
  const groundH = BUILDING_PLAN.floors[0].heightFt;
  const upperH = BUILDING_PLAN.floors[1].heightFt;
  const parapetH = BUILDING_PLAN.parapetHeightFt;
  const lowParapetH = 2.5;
  const W = BUILDING_PLAN.widthFt;
  const D = BUILDING_PLAN.depthFt;

  // Footprint edges with face assignment (order matches footprintPolygon):
  const edges: { p1: [number, number]; p2: [number, number]; face: BuildingFace }[] = [
    { p1: poly[0], p2: poly[1], face: 'right' }, // front-right -> rear-right
    { p1: poly[1], p2: poly[2], face: 'back' }, // rear-right -> rear-left
    { p1: poly[2], p2: poly[3], face: 'left' }, // rear-left -> chamfer start
    { p1: poly[3], p2: poly[4], face: 'front' }, // chamfer (front material)
    { p1: poly[4], p2: poly[0], face: 'front' }, // front wall
  ];

  const frontEdge = edges[4];
  const chamferEdge = edges[3];

  // --- Stepped massing -------------------------------------------------
  // Per the real East/South elevations, the 2nd-floor apartment volume only
  // sits above the Store B + Store A retail footprint; Store C (the
  // foyer/office suite on the front-left, with the chamfered corner) is a
  // single story with its own low parapet. The step reads as a vertical
  // "cliff" wall at the Store C / core boundary.
  const stepX = GROUND_ZONES.find((z) => z.id === 'storeC')!.x1;

  const tallEdges: { p1: [number, number]; p2: [number, number]; face: BuildingFace }[] = [
    { p1: [stepX, D / 2], p2: [W / 2, D / 2], face: 'front' }, // front
    { p1: [W / 2, D / 2], p2: [W / 2, -D / 2], face: 'right' }, // right
    { p1: [W / 2, -D / 2], p2: [stepX, -D / 2], face: 'back' }, // back
    { p1: [stepX, -D / 2], p2: [stepX, D / 2], face: 'left' }, // step-back wall
  ];
  const lowEdges: { p1: [number, number]; p2: [number, number]; face: BuildingFace }[] = [
    { p1: [stepX, -D / 2], p2: [poly[2][0], poly[2][1]], face: 'back' }, // back (Store C share)
    { p1: poly[2], p2: poly[3], face: 'left' }, // left
    { p1: poly[3], p2: poly[4], face: 'front' }, // chamfer
    { p1: poly[4], p2: [stepX, D / 2], face: 'front' }, // front (Store C share)
  ];

  // 2nd-floor front windows — grouped in pairs under a shared lintel, only
  // along the tall block's front edge (matches the 3 paired window groups
  // visible on the real East Elevation)
  const tallFront = tallEdges[0];
  const frontNormal = outwardNormal(tallFront.p1, tallFront.p2);
  const frontAngle = edgeAngle(tallFront.p1, tallFront.p2);
  const tallFrontLen = Math.hypot(tallFront.p2[0] - tallFront.p1[0], tallFront.p2[1] - tallFront.p1[1]);
  const winGroupCount = Math.max(3, Math.round(tallFrontLen * 0.07));
  const frontWindowGroups = Array.from({ length: winGroupCount }, (_, i) =>
    edgePoint(tallFront.p1, tallFront.p2, (i + 0.5) / winGroupCount)
  );

  // --- Rear (West) elevation openings -----------------------------------
  // The real West Elevation shows a row of 2nd-floor bedroom/bath windows
  // over the tall block, plus a rhythm of ground-floor service doors with a
  // few small accent windows running the full width of the back wall.
  const backEdgeFull = edges[1]; // full-width back edge (poly[1] -> poly[2])
  const backNormal = outwardNormal(backEdgeFull.p1, backEdgeFull.p2);
  const backAngle = edgeAngle(backEdgeFull.p1, backEdgeFull.p2);

  const tallBack = tallEdges[2];
  const backWinCount = 4;
  const backWindows = Array.from({ length: backWinCount }, (_, i) => edgePoint(tallBack.p1, tallBack.p2, (i + 0.5) / backWinCount));

  const rearOpeningCount = 8;
  const rearOpenings = Array.from({ length: rearOpeningCount }, (_, i) => {
    const t = (i + 0.5) / rearOpeningCount;
    return { pos: edgePoint(backEdgeFull.p1, backEdgeFull.p2, t), isDoor: i % 3 !== 1 };
  });

  // Faux-stone piers at each bay division along the front facade. Store C's
  // frontage is split by an extra mid-pier into 2 bays (foyer entry + a
  // second door), matching the 2-low-bay rhythm on the real East Elevation.
  const storeCStart = -W / 2 + BUILDING_PLAN.chamferFt;
  const storeCMid = (storeCStart + stepX) / 2;
  const pierXs = [
    storeCStart,
    storeCMid,
    stepX,
    GROUND_ZONES.find((z) => z.id === 'core')!.x1,
    GROUND_ZONES.find((z) => z.id === 'storeB')!.x1,
    W / 2,
  ];

  // Ground-floor storefront zones along the front edge (glazed zones only).
  // Store C is split into 2 sub-bays at its mid-pier for a closer match to
  // the real elevation's bay rhythm.
  const storefronts = GROUND_ZONES.filter((z) => z.glazed).flatMap((z) => {
    const x0 = Math.max(z.x0, storeCStart);
    const x1 = z.x1;
    const toPts = (a: number, b: number) => {
      const t0 = (a - frontEdge.p1[0]) / (frontEdge.p2[0] - frontEdge.p1[0]);
      const t1 = (b - frontEdge.p1[0]) / (frontEdge.p2[0] - frontEdge.p1[0]);
      return {
        p1: edgePoint(frontEdge.p1, frontEdge.p2, Math.max(0, t0)) as [number, number],
        p2: edgePoint(frontEdge.p1, frontEdge.p2, Math.min(1, t1)) as [number, number],
      };
    };
    if (z.id === 'storeC') {
      return [toPts(x0, storeCMid), toPts(storeCMid, x1)];
    }
    return [toPts(x0, x1)];
  });

  return (
    <group>
      {viewMode === 'exterior' && (
        <>
          {/* Ground floor — continuous full-width retail envelope */}
          {edges.map((e, i) => (
            <Wall key={`g${i}`} p1={e.p1} p2={e.p2} yBase={0} height={groundH} baseTexture={textures[e.face]} />
          ))}

          {storefronts.map((s, i) => (
            <Storefront key={`sf${i}`} p1={s.p1} p2={s.p2} yBase={0} height={groundH} />
          ))}
          <Storefront p1={chamferEdge.p1} p2={chamferEdge.p2} yBase={0} height={groundH} />

          {/* Rear (West) ground-floor service doors + accent windows */}
          {rearOpenings.map((o, i) =>
            o.isDoor ? (
              <RearDoor key={`rd${i}`} center={o.pos} angle={backAngle} normal={backNormal} yBase={0} />
            ) : (
              <Window key={`rw${i}`} center={o.pos} angle={backAngle} normal={backNormal} yBase={groundH * 0.42} width={2} height={3.2} />
            )
          )}

          {/* Tall block — 2-story apartment volume over Store B / Store A */}
          {tallEdges.map((e, i) => (
            <Wall key={`tu${i}`} p1={e.p1} p2={e.p2} yBase={groundH} height={upperH} baseTexture={textures[e.face]} />
          ))}
          {frontWindowGroups.map((c, i) => (
            <WindowPair key={`w${i}`} center={c} angle={frontAngle} normal={frontNormal} yBase={groundH + upperH * 0.45} />
          ))}
          {backWindows.map((c, i) => (
            <Window key={`bw${i}`} center={c} angle={backAngle} normal={backNormal} yBase={groundH + upperH * 0.45} width={2.2} height={3.8} />
          ))}
          {tallEdges.map((e, i) => (
            <Wall key={`tp${i}`} p1={e.p1} p2={e.p2} yBase={groundH + upperH} height={parapetH} baseTexture={textures[e.face]} />
          ))}
          <Cornice p1={tallEdges[0].p1} p2={tallEdges[0].p2} y={groundH + upperH + parapetH} />
          <Cornice p1={tallEdges[1].p1} p2={tallEdges[1].p2} y={groundH + upperH + parapetH} />
          <Cornice p1={tallEdges[2].p1} p2={tallEdges[2].p2} y={groundH + upperH + parapetH} />
          <mesh position={[(stepX + W / 2) / 2, groundH + upperH + parapetH + 0.15, 0]}>
            <boxGeometry args={[W / 2 - stepX, 0.3, D]} />
            <meshStandardMaterial color="#4a4a48" roughness={0.95} metalness={0} />
          </mesh>

          {/* Low block — single-story Store C volume with its own low parapet */}
          {lowEdges.map((e, i) => (
            <Wall key={`lp${i}`} p1={e.p1} p2={e.p2} yBase={groundH} height={lowParapetH} baseTexture={textures[e.face]} />
          ))}
          <Cornice p1={lowEdges[2].p1} p2={lowEdges[2].p2} y={groundH + lowParapetH} />
          <Cornice p1={lowEdges[3].p1} p2={lowEdges[3].p2} y={groundH + lowParapetH} />
          <mesh position={[(-W / 2 + stepX) / 2, groundH + lowParapetH + 0.1, 0]}>
            <boxGeometry args={[stepX - (-W / 2), 0.3, D]} />
            <meshStandardMaterial color="#4a4a48" roughness={0.95} metalness={0} />
          </mesh>

          {/* Faux-stone piers at bay divisions (fixed accent, not swappable) */}
          {pierXs.map((x, i) => (
            <Pier
              key={`pier${i}`}
              x={x}
              z={D / 2}
              height={x < stepX - 0.01 ? groundH + lowParapetH : groundH + upperH + parapetH}
            />
          ))}
        </>
      )}

      {viewMode === 'floor2' && (
        <>
          {edges.map((e, i) => (
            <Wall key={`g${i}`} p1={e.p1} p2={e.p2} yBase={0} height={groundH} baseTexture={textures[e.face]} />
          ))}
          {storefronts.map((s, i) => (
            <Storefront key={`sf${i}`} p1={s.p1} p2={s.p2} yBase={0} height={groundH} />
          ))}
          <Storefront p1={chamferEdge.p1} p2={chamferEdge.p2} yBase={0} height={groundH} />
        </>
      )}

      {(viewMode === 'floor1' || viewMode === 'floor2') && (
        <InteriorFloorPlan3D
          rooms={viewMode === 'floor1' ? GROUND_FLOOR_ROOMS : UPPER_FLOOR_ROOMS}
          floorY={viewMode === 'floor1' ? 0.01 : groundH + 0.01}
          wallHeight={viewMode === 'floor1' ? groundH - 0.5 : upperH - 0.5}
          stairRiseHeight={viewMode === 'floor1' ? groundH : undefined}
        />
      )}
    </group>
  );
}

function Scene({
  wallMaterials,
  viewMode,
  cameraPreset,
}: {
  wallMaterials: Record<BuildingFace, WallFaceMaterial>;
  viewMode: BuildingViewMode;
  cameraPreset: CameraPreset;
}) {
  const groundH = BUILDING_PLAN.floors[0].heightFt;
  const upperH = BUILDING_PLAN.floors[1].heightFt;
  const totalHeight = groundH + upperH + BUILDING_PLAN.parapetHeightFt;
  const controlsTarget: [number, number, number] =
    viewMode === 'floor1'
      ? [0, 0.5, 0]
      : viewMode === 'floor2'
      ? [0, groundH + 0.5, 0]
      : cameraPreset === 'front'
      ? [0, totalHeight / 2, 0]
      : [0, groundH, 0];

  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#dfefff', '#8a8a74', 1.0]} />
      <directionalLight
        position={[40, 55, 30]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />
      <Sky sunPosition={[40, 55, 30]} turbidity={6} rayleigh={1.2} />
      <directionalLight position={[-35, 30, -25]} intensity={0.45} />
      <Building wallMaterials={wallMaterials} viewMode={viewMode} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#6b7d5f" roughness={1} metalness={0} />
      </mesh>
      {/* Sidewalk along the front (East) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, BUILDING_PLAN.depthFt / 2 + 6]} receiveShadow>
        <planeGeometry args={[BUILDING_PLAN.widthFt + 30, 12]} />
        <meshStandardMaterial color="#b9bcb6" roughness={0.95} metalness={0} />
      </mesh>
      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={160} blur={2} far={30} />
      <OrbitControls
        makeDefault
        minDistance={5}
        maxDistance={2000}
        maxPolarAngle={cameraPreset === 'front' ? Math.PI / 2 : Math.PI / 2 - 0.02}
        target={controlsTarget}
      />
    </>
  );
}

export function BuildingModel3D({
  wallMaterials,
  viewMode = 'exterior',
  cameraPreset = 'orbit',
  className,
}: BuildingModel3DProps) {
  const groundH = BUILDING_PLAN.floors[0].heightFt;
  const upperH = BUILDING_PLAN.floors[1].heightFt;
  const totalHeight = groundH + upperH + BUILDING_PLAN.parapetHeightFt;
  const camDist = Math.max(BUILDING_PLAN.widthFt, BUILDING_PLAN.depthFt) * 1.05;

  // "Front" is a flattened, near-orthographic straight-on shot of the East
  // elevation (narrow FOV + far distance minimizes perspective distortion)
  // — matches how the real elevation drawing is presented.
  const cameraPosition: [number, number, number] =
    viewMode === 'floor1'
      ? [2, groundH * 3.6, camDist * 0.32]
      : viewMode === 'floor2'
      ? [2, groundH + upperH * 3.6, camDist * 0.32]
      : cameraPreset === 'front'
      ? [0, totalHeight / 2, camDist * 4]
      : [camDist * 0.72, totalHeight * 1.15, camDist * 0.95];

  const fov = viewMode === 'exterior' && cameraPreset === 'front' ? 15 : 42;

  return (
    <div className={className}>
      <Canvas
        key={`${viewMode}-${cameraPreset}`}
        shadows
        dpr={[1, 1.5]}
        gl={{ toneMappingExposure: 1.3 }}
        camera={{ position: cameraPosition, fov, near: 0.1, far: Math.max(1500, camDist * 10) }}
      >
        <Suspense fallback={null}>
          <Scene wallMaterials={wallMaterials} viewMode={viewMode} cameraPreset={cameraPreset} />
        </Suspense>
      </Canvas>
    </div>
  );
}
