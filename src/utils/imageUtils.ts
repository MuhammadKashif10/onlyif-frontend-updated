interface ImagePlaceholders {
  [key: string]: string[];
}

const PROPERTY_PLACEHOLDERS: ImagePlaceholders = {
  'Single Family': [
    '/images/01.jpg',
    '/images/02.jpg',
    '/images/03.jpg'
  ],
  'Condo': [
    '/images/04.jpg',
    '/images/05.jpg',
    '/images/06.jpg'
  ],
  'Townhouse': [
    '/images/01.jpg',
    '/images/03.jpg',
    '/images/05.jpg'
  ],
  'Apartment': [
    '/images/02.jpg',
    '/images/04.jpg',
    '/images/06.jpg'
  ],
  'default': [
    '/images/01.jpg',
    '/images/02.jpg',
    '/images/03.jpg'
  ]
};

const ADDON_PLACEHOLDERS = [
  '/images/04.jpg',
  '/images/05.jpg',
  '/images/06.jpg'
];

// Known image CDNs whose delivery URLs are valid even without a file extension
// (e.g. Cloudinary transformation URLs).
const IMAGE_HOST_ALLOWLIST = [
  'res.cloudinary.com',
  'images.unsplash.com',
  'plus.unsplash.com',
  'images.pexels.com',
];

/**
 * Validates if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Check for valid URL format
  let parsed: URL;
  try {
    parsed = new URL(url.startsWith('/') ? `https://example.com${url}` : url);
  } catch {
    return false;
  }

  // Accept trusted image CDNs even when the URL is transformed or has no
  // simple file extension (Cloudinary delivery URLs often look like
  // https://res.cloudinary.com/<cloud>/image/upload/<transforms>/<id>).
  if (IMAGE_HOST_ALLOWLIST.includes(parsed.hostname)) return true;
  if (parsed.pathname.includes('/image/upload/')) return true;

  // Otherwise require a recognizable image extension on the path.
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i;
  return imageExtensions.test(parsed.pathname);
}

/**
 * Constructs full backend URL for image paths
 */
function constructBackendImageUrl(imagePath: string): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
  
  // Handle different path formats
  if (imagePath.startsWith('/uploads')) {
    return `${backendUrl}${imagePath}`;
  }
  
  if (imagePath.includes('uploads') && !imagePath.startsWith('http')) {
    // Handle relative paths like "uploads/images/..."
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${backendUrl}${cleanPath}`;
  }
  
  return imagePath;
}

// getSafeImageUrl
export function getSafeImageUrl(imagePath: string | null | undefined, type: 'property' | 'agent' | 'user' = 'property'): string {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    return type === 'property' ? getPropertyPlaceholder() : '/images/01.jpg';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return isValidImageUrl(imagePath) ? imagePath : (type === 'property' ? getPropertyPlaceholder() : '/images/01.jpg');
  }

  if (imagePath.startsWith('/images/') || imagePath.startsWith('/assets/')) {
    return imagePath;
  }

  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('uploads/')) {
    return constructBackendImageUrl(imagePath);
  }

  return type === 'property' ? getPropertyPlaceholder() : '/images/01.jpg';
}

/**
 * Returns an array of safe image URLs without fallbacks
 */
export function getSafeImageArray(
  images: string[], 
  propertyType?: string, 
  minCount: number = 1
): string[] {
  const validImages = images.filter(img => img && isValidImageUrl(img));
  
  // Return only valid images, no placeholders
  return validImages;
}

/**
 * Deterministic index from a string seed (no Math.random) so the same input
 * always yields the same result on the server and client — avoids hydration
 * mismatches / placeholder flicker.
 */
function stableIndex(seed: string, length: number): number {
  if (length <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

/**
 * Gets a stable placeholder image for a specific property type.
 * Selection is deterministic (seeded), never random.
 */
export function getPropertyPlaceholder(propertyType?: string, seed?: string): string {
  const type = propertyType || 'default';
  const placeholders = PROPERTY_PLACEHOLDERS[type] || PROPERTY_PLACEHOLDERS.default;
  const key = seed || propertyType || 'default';
  return placeholders[stableIndex(key, placeholders.length)];
}

/**
 * Gets a random placeholder image for add-on services
 */
export function getAddonPlaceholder(): string {
  const randomIndex = Math.floor(Math.random() * ADDON_PLACEHOLDERS.length);
  return ADDON_PLACEHOLDERS[randomIndex];
}