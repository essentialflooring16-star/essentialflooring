export const SITE = {
  name: 'Essential Flooring',
  legalName: 'Essential Flooring Inc',
  domain: 'https://essentialflooringinc.com',
  phone: '(916) 425-1361',
  phoneHref: 'tel:+19164251361',
  // E.164, for structured data. Keep in sync with phoneHref.
  phoneSchema: '+1-916-425-1361',
  email: 'essentialflooring16@gmail.com',
  license: 'CSLB #1117565',
  founded: 2023,
  founder: 'Alexandru Szep',
  experienceYears: 5, // rendered with a '+' suffix; keep numeric for the count-up
  hours: 'Monday to Saturday, 7 AM to 7 PM',
  hoursSchema: 'Mo-Sa 07:00-19:00',
  address: {
    locality: 'Sacramento',
    region: 'CA',
    country: 'US',
  },
  instagram: 'https://www.instagram.com/essentialflooring16',
  facebook: 'https://www.facebook.com/profile.php?id=61580305899098',
  googleProfile: 'https://share.google/uPqoGQQ9rCQJQw4Gr',
} as const;

export const SERVICES = [
  {
    slug: 'hardwood-floor-refinishing',
    name: 'Hardwood Floor Refinishing',
    short: 'Sanding, stain color matching and durable finishes that bring original wood floors back to life.',
    image: 'hardwood-refinishing-01',
  },
  {
    slug: 'lvp-vinyl-plank-flooring',
    name: 'LVP & Vinyl Plank Flooring',
    short: '100 percent waterproof luxury vinyl plank, the practical choice for busy homes with kids and pets.',
    image: 'lvp-vinyl-01',
  },
  {
    slug: 'stairs-installation-refinishing',
    name: 'Stairs Installation & Refinishing',
    short: 'New treads, risers and full staircase makeovers that match your floors, from oak to wood-look plank.',
    image: 'stairs-01',
  },
  // TODO (ask the client): there are no carpet or laminate photos in the material
  // he sent, so these two cards borrow a plank-floor photo. imageAlt keeps the
  // alt text honest about what the picture actually shows rather than claiming
  // it is carpet or laminate work. Replace both as soon as we get real photos.
  {
    slug: 'laminate-flooring',
    name: 'Laminate Flooring',
    short: 'Realistic wood looks at a friendly price point, with moisture resistant options and fast installation.',
    image: 'lvp-vinyl-04',
    imageAlt: 'Upstairs hallway in a Sacramento home with light oak plank flooring and a new stair railing',
  },
  {
    slug: 'carpet-installation',
    name: 'Carpet Installation',
    short: 'Premium padding, stain resistant options and expert seam placement for bedrooms and living spaces.',
    image: 'lvp-vinyl-02',
    imageAlt: 'Living space in a Sacramento home photographed after an Essential Flooring installation',
  },
] as const;

// Full capability list confirmed by the client (shown on Services page and Home).
export const ALL_SERVICES = [
  'Hardwood installation',
  'Hardwood refinishing',
  'LVP installation',
  'Laminate installation',
  'Tile installation',
  'Linoleum installation',
  'Carpet installation',
  'Stairs installation',
  'Stairs refinishing',
  'Floor repairs',
  'Floor staining',
  'Old floor removal',
  'Carpet removal',
  'Surface leveling & grinding',
  'Baseboard installation & removal',
  'Transition installation',
] as const;

// Core cities get the strongest internal linking; extended areas are select-project regions.
export const CORE_CITIES = [
  { slug: 'sacramento', city: 'Sacramento' },
  { slug: 'roseville', city: 'Roseville' },
  { slug: 'folsom', city: 'Folsom' },
  { slug: 'citrus-heights', city: 'Citrus Heights' },
  { slug: 'rancho-cordova', city: 'Rancho Cordova' },
  { slug: 'carmichael', city: 'Carmichael' },
  { slug: 'antelope', city: 'Antelope' },
  { slug: 'orangevale', city: 'Orangevale' },
  { slug: 'fair-oaks', city: 'Fair Oaks' },
  { slug: 'granite-bay', city: 'Granite Bay' },
  { slug: 'lincoln', city: 'Lincoln' },
  { slug: 'loomis', city: 'Loomis' },
  { slug: 'north-highlands', city: 'North Highlands' },
  { slug: 'rio-linda', city: 'Rio Linda' },
  { slug: 'arden-arcade', city: 'Arden-Arcade' },
  { slug: 'yuba-city', city: 'Yuba City' },
] as const;

// `region: true` marks an area that is not a single city, so structured data
// does not emit a malformed place name like "Orange County CA".
export const EXTENDED_CITIES = [
  { slug: 'san-francisco', city: 'San Francisco' },
  { slug: 'san-francisco-bay-area', city: 'San Francisco Bay Area', region: true },
  { slug: 'orange-county', city: 'Orange County', region: true },
  { slug: 'south-lake-tahoe', city: 'South Lake Tahoe' },
] as const;

export const ALL_CITIES = [...CORE_CITIES, ...EXTENDED_CITIES];

// Schema.org areaServed names, derived so the list cannot drift from the
// city pages the site actually publishes.
export const AREA_SERVED = ALL_CITIES.map((c) =>
  'region' in c && c.region ? c.city : `${c.city}, CA`,
);
