import { Html } from '@react-three/drei';
import { ROOM_TYPE_COLOR, type RoomRect } from '../data/floorPlan';

const WALL_COLOR = '#f2f1ec';

function RoomWalls({ rect, floorY, height }: { rect: RoomRect; floorY: number; height: number }) {
  const t = 0.15;
  const w = rect.x1 - rect.x0;
  const d = rect.z1 - rect.z0;
  const cx = (rect.x0 + rect.x1) / 2;
  const cz = (rect.z0 + rect.z1) / 2;
  const y = floorY + height / 2;
  const material = <meshStandardMaterial color={WALL_COLOR} metalness={0} roughness={0.9} />;

  return (
    <group>
      <mesh position={[cx, y, rect.z1 - t / 2]}>
        <boxGeometry args={[w, height, t]} />
        {material}
      </mesh>
      <mesh position={[cx, y, rect.z0 + t / 2]}>
        <boxGeometry args={[w, height, t]} />
        {material}
      </mesh>
      <mesh position={[rect.x0 + t / 2, y, cz]}>
        <boxGeometry args={[t, height, d]} />
        {material}
      </mesh>
      <mesh position={[rect.x1 - t / 2, y, cz]}>
        <boxGeometry args={[t, height, d]} />
        {material}
      </mesh>
    </group>
  );
}

function Stairs({ rect, floorY, riseHeight }: { rect: RoomRect; floorY: number; riseHeight: number }) {
  const runDepth = rect.z1 - rect.z0;
  const runWidth = rect.x1 - rect.x0;
  const riser = 7.5 / 12; // standard 7.5" riser, in feet
  const steps = Math.max(8, Math.round(riseHeight / riser));
  const treadDepth = runDepth / steps;
  const treadHeight = riseHeight / steps;

  return (
    <group>
      {Array.from({ length: steps }).map((_, i) => {
        const z = rect.z1 - treadDepth * (i + 0.5);
        const y = floorY + treadHeight * (i + 0.5);
        return (
          <mesh key={i} position={[(rect.x0 + rect.x1) / 2, y, z]} castShadow receiveShadow>
            <boxGeometry args={[runWidth * 0.85, treadHeight, treadDepth * 0.95]} />
            <meshStandardMaterial color="#8a8f93" metalness={0} roughness={0.8} />
          </mesh>
        );
      })}
      {/* Simplified handrails along both sides */}
      {[rect.x0 + runWidth * 0.1, rect.x1 - runWidth * 0.1].map((x, i) => (
        <mesh key={i} position={[x, floorY + riseHeight / 2 + 1.6, (rect.z0 + rect.z1) / 2]}>
          <boxGeometry args={[0.08, riseHeight + 2.8, runDepth]} />
          <meshStandardMaterial color="#d8dadc" metalness={0.2} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export interface InteriorFloorPlan3DProps {
  rooms: RoomRect[];
  floorY: number;
  wallHeight?: number;
  stairRiseHeight?: number;
}

export function InteriorFloorPlan3D({ rooms, floorY, wallHeight = 9, stairRiseHeight }: InteriorFloorPlan3DProps) {
  return (
    <group>
      {rooms.map((r) => {
        const w = r.x1 - r.x0;
        const d = r.z1 - r.z0;
        const cx = (r.x0 + r.x1) / 2;
        const cz = (r.z0 + r.z1) / 2;
        const isStair = r.type === 'stair' && !!stairRiseHeight;
        return (
          <group key={r.id}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, floorY + 0.02, cz]} receiveShadow>
              <planeGeometry args={[w, d]} />
              <meshStandardMaterial color={ROOM_TYPE_COLOR[r.type]} metalness={0} roughness={0.95} />
            </mesh>
            <RoomWalls rect={r} floorY={floorY} height={wallHeight} />
            {isStair && <Stairs rect={r} floorY={floorY} riseHeight={stairRiseHeight!} />}
            <Html position={[cx, floorY + 0.3, cz]} center distanceFactor={22} transform occlude={false}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid rgba(15,23,42,0.12)',
                  borderRadius: 6,
                  padding: '3px 7px',
                  fontSize: 11,
                  fontFamily: 'Inter, sans-serif',
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ color: '#64748b', fontSize: 10 }}>{Math.round(r.area)} sf</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
