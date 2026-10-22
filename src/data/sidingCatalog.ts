// James Hardie® exterior siding catalog data
// Source: https://www.jameshardie.com/product-catalog/exterior-siding-products/hardie-panel-siding/
//
// NOTE: Product names, texture lines and color names below are factual catalog
// data (names only). Swatch hex values are APPROXIMATIONS for on-screen preview
// purposes only — actual board color/finish can vary by lighting, monitor and
// batch. Always confirm the true color/finish using the official link provided
// with each swatch (opens the real James Hardie page with that color selected)
// or by ordering a physical sample before specifying/ordering material.

export interface TextureStyle {
  id: string;
  slug: string; // used in James Hardie URL path segment
  name: string;
  description: string;
}

export interface SidingColor {
  id: string;
  slug: string; // used in James Hardie URL ?color= query param
  name: string;
  hex: string; // approximate preview swatch only
  badge?: string;
}

export const BRAND = {
  name: 'James Hardie®',
  productLine: 'Hardie® Panel Siding',
  catalogUrl: 'https://www.jameshardie.com/product-catalog/exterior-siding-products/hardie-panel-siding/',
  requestCatalogUrl: 'https://www.jameshardie.com/request-james-hardie-catalog/',
  designerUrl: 'https://www.jameshardie.com/hardie-designer/',
  contractorUrl: 'https://www.jameshardie.com/find-a-contractor/',
};

export const TEXTURE_STYLES: TextureStyle[] = [
  {
    id: 'select-cedarmill',
    slug: 'select-cedarmill',
    name: 'Select Cedarmill®',
    description: 'Subtle cedar wood-grain texture — the most popular Hardie® Panel finish.',
  },
  {
    id: 'smooth',
    slug: 'smooth',
    name: 'Smooth',
    description: 'Clean, flat, contemporary finish with no visible grain.',
  },
  {
    id: 'stucco',
    slug: 'stucco',
    name: 'Stucco',
    description: 'Traditional stucco-look texture for Mediterranean / Spanish styles.',
  },
  {
    id: 'sierra8',
    slug: 'sierra-8',
    name: 'Sierra 8',
    description: 'Bold 8" on-center reveal lines for a modern board-and-batten shadow.',
  },
];

// Hardie® Panel — Statement Collection® colors (ColorPlus® Technology, factory finished)
export const STATEMENT_COLLECTION: SidingColor[] = [
  { id: 'arctic-white', slug: 'arctic-white', name: 'Arctic White', hex: '#F4F2EC' },
  { id: 'cobble-stone', slug: 'cobble-stone', name: 'Cobble Stone', hex: '#CBC3B3' },
  { id: 'navajo-beige', slug: 'navajo-beige', name: 'Navajo Beige', hex: '#D9C8A4' },
  { id: 'khaki-brown', slug: 'khaki-brown', name: 'Khaki Brown', hex: '#8A7256' },
  { id: 'monterey-taupe', slug: 'monterey-taupe', name: 'Monterey Taupe', hex: '#A3927E' },
  { id: 'timber-bark', slug: 'timber-bark', name: 'Timber Bark', hex: '#5B4A3C' },
  { id: 'rich-espresso', slug: 'rich-espresso', name: 'Rich Espresso', hex: '#3A2B20' },
  { id: 'mountain-sage', slug: 'mountain-sage', name: 'Mountain Sage', hex: '#8A9A7C' },
  { id: 'light-mist', slug: 'light-mist', name: 'Light Mist', hex: '#C9CFC8' },
  { id: 'pearl-gray', slug: 'pearl-gray', name: 'Pearl Gray', hex: '#9BA3A6' },
  { id: 'gray-slate', slug: 'gray-slate', name: 'Gray Slate', hex: '#6E7679' },
  { id: 'boothbay-blue', slug: 'boothbay-blue', name: 'Boothbay Blue', hex: '#4A6672' },
  { id: 'evening-blue', slug: 'evening-blue', name: 'Evening Blue', hex: '#303E4C' },
  { id: 'deep-ocean', slug: 'deep-ocean', name: 'Deep Ocean', hex: '#1E2D3B' },
  { id: 'aged-pewter', slug: 'aged-pewter', name: 'Aged Pewter', hex: '#6B6458' },
  { id: 'night-gray', slug: 'night-gray', name: 'Night Gray', hex: '#3A3F42' },
  { id: 'iron-gray', slug: 'iron-gray', name: 'Iron Gray', hex: '#53565A', badge: '2026 Color of the Year' },
  { id: 'countrylane-red', slug: 'countrylane-red', name: 'Countrylane Red', hex: '#762E2A' },
  { id: 'midnight-black', slug: 'midnight-black', name: 'Midnight Black', hex: '#1A1A1A' },
];

export function buildJamesHardieLink(textureSlug: string, colorSlug: string): string {
  return `https://www.jameshardie.com/product-catalog/exterior-siding-products/hardie-panel-siding/${textureSlug}/statement-collection-colors/?color=${colorSlug}`;
}

export interface WallFaceMaterial {
  textureId: string;
  colorId: string;
}

export const DEFAULT_WALL_MATERIAL: WallFaceMaterial = {
  textureId: 'select-cedarmill',
  colorId: 'arctic-white',
};

export function getTextureStyle(id: string): TextureStyle {
  return TEXTURE_STYLES.find((t) => t.id === id) ?? TEXTURE_STYLES[0];
}

export function getSidingColor(id: string): SidingColor {
  return STATEMENT_COLLECTION.find((c) => c.id === id) ?? STATEMENT_COLLECTION[0];
}
