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

// The service area is split by how far out it sits, not by how much we want
// the work. CORE is the inner Sacramento metro, where most jobs are and where
// the internal linking is strongest. EXTENDED is the ring in Placer, El
// Dorado, Yolo and Sutter counties, still fully served, plus one region page
// for the San Francisco Bay Area that is worked by arrangement, project by
// project.
//
// History: until 31 Aug the list ended with San Francisco, the SF Bay Area,
// Orange County and South Lake Tahoe. All four were removed as too far away
// for a location page a searcher would believe, and eight towns inside an
// hour's drive took their place. On 2 Sep the client asked for the Bay Area
// back, so it returns as a single region page whose copy also names San
// Francisco. Orange County (about 400 miles) and South Lake Tahoe stay gone.
export const CORE_CITIES = [
  { slug: 'sacramento', city: 'Sacramento' },
  { slug: 'arden-arcade', city: 'Arden-Arcade' },
  { slug: 'carmichael', city: 'Carmichael' },
  { slug: 'citrus-heights', city: 'Citrus Heights' },
  { slug: 'rancho-cordova', city: 'Rancho Cordova' },
  { slug: 'north-highlands', city: 'North Highlands' },
  { slug: 'rio-linda', city: 'Rio Linda' },
  { slug: 'antelope', city: 'Antelope' },
  { slug: 'orangevale', city: 'Orangevale' },
  { slug: 'fair-oaks', city: 'Fair Oaks' },
  { slug: 'elk-grove', city: 'Elk Grove' },
  { slug: 'west-sacramento', city: 'West Sacramento' },
  { slug: 'folsom', city: 'Folsom' },
  { slug: 'roseville', city: 'Roseville' },
] as const;

// `region: true` marks an area that is not a single city, so structured data
// emits the bare name instead of a malformed "San Francisco Bay Area, CA".
// The Bay Area entry is the one user of the flag today; the city page, the
// service-areas index and AREA_SERVED below all honour it. It sits last so
// the outer-ring index reads towns first, then the by-arrangement region.
export const EXTENDED_CITIES = [
  { slug: 'rocklin', city: 'Rocklin' },
  { slug: 'granite-bay', city: 'Granite Bay' },
  { slug: 'lincoln', city: 'Lincoln' },
  { slug: 'loomis', city: 'Loomis' },
  { slug: 'el-dorado-hills', city: 'El Dorado Hills' },
  { slug: 'auburn', city: 'Auburn' },
  { slug: 'davis', city: 'Davis' },
  { slug: 'woodland', city: 'Woodland' },
  { slug: 'galt', city: 'Galt' },
  { slug: 'yuba-city', city: 'Yuba City' },
  { slug: 'san-francisco-bay-area', city: 'San Francisco Bay Area', region: true },
] as const;

export const ALL_CITIES = [...CORE_CITIES, ...EXTENDED_CITIES];

// Schema.org areaServed names, derived so the list cannot drift from the
// city pages the site actually publishes.
export const AREA_SERVED = ALL_CITIES.map((c) =>
  'region' in c && c.region ? c.city : `${c.city}, CA`,
);
