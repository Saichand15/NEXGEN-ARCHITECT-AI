import * as THREE from 'three';
import type { TextureStyle, SidingColor } from '../data/sidingCatalog';

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b];
}

function rgbToHex([r, g, b]: [number, number, number]) {
  const c = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function shade(hex: string, amount: number) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r + amount, g + amount, b + amount]);
}

// Simple seeded pseudo-random so textures are stable per color/texture pair.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/**
 * Procedurally renders a tileable swatch for the given James Hardie texture
 * style + color onto a canvas, then wraps it as a repeating THREE.CanvasTexture.
 * This avoids using any copyrighted product photography while still giving a
 * realistic sense of grain / reveal-line / stucco finish per style.
 */
export function createSidingCanvasTexture(
  texture: TextureStyle,
  color: SidingColor,
  opts: { repeatX?: number; repeatY?: number } = {}
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = mulberry32(seedFromString(texture.id + color.id));

  ctx.fillStyle = color.hex;
  ctx.fillRect(0, 0, size, size);

  if (texture.id === 'select-cedarmill') {
    // Subtle horizontal cedar wood-grain striations
    for (let i = 0; i < 140; i++) {
      const y = rand() * size;
      const len = size;
      const wobble = (rand() - 0.5) * 6;
      ctx.strokeStyle = shade(color.hex, rand() > 0.5 ? -14 - rand() * 10 : 10 + rand() * 8);
      ctx.globalAlpha = 0.18 + rand() * 0.12;
      ctx.lineWidth = 0.6 + rand() * 1.2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(len * 0.33, y + wobble, len * 0.66, y - wobble, len, y + wobble / 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (texture.id === 'smooth') {
    // Faint vertical panel seams every ~64px, otherwise flat
    ctx.strokeStyle = shade(color.hex, -16);
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    for (let x = 0; x <= size; x += size / 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (texture.id === 'stucco') {
    // Speckled noise for a stucco texture
    const dots = 2200;
    for (let i = 0; i < dots; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = rand() * 1.4 + 0.3;
      ctx.fillStyle = shade(color.hex, rand() > 0.5 ? -20 - rand() * 20 : 16 + rand() * 18);
      ctx.globalAlpha = 0.12 + rand() * 0.18;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (texture.id === 'sierra8') {
    // Bold horizontal reveal/shadow lines every 32px (8" on-center reveal)
    const step = size / 8;
    for (let y = 0; y <= size; y += step) {
      ctx.fillStyle = shade(color.hex, -30);
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, y - 1.5, size, 3);
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = shade(color.hex, 20);
      ctx.fillRect(0, y + 1.5, size, 2);
    }
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(opts.repeatX ?? 6, opts.repeatY ?? 2);
  tex.anisotropy = 4;
  if ('colorSpace' in tex) {
    (tex as any).colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

// Cache thumbnails so we don't re-render the same swatch repeatedly.
const thumbCache = new Map<string, string>();

/**
 * Renders a small square preview swatch (data URL) for a texture+color combo,
 * used for the catalog thumbnail cards in the designer panel.
 */
export function createSidingThumbnailDataUrl(
  texture: TextureStyle,
  color: SidingColor,
  size = 96
): string {
  const key = `${texture.id}:${color.id}:${size}`;
  const cached = thumbCache.get(key);
  if (cached) return cached;

  // Reuse the main generator by drawing into a small canvas via a temp texture.
  const tex = createSidingCanvasTexture(texture, color, { repeatX: 1, repeatY: 1 });
  const src = tex.image as HTMLCanvasElement;
  const out = document.createElement('canvas');
  out.width = size;
  out.height = size;
  const ctx = out.getContext('2d')!;
  ctx.drawImage(src, 0, 0, size, size);
  tex.dispose();
  const url = out.toDataURL('image/png');
  thumbCache.set(key, url);
  return url;
}
