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

/**
 * Validates if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for valid URL format
  try {
    new URL(url.startsWith('/') ? `https://example.com${url}` : url);
  } catch {
    return false;
  }
  
  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  return imageExtensions.test(url.split('?')[0]);
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
 * Gets a random placeholder image for a specific property type
 */
export function getPropertyPlaceholder(propertyType?: string): string {
  const type = propertyType || 'default';
  const placeholders = PROPERTY_PLACEHOLDERS[type] || PROPERTY_PLACEHOLDERS.default;
  const randomIndex = Math.floor(Math.random() * placeholders.length);
  return placeholders[randomIndex];
}

/**
 * Gets a random placeholder image for add-on services
 */
export function getAddonPlaceholder(): string {
  const randomIndex = Math.floor(Math.random() * ADDON_PLACEHOLDERS.length);
  return ADDON_PLACEHOLDERS[randomIndex];
}