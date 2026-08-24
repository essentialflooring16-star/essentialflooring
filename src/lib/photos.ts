import type { ImageMetadata } from 'astro';
import photosData from '../data/photos.json';

export type Photo = {
  id: string;
  file: string;
  category: 'hardwood-refinishing' | 'lvp-vinyl' | 'stairs' | 'laminate' | 'carpet' | string;
  caption: string;
  alt: string;
  quality: number;
  hero: boolean;
  state: 'before' | 'during' | 'after' | 'unclear' | string;
};

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/portfolio/*.jpg',
  { eager: true },
);

const byFile = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  const file = path.split('/').pop()!;
  byFile.set(file, mod.default);
}

export const photos: Photo[] = photosData as Photo[];

export function photoImage(idOrFile: string): ImageMetadata {
  const file = idOrFile.endsWith('.jpg') ? idOrFile : `${idOrFile}.jpg`;
  const img = byFile.get(file);
  if (!img) throw new Error(`Portfolio photo not found: ${file}`);
  return img;
}

export function photoById(id: string): Photo {
  const p = photos.find((p) => p.id === id);
  if (!p) throw new Error(`Photo meta not found: ${id}`);
  return p;
}

export const galleryPhotos = photos
  .filter((p) => p.quality >= 4 || p.state === 'before')
  .sort((a, b) => b.quality - a.quality);

// Gallery builds its filter chips by intersecting the categories actually
// present with this record, so a key with no photos is harmless, but a photo
// whose category is missing here can never be filtered to. The admin upload
// form offers 'other', so it has to be listed.
export const CATEGORY_LABELS: Record<string, string> = {
  'hardwood-refinishing': 'Hardwood Refinishing',
  'lvp-vinyl': 'LVP & Vinyl Plank',
  stairs: 'Stairs',
  laminate: 'Laminate',
  carpet: 'Carpet',
  other: 'Other',
};
